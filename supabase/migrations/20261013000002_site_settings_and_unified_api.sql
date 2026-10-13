-- Supabase SQL Migration: Site Settings & Unified API for Web and Android
-- Migration: 20261013000002_site_settings_and_unified_api.sql
-- Description: Centralized contact info, CMS tables, Storage Buckets, and unified API contracts

-- 1. BẢNG CẤU HÌNH LIÊN HỆ & THÔNG TIN ĐƠN VỊ TẬP TRUNG (SINGLE SOURCE OF TRUTH)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES user_profiles(id)
);

-- Bật RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Chính sách: Ai cũng có thể đọc các cấu hình công khai (Website, Android app, Khách vãng lai)
DROP POLICY IF EXISTS "Public can view public site settings" ON site_settings;
CREATE POLICY "Public can view public site settings" ON site_settings
  FOR SELECT TO anon, authenticated
  USING (is_public = true);

-- Chính sách: Chỉ Chủ đơn vị và Quản lý được cập nhật cấu hình hệ thống
DROP POLICY IF EXISTS "Managers can update site settings" ON site_settings;
CREATE POLICY "Managers can update site settings" ON site_settings
  FOR ALL TO authenticated
  USING (get_current_user_role() IN ('chu_don_vi', 'quan_ly'));

-- Nạp cấu hình liên hệ chính thức (Đã được Chủ đơn vị Thái Đăng xác nhận)
INSERT INTO site_settings (key, value, is_public, description)
VALUES (
  'contact_info',
  jsonb_build_object(
    'brandName', 'NHÀ RẠP THÁI ĐĂNG',
    'slogan', 'SỰ KIỆN TRỌN NIỀM VUI',
    'hotline', '0349.481.256',
    'officialHotlineStatus', '0349.481.256 (Đã xác nhận)',
    'isHotlineConfirmed', true,
    'zaloPhone', '0349.481.256',
    'facebookFanpageUrl', 'https://facebook.com/nharapthaidang.ninhbinh',
    'tiktokUrl', 'https://tiktok.com/@nharapthaidang',
    'youtubeUrl', 'https://youtube.com/@nharapthaidang',
    'address', 'Thôn Trực Đông, xã Cổ Lễ, tỉnh Ninh Bình',
    'email', 'sukien@nharapthaidang.vn',
    'workingHours', '07:30 - 22:00 (Phục vụ tận tâm chu đáo)'
  ),
  true,
  'Thông tin liên hệ trung tâm hiển thị trên Header, Footer, Mobile Drawer và Android App'
)
ON CONFLICT (key) DO UPDATE
SET value = EXCLUDED.value, updated_at = NOW();

-- 2. CÁC BẢNG NỘI DUNG CMS (DÙNG CHUNG CHO WEBSITE VÀ ANDROID)
-- Bảng Mẫu Rạp Cưới
CREATE TABLE IF NOT EXISTS cms_themes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title_en TEXT,
  category TEXT NOT NULL,
  badge TEXT,
  image_url TEXT NOT NULL,
  detail_images JSONB DEFAULT '[]'::jsonb,
  price_tier TEXT,
  feng_shui_element TEXT,
  feng_shui_flowers TEXT,
  feng_shui_ages TEXT,
  feng_shui_meaning TEXT,
  specs TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE cms_themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active themes" ON cms_themes
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Staff can manage themes" ON cms_themes
  FOR ALL TO authenticated
  USING (get_current_user_role() IN ('chu_don_vi', 'quan_ly', 'tu_van'));

-- Bảng Ưu đãi & Khuyến mãi
CREATE TABLE IF NOT EXISTS promotions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  code TEXT,
  badge TEXT,
  discount_text TEXT NOT NULL,
  valid_until TEXT NOT NULL,
  description TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active promotions" ON promotions
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Staff can manage promotions" ON promotions
  FOR ALL TO authenticated
  USING (get_current_user_role() IN ('chu_don_vi', 'quan_ly'));

-- Bảng Bài viết & Cẩm nang cưới
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  author TEXT NOT NULL DEFAULT 'Thái Đăng Palace',
  view_count INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published articles" ON articles
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Staff can manage articles" ON articles
  FOR ALL TO authenticated
  USING (get_current_user_role() IN ('chu_don_vi', 'quan_ly'));

