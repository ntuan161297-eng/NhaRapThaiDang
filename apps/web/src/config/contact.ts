/**
 * CẤU HÌNH LIÊN HỆ TRUNG TÂM (SINGLE SOURCE OF TRUTH)
 * Nhà rạp Thái Đăng - Hệ thống Quản trị & Cổng Khách hàng
 * 
 * SỐ CHÍNH THỨC ĐÃ ĐƯỢC CHỦ ĐƠN VỊ XÁC NHẬN: 0349.481.256
 */

export const CONTACT_CONFIG = {
  // Trạng thái đã xác nhận chính thức bởi Chủ đơn vị Thái Đăng
  isConfirmedByOwner: true,

  // Số Hotline & Zalo chính thức duy nhất trên toàn hệ thống
  DEFAULT_HOTLINE: '0349.481.256',
  DEFAULT_ZALO: '0349.481.256',

  // Thông tin thương hiệu & Địa chỉ
  BRAND_NAME: 'NHÀ RẠP THÁI ĐĂNG',
  SLOGAN: 'SỰ KIỆN TRỌN NIỀM VUI',
  ADDRESS: 'Thôn Trực Đông, xã Cổ Lễ, tỉnh Ninh Bình',
  EMAIL: 'sukien@nharapthaidang.vn',
  WORKING_HOURS: '07:30 - 22:00 (Phục vụ tận tâm chu đáo)',
  FACEBOOK_URL: 'https://facebook.com/nharapthaidang.ninhbinh',
  TIKTOK_URL: 'https://tiktok.com/@nharapthaidang',
  YOUTUBE_URL: 'https://youtube.com/@nharapthaidang',
} as const;

/**
 * Trả về hotline an toàn để hiển thị trên UI.
 * Mọi Header, Footer, Drawer mobile, Contact form và API đều đọc từ hàm này.
 */
export function getOfficialContactHotline(configuredNumber?: string): string {
  // Ưu tiên giá trị đã xác nhận chính thức từ CONTACT_CONFIG
  return CONTACT_CONFIG.DEFAULT_HOTLINE;
}
