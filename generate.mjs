import { writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { BOOKS, CATEGORIES, CHAPTERS, HOT_KEYWORDS, SITE } from './src/data.js';
import { readFileSync } from 'node:fs';

const DIST = 'dist';
if (existsSync(DIST)) rmSync(DIST, { recursive: true });
mkdirSync(DIST, { recursive: true });

const css = readFileSync('src/styles.css', 'utf-8');
const SVG_ICON = `<svg viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#1A1A2E"/><text x="16" y="22" text-anchor="middle" fill="white" font-family="serif" font-size="16" font-weight="bold">D</text></svg>`;

function coverHTML(book, w, h, fs) {
  return `<div style="width:${w}px;height:${h}px;border-radius:8px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:${fs||24}px;font-weight:700;background:linear-gradient(135deg,${book.color},${book.color}dd)">${book.title.slice(0,2)}</div>`;
}
function tagHTML(book) {
  return book.tags.slice(0,2).map(t => `<span class="tag" style="background:${book.color}">${t}</span>`).join('');
}
function rankBadge(i) {
  return i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'rank-other';
}
function footerNav(active) {
  return `<nav class="footer-nav">
    <a href="/" class="footer-nav-item${active==='home'?' active':''}" data-nav="home">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1"/></svg>首頁</a>
    <a href="/search" class="footer-nav-item${active==='search'?' active':''}" data-nav="search">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>搜尋</a>
    <a href="/legal/privacy" class="footer-nav-item${active==='privacy'?' active':''}" data-nav="privacy">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>隱私</a>
    <a href="/legal/terms" class="footer-nav-item${active==='terms'?' active':''}" data-nav="terms">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>條款</a>
  </nav>`;
}
function headerHTML() {
  return `<header class="header"><div class="header-inner">
    <a href="/" class="logo">${SVG_ICON}<span class="logo-text">${SITE.name}</span></a>
    <button class="btn-press" onclick="window.location.href='/search'">
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
    </button></div></header>`;
}
function backHeader(title) {
  return `<div class="cat-header"><div class="cat-header-inner">
    <button class="btn-press" onclick="history.back()">
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
    <h1>${title}</h1></div></div>`;
}
function adHTML() { return '<div class="ad">Advertisement</div>'; }

function pageHTML(title, desc, accent, body, jsonLd) {
  return `<!DOCTYPE html>
<html lang="zh-Hant">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,viewport-fit=cover,maximum-scale=1.0,user-scalable=no">
<meta name="theme-color" content="${accent||'#F8F9FA'}">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="${SITE.name}">
<meta name="description" content="${desc||SITE.description}">
<title>${title}</title>
<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(SVG_ICON)}">
<link rel="manifest" href="/manifest.json">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700&family=Noto+Sans+TC:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>${css}</style>
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>` : ''}
</head>
<body>
${body}
<script>
if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js'))}
</script>
</body></html>`;
}

function write(path, content) {
  const full = join(DIST, path);
  mkdirSync(join(DIST, path.split('/').slice(0,-1).join('/')), { recursive: true });
  writeFileSync(full, content);
}

// ===== HOME =====
(function() {
  const all = [...BOOKS].sort((a,b)=>b.rating-a.rating);
  const newest = [...BOOKS].sort((a,b)=>new Date(b.date)-new Date(a.date));
  const done = BOOKS.filter(b=>b.status==='completed').sort((a,b)=>b.rating-a.rating);
  const body = headerHTML() + `
  <div class="page">
    <section style="padding:24px 16px;text-align:center">
      <div class="stats">
        <div><div class="stat-val" style="color:#2C3E50">${BOOKS.length}</div><div class="stat-label">收錄作品</div></div>
        <div><div class="stat-val" style="color:#A3B18A">${(BOOKS.reduce((s,b)=>s+b.words,0)/10000).toFixed(0)}萬</div><div class="stat-label">總字數</div></div>
        <div><div class="stat-val" style="color:#3B82F6">${CHAPTERS.length}</div><div class="stat-label">章節總數</div></div>
      </div></section>
    <section style="padding-bottom:16px">
      <h2 class="section-title">熱門精選</h2>
      <div class="swipe-row">
        ${BOOKS.map(b=>`<a href="/book/${b.id}" class="book-card card-hover btn-press">${coverHTML(b,144,192,32)}<h3 class="truncate">${b.title}</h3><div style="display:flex;align-items:center;gap:4px;margin-top:4px"><span class="book-rating" style="color:${b.color}">${b.rating}</span><span style="font-size:12px;color:var(--text3)">分</span></div></a>`).join('')}
      </div></section>
    ${adHTML()}
    <section style="padding-bottom:16px">
      <h2 class="section-title">排行榜</h2>
      <div class="rank-tabs">
        <button class="rank-tab active" data-tab="all" onclick="switchRank('all')">總榜</button>
        <button class="rank-tab" data-tab="new" onclick="switchRank('new')">新書</button>
        <button class="rank-tab" data-tab="done" onclick="switchRank('done')">完結</button>
      </div>
      <div id="rank-all">${all.map((b,i)=>`<a href="/book/${b.id}" class="rank-item btn-press"><span class="rank-badge ${rankBadge(i)}">${i+1}</span><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:500" class="truncate">${b.title}</div><div style="font-size:12px;color:var(--text3);margin-top:2px">${b.author} · ${b.tags.slice(0,2).join(' · ')}</div></div><span style="font-size:12px;font-weight:700;color:${b.color}">${b.rating}</span></a>`).join('')}</div>
      <div id="rank-new" class="hidden">${newest.map((b,i)=>`<a href="/book/${b.id}" class="rank-item btn-press"><span class="rank-badge ${rankBadge(i)}">${i+1}</span><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:500" class="truncate">${b.title}</div><div style="font-size:12px;color:var(--text3);margin-top:2px">${b.author} · ${b.tags.slice(0,2).join(' · ')}</div></div><span style="font-size:12px;font-weight:700;color:${b.color}">${b.rating}</span></a>`).join('')}</div>
      <div id="rank-done" class="hidden">${done.map((b,i)=>`<a href="/book/${b.id}" class="rank-item btn-press"><span class="rank-badge ${rankBadge(i)}">${i+1}</span><div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:500" class="truncate">${b.title}</div><div style="font-size:12px;color:var(--text3);margin-top:2px">${b.author} · ${b.tags.slice(0,2).join(' · ')}</div></div><span style="font-size:12px;font-weight:700;color:${b.color}">${b.rating}</span></a>`).join('')}</div>
    </section>
    <section style="padding-bottom:80px">
      <h2 class="section-title">分類題材</h2>
      <div class="cat-grid">
        ${CATEGORIES.map(c=>`<a href="/category/${c.id}" class="cat-item btn-press"><span class="cat-icon">${c.icon}</span><span class="cat-name">${c.name}</span></a>`).join('')}
      </div></section>
    ${footerNav('home')}
  </div>
  <script>
  function switchRank(tab){
    document.querySelectorAll('[id^="rank-"]').forEach(function(el){el.classList.add('hidden')});
    document.getElementById('rank-'+tab).classList.remove('hidden');
    document.querySelectorAll('.rank-tab').forEach(function(el){el.classList.remove('active')});
    document.querySelector('.rank-tab[data-tab="'+tab+'"]').classList.add('active');
  }
  </script>`;

  write('index.html', pageHTML(`${SITE.name} - ${SITE.tagline}`, SITE.description, '#F8F9FA', body));
})();

// ===== SEARCH =====
(function() {
  const body = `<div class="page">
    <div class="search-header"><div class="search-bar">
      <button class="btn-press" onclick="window.location.href='/'">
        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
      <div class="search-icon-wrap">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        <input class="search-input" type="search" placeholder="搜尋小說、作者、關鍵字..." id="search-input" oninput="doSearch(this.value)">
      </div></div></div>
    <div id="hot-keywords" class="hot-section">
      <div class="hot-title">熱門搜尋</div>
      <div class="hot-tags">${HOT_KEYWORDS.map(kw=>`<button class="hot-tag btn-press" onclick="searchKW('${kw}')">${kw}</button>`).join('')}</div>
    </div>
    <div id="search-results" class="results-section hidden"></div>
    ${footerNav('search')}
  </div>
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
    results.map(function(b){return '<a href="/book/'+b.id+'" class="result-item btn-press"><div style="width:48px;height:64px;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;background:linear-gradient(135deg,'+b.color+','+b.color+'dd)">'+b.title.slice(0,2)+'</div><div class="result-info"><div class="result-title">'+b.title+'</div><div class="result-author">'+b.author+'</div><div class="result-tags">'+b.tags.slice(0,2).join(' · ')+'</div></div><span style="font-size:12px;font-weight:700;color:'+b.color+'">'+b.rating+'</span></a>'}).join('')||'<p style="text-align:center;color:var(--text3);padding:32px 0">找不到相關結果</p>';
  }
  <\/script>`;

  write('search/index.html', pageHTML('搜尋 - '+SITE.name, '搜尋小說、作者、關鍵字', '#F8F9FA', body));
})();

// ===== CATEGORIES =====
CATEGORIES.forEach(cat => {
  const catBooks = BOOKS.filter(b => b.category === cat.id);
  const body = `<div class="page">${backHeader(cat.name+'小說')}
    <div class="cat-list">${catBooks.length ? catBooks.map(b =>
      `<a href="/book/${b.id}" class="cat-book card-hover btn-press">${coverHTML(b,80,112,18)}
        <div class="cat-book-info"><div><div class="cat-book-title">${b.title}</div>
        <div class="cat-book-author">${b.author}</div>
        <div class="cat-book-tags">${tagHTML(b)}</div></div>
        <div class="cat-book-meta"><span>${b.words.toLocaleString()} 字</span>
        <span style="color:${b.color};font-weight:700">${b.rating} 分</span></div></div></a>`
    ).join('') + adHTML() : '<div style="text-align:center;padding:64px 0;color:var(--text3)"><p style="font-size:32px;margin-bottom:8px">📭</p><p>此分類暫無作品</p></div>'}</div>
  </div>`;

  write(`category/${cat.id}/index.html`, pageHTML(`${cat.name}小說 - ${SITE.name}`, `瀏覽${cat.name}題材的小說`, cat.color, body));
});

// ===== BOOK DETAIL =====
BOOKS.forEach(book => {
  const cat = CATEGORIES.find(c => c.id === book.category);
  const bookChapters = CHAPTERS.filter(c => c.bookId === book.id).sort((a,b) => a.order - b.order);

  const jsonLd = {
    "@context":"https://schema.org","@type":"Book","name":book.title,
    "author":{"@type":"Person","name":book.author},"genre":cat?cat.name:book.category,
    "numberOfPages":book.chapters,"bookFormat":"EBook",
    "aggregateRating":{"@type":"AggregateRating","ratingValue":book.rating.toString(),"bestRating":"10","ratingCount":"1"},
    "description":book.synopsis
  };

  const tocHTML = bookChapters.length > 50 ?
    `<select class="toc-select" onchange="filterTOC(this.value)">${
      Array.from({length:Math.ceil(bookChapters.length/50)},(_,i)=>{
        const s=i*50+1, e=Math.min((i+1)*50,bookChapters.length);
        return `<option value="${i}">${s}-${e} 章</option>`;
      }).join('')
    }</select>` : '';

  const body = `<div class="page">${backHeader(book.title)}
    <div class="detail-header">${coverHTML(book,112,160,24)}
      <div class="detail-info"><div class="detail-title">${book.title}</div>
      <div class="detail-author">${book.author}</div>
      <div class="detail-tags">${tagHTML(book)}</div>
      <div class="detail-meta"><span>${book.words.toLocaleString()} 字</span><span>${book.chapters} 章</span>
      <span style="color:${book.status==='completed'?'#A3B18A':'#3B82F6'}">${book.status==='completed'?'已完結':'連載中'}</span></div></div></div>
    <div class="action-row">
      <a href="/book/${book.id}/${bookChapters.length?bookChapters[0].id:''}" class="btn-primary btn-press" style="background:${book.color}">開始閱讀</a>
      <button class="btn-secondary btn-press" id="bookmark-btn" onclick="handleBookmark('${book.id}')">加入書籤</button></div>
    <div class="synopsis"><h2 style="font-size:16px;font-weight:700;margin-bottom:8px">簡介</h2>
    <p class="synopsis-text" id="synopsis-text">${book.synopsis}</p>
    <button class="synopsis-toggle btn-press" style="color:${book.color}" onclick="toggleSynopsis()">展開全部</button></div>
    ${adHTML()}
    <div class="toc"><div class="toc-title">章節目錄</div>${tocHTML}
    <div id="toc-list">${bookChapters.map(ch =>
      `<a href="/book/${book.id}/${ch.id}" class="toc-item btn-press"><span>${ch.title}</span><span>${ch.words.toLocaleString()} 字</span></a>`
    ).join('')}</div></div>
  </div>
  <script>
  function toggleSynopsis(){var t=document.getElementById('synopsis-text');var b=t?t.nextElementSibling:null;if(t&&t.classList.contains('expanded')){t.classList.remove('expanded');if(b)b.textContent='展開全部'}else if(t){t.classList.add('expanded');if(b)b.textContent='收合'}}
  function filterTOC(g){var s=parseInt(g)*50;var e=Math.min(s+50,${bookChapters.length});var sl=${JSON.stringify(bookChapters.map(c=>({id:c.id,title:c.title,words:c.words})))}.slice(s,e);document.getElementById('toc-list').innerHTML=sl.map(function(ch){return '<a href="/book/${book.id}/'+ch.id+'" class="toc-item btn-press"><span>'+ch.title+'</span><span>'+ch.words.toLocaleString()+' 字</span></a>'}).join('')}
  function handleBookmark(id){var bm=JSON.parse(localStorage.getItem('dn_bm')||'[]');var i=bm.indexOf(id);if(i>-1)bm.splice(i,1);else bm.push(id);localStorage.setItem('dn_bm',JSON.stringify(bm));var btn=document.getElementById('bookmark-btn');if(btn)btn.textContent=bm.indexOf(id)>-1?'已加入書籤':'加入書籤'}
  (function(){var bm=JSON.parse(localStorage.getItem('dn_bm')||'[]');var btn=document.getElementById('bookmark-btn');if(btn&&bm.indexOf('${book.id}')>-1)btn.textContent='已加入書籤'})()
  <\/script>`;

  write(`book/${book.id}/index.html`, pageHTML(`${book.title} - ${SITE.name}`, book.synopsis, book.color, body, jsonLd));
});

// ===== CHAPTER READER =====
BOOKS.forEach(book => {
  const bookChapters = CHAPTERS.filter(c => c.bookId === book.id).sort((a,b) => a.order - b.order);
  bookChapters.forEach((ch, idx) => {
    const prev = idx > 0 ? bookChapters[idx-1] : null;
    const next = idx < bookChapters.length-1 ? bookChapters[idx+1] : null;

    const chapterJsonLd = {
      "@context":"https://schema.org","@type":"Chapter","name":ch.title,"position":ch.order,
      "isPartOf":{"@type":"Book","name":book.title}
    };

    const body = `<div class="reader-page"><div class="reader-immersive" id="reader-el">
      <header class="reader-topbar" id="reader-topbar"><div class="reader-topbar-inner">
        <a href="/book/${book.id}" class="btn-press" style="display:flex;align-items:center;gap:8px">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          <span class="truncate" style="max-width:200px;font-size:14px">${book.title}</span></a></div></header>
      <article class="reader-content" id="reader-content">
        <h1>${ch.title}</h1>
        ${ch.content.split('\n').filter(p=>p.trim()).map(p=>`<p>${p.trim()}</p>`).join('')}
      </article>
      ${adHTML()}
      <footer class="reader-bottombar" id="reader-bottombar"><div class="reader-bottombar-inner">
        ${prev ? `<a href="/book/${book.id}/${prev.id}" class="nav-btn btn-press"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>上一章</a>` : '<span class="nav-btn disabled"><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>上一章</span>'}
        <button class="tool-btn btn-press" onclick="openSheet('toc-sheet')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg><span>目錄</span></button>
        <button class="tool-btn btn-press" onclick="openSheet('settings-sheet')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg><span>設定</span></button>
        <button class="tool-btn btn-press" onclick="openSheet('tts-sheet')"><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 12h.01"/><circle cx="8" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg><span>朗讀</span></button>
        ${next ? `<a href="/book/${book.id}/${next.id}" class="nav-btn btn-press">下一章<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></a>` : '<span class="nav-btn disabled">下一章<svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></span>'}
      </div></footer>
      <div class="sheet-overlay" id="toc-sheet" onclick="closeSheet('toc-sheet')"><div class="sheet-content" onclick="event.stopPropagation()">
        <div class="sheet-header"><h3>章節目錄</h3><button class="btn-press" onclick="closeSheet('toc-sheet')"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
        <div class="sheet-body">${bookChapters.map(c=>`<a href="/book/${book.id}/${c.id}" class="toc-item btn-press"><span>${c.title}</span><span>${c.words.toLocaleString()} 字</span></a>`).join('')}</div>
      </div></div>
      <div class="sheet-overlay" id="settings-sheet" onclick="closeSheet('settings-sheet')"><div class="sheet-content" onclick="event.stopPropagation()">
        <div class="sheet-header"><h3>閱讀設定</h3><button class="btn-press" onclick="closeSheet('settings-sheet')"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
        <div class="sheet-body">
          <div class="setting-group"><div class="setting-label">外觀模式</div><div class="setting-row">
            <button class="setting-btn" style="background:#fff;color:#1A1A2E" onclick="setTheme('light')">白底</button>
            <button class="setting-btn" style="background:#1A1A2E;color:#D1D5DB" onclick="setTheme('night')">夜間</button>
            <button class="setting-btn" style="background:#FDF6E3;color:#5C4B37" onclick="setTheme('sepia')">護眼</button>
          </div></div>
          <div class="setting-group"><div class="setting-label">字體大小 <span id="font-size-val">18px</span></div>
            <div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:var(--text3)">A</span>
            <input type="range" min="14" max="28" value="18" id="font-size-range" oninput="setFontSize(this.value)"><span style="font-size:24px;color:var(--text3)">A</span></div></div>
          <div class="setting-group"><div class="setting-label">字體</div><div class="setting-row">
            <button class="setting-btn" style="font-family:var(--sans)" onclick="setFont('sans')">無襯線</button>
            <button class="setting-btn" style="font-family:var(--serif)" onclick="setFont('serif')">襯線</button>
          </div></div>
        </div></div></div>
      <div class="sheet-overlay" id="tts-sheet" onclick="closeSheet('tts-sheet')"><div class="sheet-content" onclick="event.stopPropagation()">
        <div class="sheet-header"><h3>發聲朗讀</h3><button class="btn-press" onclick="closeSheet('tts-sheet')"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button></div>
        <div class="sheet-body" style="text-align:center">
          <button class="tts-play-btn" id="tts-play-btn" style="background:${book.color}" onclick="toggleTTS()">
            <svg id="tts-play-icon" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <svg id="tts-pause-icon" width="24" height="24" fill="currentColor" viewBox="0 0 24 24" class="hidden"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>
          <div class="tts-control" style="text-align:left">
            <div class="tts-label"><span>語速</span><span id="tts-rate-val">1.0x</span></div>
            <input type="range" min="0.5" max="2" step="0.1" value="1" id="tts-rate" oninput="setTTSRate(this.value)" style="margin:8px 0 16px">
            <div class="tts-label"><span>音高</span><span id="tts-pitch-val">1.0</span></div>
            <input type="range" min="0.5" max="2" step="0.1" value="1" id="tts-pitch" oninput="setTTSPitch(this.value)" style="margin:8px 0">
          </div></div></div></div>
    </div></div>
    <script>
    var uiVisible=false;var ttsPlaying=false;var ttsUtterance=null;
    document.getElementById('reader-el').addEventListener('click',function(e){if(e.target.closest('.reader-topbar,.reader-bottombar,.sheet-overlay,.sheet-content'))return;uiVisible=!uiVisible;document.getElementById('reader-topbar').classList.toggle('show',uiVisible);document.getElementById('reader-bottombar').classList.toggle('show',uiVisible)});
    function openSheet(id){document.getElementById(id).classList.add('active')}
    function closeSheet(id){document.getElementById(id).classList.remove('active')}
    function setTheme(t){var el=document.getElementById('reader-el');var c=document.getElementById('reader-content');if(t==='night'){el.style.background='#1A1A2E';el.style.color='#D1D5DB';c.style.background='#1A1A2E';c.style.color='#D1D5DB'}else if(t==='sepia'){el.style.background='#FDF6E3';el.style.color='#5C4B37';c.style.background='#FDF6E3';c.style.color='#5C4B37'}else{el.style.background='#FFF';el.style.color='#1A1A2E';c.style.background='#FFF';c.style.color='#1A1A2E'}}
    function setFontSize(v){document.getElementById('reader-content').style.fontSize=v+'px';document.getElementById('font-size-val').textContent=v+'px'}
    function setFont(t){document.getElementById('reader-content').style.fontFamily=t==='serif'?"'Noto Serif TC','Noto Serif SC',Georgia,serif":"-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif"}
    function toggleTTS(){if(ttsPlaying){speechSynthesis.cancel();ttsPlaying=false}else{var text=document.getElementById('reader-content').textContent;if(!text)return;ttsUtterance=new SpeechSynthesisUtterance(text);ttsUtterance.lang='zh-TW';var r=document.getElementById('tts-rate');var p=document.getElementById('tts-pitch');if(r)ttsUtterance.rate=parseFloat(r.value);if(p)ttsUtterance.pitch=parseFloat(p.value);ttsUtterance.onend=function(){ttsPlaying=false;updateTTSIcon()};speechSynthesis.speak(ttsUtterance);ttsPlaying=true}updateTTSIcon()}
    function updateTTSIcon(){var pi=document.getElementById('tts-play-icon');var pa=document.getElementById('tts-pause-icon');if(pi)pi.classList.toggle('hidden',ttsPlaying);if(pa)pa.classList.toggle('hidden',!ttsPlaying)}
    function setTTSRate(v){document.getElementById('tts-rate-val').textContent=parseFloat(v).toFixed(1)+'x';if(ttsUtterance){ttsUtterance.rate=parseFloat(v);speechSynthesis.cancel();if(ttsPlaying)speechSynthesis.speak(ttsUtterance)}}
    function setTTSPitch(v){document.getElementById('tts-pitch-val').textContent=parseFloat(v).toFixed(1);if(ttsUtterance){ttsUtterance.pitch=parseFloat(v);speechSynthesis.cancel();if(ttsPlaying)speechSynthesis.speak(ttsUtterance)}}
    <\/script>`;

    write(`book/${book.id}/${ch.id}/index.html`, pageHTML(`${ch.title} - ${book.title} - ${SITE.name}`, ch.content.slice(0,100), book.color, body, chapterJsonLd));
  });
});

// ===== LEGAL PAGES =====
write('legal/privacy/index.html', pageHTML('隱私權政策 - '+SITE.name, '本網站的隱私權政策', '#F8F9FA', `<div class="page">${backHeader('隱私權政策')}
  <div class="legal-body">
    <p class="legal-date">最後更新日期：2026年4月4日</p>
    <h2>1. 我們收集的資訊</h2><p>DeathNote 可能會收集：瀏覽數據、裝置資訊、Cookie 及類似技術所收集的資訊。</p>
    <h2>2. 資訊的使用方式</h2><p>提供、維護和改善服務；分析使用趨勢；展示個人化廣告。</p>
    <h2>3. Cookie 政策</h2><p>本網站使用 Cookie 提升體驗。Google AdSense 可能使用 DART Cookie。您可前往 <a href="https://www.google.com/ads/preferences/">Google 廣告設定</a> 選擇退出。</p>
    <h2>4. 第三方廣告服務</h2><p>本網站使用 Google AdSense 等第三方廣告服務。</p>
    <h2>5. 資料安全</h2><p>我們採取合理措施保護您的個人資訊。</p>
    <h2>6. 聯絡我們</h2><p>如有疑問，請透過本網站的聯絡方式與我們取得聯繫。</p>
  </div>${footerNav('privacy')}</div>`));

write('legal/terms/index.html', pageHTML('使用條款 - '+SITE.name, '本網站的使用條款', '#F8F9FA', `<div class="page">${backHeader('使用條款')}
  <div class="legal-body">
    <p class="legal-date">最後更新日期：2026年4月4日</p>
    <h2>1. 接受條款</h2><p>使用本網站即表示您同意遵守本使用條款。</p>
    <h2>2. 服務內容</h2><p>DeathNote 提供線上小說閱讀服務。所有內容僅供個人非商業用途。</p>
    <h2>3. 智慧財產權</h2><p>本網站所有內容均受智慧財產權法保護。</p>
    <h2>4. 使用者行為規範</h2><p>您同意不會利用本網站從事違法行為或干擾網站運作。</p>
    <h2>5. 免責聲明</h2><p>本網站以「現況」提供服務，不保證服務不中斷或無錯誤。</p>
    <h2>6. 條款修改</h2><p>本網站保留隨時修改本條款的權利。</p>
  </div>${footerNav('terms')}</div>`));

// ===== COPY PUBLIC ASSETS =====
import { copyFileSync } from 'node:fs';
['manifest.json','sw.js','robots.txt'].forEach(f => {
  if (existsSync(f)) copyFileSync(f, join(DIST, f));
});

// Count pages
let count = 0;
function countFiles(dir) {
  const entries = require('node:fs').readdirSync(dir);
  entries.forEach(e => {
    const p = join(dir, e);
    if (require('node:fs').statSync(p).isDirectory()) countFiles(p);
    else if (e.endsWith('.html')) count++;
  });
}
countFiles(DIST);
console.log(`✅ Generated ${count} static pages in dist/`);
