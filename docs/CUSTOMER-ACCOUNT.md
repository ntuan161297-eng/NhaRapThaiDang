# Tài khoản khách hàng · 04/11/2026

Nút avatar/tên ở header mở menu giống cách dùng tài khoản trên mạng xã hội, gồm bốn mục:

- **Thông tin cá nhân**: họ tên, điện thoại và email đăng nhập; sửa họ tên/điện thoại, lưu và cập nhật tên ở header.
- **Quản lý thiệp online**: thiệp đã tạo, thiệp được cấp quyền, tạo thiệp từ lịch cưới/đám hỏi, quản lý khách mời/lời chúc.
- **Theo dõi lịch hẹn**: lịch đã đặt, hợp đồng, trạng thái và thanh toán; mở chi tiết hoặc đặt lịch mới.
- **Đăng xuất**: chờ kết quả đăng xuất, xóa phiên và đưa về trang public.

Tài khoản dùng trang riêng; khối quản lý cũ đã bỏ khỏi nội dung public. Các đường dẫn có thể mở trực tiếp và quay về đúng mục sau đăng nhập:

| Mục | Đường dẫn |
| --- | --- |
| Thông tin cá nhân | `#tai-khoan/thong-tin` |
| Thiệp online | `#tai-khoan/thiep-online` |
| Lịch hẹn | `#tai-khoan/lich-hen` |

`#tai-khoan` mở thông tin cá nhân; `#tra-cuu` vẫn mở lịch hẹn. Bấm ngoài hoặc Escape để đóng menu; hỗ trợ Tab, phím mũi tên, Home/End. Avatar dùng chữ viết tắt từ tên khách.

Hồ sơ cục bộ cập nhật trong tài khoản đã đăng ký và giữ nguyên thông tin xác thực. Khi cấu hình Supabase, cập nhật họ tên/điện thoại qua Supabase Auth của chính người dùng. Email giữ ở chế độ chỉ xem. Không cần migration mới cho thay đổi này.

Kiểm tra: TypeScript, production build và 19 kiểm tra Edge với hồ sơ trình duyệt riêng trên desktop 1440 px, điện thoại 390 px và header 320 px; không có lỗi JavaScript. Đã kiểm tra lưu hồ sơ qua reload, đăng nhập bằng số điện thoại mới, quyền truy cập trang tài khoản, liên kết thiệp/lịch, điều hướng quay lại public và đăng xuất. Chưa kiểm tra cập nhật hồ sơ trên dự án Supabase thật do chưa có cấu hình.

Ảnh: [Menu desktop](previews/customer-account-menu-desktop.png), [hồ sơ desktop](previews/customer-account-profile-desktop.png), [menu điện thoại](previews/customer-account-menu-mobile.png), [hồ sơ điện thoại](previews/customer-account-profile-mobile.png).
