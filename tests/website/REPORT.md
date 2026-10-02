# Lost Sky website check

Run: 2026-10-02T19:20:38.439Z

**104/104 passed**

## Layout 1280px light

- ✅ no JavaScript errors
- ✅ no horizontal scroll
- ✅ nothing sticks out past the screen edge
- ✅ desktop: all 9 menu links on one row, inside the screen
- ✅ all 7 images load
- ✅ every image has Thai alt text
- ✅ page has a solid background
- ✅ text contrast meets WCAG AA (709 elements)
- ✅ no text smaller than 12px
- ✅ no clipped text in overflow-hidden boxes
- ✅ no sentences broken apart by grid/flex layout

## Layout 1280px dark

- ✅ no JavaScript errors
- ✅ no horizontal scroll
- ✅ nothing sticks out past the screen edge
- ✅ desktop: all 9 menu links on one row, inside the screen
- ✅ all 7 images load
- ✅ every image has Thai alt text
- ✅ page has a solid background
- ✅ text contrast meets WCAG AA (709 elements)
- ✅ no text smaller than 12px
- ✅ no clipped text in overflow-hidden boxes
- ✅ no sentences broken apart by grid/flex layout

## Layout 390px light

- ✅ no JavaScript errors
- ✅ no horizontal scroll
- ✅ nothing sticks out past the screen edge
- ✅ mobile: menu button shown, header one row
- ✅ all 7 images load
- ✅ every image has Thai alt text
- ✅ page has a solid background
- ✅ text contrast meets WCAG AA (709 elements)
- ✅ no text smaller than 12px
- ✅ no clipped text in overflow-hidden boxes
- ✅ no sentences broken apart by grid/flex layout

## Layout 390px dark

- ✅ no JavaScript errors
- ✅ no horizontal scroll
- ✅ nothing sticks out past the screen edge
- ✅ mobile: menu button shown, header one row
- ✅ all 7 images load
- ✅ every image has Thai alt text
- ✅ page has a solid background
- ✅ text contrast meets WCAG AA (709 elements)
- ✅ no text smaller than 12px
- ✅ no clipped text in overflow-hidden boxes
- ✅ no sentences broken apart by grid/flex layout

## Header across widths

- ✅ header fits at 17 widths from 320 to 1600px (menu button or full menu, never clipped)
- ✅ with 40% wider menu text at 1280px, links wrap instead of clipping

## Menu jumps 1280px

- ✅ all 9 menu links land with the heading visible below the header

## Menu jumps 390px

- ✅ all 9 menu links land with the heading visible below the header
- ✅ menu opens with aria-expanded=true
- ✅ Escape closes the menu
- ✅ no tap targets smaller than 24px

## Content

- ✅ no IP address anywhere in the page
- ✅ no Discord link
- ✅ no shared server-wide city wording
- ✅ no player counts, online status, reviews or "open" claims
- ✅ no form or input fields
- ✅ top-up says not open, no prices or payment details
- ✅ top-up has no technical wording
- ✅ footer date is 3 October 2026
- ✅ hub shown as installed, not "not pasted"
- ✅ commands marked tested = /spawn, /hub, /menu, /city go
- ✅ commands marked partly tested = /skyshop, /skyquests
- ✅ /market, /topup, /city donate and island commands still awaiting test
- ✅ quests: builder tested, farmer (wheat) awaiting test
- ✅ tested card has only the verified results
- ✅ pending card lists crop selling, wheat quest, 24h reset, full bag, multi-member teams, floating text, map decoration
- ✅ map decoration marked unfinished in gallery
- ✅ join steps explain the required font pack and the Server Resource Packs setting
- ✅ game UI language stated as English; in-game guide not called Thai
- ✅ English in-game quest names shown
- ✅ no "nothing to download" claim
- ✅ no blanket one-account rule; alt-account rule is about quest rewards
- ✅ market prices match the script
- ✅ shop prices match the script
- ✅ quest rewards and 24-hour reset shown
- ✅ team goals are 0/100/300/600/1000

## Links

- ✅ every #link has a target
- ✅ all 7 local file links work

## Chapter tabs

- ✅ click shows chapter 3 only
- ✅ ArrowDown moves focus to tab 4
- ✅ End selects tab 5
- ✅ ArrowRight wraps to tab 1
- ✅ only one tab is in the Tab order

## Command filters and copy

- ✅ 18 commands listed
- ✅ filter "hub" shows 4 commands
- ✅ filter "shop" shows 6 commands
- ✅ filter "island" shows 5 commands
- ✅ filter "city" shows 3 commands
- ✅ filter works with the keyboard
- ✅ copy button copies /city go
- ✅ copy button copies /market
- ✅ copy button copies /spawn
- ✅ copy works with the keyboard
- ✅ copy is announced to screen readers

## Keyboard

- ✅ first Tab focuses the visible skip link
- ✅ skip link jumps to the main content
- ✅ visible focus ring on the first 50 Tab stops
- ✅ FAQ answer opens with Enter

## Reduced motion and no JavaScript

- ✅ reduced motion turns off all animation
- ✅ no-JS: all 5 chapters readable
- ✅ no-JS: all 18 commands readable
- ✅ no-JS: menu links reachable
- ✅ no-JS: copy and filter buttons hidden
- ✅ no-JS: no horizontal scroll

Screenshots (sticky header unpinned): `tests/website/out/<width>-<theme>-<section>.png` (not committed)
