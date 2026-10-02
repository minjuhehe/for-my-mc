# Website checks

`check-site.js` tests `website/` in Chromium and writes a report.

```
npm install --no-save playwright     # once (or use a global install)
npx playwright install chromium      # once, if no browser is installed
node tests/website/check-site.js     # or: --out <folder>
```

It starts its own local server, so nothing else needs to run. Output:
- `PASS`/`FAIL` lines in the terminal; exit code 1 if anything fails.
- `tests/website/out/REPORT.md` and screenshots of every section at 1280px
  and 390px in light and dark mode (sticky header unpinned so it doesn't
  cover headings). `out/` is not committed.

`REPORT.md` in this folder is the copy from the last committed run.

What it checks:
- **Layout:** no sideways scroll, nothing past the screen edge, every image
  loads with Thai alt text, solid page background.
- **Legibility:** WCAG AA contrast for every piece of text (both themes),
  no text under 12px, no clipped text, no sentences broken apart by layout.
- **Header:** fits at 17 widths (320–1600px), wraps instead of clipping with
  wider text, and the sticky header never covers a heading you jump to.
- **Content rules:** no IP, Discord, player counts or "open" claims; no
  forms; top-up closed with no prices or payment details; footer date; hub
  shown as installed; only `/spawn` and `/hub` marked tested; no blanket
  one-account rule; prices, quest rewards and team goals match.
- **Interaction:** links, chapter tabs (mouse and keyboard), command filters,
  copy buttons, skip link, focus rings, FAQ, mobile menu, reduced motion,
  and the page with JavaScript turned off.

Update the content checks when the server status or prices change.
