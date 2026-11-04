export function publicLink(value: string | undefined, fallback = '#dat-lich'): string {
  if (!value?.trim()) return fallback;
  try {
    const url = new URL(value, window.location.href);
    return ['http:', 'https:', 'tel:', 'mailto:'].includes(url.protocol) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function navigatePublicLink(value: string) {
  const href = publicLink(value);
  if (href.startsWith('#')) {
    if (href === '#tai-khoan' || href.startsWith('#tai-khoan/') || href === '#tra-cuu') { window.location.hash = href; return; }
    let id = href.slice(1) || 'top';
    try { id = decodeURIComponent(id); } catch { return; }
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      window.history.replaceState(null, '', `#${encodeURIComponent(id)}`);
      window.dispatchEvent(new Event('public-navigation'));
    } else window.location.hash = href;
    return;
  }
  window.location.assign(href);
}

export function vietnamDateAfter(days: number) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

export const ARTICLE_CATEGORIES = [
  { id: 'all', label: 'Tất cả bài viết' },
  { id: 'xu_huong_rap', label: 'Xu hướng rạp' },
  { id: 'kinh_nghiem_cuoi', label: 'Kinh nghiệm cưới' },
  { id: 'thuc_don_co', label: 'Thực đơn cỗ' },
];

export const articleCategoryLabel = (id: string) => ARTICLE_CATEGORIES.find(category => category.id === id)?.label || 'Cẩm nang';
