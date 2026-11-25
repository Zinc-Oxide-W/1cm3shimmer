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
const backToTop = document.getElementById('backToTop');

let siteData = null;
let rendered = false;
let carouselTimer = null;

/* 兼容文章正文中手写目录的 onclick="scrollToId('...')" */
window.scrollToId = function (id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

init();

async function init() {
  document.getElementById('year').textContent = new Date().getFullYear();
  initTheme(themeBtn);
  initBackToTop();

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

function clearCarousel() {
  if (carouselTimer) {
    clearInterval(carouselTimer);
    carouselTimer = null;
  }
}

function initCarousel() {
  clearCarousel();
  const root = document.getElementById('homeCarousel');
  if (!root) return;

  const track = root.querySelector('.carousel-track');
  const slides = [...root.querySelectorAll('.carousel-slide')];
  const dotsWrap = root.querySelector('.carousel-dots');
  const prevBtn = root.querySelector('.prev');
  const nextBtn = root.querySelector('.next');
  if (!slides.length) return;

  let index = 0;

  dotsWrap.innerHTML = slides.map((_, i) =>
    `<button type="button" role="tab" aria-label="第 ${i + 1} 张" aria-selected="${i === 0}"></button>`
  ).join('');
  const dots = [...dotsWrap.querySelectorAll('button')];

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((d, di) => {
      d.classList.toggle('active', di === index);
      d.setAttribute('aria-selected', String(di === index));
    });
  }

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  function restart() {
    clearCarousel();
    carouselTimer = setInterval(next, 5000);
  }

  prevBtn.addEventListener('click', () => { prev(); restart(); });
  nextBtn.addEventListener('click', () => { next(); restart(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); restart(); }));

  root.addEventListener('mouseenter', clearCarousel);
  root.addEventListener('mouseleave', restart);

  goTo(0);
  restart();
}

function initBackToTop() {
  if (!backToTop) return;
  const onScroll = () => {
    backToTop.classList.toggle('visible', window.scrollY > 240);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

async function route() {
  clearCarousel();
  const hash = location.hash;

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
    initCarousel();
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