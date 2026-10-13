# HỆ THỐNG QUẢN LÝ SỰ KIỆN & RẠP CƯỚI - NHÀ RẠP THÁI ĐĂNG

Hệ thống quản lý chuyên sâu và toàn diện dành cho **NHÀ RẠP THÁI ĐĂNG** (Đơn vị tổ chức sự kiện, dịch vụ rạp cưới, bàn ghế, âm thanh ánh sáng và nấu cỗ tại Bắc Giang).

---

## 1. TỔNG QUAN KIẾN TRÚC & CÔNG NGHỆ

- **Ngôn ngữ**: TypeScript 100% end-to-end.
- **Cấu trúc Monorepo**:
  - `packages/shared`: Chứa toàn bộ Types, Business Logic, Validation, Ma trận phân quyền (RBAC), Quy tắc quy đổi bàn ghế, Engine kiểm tra khả dụng kho theo thời gian thực và Workflow xác nhận Job có tính Idempotent.
  - `apps/web`: Ứng dụng Web hợp nhất gồm:
    1. **Website Khách hàng (Cổng ngoài mặc định)**: Thiết kế đẳng cấp lấy cảm hứng từ **Trống Đồng Palace** với tông màu hoàng gia (Royal Gold & Deep Navy), typography Cormorant Garamond & Montserrat, hero banner sang trọng, triết lý dịch vụ, thư viện mẫu phông rạp cao cấp, bộ tính toán bàn ghế thời gian thực, gửi booking và tra cứu tiến độ.
    2. **Đăng nhập & Đăng ký Khách hàng**: Khách hàng có thể đăng ký tài khoản hoặc đăng nhập để theo dõi hồ sơ đặt tiệc.
    3. **Cổng Đăng nhập Quản Trị**: Màn hình đăng nhập tài khoản nhân viên các bộ phận.
    4. **Web Quản lý (Admin Portal với Left Menu Sidebar ERP)**:
       - Thanh điều hướng bên trái (Left Sidebar) cố định phân chia 7 nhóm hợp phần.
       - Quản Lý Khách Hàng (Customer CRM): Danh bạ, lịch sử tiệc, phân nhóm VIP.
       - Quản Lý Nhân Sự & Phân Quyền (Staff Accounts & RBAC): Cấp tài khoản nhân viên, đổi vai trò, khóa/mở tài khoản.
       - Dashboard, Tiếp nhận hồ sơ & Khảo sát, Jobs & 7 Đầu việc chuẩn, Kho & Timeline Checker, Lịch biểu, Báo giá & Thu tiền, Audit logs.
    5. **Sẵn sàng đóng gói Android APK**: Dùng Capacitor (`npx cap add android`) dùng chung backend.
  - `supabase/`:
    - `migrations/20261012000001_initial_schema.sql`: Schema cơ sở dữ liệu PostgreSQL hoàn chỉnh, bao gồm Row Level Security (RLS) cho 6 vai trò và bảng Audit Logs.
    - `seed.sql`: Bộ dữ liệu mẫu thực tế đáp ứng 100% tiêu chí nghiệm thu.
- **Styling**: Tailwind CSS với hiệu ứng Glassmorphism hiện đại, responsive hoàn hảo trên Mobile và Desktop.
- **Thời gian & Múi giờ**: Múi giờ chuẩn `Asia/Ho_Chi_Minh`. Tách biệt rõ **thời gian diễn ra tiệc** khỏi **thời gian chiếm dụng thiết bị** (lắp dựng trước và thu hồi sau).

---

## 2. KẾT QUẢ KIỂM THỬ THỰC TẾ (AUTOMATED TEST RESULTS)

Bộ kiểm thử được viết và chạy thực tế thông qua test runner tích hợp của Node.js:
Lệnh chạy: `npm test` hoặc `node --experimental-strip-types packages/shared/test/business-rules.test.ts`