-- 3. STORAGE BUCKETS CHÍNH SÁCH BẢO MẬT
-- Tạo các buckets (Sử dụng extension storage nếu có)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('event-public-photos', 'event-public-photos', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('contracts-and-receipts', 'contracts-and-receipts', false, 15728640, ARRAY['application/pdf', 'image/jpeg', 'image/png']),
  ('identity-documents', 'identity-documents', false, 10485760, ARRAY['image/jpeg', 'image/png', 'application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- RLS Storage: Public xem ảnh sự kiện công khai
CREATE POLICY "Public can view event photos" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'event-public-photos');

-- RLS Storage: Chỉ nhân viên authenticated upload ảnh sự kiện
CREATE POLICY "Staff can upload event photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'event-public-photos');

-- RLS Storage: Hợp đồng và giấy tờ tùy thân - Chỉ Chủ đơn vị và Kế toán đọc
CREATE POLICY "Only finance and managers can access contracts" ON storage.objects
  FOR ALL TO authenticated
  USING (
    bucket_id IN ('contracts-and-receipts', 'identity-documents') AND 
    get_current_user_role() IN ('chu_don_vi', 'quan_ly', 'ke_toan')
  );

-- 4. RPC API CONTRACTS CHO CẢ WEBSITE VÀ ỨNG DỤNG ANDROID

-- API 1: Đọc cấu hình liên hệ công khai
CREATE OR REPLACE FUNCTION rpc_get_contact_config()
RETURNS JSONB AS $$
  SELECT value FROM site_settings WHERE key = 'contact_info' AND is_public = true LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- API 2: Tạo booking công khai (Website / App)
CREATE OR REPLACE FUNCTION rpc_create_public_booking(
  p_customer_name TEXT,
  p_customer_phone TEXT,
  p_customer_email TEXT,
  p_service_type TEXT,
  p_event_date_start TIMESTAMPTZ,
  p_event_date_end TIMESTAMPTZ,
  p_event_address TEXT,
  p_table_chair_configs JSONB DEFAULT '[]'::jsonb,
  p_note TEXT DEFAULT ''
)
RETURNS JSONB AS $$
DECLARE
  v_new_id TEXT;
  v_code TEXT;
  v_random INT;
BEGIN
  v_random := FLOOR(1000 + RANDOM() * 9000)::INT;
  v_code := 'TN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || v_random::TEXT;
  v_new_id := 'intake_' || v_random::TEXT || '_' || EXTRACT(EPOCH FROM NOW())::TEXT;

  INSERT INTO intake_records (
    id,
    code,
    source,
    customer_name,
    customer_phone,
    customer_email,
    service_type,
    event_date_start,
    event_date_end,
    setup_date_start,
    teardown_date_end,
    event_address,
    status,
    table_chair_configs,
    note
  ) VALUES (
    v_new_id,
    v_code,
    'website',
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_service_type,
    p_event_date_start,
    p_event_date_end,
    p_event_date_start - INTERVAL '8 hours',
    p_event_date_end + INTERVAL '6 hours',
    p_event_address,
    'moi_gui',
    p_table_chair_configs,
    p_note
  );

  RETURN jsonb_build_object(
    'success', true,
    'intakeId', v_new_id,
    'code', v_code,
    'message', 'Đã ghi nhận yêu cầu đặt lịch khảo sát thành công!'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- API 3: Tra cứu trạng thái booking an toàn (Kiểm soát quyền bằng mã booking + SĐT)
CREATE OR REPLACE FUNCTION rpc_check_booking_status(
  p_booking_code TEXT,
  p_phone TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_rec RECORD;
BEGIN
  SELECT id, code, customer_name, service_type, status, event_date_start, event_address, created_at
  INTO v_rec
  FROM intake_records
  WHERE code = TRIM(p_booking_code)
    AND RIGHT(REPLACE(customer_phone, ' ', ''), 9) = RIGHT(REPLACE(p_phone, ' ', ''), 9)
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false, 'message', 'Không tìm thấy hồ sơ phù hợp với thông tin cung cấp');
  END IF;

  RETURN jsonb_build_object(
    'found', true,
    'code', v_rec.code,
    'customerName', v_rec.customer_name,
    'serviceType', v_rec.service_type,
    'status', v_rec.status,
    'eventDate', v_rec.event_date_start,
    'address', v_rec.event_address,
    'createdAt', v_rec.created_at
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
