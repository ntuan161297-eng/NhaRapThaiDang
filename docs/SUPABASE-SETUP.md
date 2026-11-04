# Kết nối đặt lịch, hợp đồng và thiệp cưới

Ứng dụng đã có kết nối Supabase. Repository chưa có URL/key thật; migration chưa được áp dụng lên dự án trực tuyến. Khi chưa cấu hình, ứng dụng chạy cục bộ, không nhận RSVP từ thiết bị khác. Dữ liệu cục bộ là bản xem thử, không phải cơ chế phân quyền trực tuyến.

## 1. Cấu hình frontend

Sao chép [apps/web/.env.local.example](../apps/web/.env.local.example) thành `apps/web/.env.local`. Điền **Project URL** và **publishable key** (hoặc legacy **anon key**) từ Supabase Dashboard vào `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. Không đưa database password, secret key hoặc service_role key vào biến `VITE_*`. File `.env.local` đã được Git bỏ qua.

Vite đọc cấu hình trong `apps/web`, không tự đọc file `.env` tại gốc monorepo. Khởi động lại `npm run dev` sau khi thay đổi. Với bản production, thiết lập hai biến trên ở môi trường build rồi chạy lại `npm run build`.

## 2. Áp dụng migration

Trên dự án mới, chạy các file trong `supabase/migrations` theo thứ tự:

1. `20261012000001_initial_schema.sql`
2. `20261013000002_site_settings_and_unified_api.sql`
3. `20261013000003_customers_and_core_entities_sync.sql`
4. `20261103000004_unified_events_and_wedding_invitations.sql`
5. `20261104000005_customer_account_management.sql`
6. `20261104000006_wedding_design_fields.sql`

Chỉ chạy các migration chưa áp dụng, theo đúng thứ tự. Nếu đã chạy đến file số 4, chạy tiếp file 5 và 6. Có thể dùng Supabase SQL Editor hoặc workflow migration hiện có. Migration số 4 nhập dữ liệu `intake_records`/`jobs` cũ vào `event_records`, giữ các bảng cũ làm lưu trữ và khóa đường ghi cũ để tránh hai nguồn dữ liệu. Không chạy lại nguyên file sau khi đã thành công vì các policy/trigger được tạo một lần.

`event_records` là nguồn chung cho đặt lịch, hợp đồng, khách hàng, kho đang giữ, lịch và dashboard. Chuyển hợp đồng cập nhật cùng ID/mã lịch; mã hợp đồng là thông tin bổ sung. Thanh toán là các khoản thu trong hồ sơ, độc lập với tiến độ công việc. Doanh thu dashboard tính theo ngày thu tiền tại Việt Nam; số lịch tính theo ngày tổ chức.

Không tự tải dữ liệu mẫu trong localStorage lên cloud. Với dữ liệu cũ chưa có tài khoản, quản trị điền email tài khoản khách đã đăng ký trong hồ sơ để liên kết. Không tự nhận chủ sở hữu chỉ qua số điện thoại nhập ở frontend.

## 3. Đăng nhập và cấp quyền quản trị

Bật Email/password trong Authentication. Thiết lập Site URL và Redirect URLs cho địa chỉ chạy ứng dụng, bao gồm địa chỉ development nếu cần (ví dụ `http://localhost:5173/**`) và URL production. Khi bật xác nhận email, khách phải xác nhận trước khi đăng nhập. Mật khẩu và phiên trực tuyến do Supabase Auth quản lý.

Đăng ký tài khoản quản trị qua giao diện, sau đó cấp quyền **từ SQL Editor của chủ dự án**, thay email ví dụ bằng email đã đăng ký:

```sql
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb)
  || '{"event_admin": true}'::jsonb
WHERE lower(email) = lower('admin@example.com');
```

Đăng xuất/đăng nhập lại để nhận quyền mới. Quyền cũng nhận diện các hồ sơ cũ đang hoạt động có vai trò `chu_don_vi`/`quan_ly`. Người dùng không thể tự cấp quyền qua `user_metadata`. Tài khoản mẫu `admin / 123456` chỉ dùng trong chế độ cục bộ và không đăng nhập được ở chế độ Supabase.

### Quản lý khách hàng và cấp lại mật khẩu

Mục **Tài khoản khách hàng** đọc danh sách tài khoản đã đăng ký, kể cả chưa có lịch hẹn. Migration số 5 bổ sung RPC chỉ quản trị được gọi; không trả hash/mật khẩu hoặc metadata nội bộ. Tìm bằng họ tên, email hoặc điện thoại, chọn **Cấp lại mật khẩu**, nhập/tạo mật khẩu mới và lưu. Không hiển thị mật khẩu cũ.

Với chế độ cục bộ, mật khẩu mới được băm và lưu ngay trên thiết bị. Với Supabase, chức năng này gọi Edge Function `supabase/functions/manage-customer-accounts/index.ts`; cần triển khai function trước khi sử dụng:

```powershell
supabase functions deploy manage-customer-accounts --project-ref YOUR_PROJECT_REF --no-verify-jwt
supabase secrets set 'ALLOWED_ORIGINS=https://your-domain.vn,http://localhost:5173,http://127.0.0.1:5173' --project-ref YOUR_PROJECT_REF
```

