-- Supabase Seed Data for Nhà Rạp Thái Đăng
-- Kịch bản nghiệm thu thực tế:
-- - 3 đám cưới, 1 nhà mới, 1 đám hiếu.
-- - Trùng thời gian chiếm dụng (24/10 - 25/10).
-- - Bàn tròn kèm ghế inox và bàn kèm ghế nhựa đỏ.
-- - Dụng cụ đang sửa: 5 bàn tròn, 10 ghế nhựa đỏ.
-- - Job chưa thu hồi: Tang lễ cụ Thịnh kết thúc hôm qua nhưng đồ chưa kiểm đếm trả kho.

-- 1. DANH MỤC THIẾT BỊ KHO (INVENTORY CATALOG)
INSERT INTO inventory_items (id, code, name, category, unit, total_owned_quantity, in_repair_quantity, scrapped_quantity, external_rented_quantity, buffer_ratio, cleaning_turnaround_hours)
VALUES
  ('ITEM-01', 'BAN_TRON', 'Bàn tròn inox sự kiện 1.2m', 'ban', 'cái', 50, 5, 0, 0, 0.10, 3),
  ('ITEM-02', 'BAN_DAI', 'Bàn dài chữ nhật đại biểu 1.6m', 'ban', 'cái', 20, 0, 0, 0, 0.10, 2),
  ('ITEM-03', 'GHE_INOX', 'Ghế đôn inox tròn phi 22', 'ghe', 'cái', 220, 0, 0, 0, 0.10, 2),
  ('ITEM-04', 'GHE_NHUA_DO', 'Ghế nhựa đỏ tựa lưng Song Long', 'ghe', 'cái', 120, 10, 0, 0, 0.10, 2),
  ('ITEM-05', 'KHUNG_RAP_KHOANG', 'Khung rạp sắt mạ kẽm khẩu độ 6m (theo khoang)', 'rap', 'khoang', 30, 0, 0, 0, 0.05, 4),
  ('ITEM-06', 'BAT_MAI_KHOANG', 'Bạt mái che 2 da Hàn Quốc chống nóng', 'rap', 'tấm', 30, 0, 0, 0, 0.05, 3),
  ('ITEM-07', 'VACH_RAP_SET', 'Vách rèm lụa quây rạp màu trắng sữa', 'rap', 'tấm', 60, 0, 0, 0, 0.05, 2),
  ('ITEM-08', 'DEN_CHUM_LED', 'Đèn chùm pha lê LED cao cấp thả rạp', 'rap', 'bộ', 15, 1, 0, 0, 0.10, 2),
  ('ITEM-09', 'LOA_DAI_SU_KIEN', 'Dàn âm thanh array mini 4 sub 4 full', 'am_thanh_anh_sang', 'bộ', 5, 0, 0, 0, 0.10, 4),
  ('ITEM-10', 'BINH_GAS_CONG_NGHIEP', 'Bình gas công nghiệp nấu cỗ', 'vat_tu_tieu_hao', 'kg', 180, 0, 0, 0, 0.00, 0)
ON CONFLICT (code) DO UPDATE SET 
  total_owned_quantity = EXCLUDED.total_owned_quantity,
  in_repair_quantity = EXCLUDED.in_repair_quantity;

