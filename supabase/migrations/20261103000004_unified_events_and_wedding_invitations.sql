-- One canonical event row from registration through contract, execution and payment.
-- Existing intake/jobs tables remain as migration archives; no customer data is deleted.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SEQUENCE IF NOT EXISTS event_code_seq START 1000;
CREATE OR REPLACE FUNCTION event_is_admin() RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT auth.uid() IS NOT NULL AND (
    COALESCE(auth.jwt()->'app_metadata'->>'event_admin', 'false') = 'true'
    OR EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_active AND role IN ('chu_don_vi','quan_ly'))
  );
$$;
REVOKE ALL ON FUNCTION event_is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION event_is_admin() TO authenticated;

ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS rental_price_vnd bigint NOT NULL DEFAULT 0;
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS image_url text;
CREATE TABLE IF NOT EXISTS event_records (
  id text PRIMARY KEY, code text NOT NULL UNIQUE, customer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_email text NOT NULL DEFAULT '', booking_status text NOT NULL CHECK (booking_status IN ('registered','received','cancelled','contacted')),
  contract_status text CHECK (contract_status IN ('preparing','transporting','installing','serving','dismantling','completed')),
  payload jsonb NOT NULL CHECK (jsonb_typeof(payload) = 'object'), revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS event_records_customer_idx ON event_records(customer_id);
CREATE INDEX IF NOT EXISTS event_records_event_day_idx ON event_records((payload->>'eventStart'));
ALTER TABLE event_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON event_records FROM anon, authenticated;
GRANT SELECT ON event_records TO authenticated;
GRANT SELECT,INSERT,UPDATE ON inventory_items TO authenticated;
CREATE POLICY event_owner_read ON event_records FOR SELECT TO authenticated USING (customer_id = auth.uid() OR event_is_admin());
CREATE POLICY event_inventory_read ON inventory_items FOR SELECT TO authenticated USING (true);
CREATE POLICY event_inventory_admin ON inventory_items FOR ALL TO authenticated USING (event_is_admin()) WITH CHECK (event_is_admin());

CREATE OR REPLACE FUNCTION save_event_record(p_record jsonb, p_expected_revision integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE
  v_old event_records%ROWTYPE; v_exists boolean; v_admin boolean := event_is_admin();
  v_owner uuid; v_id text := p_record->>'id'; v_code text; v_data jsonb;
  v_booking text := p_record->>'bookingStatus'; v_contract text := p_record->>'contractStatus';
  v_start timestamptz; v_end timestamptz; v_setup timestamptz; v_recovery timestamptz;
  v_total numeric; v_paid numeric; v_discount numeric; v_line jsonb; v_item record; v_stock inventory_items%ROWTYPE; v_reserved numeric; v_capacity numeric;
  v_message text; v_history jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Vui lòng đăng nhập.' USING ERRCODE = '42501'; END IF;
  IF p_expected_revision IS NULL OR jsonb_typeof(p_record) IS DISTINCT FROM 'object' OR v_id IS NULL OR length(v_id) NOT BETWEEN 1 AND 128 OR octet_length(p_record::text) > 262144 THEN RAISE EXCEPTION 'Hồ sơ không hợp lệ.'; END IF;
  -- Serialize inventory-changing writes before locking individual rows to avoid deadlocks.
  PERFORM pg_advisory_xact_lock(43122617);
  SELECT * INTO v_old FROM event_records WHERE id = v_id FOR UPDATE;
  v_exists := FOUND;
  IF (v_exists AND v_old.revision <> p_expected_revision) OR (NOT v_exists AND p_expected_revision <> 0) THEN RAISE EXCEPTION 'Hồ sơ vừa được cập nhật. Vui lòng tải lại.' USING ERRCODE = '40001'; END IF;
  IF v_exists THEN
    v_owner := v_old.customer_id; v_code := v_old.code;
    IF NOT v_admin AND (v_owner IS DISTINCT FROM auth.uid() OR v_old.contract_status IS NOT NULL OR v_old.booking_status = 'cancelled') THEN RAISE EXCEPTION 'Bạn không có quyền sửa hồ sơ này.' USING ERRCODE = '42501'; END IF;
    IF NOT v_admin THEN
      IF (v_old.booking_status <> 'registered' AND v_booking <> 'cancelled') OR v_booking NOT IN ('registered','cancelled') THEN RAISE EXCEPTION 'Lịch đã tiếp nhận chỉ có thể yêu cầu hủy; liên hệ quản trị để sửa chi tiết.'; END IF;
      IF (p_record - ARRAY['customerName','customerPhone','customerEmail','serviceType','themeId','themeName','eventStart','eventEnd','setupAt','recoveryAt','address','note','bookingStatus','revision','history','updatedAt']) IS DISTINCT FROM
         (v_old.payload - ARRAY['customerName','customerPhone','customerEmail','serviceType','themeId','themeName','eventStart','eventEnd','setupAt','recoveryAt','address','note','bookingStatus','revision','history','updatedAt']) THEN RAISE EXCEPTION 'Khách hàng không được sửa thông tin hợp đồng.' USING ERRCODE = '42501'; END IF;
    END IF;
  ELSE
    v_owner := CASE WHEN v_admin THEN NULLIF(p_record->>'customerId','')::uuid ELSE auth.uid() END;
    v_code := 'TD-' || to_char(now() AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYYMMDD') || '-' || nextval('event_code_seq')::text;
    IF NOT v_admin AND (v_booking <> 'registered' OR v_contract IS NOT NULL OR p_record->>'inventoryReturnedAt' IS NOT NULL OR p_record->'lines' <> '[]'::jsonb OR p_record->'payments' <> '[]'::jsonb OR COALESCE((p_record->>'discountVND')::numeric,0) <> 0) THEN RAISE EXCEPTION 'Lịch mới chưa được lập hợp đồng hoặc ghi nhận thu tiền.' USING ERRCODE = '42501'; END IF;
  END IF;
  IF v_admin AND v_owner IS NULL AND length(COALESCE(p_record->>'customerEmail','')) > 0 THEN SELECT id INTO v_owner FROM auth.users WHERE lower(email) = lower(p_record->>'customerEmail') LIMIT 1; END IF;
  IF v_booking IS NULL OR v_booking NOT IN ('registered','received','cancelled','contacted') OR (v_contract IS NOT NULL AND v_contract NOT IN ('preparing','transporting','installing','serving','dismantling','completed')) THEN RAISE EXCEPTION 'Trạng thái không hợp lệ.'; END IF;
  IF p_record->>'serviceType' IS NULL OR p_record->>'serviceType' NOT IN ('dam_cuoi','dam_hoi','nha_moi','khac') OR length(trim(COALESCE(p_record->>'customerName',''))) NOT BETWEEN 1 AND 120 OR regexp_replace(COALESCE(p_record->>'customerPhone',''),'\D','','g') !~ '^\d{10,11}$' THEN RAISE EXCEPTION 'Kiểm tra loại hình, tên và số điện thoại.'; END IF;
  v_start := (p_record->>'eventStart')::timestamptz; v_end := (p_record->>'eventEnd')::timestamptz; v_setup := (p_record->>'setupAt')::timestamptz; v_recovery := (p_record->>'recoveryAt')::timestamptz;
  IF v_start IS NULL OR v_end IS NULL OR v_setup IS NULL OR v_recovery IS NULL OR NOT isfinite(v_start) OR NOT isfinite(v_end) OR NOT isfinite(v_setup) OR NOT isfinite(v_recovery) OR v_setup > v_start OR v_start >= v_end OR v_end > v_recovery THEN RAISE EXCEPTION 'Thời gian lắp đặt, tổ chức và thu hồi chưa hợp lệ.'; END IF;
  IF jsonb_typeof(p_record->'lines') IS DISTINCT FROM 'array' OR jsonb_typeof(p_record->'payments') IS DISTINCT FROM 'array' OR jsonb_array_length(p_record->'lines') > 200 THEN RAISE EXCEPTION 'Danh sách hạng mục / thanh toán không hợp lệ.'; END IF;
  FOR v_line IN SELECT value FROM jsonb_array_elements(p_record->'lines') LOOP
    IF length(trim(COALESCE(v_line->>'name',''))) = 0 OR jsonb_typeof(v_line->'quantity') IS DISTINCT FROM 'number' OR (v_line->>'quantity')::numeric < 1 OR (v_line->>'quantity')::numeric <> trunc((v_line->>'quantity')::numeric) OR jsonb_typeof(v_line->'unitPriceVND') IS DISTINCT FROM 'number' OR (v_line->>'unitPriceVND')::numeric NOT BETWEEN 0 AND 1000000000000 THEN RAISE EXCEPTION 'Hạng mục cần tên, số lượng nguyên dương và đơn giá hợp lệ.'; END IF;
  END LOOP;
  v_discount := COALESCE((p_record->>'discountVND')::numeric,0);
  SELECT COALESCE(sum((value->>'quantity')::numeric * (value->>'unitPriceVND')::numeric),0) INTO v_total FROM jsonb_array_elements(p_record->'lines');
  IF v_discount < 0 OR v_discount > v_total THEN RAISE EXCEPTION 'Giảm giá không hợp lệ.'; END IF;
  v_total := v_total - v_discount;
  FOR v_line IN SELECT value FROM jsonb_array_elements(p_record->'payments') LOOP
    IF jsonb_typeof(v_line->'amountVND') IS DISTINCT FROM 'number' OR (v_line->>'amountVND')::numeric <= 0 OR v_line->>'method' IS NULL OR v_line->>'method' NOT IN ('cash','transfer') OR (v_line->>'paidAt')::timestamptz IS NULL THEN RAISE EXCEPTION 'Khoản thu không hợp lệ.'; END IF;
  END LOOP;
  SELECT COALESCE(sum((value->>'amountVND')::numeric),0) INTO v_paid FROM jsonb_array_elements(p_record->'payments');
  IF v_paid > v_total THEN RAISE EXCEPTION 'Tiền đã thu vượt giá trị hợp đồng.'; END IF;
  IF v_contract IS NOT NULL AND (v_booking = 'cancelled' OR jsonb_array_length(p_record->'lines') = 0 OR v_total <= 0 OR length(trim(COALESCE(p_record->>'address',''))) = 0) THEN RAISE EXCEPTION 'Bổ sung địa điểm, hạng mục và giá trị hợp đồng trước khi chuyển.'; END IF;
  IF p_record->>'inventoryReturnedAt' IS NOT NULL AND (v_contract IS DISTINCT FROM 'completed' OR NOT isfinite((p_record->>'inventoryReturnedAt')::timestamptz)) THEN RAISE EXCEPTION 'Chỉ xác nhận trả kho khi hợp đồng đã hoàn thành.'; END IF;
  IF v_exists AND v_old.contract_status IS NOT NULL AND v_contract IS NULL THEN RAISE EXCEPTION 'Không được xóa hợp đồng đã lập.'; END IF;
  IF v_contract IS NOT NULL AND p_record->>'inventoryReturnedAt' IS NULL THEN
    FOR v_item IN SELECT value->>'itemCode' AS code, sum((value->>'quantity')::numeric) AS quantity FROM jsonb_array_elements(p_record->'lines') WHERE length(COALESCE(value->>'itemCode','')) > 0 GROUP BY value->>'itemCode' ORDER BY value->>'itemCode' LOOP
      SELECT * INTO v_stock FROM inventory_items WHERE code = v_item.code FOR UPDATE;
      IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy dụng cụ % trong kho.', v_item.code; END IF;
      SELECT COALESCE(sum((line->>'quantity')::numeric),0) INTO v_reserved
      FROM event_records other CROSS JOIN LATERAL jsonb_array_elements(other.payload->'lines') line
      WHERE other.id <> v_id AND other.contract_status IS NOT NULL AND other.booking_status <> 'cancelled' AND other.payload->>'inventoryReturnedAt' IS NULL
        AND line->>'itemCode' = v_item.code
        AND (other.payload->>'setupAt')::timestamptz < v_recovery + make_interval(hours => v_stock.cleaning_turnaround_hours)
        AND (CASE WHEN other.contract_status <> 'preparing' AND (other.payload->>'recoveryAt')::timestamptz < now() THEN 'infinity'::timestamptz ELSE (other.payload->>'recoveryAt')::timestamptz + make_interval(hours => v_stock.cleaning_turnaround_hours) END) > v_setup;
      v_capacity := floor((v_stock.total_owned_quantity + v_stock.external_rented_quantity - v_stock.in_repair_quantity - v_stock.scrapped_quantity) * (1-v_stock.buffer_ratio));
      IF v_reserved + v_item.quantity > v_capacity THEN RAISE EXCEPTION 'Kho không đủ %: còn %, cần %.', v_stock.name, greatest(0,v_capacity-v_reserved), v_item.quantity; END IF;
    END LOOP;
  END IF;
  v_message := CASE WHEN NOT v_exists THEN 'Mới đăng ký' WHEN v_old.contract_status IS NULL AND v_contract IS NOT NULL THEN 'Chuyển lịch đặt sang hợp đồng' WHEN v_old.payload->'payments' IS DISTINCT FROM p_record->'payments' THEN 'Cập nhật thanh toán' ELSE 'Cập nhật hồ sơ / tiến độ' END;
  v_history := COALESCE(v_old.payload->'history','[]'::jsonb) || jsonb_build_array(jsonb_build_object('at',now(),'actor',COALESCE(auth.jwt()->'user_metadata'->>'full_name',auth.jwt()->>'email'),'message',v_message));
  v_data := p_record || jsonb_build_object('id',v_id,'code',v_code,'customerId',v_owner,'revision',p_expected_revision+1,'createdAt',COALESCE(v_old.created_at,now()),'updatedAt',now(),'history',v_history,
    'contractNumber',CASE WHEN v_contract IS NOT NULL THEN COALESCE(v_old.payload->>'contractNumber','HD-' || substring(v_code from 4)) ELSE NULL END,
    'convertedAt',CASE WHEN v_contract IS NOT NULL THEN COALESCE(v_old.payload->>'convertedAt',now()::text) ELSE NULL END);
  INSERT INTO event_records(id,code,customer_id,customer_email,booking_status,contract_status,payload,revision)
  VALUES(v_id,v_code,v_owner,COALESCE(p_record->>'customerEmail',''),v_booking,v_contract,v_data,p_expected_revision+1)
  ON CONFLICT(id) DO UPDATE SET customer_id=EXCLUDED.customer_id,customer_email=EXCLUDED.customer_email,booking_status=EXCLUDED.booking_status,contract_status=EXCLUDED.contract_status,payload=EXCLUDED.payload,revision=EXCLUDED.revision,updated_at=now();
  RETURN v_data;
END;
$$;
REVOKE ALL ON FUNCTION save_event_record(jsonb,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION save_event_record(jsonb,integer) TO authenticated;

CREATE TABLE IF NOT EXISTS wedding_invitations (
  id text PRIMARY KEY, event_id text NOT NULL UNIQUE REFERENCES event_records(id), slug text NOT NULL UNIQUE,
  owner_ids uuid[] NOT NULL, published boolean NOT NULL DEFAULT false, payload jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS wedding_responses (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text, invitation_id text NOT NULL REFERENCES wedding_invitations(id) ON DELETE CASCADE,
  guest_token_hash text NOT NULL, payload jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(invitation_id,guest_token_hash)
);
ALTER TABLE wedding_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedding_responses ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON wedding_invitations,wedding_responses FROM anon,authenticated;
GRANT SELECT ON wedding_invitations,wedding_responses TO authenticated;
CREATE POLICY wedding_managers_read ON wedding_invitations FOR SELECT TO authenticated USING(auth.uid() = ANY(owner_ids) OR event_is_admin());
CREATE POLICY wedding_responses_managers_read ON wedding_responses FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM wedding_invitations i WHERE i.id=invitation_id AND (auth.uid() = ANY(i.owner_ids) OR event_is_admin())));

CREATE OR REPLACE FUNCTION save_wedding_invitation(p_invitation jsonb,p_expected_revision integer) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_old wedding_invitations%ROWTYPE; v_event event_records%ROWTYPE; v_exists boolean; v_owners uuid[]; v_data jsonb; v_content jsonb:=p_invitation->'content'; v_public boolean:=COALESCE((p_invitation->>'published')::boolean,false);
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Vui lòng đăng nhập.' USING ERRCODE='42501'; END IF;
  IF p_expected_revision IS NULL THEN RAISE EXCEPTION 'Thiếu phiên bản thiệp.'; END IF;
  SELECT * INTO v_old FROM wedding_invitations WHERE id=p_invitation->>'id' FOR UPDATE; v_exists:=FOUND;
  IF v_exists THEN
    IF NOT (auth.uid()=ANY(v_old.owner_ids) OR event_is_admin()) THEN RAISE EXCEPTION 'Bạn không có quyền sửa thiệp.' USING ERRCODE='42501'; END IF;
    IF v_old.revision<>p_expected_revision OR v_old.event_id IS DISTINCT FROM p_invitation->>'eventId' OR v_old.slug IS DISTINCT FROM p_invitation->>'slug' THEN RAISE EXCEPTION 'Thiệp vừa cập nhật. Đóng và mở lại trước khi lưu.' USING ERRCODE='40001'; END IF;
    v_owners:=v_old.owner_ids;
  ELSE
    SELECT * INTO v_event FROM event_records WHERE id=p_invitation->>'eventId' FOR UPDATE;
    IF NOT FOUND OR NOT (v_event.customer_id=auth.uid() OR event_is_admin()) OR v_event.payload->>'serviceType' NOT IN ('dam_cuoi','dam_hoi') THEN RAISE EXCEPTION 'Thiệp cần liên kết lịch cưới / ăn hỏi của bạn.' USING ERRCODE='42501'; END IF;
    IF p_expected_revision<>0 THEN RAISE EXCEPTION 'Phiên bản thiệp không hợp lệ.'; END IF;
    SELECT array_agg(DISTINCT value) INTO v_owners FROM unnest(ARRAY[auth.uid(),v_event.customer_id]) value WHERE value IS NOT NULL;
  END IF;
  IF COALESCE(p_invitation->>'slug','') !~ '^[a-zA-Z0-9-]{6,100}$' OR jsonb_typeof(v_content) IS DISTINCT FROM 'object' OR octet_length(v_content::text)>262144 OR jsonb_typeof(v_content->'photos') IS DISTINCT FROM 'array' OR jsonb_array_length(v_content->'photos')>12 OR jsonb_typeof(v_content->'ceremonies') IS DISTINCT FROM 'array' OR jsonb_array_length(v_content->'ceremonies') NOT BETWEEN 1 AND 8 THEN RAISE EXCEPTION 'Thông tin thiệp / album không hợp lệ.'; END IF;
  IF v_public AND (length(trim(COALESCE(v_content->'bride'->>'name','')))=0 OR length(trim(COALESCE(v_content->'groom'->>'name','')))=0 OR NULLIF(v_content->'ceremonies'->0->>'at','')::timestamptz IS NULL OR length(trim(COALESCE(v_content->'ceremonies'->0->>'address','')))=0) THEN RAISE EXCEPTION 'Bổ sung tên cô dâu, chú rể, ngày và địa chỉ trước khi công bố.'; END IF;
  v_data:=p_invitation || jsonb_build_object('ownerIds',v_owners,'revision',p_expected_revision+1,'updatedAt',now());
  INSERT INTO wedding_invitations(id,event_id,slug,owner_ids,published,payload,revision) VALUES(p_invitation->>'id',p_invitation->>'eventId',p_invitation->>'slug',v_owners,v_public,v_data,p_expected_revision+1)
  ON CONFLICT(id) DO UPDATE SET published=EXCLUDED.published,payload=EXCLUDED.payload,revision=EXCLUDED.revision,updated_at=now();
  RETURN v_data;
END;
$$;
REVOKE ALL ON FUNCTION save_wedding_invitation(jsonb,integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION save_wedding_invitation(jsonb,integer) TO authenticated;

CREATE OR REPLACE FUNCTION add_wedding_manager(p_invitation_id text,p_email text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_inv wedding_invitations%ROWTYPE; v_user uuid; v_owners uuid[];
BEGIN
  SELECT * INTO v_inv FROM wedding_invitations WHERE id=p_invitation_id FOR UPDATE;
  IF NOT FOUND OR auth.uid() IS NULL OR NOT (auth.uid()=ANY(v_inv.owner_ids) OR event_is_admin()) THEN RAISE EXCEPTION 'Bạn không có quyền cấp quyền quản lý thiệp.' USING ERRCODE='42501'; END IF;
  SELECT id INTO v_user FROM auth.users WHERE lower(email)=lower(trim(p_email)) LIMIT 1;
  IF v_user IS NULL THEN RAISE EXCEPTION 'Email này cần đăng ký tài khoản trước.'; END IF;
  SELECT array_agg(DISTINCT value) INTO v_owners FROM unnest(v_inv.owner_ids || ARRAY[v_user]) value;
  UPDATE wedding_invitations SET owner_ids=v_owners,revision=revision+1,updated_at=now(),payload=payload || jsonb_build_object('ownerIds',v_owners,'revision',revision+1,'updatedAt',now()) WHERE id=p_invitation_id;
END;
$$;
REVOKE ALL ON FUNCTION add_wedding_manager(text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION add_wedding_manager(text,text) TO authenticated;

CREATE OR REPLACE FUNCTION get_public_wedding_invitation(p_slug text) RETURNS jsonb
LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
  SELECT jsonb_build_object('invitation',i.payload || '{"ownerIds":[]}'::jsonb,'wishes',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',r.id,'guestName',r.payload->>'guestName','message',r.payload->>'message','updatedAt',r.updated_at) ORDER BY r.updated_at DESC) FROM wedding_responses r WHERE r.invitation_id=i.id AND r.payload->>'isPublic'='true' AND r.payload->>'approved'='true'),'[]'::jsonb)) FROM wedding_invitations i WHERE i.slug=p_slug AND i.published;
$$;
REVOKE ALL ON FUNCTION get_public_wedding_invitation(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_public_wedding_invitation(text) TO anon,authenticated;

CREATE OR REPLACE FUNCTION submit_wedding_response(p_slug text,p_guest_token text,p_response jsonb) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_inv text; v_id text; v_hash text; v_data jsonb; v_attendance text:=p_response->>'attendance'; v_party integer;
BEGIN
  SELECT id INTO v_inv FROM wedding_invitations WHERE slug=p_slug AND published;
  IF v_inv IS NULL THEN RAISE EXCEPTION 'Thiệp chưa được công bố.'; END IF;
  IF length(COALESCE(p_guest_token,'')) NOT BETWEEN 32 AND 128 OR length(trim(COALESCE(p_response->>'guestName',''))) NOT BETWEEN 1 AND 120 OR length(COALESCE(p_response->>'phone',''))>30 OR length(COALESCE(p_response->>'message',''))>2000 OR v_attendance IS NULL OR v_attendance NOT IN ('yes','no','maybe') THEN RAISE EXCEPTION 'Thông tin phản hồi không hợp lệ.'; END IF;
  v_party:=(p_response->>'partySize')::integer;
  IF v_party IS NULL OR v_party NOT BETWEEN 0 AND 20 OR (v_attendance='yes' AND v_party<1) THEN RAISE EXCEPTION 'Số người tham dự không hợp lệ.'; END IF;
  v_hash:=encode(sha256(convert_to(v_inv || ':' || p_guest_token,'UTF8')),'hex');
  v_data:=jsonb_build_object('invitationId',v_inv,'guestName',trim(p_response->>'guestName'),'phone',COALESCE(p_response->>'phone',''),'attendance',v_attendance,'partySize',CASE WHEN v_attendance='no' THEN 0 ELSE v_party END,'message',COALESCE(p_response->>'message',''),'isPublic',COALESCE((p_response->>'isPublic')::boolean,false),'approved',false,'updatedAt',now());
  INSERT INTO wedding_responses(invitation_id,guest_token_hash,payload) VALUES(v_inv,v_hash,v_data) ON CONFLICT(invitation_id,guest_token_hash) DO UPDATE SET payload=EXCLUDED.payload,updated_at=now() RETURNING id INTO v_id;
  UPDATE wedding_responses SET payload=payload || jsonb_build_object('id',v_id) WHERE id=v_id;
  RETURN v_id;
END;
$$;
REVOKE ALL ON FUNCTION submit_wedding_response(text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_wedding_response(text,text,jsonb) TO anon,authenticated;

CREATE OR REPLACE FUNCTION moderate_wedding_response(p_response_id text,p_approved boolean) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_response wedding_responses%ROWTYPE; v_inv wedding_invitations%ROWTYPE; v_data jsonb;
BEGIN
  SELECT * INTO v_response FROM wedding_responses WHERE id=p_response_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Không tìm thấy phản hồi.'; END IF;
  SELECT * INTO v_inv FROM wedding_invitations WHERE id=v_response.invitation_id;
  IF auth.uid() IS NULL OR NOT (auth.uid()=ANY(v_inv.owner_ids) OR event_is_admin()) THEN RAISE EXCEPTION 'Bạn không có quyền quản lý lời chúc.' USING ERRCODE='42501'; END IF;
  v_data:=v_response.payload || jsonb_build_object('approved',p_approved);
  UPDATE wedding_responses SET payload=v_data WHERE id=p_response_id;
  RETURN v_data;
END;
$$;
REVOKE ALL ON FUNCTION moderate_wedding_response(text,boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION moderate_wedding_response(text,boolean) TO authenticated;

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('wedding-photos','wedding-photos',true,5242880,ARRAY['image/jpeg','image/png','image/webp']) ON CONFLICT(id) DO NOTHING;
CREATE POLICY wedding_photo_owner_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='wedding-photos' AND (storage.foldername(name))[1]=auth.uid()::text);
CREATE POLICY wedding_photo_public_read ON storage.objects FOR SELECT TO anon,authenticated USING(bucket_id='wedding-photos');

-- Backfill without overwriting records already managed through the new workflow.
INSERT INTO event_records(id,code,customer_id,customer_email,booking_status,contract_status,payload,revision,created_at,updated_at)
SELECT i.id,i.code,u.id,COALESCE(i.customer_email,''),
  CASE WHEN i.status::text IN ('da_huy','khong_tiep_tuc') OR j.status::text='da_huy' THEN 'cancelled' WHEN i.status::text='moi_gui' THEN 'registered' WHEN i.status::text='dang_lien_he' THEN 'received' ELSE 'contacted' END,
  CASE WHEN j.id IS NULL OR j.status::text='da_huy' THEN NULL WHEN j.status::text='da_hoan_thanh' THEN 'completed' WHEN j.status::text='dang_thuc_hien' THEN 'serving' ELSE 'preparing' END,
  jsonb_build_object('id',i.id,'code',i.code,'customerId',u.id,'customerName',i.customer_name,'customerPhone',i.customer_phone,'customerEmail',COALESCE(i.customer_email,''),
    'serviceType',CASE WHEN i.service_type IN ('dam_cuoi','dam_hoi','nha_moi') THEN i.service_type ELSE 'khac' END,'themeId','','themeName','','eventStart',i.event_date_start,'eventEnd',i.event_date_end,'setupAt',i.setup_date_start,'recoveryAt',i.teardown_date_end,'address',i.event_address,'note',COALESCE(i.note,''),
    'bookingStatus',CASE WHEN i.status::text IN ('da_huy','khong_tiep_tuc') OR j.status::text='da_huy' THEN 'cancelled' WHEN i.status::text='moi_gui' THEN 'registered' WHEN i.status::text='dang_lien_he' THEN 'received' ELSE 'contacted' END,
    'contractStatus',CASE WHEN j.id IS NULL OR j.status::text='da_huy' THEN NULL WHEN j.status::text='da_hoan_thanh' THEN 'completed' WHEN j.status::text='dang_thuc_hien' THEN 'serving' ELSE 'preparing' END,
    'contractNumber',CASE WHEN j.id IS NOT NULL THEN replace(j.code,'JOB-','HD-') ELSE NULL END,'convertedAt',j.created_at,'inventoryReturnedAt',CASE WHEN j.is_inventory_returned THEN j.updated_at ELSE NULL END,
    'lines',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',gen_random_uuid()::text,'itemCode',x->>'itemCode','name',x->>'itemName','category','legacy','unit',x->>'unit','quantity',(x->>'quantity')::numeric,'unitPriceVND',0)) FROM jsonb_array_elements(COALESCE(j.items_snapshot,'[]'::jsonb)) x),'[]'::jsonb) || CASE WHEN q.final_amount_vnd>0 THEN jsonb_build_array(jsonb_build_object('id',gen_random_uuid()::text,'itemCode','','name','Giá trị hợp đồng cũ','category','dich_vu','unit','gói','quantity',1,'unitPriceVND',q.final_amount_vnd)) ELSE '[]'::jsonb END,
    'discountVND',0,'payments',COALESCE((SELECT jsonb_agg(jsonb_build_object('id',p.id,'amountVND',p.amount_vnd,'paidAt',p.payment_date,'method',CASE WHEN p.payment_method='tien_mat' THEN 'cash' ELSE 'transfer' END,'note',COALESCE(p.notes,''))) FROM payment_receipts p WHERE p.intake_id=i.id),'[]'::jsonb),
    'history',jsonb_build_array(jsonb_build_object('at',now(),'actor','Hệ thống','message','Chuyển dữ liệu cũ vào bảng thống nhất')),'createdAt',i.created_at,'updatedAt',i.updated_at,'revision',1),
  1,i.created_at,i.updated_at
FROM intake_records i LEFT JOIN jobs j ON j.intake_id=i.id
LEFT JOIN LATERAL(SELECT id FROM auth.users WHERE lower(email)=lower(i.customer_email) LIMIT 1) u ON true
LEFT JOIN LATERAL(SELECT final_amount_vnd FROM quotes WHERE intake_id=i.id ORDER BY is_final DESC,version DESC LIMIT 1) q ON true
ON CONFLICT(id) DO NOTHING;

-- Retire old mutation surfaces so clients cannot accidentally write a second live source.
REVOKE INSERT,UPDATE,DELETE ON intake_records,jobs,job_tasks,inventory_reservations,payment_receipts,quotes FROM anon,authenticated;
DO $$ DECLARE f record; BEGIN
  FOR f IN SELECT oid::regprocedure AS signature FROM pg_proc WHERE pronamespace='public'::regnamespace AND proname IN ('rpc_create_public_booking','rpc_confirm_booking_to_job_atomic','rpc_dispatch_inventory_atomic','rpc_check_booking_status') LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature);
  END LOOP;
END $$;
COMMIT;
