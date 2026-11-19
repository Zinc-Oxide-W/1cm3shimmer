export function esc(str) {
  return String(str).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

export async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`加载失败：${url}（${res.status}）`);
  return res.json();
}

export async function fetchText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`加载失败：${url}（${res.status}）`);
  return res.text();
}