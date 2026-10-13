-- Supabase SQL Migration: Customers, Core Entities Standardized Views & Atomic Inventory RPC
-- Migration: 20261013000003_customers_and_core_entities_sync.sql
-- Description: Creates customers table, standardized views (bookings, catalog_items, inventory_movements, payments),
-- and ACID transaction RPCs for concurrent Job confirmation & warehouse reservations (No race conditions).

-- 1. BẢNG KHÁCH HÀNG (CUSTOMERS TABLE)
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  address TEXT,
  is_vip BOOLEAN NOT NULL DEFAULT false,
  total_bookings INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Khách hàng tự xem hồ sơ của mình (hoặc nhân viên được ủy quyền)
DROP POLICY IF EXISTS "Customers can view their own profile" ON customers;
CREATE POLICY "Customers can view their own profile" ON customers
  FOR SELECT TO authenticated
  USING (
    phone = (SELECT phone FROM user_profiles WHERE id = auth.uid()) OR
    get_current_user_role() IN ('chu_don_vi', 'quan_ly', 'tu_van', 'ke_toan')
  );

-- Nhân viên tư vấn & quản lý được cập nhật khách hàng
DROP POLICY IF EXISTS "Staff can manage customers" ON customers;
CREATE POLICY "Staff can manage customers" ON customers
  FOR ALL TO authenticated
  USING (get_current_user_role() IN ('chu_don_vi', 'quan_ly', 'tu_van'));

-- Cho phép công chúng / booking form tạo hồ sơ khách hàng mới nếu chưa có
DROP POLICY IF EXISTS "Public can register customer during booking" ON customers;
CREATE POLICY "Public can register customer during booking" ON customers
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 2. ĐỒNG BỘ ÁNH XẠ CHUẨN TÊN THỐNG NHẤT (STANDARDIZED COMPATIBILITY VIEWS)
-- View 'bookings' ánh xạ trực tiếp từ 'intake_records'
CREATE OR REPLACE VIEW bookings AS 
  SELECT 
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
    tent_configs,
    catering_configs,
    survey,
    note,
    confirmed_job_id,
    created_at,
    updated_at
  FROM intake_records;

-- View 'catalog_items' ánh xạ trực tiếp từ 'inventory_items'
CREATE OR REPLACE VIEW catalog_items AS
  SELECT 
    id,
    code,
    name,
    category,
    unit,
    total_owned_quantity,
    in_repair_quantity,
    scrapped_quantity,
    external_rented_quantity,
    buffer_ratio,
    cleaning_turnaround_hours,
    created_at,
    updated_at
  FROM inventory_items;

-- View 'inventory_movements' ánh xạ trực tiếp từ 'inventory_transactions'
CREATE OR REPLACE VIEW inventory_movements AS
  SELECT 
    id,
    item_code,
    transaction_type,
    quantity,
    reference_job_id,
    notes,
    created_by,
    created_at
  FROM inventory_transactions;

-- View 'payments' ánh xạ trực tiếp từ 'payment_receipts'
CREATE OR REPLACE VIEW payments AS
  SELECT 
    id,
    job_id,
    intake_id,
    payment_type,
    amount_vnd,
    payment_method,
    payment_date,
    recorded_by,
    receipt_number,
    notes,
    created_at
  FROM payment_receipts;

