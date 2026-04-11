# 測試問題修復計劃 - UI 與功能優化

## 問題概述

用戶在測試時發現以下問題，需要逐一修復：

| 序號 | 問題描述 | 優先級 |
|------|----------|--------|
| 1 | 首頁主編推薦的收藏按鈕異常，出現三種狀態，沒有同步現有收藏功能 | 🔴 高 |
| 2 | 首頁本週細讀區域的「閱讀」和「已讀」按鈕改用收藏按鈕 | 🔴 高 |
| 3 | 分類頁 UI 沒有配合整體風格（書本封面、文字大小、顏色） | 🟡 中 |
| 4 | 我的書閣頁面應該是獨立頁面，需要搜尋和分類功能 | 🟡 中 |
| 5 | 尋字頁面不需要了（移除） | 🟢 低 |
| 6 | 我的頁面應該是獨立頁面 | 🟡 中 |

---

## 技術現況分析

### 生成架構
這是一個靜態網站生成器，透過 `generate.mjs` 從 `src/data.js` 數據生成所有 HTML 頁面。

### 收藏功能現況
- **存儲方式**: `localStorage.getItem('favorites')` - 陣列格式 `[{id, title, time}]`
- **首頁按鈕**: 第 2684 行有收藏按鈕，但 `updateCounts()` 只更新 `booksData` 中書籍的狀態
- **問題根因**: 
  1. 頁面加載時 `updateCounts()` 沒有被自動調用
  2. `updateCounts()` 只在切換到 `profile` tab 時被調用 (第 3311 行)
  3. 首頁加載時應該調用一次來初始化收藏按鈕狀態

**修復方案**: 在 script 末尾添加 `document.addEventListener('DOMContentLoaded', updateCounts);`

---

### 導航結構
- 底部 Tab: 首頁 / 分類 / 搜尋 / 我的（Settings）
- 「我的書閣」目前在「我的」Tab 中的收藏列表區域
- 搜尋頁面存在於 `search/index.html`

---

## 修復計劃 Step by Step

### Phase 1: 首頁收藏按鈕修復 🔴

#### Step 1.1: 修復收藏按鈕狀態同步問題

**問題**: 主編推薦的收藏按鈕狀態沒有在頁面加載時同步

**原因**: `updateCounts()` 函數存在但可能在頁面加載時沒有被調用

**修復方案**:
```javascript
// 在 index.html 的 script 中，在文件末尾添加
document.addEventListener('DOMContentLoaded', function() {
  updateCounts(); // 初始化收藏按鈕狀態
});
```

**驗證方式**:
1. 打開首頁，檢查主編推薦區域的收藏按鈕
2. 如果之前已收藏，應該顯示「已收藏」並有紅色樣式
3. 如果未收藏，應該顯示「收藏」

#### Step 1.2: 將本週細讀的「閱讀」和「已讀」改為收藏按鈕

**現況**:
- 第 2701 行: `<span class="item-btn item-btn-outline">閱讀</span>` - 死亡筆記本
- 第 2712 行: `<span class="item-btn item-btn-filled">已讀</span>` - 靈劍山莊

**修復方案**:
將這兩個 `<span>` 改為 `<button>` 使用與主編推薦相同的 `toggleFavorite` 函數

**修改前**:
```html
<span class="item-btn item-btn-outline">閱讀</span>
```

**修改後**:
```html
<button class="item-btn item-btn-outline btn-press" 
        onclick="event.preventDefault();event.stopPropagation();toggleFavorite('death-note', '死亡筆記本')"
        id="fav-btn-death-note">收藏</button>
```

---

### Phase 2: 分類頁 UI 風格統一 🟡

#### Step 2.1: 分析分類頁現有結構

**現有結構**:
- 使用 `.css-book-cover` 生成書籍封面
- 標題字體: `14px`（css-book-cover-mini）
- 信息區域: `.cat-book-info`, `.cat-book-title`, `.cat-book-meta`

**問題**:
- 標題太小（14px vs 首頁 17px）
- 沒有配合首頁的 Wabi-Sabi 設計風格
- 收藏按鈕缺失

#### Step 2.2: 修改分類頁書籍卡片樣式

