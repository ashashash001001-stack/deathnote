# Relative Paths for Static Site Portability

## Problem

When a static site is hosted as a GitHub Project page (like `...github.io/repo/`), it lives in a subfolder. If someone forks it or moves it to a custom domain, hardcoded paths break.

## Solution: Depth-Based Relative Paths

### Path by Folder Depth

| Page Type | Folder Depth | Path Prefix | Example |
|----------|-------------|------------|----------|
| Root pages | 0 | `./` | index.html, shelf.html, my.html |
| Book/Category pages | 1 | `../` | book/[id]/index.html |
| Chapter pages | 2 | `../../` | book/[id]/ch-1/index.html |

### Key Elements to Fix

1. **`<base href="...">`** - Must reflect depth
   ```html
   <!-- Root: depth 0 -->
   <base href="./">
   <!-- Book: depth 1 -->
   <base href="../">
   <!-- Chapter: depth 2 -->
   <base href="../../">
   ```

2. **Static assets** - favicon.svg, manifest.json, sw.js
   ```html
   <link rel="icon" href="./favicon.svg">
   <link rel="manifest" href="./manifest.json">
   ```

3. **Navigation links** - menu, footer, breadcrumbs
   ```html
   <!-- Root page -->
   <a href="./book/death-note">
   <a href="./shelf.html">
   
   <!-- Book page -->
   <a href="../book/death-note">
   <a href="../shelf.html">
   
   <!-- Chapter page -->
   <a href="../../book/death-note">
   <a href="../../shelf.html">
   ```

4. **JavaScript-generated links** - These are tricky!
   ```javascript
   // Bad - hardcoded
   return '<a href="/deathnote/book/' + id + '">...';
   
   // Good - uses depth variable
   var rel = depth === 0 ? './' : depth === 1 ? '../' : '../../';
   return '<a href="' + rel + 'book/' + id + '">...';
   ```

5. **Service Worker registration**
   ```javascript
   // Must match depth
   navigator.serviceWorker.register('./sw.js')      // depth 0
   navigator.serviceWorker.register('../sw.js')     // depth 1
   navigator.serviceWorker.register('../../sw.js')    // depth 2
   ```

## Common Mistakes

1. **Fixed path prefix** - Never use fixed `./deathnote/` for all pages
2. **Inline JS with SITE_ROOT** - Must be processed by fixPaths
3. **Wrong depth for root pages** - shelf.html and my.html are AT ROOT, not in subfolder
4. **Missing trailing slash** - `../book/` not `../book`

## Generator Implementation

```javascript
function pageHTML(..., depth = 0) {
  const rel = depth === 0 ? './' : depth === 1 ? '../' : '../../';
  
  return `<base href="${rel}">
    <link rel="icon" href="${rel}favicon.svg">
    <link rel="manifest" href="${rel}manifest.json">
    ${body}
    <script>navigator.serviceWorker.register('${rel}sw.js')</script>`;
}

function fixPaths(html, depth = 0) {
  const rel = depth === 0 ? './' : depth === 1 ? '../' : '../../';
  
  return html
    .replace(/href="\/book\//g, `href="${rel}book/`)
    .replace(/href="\/category\//g, `href="${rel}category/`)
    .replace(/href="\/legal\//g, `href="${rel}legal/`)
    .replace(/href="\/"/g, `href="${rel}"`)
    // JavaScript-generated links
    .replace(/href="\/deathnote\//g, 'href="' + rel)
    .replace(/href="\$\{SITE_ROOT\}/g, `href="${rel}"`);
}
```

## Testing

1. Check generated HTML for correct paths:
   ```bash
   grep 'base href=' *.html
   grep 'href=".*book' *.html
   ```

2. Test navigation:
   - Root → Book works
   - Root → Shelf works
   - Root → My works
   - Shelf → Book works
   - Book → Chapter works
   - Chapter → Book works
   - Any page → legal pages works

## Key Takeaway

**Always calculate relative path based on folder depth, never use fixed paths!**