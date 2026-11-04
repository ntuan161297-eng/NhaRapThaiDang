import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import vm from 'node:vm';

function handler({ valid = true, admin = true, targetAdmin = false, profile = null, updateError = null } = {}) {
  let serve, updates = 0;
  const caller = { auth: { getUser: async () => valid ? { data: { user: { id: 'caller' } }, error: null } : { data: { user: null }, error: new Error('invalid') } }, rpc: async () => ({ data: admin, error: null }) };
  const service = { auth: { admin: { getUserById: async id => ({ data: { user: { id, app_metadata: { event_admin: targetAdmin } } }, error: null }), updateUserById: async () => { updates++; return { error: updateError }; } } }, from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: profile, error: null }) }) }) }) };
  const source = readFileSync(new URL('../../../supabase/functions/manage-customer-accounts/index.ts', import.meta.url),'utf8').replace(/^import .*;\r?\n/, '');
  vm.runInNewContext(stripTypeScriptTypes(source), { Request, Response, createClient: (_url,key) => key === 'service-secret' ? service : caller, Deno: { env: { get: name => ({ SUPABASE_URL:'https://example.test',SUPABASE_ANON_KEY:'public-key',SUPABASE_SERVICE_ROLE_KEY:'service-secret',ALLOWED_ORIGINS:'https://site.test' })[name] }, serve: fn => { serve = fn; } } });
  return { run: (token = 'valid', origin = 'https://site.test') => serve(new Request('https://edge.test',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',...(token ? {Authorization:`Bearer ${token}`} : {})},body:JSON.stringify({action:'reset-password',userId:'00000000-0000-4000-8000-000000000002',password:'Replacement123!'})})), updates: () => updates };
}
test('Edge Function từ chối thiếu phiên, phiên giả và khách không phải quản trị', async () => {
  for (const [options,token,status] of [[{},'',401],[{valid:false},'fake',401],[{admin:false},'valid',403]]) { const mock=handler(options);assert.equal((await mock.run(token)).status,status);assert.equal(mock.updates(),0); }
});
test('Edge Function không cho đặt lại mật khẩu quản trị hoặc hồ sơ nhân sự', async () => {
  for (const options of [{targetAdmin:true},{targetAdmin:'true'},{profile:{id:'staff'}}]) { const mock=handler(options);assert.equal((await mock.run()).status,403);assert.equal(mock.updates(),0); }
});
test('Quản trị đặt lại mật khẩu khách qua server; phản hồi không chứa mật khẩu hoặc service key', async () => {
  const mock=handler();const response=await mock.run();assert.equal(response.status,200);assert.equal(mock.updates(),1);const body=await response.text();assert.deepEqual(JSON.parse(body),{success:true});assert.ok(!body.includes('Replacement123!'));assert.ok(!body.includes('service-secret'));
  assert.equal((await handler().run('valid','https://untrusted.test')).status,403);
  assert.equal((await handler({updateError:new Error('policy')}).run()).status,400);
});
