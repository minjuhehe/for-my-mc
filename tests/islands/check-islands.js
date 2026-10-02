#!/usr/bin/env node
// Offline checks for the island selector (lostsky-islands.sk + lostsky-city.sk).
//
// Usage (from the repo root):
//   node tests/islands/check-islands.js [--src <dir>]
//
// --src: folder that contains (or will receive) BentoBox 3.17.0 and BSkyBlock
// 1.20.0 sources as <dir>/bentobox and <dir>/bskyblock. If they are missing,
// the script clones the exact tags with git. No server, no Minecraft needed.
//
// What it proves: every BentoBox/BSkyBlock method the scripts call exists in
// the tagged source with that parameter count; the behaviour the design relies
// on is present in that source; the scripts are structurally sound, English
// only, never store slot numbers, and never intercept other /is subcommands.
// What it cannot prove: that Skript/skript-reflect parse and run the scripts.
// That needs `skript reload` on the server.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO = path.resolve(__dirname, '../..');
const SCRIPTS = path.join(REPO, 'server/plugins/Skript/scripts');
const srcArg = process.argv.indexOf('--src');
const SRC = path.resolve(srcArg > 0 ? process.argv[srcArg + 1] : path.join(__dirname, '.src'));
const TAGS = { bentobox: ['https://github.com/BentoBoxWorld/BentoBox.git', '3.17.0'], bskyblock: ['https://github.com/BentoBoxWorld/BSkyBlock.git', '1.20.0'] };

const results = [];
let group = '';
const check = (name, ok, detail) => results.push({ group, name, ok: !!ok, detail: ok ? '' : String(detail || '') });

// ---------- Sources ----------
for (const [dir, [url, tag]] of Object.entries(TAGS)) {
  const d = path.join(SRC, dir);
  if (!fs.existsSync(d)) {
    fs.mkdirSync(SRC, { recursive: true });
    execFileSync('git', ['clone', '-q', '--depth', '1', '--branch', tag, url, d], { stdio: 'inherit' });
  }
}
const tagOf = d => { try { return execFileSync('git', ['-C', d, 'describe', '--tags', '--exact-match'], { encoding: 'utf8' }).trim(); } catch { return '?'; } };
const BB = path.join(SRC, 'bentobox/src/main/java/world/bentobox/bentobox');
const BS = path.join(SRC, 'bskyblock/src/main');
const read = f => fs.readFileSync(f, 'utf8');

group = 'Source versions';
check('BentoBox source is tag 3.17.0', tagOf(path.join(SRC, 'bentobox')) === '3.17.0', tagOf(path.join(SRC, 'bentobox')));
check('BSkyBlock source is tag 1.20.0', tagOf(path.join(SRC, 'bskyblock')) === '1.20.0', tagOf(path.join(SRC, 'bskyblock')));

// Count top-level parameters in a Java parameter list.
function arity(params) {
  params = params.replace(/@\w+(\([^)]*\))?\s*/g, '').trim();
  if (!params) return 0;
  let depth = 0, n = 1;
  for (const c of params) { if (c === '<') depth++; else if (c === '>') depth--; else if (c === ',' && depth === 0) n++; }
  return n;
}
// Public (or interface default) methods: name -> [arities]
function methods(file) {
  const out = Object.create(null);
  const re = /(?:public|default)\s+(?:static\s+)?(?:final\s+)?(?:synchronized\s+)?(?:<[^>]+>\s+)?[\w.<>\[\], ?@]+?\s+(\w+)\s*\(([^)]*)\)/g;
  let m;
  const text = read(file);
  while ((m = re.exec(text))) (out[m[1]] = out[m[1]] || []).push(arity(m[2]));
  return out;
}