**需要修改 generate.mjs** 中的分類頁生成邏輯，或直接在 HTML 中添加樣式覆蓋

**目標樣式**:
- 書籍封面: 與首頁列表一致 (60x85px 或更大)
- 標題字體: 17px (與首頁 list-item-fusion 一致)
- 作者字體: 12px
- 添加收藏按鈕

#### Step 2.3: 添加分類頁收藏功能

在每個書籍卡片中添加收藏按鈕，與首頁相同的 `toggleFavorite` 邏輯

---

### Phase 3: 獨立頁面重構 🟡

#### Step 3.1: 我的書閣獨立頁面

**現況**: 目前在「我的」Tab 中的收藏列表

**需求**: 獨立頁面 `/shelf/` 或 `/my-shelf/`，包含:
- 搜尋功能
- 分類篩選功能

**實現方案**:
1. 在 `generate.mjs` 中添加新頁面生成
2. 使用現有的收藏數據 (`localStorage`)
3. 添加搜尋框和分類過濾 UI

#### Step 3.2: 我的頁面獨立

**現況**: 目前是底部 Tab 內容

**需求**: 獨立頁面 `/profile/` 或 `/my/`

**實現方案**:
1. 在 `generate.mjs` 中生成 `/my/index.html`
2. 移動底部 Tab 中的「我的」內容到獨立頁面

#### Step 3.3: 移除搜尋頁面

**現況**: `/search/index.html` 存在

**需求**: 不需要搜尋頁面

**實現方案**:
1. 從 `generate.mjs` 中移除搜尋頁面生成
2. 從首頁底部 Tab 移除搜尋按鈕
3. 或將搜尋功能整合到「我的書閣」頁面

---

### Phase 4: 修改 generate.mjs 🔴

所有頁面修改都需要修改 `generate.mjs` 來重新生成靜態 HTML。

#### Step 4.1: 首頁修改

- 修改 `homeContent` 函數中的收藏按鈕
- 添加本週細讀的收藏按鈕
- 添加 `DOMContentLoaded` 調用 `updateCounts()`

#### Step 4.2: 分類頁修改

- 修改 `categoryPageHTML` 中的書籍卡片樣式
- 添加收藏按鈕到每個書籍

#### Step 4.3: 新頁面生成

- 添加 `shelfPageHTML` - 我的書閣頁面
- 添加 `profilePageHTML` - 我的頁面

#### Step 4.4: 導航修改

- 移除搜尋頁面相關代碼
- 更新底部導航或創建新導航

---

## 執行順序

```
Step 1: 修復首頁收藏按鈕狀態同步
   └─ 在 index.html 添加 DOMContentLoaded 調用 updateCounts()
   
Step 2: 將本週細讀按鈕改為收藏
   └─ 修改 index.html 中的 "閱讀" 和 "已讀" 按鈕
   
Step 3: 修改 generate.mjs - 首頁收藏按鈕
   └─ 在 homeContent 中添加正確的收藏按鈕結構
   
Step 4: 修改 generate.mjs - 分類頁樣式
   └─ 統一書籍卡片樣式，添加收藏按鈕
   
Step 5: 生成我的書閣獨立頁面
   └─ 添加 shelfPageHTML 函數到 generate.mjs
   
Step 6: 生成我的頁面
   └─ 添加 profilePageHTML 函數到 generate.mjs
   
Step 7: 移除搜尋頁面
   └─ 從 generate.mjs 移除 searchPageHTML 函數調用
   
Step 8: 重新生成所有頁面
   └─ 運行 bun run generate.mjs
   
Step 9: 測試驗證
   └─ 檢查所有修改是否符合預期
```

---

## 預期產出

1. 首頁收藏按鈕狀態正確同步
2. 本週細讀區域使用收藏按鈕
3. 分類頁 UI 與首頁風格一致
4. 我的書閣獨立頁面，包含搜尋和分類功能
5. 我的頁面獨立
6. 搜尋頁面移除

---

## 風險與依賴

- 需要修改 `generate.mjs`，需要理解其結構
- 靜態頁面需要重新生成
- 需要確保 localStorage 在新頁面中可用
- 獨立頁面需要處理相對路徑問題