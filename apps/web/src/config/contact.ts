/**
 * CẤU HÌNH LIÊN HỆ TRUNG TÂM (SINGLE SOURCE OF TRUTH)
 * Nhà rạp Thái Đăng - Hệ thống Quản trị & Cổng Khách hàng
 * 
 * QUY TẮC BẮT BUỘC THEO YÊU CẦU DỰ ÁN:
 * 1. Không tự chọn một số điện thoại bất kỳ.
 * 2. Số chính thức cần dùng là: [CHỦ ĐƠN VỊ XÁC NHẬN SỐ NÀY].
 * 3. Nếu chưa có giá trị này, để cấu hình chờ cập nhật và báo rõ cần xác nhận.
 * 4. Tất cả Header, Footer, Trang liên hệ, Mobile Drawer và API đều đọc chung từ nguồn này.
 */

export const CONTACT_CONFIG = {
  // Trạng thái xác nhận từ chủ đơn vị
  isConfirmedByOwner: false,

  // Số điện thoại chính thức chờ xác nhận từ Chủ đơn vị Thái Đăng
  // Giá trị theo yêu cầu: [CHỦ ĐƠN VỊ XÁC NHẬN SỐ NÀY]
  OFFICIAL_HOTLINE_PLACEHOLDER: '[CHỦ ĐƠN VỊ XÁC NHẬN SỐ NÀY]',

  // Các số điện thoại đã phát hiện trong hệ thống & phiên kiểm thử trước đó:
  DISCOVERED_NUMBERS: {
    sourceInitialCode: '0988 112 233',  // Khởi tạo trong INITIAL_COMPANY_INFO (store.ts)
    sourceLocalStorageCms: '0349.481.256', // Nhập trong form Admin Cài Đặt Hệ Thống trên trình duyệt thử nghiệm
  },

  // Số hiển thị mặc định tạm thời trên giao diện cho đến khi Chủ đơn vị xác nhận chính thức:
  // Lưu ý: Có gắn nhãn chờ xác nhận nếu cần.
  DEFAULT_HOTLINE: '0988 112 233',
  DEFAULT_ZALO: '0988 112 233',

  // Thông tin thương hiệu
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
 * Nếu đã có cấu hình trong DB/Store thì dùng, nếu rỗng thì fallback về nguồn trung tâm.
 */
export function getOfficialContactHotline(configuredNumber?: string): string {
  if (configuredNumber && configuredNumber.trim()) {
    return configuredNumber;
  }
  return CONTACT_CONFIG.DEFAULT_HOTLINE;
}
