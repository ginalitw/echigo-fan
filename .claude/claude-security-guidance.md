# 越後飯網站安全規則

這個 repo 是用 Astro 建置的網站，內容從 Notion 同步進來，透過 GitHub Actions 發佈到 GitHub Pages。審查程式碼時請注意以下規則。

## Notion token

- Notion API token 只能從環境變數或 GitHub Secrets 讀取，不能寫死在程式碼或設定檔裡。
- token 不能印進建置記錄，包括 console.log、錯誤訊息和除錯輸出。

## Notion 同步內容

- 從 Notion 同步進來的內容一律當作不可信的資料。
- 轉成 HTML 時，不能直接放行 script 標籤，也不能放行 onclick、onerror 這類事件屬性，javascript: 開頭的連結也要擋掉。

## GitHub Actions

- .github/workflows 的權限維持最小。除非任務明確要求，不要新增任何 write 權限，也不要放寬現有權限。

## 公開檔案

- public/ 底下的檔案都會直接公開在網站上，只能放要公開的檔案。不能放金鑰、內部筆記、備份檔或原始資料。
