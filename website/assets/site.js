// Lost Sky website behaviour. The page works without this file:
// every chapter is shown, and the copy/filter controls stay hidden.
(function () {
  'use strict';

  // ---- Mobile menu ----
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    links.classList.toggle('open', open);
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  // ---- Chapter tabs (WAI-ARIA tabs pattern) ----
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  function selectTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
  }
  // Panels are all visible in the HTML (for no-JS readers); show only one here.
  var current = tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0];
  if (current) selectTab(current, false);
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); selectTab(next, true); }
    });
  });

  // ---- Command filter ----
  var filterBar = document.querySelector('.filters');
  var cmds = Array.prototype.slice.call(document.querySelectorAll('.cmd'));
  if (filterBar) {
    filterBar.hidden = false;
    filterBar.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip');
      if (!chip) return;
      var group = chip.getAttribute('data-filter');
      filterBar.querySelectorAll('.chip').forEach(function (c) {
        c.setAttribute('aria-pressed', String(c === chip));
      });
      cmds.forEach(function (li) {
        li.hidden = group !== 'all' && li.getAttribute('data-group') !== group;
      });
    });
  }

  // ---- Copy buttons ----
  var status = document.getElementById('copy-status');
  var toast = null, toastTimer = null;
  function announce(msg) {
    if (status) status.textContent = msg;
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('aria-hidden', 'true');
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2200);
  }
  function selectText(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy');
    if (!btn) return;
    var text = btn.getAttribute('data-copy');
    var code = btn.parentNode.querySelector('code');
    var fallback = function () {
      if (code) selectText(code);
      announce('คัดลอกอัตโนมัติไม่ได้ เลือกข้อความให้แล้ว กด Ctrl+C เพื่อคัดลอก');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        announce('คัดลอก ' + text.trim() + ' แล้ว');
      }, fallback);
    } else {
      fallback();
    }
  });

  // ---- Highlight the menu link for the section on screen ----
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-links a'));
  if ('IntersectionObserver' in window) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Sections without their own menu link highlight the nearest one.
        var alias = { how: 'intro', relics: 'team', rules: 'start' };
        var id = alias[entry.target.id] || entry.target.id;
        navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
        if (byId[id]) byId[id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main > [id]').forEach(function (s) { observer.observe(s); });
  }
})();
