const STORAGE_KEY = 'weiguang-theme';

/* 新增：两版 logo 路径 */
const LOGO_SRC = {
  light: 'logo%20v1-d.png',
  dark:  'logo%20v1-b.png'
};

export function initTheme(btn) {
  if (!btn) return;

  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  apply(saved || (prefersDark ? 'dark' : 'light'));

  btn.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    apply(next);
  });

  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);

    const dark = theme === 'dark';
    btn.textContent = dark ? '☀️' : '🌙';
    btn.setAttribute('aria-label', dark ? '切换到日间模式' : '切换到夜间模式');
    btn.setAttribute('title', dark ? '切换到日间模式' : '切换到夜间模式');
    btn.setAttribute('aria-pressed', String(dark));

    /* 新增：切换 logo 图片 */
    const logo = document.getElementById('siteLogo');
    if (logo) {
      logo.src = dark ? LOGO_SRC.dark : LOGO_SRC.light;
      logo.alt = dark ? '一立方厘米微光 Logo（夜间）' : '一立方厘米微光 Logo';
    }
  }
}