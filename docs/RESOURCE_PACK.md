# Required Thai font resource pack

Selected pack: [ThaiFontFix](https://modrinth.com/resourcepack/thaifontfix),
version1.0.8 / Modrinth version `2twKUIU3`, by HewkawAr, MIT license.
Author metadata explicitly includes Minecraft Java1.21.11.

One pack only: improves Thai font readability and vowel placement. It does
not translate custom plugin strings or change the client's selected language.
This Java pack does not provide a Bedrock resource pack.

Merge these keys into existing `server.properties`, preserving host ports,
authentication and other settings. Stop normally before editing; start after.

```properties
require-resource-pack=true
resource-pack=https://cdn.modrinth.com/data/nAi1yORJ/versions/2twKUIU3/ThaiFontFix-1.0.8.zip
resource-pack-sha1=3a8dab8c2d8f8b2c289897a387ea59933135aeab
resource-pack-id=e73273d3-d0a7-4a37-a10f-2b2fea2ae31b
resource-pack-prompt={"text":"Lost Sky: Thai font pack required (ThaiFontFix).","color":"aqua"}
```

Downloaded official CDN bytes: 15,274. SHA1 matched author API metadata.
Root pack.mcmeta and font-only assets inspected; format range15–99 includes
the author-declared target version. URL points to the author's hosted file;
we do not alter or combine packs.

On join, accept the server pack. If server resource packs were disabled for
this server in the client, change its saved server entry to Prompt or Enabled.
Refusing the required pack prevents joining. A cached unchanged pack may be
reused instead of downloading every time. Client rendering/decline checks
must be verified with an actual joining player after restart.

Rollback: stop server, restore the five previous resource-pack values from
the local pre-change backup, then start. Do not replace full properties from
a different host instance.

Reference: https://docs.papermc.io/paper/reference/server-properties/

Installed on MineLan server 9623747d on 2026-10-03. Read back all five keys after restart; Java normalized property escaping. Startup reached Done (14.193s) at 02:07:57 ICT with no resource-pack parse warning. Actual client download/rendering and decline tests remain pending.
