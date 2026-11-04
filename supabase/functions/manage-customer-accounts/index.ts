import { createClient } from 'npm:@supabase/supabase-js@2.110.0';

// Service role stays in the Edge Function environment, never in VITE_* or the response.
Deno.serve(async (request: Request) => {
  const allowed = (Deno.env.get('ALLOWED_ORIGINS') || 'http://localhost:5173,http://127.0.0.1:5173,http://127.0.0.1:5174').split(',').map(value => value.trim());
  const origin = request.headers.get('origin') || '';
  const headers = { 'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0], 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Vary': 'Origin' };
  const response = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return response(405, { error: 'Phương thức không hợp lệ.' });
  if (origin && !allowed.includes(origin)) return response(403, { error: 'Website chưa được cấp phép.' });
  try {
    const url = Deno.env.get('SUPABASE_URL')!; const anon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const authorization = request.headers.get('Authorization') || '';
    if (!authorization.startsWith('Bearer ')) return response(401, { error: 'Vui lòng đăng nhập.' });
    const caller = createClient(url, anon, { global: { headers: { Authorization: authorization } }, auth: { persistSession: false } });
    const { data: session, error: authError } = await caller.auth.getUser(authorization.slice(7));
    if (authError || !session.user) return response(401, { error: 'Phiên đăng nhập không hợp lệ.' });
    const { data: isAdmin, error: roleError } = await caller.rpc('event_is_admin');
    if (roleError || !isAdmin) return response(403, { error: 'Chỉ quản trị được cấp lại mật khẩu.' });
    const body = await request.json();
    if (body.action !== 'reset-password' || typeof body.userId !== 'string' || !/^[0-9a-f-]{36}$/i.test(body.userId) || typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 128) return response(400, { error: 'Kiểm tra tài khoản và mật khẩu mới (8–128 ký tự).' });
    const service = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data: target, error: targetError } = await service.auth.admin.getUserById(body.userId);
    const { data: profile, error: profileError } = await service.from('user_profiles').select('id').eq('id', body.userId).maybeSingle();
    if (targetError || !target.user) return response(404, { error: 'Không tìm thấy tài khoản khách hàng.' });
    if (profileError) return response(500, { error: 'Chưa thể kiểm tra quyền của tài khoản.' });
    if (String(target.user.app_metadata?.event_admin) === 'true' || profile || target.user.id === session.user.id) return response(403, { error: 'Chức năng này chỉ cấp lại mật khẩu khách hàng.' });
    const { error } = await service.auth.admin.updateUserById(body.userId, { password: body.password });
    if (error) return response(400, { error: 'Chưa thể đặt mật khẩu mới. Kiểm tra chính sách mật khẩu của dự án.' });
    return response(200, { success: true });
  } catch { return response(500, { error: 'Chưa thể cấp lại mật khẩu. Vui lòng thử lại.' }); }
});
