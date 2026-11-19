export function buildArticleToc(articleBody, tocRoot) {
  if (!tocRoot) return;

  const headings = [...articleBody.querySelectorAll('h2, h3')];
  if (!headings.length) {
    tocRoot.closest('.article-aside')?.remove();
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
    const level = h.tagName === 'H3' ? 'lvl-3' : 'lvl-2';
    return `<li class="${level}"><a href="#${h.id}">${h.textContent}</a></li>`;
  });

  tocRoot.innerHTML = `<h3>目录</h3><ol>${items.join('')}</ol>`;
}