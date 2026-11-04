# Kiểm tra nâng cấp quy trình · 03/11/2026

- TypeScript: không có lỗi, dùng `apps/web/tsconfig.json` chính thức.
- `npm test`: 14 kiểm thử nghiệp vụ đạt.
- `npm run test:db`: 11 kiểm thử đạt. Thực thi cả bốn migration trên PostgreSQL cục bộ/PGlite, kiểm tra dữ liệu cũ, RLS, chủ sở hữu, phiên bản đồng thời, thiếu kho, chuyển hợp đồng, thanh toán/trả kho, đồng quản lý thiệp, RSVP công khai và quyền tải ảnh.
- Edge headless, hồ sơ mới riêng: 19 kiểm tra luồng người dùng đạt ở desktop 1440×1000 và mobile 390×844, không có lỗi JavaScript. Chi tiết tại [event-workflow-browser-checks.json](event-workflow-browser-checks.json).
- Browser đã thao tác biểu mẫu đăng ký tài khoản, giữ bản nháp khi đăng nhập, gửi lịch, mở/đóng modal, trạng thái hợp đồng, tạo/công bố thiệp, tải ảnh/album/QR hai bên, cấp quyền người thứ hai, gửi lại RSVP, duyệt lời chúc và tải lại dữ liệu. Dữ liệu thử nằm trong hồ sơ trình duyệt riêng, không thay dữ liệu đang dùng trên localhost:5173.
- Ảnh giao diện: [Dashboard](event-dashboard-desktop.png), [đặt lịch điện thoại](booking-mobile.png).

Chưa kết nối dự án Supabase thật, chưa chạy migration trên máy chủ, chưa xác minh gửi email Auth hoặc upload Storage qua mạng. Tải ảnh và đăng nhập trong kiểm tra trình duyệt dùng chế độ cục bộ; quyền server được kiểm tra riêng bằng PostgreSQL. Thực hiện các bước trong [SUPABASE-SETUP.md](SUPABASE-SETUP.md) để bật và kiểm tra xuyên thiết bị.
