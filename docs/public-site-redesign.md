# Nâng cấp giao diện public

Giao diện dùng nền kem, xanh ngọc và cam san hô. Phạm vi gồm header, slideshow, dịch vụ, bộ sưu tập mẫu rạp, giới thiệu, ưu đãi, đặt lịch, thiệp cưới, tra cứu, bài viết, liên hệ, footer và các hộp thoại chi tiết.

## Các điểm sửa

- Hiển thị tiêu đề, lời giới thiệu, vị trí và nút hành động của banner từ CMS. Có nút tạm dừng; giảm chuyển động theo cài đặt thiết bị; banner tắt không bị tự bật lại. Ảnh lỗi dùng ảnh dự phòng.
- Menu cố định khi cuộn, đổi mục đang xem, thu gọn trên màn hình nhỏ; hỗ trợ bàn phím và trả focus khi đóng menu/hộp thoại.
- Bổ sung nội dung đích cho “Về chúng tôi”; sửa điều hướng từ đăng nhập về các liên kết public.
- Đồng bộ chuyên mục bài viết, lượt xem, Facebook và Zalo với các trường dữ liệu hiện có. Bổ sung trạng thái rỗng.
- Tóm tắt cấu hình đặt lịch, liên kết đi đến các phần của biểu mẫu, ngày mặc định linh hoạt, giờ kết thúc và kiểm tra thứ tự thời gian. Kết quả lỗi không hiển thị trạng thái thành công.
- Luồng email mở trình soạn thư để khách kiểm tra và gửi, thay thông báo nhận yêu cầu khi chưa có thao tác gửi. Không thêm dịch vụ gửi email hay thay backend của dự án.
- Ảnh dịch vụ mới là ảnh minh họa, có ghi chú trong giao diện. Nội dung CMS đã lưu được giữ nguyên.

## Ảnh và prompt

Tạo bằng công cụ imagegen tích hợp, sau đó xuất JPEG chất lượng 86 để dùng trên web. Tổng bốn ảnh khoảng 1,7 MB thay vì 12,2 MB PNG ban đầu; các ảnh bên dưới banner được tải khi cần.

- `apps/web/public/public-wedding-hero.jpg`: banner mặc định, ảnh giới thiệu, dịch vụ cưới và ảnh dự phòng.
- `apps/web/public/public-engagement.jpg`: dịch vụ lễ ăn hỏi.
- `apps/web/public/public-housewarming.jpg`: dịch vụ tân gia.
- `apps/web/public/public-invitation.jpg`: giới thiệu thiệp cưới số.

Các prompt đầy đủ nằm trong [public-image-prompts.json](public-image-prompts.json). Ảnh PNG gốc được giữ trong thư mục đầu ra mặc định của imagegen.

## Kiểm tra

Các luồng kiểm tra dùng hồ sơ trình duyệt riêng để không ảnh hưởng dữ liệu đang dùng. Đợt thiết kế public ban đầu đã kiểm tra các độ rộng 320–1907 px. Đợt nâng cấp quy trình mới kiểm tra desktop 1440 px và điện thoại 390 px, gồm đăng ký/đăng nhập, đặt lịch, chuyển hợp đồng và thiệp cưới/RSVP. Các lỗi TypeScript cũ đã được sửa; dự án kiểm tra sạch bằng cấu hình chính thức.

Đã bỏ chương trình khuyến mại và quản lý nhân viên khỏi menu; thu gọn khoảng cách các vùng public. Đặt lịch chỉ còn bốn loại hình, chủ đề, ngày/giờ Dương → Âm, thời gian lắp/thu hồi dự kiến và liên hệ. Thiệp cưới có đủ hai bên gia đình, ảnh, QR, phản hồi và đồng quản lý. Hướng dẫn bật đồng bộ trực tuyến tại [SUPABASE-SETUP.md](SUPABASE-SETUP.md). Biểu mẫu liên hệ riêng vẫn mở ứng dụng soạn thư; chưa thử gửi email thực tế.

Ảnh xem trước: [Desktop](previews/public-desktop.png) · [Điện thoại](previews/public-mobile.png).
