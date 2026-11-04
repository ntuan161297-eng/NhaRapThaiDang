import type { WeddingContent, WeddingStyle } from '@thai-dang/shared';
export const weddingStyles: { id: WeddingStyle; name: string; subtitle: string; mark: string }[] = [
  { id: 'quan_ho', name: 'Quan họ', subtitle: 'Xanh trầu · sen vàng · duyên Kinh Bắc', mark: '囍' },
  { id: 'cong_nghe', name: 'Công nghệ', subtitle: 'Ánh sáng số · hiện đại · giao thoa', mark: '∞' },
  { id: 'hoang_gia', name: 'Hoàng gia', subtitle: 'Đỏ nhung · vàng kim · nghi lễ', mark: '♛' },
  { id: 'thanh_lich', name: 'Thanh lịch', subtitle: 'Giấy ngà · xanh sage · tinh giản', mark: '❧' },
  { id: 'sang_trong', name: 'Sang trọng', subtitle: 'Đen nhung · champagne · thanh âm', mark: '✦' },
];
export function normalizeWedding(content: WeddingContent): WeddingContent {
  return { ...content, style: weddingStyles.some(style => style.id === content.style) ? content.style : 'thanh_lich', guestSalutation: content.guestSalutation || 'Quý khách', guestName: content.guestName || '', closingMessage: content.closingMessage || 'Sự hiện diện của quý khách là niềm vinh hạnh của hai gia đình.', musicUrl: content.musicUrl || '', videoUrl: content.videoUrl || '', rsvpDeadline: content.rsvpDeadline || '', transportNote: content.transportNote || '', milestones: content.milestones || [], bride: { ...content.bride, portraitUrl: content.bride.portraitUrl || '' }, groom: { ...content.groom, portraitUrl: content.groom.portraitUrl || '' } };
}
export const safeMediaUrl = (value?: string) => { try { const url = new URL(value || ''); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; } };
