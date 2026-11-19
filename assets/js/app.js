import { fetchJSON } from './utils.js';
import { initTheme } from './theme.js';
import {
  renderHome,
  renderSection,
  renderArticle,
  renderAbout,
  renderNotFound
} from './render.js';

const app = document.getElementById('app');
const navEl = document.getElementById('nav');
const themeBtn = document.getElementById('themeBtn');

let siteData = null;
let rendered = false;

init();

async function init() {
  document.getElementById('year').textContent = new Date().getFullYear();
  initTheme(themeBtn);

  try {
    siteData = await fetchJSON('data/site.json');
  } catch (err) {
    app.innerHTML = `
      <div class="placeholder">
        <p class="big">站点数据加载失败</p>
        <p>${err.message}</p>
        <p>请通过本地服务器或静态托管访问本站。</p>
      </div>`;
    return;
  }

  renderNav(siteData.nav);
  window.addEventListener('hashchange', route);
  route();
}

function renderNav(nav) {
  navEl.innerHTML = nav.map(item =>
    `<a href="#/${item.key}" data-key="${item.key}">${item.label}</a>`
  ).join('');
}

function setActiveNav(key) {
  navEl.querySelectorAll('a').forEach(a => {
    const on = a.dataset.key === key;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  return raw.split('/').filter(Boolean).map(decodeURIComponent);
}

async function route() {
  const hash = location.hash;

  /* 文章内锚点（如 #astro-intro）不参与路由，交给浏览器滚动 */
  if (hash && !hash.startsWith('#/')) {
    if (!rendered) {
      location.replace('#/home');
      return;
    }
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) target.scrollIntoView();
    return;
  }

  rendered = true;
  const parts = parseHash();
  const key = parts[0] || 'home';

  document.body.dataset.section = '';

  if (key === 'home') {
    setActiveNav('home');
    app.innerHTML = renderHome(siteData);
    window.scrollTo(0, 0);
    return;
  }

  if (key === 'about') {
    setActiveNav('about');
    app.innerHTML = renderAbout(siteData);
    window.scrollTo(0, 0);
    return;
  }

  if (!siteData.sections[key]) {
    setActiveNav('');
    app.innerHTML = renderNotFound();
    return;
  }

  setActiveNav(key);
  document.body.dataset.section = key;

  if (parts[1]) {
    await renderArticle(app, siteData, key, parts[1]);
  } else {
    app.innerHTML = renderSection(siteData, key);
  }
  window.scrollTo(0, 0);
}