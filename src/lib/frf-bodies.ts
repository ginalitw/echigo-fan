const FB = "https://www.facebook.com/groups/119131948168427";
const LINE =
  "https://line.me/ti/g2/ZkbbX0AKZnX8QU0_fg3LBxGMNorVV_gw942nSg?utm_source=invitation&utm_medium=link_copy&utm_campaign=default";

function community() {
  return `<div class="frf-community">
  <a href="${FB}" target="_blank" rel="noopener">台灣民間總部臉書</a>
  <a href="${LINE}" target="_blank" rel="noopener">LINE 社群</a>
</div>`;
}

export const FRF_BODIES: Record<string, string> = {
  "before-you-go": `
<aside class="frf-callout tip"><strong>本篇適合</strong>不管新手老手，第一步都從這裡開始。約 5 分鐘。</aside>
<p><strong>你的聖經是官網，你的心態決定命運。</strong></p>
<p>歡迎來到富士搖滾（Fuji Rock Festival）準備指南。沒有官腔，只有少走冤枉路的生存法則。不管第一次聽到，還是去過還要再衝，底下四件事出發前都要搞清楚。</p>
<h2>1. 你的聖經：官方網站</h2>
<p>別再問伸手牌問題，直接看官網。現在已有繁體中文版。</p>
<p><a href="https://www.fujirockfestival.com/" target="_blank" rel="noopener">fujirockfestival.com</a></p>
<aside class="frf-callout tip"><strong>懶人／自助</strong>懶得動腦：找旅行社包套。想自己掌控節奏與預算：把底下三點刻進腦子。</aside>
<p>準備順序永遠是：<strong>先機票、再住宿、再門票</strong></p>
<h2>2. 機票：別跟七月的颱風賭博</h2>
<p>便宜機票很誘人，但羊毛出在羊身上。七月底是日本颱風季，你跟廉航對賭的不只是幾千塊，是特休和整趟行程。</p>
<ul>
<li><strong>風險：</strong>航班取消，後面行程全部泡湯。</li>
<li><strong>老手建議：</strong>短期日本機票很少誇張下殺。買靈活度高的傳統航空，或提早幾天飛東京。</li>
</ul>
<aside class="frf-callout warn"><strong>踩坑警告</strong>廉航取消後通常只退票款，不賠後續住宿。這不是幫傳統航空打廣告，是保你人能站在苗場的保險費。</aside>
<h2>3. 住宿：距離與體力的等價交換</h2>
<figure>
<img src="/images/frf/before-you-go.jpg" alt="週四一早苗場王子飯店後的草坡">
<figcaption>週四一早約十點。苗場王子飯店後的草坡，之後會變成帳篷山。</figcaption>
</figure>
<h3>露營（王子飯店旁）</h3>
<p>地緣上離會場最近。青春無敵，熱血就是能量棒。</p>
<ul>
<li><strong>代價：</strong>扛裝備爬坡、搭帳、等洗澡、下雨更慘。</li>
<li><strong>回報：</strong>露營比較好玩，回憶是真的。</li>
<li><strong>沒搭帳經驗？</strong>近年有免搭帳，帶簡易寢具就好。新手強烈建議。</li>
</ul>
<h3>民宿</h3>
<p>要走一段或等接駁，但泥濘一天後能洗熱水澡、睡乾爽榻榻米，那是救贖。</p>
<ul>
<li><strong>現實：</strong>不是星級旅館，是昭和日式民宿——榻榻米、共用大澡堂、多半無冷氣（苗場晚上涼）。</li>
<li><strong>訂房：</strong>Airbnb 或直接聯絡，熱門時段要趁早。</li>
</ul>
<aside class="frf-callout tip"><strong>老手情報</strong>搜尋「苗場 滑雪 民宿」。近年有台灣人或華人接手，可用中文、Line 預訂。</aside>
<h2>4. 門票：為什麼老手都推 Ganban（岩盤）？</h2>
<p>門票不像演唱會秒殺，但 2025 年七月初、2026 年六月，三日聯票還是完售了。EPLUS、拓元、雄獅都能買，仍建議用 <a href="https://ganban.net/" target="_blank" rel="noopener">Ganban 岩盤</a>。</p>
<ul>
<li><strong>唯一解：</strong>官方免搭帳帳篷、停車券、官方巴士，幾乎只能從岩盤搶。</li>
<li><strong>策略：</strong>門票＋露營券統一從岩盤買。停車票注意兩人共一張。</li>
<li><strong>小確幸：</strong>岩盤買票常附飲料折價券或小禮。</li>
</ul>
<aside class="frf-callout warn"><strong>岩盤踩坑</strong>介面不人性，結帳務必核對金額。曾有團友重複買了 N 張露營券。結帳前多看一眼。</aside>
<h2>帶走這四點</h2>
<aside class="frf-callout sum"><strong>本篇重點</strong>
<ol>
<li>順序：先機票、再住宿、再門票</li>
<li>機票買傳統航空，颱風季別賭廉航</li>
<li>住宿趁早，苗場民宿距離就是正義</li>
<li>門票從岩盤買，結帳核對金額</li>
</ol></aside>
<h2>接著看</h2>
<ul>
<li><a href="/fujirock/budget-beginner/">富士搖滾新手預算：門票住宿交通怎麼算</a></li>
<li><a href="/fujirock/tokyo-to-naeba/">東京到苗場交通：新幹線、接駁與行李</a></li>
<li><a href="/fujirock/camping-reality/">富士搖滾露營：斜坡、下雨、洗澡真相</a></li>
</ul>
${community()}
`,

  "tokyo-to-naeba": `
<aside class="frf-callout tip"><strong>本篇適合</strong>新手首衝＋老手升級。約 5 分鐘。</aside>
<p>第一次去 Fuji Rock，看到日本鐵路圖先別慌。記住這條黃金動線：</p>
<p><strong>機場（45 分）→ 上野（80 分）→ 越後湯澤（40 分）→ 苗場會場</strong></p>
<h2>1. 機場 → 上野</h2>
<p>為什麼不是東京車站？上野結構比較單純，扛露營裝備時少走迷宮。</p>
<h3>成田（NRT）</h3>
<ul>
<li><strong>Skyliner：</strong>約 ¥2,580、41 分鐘直達上野。現在可做人臉辨識 E-ticket，閘門刷臉進站。</li>
</ul>
<h3>羽田（HND）</h3>
<ul>
<li>東京單軌到濱松町，轉山手線到上野，約 40 分鐘。</li>
</ul>
<h2>2. 上野 → 越後湯澤</h2>
<p>搭<strong>上越新幹線</strong>。來回自由座約 ¥13,200，車程約 80 分鐘。</p>
<ul>
<li><strong>去程：</strong>指定席，網路上先劃（JR 東日本或 Klook）。</li>
<li><strong>回程：</strong>時間難抓，買自由座最彈性。湯澤是大站，1–4 號車廂位子多。</li>
<li>綠色售票機會吐<strong>兩張</strong>（乘車券＋特急券），進出閘門疊在一起塞。</li>
</ul>
<h2>3. 越後湯澤 → 苗場</h2>
<ul>
<li><strong>乘車點：</strong>東口，出站右轉看看板。</li>
<li><strong>票價：</strong>上山 ¥2,000，下山免費。</li>
<li><strong>時間：</strong>週四中午 12:00 起（配合前夜祭）。下車在王子飯店前。</li>
<li><strong>計程車：</strong>單程約 ¥8,000。3–4 人分攤跟接駁差不多，不用排隊。</li>
</ul>
<aside class="frf-callout warn"><strong>心理準備</strong>週四下午、週五早上排隊可能一小時起跳。會暈車的人在車站先吃藥。上山全是蜿蜒山路。</aside>
<h2>回程</h2>
<aside class="frf-callout warn"><strong>末班新幹線 22:25</strong>壓軸約晚上 10 點結束。當天要趕回東京，下山接駁務必抓好時間。</aside>
<h2>帶走這四點</h2>
<aside class="frf-callout sum"><strong>本篇重點</strong>
<ol>
<li>黃金動線：機場 → 上野 → 越後湯澤 → 苗場</li>
<li>成田首選 Skyliner</li>
<li>新幹線去程指定席、回程自由座</li>
<li>末班 22:25</li>
</ol></aside>
<h2>接著看</h2>
<ul>
<li><a href="/fujirock/before-you-go/">富士搖滾行前準備：機票、住宿、岩盤門票</a></li>
<li><a href="/fujirock/budget-beginner/">富士搖滾新手預算：門票住宿交通怎麼算</a></li>
<li><a href="/fujirock/camping-reality/">富士搖滾露營：斜坡、下雨、洗澡真相</a></li>
</ul>
${community()}
`,

  "budget-beginner": `
<aside class="frf-callout tip"><strong>本篇適合</strong>新手首衝、預算有限。約 6 分鐘。</aside>
<p>這篇不談享受，只談生存。在 Fuji Rock，<strong>舒適度與金錢成正比</strong>。想省錢，就得付出體力。</p>
<h2>1. 絕對省不掉的入場費</h2>
<ul>
<li><strong>三日聯票：</strong>約 ¥54,000–¥60,000（不含手續費）</li>
<li><strong>露營券：</strong>¥6,000／人</li>
<li><strong>機票（台北–東京）：</strong>廉航促銷約 NT$8,000–$12,000</li>
</ul>
<p>菜鳥基本盤：門票＋廉航＋露營券 ≈ <strong>台幣 24,000</strong>。早鳥票通常二月底，能省幾千日幣也是錢。</p>
<aside class="frf-callout warn"><strong>廉航</strong>為了省 3–4 千，承擔的是颱風取消＝整趟報銷。提前幾天飛東京，比跟颱風賭運氣划算。</aside>
<h2>2. 交通：新幹線不能省</h2>
<p>上野 ↔ 越後湯澤來回自由座約 ¥13,200，再加接駁 ¥2,000。扛 15 公斤裝備時，你會感謝這 80 分鐘。青春 18 與高速巴士對新手不建議。</p>
<h2>3. 住宿：自備帳篷</h2>
<p>露營券已含營地。裝備能借就借。營區有免費淋浴（要排）；王子飯店溫泉 ¥1,500。</p>
<h2>4. 飲食</h2>
<p>不含酒水，一天留 ¥3,000–¥5,000。IC 卡先存 ¥20,000。上野或業務超市先掃貨：吐司、能量棒、杯麵。大水壺，營區有加水站。</p>
<aside class="frf-callout warn"><strong>注意</strong>玻璃、鋁罐禁止帶入舞台區。</aside>
<h2>5. 不能省的兩樣</h2>
<ul>
<li>透氣雨衣（Workman 或迪卡儂斗篷），不要便利商店透明雨衣。</li>
<li>便宜雨靴一定要加鞋墊。</li>
</ul>
<h2>極限生存價（台幣）</h2>
<table>
<thead><tr><th>項目</th><th>預估</th></tr></thead>
<tbody>
<tr><td>門票</td><td>$13,500</td></tr>
<tr><td>露營券</td><td>$1,200</td></tr>
<tr><td>機票</td><td>$11,000</td></tr>
<tr><td>交通</td><td>$3,100</td></tr>
<tr><td>飲食</td><td>$3,000</td></tr>
<tr><td>雜支</td><td>$2,000</td></tr>
<tr><td><strong>總計</strong></td><td><strong>約 $33,800</strong></td></tr>
</tbody>
</table>
<aside class="frf-callout sum"><strong>帶走</strong>基本盤 24,000 起跳；新幹線不能省；雨衣和鞋墊是命。</aside>
<h2>接著看</h2>
<ul>
<li><a href="/fujirock/before-you-go/">富士搖滾行前準備</a></li>
<li><a href="/fujirock/tokyo-to-naeba/">東京到苗場交通</a></li>
<li><a href="/fujirock/camping-reality/">富士搖滾露營真相</a></li>
<li><a href="/fujirock/gear-beginner/">裝備入門</a></li>
</ul>
${community()}
`,

  "camping-reality": `
<aside class="frf-callout tip"><strong>本篇適合</strong>第一次露營、怕被現實打臉。約 6 分鐘。</aside>
<p>Fuji Rock 營地離舞台最近，深夜最好玩，生存環境也最殘酷。先問自己：準備好面對斜坡、暴雨和汗水了嗎？</p>
<h2>1. 不是豪華露營</h2>
<ul>
<li><strong>斜坡：</strong>90% 是斜的。睡覺會往下滑。</li>
<li><strong>熱醒：</strong>早上 6 點太陽直射，帳內可到 35 度。</li>
<li><strong>洗澡：</strong>表演結束後免費淋浴可能排 1–2 小時。</li>
</ul>
<h2>2. 暴雨是預設值</h2>
<p>午後常下瞬間暴雨。離開營地聽團前，<strong>衣物、睡袋、電子產品全部用夾鏈袋封好</strong>。選有前庭的帳篷，泥鞋不要進睡覺區。</p>
<h2>3. 搶地：不要天黑才到</h2>
<p>最佳：週四中午 12:00 以前。週三前飛抵東京，週四一早新幹線。接駁車週四中午才開，可搭計程車或一般路線巴士先上山。</p>
<aside class="frf-callout warn"><strong>禁忌</strong>晚上才搭帳。好位子沒了，只剩陡坡。首衝且晚到：買免搭帳，別硬幹。</aside>
<ul>
<li>A／B 區離入口最近，週四下午滿。</li>
<li>女子營在入口附近，較安靜平坦。</li>
</ul>
<h2>4. 生存裝備</h2>
<ul>
<li>帳篷防水至少 2000–3000mm。</li>
<li>睡墊絕對必要。</li>
<li>耳塞、眼罩。紅舞台低音到凌晨。</li>
</ul>
<h2>5. 洗澡與充電</h2>
<p>錯峰：早上 6–7 點、下午 3–4 點。苗場溫泉 ¥1,500，刺青客 OK，有吹風機。露營區<strong>沒有插座</strong>。帶 2 顆 20000mAh。2026 年 4 月起入境行動電源 100Wh 以下各兩顆，隨身勿託運。</p>
<aside class="frf-callout sum"><strong>帶走</strong>斜坡＋睡墊＋防水帳＋夾鏈袋；週四中午前到；兩顆行動電源。</aside>
<h2>接著看</h2>
<ul>
<li><a href="/fujirock/tokyo-to-naeba/">東京到苗場交通</a></li>
<li><a href="/fujirock/hotels-and-inns/">民宿與飯店</a></li>
<li><a href="/fujirock/gear-beginner/">裝備入門</a></li>
</ul>
${community()}
`,

  "gear-beginner": `
<aside class="frf-callout tip"><strong>本篇適合</strong>第一次去、不知道穿什麼。約 10 分鐘。</aside>
<p>目標不是最帥，是活著回來。苗場不是曬死人就是下到懷疑人生。好朋友叫迪卡儂和 Workman。</p>
<h2>1. 雨衣：斗篷是新手制服</h2>
<p>大雨來時不用卸包，連人帶包一次罩住。選前開拉鍊、袖口有扣。下半身會濕：短褲＋內搭，或快乾登山褲。<strong>不要牛仔褲。</strong></p>
<h2>2. 鞋子</h2>
<ul>
<li><strong>野鳥雨靴：</strong>絕對防水，務必加厚鞋墊，否則第一天腳底廢。</li>
<li><strong>高筒登山鞋：</strong>日行兩萬步更耐走。加綁腿、厚襪。尺寸寧大勿小。</li>
<li><strong>訓鞋：</strong>出發前穿那雙鞋走 3–5 次。全新鞋會磨破皮。</li>
<li><strong>護趾涼鞋：</strong>營地休息或晴天備用。襪子濕了不要脫。</li>
</ul>
<h2>3. 大盤帽</h2>
<p>雨衣帽子會軟塌，雨水打在睫毛上。帽簷撐出視野。這件最值得直上 Gore-Tex，要有防風繩。</p>
<h2>4. 衣著</h2>
<p>棉 T、牛仔褲是敵人。穿化纖排汗衫。下半身登山褲或短褲＋壓縮褲。DEET 防蚊液噴在褲子外層。</p>
<h2>5. 背包 10–20L</h2>
<p>手機、錢包、行動電源再套一層夾鏈袋。</p>
<aside class="frf-callout sum"><strong>帶走</strong>斗篷、加鞋墊的雨靴、大盤帽。棉質禁止。一定要訓鞋。</aside>
<h2>接著看</h2>
<ul>
<li><a href="/fujirock/gear-lightweight/">裝備進階：輕量化</a></li>
<li><a href="/fujirock/daypack-packing/">隨身背包</a></li>
<li><a href="/fujirock/camping-reality/">富士搖滾露營真相</a></li>
</ul>
${community()}
`,
};
