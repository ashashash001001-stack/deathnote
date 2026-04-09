import { writeFileSync, mkdirSync, existsSync, rmSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = '.';
const CONTENT = 'content';
const KEEP = new Set(['.git','.gitignore','.gitattributes','.opencode','.sisyphus','opencode.jsonc','node_modules','src','generate.mjs','migrate-content.mjs','manifest.json','sw.js','robots.txt','README.md','package.json','bun.lock','package-lock.json','CNAME','content','docs']);

if (existsSync(DIST)) {
  readdirSync(DIST).forEach(e => {
    if (!KEEP.has(e)) rmSync(join(DIST, e), { recursive: true, force: true });
  });
}

const css = readFileSync('src/styles.css', 'utf-8');
const CATEGORIES = JSON.parse(readFileSync(join(CONTENT, 'categories.json'), 'utf-8'));
const SVG_ICON = `<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="8" fill="#1A1A2E"/><text x="16" y="22" text-anchor="middle" fill="white" font-family="serif" font-size="16" font-weight="bold">D</text></svg>`;

const SITE = {
  name: 'DeathNote',
  tagline: '沉浸閱讀，從這裡開始',
  description: 'DeathNote 是一個沉浸式的線上小說閱讀平台，提供懸疑、療癒、科幻等多種題材的優質原創小說。',
  url: 'https://deathnote.example.com',
  base: '/'
};

function loadBooks() {
  const booksDir = join(CONTENT, 'books');
  const books = [];
  readdirSync(booksDir).forEach(dirName => {
    const metaPath = join(booksDir, dirName, 'meta.json');
    if (!existsSync(metaPath)) return;
    const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
    const chaptersDir = join(booksDir, dirName, 'chapters');
    const chapters = [];
    if (existsSync(chaptersDir)) {
      readdirSync(chaptersDir).filter(f => f.endsWith('.md')).sort().forEach(f => {
        const raw = readFileSync(join(chaptersDir, f), 'utf-8');
        const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (!fmMatch) return;
        const frontmatter = {};
        fmMatch[1].split('\n').forEach(line => {
          const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
          if (m) frontmatter[m[1]] = isNaN(m[2]) ? m[2] : parseInt(m[2]);
        });
        const content = fmMatch[2].trim();
        chapters.push({ id: f.replace('.md',''), title: frontmatter.title||'', order: frontmatter.order||0, content, words: content.replace(/\s/g,'').length });
      });
    }
    const totalWords = chapters.reduce((s,ch) => s + ch.words, 0) || meta.synopsis.length * 2;
    books.push({ ...meta, words: totalWords, chapters: chapters.length, _chapters: chapters.sort((a,b) => a.order - b.order) });
  });
  return books.sort((a,b) => b.rating - a.rating);
}

const BOOKS = loadBooks();
const HOT_KEYWORDS = ['死亡筆記本','量子夢境','龍之紀元','懸疑小說','療癒系','科幻','完結推薦','新書上架'];

function bookCoverSeed(book) {
  let hash = 0;
  const str = book.id + book.title + book.author;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
function coverDecorations(seed) {
  const shapes = [];
  let s = seed;
  const next = () => { s = (s * 1664525 + 1013904223) | 0; return Math.abs(s); };
  for (let i = 0; i < 6; i++) {
    const type = next() % 3;
    const x = next() % 80 + 10;
    const y = next() % 80 + 10;
    const size = next() % 40 + 15;
    const opacity = ((next() % 20) + 5) / 100;
    if (type === 0) shapes.push(`radial-gradient(circle,rgba(255,255,255,${opacity}) 0%,transparent 70%) ${x}% ${y}% / ${size}% ${size}%`);
    else if (type === 1) shapes.push(`linear-gradient(${next()%360}deg,rgba(255,255,255,${opacity}),transparent) ${x}% ${y}% / ${size}% ${size}%`);
    else shapes.push(`radial-gradient(circle,rgba(0,0,0,${opacity}) 0%,transparent 70%) ${x}% ${y}% / ${size}% ${size}%`);
  }
  return shapes.join(',');
}
function coverHTML(book, w, h, fs, showTag, showTitle = true, showSynopsis = false) {
  const hue = book.color ? parseInt(book.color.slice(1), 16) % 360 : 210;
  const hue2 = (hue + 40) % 360;
  const seed = bookCoverSeed(book);
  const decorations = coverDecorations(seed);
  const tag = showTag ? `<span class="cover-tag">${book.tags[0]||''}</span>` : '';
  const titleBlock = showTitle ? `
    <h2 class="cover-title">${book.title}</h2>
    <p class="cover-author">${book.author}</p>
  ` : '';
  const synopsisBlock = showSynopsis && book.synopsis ? `
    <p class="cover-synopsis">${book.synopsis.length > 80 ? book.synopsis.slice(0,80) + '...' : book.synopsis}</p>
  ` : '';
  return `<div class="css-book-cover" style="--hue:${hue};--hue2:${hue2};width:${w}px;height:${h}px;font-size:${fs||16}px;background:linear-gradient(160deg,hsl(${hue},75%,60%),hsl(${hue2},65%,35%))">
    <div class="cover-decorations" style="background-image:${decorations};background-repeat:no-repeat"></div>
    <div class="cover-content">
      ${tag}
      ${titleBlock}
      ${synopsisBlock}
    </div>
  </div>`;
}
function coverMini(book, w, h) {
  const hue = book.color ? parseInt(book.color.slice(1), 16) % 360 : 210;
  const hue2 = (hue + 40) % 360;
  const seed = bookCoverSeed(book);
  const decorations = coverDecorations(seed);
  return `<div class="css-book-cover css-book-cover-mini" style="--hue:${hue};--hue2:${hue2};width:${w}px;height:${h}px;background:linear-gradient(135deg,hsl(${hue},75%,60%),hsl(${hue2},65%,35%))">
    <div class="cover-decorations" style="background-image:${decorations};background-repeat:no-repeat"></div>
    <div class="cover-content"><h2 class="cover-title" style="font-size:14px">${book.title.slice(0,2)}</h2></div>
  </div>`;
}
function tagHTML(book) {
  return book.tags.slice(0,2).map(t => `<span class="tag" style="background:color-mix(in srgb,${book.color} 12%,transparent);color:${book.color}">${t}</span>`).join('');
}
function rankBadge(i) { return i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'rank-other'; }

function footerNav(active) {
  return `<nav class="footer-nav glass-warm" role="navigation" aria-label="底部導航" style="padding:12px 32px;padding-bottom:calc(12px + env(safe-area-inset-bottom))">
    <button class="footer-tab ${active==='home'?'active':''} ${active!=='home'?'inactive':''}" data-tab="home" onclick="switchTab('home')" aria-label="拾遺">
      <svg width="24" height="24" fill="${active==='home'?'currentColor':'none'}" stroke="${active==='home'?'none':'currentColor'}" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
      <span>拾遺</span>
    </button>
    <button class="footer-tab ${active==='books'?'active':''} ${active!=='books'?'inactive':''}" data-tab="books" onclick="switchTab('books')" aria-label="書閣">
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>
      <span>書閣</span>
    </button>
    <button class="footer-tab ${active==='search'?'active':''} ${active!=='search'?'inactive':''}" data-tab="search" onclick="switchTab('search')" aria-label="尋字">
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      <span>尋字</span>
    </button>
    <button class="footer-tab ${active==='profile'?'active':''} ${active!=='profile'?'inactive':''}" data-tab="profile" onclick="switchTab('profile')" aria-label="我的">
      <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
      <span>我的</span>
    </button>
  </nav>`;
}

function headerHTML() {
  return `<header class="header" role="banner">
    <div class="header-inner">
      <a href="./" class="logo" aria-label="${SITE.name} 首頁">${SVG_ICON}<span class="logo-text">${SITE.name}</span></a>
      <button class="btn-press" onclick="window.location.href='/search'" aria-label="搜尋小說">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </button>
    </div>
  </header>`;
}

function breadcrumbHTML(items) {
  return `<nav style="padding:8px 16px;font-size:12px;color:var(--color-text-secondary)" aria-label="breadcrumb">${items.map((item,i)=>`<span style="${i===items.length-1?'color:var(--color-text-primary);font-weight:500':''}">${i>0?' › ':''}${item.url?`<a href="${item.url}" style="color:var(--color-text-secondary)">${item.label}</a>`:item.label}</span>`).join('')}</nav>`;
}

function backHeader(title) {
  return `<div class="cat-header"><div class="cat-header-inner">
    <button class="btn-press" onclick="history.back()" aria-label="返回上一頁">
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
    <h1>${title}</h1></div></div>`;
}

function adHTML() { return ''; }

function pageHTML(title, desc, accent, body, jsonLd, path, isHomepage = false, ogType = 'website') {
  const canonical = `${SITE.url}${path||'/'}`;
  const siteJsonLd = isHomepage ? {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SITE.name,
    "description": SITE.description,
    "url": SITE.url,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${SITE.url}/search?q={search_term_string}`
    }
  } : null;
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover">
<meta name="theme-color" content="${accent||'#F8F9FA'}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="${SITE.name}">
<meta name="description" content="${desc||SITE.description}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc||SITE.description}">
<meta property="og:type" content="${ogType}">
<meta property="og:url" content="${canonical}">
<meta property="og:locale" content="zh_Hant">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc||SITE.description}">
<base href="${SITE.base}/">
<title>${title}</title>
<link rel="icon" href="${SITE.base}/favicon.svg">
<link rel="manifest" href="${SITE.base}/manifest.json">
<style>${css}</style>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
${siteJsonLd ? `<script type="application/ld+json">${JSON.stringify(siteJsonLd)}</script>` : ''}
</head>
<body>
${body}
<script>
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js'))}
</script>
</body></html>`;
}

function fixPaths(html) {
  return html
    .replace(/href="\/book\//g,'href="book/').replace(/href="\/category\//g,'href="category/')
    .replace(/href="\/search"/g,'href="search"').replace(/href="\/legal\//g,'href="legal/')
    .replace(/href="\/manifest.json"/g,'href="manifest.json"').replace(/href="\/sw.js"/g,'href="sw.js"')
    .replace(/href="\/sitemap.xml"/g,'href="sitemap.xml"').replace(/href="\/robots.txt"/g,'href="robots.txt"')
    .replace(/href="\/"/g,'href="./"').replace(/location\.href='\/search'/g,"location.href='search'")
    .replace(/location\.href='\/'/g,"location.href='./'").replace(/register\('\/sw.js'\)/g,"register('sw.js')")
    .replace(/onclick="window\.location\.href='\/search'"/g,"onclick=\"window.location.href='search'\"")
    .replace(/onclick="window\.location\.href='\/'"/g,"onclick=\"window.location.href='./'\"");
}

function write(path, content) {
  const full = join(DIST, path);
  const dir = join(DIST, path.split('/').slice(0,-1).join('/'));
  if (dir && !existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(full, fixPaths(content));
}

// ===== HOME =====
(function() {
  const all = [...BOOKS].sort((a,b)=>b.rating-a.rating);
  const newest = [...BOOKS].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const done = BOOKS.filter(b=>b.status==='completed').sort((a,b)=>b.rating-a.rating);
  const totalWords = BOOKS.reduce((s,b)=>s+b.words,0);
  const totalChapters = BOOKS.reduce((s,b)=>s+b.chapters,0);

  const body = `<div class="app-container" style="max-width:430px;margin:0 auto;min-height:100dvh;background:var(--bg-app);position:relative;overflow:hidden;display:flex;flex-direction:column">
  <main id="main-scroll" class="hide-scrollbar" style="flex:1;overflow-y:auto;padding-bottom:100px;-webkit-overflow-scrolling:touch">
    <div id="home-content" class="tab-content" style="padding:48px 24px 0">
      <p style="font-size:12px;font-weight:600;letter-spacing:0.2em;color:var(--text-muted);margin-bottom:var(--spacing-2)">${new Date().toLocaleDateString('zh-HK', {month:'short',day:'numeric',weekday:'short'})}</p>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:var(--spacing-8)">
        <h1 style="font-family:var(--font-serif);font-size:36px;font-weight:700;letter-spacing:0.1em;color:var(--text-main)">拾遺</h1>
        <button onclick="switchTab('profile')" style="width:36px;height:36px;border-radius:50%;border:1px solid var(--border-medium);display:flex;align-items:center;justify-content:center;cursor:pointer;background:var(--bg-base)">
          <svg width="16" height="16" style="color:var(--accent)" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        </button>
      </div>
      
      <a href="book/${BOOKS[0].id}" class="hero-card-fusion card-active" style="display:block;text-decoration:none">
        <div class="card-bg"></div>
        <div class="card-content">
          <p class="card-label">主編推薦</p>
          <h2 class="card-title">在喧囂中<br>尋找內心寧靜</h2>
          <div class="card-book">
            <span class="book-spine" style="font-family:var(--font-serif);font-size:18px;font-weight:700;color:var(--text-main)">${BOOKS[0].title.slice(0,2)}</span>
          </div>
          <div class="card-footer glass-warm">
            <div>
              <p class="card-footer-title">${BOOKS[0].title}</p>
              <p class="card-footer-author">${BOOKS[0].author}</p>
            </div>
            <button class="card-action" onclick="event.preventDefault();event.stopPropagation();toggleFavorite('${BOOKS[0].id}', '${BOOKS[0].title}')" id="fav-btn-${BOOKS[0].id}">收藏</button>
          </div>
        </div>
      </a>
      
      <div style="margin-top:var(--spacing-10);margin-bottom:var(--spacing-3);padding-bottom:var(--spacing-3);border-bottom:1px solid var(--border-light)">
        <h3 style="font-family:var(--font-serif);font-size:20px;font-weight:700;letter-spacing:0.05em">本週細讀</h3>
      </div>
      
      <a href="book/${BOOKS[1].id}" class="list-item-fusion card-active" style="text-decoration:none;display:flex;align-items:center;gap:16px;padding-bottom:20px;border-bottom:1px solid var(--border-light)">
        <div class="item-cover" style="background:#d8cfc4;flex-shrink:0">
          <span class="book-spine" style="font-family:var(--font-serif);font-size:10px;color:var(--text-main)">${BOOKS[1].title.slice(0,2)}</span>
        </div>
        <div style="flex:1;min-width:0">
          <h4 style="font-family:var(--font-serif);font-size:17px;font-weight:700;color:var(--text-main);margin-bottom:4px">${BOOKS[1].title}</h4>
          <p style="font-size:12px;color:var(--text-muted)">${BOOKS[1].author} · ${BOOKS[1].tags[0]}</p>
        </div>
        <span class="item-btn item-btn-outline" style="flex-shrink:0">閱讀</span>
      </a>
      
      <a href="book/${BOOKS[2]?.id || BOOKS[0].id}" class="list-item-fusion card-active" style="text-decoration:none;display:flex;align-items:center;gap:16px;padding-bottom:20px;border-bottom:1px solid var(--border-light)">
        <div class="item-cover" style="background:#444a47;flex-shrink:0">
          <span class="book-spine" style="font-family:var(--font-serif);font-size:10px;color:var(--bg-reading)">${BOOKS[2]?.title.slice(0,2) || '月度'}</span>
        </div>
        <div style="flex:1;min-width:0">
          <h4 style="font-family:var(--font-serif);font-size:17px;font-weight:700;color:var(--text-main);margin-bottom:4px">${BOOKS[2]?.title || '月亮與六便士'}</h4>
          <p style="font-size:12px;color:var(--text-muted)">${BOOKS[2]?.author || '毛姆'} · ${BOOKS[2]?.tags[0] || '英國文學'}</p>
        </div>
        <span class="item-btn item-btn-filled" style="flex-shrink:0">已讀</span>
      </a>
      
      <!-- 熱門精選 -->
      <div style="margin-top:40px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border-light)">
        <h3 style="font-family:var(--font-serif);font-size:20px;font-weight:700;letter-spacing:0.05em">🔥 熱門精選</h3>
      </div>
      <div style="display:flex;gap:16px;overflow-x:auto;padding-bottom:16px;-webkit-overflow-scrolling:touch;scrollbar-width:none;-ms-overflow-style:none;touch-action:pan-x">
        ${BOOKS.slice(0,6).map(b=>`<a href="book/${b.id}" class="fusion-card card-active" style="flex-shrink:0;width:120px;text-decoration:none;-webkit-user-select:none;user-select:none">
          <div style="width:120px;height:170px;background:${b.color}20;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;position:relative;overflow:hidden;border:1px solid var(--border-light)">
            <span class="book-spine" style="font-family:var(--font-serif);font-size:14px;font-weight:700;color:${b.color}">${b.title.slice(0,2)}</span>
            <span style="position:absolute;top:8px;right:8px;font-size:10px;padding:2px 6px;border-radius:999px;background:${b.status==='completed'?'#A3B18A':'#7DB8F0'};color:white;font-weight:600">${b.status==='completed'?'完結':'連載'}</span>
          </div>
          <p style="font-family:var(--font-serif);font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.title}</p>
          <p style="font-size:11px;color:var(--text-muted)">${b.author}</p>
        </a>`).join('')}
      </div>
      
      <!-- 排行榜 -->
      <div style="margin-top:40px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border-light)">
        <h3 style="font-family:var(--font-serif);font-size:20px;font-weight:700;letter-spacing:0.05em">🏆 排行榜</h3>
      </div>
      <div style="margin-bottom:16px">
        ${all.slice(0,5).map((b,i)=>`<a href="book/${b.id}" class="rank-item-fusion card-active" style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-light);text-decoration:none">
          <span style="font-family:var(--font-serif);font-size:20px;font-weight:700;color:${i<3?b.color:'var(--text-muted)'};width:28px;text-align:center">${i+1}</span>
          <div style="width:44px;height:60px;background:${b.color}20;border-radius:6px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-light);flex-shrink:0">
            <span class="book-spine" style="font-size:9px;color:${b.color}">${b.title.slice(0,2)}</span>
          </div>
          <div style="flex:1;min-width:0">
            <p style="font-family:var(--font-serif);font-size:15px;font-weight:600;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.title}</p>
            <p style="font-size:12px;color:var(--text-muted)">${b.author}</p>
          </div>
          <span style="font-size:13px;font-weight:700;color:${b.color}">★ ${b.rating}</span>
        </a>`).join('')}
      </div>
      
      <!-- 最新更新 -->
      <div style="margin-top:40px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border-light)">
        <h3 style="font-family:var(--font-serif);font-size:20px;font-weight:700;letter-spacing:0.05em">✨ 最新更新</h3>
      </div>
      <div style="margin-bottom:16px">
        ${BOOKS.filter(b=>b.status==='ongoing').slice(0,4).map(b=>{
          const ch = b._chapters ? b._chapters[b._chapters.length-1] : null;
          return `<a href="book/${b.id}/${ch?ch.id:''}" class="list-item-fusion card-active" style="text-decoration:none;padding:12px 0;border-bottom:1px solid var(--border-light)">
          <div style="width:48px;height:64px;background:${b.color}20;border-radius:6px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-light);flex-shrink:0">
            <span class="book-spine" style="font-size:9px;color:${b.color}">${b.title.slice(0,2)}</span>
          </div>
          <div style="flex:1;min-width:0">
            <p style="font-family:var(--font-serif);font-size:15px;font-weight:600;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.title}</p>
            <p style="font-size:12px;color:var(--text-muted)">${ch?ch.title:'新章節'} · ${b.updated}</p>
          </div>
          <span style="font-size:10px;padding:4px 10px;border-radius:999px;background:rgba(59,130,246,.12);color:#3B82F6;font-weight:600;flex-shrink:0">連載中</span>
        </a>`}).join('')}
      </div>
      
      <!-- 分類題材 -->
      <div style="margin-top:40px;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid var(--border-light)">
        <h3 style="font-family:var(--font-serif);font-size:20px;font-weight:700;letter-spacing:0.05em">📚 分類題材</h3>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px">
        ${CATEGORIES.slice(0,4).map(c=>`<a href="category/${c.id}" class="category-card card-active" style="padding:20px;background:${c.color}10;border:1px solid var(--border-light);border-radius:16px;text-decoration:none;text-align:center">
          <p style="font-size:28px;margin-bottom:8px">${c.icon}</p>
          <p style="font-family:var(--font-serif);font-size:16px;font-weight:700;color:var(--text-main)">${c.name}</p>
        </a>`).join('')}
      </div>
      
      <div style="height:var(--spacing-16)"></div>
    </div>
    
    <div id="toc-view" class="view">
      <div class="view-header">
        <button class="view-back" onclick="switchView('home')">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h2 class="view-title" id="toc-view-title"></h2>
      </div>
      <ul class="toc-list" id="toc-list"></ul>
    </div>
    
    <div id="read-view" class="view">
      <div class="view-header">
        <button class="view-back" onclick="switchView('toc')">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h2 class="view-title" id="read-view-title"></h2>
      </div>
      <div class="reader-content" id="read-content"></div>
    </div>
    
    
    
    <div id="books-content" class="tab-content hidden">
      <section class="home-hero" style="min-height:200px;padding:var(--spacing-8) var(--spacing-6)">
        <div class="hero-content">
          <div class="hero-badge">📚 我的書閣</div>
          <p style="color:var(--text-muted);font-size:14px;margin-top:8px">${BOOKS.length} 本作品</p>
        </div>
      </section>
      <section class="home-section" aria-label="全部作品">
        <div class="book-grid" style="padding:0 var(--spacing-4)">
          ${BOOKS.map(b=>`<a href="book/${b.id}" class="fusion-card card-active" style="flex-shrink:0;width:120px;text-decoration:none;-webkit-user-select:none;user-select:none">
            <div style="width:120px;height:170px;background:${b.color}20;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;position:relative;overflow:hidden;border:1px solid var(--border-light)">
              <span class="book-spine" style="font-family:var(--font-serif);font-size:14px;font-weight:700;color:${b.color}">${b.title.slice(0,2)}</span>
              <span style="position:absolute;top:8px;right:8px;font-size:10px;padding:2px 6px;border-radius:999px;background:${b.status==='completed'?'#A3B18A':'#7DB8F0'};color:white;font-weight:600">${b.status==='completed'?'完結':'連載'}</span>
            </div>
            <div class="book-card-info">
              <div class="book-card-title" style="font-family:var(--font-serif);font-size:14px;font-weight:600;color:var(--text-main);margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${b.title}</div>
              <div class="book-card-author" style="font-size:11px;color:var(--text-muted)">${b.author}</div>
              <div class="book-card-meta" style="display:flex;justify-content:space-between;font-size:11px;color:var(--text-muted);margin-top:4px">
                <span style="color:${b.color}">★ ${b.rating}</span>
              </div>
            </div>
          </a>`).join('')}
        </div>
      </section>
    </div>
    
    <div id="profile-content" class="tab-content hidden">
      <section class="home-hero" style="min-height:200px;padding:var(--spacing-8) var(--spacing-6)">
        <div class="hero-content">
          <div class="hero-avatar" style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--color-primary-dark));display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 12px">👤</div>
          <div class="hero-badge">書蟲</div>
          <p style="color:var(--text-muted);font-size:14px;margin-top:8px">享受閱讀的每一刻</p>
        </div>
      </section>
      <section class="home-section" aria-label="設定">
        <div class="settings-list">
          <div class="settings-item" onclick="showHistory()">
            <span>📖</span><span>閱讀記錄</span><span style="color:var(--text-muted)" id="history-count">0</span>
          </div>
          <div class="settings-item" onclick="showCollection()">
            <span>❤️</span><span>我的收藏</span><span style="color:var(--text-muted)" id="fav-count">0</span>
          </div>
        </div>
      </section>
      <section class="home-section" aria-label="瀏覽歷史" id="history-section" style="display:none">
        <div style="margin-bottom:16px;padding:0 4px">
          <button onclick="backToSettings()" style="display:flex;align-items:center;gap:8px;background:none;border:none;cursor:pointer;color:var(--accent);font-size:14px;margin-bottom:16px;padding:0">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            返回
          </button>
          <h3 style="font-family:var(--font-serif);font-size:18px;font-weight:700;letter-spacing:0.05em;margin-bottom:16px">📖 瀏覽記錄</h3>
          <div id="history-list" class="settings-list"></div>
          <div id="history-empty" style="text-align:center;padding:40px 20px;color:var(--text-muted)">
            <p style="font-size:48px;margin-bottom:12px">📚</p>
            <p>尚無瀏覽記錄</p>
          </div>
        </div>
      </section>
      <section class="home-section" aria-label="我的收藏" id="collection-section" style="display:none">
        <div style="margin-bottom:16px;padding:0 4px">
          <button onclick="backToSettings()" style="display:flex;align-items:center;gap:8px;background:none;border:none;cursor:pointer;color:var(--accent);font-size:14px;margin-bottom:16px;padding:0">
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            返回
          </button>
          <h3 style="font-family:var(--font-serif);font-size:18px;font-weight:700;letter-spacing:0.05em;margin-bottom:16px">❤️ 我的收藏</h3>
          <div id="collection-list" class="settings-list"></div>
          <div id="collection-empty" style="text-align:center;padding:40px 20px;color:var(--text-muted)">
            <p style="font-size:48px;margin-bottom:12px">💝</p>
            <p>尚無收藏書籍</p>
            <p style="font-size:12px;margin-top:8px">在首頁點擊收藏按鈕即可加入</p>
          </div>
        </div>
      </section>
      <section class="home-section" aria-label="偏好設定">
        <div class="settings-list">
          <div class="settings-item">
            <span>🌙</span><span>深色模式</span>
            <label class="toggle"><input type="checkbox" id="dark-mode-toggle" onchange="toggleDarkMode()"><span class="toggle-slider"></span></label>
          </div>
          <div class="settings-item">
            <span>🔤</span><span>字體大小</span>
            <span style="color:var(--text-muted);font-size:12px">中</span>
          </div>
        </div>
      </section>
      <section class="home-section" aria-label="關於">
        <div class="settings-list">
          <a href="legal/privacy" class="settings-item">
            <span>📜</span><span>隱私政策</span>
          </a>
          <a href="legal/terms" class="settings-item">
            <span>📋</span><span>使用條款</span>
          </a>
          <div class="settings-item">
            <span>ℹ️</span><span>版本</span><span style="color:var(--text-muted)">1.0.0</span>
          </div>
        </div>
      </section>
    </div>
    
    ${footerNav('home')}
  </main></div>
  <script>
  var booksData = ${JSON.stringify(BOOKS.map(b => ({ id: b.id, title: b.title, author: b.author, color: b.color, chapters: b._chapters || [] })))};
  var chaptersData = ${JSON.stringify(BOOKS.flatMap(b => (b._chapters || []).map(c => ({ id: c.id, bookId: b.id, title: c.title }))))};
  
  // Initialize localStorage data
  function getHistory() { return JSON.parse(localStorage.getItem('browsingHistory') || '[]'); }
  function getFavorites() { return JSON.parse(localStorage.getItem('favorites') || '[]'); }
  
  function toggleFavorite(bookId, bookTitle) {
    var favs = getFavorites();
    var idx = favs.findIndex(function(f){return f.id === bookId});
    var btn = document.getElementById('fav-btn-' + bookId);
    if (idx > -1) {
      favs.splice(idx, 1);
      if (btn) btn.textContent = '收藏';
      if (btn) btn.style.color = 'var(--accent)';
    } else {
      favs.unshift({id: bookId, title: bookTitle, time: Date.now()});
      if (btn) btn.textContent = '已收藏';
      if (btn) btn.style.color = '#e74c3c';
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
    updateCounts();
  }
  
  function updateCounts() {
    var favCount = getFavorites().length;
    var histCount = getHistory().length;
    var favEl = document.getElementById('fav-count');
    var histEl = document.getElementById('history-count');
    if (favEl) favEl.textContent = favCount;
    if (histEl) histEl.textContent = histCount;
    
    // Update favorite button state
    var favs = getFavorites();
    booksData.forEach(function(b) {
      var btn = document.getElementById('fav-btn-' + b.id);
      if (btn && favs.find(function(f){return f.id === b.id})) {
        btn.textContent = '已收藏';
        btn.style.color = '#e74c3c';
      }
    });
  }
  
  function showHistory() {
    document.querySelectorAll('.home-section').forEach(function(el){el.style.display = 'none'});
    document.getElementById('history-section').style.display = '';
    var history = getHistory();
    var list = document.getElementById('history-list');
    var empty = document.getElementById('history-empty');
    if (history.length === 0) {
      list.innerHTML = '';
      empty.style.display = '';
    } else {
      empty.style.display = 'none';
      list.innerHTML = history.slice(0, 20).map(function(h) {
        return '<a href="book/' + h.id + '" class="settings-item"><span>📖</span><span>' + h.title + '</span><span style="color:var(--text-muted);font-size:12px">' + new Date(h.time).toLocaleDateString('zh-HK') + '</span></a>';
      }).join('');
    }
  }
  
  function showCollection() {
    document.querySelectorAll('.home-section').forEach(function(el){el.style.display = 'none'});
    document.getElementById('collection-section').style.display = '';
    var favs = getFavorites();
    var list = document.getElementById('collection-list');
    var empty = document.getElementById('collection-empty');
    
    if (favs.length === 0) {
      list.innerHTML = '';
      empty.style.display = '';
    } else {
      empty.style.display = 'none';
      // Sort by time (newest first)
      favs.sort(function(a,b){return b.time - a.time});
      list.innerHTML = favs.map(function(f) {
        return '<a href="book/' + f.id + '" class="settings-item"><span>❤️</span><span>' + f.title + '</span><span style="color:var(--text-muted);font-size:12px">' + new Date(f.time).toLocaleDateString('zh-HK') + '</span></a>';
      }).join('');
    }
  }
  
  function backToSettings() {
    document.getElementById('history-section').style.display = 'none';
    document.getElementById('collection-section').style.display = 'none';
    document.querySelectorAll('.home-section').forEach(function(el){el.style.display = ''});
  }
  
  function switchTab(tab) {
    document.querySelectorAll('.footer-tab').forEach(function(el){el.classList.remove('active')});
    var btn = document.querySelector('.footer-tab[data-tab="'+tab+'"]');
    if(btn){btn.classList.add('active')}
    document.querySelectorAll('.tab-content').forEach(function(el){el.classList.add('hidden')});
    var content = document.getElementById(tab+'-content');
    if(content){content.classList.remove('hidden')}
    document.getElementById('main-scroll').scrollTop = 0;
    // Show footer nav when switching tabs
    var footerNav = document.querySelector('.footer-nav');
    if(footerNav){footerNav.style.display = ''}
    if (tab === 'profile') {
      backToSettings();
      updateCounts();
    }
  }
  
  function toggleDarkMode() {
    var isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDark);
  }
  
  // Track previous tab for back navigation
  var previousTab = 'home';
  
  function switchView(view, bookId) {
    document.querySelectorAll('.view').forEach(function(el){el.classList.remove('active')});
    
    if (view === 'home') {
      // Restore tab content and footer nav
      document.querySelectorAll('.tab-content').forEach(function(el){el.classList.remove('hidden')});
      var footerNav = document.querySelector('.footer-nav');
      if(footerNav){footerNav.style.display = ''}
      document.querySelectorAll('.home-section').forEach(function(el){el.style.display = ''});
      // Switch to previous tab
      switchTab(previousTab);
      return;
    }
    
    // Hide tab content and footer nav when entering toc/read
    document.querySelectorAll('.tab-content').forEach(function(el){el.classList.add('hidden')});
    var footerNav = document.querySelector('.footer-nav');
    if(footerNav){footerNav.style.display = 'none'}
    document.querySelectorAll('.home-section').forEach(function(el){el.style.display = 'none'});
    
    if (view === 'toc' && bookId) {
      // Save current tab before entering toc
      var currentTab = document.querySelector('.footer-tab.active');
      if(currentTab){
        previousTab = currentTab.getAttribute('data-tab') || 'home';
      }
      
      var book = booksData.find(function(b){return b.id === bookId});
      if (book) {
        document.getElementById('toc-view-title').textContent = book.title;
        var tocList = document.getElementById('toc-list');
        tocList.innerHTML = book.chapters.map(function(ch, i) {
          return '<li class="toc-item" onclick="switchView(&quot;read&quot;, &quot;' + book.id + '&quot;, &quot;' + ch.id + '&quot;)">' +
            '<span class="toc-chapter">' + (i + 1) + '</span>' +
            '<span class="toc-title">' + ch.title + '</span>' +
          '</li>';
        }).join('');
        document.getElementById('toc-view').classList.add('active');
      }
    }
    
    if (view === 'read' && bookId) {
      var book = booksData.find(function(b){return b.id === bookId});
      if (book && book.chapters.length > 0) {
        var chapterId = arguments[2] || book.chapters[0].id;
        var chapter = book.chapters.find(function(ch){return ch.id === chapterId});
        if (chapter) {
          document.getElementById('read-view-title').textContent = chapter.title;
          var content = chapter.content.split('\\n\\n').map(function(p) {
            return '<p>' + p + '</p>';
          }).join('');
          document.getElementById('read-content').innerHTML = '<h1>' + chapter.title + '</h1>' + content;
          document.getElementById('read-view').classList.add('active');
        }
      }
    }
  }
  <\/script>`;

  write('index.html', pageHTML(`${SITE.name} - ${SITE.tagline}`, SITE.description, '#F8F9FA', body, null, '/', true));
})();

// ===== SEARCH =====
(function() {
const body = `<div class="app-container"><main class="page">
    ${backHeader('搜尋')}
    <div class="search-hero">
      <div class="search-box">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input type="search" id="search-input" placeholder="搜尋小說、作者..." oninput="doSearch(this.value)" aria-label="搜尋">
      </div>
    </div>
    <div id="hot-keywords" class="hot-section">
      <div class="hot-title">熱門搜尋</div>
      <div class="hot-tags">${HOT_KEYWORDS.map(kw=>`<button class="hot-tag btn-press" onclick="searchKW('${kw}')" aria-label="搜尋${kw}">${kw}</button>`).join('')}</div>
    </div>
    <div id="search-results" class="results-section hidden"></div>
    ${footerNav('search')}
  </main></div>
  <script>
  var booksData=${JSON.stringify(BOOKS.map(b=>({id:b.id,title:b.title,author:b.author,tags:b.tags,color:b.color,rating:b.rating})))};
  function searchKW(kw){document.getElementById('search-input').value=kw;doSearch(kw)}
  function doSearch(q){
    var hotDiv=document.getElementById('hot-keywords');
    var resDiv=document.getElementById('search-results');
    if(!q.trim()){hotDiv.classList.remove('hidden');resDiv.classList.add('hidden');return}
    hotDiv.classList.add('hidden');resDiv.classList.remove('hidden');
    var ql=q.toLowerCase();
    var results=booksData.filter(function(b){return b.title.toLowerCase().includes(ql)||b.author.toLowerCase().includes(ql)||b.tags.some(function(t){return t.toLowerCase().includes(ql)})});
    resDiv.innerHTML='<div class="result-count">找到 '+results.length+' 個結果</div>'+
    results.map(function(b){return '<a href="${SITE.base}/book/'+b.id+'" class="result-item btn-press"><div class="css-book-cover css-book-cover-mini" style="--hue:'+(b.color?parseInt(b.color.slice(1),16)%360:210)+';--hue2:'+(b.color?(parseInt(b.color.slice(1),16)%360+40)%360:250)+';width:48px;height:64px"><div class="cover-content"><h2 class="cover-title" style="font-size:12px">'+b.title.slice(0,2)+'</h2></div></div><div class="result-info"><div class="result-title">'+b.title+'</div><div class="result-author">'+b.author+'</div><div class="result-tags">'+b.tags.slice(0,2).join(' · ')+'</div></div><span style="font-size:12px;font-weight:700;color:'+b.color+'">'+b.rating+'</span></a>'}).join('')||'<p style="text-align:center;color:var(--color-text-tertiary);padding:32px 0">找不到相關結果</p>';
  }
  <\/script>`;

  const searchJsonLd = {
    "@context":"https://schema.org","@type":"SearchResultsPage","name":"搜尋結果",
    "url":`${SITE.url}/search`
  };
  write('search/index.html', pageHTML('搜尋 - '+SITE.name, '搜尋小說、作者、關鍵字', '#F8F9FA', body, searchJsonLd, '/search'));
})();

// ===== CATEGORIES =====
CATEGORIES.forEach(cat => {
  const catBooks = BOOKS.filter(b => b.category === cat.id);
  const body = `<div class="app-container"><main class="page">${backHeader(cat.name+'小說')}
    ${breadcrumbHTML([{label:SITE.name,url:`${SITE.base}/`},{label:cat.name+'小說'}])}
    <div class="cat-list">${catBooks.length ? catBooks.map(b =>
      `<a href="${SITE.base}/book/${b.id}" class="cat-book card-hover btn-press">${coverMini(b,80,112)}
        <div class="cat-book-info"><div><div class="cat-book-title">${b.title}</div>
        <div class="cat-book-author">${b.author}</div>
        <div class="cat-book-tags">${tagHTML(b)}</div></div>
        <div class="cat-book-meta"><span>${b.words.toLocaleString()} 字</span>
        <span style="color:${b.color};font-weight:700">${b.rating} 分</span></div></div></a>`
    ).join('') + adHTML() : '<div style="text-align:center;padding:64px 0;color:var(--color-text-tertiary)"><p style="font-size:32px;margin-bottom:8px" aria-hidden="true">📭</p><p>此分類暫無作品</p></div>'}</div>
  </main></div>`;

  const catJsonLd = {
    "@context":"https://schema.org","@type":"CollectionPage","name":`${cat.name}小說`,
    "description":`瀏覽${cat.name}題材的小說`,
    "url":`${SITE.url}/category/${cat.id}`,
    "about":{"@type":"Thing","name":cat.name}
  };
  write(`category/${cat.id}/index.html`, pageHTML(`${cat.name}小說 - ${SITE.name}`, `瀏覽${cat.name}題材的小說`, cat.color, body, catJsonLd, `/category/${cat.id}`));
});

// ===== BOOK DETAIL =====
BOOKS.forEach(book => {
  const cat = CATEGORIES.find(c => c.id === book.category);
  const bookChapters = book._chapters || [];

  const jsonLd = {
    "@context":"https://schema.org","@type":"Book","name":book.title,
    "author":{"@type":"Person","name":book.author},"genre":cat?cat.name:book.category,
    "numberOfPages":book.chapters,"bookFormat":"EBook",
    "datePublished":book.date,"dateModified":book.updated,
    "aggregateRating":{"@type":"AggregateRating","ratingValue":book.rating.toString(),"bestRating":"10","ratingCount":"1"},
    "description":book.synopsis
  };

  const tocHTML = bookChapters.length > 50 ?
    `<select class="toc-select" onchange="filterTOC(this.value)" aria-label="章節分組">${
      Array.from({length:Math.ceil(bookChapters.length/50)},(_,i)=>{
        const s=i*50+1, e=Math.min((i+1)*50,bookChapters.length);
        return `<option value="${i}">${s}-${e} 章</option>`;
      }).join('')
    }</select>` : '';

  const body = `<div class="app-container"><main class="page">${backHeader(book.title)}
    ${breadcrumbHTML([{label:SITE.name,url:`${SITE.base}/`},{label:cat?cat.name:'分類',url:`${SITE.base}/category/${book.category}`},{label:book.title}])}
    <div class="detail-hero">
      <div class="detail-hero-bg" style="background:${book.color}" aria-hidden="true"></div>
      <div class="detail-hero-content">
        ${coverHTML(book,112,160,18)}
        <div class="detail-info"><h2 class="detail-title">${book.title}</h2>
        <div class="detail-author" style="color:rgba(255,255,255,.85)">${book.author}</div>
        <div class="detail-tags">${tagHTML(book)}</div>
        <div class="detail-meta" style="color:rgba(255,255,255,.75)"><span>${book.words.toLocaleString()} 字</span><span>${book.chapters} 章</span>
        <span style="color:${book.status==='completed'?'#A3B18A':'#7DB8F0'}">${book.status==='completed'?'已完結':'連載中'}</span></div></div>
      </div>
    </div>
    <section class="synopsis" aria-label="小說簡介"><h2 style="font-size:16px;font-weight:700;margin-bottom:8px">簡介</h2>
    <p class="synopsis-text" id="synopsis-text">${book.synopsis}</p>
    <button class="synopsis-toggle btn-press" style="color:${book.color}" onclick="toggleSynopsis()" aria-label="展開或收合簡介">展開全部</button></section>
    ${adHTML()}
    <section class="toc" aria-label="章節目錄"><div class="toc-title">章節目錄</div>${tocHTML}
    <div class="toc-list-wrap"><div id="toc-list">${bookChapters.map(ch =>
      `<a href="${SITE.base}/book/${book.id}/${ch.id}" class="toc-item btn-press"><span>${ch.title}</span><span>${ch.words.toLocaleString()} 字</span></a>`
    ).join('')}</div></div></section>
    <div style="height:80px" aria-hidden="true"></div>
    <div class="sticky-cta">
      <a href="${SITE.base}/book/${book.id}/${bookChapters.length?bookChapters[0].id:''}" class="btn-primary btn-press" style="background:${book.color}" aria-label="開始閱讀 ${book.title}">開始閱讀</a>
      <button class="btn-secondary btn-press fav-toggle-btn" data-book-id="${book.id}" data-book-title="${book.title}" aria-label="收藏">收藏</button>
    </div>
  </main></div>
  <script>
  // Favorites functions - ensure these are available globally
  function getFavorites() { return JSON.parse(localStorage.getItem('favorites') || '[]'); }
  function saveFavorites(favs) { localStorage.setItem('favorites', JSON.stringify(favs)); }
  window.getFavorites = getFavorites;
  
  window.toggleFavorite = function(bookId, bookTitle) {
    try {
      var favs = getFavorites();
      var idx = favs.findIndex(function(f){return f.id === bookId});
      var btn = document.querySelector('.fav-toggle-btn');
      if (idx > -1) {
        favs.splice(idx, 1);
        saveFavorites(favs);
        if (btn) { btn.textContent = '收藏'; btn.style.color = ''; }
      } else {
        favs.unshift({id: bookId, title: bookTitle, time: Date.now()});
        saveFavorites(favs);
        if (btn) { btn.textContent = '已收藏'; btn.style.color = '#e74c3c'; }
      }
    } catch(e) { console.error('toggleFavorite error:', e); }
  };
  
  // Initialize immediately (script runs after body is parsed)
  (function() {
    var btn = document.querySelector('.fav-toggle-btn');
    if (btn) {
      var bookId = btn.getAttribute('data-book-id');
      var bookTitle = btn.getAttribute('data-book-title');
      
      // Click handler - use onclick for reliability
      btn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(bookId, bookTitle);
      };
      
      // Update initial state
      var favs = getFavorites();
      if (favs.some(function(f){return f.id === bookId})) {
        btn.textContent = '已收藏';
        btn.style.color = '#e74c3c';
      }
    }
  })();
  
  function toggleSynopsis(){var t=document.getElementById('synopsis-text');var b=t?t.nextElementSibling:null;if(t&&t.classList.contains('expanded')){t.classList.remove('expanded');if(b)b.textContent='展開全部'}else if(t){t.classList.add('expanded');if(b)b.textContent='收合'}}
  function filterTOC(g){var s=parseInt(g)*50;var e=Math.min(s+50,${bookChapters.length});var sl=${JSON.stringify(bookChapters.map(c=>({id:c.id,title:c.title,words:c.words})))}.slice(s,e);document.getElementById('toc-list').innerHTML=sl.map(function(ch){return '<a href="${SITE.base}/book/${book.id}/'+ch.id+'" class="toc-item btn-press"><span>'+ch.title+'</span><span>'+ch.words.toLocaleString()+' 字</span></a>'}).join('')}
  (function(){
    // Add to browsing history
    var h=JSON.parse(localStorage.getItem('browsingHistory')||'[]');h=h.filter(function(x){return x.id!=='${book.id}'});h.unshift({id:'${book.id}',title:'${book.title}',time:Date.now()});localStorage.setItem('browsingHistory',JSON.stringify(h.slice(0,50)));
  })()
  <\/script>`;

  write(`book/${book.id}/index.html`, pageHTML(`${book.title} - ${SITE.name}`, book.synopsis, book.color, body, jsonLd, `/book/${book.id}`, false, 'book'));

  // ===== CHAPTER READER =====
  bookChapters.forEach((ch, idx) => {
    const prev = idx > 0 ? bookChapters[idx-1] : null;
    const next = idx < bookChapters.length-1 ? bookChapters[idx+1] : null;
    const chapterJsonLd = {
      "@context":"https://schema.org","@type":"Chapter","name":ch.title,"position":ch.order,
      "isPartOf":{"@type":"Book","name":book.title}
    };

    const body = `<div class="app-container"><div class="reader-page">
      <div class="reader-progress" id="reader-progress"><div class="reader-progress-bar" id="reader-progress-bar" style="background:${book.color}"></div></div>
      <header class="reader-topbar" id="reader-topbar" role="banner">
        <div class="reader-topbar-inner">
          <a href="${SITE.base}/book/${book.id}" class="reader-topbar-back btn-press" aria-label="返回 ${book.title} 詳情">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </a>
          <span class="reader-topbar-title">${book.title}</span>
          <nav class="reader-topbar-breadcrumb" aria-label="breadcrumb">
            <span>${book.title}</span><span> › </span><span>${ch.title}</span>
          </nav>
        </div>
      </header>
      <main class="reader-immersive" id="reader-el">
      <article class="reader-content" id="reader-content" aria-label="${ch.title}">
        <h1>${ch.title}</h1>
        ${ch.content.split('\n').filter(p=>p.trim()).map((p,i)=>`<p data-tts-idx="${i}">${p.trim()}</p>`).join('')}
      </article>
      ${adHTML()}
      </main>
      <footer class="reader-bottombar" id="reader-bottombar" role="contentinfo">
        <div class="reader-bottombar-inner">
          ${prev ? `<a href="${SITE.base}/book/${book.id}/${prev.id}" class="nav-btn btn-press" aria-label="上一章：${prev.title}"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg><span class="nav-label">上一章</span></a>` : '<span class="nav-btn disabled" aria-label="已是第一章"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg><span class="nav-label">上一章</span></span>'}
          <div class="reader-bottombar-tools">
            <button type="button" class="tool-btn btn-press" id="tool-btn-toc" aria-label="開啟目錄">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg><span>目錄</span></button>
            <button type="button" class="tool-btn btn-press" id="tool-btn-settings" aria-label="開啟閱讀設定">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg><span>設定</span></button>
            <button type="button" class="tool-btn btn-press" id="tool-btn-tts" aria-label="開啟發聲朗讀">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 12h.01"/><circle cx="8" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg><span>朗讀</span></button>
          </div>
          ${next ? `<a href="${SITE.base}/book/${book.id}/${next.id}" class="nav-btn btn-press" aria-label="下一章：${next.title}"><span class="nav-label">下一章</span><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></a>` : '<span class="nav-btn disabled" aria-label="已是最後一章"><span class="nav-label">下一章</span><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></span>'}
        </div>
      </footer>
      <div class="sheet-overlay" id="toc-sheet" onclick="closeSheet('toc-sheet')" role="dialog" aria-modal="true" aria-label="章節目錄"><div class="sheet-content" onclick="event.stopPropagation()">
        <div class="sheet-handle" aria-hidden="true"></div>
        <div class="sheet-header"><h3>章節目錄</h3><button class="btn-press" onclick="closeSheet('toc-sheet')" aria-label="關閉目錄"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
        <div class="sheet-body">${bookChapters.map(c=>`<a href="${SITE.base}/book/${book.id}/${c.id}" class="toc-item btn-press"><span>${c.title}</span><span>${c.words.toLocaleString()} 字</span></a>`).join('')}</div>
      </div></div>
      <div class="sheet-overlay" id="settings-sheet" onclick="closeSheet('settings-sheet')" role="dialog" aria-modal="true" aria-label="閱讀設定"><div class="sheet-content" onclick="event.stopPropagation()">
        <div class="sheet-handle" aria-hidden="true"></div>
        <div class="sheet-header"><h3>閱讀設定</h3><button class="btn-press" onclick="closeSheet('settings-sheet')" aria-label="關閉設定"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
        <div class="sheet-body">
          <div class="setting-group"><div class="setting-label">外觀模式</div><div class="setting-row">
            <button class="setting-btn" style="background:#fff;color:#1A1A2E" onclick="setTheme('light')" aria-label="白底模式">白底</button>
            <button class="setting-btn" style="background:#1A1A2E;color:#D1D5DB" onclick="setTheme('night')" aria-label="夜間模式">夜間</button>
            <button class="setting-btn" style="background:#FDF6E3;color:#5C4B37" onclick="setTheme('sepia')" aria-label="護眼模式">護眼</button>
          </div></div>
          <div class="setting-group"><div class="setting-label">字體大小 <span id="font-size-val">18px</span></div>
            <div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:var(--color-text-tertiary)" aria-hidden="true">A</span>
            <input type="range" min="14" max="28" value="18" id="font-size-range" oninput="setFontSize(this.value)" aria-label="調整字體大小"><span style="font-size:24px;color:var(--color-text-tertiary)" aria-hidden="true">A</span></div></div>
          <div class="setting-group"><div class="setting-label">字體</div><div class="setting-row">
            <button class="setting-btn" style="font-family:var(--font-sans)" onclick="setFont('sans')" aria-label="使用無襯線字體">無襯線</button>
            <button class="setting-btn" style="font-family:var(--font-serif)" onclick="setFont('serif')" aria-label="使用襯線字體">襯線</button>
          </div></div>
        </div></div></div>
      <div class="sheet-overlay" id="tts-sheet" onclick="closeSheet('tts-sheet')" role="dialog" aria-modal="true" aria-label="發聲朗讀"><div class="sheet-content" onclick="event.stopPropagation()">
        <div class="sheet-handle" aria-hidden="true"></div>
        <div class="sheet-header"><h3>發聲朗讀</h3><button class="btn-press" onclick="closeSheet('tts-sheet')" aria-label="關閉朗讀"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
        <div class="sheet-body" style="text-align:center">
          <button class="tts-play-btn" id="tts-play-btn" style="background:${book.color}" onclick="toggleTTS()" aria-label="播放或暫停朗讀">
            <svg id="tts-play-icon" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
            <svg id="tts-pause-icon" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" class="hidden" aria-hidden="true"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>
          <div class="tts-progress-wrap">
            <input type="range" min="0" max="100" value="0" step="1" id="tts-range" class="tts-range-slider" oninput="seekTTSRange(this.value)" onchange="seekTTSRange(this.value)" ontouchstart="seekTTSRange(this.value)" ontouchmove="seekTTSRange(this.value)" ontouchend="seekTTSRange(this.value)" aria-label="朗讀進度拖曳條">
            <div class="tts-progress-label"><span id="tts-current-para">0</span> / <span id="tts-total-para">0</span></div>
          </div>
          <div class="tts-control" style="text-align:left">
            <div class="tts-label"><span>語速</span><span id="tts-rate-val">1.0x</span></div>
            <input type="range" min="0.5" max="2" step="0.1" value="1" id="tts-rate" oninput="setTTSRate(this.value)" style="margin:8px 0 16px" aria-label="調整朗讀語速">
            <div class="tts-label"><span>音高</span><span id="tts-pitch-val">1.0</span></div>
            <input type="range" min="0.5" max="2" step="0.1" value="1" id="tts-pitch" oninput="setTTSPitch(this.value)" style="margin:8px 0" aria-label="調整朗讀音高">
          </div></div></div></div>
    </div></main></div></div>
    <script>
    // Favorites functions
    function getFavorites() { return JSON.parse(localStorage.getItem('favorites') || '[]'); }
    function toggleFavorite(bookId, bookTitle) {
      var favs = getFavorites();
      var idx = favs.findIndex(function(f){return f.id === bookId});
      var btn = document.getElementById('bookmark-btn');
      if (idx > -1) {
        favs.splice(idx, 1);
        if (btn) btn.textContent = '收藏';
        if (btn) btn.style.color = 'var(--accent)';
      } else {
        favs.unshift({id: bookId, title: bookTitle, time: Date.now()});
        if (btn) btn.textContent = '已收藏';
        if (btn) btn.style.color = '#e74c3c';
      }
      localStorage.setItem('favorites', JSON.stringify(favs));
    }
    
    (function(){
      var uiVisible=true;
      var ttsPlaying=false;
      var ttsUtterance=null;
      var ttsCurrentIdx=0;
      var ttsCharOffset=0;
      
      window.openSheet=function(id){document.getElementById(id).classList.add('active')};
      window.closeSheet=function(id){document.getElementById(id).classList.remove('active')};
      
      // Bind toolbar button clicks
      document.getElementById('tool-btn-toc').onclick=function(){window.openSheet('toc-sheet')};
      document.getElementById('tool-btn-settings').onclick=function(){window.openSheet('settings-sheet')};
      document.getElementById('tool-btn-tts').onclick=function(){window.openSheet('tts-sheet')};

      window.setTheme=function(t){
        if(t==='light')document.documentElement.removeAttribute('data-theme');
        else document.documentElement.setAttribute('data-theme',t);
        try{localStorage.setItem('dn_theme',t)}catch(e){}
      };

      window.setFontSize=function(v){
        document.getElementById('reader-content').style.fontSize=v+'px';
        var fv=document.getElementById('font-size-val');
        if(fv)fv.textContent=v+'px';
        try{localStorage.setItem('dn_fontsize',v)}catch(e){}
      };

      window.setFont=function(t){
        var el=document.getElementById('reader-content');
        if(t==='serif')el.style.fontFamily="'PingFang TC','Microsoft JhengHei',Georgia,serif";
        else el.style.fontFamily="system-ui,-apple-system,'PingFang TC','Microsoft JhengHei',sans-serif";
        try{localStorage.setItem('dn_font',t)}catch(e){}
      };

      window.toggleTTS=function(){
        if(ttsPlaying){speechSynthesis.cancel();ttsPlaying=false;ttsCurrentIdx=0;updateTTSIcon();updateTTSProgress(0)}
        else{var paras=document.querySelectorAll('#reader-content p[data-tts-idx]');if(!paras.length)return;speakFrom(ttsCurrentIdx)}
      };

      window.updateTTSIcon=function(){
        var pi=document.getElementById('tts-play-icon');
        var pa=document.getElementById('tts-pause-icon');
        if(pi)pi.classList.toggle('hidden',ttsPlaying);
        if(pa)pa.classList.toggle('hidden',!ttsPlaying)
      };

      window.setTTSRate=function(v){
        document.getElementById('tts-rate-val').textContent=parseFloat(v).toFixed(1)+'x';
        if(ttsUtterance)ttsUtterance.rate=parseFloat(v)
      };

      window.setTTSPitch=function(v){
        document.getElementById('tts-pitch-val').textContent=parseFloat(v).toFixed(1);
        if(ttsUtterance)ttsUtterance.pitch=parseFloat(v)
      };

      window.seekTTSRange=function(val){
        var pct=parseInt(val)/100;
        var paras=document.querySelectorAll('#reader-content p[data-tts-idx]');
        var total=paras.length;
        if(!total)return;
        var targetIdx=Math.min(Math.floor(pct*total),total-1);
        if(targetIdx<0)targetIdx=0;
        if(ttsPlaying)speakFrom(targetIdx);
        else{ttsCurrentIdx=targetIdx;updateTTSProgress(targetIdx/(total-1));highlightParagraph(targetIdx)}
      };

      function speakFrom(idx){
        speechSynthesis.cancel();
        var paras=document.querySelectorAll('#reader-content p[data-tts-idx]');
        if(idx<0||idx>=paras.length){ttsPlaying=false;ttsCurrentIdx=0;ttsCharOffset=0;updateTTSIcon();updateTTSProgress(0);clearTTSHighlight();return}
        ttsCurrentIdx=idx;
        ttsCharOffset=0;
        var txt='';
        for(var i=idx;i<paras.length;i++){txt+=paras[i].textContent+' '}
        ttsUtterance=new SpeechSynthesisUtterance(txt);
        ttsUtterance.lang='zh-TW';
        var r=document.getElementById('tts-rate');
        var p=document.getElementById('tts-pitch');
        if(r)ttsUtterance.rate=parseFloat(r.value);
        if(p)ttsUtterance.pitch=parseFloat(p.value);
        ttsUtterance.onend=function(){
          ttsPlaying=false;
          ttsCurrentIdx=0;
          ttsCharOffset=0;
          updateTTSIcon();
          updateTTSProgress(0);
          clearTTSHighlight();
          var rng=document.getElementById('tts-range');
          if(rng)rng.value=0
        };
        ttsUtterance.onboundary=function(ev){
          if(ev.name==='word'||ev.name==='sentence'){
            var charPos=ev.charIndex;
            var before=0;
            var done=idx;
            for(var j=idx;j<paras.length;j++){
              var plen=paras[j].textContent.length;
              if(charPos<before+plen+1){done=j;ttsCharOffset=charPos-before;break}
              before+=plen+1
            }
            if(done!==ttsCurrentIdx){ttsCurrentIdx=done;highlightParagraph(done)}
            var pct=(done-idx)/(paras.length-idx);
            updateTTSProgress(pct);
            var rng=document.getElementById('tts-range');
            if(rng)rng.value=Math.round(pct*100)
          }
        };
        speechSynthesis.speak(ttsUtterance);
        ttsPlaying=true;
        updateTTSIcon();
        updateTTSProgress(0);
        highlightParagraph(idx);
        var rng=document.getElementById('tts-range');
        if(rng)rng.value=0
      }

      function highlightParagraph(idx){
        var paras=document.querySelectorAll('#reader-content p[data-tts-idx]');
        paras.forEach(function(p){p.classList.remove('tts-active')});
        if(idx>=0&&idx<paras.length){
          var el=paras[idx];
          el.classList.add('tts-active');
          el.scrollIntoView({behavior:'smooth',block:'center'})
        }
      }

      function clearTTSHighlight(){
        document.querySelectorAll('#reader-content p[data-tts-idx].tts-active').forEach(function(p){p.classList.remove('tts-active')})
      }

      function updateTTSProgress(pct){
        var fill=document.getElementById('tts-progress-fill');
        if(fill)fill.style.width=Math.max(0,Math.min(100,pct*100))+'%';
        var curEl=document.getElementById('tts-current-para');
        var totEl=document.getElementById('tts-total-para');
        if(curEl)curEl.textContent=ttsCurrentIdx+1;
        if(totEl)totEl.textContent=document.querySelectorAll('#reader-content p[data-tts-idx]').length
      }

      // Restore saved state
      (function(){
        try{
          var p=JSON.parse(localStorage.getItem('dn_progress')||'{}');
          var k='${book.id}';
          if(p[k]&&p[k].chapter==='${ch.id}'&&p[k].scroll){
            setTimeout(function(){window.scrollTo(0,p[k].scroll)},100)
          }
          var theme=localStorage.getItem('dn_theme');
          if(theme&&theme!=='light')document.documentElement.setAttribute('data-theme',theme);
          var fs=localStorage.getItem('dn_fontsize');
          if(fs){
            document.getElementById('reader-content').style.fontSize=fs+'px';
            var fv=document.getElementById('font-size-val');
            if(fv)fv.textContent=fs+'px';
            var fr=document.getElementById('font-size-range');
            if(fr)fr.value=fs
          }
          var font=localStorage.getItem('dn_font');
          if(font){
            var el=document.getElementById('reader-content');
            if(font==='serif')el.style.fontFamily="'PingFang TC','Microsoft JhengHei',Georgia,serif";
            else el.style.fontFamily="system-ui,-apple-system,'PingFang TC','Microsoft JhengHei',sans-serif"
          }
        }catch(e){}
      })();

      // Scroll progress
      var _st=null;
      window.addEventListener('scroll',function(){
        var pb=document.getElementById('reader-progress-bar');
        if(pb){
          var h=document.documentElement.scrollHeight-window.innerHeight;
          pb.style.width=h>0?Math.min(window.scrollY/h*100,100)+'%':'0%'
        }
        if(_st)clearTimeout(_st);
        _st=setTimeout(function(){
          try{
            var d=JSON.parse(localStorage.getItem('dn_progress')||'{}');
            d['${book.id}']={chapter:'${ch.id}',scroll:window.scrollY,time:Date.now()};
            localStorage.setItem('dn_progress',JSON.stringify(d))
          }catch(e){}
        },500)
      });
    })();
    <\/script>`;

    write(`book/${book.id}/${ch.id}/index.html`, pageHTML(`${ch.title} - ${book.title} - ${SITE.name}`, ch.content.slice(0,100), book.color, body, chapterJsonLd, `/book/${book.id}/${ch.id}`, false, 'article'));
  });
});

// ===== LEGAL =====
write('legal/privacy/index.html', pageHTML('隱私權政策 - '+SITE.name, '本網站的隱私權政策', '#F8F9FA', `<main class="page">${backHeader('隱私權政策')}
  ${breadcrumbHTML([{label:SITE.name,url:`${SITE.base}/`},{label:'隱私權政策'}])}
  <div class="legal-body">
    <p class="legal-date">最後更新日期：2026年4月4日</p>
    <h2>1. 我們收集的資訊</h2><p>DeathNote 可能會收集：瀏覽數據、裝置資訊、Cookie 及類似技術所收集的資訊。</p>
    <h2>2. 資訊的使用方式</h2><p>提供、維護和改善服務；分析使用趨勢；展示個人化廣告。</p>
    <h2>3. Cookie 政策</h2><p>本網站使用 Cookie 提升體驗。Google AdSense 可能使用 DART Cookie。您可前往 <a href="https://www.google.com/ads/preferences/">Google 廣告設定</a> 選擇退出。</p>
    <h2>4. 第三方廣告服務</h2><p>本網站使用 Google AdSense 等第三方廣告服務。</p>
    <h2>5. 資料安全</h2><p>我們採取合理措施保護您的個人資訊。</p>
    <h2>6. 聯絡我們</h2><p>如有疑問，請透過本網站的聯絡方式與我們取得聯繫。</p>
  </div>${footerNav('privacy')}</main>`, null, '/legal/privacy'));

write('legal/terms/index.html', pageHTML('使用條款 - '+SITE.name, '本網站的使用條款', '#F8F9FA', `<main class="page">${backHeader('使用條款')}
  ${breadcrumbHTML([{label:SITE.name,url:`${SITE.base}/`},{label:'使用條款'}])}
  <div class="legal-body">
    <p class="legal-date">最後更新日期：2026年4月4日</p>
    <h2>1. 接受條款</h2><p>使用本網站即表示您同意遵守本使用條款。</p>
    <h2>2. 服務內容</h2><p>DeathNote 提供線上小說閱讀服務。所有內容僅供個人非商業用途。</p>
    <h2>3. 智慧財產權</h2><p>本網站所有內容均受智慧財產權法保護。</p>
    <h2>4. 使用者行為規範</h2><p>您同意不會利用本網站從事違法行為或干擾網站運作。</p>
    <h2>5. 免責聲明</h2><p>本網站以「現況」提供服務，不保證服務不中斷或無錯誤。</p>
    <h2>6. 條款修改</h2><p>本網站保留隨時修改本條款的權利。</p>
  </div>${footerNav('terms')}</main>`, null, '/legal/terms'));

// ===== 404 =====
write('404.html', pageHTML('404 - 頁面不存在', '找不到您要的頁面', '#F8F9FA', `<main class="page"><div style="text-align:center;padding:80px 16px">
  <p style="font-size:64px;margin-bottom:16px" aria-hidden="true">📭</p>
  <h1 style="font-size:24px;font-weight:700;margin-bottom:8px">404 - 頁面不存在</h1>
  <p style="color:var(--color-text-secondary);margin-bottom:24px">您尋找的頁面可能已被移除或不存在</p>
      <a href="/" class="btn-primary btn-press" style="display:inline-block;width:auto;padding:12px 32px;background:var(--color-text-primary)" aria-label="返回首頁">返回首頁</a>
</div>${footerNav('home')}</main>`, null, '/404'));

// ===== SITEMAP =====
(function(){
  let urls = [
    {loc:'/',lastmod:new Date().toISOString().split('T')[0],priority:'1.0'},
    {loc:'/search',lastmod:new Date().toISOString().split('T')[0],priority:'0.8'},
    {loc:'/legal/privacy',lastmod:'2026-04-04',priority:'0.3'},
    {loc:'/legal/terms',lastmod:'2026-04-04',priority:'0.3'}
  ];
  CATEGORIES.forEach(c=>urls.push({loc:`/category/${c.id}`,lastmod:new Date().toISOString().split('T')[0],priority:'0.7'}));
  BOOKS.forEach(b=>{
    urls.push({loc:`/book/${b.id}`,lastmod:b.updated,priority:'0.9'});
    (b._chapters||[]).forEach(ch=>urls.push({loc:`/book/${b.id}/${ch.id}`,lastmod:b.updated,priority:'0.6'}));
  });
  write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u=>`<url><loc>${SITE.url}${u.loc}</loc><lastmod>${u.lastmod}</lastmod><priority>${u.priority}</priority></url>`).join('\n')}
</urlset>`);
})();

// ===== COPY PUBLIC =====
['manifest.json','sw.js','robots.txt'].forEach(f => {
  if (existsSync(f)) writeFileSync(join(DIST, f), readFileSync(f, 'utf-8'));
});

let count = 0;
function countFiles(dir) {
  readdirSync(dir).forEach(e => {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) countFiles(p);
    else if (e.endsWith('.html')) count++;
  });
}
countFiles(DIST);
console.log(`✅ Generated ${count} static pages from content/`);
