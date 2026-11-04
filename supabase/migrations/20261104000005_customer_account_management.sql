BEGIN;
CREATE OR REPLACE FUNCTION admin_list_customer_accounts(p_search text DEFAULT '',p_limit integer DEFAULT 50,p_offset integer DEFAULT 0)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE v_accounts jsonb; v_total integer;
BEGIN
  IF auth.uid() IS NULL OR NOT event_is_admin() THEN RAISE EXCEPTION 'Chỉ quản trị được xem tài khoản khách hàng.' USING ERRCODE='42501'; END IF;
  IF length(COALESCE(p_search,''))>120 OR p_limit IS NULL OR p_limit NOT BETWEEN 1 AND 100 OR p_offset IS NULL OR p_offset<0 THEN RAISE EXCEPTION 'Tham số tìm kiếm không hợp lệ.'; END IF;
  WITH customers AS (
    SELECT u.* FROM auth.users u WHERE COALESCE(u.raw_app_meta_data->>'event_admin','false')<>'true'
      AND NOT EXISTS(SELECT 1 FROM user_profiles p WHERE p.id=u.id)
      AND (COALESCE(p_search,'')='' OR strpos(lower(COALESCE(u.email,'') || ' ' || COALESCE(u.raw_user_meta_data->>'full_name','') || ' ' || COALESCE(u.raw_user_meta_data->>'phone','')),lower(p_search))>0)
  ) SELECT count(*) INTO v_total FROM customers;
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id',u.id,'fullName',COALESCE(u.raw_user_meta_data->>'full_name',u.email),'email',COALESCE(u.email,''),'phone',COALESCE(u.raw_user_meta_data->>'phone',''),'role','customer','registeredAt',u.created_at,'emailConfirmed',u.email_confirmed_at IS NOT NULL,'lastSignInAt',u.last_sign_in_at) ORDER BY u.created_at DESC,u.id),'[]'::jsonb) INTO v_accounts
  FROM (SELECT u.* FROM auth.users u WHERE COALESCE(u.raw_app_meta_data->>'event_admin','false')<>'true'
    AND NOT EXISTS(SELECT 1 FROM user_profiles p WHERE p.id=u.id)
    AND (COALESCE(p_search,'')='' OR strpos(lower(COALESCE(u.email,'') || ' ' || COALESCE(u.raw_user_meta_data->>'full_name','') || ' ' || COALESCE(u.raw_user_meta_data->>'phone','')),lower(p_search))>0)
    ORDER BY u.created_at DESC,u.id LIMIT p_limit OFFSET p_offset) u;
  RETURN jsonb_build_object('accounts',v_accounts,'total',v_total);
END; $$;
REVOKE ALL ON FUNCTION admin_list_customer_accounts(text,integer,integer) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION admin_list_customer_accounts(text,integer,integer) TO authenticated;
COMMIT;
