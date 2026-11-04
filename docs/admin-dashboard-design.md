# Giao diện quản trị Thái Đăng

Giao diện theo ảnh tham chiếu: nền kem, màu xanh ngọc, điểm nhấn cam, banner phong cảnh, thẻ thống kê có họa tiết sóng và bảng sự kiện/công nợ. Các thay đổi nằm trong `apps/web/src/components/AdminPortal.tsx`, `AdminPortal.css` và `AdminGreetingBanner.tsx`.

Ảnh nền: `apps/web/public/admin-landscape.png`. Tạo bằng công cụ imagegen tích hợp, không dùng API/CLI. Khi build, Vite sao chép ảnh vào bản phân phối; lệnh build ở gốc dự án cập nhật cả `public/` và `dist/`.

Đồng hồ dùng múi giờ `Asia/Ho_Chi_Minh`, hiển thị ngày Dương/Âm hiện tại. Phần thời tiết minh họa đã thay bằng lịch hôm nay. Dashboard dùng bảng lịch/hợp đồng thống nhất, có bộ lọc tháng/năm, biểu đồ doanh thu và lịch công việc thu nhỏ. Xem [hướng dẫn dữ liệu](SUPABASE-SETUP.md) và [ảnh mới](event-dashboard-desktop.png).

Prompt tạo ảnh:

> Use case: stylized-concept. Asset type: ultra-wide landscape background for a Vietnamese event business admin dashboard greeting banner. Generate a refined, lush, painterly-realistic panorama of Ninh Binh Vietnam: limestone karst mountains to the center-right, a calm lake and rice fields, a small elegant ivory-white wedding marquee near the water in the right-center, warm pale cream sunrise sky with a couple of tiny flying birds, delicate green leaves framing the upper-left corner, subtle flowers near bottom edges. Palette: warm ivory and champagne sunlight, forest green, olive, sage, soft gold. Composition: extremely wide panoramic banner around 5:1, full bleed, keep the left half mostly bright soft sky and distant hazy landscape with low visual detail so dark green HTML greeting text can be overlaid, rich green scenery on the right behind a frosted widget. Premium editorial scenic illustration with realistic detail, quiet and inviting. NO text, NO typography, NO user interface, NO watermarks, NO logos. Save the generated asset for use in the current project.
