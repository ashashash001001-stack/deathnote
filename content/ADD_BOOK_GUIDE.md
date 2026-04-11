# 添加新書籍指南

本指南說明如何在 DeathNote 系統中新增一本書籍。

---

## 目錄

1. [快速開始](#快速開始)
2. [目錄結構](#目錄結構)
3. [meta.json 欄位說明](#metajson-欄位說明)
4. [章節檔案格式](#章節檔案格式)
5. [Category 選項](#category-選項)
6. [顏色代碼建議](#顏色代碼建議)
7. [常見錯誤與解決](#常見錯誤與解決)
8. [驗證步驟](#驗證步驟)

---

## 快速開始

### 步驟 1：複製模板

```bash
# 複製模板資料夾並命名為新書的 ID
cp -r content/books/__TEMPLATE__ content/books/你的書-id
```

### 步驟 2：編輯 meta.json

打開 `content/books/你的書-id/meta.json`，填入書籍資訊。

### 步驟 3：新增章節

在 `chapters/` 資料夾中新增 `.md` 檔案，命名為 `ch-001.md`, `ch-002.md` 等。

### 步驟 4：執行生成

```bash
bun run generate.mjs
```

---

## 目錄結構

```
content/books/你的書-id/
├── meta.json          # 書籍資訊（必填）
└── chapters/          # 章節資料夾
    ├── ch-001.md      # 第一章
    ├── ch-002.md      # 第二章
    └── ...            # 更多章節
```

---

## meta.json 欄位說明

| 欄位 | 類型 | 必填 | 說明 | 範例 |
|------|------|------|------|------|
| `id` | 字串 | ✅ | 書籍唯一 ID，只能用英文、數字、連字符 | `"death-note"` |
| `title` | 字串 | ✅ | 書籍名稱 | `"死亡筆記本"` |
| `author` | 字串 | ✅ | 作者名稱 | `"夜神月"` |
| `category` | 字串 | ✅ | 分類 ID（見下方列表） | `"suspense"` |
| `tags` | 陣列 | ✅ | 標籤列表，最少 1 個 | `["懸疑", "心理"]` |
| `synopsis` | 字串 | ✅ | 書籍簡介，建議 50-200 字 | `"一個高中生..."` |
| `status` | 字串 | ✅ | 發布狀態：`draft`=草稿，`published`=已發布 | `"draft"` |
| `rating` | 數字 | ✅ | 評分，0-10 之間 | `9.2` |
| `color` | 字串 | ✅ | 主題顏色代碼（見下方列表） | `"#2C3E50"` |
| `date` | 字串 | ✅ | 發布日期，格式 YYYY-MM-DD | `"2024-01-15"` |
| `updated` | 字串 | ✅ | 最後更新日期，格式 YYYY-MM-DD | `"2024-06-20"` |
| `imageKeywords` | 字串 | ❌ | 封面生成關鍵詞，用逗號分隔 | `"notebook,pen,dark"` |

---

## 章節檔案格式

每個章節檔案都是 Markdown 格式：

```markdown
---
title: "第一章：章節標題"
order: 1
---

第一章的內容從這裡開始寫。

可以寫很多段落，表達故事情節和細節。

建議每個段落之間用空行分隔，這樣閱讀起來更順暢。
```

### 欄位說明

| 欄位 | 說明 |
|------|------|
| `title` | 章節標題 |
| `order` | 章節順序號碼，數字越小越前面 |

### 命名規則

- 檔案名稱格式：`ch-XXX.md`（XXX 為三位數編號）
- 例如：`ch-001.md`, `ch-002.md`, `ch-010.md`

---

## Category 選項

| ID | 名稱 | 說明 |
|-----|------|------|
| `suspense` | 懸疑 | 推理、偵探、神秘事件 |
| `healing` | 療癒 | 溫馨、撫慰人心 |
| `scifi` | 科幻 | 太空、未來、科技 |
| `romance` | 言情 | 愛情、浪漫 |
| `fantasy` | 奇幻 | 魔法、異世界 |
| `horror` | 恐怖 | 驚悚、恐怖 |
| `comedy` | 喜劇 | 搞笑、幽默 |
| `literary` | 文學 | 經典、文藝 |

---

## 顏色代碼建議

| 分類 | 推薦顏色 | 效果 |
|------|----------|------|
| 懸疑 | `#2C3E50` | 深藍灰，神秘感 |
| 療癒 | `#A3B18A` | 柔和綠，放鬆感 |
| 科幻 | `#3B82F6` | 科技藍 |
| 言情 | `#E88D9E` | 浪漫粉 |
| 奇幻 | `#8B5CF6` | 魔法紫 |
| 恐怖 | `#1F2937` | 黑暗灰 |
| 喜劇 | `#F59E0B` | 明亮橙 |
| 文學 | `#6B7280` | 文藝灰 |

**自訂顏色**：可以使用任何有效的 HEX 顏色代碼（如 `#FF5733`）

---

## 常見錯誤與解決

### ❌ 錯誤：ID 已存在

**訊息**：`Error: Book ID "xxx" already exists`

**解決**：更換一個不重複的 ID

### ❌ 錯誤：缺少必填欄位

**訊息**：`Error: Missing required field "category"`

**解決**：檢查 meta.json 確保所有必填欄位都有值

### ❌ 錯誤：章節格式錯誤

**訊息**：章節內容無法正確解析

**解決**：確保章節檔案開頭有 `---` 包住的 frontmatter

### ❌ 錯誤：status 不是有效值

**訊息**：`Error: status must be "draft" or "published"`

**解決**：status 只能是 `draft` 或 `published`

---

## 驗證步驟

### 1. 檢查 meta.json 語法

```bash
# 確保是有效的 JSON
cat content/books/你的書-id/meta.json | python3 -m json.tool > /dev/null && echo "✅ JSON 格式正確"
```

### 2. 執行生成

```bash
bun run generate.mjs
```

### 3. 檢查輸出

- 如果成功，會顯示 `Generated X static pages`
- 檢查 `index.html` 中是否有你的書
- 如果設定為 `published`，書會出現在首頁

### 4. 本地測試

```bash
# 使用簡單的 HTTP 伺服器測試
bun -e "import{serve}from'http';serve(p=>new Response(p.fileReader().readFileSync('./index.html'),{headers:{'Content-Type':'text/html'}}))"
```

---

## 快速檢查清單

- [ ] ID 唯一，不與其他書重複
- [ ] category 為有效的 ID
- [ ] status 為 `draft` 或 `published`
- [ ] rating 為 0-10 的數字
- [ ] color 為有效的 HEX 顏色
- [ ] 每個章節都有 order 欄位
- [ ] 章節檔案以 `.md` 結尾
- [ ] 已執行 `bun run generate.mjs`

---

## 範例：完整的新書結構

```
content/books/my-new-book/
├── meta.json
│   {
│     "id": "my-new-book",
│     "title": "我的新書",
│     "author": "作者名",
│     "category": "fantasy",
│     "tags": ["奇幻", "冒險"],
│     "synopsis": "這是一個關於冒險的故事...",
│     "status": "draft",
│     "rating": 8.5,
│     "color": "#8B5CF6",
│     "date": "2025-04-11",
│     "updated": "2025-04-11"
│   }
└── chapters/
    ├── ch-001.md
    ├── ch-002.md
    └── ch-003.md
```

---

如有任何問題，請檢查錯誤訊息或參考本指南。