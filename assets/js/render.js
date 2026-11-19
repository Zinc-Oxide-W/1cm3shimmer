import { esc, fetchText } from './utils.js';
import { buildArticleToc } from './toc.js';

/* --- 首页 --- */
export function renderHome(data) {
  const cards = Object.keys(data.sections).map(key => {
    const sec = data.sections[key];
    const items = sec.articles.slice(0, 3).map(a => `
      <li>
        <a href="#/${key}/${a.id}">
          <span class="t">${esc(a.title)}</span>
          <time datetime="${esc(a.date)}">${esc(a.date)}</time>
        </a>
      </li>`).join('');

    return `
      <article class="card">
        <div class="card-head">
          <h2><a href="#/${key}">${esc(sec.title)}</a></h2>
          <span class="card-sub">${esc(sec.subtitle)}</span>
        </div>
        <ul class="article-list">${items}</ul>
        <a class="more" href="#/${key}">查看全部 →</a>
      </article>`;
  }).join('');

  return `
    <section class="hero">
      <h1>继微光以怀星火，宗宇宙而法自然</h1>
      <p>欢迎来到一立方厘米微光的主页。在这里休息一下，看看科普，听听故事吧。</p>
      <p>温馨提示：网站目前比较草率……欢迎大家提出建议！φ(゜▽゜*)♪</p>
    </section>
    <section class="grid">${cards}</section>`;
}

/* --- 板块子页面 --- */
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

/* --- 文章页 --- */
export async function renderArticle(app, data, key, id) {
  const sec = data.sections[key];
  const art = sec && sec.articles.find(a => a.id === id);
  if (!art) {
    app.innerHTML = renderNotFound();
    return;
  }

  const metaParts = [art.date, sec.title, art.author].filter(Boolean);
  const meta = metaParts.map(esc).join(' · ');

  app.innerHTML = `
    <div class="article-layout">
      <div class="article-main">
        <nav class="crumbs">
          <a href="#/home">首页</a> /
          <a href="#/${key}">${esc(sec.title)}</a> /
          <span>${esc(art.title)}</span>
        </nav>
        <article class="article">
          <h1>${esc(art.title)}</h1>
          <p class="meta">${meta}</p>
          ${art.summary ? `<p class="summary">${esc(art.summary)}</p>` : ''}
          <div class="article-body" id="articleBody"></div>
        </article>
      </div>
      <aside class="article-aside">
        <nav class="article-toc" id="articleToc" aria-label="文章目录"></nav>
      </aside>
    </div>`;

  const body = document.getElementById('articleBody');
  if (art.file) {
    try {
      body.innerHTML = await fetchText(art.file);
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

  buildArticleToc(body, document.getElementById('articleToc'));
}

/* --- 关于我们 --- */
export function renderAbout(data) {
  const paras = data.about.map(p => `<p>${esc(p)}</p>`).join('');
  return `
    <nav class="crumbs"><a href="#/home">首页</a> / <span>关于我们</span></nav>
    <section class="about">
      <h1>关于我们</h1>
      <div class="about-card">
        <div class="about-text">${paras}</div>
      </div>
    </section>`;
}

/* --- 404 --- */
export function renderNotFound() {
  return `
    <div class="placeholder">
      <p class="big">页面不存在</p>
      <p><a href="#/home">返回首页</a></p>
    </div>`;
}