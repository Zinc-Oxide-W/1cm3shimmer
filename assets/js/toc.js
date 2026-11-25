import { esc } from './utils.js';

export function buildArticleToc(articleBody, tocRoot) {
  if (!tocRoot || !articleBody) return;

  const headings = [...articleBody.querySelectorAll('h2, h3, h4')];
  if (!headings.length) {
    tocRoot.remove();
    return;
  }

  const used = new Set();
  const items = headings.map((h, i) => {
    if (!h.id) {
      let slug = `section-${i + 1}`;
      while (used.has(slug)) slug += '-x';
      h.id = slug;
    }
    used.add(h.id);
    const tag = h.tagName.toLowerCase();
    const text = h.textContent.trim();
    return `<li class="toc-${tag}"><a href="#${h.id}" title="${esc(text)}">${esc(text)}</a></li>`;
  }).join('');

  tocRoot.innerHTML = `<h3 class="toc-title">目录</h3><ol class="toc-list">${items}</ol>`;
}