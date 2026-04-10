# Internal Links Bug Knowledge

## Problem
Internal navigation links had doubled path segments like:
- `https://ashashash001001-stack.github.io/deathnote/book/dragon-chronicles/book/dragon-chronicles/ch-1`

Expected: `https://ashashash001001-stack.github.io/deathnote/book/dragon-chronicles/ch-1`

## Root Cause
The `fixPaths()` function in `generate.mjs` converts absolute paths with base prefix to relative paths, but created `.//` (two dots + two slashes) instead of `../` (parent directory).

### Path Conversion Flow
1. `${SITE.base}/book/${book.id}/${chapter.id}` → `/deathnote/book/dragon-chronicles/ch-1` (when base = '/deathnote')
2. After `fixPaths`: `.//book/dragon-chronicles/ch-1` (. + . + /)

The `.//` resolves incorrectly in browsers.

## Solution
Added post-processing in `write()` function:

```javascript
// generate.mjs - write function
let html = fixPaths(content);
// FIX: .// (dot, slash, slash) -> ../
html = html.replace(/\.\/\//g, '../');
writeFileSync(full, html);
```

### Pattern Explanation
- `\.\/\/` matches literal string `.//` (two dots + two slashes)
- In JavaScript regex string: `/\.\/\//g`

## File Location
- **File**: `generate.mjs`
- **Function**: `write(path, content)`
- **Line**: ~252-256

## Verification
After generating, check for `.//` in HTML files:
```bash
grep -r '\.//' book/
```

## Related Files Changed
- All files in `book/` directory
- All files in `category/` directory 
- `generate.mjs`
- `search/index.html`
- `legal/` pages