-- 2. HỒ SƠ YÊU CẦU TIẾP NHẬN (INTAKE RECORDS)
INSERT INTO intake_records (
  id, code, source, customer_name, customer_phone, customer_email, service_type,
  event_date_start, event_date_end, setup_date_start, teardown_date_end,
  event_address, status, table_chair_configs, tent_configs, catering_configs, note
) VALUES
-- Ca 1: Đám cưới Hoàng Gia (Đã xác nhận -> JOB-202610-001)
(
  'INTAKE-001', 'TD-202610-001', 'website', 'Anh Tuấn Anh & Chị Mai Linh', '0912345678', 'tuananh@gmail.com', 'dam_cuoi',
  '2026-10-24 10:30:00+07', '2026-10-24 14:00:00+07', '2026-10-23 14:00:00+07', '2026-10-24 19:00:00+07',
  'Số 120 Đường Lê Lợi, TP. Bắc Giang', 'da_xac_nhan',
  '[{"area": "Rạp chính", "tableType": "ban_tron", "chairType": "ghe_inox", "tableCount": 20, "chairsPerTable": 6, "extraChairs": 0}, {"area": "Rạp cỗ phụ", "tableType": "ban_tron", "chairType": "ghe_nhua_do", "tableCount": 10, "chairsPerTable": 6, "extraChairs": 0}]'::jsonb,
  '[{"tentType": "rap_chinh", "themeId": "hoang_gia", "themeName": "Tone Trắng Vàng Hoàng Gia", "bayCount": 6}]'::jsonb,
  '[{"trayCount": 30, "peoplePerTray": 6, "menuName": "Thực đơn tiệc cưới cao cấp 8 món", "serviceRounds": 1, "provider": "thai_dang"}]'::jsonb,
  'Gia đình chú rể đặt trước 30 mâm cỗ. Đường rộng xe tải 2.5T vào tận sân.'
),
-- Ca 2: Đám cưới Rustic (Đã xác nhận -> JOB-202610-002, Trùng ngày 24/10)
(
  'INTAKE-002', 'TD-202610-002', 'truc_tiep', 'Anh Quốc Bảo & Chị Lan Hương', '0987654321', 'quocbao@outlook.com', 'dam_cuoi',
  '2026-10-24 17:00:00+07', '2026-10-24 21:00:00+07', '2026-10-23 16:00:00+07', '2026-10-25 09:00:00+07',
  'Thôn Tam Tầng, Xã Quang Châu, Huyện Việt Yên', 'da_xac_nhan',
  '[{"area": "Sân cưới Rustic", "tableType": "ban_tron", "chairType": "ghe_inox", "tableCount": 15, "chairsPerTable": 6, "extraChairs": 10}]'::jsonb,
  '[{"tentType": "rap_chinh", "themeId": "rustic_green", "themeName": "Tone Xanh Lá Rustic Cổ Điển", "bayCount": 5}]'::jsonb,
  '[]'::jsonb,
  'Đã khảo sát sân vườn rộng rãi, yêu cầu đèn chùm trang trí lộng lẫy.'
),
-- Ca 3: Lễ Tân Gia Nhà Mới (Đã xác nhận -> JOB-202610-003, Trùng ngày 24/10)
(
  'INTAKE-003', 'TD-202610-003', 'dien_thoai', 'Anh Nguyễn Trọng Hưng', '0966889900', NULL, 'nha_moi',
  '2026-10-24 11:00:00+07', '2026-10-24 14:00:00+07', '2026-10-24 06:00:00+07', '2026-10-24 17:00:00+07',
  'Khu Biệt Thự Song Mai, TP. Bắc Giang', 'da_xac_nhan',
  '[{"area": "Sân tiệc tân gia", "tableType": "ban_tron", "chairType": "ghe_nhua_do", "tableCount": 8, "chairsPerTable": 6, "extraChairs": 0}]'::jsonb,
  '[{"tentType": "rap_chinh", "themeId": "hien_dai", "themeName": "Rạp che nắng hiện đại", "bayCount": 3}]'::jsonb,
  '[]'::jsonb,
  'Tiệc tân gia nhà 3 tầng, chỉ làm trưa ngày 24.'
),
-- Ca 4: Đám cưới Truyền thống (Chờ xác nhận, ngày 28-29/10)
(
  'INTAKE-004', 'TD-202610-004', 'website', 'Anh Minh Đức & Chị Thu Trang', '0933221100', 'duc.minh@gmail.com', 'dam_cuoi',
  '2026-10-28 10:30:00+07', '2026-10-28 14:00:00+07', '2026-10-27 14:00:00+07', '2026-10-28 18:00:00+07',
  'Thị trấn Thắng, Huyện Hiệp Hòa', 'cho_xac_nhan',
  '[{"area": "Rạp cưới chính", "tableType": "ban_tron", "chairType": "ghe_inox", "tableCount": 25, "chairsPerTable": 6, "extraChairs": 0}]'::jsonb,
  '[{"tentType": "rap_chinh", "themeId": "truyen_thong_do", "themeName": "Tone Đỏ Truyền Thống Hỷ Sự", "bayCount": 6}]'::jsonb,
  '[]'::jsonb,
  'Đã gọi tư vấn, khách ưng mẫu rạp đỏ, đang đợi chốt ngày đẹp.'
),
-- Ca 5: Đám hiếu (Tang lễ Cụ Bà Nguyễn Thị Thịnh - ĐÃ XONG NHƯNG CHƯA TRẢ KHO QUÁ HẠN)
(
  'INTAKE-005', 'TD-202610-005', 'dien_thoai', 'Đại diện gia đình: Ông Trần Văn Cần', '0944556677', NULL, 'dam_hieu',
  '2026-10-10 07:00:00+07', '2026-10-11 16:00:00+07', '2026-10-09 14:00:00+07', '2026-10-11 19:00:00+07',
  'Thôn Tân Hưng, Xã Phi Mô, Huyện Lạng Giang', 'da_xac_nhan',
  '[{"area": "Rạp tang lễ", "tableType": "ban_tron", "chairType": "ghe_inox", "tableCount": 8, "chairsPerTable": 6, "extraChairs": 0}]'::jsonb,
  '[{"tentType": "rap_chinh", "themeId": "trang_nghiem", "themeName": "Rạp Đám Hiếu Trang Nghiêm", "bayCount": 3}]'::jsonb,
  '[]'::jsonb,
  'Đám tang đã hoàn tất ngày 11/10 nhưng do gia đình bận việc nên hẹn sáng nay xe qua dọn.'
)
ON CONFLICT (id) DO NOTHING;

