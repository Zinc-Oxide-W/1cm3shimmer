import { esc, fetchText } from './utils.js';
import { buildArticleToc } from './toc.js';

const HOME_SECTION_ORDER = ['stargazing', 'antiquities', 'travel', 'resources', 'special'];

const FRIEND_LINKS = [
  { name: '● 国家天文台', url: 'https://www.bao.ac.cn/' },
  { name: '● 中国国家博物馆', url: 'https://www.chnmuseum.cn/' },
  { name: '● 国家文物局', url: 'http://www.ncha.gov.cn/' },
	  { name: '● 国家文物局', url: 'http://www.ncha.gov.cn/' },
	  { name: '● 国家文物局', url: 'http://www.ncha.gov.cn/' },
	  { name: '● 国家文物局', url: 'http://www.ncha.gov.cn/' },
	  { name: '● 国家文物局', url: 'http://www.ncha.gov.cn/' },
	  { name: '● 国家文物局', url: 'http://www.ncha.gov.cn/' },
  { name: '● 中国铁路 12306', url: 'https://www.12306.cn/' },
  { name: '● GitHub', url: 'https://github.com/' },
  { name: '● 一立方厘米微光 · Pages', url: '#/home' }
];

function truncateTitle(title, max = 42) {
  const s = String(title);
  return s.length > max ? s.slice(0, max) + '...' : s;
}

function countWords(text) {
  const raw = String(text || '');
  const cn = (raw.match(/[\u4e00-\u9fa5\u3400-\u4dbf]/g) || []).length;
  const en = (raw.match(/[A-Za-z0-9]+/g) || []).length;
  return cn + en;
}

function renderCarousel() {
  return `
    <section class="carousel" id="homeCarousel" aria-label="图片轮播">
      <div class="carousel-track">
        <div class="carousel-slide slide-1">
          <div><h2>在无声中闪耀</h2><p>一立方厘米微光 · 星空与旅途的记录</p></div>
        </div>
        <div class="carousel-slide slide-2">
          <div><h2>访古寻踪</h2><p>在古建与文物之间，读一段旧时光</p></div>
        </div>
        <div class="carousel-slide slide-3">
          <div><h2>巡游四方</h2><p>公共交通上的漫游观察</p></div>
        </div>
        <div class="carousel-slide slide-4">
          <div><h2>资料索引</h2><p>渠道、书目与工具整理</p></div>
        </div>
        <div class="carousel-slide slide-5">
          <div><h2>特别企划</h2><p>随处走走，到处瞧瞧</p></div>
        </div>
      </div>
      <button class="carousel-btn prev" type="button" aria-label="上一张">‹</button>
      <button class="carousel-btn next" type="button" aria-label="下一张">›</button>
      <div class="carousel-dots" role="tablist" aria-label="轮播图切换"></div>
    </section>`;
}

export function renderHome(data) {
  const sectionsHtml = HOME_SECTION_ORDER.map(key => {
    const sec = data.sections[key];
    if (!sec) return '';

    const listHtml = sec.articles.length
      ? `<ul class="home-article-list">${sec.articles.slice(0, 5).map(a => `
          <li>
            <a class="home-article" href="#/${key}/${a.id}">
              <span class="title">${esc(truncateTitle(a.title))}</span>
              <time datetime="${esc(a.date)}">${esc(a.date)}</time>
            </a>
          </li>`).join('')}</ul>`
      : `<p class="home-empty">板块建设中(。・∀・)ノ</p>`;

    return `
      <section class="home-section">
        <div class="home-section-head">
          <h2><a href="#/${key}">${esc(sec.title)}</a></h2>
          <a class="more" href="#/${key}">更多 &gt;&gt;</a>
        </div>
        ${listHtml}
      </section>`;
  }).join('');

  const linksHtml = FRIEND_LINKS.map(l =>
    `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.name)}</a></li>`
  ).join('');

  return `
    ${renderCarousel()}
    <section class="home-sections">${sectionsHtml}</section>
    <section class="friend-links">
      <h2>友情链接</h2>
      <ul>${linksHtml}</ul>
    </section>`;
}

export function renderSection(data, key) {
  const sec = data.sections[key];
  const rows = sec.articles.map(a => `
    <li class="article-row">
      <a href="#/${key}/${a.id}">
        <h3>${esc(a.title)}</h3>
        <p>${esc(a.summary || '')}</p>
        <time datetime="${esc(a.date)}">${esc(a.date)}</time>
      </a>
    </li>`).join('');

  return `
    <nav class="crumbs"><a href="#/home">首页</a> / <span>${esc(sec.title)}</span></nav>
    <header class="page-head">
      <h1>${esc(sec.title)}</h1>
      <p>${esc(sec.intro)}</p>
    </header>
    <ul class="article-rows">${rows}</ul>`;
}