// ---------- 1. Every API call exists with this parameter count ----------
group = 'BentoBox API calls exist in the tagged source';
const API = [
  ['BentoBox.java', 'getInstance', 0], ['BentoBox.java', 'getIslandsManager', 0], ['BentoBox.java', 'getIWM', 0],
  ['managers/IslandsManager.java', 'getIslands', 2], ['managers/IslandsManager.java', 'getIslandById', 1],
  ['managers/IslandsManager.java', 'setPrimaryIsland', 2], ['managers/IslandsManager.java', 'isGoingHome', 1],
  ['managers/IslandsManager.java', 'homeTeleportAsync', 2], ['managers/IslandWorldManager.java', 'getWorldSettings', 1],
  ['api/configuration/WorldSettings.java', 'getConcurrentIslands', 0],
  ['api/user/User.java', 'getInstance', 1], ['api/user/User.java', 'getPermissionValue', 2],
  ['database/objects/Island.java', 'isDeleted', 0], ['database/objects/Island.java', 'inTeam', 1],
  ['database/objects/Island.java', 'getUniqueId', 0], ['database/objects/Island.java', 'getWorld', 0],
  ['database/objects/Island.java', 'isPrimary', 1], ['database/objects/Island.java', 'getName', 0],
  ['database/objects/Island.java', 'getRank', 1], ['database/objects/Island.java', 'getMemberSet', 0],
];
for (const [file, name, n] of API) {
  const found = (methods(path.join(BB, file))[name] || []);
  check(`${path.basename(file, '.java')}.${name}(${n} args)`, found.includes(n), `${name} arities in source: ${JSON.stringify(found)}`);
}
check('BSkyBlock Settings.getConcurrentIslands() implemented', (methods(path.join(BS, 'java/world/bentobox/bskyblock/Settings.java')).getConcurrentIslands || []).includes(0));
// Overloads that matter for reflection: the UUID variants must exist.
const isl = read(path.join(BB, 'managers/IslandsManager.java'));
check('getIslands(World, UUID) overload exists', /public List<Island> getIslands\(@NonNull World world, UUID uniqueId\)/.test(isl));
check('homeTeleportAsync(Island, User) overload exists', /public CompletableFuture<Void> homeTeleportAsync\(Island island, User user\)/.test(isl));
check('User.getInstance(UUID) overload exists', /public static User getInstance\(@NonNull UUID uuid\)/.test(read(path.join(BB, 'api/user/User.java'))));
check('Island.getRank(UUID) overload exists', /public int getRank\(UUID userUUID\)/.test(read(path.join(BB, 'database/objects/Island.java'))));