-- 3. STORED PROCEDURE / RPC TRANSACTION: XÁC NHẬN BOOKING THÀNH JOB VÀ GIỮ KHO AN TOÀN (ACID)
-- Đảm bảo hai máy/thiết bị cùng bấm xác nhận cùng một lúc không bị âm kho (Row-Level Locking FOR UPDATE)
CREATE OR REPLACE FUNCTION rpc_confirm_booking_to_job_atomic(
  p_booking_id TEXT,
  p_items_demand JSONB, -- Mảng [{"itemCode": "TB-BAN", "quantity": 30}, ...]
  p_actor_user_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_booking RECORD;
  v_job_id TEXT;
  v_job_code TEXT;
  v_item RECORD;
  v_inv RECORD;
  v_demand_code TEXT;
  v_demand_qty INT;
  v_reserved_now INT;
  v_available_qty INT;
  v_buffer_deduct INT;
  v_shortage JSONB := '[]'::jsonb;
BEGIN
  -- 1. Khóa và lấy thông tin booking
  SELECT * INTO v_booking
  FROM intake_records
  WHERE id = p_booking_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Không tìm thấy hồ sơ booking ID: ' || p_booking_id);
  END IF;

  IF v_booking.status = 'da_xac_nhan' THEN
    RETURN jsonb_build_object(
      'success', true, 
      'alreadyConfirmed', true,
      'jobId', v_booking.confirmed_job_id,
      'message', 'Hồ sơ này đã được xác nhận trước đó (Idempotent OK).'
    );
  END IF;

  -- 2. Kiểm tra tồn kho từng món hàng với ROW LOCK FOR UPDATE để chống Race Condition
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items_demand)
  LOOP
    v_demand_code := v_item.value->>'itemCode';
    v_demand_qty := (v_item.value->>'quantity')::INT;

    -- Khóa bản ghi thiết bị kho
    SELECT * INTO v_inv
    FROM inventory_items
    WHERE code = v_demand_code
    FOR UPDATE;

    IF NOT FOUND THEN
      v_shortage := v_shortage || jsonb_build_object('itemCode', v_demand_code, 'reason', 'Không tìm thấy mã dụng cụ trong danh mục');
      CONTINUE;
    END IF;

    -- Tính tổng số lượng đang bị giữ trong khoảng thời gian diễn ra sự kiện
    SELECT COALESCE(SUM(requested_quantity), 0) INTO v_reserved_now
    FROM inventory_reservations
    WHERE item_code = v_demand_code
      AND status IN ('held', 'dispatched')
      AND (period_start < v_booking.event_date_end AND period_end > v_booking.event_date_start);

    -- Số khả dụng = Tổng sở hữu - đang sửa - thanh lý - giữ chỗ - hệ số đệm
    v_buffer_deduct := CEIL(v_inv.total_owned_quantity * v_inv.buffer_ratio);
    v_available_qty := v_inv.total_owned_quantity - v_inv.in_repair_quantity - v_inv.scrapped_quantity - v_reserved_now - v_buffer_deduct;

    IF v_available_qty < v_demand_qty THEN
      v_shortage := v_shortage || jsonb_build_object(
        'itemCode', v_demand_code,
        'itemName', v_inv.name,
        'needed', v_demand_qty,
        'available', v_available_qty,
        'missing', v_demand_qty - v_available_qty
      );
    END IF;
  END LOOP;

  -- Nếu có bất kỳ món nào bị thiếu, ROLLBACK và báo lỗi
  IF jsonb_array_length(v_shortage) > 0 THEN
    RETURN jsonb_build_object(
      'success', false,
      'isShortage', true,
      'shortageItems', v_shortage,
      'message', 'Kho không đủ thiết bị để đáp ứng khung thời gian này!'
    );
  END IF;

  -- 3. Tạo Job mới
  v_job_id := 'JOB-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || SUBSTRING(v_booking.code FROM 4);
  v_job_code := 'JOB-' || SUBSTRING(v_booking.code FROM 4);

  INSERT INTO jobs (
    id,
    code,
    intake_id,
    customer_name,
    customer_phone,
    service_type,
    event_address,
    status,
    event_date_start,
    event_date_end,
    equipment_usage_start,
    equipment_usage_end,
    items_snapshot
  ) VALUES (
    v_job_id,
    v_job_code,
    v_booking.id,
    v_booking.customer_name,
    v_booking.customer_phone,
    v_booking.service_type,
    v_booking.event_address,
    'chua_thuc_hien',
    v_booking.event_date_start,
    v_booking.event_date_end,
    v_booking.setup_date_start,
    v_booking.teardown_date_end,
    p_items_demand
  );

  -- 4. Tạo các bản ghi giữ kho (Inventory Reservations)
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items_demand)
  LOOP
    INSERT INTO inventory_reservations (
      id,
      job_id,
      item_code,
      requested_quantity,
      period_start,
      period_end,
      status
    ) VALUES (
      'res_' || v_job_id || '_' || (v_item.value->>'itemCode'),
      v_job_id,
      v_item.value->>'itemCode',
      (v_item.value->>'quantity')::INT,
      v_booking.setup_date_start,
      v_booking.teardown_date_end,
      'held'
    );
  END LOOP;

  -- 5. Cập nhật trạng thái booking thành đã xác nhận
  UPDATE intake_records
  SET status = 'da_xac_nhan',
      confirmed_job_id = v_job_id,
      updated_at = NOW()
  WHERE id = p_booking_id;

  -- 6. Ghi Audit Log
  INSERT INTO audit_logs (id, user_id, user_role, action, entity_type, entity_id, details)
  VALUES (
    'log_' || EXTRACT(EPOCH FROM NOW())::TEXT,
    p_actor_user_id,
    'quan_ly',
    'CONFIRM_BOOKING_TO_JOB',
    'JOB',
    v_job_id,
    'Xác nhận thành công booking ' || v_booking.code || ' thành Job ' || v_job_code
  );

  RETURN jsonb_build_object(
    'success', true,
    'jobId', v_job_id,
    'jobCode', v_job_code,
    'message', 'Đã chuyển thành công booking thành Job và giữ kho thiết bị thành công!'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC: XUẤT KHO THỰC TẾ & THU HỒI DỤNG CỤ
CREATE OR REPLACE FUNCTION rpc_dispatch_inventory_atomic(
  p_job_id TEXT,
  p_actor_user_id UUID
)
RETURNS JSONB AS $$
BEGIN
  -- Cập nhật reservations từ 'held' sang 'dispatched' (Không trừ lặp số lượng)
  UPDATE inventory_reservations
  SET status = 'dispatched'
  WHERE job_id = p_job_id AND status = 'held';

  -- Cập nhật trạng thái Job
  UPDATE jobs
  SET status = 'dang_thuc_hien', updated_at = NOW()
  WHERE id = p_job_id;

  RETURN jsonb_build_object('success', true, 'message', 'Đã xuất kho thiết bị thành công cho Job ' || p_job_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
