#!/usr/bin/env node
// Lost Sky website checks.
//
// Usage (from the repo root):
//   npm install --no-save playwright      # once; or use a global install
//   npx playwright install chromium       # once, if no browser is installed
//   node tests/website/check-site.js [--out <dir>]
//
// Starts its own static server for website/, runs every check in Chromium,
// prints PASS/FAIL lines, writes REPORT.md and section screenshots to the
// output folder (default: tests/website/out), and exits 1 if anything fails.

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '../../website');
const outArg = process.argv.indexOf('--out');
const OUT = path.resolve(outArg > 0 ? process.argv[outArg + 1] : path.join(__dirname, 'out'));
fs.mkdirSync(OUT, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const rel = decodeURIComponent(req.url.split('?')[0]).replace(/\/$/, '/index.html');
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

const results = [];
let group = '';
function check(name, ok, detail) { results.push({ group, name, ok: !!ok, detail: ok ? '' : String(detail || '') }); }

// ---- In-page helpers (run inside the browser) ----
const LEGIBILITY = () => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: v[0], g: v[1], b: v[2], a: v[3] === undefined ? 1 : v[3] }; };
  const lum = c => { const f = x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const blend = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  // Possible backgrounds behind an element: its own solid colour, or every
  // colour of a gradient on an ancestor (we test against the worst one).
  const backgrounds = el => {
    for (let e = el; e; e = e.parentElement) {
      const s = getComputedStyle(e);
      if (s.backgroundImage && s.backgroundImage.includes('gradient')) {
        const cols = (s.backgroundImage.match(/rgba?\([^)]+\)/g) || []).map(parse);
        if (cols.length) return cols;
      }
      const c = parse(s.backgroundColor);
      if (c && c.a > 0.5) return [c];
    }
    return [{ r: 255, g: 255, b: 255, a: 1 }];
  };
  const low = [], tiny = [], clipped = [];
  const els = [...document.querySelectorAll('body *')].filter(e => !e.closest('svg, .sr-only, [hidden]') && e.tagName !== 'SCRIPT' && e.tagName !== 'STYLE');
  for (const el of els) {
    const ownText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    const r = el.getBoundingClientRect();
    if (!ownText || r.width === 0 || r.height === 0) continue;
    if (r.width <= 1 && r.height <= 1) continue; // visually hidden on purpose
    const s = getComputedStyle(el);
    if (s.visibility === 'hidden' || +s.opacity === 0) continue;
    const size = parseFloat(s.fontSize), bold = +s.fontWeight >= 700;
    const label = el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '') + ' "' + el.textContent.trim().slice(0, 18) + '"';
    if (size < 12) tiny.push(label + ' ' + size + 'px');
    const fg = parse(s.color);
    const worst = Math.min(...backgrounds(el).map(bg => ratio(blend(fg, bg), bg)));
    const need = size >= 24 || (bold && size >= 18.66) ? 3 : 4.5;
    if (worst < need) low.push(label + ' ' + worst.toFixed(2) + ':1');
    if (/(hidden|clip)/.test(s.overflow + s.overflowX + s.overflowY) && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) clipped.push(label);
  }
  // Text broken apart: a grid/flex box that mixes loose text with inline
  // elements (code, links, bold) puts each piece on its own row or column.
  const split = [];
  for (const el of els) {
    const d = getComputedStyle(el).display;
    if (d !== 'grid' && d !== 'flex') continue;
    const loose = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
    const inline = [...el.children].some(k => /^(CODE|A|B|STRONG|EM|KBD)$/.test(k.tagName));
    if (loose && inline && el.getBoundingClientRect().height > 0) split.push(el.tagName.toLowerCase() + ' "' + el.textContent.trim().slice(0, 24) + '"');
  }
  return { low, tiny, clipped, split, count: els.length };
};

const NAV_STATE = () => {
  const vw = document.documentElement.clientWidth;
  const links = [...document.querySelectorAll('.nav-links a')].filter(a => a.offsetParent);
  const header = document.querySelector('.site-header').getBoundingClientRect();
  return {
    vw,
    toggle: !!document.querySelector('.nav-toggle').offsetParent,
    links: links.length,
    pastEdge: links.filter(a => a.getBoundingClientRect().right > vw || a.getBoundingClientRect().left < 0).map(a => a.textContent),
    squeezed: links.filter(a => a.scrollWidth > a.clientWidth + 1).map(a => a.textContent),
    overlapBrand: links.some(a => { const r = a.getBoundingClientRect(), b = document.querySelector('.brand').getBoundingClientRect(); return r.left < b.right && r.top < b.bottom && r.bottom > b.top; }),
    headerH: Math.round(header.height),
  };
};

