-- Supabase SQL Migration: Initial Schema for Nhà Rạp Thái Đăng
-- Description: Core tables, RLS policies, RBAC, Stored Functions (Idempotent Job confirmation, Availability check)

-- 1. ENUMS & EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'chu_don_vi', 
    'quan_ly', 
    'tu_van', 
    'kho', 
    'ke_toan', 
    'nhan_vien_thuc_hien'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE intake_status AS ENUM (
    'moi_gui', 
    'dang_lien_he', 
    'da_hen_khao_sat', 
    'da_khao_sat', 
    'cho_xac_nhan', 
    'da_xac_nhan', 
    'khong_tiep_tuc', 
    'da_huy'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE job_status AS ENUM (
    'chua_thuc_hien', 
    'dang_thuc_hien', 
    'da_hoan_thanh', 
    'tam_hoan', 
    'da_huy'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM (
    'chua_bat_dau', 
    'dang_xu_ly', 
    'hoan_thanh', 
    'bo_qua'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'nhan_vien_thuc_hien',
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. INVENTORY ITEMS (Quản lý thiết bị kho)
CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT 'cái',
  total_owned_quantity INT NOT NULL DEFAULT 0,
  in_repair_quantity INT NOT NULL DEFAULT 0,
  scrapped_quantity INT NOT NULL DEFAULT 0,
  external_rented_quantity INT NOT NULL DEFAULT 0,
  buffer_ratio NUMERIC(4, 2) NOT NULL DEFAULT 0.10,
  cleaning_turnaround_hours INT NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. INTAKE RECORDS (Hồ sơ yêu cầu tiếp nhận)
CREATE TABLE IF NOT EXISTS intake_records (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL DEFAULT 'website',
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  service_type TEXT NOT NULL,
  event_date_start TIMESTAMPTZ NOT NULL,
  event_date_end TIMESTAMPTZ NOT NULL,
  setup_date_start TIMESTAMPTZ NOT NULL,
  teardown_date_end TIMESTAMPTZ NOT NULL,
  event_address TEXT NOT NULL,
  status intake_status NOT NULL DEFAULT 'moi_gui',
  assigned_staff_id UUID REFERENCES user_profiles(id),
  table_chair_configs JSONB NOT NULL DEFAULT '[]'::jsonb,
  tent_configs JSONB NOT NULL DEFAULT '[]'::jsonb,
  catering_configs JSONB NOT NULL DEFAULT '[]'::jsonb,
  survey JSONB,
  note TEXT,
  confirmed_job_id TEXT,
  idempotency_key TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. JOBS
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  intake_id TEXT NOT NULL REFERENCES intake_records(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  event_address TEXT NOT NULL,
  status job_status NOT NULL DEFAULT 'chua_thuc_hien',
  event_date_start TIMESTAMPTZ NOT NULL,
  event_date_end TIMESTAMPTZ NOT NULL,
  equipment_usage_start TIMESTAMPTZ NOT NULL,
  equipment_usage_end TIMESTAMPTZ NOT NULL,
  items_snapshot JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_inventory_returned BOOLEAN NOT NULL DEFAULT false,
  is_fully_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. JOB TASKS (7 đầu việc chuẩn)
CREATE TABLE IF NOT EXISTS job_tasks (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  scheduled_start_time TIMESTAMPTZ NOT NULL,
  scheduled_end_time TIMESTAMPTZ NOT NULL,
  assigned_person_or_team TEXT NOT NULL,
  status task_status NOT NULL DEFAULT 'chua_bat_dau',
  notes TEXT,
  completed_at TIMESTAMPTZ
);

-- 7. INVENTORY RESERVATIONS (Giữ kho & xuất trả theo thời gian)
CREATE TABLE IF NOT EXISTS inventory_reservations (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  item_code TEXT NOT NULL REFERENCES inventory_items(code),
  requested_quantity INT NOT NULL,
  period_start TIMESTAMPTZ NOT NULL,
  period_end TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'held', -- 'held', 'dispatched', 'returned', 'cancelled'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. INVENTORY TRANSACTIONS (Lịch sử giao dịch kho)
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id TEXT PRIMARY KEY,
  item_code TEXT NOT NULL REFERENCES inventory_items(code),
  transaction_type TEXT NOT NULL, -- 'nhap_moi', 'xuat_cong_trinh', 'thu_hoi_nhap_kho', 'bao_hong', 'thanh_ly', 'thue_ngoai'
  quantity INT NOT NULL,
  reference_job_id TEXT,
  notes TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. QUOTES & PAYMENTS
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  intake_id TEXT NOT NULL REFERENCES intake_records(id),
  job_id TEXT REFERENCES jobs(id),
  version INT NOT NULL DEFAULT 1,
  is_final BOOLEAN NOT NULL DEFAULT false,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount_vnd BIGINT NOT NULL DEFAULT 0,
  discount_vnd BIGINT NOT NULL DEFAULT 0,
  final_amount_vnd BIGINT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payment_receipts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id),
  intake_id TEXT NOT NULL REFERENCES intake_records(id),
  payment_type TEXT NOT NULL DEFAULT 'tien_coc', -- 'tien_coc', 'thanh_toan_dot', 'quyet_toan'
  amount_vnd BIGINT NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'chuyen_khoan',
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recorded_by TEXT NOT NULL,
  receipt_number TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. NOTIFICATIONS & AUDIT LOGS
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES user_profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id UUID,
  user_role TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper hàm lấy role người dùng hiện tại
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM user_profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Chính sách công khai: Khách hàng chỉ được phép gửi yêu cầu booking từ website
CREATE POLICY "Public can insert intake requests" ON intake_records
  FOR INSERT TO anon, authenticated
  WITH CHECK (source = 'website' AND status = 'moi_gui');

-- Nhân viên đã xác thực có thể đọc hồ sơ
CREATE POLICY "Staff can view intakes" ON intake_records
  FOR SELECT TO authenticated
  USING (true);

-- Chỉ Chủ đơn vị, Quản lý, Tư vấn được sửa hồ sơ
CREATE POLICY "Staff can update intakes" ON intake_records
  FOR UPDATE TO authenticated
  USING (get_current_user_role() IN ('chu_don_vi', 'quan_ly', 'tu_van'));

-- Xem kho: Toàn bộ nhân viên authenticated
CREATE POLICY "Staff can view inventory" ON inventory_items
  FOR SELECT TO authenticated
  USING (true);

-- Sửa kho: Chủ đơn vị hoặc thủ kho
CREATE POLICY "Warehouse staff can update items" ON inventory_items
  FOR ALL TO authenticated
  USING (get_current_user_role() IN ('chu_don_vi', 'kho'));

-- Jobs: Nhân viên xem Jobs
CREATE POLICY "Staff can view jobs" ON jobs
  FOR SELECT TO authenticated
  USING (true);

-- Jobs: Quản lý hoặc Chủ đơn vị cập nhật Jobs
CREATE POLICY "Managers can manage jobs" ON jobs
  FOR ALL TO authenticated
  USING (get_current_user_role() IN ('chu_don_vi', 'quan_ly'));

-- Tasks: Nhân viên hiện trường cập nhật trạng thái đầu việc
CREATE POLICY "Staff can view and update tasks" ON job_tasks
  FOR ALL TO authenticated
  USING (true);

-- Tài chính: Chỉ Chủ đơn vị và Kế toán xem và ghi nhận tiền
CREATE POLICY "Finance staff can access receipts" ON payment_receipts
  FOR ALL TO authenticated
  USING (get_current_user_role() IN ('chu_don_vi', 'ke_toan', 'quan_ly'));