export async function renderArticle(app, data, key, id) {
  const sec = data.sections[key];
  const art = sec && sec.articles.find(a => a.id === id);
  if (!art) {
    app.innerHTML = renderNotFound();
    return;
  }

  app.innerHTML = `
    <div class="article-layout">
      <div class="article-main">
        <nav class="crumbs">
          <a href="#/home">首页</a> /
          <a href="#/${key}">${esc(sec.title)}</a> /
          <span>${esc(art.title)}</span>
        </nav>
        <article class="article">
          ${art.summary ? `<p class="summary">${esc(art.summary)}</p>` : ''}
          <div class="article-body" id="articleBody"></div>
        </article>
      </div>
      <aside class="article-aside">
        <section class="article-info" aria-label="文章信息">
          <h1 class="article-info-title">${esc(art.title)}</h1>
          ${art.subtitle ? `<p class="article-subtitle">${esc(art.subtitle)}</p>` : ''}
          <dl class="article-meta-list">
            <div><dt>作者</dt><dd>${esc(art.author || '一立方厘米微光')}</dd></div>
            <div><dt>发表时间</dt><dd>${esc(art.date)}</dd></div>
            <div><dt>字数</dt><dd><span id="wordCount">--</span></dd></div>
            <div><dt>阅读时长</dt><dd><span id="readMinutes">--</span></dd></div>
          </dl>
        </section>
        <nav class="article-toc" id="articleToc" aria-label="文章目录"></nav>
      </aside>
    </div>`;

  const body = document.getElementById('articleBody');
  let loadOk = false;

  if (art.file) {
    try {
      body.innerHTML = await fetchText(art.file);
      enhanceArticleBody(body);
      loadOk = true;
    } catch (err) {
      body.innerHTML = `
        <div class="placeholder">
          <p class="big">内容加载失败</p>
          <p>${esc(err.message)}</p>
        </div>`;
    }
  } else {
    body.innerHTML = `
      <div class="placeholder">
        <p class="big">文章整理中</p>
        <p>这篇内容还没有发布，敬请期待。</p>
      </div>`;
  }

  const wordEl = document.getElementById('wordCount');
  const readEl = document.getElementById('readMinutes');
  if (loadOk && wordEl && readEl) {
    const wc = countWords(body.textContent);
    wordEl.textContent = `约 ${wc} 字`;
    readEl.textContent = `约 ${Math.max(1, Math.ceil(wc / 400))} 分钟`;
  }

  buildArticleToc(body, document.getElementById('articleToc'));
}

function enhanceArticleBody(root) {
  root.querySelectorAll('ul.res-list li').forEach(li => {
    li.querySelectorAll('b').forEach(b => {
      if (b.closest('a')) return;
      const a = b.nextElementSibling;
      if (!a || a.tagName !== 'A') return;

      const newA = document.createElement('a');
      newA.href = a.getAttribute('href');
      if (a.target) newA.target = a.target;
      if (a.rel) newA.rel = a.rel;
      newA.appendChild(b.cloneNode(true));

      b.replaceWith(newA);
      a.remove();
    });

    const walker = document.createTreeWalker(li, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const txt = node.nodeValue;
      const idx = txt.indexOf('——');
      if (idx === -1) continue;

      const before = txt.slice(0, idx).replace(/\s+$/, '');
      const after = txt.slice(idx + 2).replace(/^\s+/, '');

      const frag = document.createDocumentFragment();
      if (before.trim()) frag.appendChild(document.createTextNode(before + ' '));
      frag.appendChild(document.createElement('br'));
      if (after) frag.appendChild(document.createTextNode(after));

      node.parentNode.replaceChild(frag, node);
      break;
    }
  });
}

export function renderAbout(data) {
  const paras = data.about.map(p => `<p>${esc(p)}</p>`).join('');
  return `
    <nav class="crumbs"><a href="#/home">首页</a> / <span>关于</span></nav>
    <section class="about">
      <h1>关于我们</h1>
      <div class="about-card">
        <div class="about-text">${paras}</div>
      </div>
    </section>`;
}

export function renderNotFound() {
  return `
    <div class="placeholder">
      <p class="big">页面不存在</p>
      <p><a href="#/home">返回首页</a></p>
    </div>`;
}