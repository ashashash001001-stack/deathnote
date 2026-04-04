# DeathNote - 沉浸式線上小說閱讀平台

> 一個零依賴、極速、SEO 友善的靜態小說閱讀網站生成器。專為內容創作者與獨立開發者設計，完美適配 GitHub Pages 部署。

🌐 **線上預覽**: [https://ashashash001001-stack.github.io/deathnote/](https://ashashash001001-stack.github.io/deathnote/)  
📦 **部署狀態**: GitHub Pages (Project Pages)  
⚡ **構建時間**: < 1 秒 | 📄 **頁面總數**: 48+ | 📦 **依賴**: 0

---

## 📖 專案簡介

DeathNote 是一個以「內容為王、消除干擾」為核心理念的現代小說閱讀平台。採用純靜態 HTML/CSS/JS 架構，透過單一的構建腳本 (`generate.mjs`) 從結構化資料自動生成完整的靜態網站。無需後端、無需資料庫、無需框架，部署到任何靜態主機即可立即上線。

### 設計哲學
- **極簡沉浸**: 大面積留白、卡片式佈局、圓角元素，提供類似原生 App 的閱讀體驗
- **SEO 優先**: 每個頁面都是獨立 HTML，內嵌 Schema.org JSON-LD、Canonical、Open Graph 標籤
- **零依賴構建**: 僅使用 Node.js/Bun 內建模組，無 `node_modules` 黑洞
- **漸進增強**: 基礎功能純 HTML/CSS 實現，進階互動由輕量 Vanilla JS 提供

---

## ✨ 核心功能

### 🎨 UI/UX 與互動
| 功能 | 說明 |
|---|---|
| **響應式設計** | 手機優先 (Mobile-First)，完美適配 Notch 與安全區域 |
| **微互動** | 按鈕按壓縮放 (`scale(0.98)`)、卡片懸浮效果、平滑過渡動畫 |
| **橫向滑動卡片** | 首頁熱門精選支援觸控滑動與 CSS Scroll Snap |
| **排行榜 Tabs** | 總榜 / 新書 / 完結 三標籤即時切換 |
| **分類網格** | 8 大題材分類，CSS Grid 佈局，點擊直達分類頁 |
| **麵包屑導航** | 小說詳情與閱讀頁內建 Breadcrumb，提升 SEO 與使用者導航 |

### 📖 閱讀器體驗
| 功能 | 說明 |
|---|---|
| **沉浸式模式** | 預設隱藏頂底欄，點擊螢幕中央切換顯示/隱藏 |
| **三主題切換** | 白底黑字 / 夜間深灰 / 護眼淺黃，即時切換無閃爍 |
| **字體控制** | 字體大小滑桿 (14px~28px)、無襯線/襯線字體切換 |
| **章節導航** | 上一章/下一章按鈕、底部彈出式目錄 (Bottom Sheet) |
| **發聲朗讀 (TTS)** | 內建 Web Speech API，支援語速 (0.5x~2.0x) 與音高控制 |
| **閱讀進度** | 自動儲存滾動位置與章節進度，重新開啟自動恢復 |
| **書籤功能** | 一鍵加入/移除書籤，`localStorage` 持久化 |

### 🔍 SEO 與搜尋引擎
| 功能 | 說明 |
|---|---|
| **靜態路由** | 扁平化路徑結構 (`/book/[id]`, `/category/[id]`)，Google 爬蟲友善 |
| **JSON-LD** | 每本書嵌入 `Book` 結構化資料，每章節嵌入 `Chapter` 標記 |
| **Meta Tags** | 每頁獨立 `title`, `description`, `canonical`, `og:*`, `twitter:*` |
| **Sitemap** | 自動生成 `sitemap.xml`，包含所有路由、優先級、最後更新日期 |
| **Robots.txt** | 預設允許爬取，指引爬蟲至 Sitemap |

### 📱 PWA 與離線
| 功能 | 說明 |
|---|---|
| **Manifest** | `manifest.json` 支援「加入主畫面」，獨立 App 體驗 |
| **Service Worker** | 快取核心資源，支援離線瀏覽與快速載入 |
| **404 頁面** | 自訂錯誤頁，引導使用者返回首頁 |

### 💰 廣告變現
| 版位 | 位置 | 說明 |
|---|---|---|
| **首頁 In-feed** | 熱門精選與排行榜之間 | 融入列表的廣告區塊 |
| **分類頁 In-feed** | 書單列表底部 | 自然過渡的廣告佔位 |
| **詳情頁** | 簡介與目錄之間 | 高轉換率著陸頁廣告 |
| **閱讀頁底部** | 章節內容下方、翻頁按鈕上方 | 不破壞閱讀體驗的錨定廣告 |

---

## 🏗️ 技術架構

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   src/data.js   │───▶│  generate.mjs    │───▶│  靜態 HTML 檔案群    │
│   (內容資料)     │    │  (構建腳本)       │    │  (部署至 GitHub Pages)│
└─────────────────┘    └──────────────────┘    └─────────────────────┘
         │                       │                       │
┌─────────────────┐              │              ┌─────────────────────┐
│  src/styles.css │──────────────┘              │  瀏覽器直接渲染      │
│  (共用樣式)      │                             │  無需 JS 執行        │
└─────────────────┘                             └─────────────────────┘
```

### 為什麼不用框架？
- **SEO 最佳化**: 純靜態 HTML 對 Google 爬蟲最友善，無需 SSR/SSG 複雜配置
- **部署零成本**: 可直接部署至 GitHub Pages、Netlify、Vercel、Cloudflare Pages 免費方案
- **維護極簡**: 無依賴衝突、無版本升級地獄、無構建快取問題
- **效能極致**: 首屏載入 < 50KB (壓縮後)，Lighthouse 評分輕鬆破 95

---

## 📁 專案結構

```
deathnote/
├── index.html              # 首頁 (由 generate.mjs 生成)
├── 404.html                # 自訂錯誤頁
├── sitemap.xml             # 自動生成的 Sitemap
├── manifest.json           # PWA 設定檔
├── sw.js                   # Service Worker (離線快取)
├── robots.txt              # 搜尋引擎爬蟲指引
├── generate.mjs            # 🔧 構建腳本 (核心)
│
├── src/
│   ├── data.js             # 📚 所有小說、章節、分類資料
│   └── styles.css          # 🎨 全域共用 CSS (Design Tokens + 元件樣式)
│
├── book/                   # 小說詳情與閱讀頁 (16 本書 × 詳情 + 章節)
│   ├── [book-id]/
│   │   ├── index.html      # 小說詳情與目錄頁
│   │   └── [chapter-id]/index.html  # 閱讀器正文頁
│   └── ...
├── category/               # 分類清單頁 (8 個分類)
│   └── [category-id]/index.html
├── search/                 # 搜尋頁面
│   └── index.html
└── legal/                  # 法律頁面 (AdSense 必備)
    ├── privacy/index.html  # 隱私權政策
    └── terms/index.html    # 使用條款
```

---

## 🚀 快速開始

### 環境需求
- **Node.js** `>= 18.0` 或 **Bun** `>= 1.0`
- 無需安裝任何套件 (零依賴)

### 1. 取得專案
```bash
git clone https://github.com/ashashash001001-stack/deathnote.git
cd deathnote
```

### 2. 生成靜態網站
```bash
# 使用 Bun (推薦)
bun run generate.mjs

# 或使用 Node.js
node generate.mjs
```
執行後會在根目錄生成所有 HTML 檔案。

### 3. 本地預覽
```bash
# Python 3
python3 -m http.server 8080

# 或 Bun
bunx serve . -p 8080

# 開啟瀏覽器
open http://localhost:8080
```

### 4. 部署至 GitHub Pages
1. 將程式碼推送至 GitHub 倉庫
2. 進入 `Settings > Pages`
3. Source 選擇 `Deploy from a branch` → `main` 分支 → `/ (root)`
4. 等待 1~3 分鐘，網站即上線

---

## ⚙️ 進階設定

### 新增小說
編輯 `src/data.js`，在 `BOOKS` 陣列中加入新物件：
```javascript
export const BOOKS = [
  // ... 現有書籍
  {
    id: 'my-new-novel',           // 唯一識別碼 (英文、數字、連字號)
    title: '我的新小說',           // 書名
    author: '作者名',              // 作者
    category: 'scifi',            // 分類 ID (需對應 CATEGORIES)
    tags: ['科幻', '太空'],        // 標籤 (最多顯示前 2 個)
    synopsis: '故事簡介...',       // 大綱 (用於 SEO 與詳情頁)
    words: 50000,                 // 總字數
    chapters: 30,                 // 總章節數
    status: 'ongoing',            // 'ongoing' 或 'completed'
    rating: 8.5,                  // 評分 (0~10)
    color: '#3B82F6',             // 主題強調色
    date: '2026-01-01',           // 上架日期
    updated: '2026-04-05'         // 最後更新日期
  }
];
```

### 新增章節
在 `CHAPTERS` 陣列中加入：
```javascript
export const CHAPTERS = [
  // ... 現有章節
  {
    id: 'ch-1',                   // 章節 ID
    bookId: 'my-new-novel',       // 對應的書籍 ID
    title: '第一章：啟程',         // 章節標題
    content: '正文內容...\n\n分段用 \\n\\n', // 內容
    order: 1,                     // 排序
    words: 3500                   // 本章字數
  }
];
```

### 修改網站設定
編輯 `src/data.js` 底部的 `SITE` 物件：
```javascript
export const SITE = {
  name: 'DeathNote',
  tagline: '沉浸閱讀，從這裡開始',
  description: '網站描述 (用於 SEO meta)',
  url: 'https://yourdomain.com',  // 替換為你的實際網址
  base: '/deathnote'              // GitHub Pages Project Pages 請保留 /repo名稱
};
```
> ⚠️ **重要**: 若使用自訂網域，請將 `base` 改為 `'/'`。若使用 `username.github.io/repo`，請保持為 `'/repo'`。

### 調整分類
編輯 `CATEGORIES` 陣列：
```javascript
export const CATEGORIES = [
  { id: 'suspense', name: '懸疑', icon: '🔍', color: '#2C3E50' },
  // 可新增、刪除或修改分類
];
```

---

## 🔍 SEO 與搜尋引擎優化

### 自動生成的 SEO 元素
每次執行 `generate.mjs` 時，系統會自動為每個頁面注入：
- `<title>`: 動態標題 (例：`死亡筆記本 - DeathNote`)
- `<meta name="description">`: 頁面描述
- `<link rel="canonical">`: 權威網址
- `<meta property="og:*">`: Facebook/Line 預覽標籤
- `<meta name="twitter:*">`: Twitter 卡片標籤
- `<script type="application/ld+json">`: Schema.org 結構化資料

### 驗證 SEO 狀態
1. 使用 [Google Rich Results Test](https://search.google.com/test/rich-results) 檢查 JSON-LD
2. 使用 [Google Search Console](https://search.google.com/search-console) 提交 `sitemap.xml`
3. 使用 [Open Graph Check](https://www.opengraph.xyz/) 驗證社群分享預覽

### Sitemap 結構
```xml
<url>
  <loc>https://yourdomain.com/book/death-note</loc>
  <lastmod>2024-06-20</lastmod>
  <priority>0.9</priority>
</url>
```
- 首頁: `1.0` | 分類頁: `0.7` | 書籍詳情: `0.9` | 章節: `0.6` | 法律頁: `0.3`

---

## 💰 廣告變現指南 (AdSense)

### 替換廣告佔位符
所有頁面中的 `<div class="ad">Advertisement</div>` 即為廣告預留位置。申請到 Google AdSense 後，替換為實際廣告代碼：

```html
<!-- 原始佔位符 -->
<div class="ad">Advertisement</div>

<!-- 替換為 AdSense 代碼 -->
<div class="ad">
  <ins class="adsbygoogle"
       style="display:block"
       data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
       data-ad-slot="XXXXXXXXXX"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
```

### AdSense 申請必備頁面
本專案已內建：
- `/legal/privacy` - 隱私權政策 (含 Cookie 與 DART 說明)
- `/legal/terms` - 使用條款
- `/404` - 自訂錯誤頁

### 廣告版位建議
| 位置 | 建議格式 | 轉換率 | 體驗影響 |
|---|---|---|---|
| 首頁 In-feed | 資訊流廣告 | 中 | 低 (已融入卡片樣式) |
| 詳情頁 | 橫幅廣告 | 高 | 低 (位於簡介與目錄間) |
| 閱讀頁底部 | 錨定/橫幅 | 中高 | 極低 (不遮擋正文) |

> 🚫 **絕對不要**在閱讀正文段落中間插入廣告，會嚴重破壞沉浸體驗並導致跳出率上升。

---

## 📱 PWA 離線支援

### 已實作功能
- `manifest.json`: 定義 App 名稱、圖示、啟動畫面、主題色
- `sw.js`: Service Worker 快取核心 HTML/CSS 與靜態資源
- 離線策略: `Cache First, falling back to network`

### 測試 PWA
1. 使用 HTTPS 或 `localhost` 部署
2. 開啟 Chrome DevTools → `Application` → `Manifest` 檢查設定
3. 點擊 `Service Workers` 查看快取狀態
4. 切換至離線模式 (`Network` → `Offline`) 測試離線瀏覽

### 自訂 PWA 圖示
替換 `manifest.json` 中的 `icons` 陣列，建議提供 `192x192` 與 `512x512` PNG：
```json
"icons": [
  { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
  { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
]
```

---

## 🌐 部署指南

### GitHub Pages (推薦)
1. 推送程式碼至 `main` 分支
2. `Settings > Pages > Source: Deploy from a branch > main > / (root)`
3. 等待部署完成，網址為 `https://username.github.io/deathnote/`
4. **路徑修正**: 確保 `src/data.js` 中的 `SITE.base` 設為 `'/deathnote'`

### Vercel / Netlify / Cloudflare Pages
1. 連接 GitHub 倉庫
2. 構建命令留空 (無需構建) 或設為 `node generate.mjs`
3. 發布目錄設為 `/` (根目錄)
4. **路徑修正**: 將 `SITE.base` 改為 `'/'`

### 自訂網域
1. 在 GitHub Pages 設定中綁定自訂網域
2. 新增 `CNAME` 檔案至根目錄，內容為你的網域名稱
3. 將 `SITE.base` 改為 `'/'`
4. 更新 `SITE.url` 為實際網域

---

## 🐛 常見問題

### Q: 部署後頁面顯示 404 或路徑錯誤？
**A**: 這是 Project Pages 的常見問題。檢查 `src/data.js` 中的 `SITE.base`：
- 使用 `username.github.io/repo` → 設為 `'/repo'`
- 使用自訂網域 → 設為 `'/'`
修改後重新執行 `bun run generate.mjs` 並推送。

### Q: 如何新增更多章節？
**A**: 在 `src/data.js` 的 `CHAPTERS` 陣列中加入新物件，確保 `bookId` 對應正確，`order` 遞增。執行構建腳本即可自動生成頁面。

### Q: 閱讀器字體顯示異常？
**A**: 確保裝置已載入 Google Fonts。若需離線使用，可下載 `Noto Sans TC` 與 `Noto Serif TC` 字型檔案，放置於 `fonts/` 目錄並修改 `src/styles.css` 的 `@font-face`。

### Q: 如何啟用 Google Analytics？
**A**: 在 `generate.mjs` 的 `pageHTML` 函數中，於 `</head>` 前加入 GA 追蹤代碼：
```javascript
// 在 pageHTML 的 return 模板中加入
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-XXXXXXXXXX');</script>
```

### Q: 構建腳本執行失敗？
**A**: 確認 Node.js 版本 `>= 18.0` 或使用 Bun。檢查 `src/data.js` 語法是否正確 (結尾逗號、引號匹配)。

---

## 📄 授權條款

本專案採用 [MIT License](LICENSE)。可自由用於個人或商業專案，但請保留原始授權聲明。

---

## 🤝 貢獻指南

歡迎提交 Issue 或 Pull Request！
1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交變更 (`git commit -m 'feat: add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 開啟 Pull Request

---

## 📬 聯絡與支援

- 🐛 問題回報: [GitHub Issues](https://github.com/ashashash001001-stack/deathnote/issues)
- 💡 功能建議: [GitHub Discussions](https://github.com/ashashash001001-stack/deathnote/discussions)
- 📧 商業合作: 請透過 GitHub 聯絡

---

> 💡 **提示**: 本專案為純靜態生成架構，所有內容變更只需修改 `src/data.js`，執行一次構建即可全站更新。適合個人部落格、小說連載、知識庫、文件站等多種場景。
