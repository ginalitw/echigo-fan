# Graph Report - echigo-fan  (2026-10-22)

## Corpus Check
- 83 files · ~715,016 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 5, .css 3)

## Summary
- 696 nodes · 1063 edges · 46 communities (37 shown, 9 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 43 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6b273e7e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- sync-from-notion.mjs
- sync-frf-from-notion.mjs
- [slug].astro
- frf-links.mjs
- rehype-frf-components.mjs
- Layout.astro
- astro.config.mjs
- ref_astro_content
- pages/index.astro
- 3️⃣ 區域逛吃指南
- frf-faq.test.mjs
- 📍 洗澡不是問題，排隊才是。
- weather-defense.md
- echigo-yuzawa.md
- fujirock/index.astro
- 📍 第一次去 Fuji Rock，裝備先顧雨和腳
- echigo-tsumari.md
- eve-festival.md
- 📍 一句話點睛
- 📍 Fuji Rock 可以帶椅子嗎？先看規定再挑
- 📍 東京到苗場：三段交通，從機場出發約 4～5 小時
- 📍 新手預算：用露營把花費壓到最低
- 📍 在苗場，「平地」是留給早起的人的獎賞。
- 📍 Fuji Rock 進場背包：10～20L，裝這些就夠
- 📍 新手的目標是活著；老手的目標是「從容」。
- 📍 四天沒電沒網路，你的富搖等於沒去。
- 📍 Fuji Rock 的露營區是全世界最美的音樂祭營地。
- merch-queue.md
- 📍 這不是一篇教你省錢的文章。
- 📍 Fuji Rock 住宿怎麼選：距離和舒適度的取捨
- 📍 從成田落地到踏上新幹線，上野這一站能搞定你 80% 的行前準備。
- wristband.md
- 越後飯 ECHIGO FAN — 網站
- 📍 你的聖經是官網，你的心態決定命運。
- timetable-strategy.md
- beginner-faq.md
- frf-components-demo.md
- ehon-museum.md
- kiyotsu-gorge.md
- last-class.md
- lost-windows.md
- monet.md
- nohbutai.md
- indexnow.mjs

## God Nodes (most connected - your core abstractions)
1. `main()` - 20 edges
2. `main()` - 16 edges
3. `📍 洗澡不是問題，排隊才是。` - 14 edges
4. `url()` - 13 edges
5. `3️⃣ 區域逛吃指南` - 12 edges
6. `richText()` - 11 edges
7. `📍 第一次去 Fuji Rock，裝備先顧雨和腳` - 11 edges
8. `byNewest()` - 9 edges
9. `cellText()` - 9 edges
10. `imgAttrs()` - 8 edges

## Surprising Connections (you probably didn't know these)
- `render()` --indirect_call--> `rehypeFrfComponents()`  [INFERRED]
  scripts/frf-components.test.mjs → src/lib/rehype-frf-components.mjs
- `run()` --calls--> `rehypeFrfFaq()`  [EXTRACTED]
  scripts/frf-faq.test.mjs → src/lib/rehype-frf-faq.mjs
- `newestCover()` --indirect_call--> `byNewest()`  [INFERRED]
  src/pages/index.astro → src/lib/posts.ts
- `render()` --calls--> `renderFrf()`  [EXTRACTED]
  scripts/frf-components.test.mjs → scripts/frf-render-helper.mjs
- `blocksToMarkdown()` --calls--> `richText()`  [EXTRACTED]
  scripts/sync-frf-from-notion.mjs → scripts/rich-text.mjs

## Import Cycles
- None detected.

## Communities (46 total, 9 thin omitted)

### Community 0 - "sync-from-notion.mjs"
Cohesion: 0.05
Nodes (51): dependencies, astro, dotenv, heic-convert, @notionhq/client, sharp, name, scripts (+43 more)

### Community 1 - "sync-frf-from-notion.mjs"
Cohesion: 0.08
Nodes (39): lineBreaks(), linkOf(), richText(), richTextBold(), styleKey(), wrapMark(), ARGS, ARGS_FORCE (+31 more)

### Community 2 - "[slug].astro"
Cohesion: 0.09
Nodes (31): astro, Article, articleFromEntry(), articlesByTopicFrom(), AudienceId, FRF_BODIES, BRIDGE, BRIDGE_SLUGS (+23 more)

### Community 3 - "frf-links.mjs"
Cohesion: 0.11
Nodes (21): titles, PAGES, css, displayTitle(), frfLinkText(), frfSlugOf(), hasMedia(), loadFrfTitles() (+13 more)

### Community 4 - "rehype-frf-components.mjs"
Cohesion: 0.12
Nodes (25): DEMO, render(), renderFrf(), BUILD, cellKids(), cellText(), CHOICE_COLUMNS, choiceCards() (+17 more)

### Community 5 - "Layout.astro"
Cohesion: 0.09
Nodes (23): ld, absolute(), articleLd(), author, BRAND, breadcrumbLd(), collectionLd(), graph() (+15 more)

### Community 6 - "astro.config.mjs"
Cohesion: 0.11
Nodes (25): CALLOUT_KIND, frfCallout(), frfRoute(), frfStepHeading(), imageVariants(), isHeading(), isInline(), isPlainStrong() (+17 more)

### Community 7 - "ref_astro_content"
Cohesion: 0.11
Nodes (16): collections, frf, posts, ARTIST_INTRO, LOCATION_INTRO, SEASON_INTRO, byNewest(), formatDate() (+8 more)

### Community 8 - "pages/index.astro"
Cohesion: 0.12
Nodes (16): days, cache, imgAttrs(), imgInfo(), VARIANT_W, variantPath(), WIDTHS, esc() (+8 more)

### Community 9 - "3️⃣ 區域逛吃指南"
Cohesion: 0.08
Nodes (25): 1️⃣ 苗場飲食：先懂這幾件事, 🗓️ 2026 年度確認（最新更新）, 🆕 2026 新面孔值得注意, ❓ 2026 未確認 / 可能有異動, ✅ 2026 確認回歸的必吃, 2️⃣ 歷年問卷精華榜（2023–2025 基礎資料）, 3️⃣ 區域逛吃指南, 4️⃣ 飲料特輯 (+17 more)

### Community 10 - "frf-faq.test.mjs"
Cohesion: 0.23
Nodes (16): h2(), hr(), p(), qaTree(), root(), run(), strong(), t() (+8 more)

### Community 11 - "📍 洗澡不是問題，排隊才是。"
Cohesion: 0.12
Nodes (16): 🚿 1. 洗澡的三大戰場：排隊與金錢的抉擇, 🧴 2. 野戰盥洗包：帶進浴室的神器, 3️⃣ 乾髮對策：沒有吹風機怎麼辦？（長髮必看）, ♨️ 4. 每年入浴情報哪裡查, 🏨 5. 越後湯澤周邊溫泉：大浴場的另一個選擇, 🍳 6. 場外住宿附加：御宿本陣的早餐自助餐, 🔗 延伸閱讀, ⚡ 懶人重點整理 (+8 more)

### Community 12 - "weather-defense.md"
Cohesion: 0.12
Nodes (16): ☀️ 1. 山區防曬迷思：陰天也會把你烤焦, 🦟 2. 蟲蟲危機：對抗苗場特有種「Buyo（蚋）」, 👣 3. 足部救護站：一天兩萬步的生存保衛戰, 🌡️ 4. 溫差防禦：35°C 熱衰竭 vs 15°C 失溫, 🩺 5. 急救包核心清單, 🛡️ 6. 最後防線：旅遊保險, 🧴 化學防禦（防曬乳）, 🌙 夜間修復（回營地 / 民宿必做） (+8 more)

### Community 13 - "echigo-yuzawa.md"
Cohesion: 0.12
Nodes (15): 🛍️ 0. 別急著離開苗場：現場限定採購, 🚌 1. 從苗場到越後湯澤：怎麼搭、幾點走, 🏪 2. 越後湯澤站：CoCoLo 商場全攻略, 🍶 3. 必去：ぽんしゅ館（清酒博物館）, 🍜 4. 越後湯澤在地美食, 🎁 5. 必買伴手禮清單, ✈️ 6. 帶回台灣：注意事項速查, 🚄 7. 搭新幹線回東京之前 (+7 more)

### Community 14 - "fujirock/index.astro"
Cohesion: 0.14
Nodes (14): clean(), extractFaq(), faqLd(), QA, bySlug, collection, daysLeft, faq (+6 more)

### Community 15 - "📍 第一次去 Fuji Rock，裝備先顧雨和腳"
Cohesion: 0.13
Nodes (14): 1️⃣ 雨衣：新手先買斗篷, 2️⃣ 鞋子選項 A：野鳥雨靴（完全防水）, 3️⃣ 鞋子選項 B：防水高筒登山鞋（比較耐走）, 4️⃣ 備用鞋：護趾涼鞋（營地休息用）, 5️⃣ 頭部：大盤帽撐出雨中的視野, 6️⃣ 衣著：避開棉質，少露一點皮膚, 7️⃣ 背包, 🥾 出發前先訓鞋 (+6 more)

### Community 16 - "echigo-tsumari.md"
Cohesion: 0.15
Nodes (12): 1️⃣ 多一天：7/22（四）藝術祭，傍晚上苗場, 🗓 2027 兩個活動的日期, 2️⃣ 多一天：7/26（一）散場後, 3️⃣ 多兩到三天：提早一週，看開幕週末, 🧭 三種排法, 📍 富士搖滾和大地藝術祭，都從越後湯澤進出。, ❓ 常見問題, 🔗 延伸閱讀 (+4 more)

### Community 17 - "eve-festival.md"
Cohesion: 0.15
Nodes (12): 1️⃣ 什麼是前夜祭？, 2️⃣ 2026 前夜祭時間表（官方公告）, 3️⃣ 值不值得去？, 4️⃣ 怎麼去？, 5️⃣ 穿著建議, 6️⃣ 周邊商品, 7️⃣ 飲食策略, 8️⃣ 離場注意 (+4 more)

### Community 18 - "📍 一句話點睛"
Cohesion: 0.17
Nodes (11): 1️⃣ 帳篷, 2️⃣ 睡袋, 3️⃣ 睡墊／防潮墊, 4️⃣ 雨衣, 5️⃣ 背包, 6️⃣ 其他小物（迪卡儂都有）, 7️⃣ 費用估算, 📍 一句話點睛 (+3 more)

### Community 19 - "📍 Fuji Rock 可以帶椅子嗎？先看規定再挑"
Cohesion: 0.17
Nodes (11): 1️⃣ 選項 1：童軍椅（最輕、最好收）, 2️⃣ 選項 2：迪卡儂折疊椅（有靠背）, 3️⃣ 選項 3：附背帶折疊椅（排隊好用）, 📍 Fuji Rock 可以帶椅子嗎？先看規定再挑, ⚖️ 三種折疊椅比較, 🎁 也可以在日本買, 🚨 先看規定：官網寫的和現場實際情況, ❓ 常見問題 (+3 more)

### Community 20 - "📍 東京到苗場：三段交通，從機場出發約 4～5 小時"
Cohesion: 0.17
Nodes (11): 1️⃣ 第一段：機場 ➔ 上野（Ueno）, 2️⃣ 第二段：上野 ➔ 越後湯澤（Echigo-Yuzawa）, 3️⃣ 第三段：越後湯澤 ➔ 苗場會場, 🛍️ 上山前：越後湯澤車站補給, 🚍 交通懶人包, ⚠️ 回程注意, ❓ 常見問題, 🔗 延伸閱讀 (+3 more)

### Community 21 - "📍 新手預算：用露營把花費壓到最低"
Cohesion: 0.18
Nodes (10): 1️⃣ 絕對省不掉的「入場費」, 2️⃣ 交通：新幹線＋接駁巴士, 3️⃣ 住宿：以天為被，以地為席, 4️⃣ 飲食：選碳水，填飽肚子, 5️⃣ 絕對不能省的兩樣東西, ❓ 常見問題, 🔗 延伸閱讀, ⚡ 懶人重點整理 (+2 more)

### Community 22 - "📍 在苗場，「平地」是留給早起的人的獎賞。"
Cohesion: 0.18
Nodes (10): 1️⃣ 一張表看懂各營區, 2️⃣ 營區旁的設施（2026 官方）, 3️⃣ 特殊營區（需特殊資格）, 4️⃣ 搶地策略：時間就是地形, 5️⃣ 營地生存法則, 🆘 不知道怎辦，去這兩個地方, 各區一句話重點, 📍 在苗場，「平地」是留給早起的人的獎賞。 (+2 more)

### Community 23 - "📍 Fuji Rock 進場背包：10～20L，裝這些就夠"
Cohesion: 0.18
Nodes (10): 1️⃣ 背包：10～20L，能被斗篷罩住, 2️⃣ Heroclip 萬能掛勾（神物推薦）, 3️⃣ 防水手機袋、夾鏈袋、保溫瓶, 4️⃣ 小物補給包, 5️⃣ 防蚊＋防曬, 📍 Fuji Rock 進場背包：10～20L，裝這些就夠, ✅ 出門前檢查表, ❓ 常見問題 (+2 more)

### Community 24 - "📍 新手的目標是活著；老手的目標是「從容」。"
Cohesion: 0.18
Nodes (10): 1️⃣ 雨衣的終點：Gore-Tex (GTX) 王者降臨, 2️⃣ 日本國民神牌：Montbell（必買推薦）, 3️⃣ 平價神話：WORKMAN（便宜也有好貨）, 4️⃣ 底層衣的革命：美麗諾羊毛 (Merino Wool), 5️⃣ 足下升級：Gore-Tex 登山鞋 + 綁腿, 🔗 延伸閱讀, ⚡ 懶人重點整理, 📍 新手的目標是活著；老手的目標是「從容」。 (+2 more)

### Community 25 - "📍 四天沒電沒網路，你的富搖等於沒去。"
Cohesion: 0.18
Nodes (10): 📶 1. 出發前：選哪種網路方案？, 🔋 2. 出發前：行動電源怎麼帶？, ⚡ 3. 苗場場內：充電資源, 📡 4. 苗場場內：訊號怎麼樣？, 📥 5. 無網備案：出發前下載清單, 🔋 6. 省電實戰技巧, 📍 四天沒電沒網路，你的富搖等於沒去。, 🔗 延伸閱讀 (+2 more)

### Community 26 - "📍 Fuji Rock 的露營區是全世界最美的音樂祭營地。"
Cohesion: 0.20
Nodes (9): 1️⃣ 露營的真相：不是豪華露營（Glamping）, 2️⃣ 苗場的天氣：暴雨是日常，不是意外, 3️⃣ 搶地策略：絕對不要天黑才到, 4️⃣ 生存裝備：你的移動城堡, 5️⃣ 洗澡與充電：現代人的焦慮, 📍 Fuji Rock 的露營區是全世界最美的音樂祭營地。, 🔗 延伸閱讀, ⚡ 懶人重點整理 (+1 more)

### Community 27 - "merch-queue.md"
Cohesion: 0.20
Nodes (9): 1. 排隊時間估算與防曬中暑, 2. 前夜祭只賣官方周邊，且下午才開, 3. 藤井風聯名只有專屬攤位，前夜祭完全不開, 4. 台灣線上訂購截止日, 📋 各售場營業時間, 🔗 延伸閱讀, 🔄 快速對照：前夜祭 vs 祭典期間, ⚡ 懶人重點整理 (+1 more)

### Community 28 - "📍 這不是一篇教你省錢的文章。"
Cohesion: 0.22
Nodes (8): 1️⃣ 基礎開銷：該花的絕不手軟, 2️⃣ 交通升級：拒絕排隊與搬運, 3️⃣ 住宿升級：買一個好覺, 4️⃣ 終極外掛：FUJI ROCK go round, 5️⃣ 飲食與裝備：機能就是性感, 🔗 延伸閱讀, 💰 老手尊爵預算表（台幣）, 📍 這不是一篇教你省錢的文章。

### Community 29 - "📍 Fuji Rock 住宿怎麼選：距離和舒適度的取捨"
Cohesion: 0.22
Nodes (8): 1️⃣ 住宿選項比較, 2️⃣ 苗場、淺貝民宿：走路就到會場, 3️⃣ 越後湯澤站周邊：訂不到苗場時的備案, 4️⃣ 特殊住宿方案：要抽籤或搭配巴士, 📍 Fuji Rock 住宿怎麼選：距離和舒適度的取捨, ❓ 常見問題, 🔗 延伸閱讀, ⚡ 懶人重點整理

### Community 30 - "📍 從成田落地到踏上新幹線，上野這一站能搞定你 80% 的行前準備。"
Cohesion: 0.22
Nodes (8): 1️⃣ 怎麼到上野, 2️⃣ 阿美橫町（アメ横）：邊走邊買, 3️⃣ 核心採購點：御徒町一帶, 4️⃣ 藥妝補給：苗場必買清單, 5️⃣ 在上野住一晚, 🔗 延伸閱讀, 📍 從成田落地到踏上新幹線，上野這一站能搞定你 80% 的行前準備。, ⚡ 懶人重點整理

### Community 31 - "wristband.md"
Cohesion: 0.22
Nodes (8): 1️⃣ 先確認你的票是哪種, 2️⃣ OVERSEA 帳篷：海外票換手環流程, 3️⃣ 戴手環：這個動作只有一次機會, 4️⃣ 露營族：7/23 午後入場的順序關鍵, 5️⃣ 加購 Go Around 的團友注意, 🔗 延伸閱讀, ⚡ 懶人重點整理, 📍 手環是你在苗場三天的唯一通行證——領錯、戴錯、弄丟了，沒有補救。

### Community 32 - "越後飯 ECHIGO FAN — 網站"
Cohesion: 0.25
Nodes (7): Notion 欄位對應, 同步腳本參數, 技術, 日常流程, 核心原則, 環境設定, 越後飯 ECHIGO FAN — 網站

### Community 33 - "📍 你的聖經是官網，你的心態決定命運。"
Cohesion: 0.25
Nodes (7): 1️⃣ 你的聖經：官方網站, 2️⃣ 機票：別跟七月的颱風賭博, 3️⃣ 住宿：距離與體力的等價交換, 4️⃣ 門票：為什麼老手都推 Ganban（岩盤）？, 📍 你的聖經是官網，你的心態決定命運。, 🔗 延伸閱讀, ⚡ 懶人重點整理

### Community 34 - "timetable-strategy.md"
Cohesion: 0.25
Nodes (7): 🛠️ 1. 工具箱：出發前先準備好這幾個, 🎧 2. 行前功課：研究你不認識的名字, ⚖️ 3. 衝堂決策框架, 📅 4. 三天體力分配, 🔀 5. 老手的反直覺建議, 🔗 延伸閱讀, ⚡ 懶人重點整理

### Community 35 - "beginner-faq.md"
Cohesion: 0.29
Nodes (6): 🏠 住宿・生活機能篇, 🗺️ 場地介紹篇, 🔗 延伸閱讀, ⚡ 懶人重點整理, 🎒 裝備準備篇, 💰 預算・交通篇

### Community 36 - "frf-components-demo.md"
Cohesion: 0.33
Nodes (5): 寬表格在手機上改成卡片, 時間軸, 決策卡, 站內連結, 預算總覽卡

## Knowledge Gaps
- **1 isolated node(s):** `heic-convert`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 406 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `astro` connect `[slug].astro` to `sync-from-notion.mjs`, `Layout.astro`, `astro.config.mjs`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **What connects `heic-convert` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `sync-from-notion.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05380852550663871 - nodes in this community are weakly interconnected._
- **Why does `sharp` connect `sync-from-notion.mjs` to `pages/index.astro`, `astro.config.mjs`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Should `sync-frf-from-notion.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.08309178743961353 - nodes in this community are weakly interconnected._
- **Why does `@notionhq/client` connect `sync-from-notion.mjs` to `sync-frf-from-notion.mjs`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `[slug].astro` be split into smaller, more focused modules?**
  _Cohesion score 0.0859465737514518 - nodes in this community are weakly interconnected._