Thay Project Ref và tên miền bằng cấu hình của bạn. `--no-verify-jwt` chỉ tắt bước kiểm tra ở gateway; function tự xác thực token qua `auth.getUser()` và kiểm tra `event_is_admin()` trước mọi thao tác. Cách này dùng được cả dự án có signing key bất đối xứng. Function chỉ đặt lại mật khẩu khách hàng, không nhận thay đổi vai trò và không đặt lại mật khẩu quản trị/nhân sự. Mật khẩu và service key không được trả về hoặc ghi log.

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` là biến server của Edge Function, được Supabase cung cấp trong môi trường triển khai. Không đưa service key vào `.env.local` frontend hoặc `VITE_*`. Thiết lập `ALLOWED_ORIGINS` đúng domain chạy frontend; mặc định chỉ cho phép các địa chỉ development đã ghi trong source.

Giao mật khẩu mới cho đúng người qua kênh liên hệ đã xác minh. Việc đổi mật khẩu không cam kết thu hồi mọi phiên đang đăng nhập; nếu cần xử lý phiên bị lộ, dùng quy trình quản trị phiên của Supabase.

## 4. Thiệp cưới và ảnh

Khách bấm avatar/tên ở header → **Quản lý thiệp online** → tạo thiệp từ lịch cưới/đám hỏi của mình. Điền thông tin hai bên gia đình, lễ/tiệc, ảnh, tài khoản ngân hàng và tải ảnh QR của từng bên. Kiểm tra QR thực tế trước khi công bố. Mỗi hồ sơ có một thiệp; có thể thêm nhiều lễ/tiệc, tối đa 8 buổi và 12 ảnh album.

Có 5 phong cách: Quan họ, Công nghệ, Hoàng gia, Thanh lịch, Sang trọng. Chọn mẫu không mất nội dung. Các trường bổ sung gồm danh xưng/tên khách mời, nhà tổ chức lễ/tiệc, ảnh riêng hai người, hành trình tình yêu (tối đa 8 dấu mốc), nhạc MP3, video, hướng dẫn đi lại, hạn RSVP và lời cảm ơn. Nhạc chỉ phát khi khách bấm. Thiệp cũ chưa có các trường này vẫn mở được.

Migration số 6 kiểm tra phong cách/trường bổ sung và chặn RSVP sau hạn theo giờ Việt Nam. Chủ thiệp vẫn duyệt/ẩn lời chúc sau hạn. Phản hồi bổ sung phân loại khách nhà trai/nhà gái và ghi chú riêng; các trường này không xuất hiện trong API lời chúc công khai.

Migration tạo bucket public `wedding-photos`: JPG/PNG/WebP tối đa 5 MB/ảnh, đường dẫn tải lên thuộc tài khoản đang đăng nhập. Ảnh đã tải có URL công khai để khách mời xem được; ngừng công bố thiệp không tự xóa ảnh đã tải. Không tải tài liệu riêng tư vào bucket này.

Để hai người cùng quản lý, người còn lại đăng ký tài khoản trước. Trong trình sửa thiệp, nhập email → **Cấp quyền**. Hai tài khoản xem được danh sách RSVP, số người, liên hệ, lời chúc, xuất CSV và duyệt lời chúc.

Khách mời mở liên kết `/#thiep/<slug>` không cần đăng nhập. Một token lưu trên trình duyệt cho phép gửi lại để cập nhật cùng phản hồi; thiết bị/trình duyệt khác tạo phản hồi khác. Điện thoại khách mời chỉ quản lý thiệp thấy. Chỉ lời chúc được khách cho phép và người quản lý duyệt mới hiện công khai. Mọi lần chỉnh sửa lời chúc cần được duyệt lại.

## 5. Kiểm tra sau khi kết nối

- Đăng ký hai tài khoản, đặt lịch bằng tài khoản thứ nhất; tài khoản thứ hai không thấy lịch đó.
- Quản trị tiếp nhận, chuyển cùng hồ sơ sang hợp đồng sau khi điền địa điểm/dụng cụ/đơn giá; kiểm tra báo thiếu kho khi trùng thời gian.
- Chuyển tiến độ đến Hoàn thành; hồ sơ vẫn Chưa thanh toán đến khi nhập đủ khoản thu. Xác nhận trả kho thực tế riêng.
- Tạo/công bố thiệp, cấp quyền tài khoản thứ hai. Mở thiệp trên thiết bị khác, gửi RSVP/lời chúc rồi duyệt ở tài khoản quản lý.
- Kiểm tra upload ảnh và QR. Nếu lỗi quyền/RPC, kiểm tra migration, auth và thông báo lỗi; ứng dụng không tự chuyển về dữ liệu mẫu khi cloud lỗi.
- Đăng ký một tài khoản chưa đặt lịch, kiểm tra tài khoản xuất hiện trong quản trị; cấp lại mật khẩu, xác nhận mật khẩu cũ không đăng nhập được và mật khẩu mới dùng được.

Kiểm thử mã nguồn: `npm test`, `npm run test:db`, `npm run test:accounts`, `npm run typecheck`, `npm run build`. `test:db` thực thi toàn bộ migration/RLS trên PostgreSQL cục bộ bằng PGlite; `test:accounts` kiểm tra handler Edge Function bằng dịch vụ Auth mô phỏng. Chưa thay thế kiểm tra Auth/email/Storage hoặc đặt lại mật khẩu trên dự án Supabase thật.
