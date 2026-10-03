# Supporter storefront preview

Owner chose prepare first, payment channel later. No checkout, payment QR,
currency top-up or billing is enabled. Prices below are proposed THB one-time
cosmetic packages, not currently purchasable. In-game dollars remain separate.

| SKU | Proposed price | Implemented entitlement |
| --- | ---: | --- |
| sky |99 | Cyan SKY prefix/name in chat and player list |
| aurora |199 | Purple AURORA prefix/name, Builder title |
| nova |399 | Gold NOVA prefix/name, all three titles |
| tag_builder |39 | Builder title |
| tag_farmer |39 | Farmer title |
| tag_explorer |39 | Explorer title |

Highest tier stays active; lower grants never downgrade it. Titles are account
entitlements, not inventory items that can be sold, dropped or traded. /style
equips an unlocked title or hides it. No economy balance, kits, island size,
restoration progress, competitive buffs, OP or staff permissions are granted.

/topup, /supporter and the Sky Concierge open the same preview. Clicking
products only explains payments are closed. Wardrobe is functional.

## Console fulfillment

`supportgrant ONLINE_PLAYER SKU ORDER_ID` is console-only; player attempts are
refused. The player must be online so identity is their actual server UUID.
Order IDs are6-64 letters/digits/underscore/hyphen. Repeating the same ID/player/
SKU is idempotent; reusing an ID for another player/SKU is rejected. This records
an entitlement fulfillment, NOT verified payment. Do not attach it directly to
unverified screenshots, browser requests or client-reported payment callbacks.

Saved Skript keys: skysupport::tier/owned/selected keyed by player UUID;
skysupport::order keyed by order ID with UUID/SKU/time. menu/page are temporary
and cleared on load/quit/close. Normal Skript variable storage persists them.
Crash consistency, refund/revoke workflow and account-name spoof protection
are not complete. Current offline-mode server requires authenticated account
protection before paid entitlements are offered.

## Before accepting money

Choose payment provider and verification process; protect webhook credentials;
match verified transaction to amount/SKU/account exactly; deduplicate provider
transaction IDs; durable order ledger with customer-visible history; offline
fulfillment queue; refund/revoke policy; account authentication; publish final
prices, seller/contact/support and privacy terms. Do not claim this preview is a
complete payment system or a customer purchase history.

Future cosmetic products: particle trails, pets, furniture skins and custom
models. They require implementation/resource-pack assets first and are not in
the current sale catalog. No random paid crates planned.

Minecraft permits cosmetic sales except capes and restricts competitive gameplay
advantages; purchases need online history. Primary reference:
https://www.minecraft.net/en-us/usage-guidelines
