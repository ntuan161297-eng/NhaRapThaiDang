BEGIN;
CREATE OR REPLACE FUNCTION validate_wedding_design() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
DECLARE c jsonb:=NEW.payload->'content'; item jsonb;
BEGIN
  IF c->>'style' IS NOT NULL AND c->>'style' NOT IN ('quan_ho','cong_nghe','hoang_gia','thanh_lich','sang_trong') THEN RAISE EXCEPTION 'Phong cách thiệp không hợp lệ.'; END IF;
  IF length(COALESCE(c->>'guestSalutation',''))>80 OR length(COALESCE(c->>'guestName',''))>120 OR length(COALESCE(c->>'closingMessage',''))>1000 OR length(COALESCE(c->>'transportNote',''))>1500 THEN RAISE EXCEPTION 'Thông tin bổ sung của thiệp quá dài.'; END IF;
  IF COALESCE(c->>'rsvpDeadline','')<>'' THEN
    IF c->>'rsvpDeadline' !~ '^\d{4}-\d{2}-\d{2}$' THEN RAISE EXCEPTION 'Ngày hạn xác nhận không hợp lệ.'; END IF;
    PERFORM (c->>'rsvpDeadline')::date;
  END IF;
  IF (COALESCE(c->>'musicUrl','')<>'' AND c->>'musicUrl' !~ '^https?://') OR (COALESCE(c->>'videoUrl','')<>'' AND c->>'videoUrl' !~ '^https?://') THEN RAISE EXCEPTION 'Nhạc và video cần liên kết HTTP hoặc HTTPS.'; END IF;
  IF c ? 'milestones' THEN
    IF jsonb_typeof(c->'milestones') IS DISTINCT FROM 'array' THEN RAISE EXCEPTION 'Hành trình yêu thương cần danh sách dấu mốc.'; END IF;
    IF jsonb_array_length(c->'milestones')>8 THEN RAISE EXCEPTION 'Tối đa 8 dấu mốc.'; END IF;
    FOR item IN SELECT value FROM jsonb_array_elements(c->'milestones') LOOP
      IF length(COALESCE(item->>'title',''))>120 OR length(COALESCE(item->>'description',''))>1000 THEN RAISE EXCEPTION 'Dấu mốc quá dài.'; END IF;
      IF COALESCE(item->>'date','')<>'' THEN PERFORM (item->>'date')::date; END IF;
    END LOOP;
  END IF;
  FOR item IN SELECT value FROM jsonb_array_elements(c->'ceremonies') LOOP
    IF item->>'host' IS NOT NULL AND item->>'host' NOT IN ('groom','bride','both') THEN RAISE EXCEPTION 'Nhà tổ chức không hợp lệ.'; END IF;
    IF item->>'kind' IS NOT NULL AND item->>'kind' NOT IN ('le_cuoi','tiec_moi','an_hoi','khac') THEN RAISE EXCEPTION 'Loại buổi lễ không hợp lệ.'; END IF;
  END LOOP;
  RETURN NEW;
END; $$;
CREATE TRIGGER wedding_design_guard BEFORE INSERT OR UPDATE OF payload ON wedding_invitations FOR EACH ROW EXECUTE FUNCTION validate_wedding_design();

-- Keep the original token, moderation and idempotency implementation private.
ALTER FUNCTION submit_wedding_response(text,text,jsonb) RENAME TO _submit_wedding_response_v1;
REVOKE ALL ON FUNCTION _submit_wedding_response_v1(text,text,jsonb) FROM PUBLIC,anon,authenticated;
CREATE FUNCTION submit_wedding_response(p_slug text,p_guest_token text,p_response jsonb) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_deadline text; v_id text; v_relationship text:=COALESCE(p_response->>'relationship',''); v_note text:=COALESCE(p_response->>'note','');
BEGIN
  SELECT payload->'content'->>'rsvpDeadline' INTO v_deadline FROM wedding_invitations WHERE slug=p_slug AND published;
  IF COALESCE(v_deadline,'')<>'' AND now()>(v_deadline || 'T23:59:59+07:00')::timestamptz THEN RAISE EXCEPTION 'Đã hết hạn xác nhận. Vui lòng liên hệ hai gia đình.'; END IF;
  IF v_relationship NOT IN ('','nha_trai','nha_gai','ban_be','khac') OR length(v_note)>1000 THEN RAISE EXCEPTION 'Thông tin khách mời bổ sung không hợp lệ.'; END IF;
  v_id:=_submit_wedding_response_v1(p_slug,p_guest_token,p_response);
  UPDATE wedding_responses SET payload=payload || jsonb_build_object('relationship',v_relationship,'note',v_note) WHERE id=v_id;
  RETURN v_id;
END; $$;
REVOKE ALL ON FUNCTION submit_wedding_response(text,text,jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_wedding_response(text,text,jsonb) TO anon,authenticated;
COMMIT;
