# 越後飯 ECHIGO FAN — 網站

追過了，才帶你去。

Astro 靜態網站，內容全部來自 Notion 資料庫「越後飯・行腳筆記」。

## 核心原則

**Notion 是唯一內容真相來源，這個 repo 是展示外皮。**
不要直接編輯 `src/content/posts/` 底下的 `.md` —— 它們是同步產生的，下次同步就會被覆蓋。要改內容請去 Notion 改。

## 日常流程

```bash
npm run sync    # 從 Notion 抓「狀態=已發布」的文章 + 圖片
npm run dev     # 本機預覽 http://localhost:4321
git add -A && git commit -m "sync" && git push   # 推上去，Cloudflare Pages 自動部署
```

## 環境設定

專案根目錄需要 `.env`（已在 .gitignore，不會上傳）：

```
NOTION_TOKEN=ntn_xxxxxxxx
NOTION_DATABASE_ID=<Notion 資料庫 ID>
```

兩個值都在 https://www.notion.so/profile/integrations 的整合設定裡取得。
**一定要用 Copy 按鈕複製，不要用眼睛抄** —— `0` 跟 `O` 分不出來，曾經因此卡了很久。

## 同步腳本參數

| 指令 | 用途 |
|---|---|
| `npm run sync` | 正常同步（只抓「已發布」） |
| `npm run sync -- --all` | 連草稿／待填一起抓（測試用） |
| `npm run sync -- --debug` | 額外輸出 `notion-debug.json` 原始 API 回應 |
| `npm run sync -- --replay` | 用 `notion-debug.json` 離線重跑，不連 Notion |
| `npm run sync -- --prune-all` | 同步前清空 `src/content/posts`（會先備份） |

同步前會自動備份既有文章到 `.backup/posts-<時間>/`。

## Notion 欄位對應

| Notion 欄位 | frontmatter | 說明 |
|---|---|---|
| 標題 | `title` | |
| **Slug** | 檔名與網址 | **必填**，純英文。沒填的文章會被略過 |
| 作品名稱 | `artworkName` | 顯示在標題下方，如 Tunnel of Light |
| 作品編號 | `artworkNumber` | 如 N079 |
| 分類 | `category` | 多選 |
| 地點 | `location` | 單選 |
| 季節 | `season` | 多選 |
| 攻略類型 | `postType` | |
| 藝術家 | `artist` | 多選 |
| 狀態 | `status` | 只有「已發布」會被同步 |
| 對應Threads | `threads` | |

`lead`（開場句）自動取內文第一段，`date` 取 Notion 頁面建立時間，
`prevSlug` / `nextSlug` 依已發布文章順序自動串接。

## 技術

- Astro 4.15 · Node.js 22
- 內容集合 schema 定義在 `src/content/config.ts`
- 同步腳本 `scripts/sync-from-notion.mjs`
- 部署：Cloudflare Pages（build: `npm run build`，output: `dist`）