```text
TAP version 13
# Subtest: QUY TẮC 1: Quy đổi 20 bàn x 6 ghế inox + 10 bàn x 6 ghế nhựa đỏ đúng 30 bàn, 120 ghế inox, 60 ghế nhựa đỏ
ok 1 - QUY TẮC 1: Quy đổi 20 bàn x 6 ghế inox + 10 bàn x 6 ghế nhựa đỏ đúng 30 bàn, 120 ghế inox, 60 ghế nhựa đỏ
# Subtest: QUY TẮC 2: Cộng dồn nhu cầu khi trùng thời gian và không cộng sai khi không trùng
ok 2 - QUY TẮC 2: Cộng dồn nhu cầu khi trùng thời gian và không cộng sai khi không trùng
# Subtest: QUY TẮC 3: Xác nhận lặp không tạo Job hoặc giữ kho trùng (Idempotent)
ok 3 - QUY TẮC 3: Xác nhận lặp không tạo Job hoặc giữ kho trùng (Idempotent)
# Subtest: QUY TẮC 4: Thiếu dụng cụ thì chặn xác nhận Job và báo rõ danh mục thiếu
ok 4 - QUY TẮC 4: Thiếu dụng cụ thì chặn xác nhận Job và báo rõ danh mục thiếu
# Subtest: QUY TẮC 5: Xuất sau khi giữ không bị trừ hai lần (Chuyển trạng thái held -> dispatched)
ok 5 - QUY TẮC 5: Xuất sau khi giữ không bị trừ hai lần (Chuyển trạng thái held -> dispatched)
# Subtest: QUY TẮC 6: Hủy Job đã xuất không tự đưa dụng cụ trở lại kho
ok 6 - QUY TẮC 6: Hủy Job đã xuất không tự đưa dụng cụ trở lại kho
# Subtest: QUY TẮC 7: Phân quyền RBAC bảo vệ dữ liệu
ok 7 - QUY TẮC 7: Phân quyền RBAC bảo vệ dữ liệu
1..7
# tests 7
# pass 7
# fail 0
```

---

## 3. DỮ LIỆU MẪU NGHIỆM THU (SEED SCENARIOS)

Hệ thống được nạp sẵn kịch bản dữ liệu kiểm thử thực tế:
1. **3 Đám Cưới**:
   - `JOB-202610-001` (Anh Tuấn Anh & Chị Mai Linh): Tone Hoàng Gia, tiệc ngày 24/10, rạp 6 khoang, 20 bàn tròn ghế inox + 10 bàn tròn ghế nhựa đỏ.
   - `JOB-202610-002` (Anh Quốc Bảo & Chị Lan Hương): Tone Rustic, tiệc tối ngày 24/10, rạp 5 khoang, 15 bàn tròn ghế inox.
   - `INTAKE-004` (Anh Minh Đức & Chị Thu Trang): Tone Đỏ Hỷ Sự, tiệc ngày 28/10, trạng thái Chờ xác nhận.
2. **1 Nhà Mới (Tân Gia)**:
   - `JOB-202610-003` (Anh Nguyễn Trọng Hưng): Tiệc trưa 24/10, 8 bàn tròn ghế nhựa đỏ.
   - **Tình huống trùng lịch**: Job 1, Job 2 và Job 3 cùng chiếm dụng kho vào ngày 24/10, dẫn đến việc ghế inox chạm sát ngưỡng dự phòng an toàn (220/220 cái).
3. **1 Đám Hiếu (Tang Lễ)**:
   - `JOB-202610-005` (Tang lễ Cụ Bà Nguyễn Thị Thịnh): Tiệc diễn ra 10-11/10.
   - **Tình huống thiết bị quá hạn chưa thu hồi**: Job đã hoàn tất phục vụ nhưng thủ kho chưa kiểm đếm trả kho. Thiết bị vẫn ở trạng thái `dispatched` ngoài hiện trường và tiếp tục chiếm dụng kho cho đến khi kiểm đếm thực tế.