// The scripts must not call any method outside this verified list (plus plain Java/Bukkit ones).
const islandsSk = read(path.join(SCRIPTS, 'lostsky-islands.sk'));
const citySk = read(path.join(SCRIPTS, 'lostsky-city.sk'));
const JAVA_OK = new Set(['getWorld', 'getName', 'getUniqueId', 'isPresent', 'get', 'size', 'getInstance']);
const verified = new Set(API.map(a => a[1]));
const cityNew = citySk.slice(0, citySk.indexOf('function skyCityBuild'));
const code = t => t.split('\n').filter(l => !/^\s*#/.test(l)).join('\n');
const calls = [...code(islandsSk + cityNew).matchAll(/\.(\w+)\(/g)].map(m => m[1]);
const unknown = [...new Set(calls)].filter(c => !verified.has(c) && !JAVA_OK.has(c));
check('selector scripts call only verified methods', unknown.length === 0, unknown.join(', '));

// ---------- 2. Behaviour the design relies on ----------
group = 'Behaviour facts in the tagged source';
const cache = read(path.join(BB, 'managers/island/IslandCache.java'));
check('getIslands(world, uuid) is sorted oldest first (stable slot order)', /sorted\(Comparator\.comparingLong\(Island::getCreatedDate\)\)/.test(cache));
check('player index is filled from getMemberSet (MEMBER rank and up)', /island\.getMemberSet\(\)\.forEach\(member -> addPlayer\(member, island\)\)/.test(cache));
check('Island.inTeam = member set (MEMBER, SUB_OWNER, OWNER)', /public boolean inTeam\(UUID playerUUID\) \{\s*return this\.getMemberSet\(\)\.contains\(playerUUID\);/.test(read(path.join(BB, 'database/objects/Island.java'))));
check('getIsland(world, uuid) prefers the island the player stands on (why we store an ID)', /getIslandAt\(playerLocation\)/.test(isl.slice(isl.indexOf('public Island getIsland(@NonNull World world, @NonNull UUID uuid)'), isl.indexOf('public Island getIsland(@NonNull World world, @NonNull UUID uuid)') + 1200)));
const tp = isl.slice(isl.indexOf('public CompletableFuture<Void> homeTeleportAsync(Island island, User user, boolean newIsland)'));
check('homeTeleportAsync(Island, User) uses that island\'s home and sets it primary', /island\.getHome\(""\)/.test(tp.slice(0, 400)) && /setPrimaryIsland\(user\.getUniqueId\(\), island\)/.test(tp.slice(0, 1500)));
check('concurrent count = all member islands in the world', /getNumberOfConcurrentIslands\(UUID uuid, World world\) \{\s*return islandCache\.getIslands\(world, uuid\)\.size\(\);/.test(isl));
const create = read(path.join(BB, 'api/commands/island/IslandCreateCommand.java'));
check('/is create limit = permission island.number.<n> or concurrent-islands', /"island\.number"/.test(create) && /getConcurrentIslands\(\)/.test(create));
const nn = read(path.join(BB, 'managers/island/NewIsland.java'));
check('a new island becomes the creator\'s primary island', /setPrimaryIsland\(user\.getUniqueId\(\), island\)/.test(nn));
const def = read(path.join(BB, 'api/commands/island/DefaultPlayerCommand.java'));
check('plain /is runs default-action / new-player-action; "/x" runs command x', /getDefaultPlayerAction\(\)/.test(def) && /getDefaultNewPlayerAction\(\)/.test(def) && /command\.startsWith\("\/"\)[\s\S]{0,200}performCommand\(command\.substring\(1\)\)/.test(def));
const cfg = read(path.join(BS, 'resources/config.yml'));
check('BSkyBlock config has command.default-action and new-player-action', /\n\s+new-player-action: create/.test(cfg) && /\n\s+default-action: go/.test(cfg));
check('BSkyBlock config has world.concurrent-islands (default 1)', /\n\s+concurrent-islands: 1/.test(cfg));
const acc = read(path.join(BB, 'api/commands/island/team/IslandTeamInviteAcceptCommand.java'));
check('DANGER confirmed: with disallow-team-member-islands=true, joining a team deletes the player\'s islands', /if \(disallowTeamMemberIslands\) \{[\s\S]{0,200}deleteIsland\(island, true/.test(acc));
check('commands register under the addon name -> "bskyblock:island" is valid', /getDescription\(\)\.getName\(\)\.toLowerCase/.test(read(path.join(BB, 'managers/CommandsManager.java'))) && /^name: BSkyBlock$/m.test(read(path.join(BS, 'resources/addon.yml'))));
check('permission prefix is "bskyblock"', /getPermissionPrefix\(\) \{\s*return "bskyblock";/.test(read(path.join(BS, 'java/world/bentobox/bskyblock/Settings.java'))));

// ---------- 3. Script structure ----------
group = 'Script structure';
function structure(name, text) {
  const lines = text.split('\n');
  const bad = lines.map((l, i) => [l, i + 1]).filter(([l]) => /\t/.test(l) || (l.trim() && (l.length - l.trimStart().length) % 4 !== 0));
  check(`${name}: spaces only, indentation in steps of 4`, bad.length === 0, bad.slice(0, 5).map(b => 'line ' + b[1]).join(', '));
  const nonAscii = lines.map((l, i) => [l, i + 1]).filter(([l]) => /[^\x00-\x7F]/.test(l) && !/^\s*#/.test(l));
  check(`${name}: English only (no non-ASCII text outside comments)`, nonAscii.length === 0, nonAscii.slice(0, 5).map(b => 'line ' + b[1]).join(', '));
  let q = 0; const odd = lines.map((l, i) => [l, i + 1]).filter(([l]) => !/^\s*#/.test(l) && ((l.match(/"/g) || []).length % 2 === 1));
  check(`${name}: balanced quotes on every line`, odd.length === 0, odd.slice(0, 5).map(b => 'line ' + b[1]).join(', '));
  const pct = lines.map((l, i) => [l, i + 1]).filter(([l]) => !/^\s*#/.test(l) && /"/.test(l) && ((l.match(/"[^"]*"/g) || []).join('').match(/%/g) || []).length % 2 === 1);
  check(`${name}: balanced %...% inside strings`, pct.length === 0, pct.slice(0, 5).map(b => 'line ' + b[1]).join(', '));
}
structure('lostsky-islands.sk', islandsSk);
structure('lostsky-city.sk', citySk);

// Every called function exists in some loaded script.
const all = fs.readdirSync(SCRIPTS).filter(f => f.endsWith('.sk')).map(f => read(path.join(SCRIPTS, f))).join('\n');
const defined = new Set([...all.matchAll(/^function (\w+)\(/gm)].map(m => m[1]));
const BUILTIN = new Set(['max', 'min', 'location', 'size']);
const used = [...new Set([...(islandsSk + citySk).matchAll(/\b(sky\w+|relic\w+)\(/g)].map(m => m[1]))];
const missing = used.filter(f => !defined.has(f) && !BUILTIN.has(f));
check('every called sky*/relic* function is defined in the scripts', missing.length === 0, missing.join(', '));
const dupes = [...all.matchAll(/^function (\w+)\(/gm)].map(m => m[1]).filter((f, i, a) => a.indexOf(f) !== i);
check('no function is defined twice across scripts', dupes.length === 0, dupes.join(', '));
check('island functions are prefixed skyIsland and do not clash with city/hub/market', [...islandsSk.matchAll(/^function (\w+)\(/gm)].every(m => m[1].startsWith('skyIsland')));

// ---------- 4. Identity and safety rules ----------
group = 'Identity and safety rules';
const persistentSets = [...(islandsSk + citySk).matchAll(/set \{(sky\w+)::(\w+)::[^\n]*?\} to ([^\n]+)/g)].map(m => [m[1] + '::' + m[2], m[3].trim()]);
const selectedSets = persistentSets.filter(p => p[0] === 'skyisland::selected');
check('{skyisland::selected} is only ever set to an island ID variable (never a slot number)', selectedSets.length > 0 && selectedSets.every(p => /^\{_(id|pick)\}$/.test(p[1])), JSON.stringify(selectedSets));
check('island ID comes from Island.getUniqueId()', /add \{_island\}\.getUniqueId\(\) to \{_ids::\*\}/.test(islandsSk));
check('membership re-checked with inTeam before every action', /inTeam\(\{_p\}\.getUniqueId\(\)\) is not true/.test(islandsSk) && (islandsSk.match(/skyIslandFor\(/g) || []).length >= 6);
check('no lookup by owner (getOwner/isOwner not used)', !/getOwner|isOwner|getOwnedIslands/.test(islandsSk + cityNew));
check('city key no longer uses location-based getIsland(world, uuid)', !/getIsland\(\{_world\}/.test(citySk) && /function skyCityKey\(p: player\) :: text:\s*\n\s*return skyIslandSelected\(\{_p\}\)/.test(citySk));
check('existing city data keys unchanged (skycity::<kind>::<island id>)', ['slot', 'ready', 'chapter', 'points'].every(k => new RegExp(`\\{skycity::${k}::%\\{_key\\}%\\}`).test(citySk)));
check('selector never deletes city data or worlds', !/delete \{skycity::(slot|ready|chapter|points)/.test(islandsSk + citySk) && !/unload|deleteWorld|deleteIsland|bsbadmin|reset/i.test(islandsSk));
check('create goes through the native namespaced command', /execute player command "bskyblock:island create"/.test(islandsSk));
check('selector never runs plain "is"/"island" (no loop with default-action)', !/execute player command "(is|island)"/.test(islandsSk + cityNew));
const onCmd = citySk.slice(citySk.indexOf('on command:'));
check('/is interception is limited to "is|island city ..." (other subcommands untouched)', /if \{_parts::2\} is not "city":\s*\n\s*stop/.test(onCmd) && onCmd.indexOf('cancel event') > onCmd.indexOf('{_parts::2} is not "city"'));
check('island menus cancel clicks and drags, and are cleared on close/quit/load', /on inventory drag:[\s\S]*skyisland::menu/.test(islandsSk) && /on inventory close:/.test(islandsSk) && /on quit:/.test(islandsSk) && /on load:\s*\n\s*delete \{skyisland::menu::\*\}/.test(islandsSk));

// ---------- 5. Docs ----------
group = 'Setup documentation';
const doc = fs.existsSync(path.join(REPO, 'docs/ISLAND_SELECTOR.md')) ? read(path.join(REPO, 'docs/ISLAND_SELECTOR.md')) : '';
for (const key of ['default-action: /islands', 'new-player-action: /islands', 'concurrent-islands: 3', 'disallow-team-member-islands: false', 'bskyblock.island.number.']) {
  check(`docs/ISLAND_SELECTOR.md covers "${key}"`, doc.includes(key));
}
check('docs warn that joining a team deletes islands if the setting stays true', /delet/i.test(doc) && /disallow-team-member-islands/.test(doc));

// ---------- Report ----------
const fails = results.filter(r => !r.ok);
let g = null;
for (const r of results) {
  if (r.group !== g) { g = r.group; console.log(`\n## ${g}`); }
  console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.detail ? '  -> ' + r.detail : ''}`);
}
console.log(`\n${results.length - fails.length}/${results.length} passed`);
process.exit(fails.length ? 1 : 0);