-- 3. JOBS ĐÃ TẠO
INSERT INTO jobs (
  id, code, intake_id, customer_name, customer_phone, service_type, event_address,
  status, event_date_start, event_date_end, equipment_usage_start, equipment_usage_end,
  items_snapshot, is_inventory_returned, is_fully_paid
) VALUES
(
  'JOB-202610-001', 'JOB-202610-001', 'INTAKE-001', 'Anh Tuấn Anh & Chị Mai Linh', '0912345678', 'dam_cuoi',
  'Số 120 Đường Lê Lợi, TP. Bắc Giang', 'chua_thuc_hien',
  '2026-10-24 10:30:00+07', '2026-10-24 14:00:00+07', '2026-10-23 14:00:00+07', '2026-10-24 19:00:00+07',
  '[{"itemCode": "BAN_TRON", "quantity": 30}, {"itemCode": "GHE_INOX", "quantity": 120}, {"itemCode": "GHE_NHUA_DO", "quantity": 60}, {"itemCode": "KHUNG_RAP_KHOANG", "quantity": 6}]'::jsonb,
  false, false
),
(
  'JOB-202610-002', 'JOB-202610-002', 'INTAKE-002', 'Anh Quốc Bảo & Chị Lan Hương', '0987654321', 'dam_cuoi',
  'Thôn Tam Tầng, Xã Quang Châu, Huyện Việt Yên', 'chua_thuc_hien',
  '2026-10-24 17:00:00+07', '2026-10-24 21:00:00+07', '2026-10-23 16:00:00+07', '2026-10-25 09:00:00+07',
  '[{"itemCode": "BAN_TRON", "quantity": 15}, {"itemCode": "GHE_INOX", "quantity": 100}, {"itemCode": "KHUNG_RAP_KHOANG", "quantity": 5}]'::jsonb,
  false, false
),
(
  'JOB-202610-003', 'JOB-202610-003', 'INTAKE-003', 'Anh Nguyễn Trọng Hưng', '0966889900', 'nha_moi',
  'Khu Biệt Thự Song Mai, TP. Bắc Giang', 'chua_thuc_hien',
  '2026-10-24 11:00:00+07', '2026-10-24 14:00:00+07', '2026-10-24 06:00:00+07', '2026-10-24 17:00:00+07',
  '[{"itemCode": "BAN_TRON", "quantity": 8}, {"itemCode": "GHE_NHUA_DO", "quantity": 48}, {"itemCode": "KHUNG_RAP_KHOANG", "quantity": 3}]'::jsonb,
  false, false
),
(
  'JOB-202610-005', 'JOB-202610-005', 'INTAKE-005', 'Đại diện gia đình: Ông Trần Văn Cần', '0944556677', 'dam_hieu',
  'Thôn Tân Hưng, Xã Phi Mô, Huyện Lạng Giang', 'da_hoan_thanh',
  '2026-10-10 07:00:00+07', '2026-10-11 16:00:00+07', '2026-10-09 14:00:00+07', '2026-10-11 19:00:00+07',
  '[{"itemCode": "BAN_TRON", "quantity": 8}, {"itemCode": "GHE_INOX", "quantity": 48}, {"itemCode": "KHUNG_RAP_KHOANG", "quantity": 3}]'::jsonb,
  false, true -- Job đã xong về mặt phục vụ nhưng dụng cụ CHƯA THU HỒI TRẢ KHO!
)
ON CONFLICT (id) DO NOTHING;

