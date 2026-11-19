const STORAGE_KEY = 'weiguang-theme';

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
  }
}