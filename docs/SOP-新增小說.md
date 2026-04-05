# SOP：新增小說完整流程

---

## 一、建立小說目錄結構

在 `content/books/` 下建立新目錄，目錄名稱為小說的 **唯一識別碼**（英文、數字、連字號）：

```bash
mkdir -p content/books/your-novel-id/chapters
```

**命名規則：**
- 只用小寫英文、數字、連字號 `-`
- 不要有空格、中文、特殊符號
- 範例：`my-awesome-novel`、`shadow-trace-2`、`book-001`

---

## 二、建立 meta.json

在小說目錄下建立 `meta.json`：

```bash
touch content/books/your-novel-id/meta.json
```

**完整格式：**
```json
{
  "id": "your-novel-id",
  "title": "你的小說名稱",
  "author": "作者名",
  "category": "suspense",
  "tags": ["標籤一", "標籤二", "標籤三"],
  "synopsis": "小說簡介，用於 SEO 和詳情頁展示。建議 100-300 字。",
  "status": "ongoing",
  "rating": 8.5,
  "color": "#3B82F6",
  "date": "2026-04-05",
  "updated": "2026-04-05"
}
```

**欄位說明：**

| 欄位 | 類型 | 必填 | 說明 | 範例 |
|---|---|---|---|---|
| `id` | string | ✅ | 唯一識別碼，必須與目錄名一致 | `"death-note"` |
| `title` | string | ✅ | 小說標題 | `"死亡筆記本"` |
| `author` | string | ✅ | 作者名稱 | `"夜神月"` |
| `category` | string | ✅ | 分類 ID，必須對應 `content/categories.json` 中的 `id` | `"suspense"` |
| `tags` | array | ✅ | 標籤陣列，建議 2-4 個 | `["懸疑","心理"]` |
| `synopsis` | string | ✅ | 故事簡介 | `"一個高中生偶然..."` |
| `status` | string | ✅ | 連載狀態：`"ongoing"` 或 `"completed"` | `"ongoing"` |
| `rating` | number | ✅ | 評分 0-10 | `9.2` |
| `color` | string | ✅ | 主題強調色（十六進位） | `"#2C3E50"` |
| `date` | string | ✅ | 上架日期（YYYY-MM-DD） | `"2026-04-05"` |
| `updated` | string | ✅ | 最後更新日期（YYYY-MM-DD） | `"2026-04-05"` |

**可用的分類 ID：**
| ID | 名稱 | 預設色 |
|---|---|---|
| `suspense` | 懸疑 | `#2C3E50` |
| `healing` | 療癒 | `#A3B18A` |
| `scifi` | 科幻 | `#3B82F6` |
| `romance` | 言情 | `#E88D9E` |
| `fantasy` | 奇幻 | `#8B5CF6` |
| `horror` | 恐怖 | `#1F2937` |
| `comedy` | 喜劇 | `#F59E0B` |
| `literary` | 文學 | `#6B7280` |

---

## 三、建立章節檔案

在 `chapters/` 目錄下建立 Markdown 檔案：

```bash
touch content/books/your-novel-id/chapters/ch-1.md
```

**檔案命名規則：**
- 建議格式：`ch-1.md`、`ch-2.md`、`ch-3.md`...
- 檔名即為章節 URL 的一部分（`/book/your-novel-id/ch-1`）
- 檔名不需要按數字排序，系統會依照 frontmatter 中的 `order` 欄位排序

**章節格式：**
```markdown
---
title: "第一章：標題"
order: 1
---

放學後的校園格外安靜。

夜神月獨自走在空無一人的走廊上，皮鞋踩在磨石子地板上發出清脆的聲響。

「真是無聊透頂的世界。」他低聲自語。
```

**格式說明：**

```
---                    ← 必須以三個連字號開始
title: "章節標題"       ← 必填，章節顯示名稱
order: 1               ← 必填，數字越小越前面
---                    ← 三個連字號結束 frontmatter
                       ← 空一行（必須）
正文內容...            ← Markdown 格式，段落之間空一行
```

**正文格式規則：**
- 段落之間用**空行**分隔（兩個換行）
- 支援 Markdown 語法：`**粗體**`、`*斜體*`、`> 引用`、`---` 分隔線
- 不要使用 `#` 標題語法（系統會自動處理章節標題）
- 不要使用程式碼區塊或表格（閱讀器不支援）

---

## 四、新增分類（如需要）

如果你的小說屬於全新分類，需要更新 `content/categories.json`：

```json
[
  {"id":"suspense","name":"懸疑","icon":"🔍","color":"#2C3E50"},
  {"id":"your-new-cat","name":"新分類","icon":"🎯","color":"#FF5722"}
]
```

**欄位說明：**

| 欄位 | 類型 | 說明 |
|---|---|---|
| `id` | string | 分類唯一識別碼（英文） |
| `name` | string | 分類顯示名稱（中文） |
| `icon` | string | Emoji 圖示 |
| `color` | string | 主題色（十六進位） |

---

## 五、本地測試

```bash
# 1. 執行構建
bun run generate.mjs

# 2. 啟動本地伺服器
python3 -m http.server 8080

# 3. 瀏覽器開啟
open http://localhost:8080
```

**檢查清單：**
- [ ] 首頁出現新小說（熱門精選、排行榜）
- [ ] 分類頁顯示新小說
- [ ] 小說詳情頁：書名、作者、簡介、章節列表正確
- [ ] 章節閱讀：內容顯示正常、上一章/下一章連結正確
- [ ] 麵包屑導航路徑正確
- [ ] 手機版顯示正常

---

## 六、提交與部署

```bash
# 1. 查看變更
git status

# 2. 加入變更
git add content/books/your-novel-id/

# 3. 提交
git commit -m "feat: add novel [小說名稱]"

# 4. 推送（觸發自動部署）
git push
```

**等待 1-3 分鐘**，GitHub Pages 會自動更新。

---

## 七、後續更新章節

當小說有新章節時：

```bash
# 1. 新增章節檔案
touch content/books/your-novel-id/chapters/ch-42.md

# 2. 編輯內容
# （按照第三章的格式撰寫）

# 3. 更新 meta.json 的 updated 日期
# 修改 "updated": "2026-04-06"

# 4. 提交並推送
git add content/books/your-novel-id/
git commit -m "chore: add chapter 42 to [小說名稱]"
git push
```

---

## 常見錯誤

| 錯誤 | 原因 | 解決方法 |
|---|---|---|
| 小說不出現在首頁 | `meta.json` 格式錯誤 | 用 JSON 驗證器檢查語法 |
| 章節順序錯誤 | `order` 欄位重複或遺漏 | 確保每章 `order` 唯一且遞增 |
| 章節內容不顯示 | frontmatter 格式錯誤 | 確保 `---` 前後各空一行 |
| 分類頁面 404 | `category` 對應的分類不存在 | 檢查 `categories.json` 是否有該 ID |
| 連結跳轉錯誤 | 檔名用了中文或特殊符號 | 改用英文 + 數字 + 連字號 |