-- Cập nhật confirmed_job_id cho intake
UPDATE intake_records SET confirmed_job_id = 'JOB-202610-001' WHERE id = 'INTAKE-001';
UPDATE intake_records SET confirmed_job_id = 'JOB-202610-002' WHERE id = 'INTAKE-002';
UPDATE intake_records SET confirmed_job_id = 'JOB-202610-003' WHERE id = 'INTAKE-003';
UPDATE intake_records SET confirmed_job_id = 'JOB-202610-005' WHERE id = 'INTAKE-005';

-- 4. BẢN GHI GIỮ KHO (INVENTORY RESERVATIONS)
-- Đám cưới 1 (held)
INSERT INTO inventory_reservations (id, job_id, item_code, requested_quantity, period_start, period_end, status) VALUES
  ('RES-001-BAN', 'JOB-202610-001', 'BAN_TRON', 30, '2026-10-23 14:00:00+07', '2026-10-24 19:00:00+07', 'held'),
  ('RES-001-INOX', 'JOB-202610-001', 'GHE_INOX', 120, '2026-10-23 14:00:00+07', '2026-10-24 19:00:00+07', 'held'),
  ('RES-001-NHUA', 'JOB-202610-001', 'GHE_NHUA_DO', 60, '2026-10-23 14:00:00+07', '2026-10-24 19:00:00+07', 'held'),
  ('RES-001-RAP', 'JOB-202610-001', 'KHUNG_RAP_KHOANG', 6, '2026-10-23 14:00:00+07', '2026-10-24 19:00:00+07', 'held'),
-- Đám cưới 2 (held, Trùng ngày 23-25/10)
  ('RES-002-BAN', 'JOB-202610-002', 'BAN_TRON', 15, '2026-10-23 16:00:00+07', '2026-10-25 09:00:00+07', 'held'),
  ('RES-002-INOX', 'JOB-202610-002', 'GHE_INOX', 100, '2026-10-23 16:00:00+07', '2026-10-25 09:00:00+07', 'held'),
  ('RES-002-RAP', 'JOB-202610-002', 'KHUNG_RAP_KHOANG', 5, '2026-10-23 16:00:00+07', '2026-10-25 09:00:00+07', 'held'),
-- Nhà mới 3 (held, Trùng ngày 24/10)
  ('RES-003-BAN', 'JOB-202610-003', 'BAN_TRON', 8, '2026-10-24 06:00:00+07', '2026-10-24 17:00:00+07', 'held'),
  ('RES-003-NHUA', 'JOB-202610-003', 'GHE_NHUA_DO', 48, '2026-10-24 06:00:00+07', '2026-10-24 17:00:00+07', 'held'),
  ('RES-003-RAP', 'JOB-202610-003', 'KHUNG_RAP_KHOANG', 3, '2026-10-24 06:00:00+07', '2026-10-24 17:00:00+07', 'held'),
-- Đám hiếu 5 (dispatched - ĐÃ XUẤT NHƯNG QUÁ HẠN CHƯA THU HỒI!)
  ('RES-005-BAN', 'JOB-202610-005', 'BAN_TRON', 8, '2026-10-09 14:00:00+07', '2026-10-11 19:00:00+07', 'dispatched'),
  ('RES-005-INOX', 'JOB-202610-005', 'GHE_INOX', 48, '2026-10-09 14:00:00+07', '2026-10-11 19:00:00+07', 'dispatched'),
  ('RES-005-RAP', 'JOB-202610-005', 'KHUNG_RAP_KHOANG', 3, '2026-10-09 14:00:00+07', '2026-10-11 19:00:00+07', 'dispatched')
ON CONFLICT (id) DO NOTHING;