(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const URL = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch();
  const visibleCmds = p => p.$$eval('.cmd', ls => ls.filter(l => !l.hidden).map(l => l.dataset.group));

  // 1. Layout and legibility in 4 combinations
  for (const [w, h, scheme] of [[1280, 900, 'light'], [1280, 900, 'dark'], [390, 844, 'light'], [390, 844, 'dark']]) {
    group = `Layout ${w}px ${scheme}`;
    const tag = `${w}-${scheme}`;
    const c = await browser.newContext({ viewport: { width: w, height: h }, colorScheme: scheme, isMobile: w < 500, hasTouch: w < 500 });
    const p = await c.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto(URL, { waitUntil: 'load' });
    await p.evaluate(() => Promise.all([...document.images].map(i => { i.loading = 'eager'; return i.complete && i.naturalWidth ? 0 : new Promise(r => { i.onload = i.onerror = r; }); })));
    check('no JavaScript errors', errs.length === 0, errs.join(' | '));
    const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check('no horizontal scroll', ov <= 0, 'overflow=' + ov);
    const wide = await p.$$eval('body *', els => els.filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.right > document.documentElement.clientWidth + 1 && !e.closest('.table-wrap, .sr-only, svg'); }).map(e => e.tagName + '.' + e.className).slice(0, 5));
    check('nothing sticks out past the screen edge', wide.length === 0, wide.join(', '));
    const nav = await p.evaluate(NAV_STATE);
    if (w >= 1200) check('desktop: all 9 menu links on one row, inside the screen', !nav.toggle && nav.links === 9 && nav.pastEdge.length === 0 && nav.squeezed.length === 0 && nav.headerH <= 70, JSON.stringify(nav));
    else check('mobile: menu button shown, header one row', nav.toggle && nav.links === 0 && nav.headerH <= 80, JSON.stringify(nav));
    const imgs = await p.$$eval('img', is => is.map(i => [i.getAttribute('src'), i.naturalWidth, (i.alt || '').length]));
    check(`all ${imgs.length} images load`, imgs.length === 7 && imgs.every(i => i[1] > 0), JSON.stringify(imgs.filter(i => !i[1])));
    check('every image has Thai alt text', imgs.every(i => i[2] > 20));
    const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check('page has a solid background', bg !== 'rgba(0, 0, 0, 0)', bg);
    const leg = await p.evaluate(LEGIBILITY);
    check(`text contrast meets WCAG AA (${leg.count} elements)`, leg.low.length === 0, leg.low.slice(0, 8).join(' | '));
    check('no text smaller than 12px', leg.tiny.length === 0, leg.tiny.slice(0, 8).join(' | '));
    check('no clipped text in overflow-hidden boxes', leg.clipped.length === 0, leg.clipped.slice(0, 8).join(' | '));
    check('no sentences broken apart by grid/flex layout', leg.split.length === 0, leg.split.slice(0, 8).join(' | '));
    // Screenshots with the sticky header unpinned, so it doesn't cover
    // section headings (some screenshot tools paint it mid-page).
    await p.screenshot({ path: path.join(OUT, `${tag}-0-top.png`) });
    await p.addStyleTag({ content: '.site-header { position: static !important; }' });
    for (const id of ['status', 'how', 'hub', 'team', 'relics', 'gallery', 'start', 'rules', 'commands', 'topup', 'faq']) {
      await (await p.$('#' + id)).screenshot({ path: path.join(OUT, `${tag}-${id}.png`) });
    }
    await c.close();
  }

  // 2. Header at many widths, and with wider text
  group = 'Header across widths';
  const hp = await browser.newPage();
  const bad = [];
  for (const w of [320, 360, 390, 430, 600, 768, 860, 900, 1024, 1100, 1151, 1152, 1200, 1280, 1366, 1440, 1600]) {
    await hp.setViewportSize({ width: w, height: 700 });
    await hp.goto(URL);
    const n = await hp.evaluate(NAV_STATE);
    const ok = n.pastEdge.length === 0 && n.squeezed.length === 0 && !n.overlapBrand && (n.toggle || n.links === 9) &&
      (await hp.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth));
    if (!ok) bad.push(w + ':' + JSON.stringify(n));
  }
  check('header fits at 17 widths from 320 to 1600px (menu button or full menu, never clipped)', bad.length === 0, bad.join(' | '));
  await hp.setViewportSize({ width: 1280, height: 700 });
  await hp.goto(URL);
  await hp.addStyleTag({ content: '.nav-links a { font-size: 1.35rem !important; letter-spacing: .04em; }' });
  const wideText = await hp.evaluate(NAV_STATE);
  check('with 40% wider menu text at 1280px, links wrap instead of clipping', wideText.pastEdge.length === 0 && wideText.squeezed.length === 0 && !wideText.overlapBrand, JSON.stringify(wideText));
  await hp.close();

  // 3. Sticky header never covers a section you jump to
  for (const [w, mobile] of [[1280, false], [390, true]]) {
    group = `Menu jumps ${w}px`;
    const c = await browser.newContext({ viewport: { width: w, height: 800 }, isMobile: mobile, hasTouch: mobile });
    const p = await c.newPage();
    await p.goto(URL);
    const ids = await p.$$eval('.nav-links a', as => as.map(a => a.getAttribute('href')));
    const covered = [];
    for (const id of ids) {
      if (mobile) { await p.tap('.nav-toggle'); await p.tap(`.nav-links a[href="${id}"]`); }
      else await p.click(`.nav-links a[href="${id}"]`);
      await p.waitForTimeout(700);
      const t = await p.evaluate(sel => { const h = document.querySelector('.site-header').getBoundingClientRect().bottom; const el = document.querySelector(sel); const head = el.querySelector('h1, h2') || el; return [Math.round(head.getBoundingClientRect().top), Math.round(h)]; }, id);
      if (t[0] < t[1]) covered.push(`${id} heading at ${t[0]}px under header ending ${t[1]}px`);
    }
    check(`all ${ids.length} menu links land with the heading visible below the header`, covered.length === 0, covered.join(' | '));
    if (mobile) {
      await p.tap('.nav-toggle');
      check('menu opens with aria-expanded=true', (await p.getAttribute('.nav-toggle', 'aria-expanded')) === 'true' && await p.isVisible('.nav-links a[href="#topup"]'));
      await p.keyboard.press('Escape');
      check('Escape closes the menu', !(await p.isVisible('.nav-links a[href="#faq"]')));
      const small = await p.$$eval('a, button, summary', els => els.filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.height < 24 && !e.closest('p, dd, li > span, figcaption, .table-wrap'); }).map(e => e.textContent.trim().slice(0, 15)));
      check('no tap targets smaller than 24px', small.length === 0, small.join(' | '));
    }
    await c.close();
  }

  // 4. Content rules
  group = 'Content';
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: URL.replace(/\/$/, '') });
  const page = await ctx.newPage();
  await page.goto(URL);
  const html = await page.content();
  const text = await page.textContent('body');
  check('no IP address anywhere in the page', !/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.test(html));
  check('no Discord link', !/discord\.(gg|com)/i.test(html));
  check('no shared server-wide city wording', !/ร่วมกับผู้เล่นทั้งเซิร์ฟ|ทั้งเซิร์ฟพร้อมกัน|ผู้เล่นทั้งเซิร์ฟบริจาค/.test(text));
  check('no player counts, online status, reviews or "open" claims', !/ผู้เล่นออนไลน์|\d+\s*คนออนไลน์|รีวิว|เปิดให้เล่นแล้ว/.test(text));
  check('no form or input fields', (await page.$$('form, input, select, textarea')).length === 0);
  const topup = await page.textContent('#topup');
  check('top-up says not open, no prices or payment details', /ยังไม่เปิด/.test(topup) && !/\$\d|฿|บาท|พร้อมเพย์|PromptPay|ธนาคาร/i.test(topup));
  check('top-up has no technical wording', !/แบบฟอร์ม|form|backend|HTML/i.test(topup));
  check('footer date is 3 October 2026', /อัปเดตหน้านี้ล่าสุด 3 ตุลาคม 2026/.test(await page.textContent('footer')));
  check('hub shown as installed, not "not pasted"', /ติดตั้งแล้ว/.test(await page.textContent('#status')) && !/ยังไม่ได้วาง|ยังไม่ติดตั้ง|รอติดตั้ง/.test(text));
  // Status badges must match docs/PLAYTEST_20261003.md exactly.
  const badges = await page.$$eval('.cmd', ls => Object.fromEntries(ls.map(l => [l.querySelector('code').textContent, l.querySelector('.badge').textContent])));
  const byBadge = t => Object.keys(badges).filter(k => badges[k] === t).join(',');
  check('commands marked tested = /spawn, /hub, /menu, /is, /city go', byBadge('ทดสอบแล้ว') === '/spawn,/hub,/menu,/is,/city go', JSON.stringify(badges));
  check('commands marked partly tested = /shop, /skyshop, /skyquests, /cityprojects donate', byBadge('ทดสอบบางส่วน') === '/shop,/skyshop,/skyquests,/cityprojects donate', JSON.stringify(badges));
  check('new /sell box, garden open/go, /topup, /city, donate, slot, team and money commands still awaiting test', ['/sell', '/cityprojects', '/cityprojects go', '/topup', '/city', '/city donate', '/city go <ช่อง>', '/is team invite <ชื่อผู้เล่น>', '/bal'].every(k => badges[k] === 'รอทดสอบ'), JSON.stringify(badges));
  const quests = await page.$$eval('#zone-quests .quest-list li', ls => ls.map(l => l.querySelector('.badge').textContent));
  check('quests: builder tested, farmer (wheat) awaiting test', quests.join(',') === 'รอทดสอบ,ทดสอบแล้ว', quests.join(','));
  const tested = await page.$$eval('.status-card', cs => cs[1].textContent);
  check('tested card: only verified results (shop opens, old box paid, garden donation taken, selector, builder quest)', /\/shop[\s\S]*รุ่นก่อนหน้า/.test(tested) && /สวนฟื้นฟู[\s\S]*รับวัสดุ/.test(tested) && /\/is[\s\S]*Restoration City/.test(tested) && /\$80[\s\S]*2 ชิ้น/.test(tested) && !/\$32|ขายพืช|ข้าวสาลี|กระเป๋าเต็ม|หลายเกาะ|หลายคน|จำนวนเงิน|รุ่นใหม่|เห็นสวน|Sell each/.test(tested), tested.slice(0, 300));
  const pending = await page.$$eval('.status-card', cs => cs[2].textContent);
  check('pending card lists shop amounts + relic return, wheat quest, 24h reset, full bag, multiple islands, multi-member teams, isolation, map decoration', ['กล่องขายรุ่นใหม่', 'การจ่ายเงินจริง', 'ราคาที่แสดงในกระเป๋า', 'คืนโบราณวัตถุ', 'เห็นสวนเปลี่ยน', 'ข้าวสาลี', '24 ชั่วโมงจริง', 'กระเป๋าเต็ม', 'สร้างหลายเกาะ', 'ทีมหลายคน', 'แยกเมือง', 'การตกแต่งแผนที่'].every(w => pending.includes(w)), pending.slice(0, 300));
  check('map decoration marked unfinished in gallery', /การตกแต่งแผนที่ยังไม่เสร็จ/.test(await page.textContent('#gallery')));
  const start = await page.textContent('#start');
  check('join steps explain the required font pack and the Server Resource Packs setting', /ยอมรับแพ็กฟอนต์ไทย/.test(start) && /Server Resource Packs/.test(start) && /Enabled หรือ Prompt/.test(start));
  check('game UI language stated as English; in-game guide not called Thai', /เมนูและข้อความในเกมเป็นภาษาอังกฤษ/.test(text) && !/คู่มือ[^<]{0,20}ภาษาไทย/.test(text));
  check('English in-game quest names shown', /Harbor Supplies/.test(await page.textContent('#zone-quests')) && /Apprentice Builder/.test(await page.textContent('#zone-quests')));
  check('no "nothing to download" claim', !/ไม่ต้อง[^.]{0,20}ดาวน์โหลดอะไร/.test(text));
  check('no blanket one-account rule; alt-account rule is about quest rewards', !/หนึ่งคนหนึ่งบัญชี/.test(text) && /บัญชีสำรอง[\s\S]{0,40}รางวัล/.test(await page.textContent('#rules')));
  const shopText = await page.textContent('#zone-market') + await page.textContent('#zone-shop');
  check('old fixed shop/market price tables removed (only the $0.01 fallback appears)', !/\$(?!0\.01)\d/.test(shopText) && (await page.$$('#zone-market table, #zone-shop table')).length === 0);
  check('prices: inventory-only Sell each / Sell stack, shop icons hide prices, defaults may change', /Sell each/.test(shopText) && /Sell stack/.test(shopText) && /ไม่แสดงราคา/.test(shopText) && /ราคาเริ่มต้น/.test(shopText));
  check('sell box: shop price, plain-material price, then $0.01 fallback; Relic containers returned whole', /ราคาร้านค้าก่อน/.test(shopText) && /แบบธรรมดา/.test(shopText) && /\$0\.01/.test(shopText) && /คืนทั้งใบ/.test(shopText));
  check('new sell box not claimed as tested (card badge awaiting test)', (await page.$eval('#zone-market .zone-head .badge', b => b.textContent)) === 'รอทดสอบ');
  const garden = await page.textContent('#garden');
  check('garden prototype: 3 stages 25 Stone Bricks / 8 Grass Block / 4 Oak Log, commands, visual change pending', /Stone Bricks 25/.test(garden) && /Grass Block 8/.test(garden) && /Oak Log 4/.test(garden) && /\/cityprojects go/.test(garden) && /รอทดสอบ[\s\S]*เห็นสวนเปลี่ยน/.test(garden));
  check('sell box explains close-to-sell and Relic return', /ปิดหน้าต่าง/.test(shopText) && /โบราณวัตถุขายไม่ได้/.test(shopText));
  const team = await page.textContent('#team');
  check('team section: 1 island = 1 team, up to 3 islands incl. memberships, own city per island', /1 เกาะ = 1 ทีม/.test(team) && /สูงสุด 3 เกาะ/.test(team) && /รวมเกาะที่/.test(team) && /\/city go 2/.test(team));
  check('full-city incremental restoration only as an unbuilt future plan; garden is the only prototype', /ซ่อมทั้งเมือง[\s\S]{0,60}ยังไม่ได้สร้าง/.test(team) && /แผนในอนาคต/.test(team) && /สวนต้นแบบ/.test(team) && !/ซ่อมเมืองทีละโครงการ[^<]{0,40}(ใช้ได้แล้ว|ทดสอบแล้ว)/.test(text));
  check('quest rewards and 24-hour reset shown', /\$100[\s\S]*\$80/.test(await page.textContent('#zone-quests')) && /24 ชั่วโมง/.test(await page.textContent('#zone-quests')));
  check('team goals are 0/100/300/600/1000', (await page.$$eval('.goal b', bs => bs.map(b => b.textContent).join(','))) === '0,100,300,600,1000');

  group = 'Links';
  const missing = await page.$$eval('a[href^="#"]', as => as.map(a => a.getAttribute('href').slice(1)).filter(h => !document.getElementById(h)));
  check('every #link has a target', missing.length === 0, missing.join(','));
  const files = await page.$$eval('a[href]:not([href^="#"])', as => as.map(a => a.href).filter(h => h.startsWith(location.origin)));
  const broken = [];
  for (const f of files) { const r = await page.request.get(f); if (!r.ok()) broken.push(f); }
  check(`all ${files.length} local file links work`, broken.length === 0, broken.join(','));

  group = 'Chapter tabs';
  await page.click('#tab-3');
  check('click shows chapter 3 only', await page.isVisible('#ch-3') && !(await page.isVisible('#ch-1')));
  await page.focus('#tab-3'); await page.keyboard.press('ArrowDown');
  check('ArrowDown moves focus to tab 4', (await page.evaluate(() => document.activeElement.id)) === 'tab-4' && await page.isVisible('#ch-4'));
  await page.keyboard.press('End');
  check('End selects tab 5', (await page.getAttribute('#tab-5', 'aria-selected')) === 'true');
  await page.keyboard.press('ArrowRight');
  check('ArrowRight wraps to tab 1', (await page.getAttribute('#tab-1', 'aria-selected')) === 'true');
  check('only one tab is in the Tab order', (await page.$$eval('[role=tab]', ts => ts.filter(t => t.tabIndex === 0).length)) === 1);

  group = 'Command filters and copy';
  check('23 commands listed', (await visibleCmds(page)).length === 23);
  for (const [g, n] of Object.entries({ hub: 4, shop: 7, island: 5, city: 7 })) {
    await page.click(`.chip[data-filter="${g}"]`);
    const v = await visibleCmds(page);
    check(`filter "${g}" shows ${n} commands`, v.length === n && v.every(x => x === g), v.join(','));
  }
  await page.focus('.chip[data-filter="all"]'); await page.keyboard.press('Enter');
  check('filter works with the keyboard', (await visibleCmds(page)).length === 23 && (await page.getAttribute('.chip[data-filter="all"]', 'aria-pressed')) === 'true');
  for (const cmd of ['/city go', '/sell', '/spawn']) {
    await page.click(`.copy[data-copy="${cmd}"]`);
    await page.waitForTimeout(100);
    check(`copy button copies ${cmd}`, (await page.evaluate(() => navigator.clipboard.readText())) === cmd);
  }
  await page.focus('.copy[data-copy="/skyquests"]'); await page.keyboard.press('Enter'); await page.waitForTimeout(100);
  check('copy works with the keyboard', (await page.evaluate(() => navigator.clipboard.readText())) === '/skyquests');
  check('copy is announced to screen readers', (await page.textContent('#copy-status')).includes('/skyquests'));

  group = 'Keyboard';
  await page.goto(URL);
  await page.keyboard.press('Tab');
  check('first Tab focuses the visible skip link', await page.evaluate(() => document.activeElement.className === 'skip' && document.activeElement.getBoundingClientRect().top >= 0));
  await page.keyboard.press('Enter');
  check('skip link jumps to the main content', await page.evaluate(() => location.hash === '#main'));
  const nofocus = [];
  for (let i = 0; i < 50; i++) { await page.keyboard.press('Tab'); const f = await page.evaluate(() => { const e = document.activeElement; return getComputedStyle(e).outlineStyle === 'none' ? e.tagName + ' ' + e.textContent.trim().slice(0, 12) : ''; }); if (f) nofocus.push(f); }
  check('visible focus ring on the first 50 Tab stops', nofocus.length === 0, nofocus.join(' | '));
  await page.focus('#faq summary'); await page.keyboard.press('Enter');
  check('FAQ answer opens with Enter', await page.$eval('#faq details', d => d.open));
  await ctx.close();

  group = 'Reduced motion and no JavaScript';
  const r = await browser.newContext({ reducedMotion: 'reduce' });
  const rp = await r.newPage(); await rp.goto(URL);
  check('reduced motion turns off all animation', (await rp.$$eval('.float, .drift, .pulse', es => es.map(e => getComputedStyle(e).animationName))).every(a => a === 'none'));
  await r.close();
  const nj = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const np = await nj.newPage(); await np.goto(URL);
  check('no-JS: all 5 chapters readable', (await np.$$eval('[role=tabpanel]', ps => ps.filter(p => p.getBoundingClientRect().height > 0).length)) === 5);
  check('no-JS: all 23 commands readable', (await np.$$eval('.cmd', ls => ls.filter(l => l.getBoundingClientRect().height > 0).length)) === 23);
  check('no-JS: menu links reachable', await np.isVisible('.nav-links a[href="#topup"]'));
  check('no-JS: copy and filter buttons hidden', !(await np.isVisible('.filters')) && !(await np.isVisible('.copy')));
  check('no-JS: no horizontal scroll', (await np.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)) <= 0);
  await nj.close();

  await browser.close();
  server.close();

  // Report
  const fails = results.filter(x => !x.ok);
  let md = `# Lost Sky website check\n\nRun: ${new Date().toISOString()}\n\n**${results.length - fails.length}/${results.length} passed**\n`;
  let g = null;
  for (const x of results) {
    if (x.group !== g) { g = x.group; md += `\n## ${g}\n\n`; }
    md += `- ${x.ok ? '✅' : '❌'} ${x.name}${x.detail ? ` — \`${x.detail.replace(/`/g, "'")}\`` : ''}\n`;
  }
  md += `\nScreenshots (sticky header unpinned): \`${path.relative(process.cwd(), OUT)}/<width>-<theme>-<section>.png\`\n`;
  fs.writeFileSync(path.join(OUT, 'REPORT.md'), md);
  for (const x of results) console.log(`${x.ok ? 'PASS' : 'FAIL'} [${x.group}] ${x.name}${x.detail ? '  -> ' + x.detail : ''}`);
  console.log(`\n${results.length - fails.length}/${results.length} passed · report: ${path.join(OUT, 'REPORT.md')}`);
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); server.close(); process.exit(2); });