4. **Dụng cụ đang bảo dưỡng / sửa chữa**:
   - 5 bàn tròn đang hàn chân.
   - 10 ghế nhựa đỏ đang thay tựa lưng.
   - Sức chứa vật lý tự động trừ các thiết bị đang hỏng trước khi tính khả dụng.

---

## 4. HƯỚNG DẪN CÀI ĐẶT VÀ CHẠY LOCAL

### Yêu cầu môi trường
- Node.js >= 18 (Đã kiểm thử tối ưu trên Node v22.14.0).
- Trình quản lý gói `npm`.

### Các bước khởi chạy
```bash
# 1. Chuyển vào thư mục dự án
cd C:\Users\Admin\.gemini\antigravity-ide\scratch\thai-dang-events

# 2. Chạy bộ kiểm thử các quy tắc nghiệp vụ
npm test

# 3. Khởi động máy chủ phát triển Web
npm run dev

# 4. Mở trình duyệt và truy cập:
# http://localhost:5173/
```

### Chuyển đổi giữa Website Khách hàng và Web Quản lý
- Ở thanh Header trên cùng, bấm chọn **Website Khách Hàng** hoặc **Web Quản Lý Điều Hành**.
- Để kiểm tra phân quyền RBAC, bấm vào nút vai trò người dùng (ví dụ: `Nguyễn Văn Thái (Chủ đơn vị)`) để chuyển sang:
  - `Trần Văn Đăng (Quản lý điều hành)`
  - `Lê Thị Mai (Tư vấn & Sale)`
  - `Phạm Văn Nam (Thủ kho thiết bị)`
  - `Vũ Thị Hương (Kế toán)`
  - `Đỗ Anh Tuấn (Nhân viên hiện trường)`
- Nút tròn mũi tên ở góc phải Header cho phép **Khôi phục lại toàn bộ dữ liệu mẫu** bất kỳ lúc nào.

---

## 5. DANH SÁCH ĐÃ TRIỂN KHAI VÀ GIAI ĐOẠN TIẾP THEO

### Đã hoàn thành (Vòng 1):
- [x] Mô hình dữ liệu và kiểm tra kiểu TypeScript dùng chung (`@thai-dang/shared`).
- [x] Quy tắc quy đổi bàn ghế theo cấu hình khu vực và loại ghế (inox vs nhựa đỏ).
- [x] Engine kiểm tra khả năng đáp ứng của kho theo thời gian và thời gian luân chuyển vệ sinh.
- [x] Quy trình tiếp nhận, khảo sát mặt bằng, bỏ qua khảo sát khi đủ điều kiện, xác nhận thành Job nguyên tử & Idempotent.
- [x] Quản lý vòng đời Job với 7 đầu việc chuẩn.
- [x] Chuyển trạng thái xuất kho không bị trừ hai lần; hủy Job đã xuất không tự động hồi kho.
- [x] Website khách hàng: Showcase dịch vụ, chủ đề phông rạp, bộ tính bàn ghế trực quan, gửi booking, tra cứu hồ sơ.
- [x] Web quản lý: Dashboard KPI, Tiếp nhận hồ sơ, Quản lý Job, Quản lý kho, Lịch biểu Asia/Ho_Chi_Minh, Báo giá & Thu tiền cọc, Nhật ký kiểm toán.
- [x] Bộ kiểm thử tự động 7 kịch bản nghiệp vụ trọng yếu.
- [x] File migration SQL Supabase có RLS và file `seed.sql`.

### Kế hoạch giai đoạn tiếp theo (Giai đoạn sau):
- Thiệp cưới online có mã QR và trang RSVP mừng cưới.
- Lịch âm Việt Nam tính toán can chi và tháng nhuận.
- Bản đồ tọa độ điều phối các điểm và gợi ý tuyến đường xe tải.
- Đóng gói file APK nội bộ bằng Capacitor (`npx cap add android`).
- Báo cáo mua sắm khấu hao và lợi nhuận nâng cao.
