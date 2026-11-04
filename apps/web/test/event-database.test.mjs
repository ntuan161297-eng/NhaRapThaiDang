import { before, after, test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto';

const db = new PGlite({ extensions: { pgcrypto } });
const ids = { admin: '00000000-0000-4000-8000-000000000001', alice: '00000000-0000-4000-8000-000000000002', bob: '00000000-0000-4000-8000-000000000003' };
async function as(user, sql, params = []) {
  await db.exec('RESET ROLE');
  const claims = user ? { sub: ids[user], email: `${user}@example.test`, app_metadata: { event_admin: user === 'admin' }, user_metadata: { full_name: user } } : {};
  await db.query("SELECT set_config('request.jwt.claim.sub',$1,false),set_config('request.jwt.claims',$2,false)", [user ? ids[user] : '', JSON.stringify(claims)]);
  await db.exec(`SET ROLE ${user ? 'authenticated' : 'anon'}`);
  try { return await db.query(sql, params); } finally { await db.exec('RESET ROLE'); }
}
const save = async (user, record, revision = record.revision) => (await as(user, 'SELECT save_event_record($1::jsonb,$2) AS record', [JSON.stringify(record), revision])).rows[0].record;
function booking(id, customer = 'alice') {
  return { id, code: 'IGNORED-CLIENT-CODE', customerId: ids[customer], customerName: customer, customerPhone: '0912345678', customerEmail: `${customer}@example.test`, serviceType: 'dam_cuoi', themeId: '', themeName: '', eventStart: '2035-11-10T03:00:00Z', eventEnd: '2035-11-10T07:00:00Z', setupAt: '2035-11-09T07:00:00Z', recoveryAt: '2035-11-11T01:00:00Z', address: '', note: '', bookingStatus: 'registered', contractStatus: null, contractNumber: null, lines: [], discountVND: 0, payments: [], inventoryReturnedAt: null, convertedAt: null, history: [], createdAt: '2035-01-01T00:00:00Z', updatedAt: '2035-01-01T00:00:00Z', revision: 0 };
}
let first, second, invitation;
before(async () => {
  await db.exec(`
    CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;
    CREATE SCHEMA auth; CREATE SCHEMA storage;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_app_meta_data jsonb DEFAULT '{}',raw_user_meta_data jsonb DEFAULT '{}',created_at timestamptz DEFAULT now(),email_confirmed_at timestamptz,last_sign_in_at timestamptz);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT NULLIF(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    CREATE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$ SELECT COALESCE(NULLIF(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
    CREATE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$ SELECT current_user::text $$;
    CREATE FUNCTION uuid_generate_v4() RETURNS uuid LANGUAGE sql AS $$ SELECT gen_random_uuid() $$;
    CREATE TABLE storage.buckets(id text PRIMARY KEY,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    CREATE TABLE storage.objects(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),bucket_id text,name text);
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    CREATE FUNCTION storage.foldername(text) RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT string_to_array($1,'/') $$;
    GRANT USAGE ON SCHEMA public,auth,storage TO anon,authenticated;
    GRANT SELECT,INSERT,UPDATE,DELETE ON storage.objects TO anon,authenticated;
  `);
  for (const [name, id] of Object.entries(ids)) await db.query('INSERT INTO auth.users(id,email,raw_app_meta_data) VALUES($1,$2,$3)', [id, `${name}@example.test`,JSON.stringify({event_admin:name==='admin'})]);
  for (const filename of ['20261012000001_initial_schema.sql','20261013000002_site_settings_and_unified_api.sql','20261013000003_customers_and_core_entities_sync.sql']) {
    const sql = readFileSync(new URL(`../../../supabase/migrations/${filename}`, import.meta.url), 'utf8').replace('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";', '');
    await db.exec(sql);
  }
  await db.exec(`INSERT INTO intake_records(id,code,source,customer_name,customer_phone,service_type,event_date_start,event_date_end,setup_date_start,teardown_date_end,event_address)
    VALUES('legacy-1','TD-LEGACY-1','website','Legacy Customer','0987654321','dam_cuoi','2030-01-02T10:00:00+07','2030-01-02T14:00:00+07','2030-01-01T14:00:00+07','2030-01-03T08:00:00+07','Ninh Binh');`);
  await db.exec(readFileSync(new URL('../../../supabase/migrations/20261103000004_unified_events_and_wedding_invitations.sql', import.meta.url), 'utf8'));
  await db.exec(readFileSync(new URL('../../../supabase/migrations/20261104000005_customer_account_management.sql', import.meta.url), 'utf8'));
  await db.exec(readFileSync(new URL('../../../supabase/migrations/20261104000006_wedding_design_fields.sql', import.meta.url), 'utf8'));
  await db.exec(`INSERT INTO inventory_items(id,code,name,category,unit,total_owned_quantity,buffer_ratio,cleaning_turnaround_hours,rental_price_vnd) VALUES('stock-1','TEST-TABLE','Test table','ban','cai',5,0,2,100000);`);
});
after(async () => { await db.close(); });
test('Chỉ quản trị xem tài khoản đăng ký, kể cả tài khoản chưa có lịch; không trả dữ liệu xác thực', async () => {
  await assert.rejects(as('alice',"SELECT admin_list_customer_accounts('',50,0)"),/Chỉ quản trị/);
  await assert.rejects(as(null,"SELECT admin_list_customer_accounts('',50,0)"),/permission denied/);
  const data=(await as('admin',"SELECT admin_list_customer_accounts('',50,0) AS data")).rows[0].data;
  assert.equal(data.total,2);assert.equal(data.accounts.length,2);
  assert.equal(data.accounts.some(account=>account.id===ids.admin),false);
  assert.equal(data.accounts[0].hash,undefined);assert.equal(data.accounts[0].raw_app_meta_data,undefined);
  assert.equal((await as('admin',"SELECT admin_list_customer_accounts('bob',50,0) AS data")).rows[0].data.total,1);
});
test('Toàn bộ migration thực thi và dữ liệu cũ được giữ trong bảng thống nhất', async () => {
  const result = await as('admin', "SELECT payload FROM event_records WHERE id='legacy-1'");
  assert.equal(result.rows[0].payload.customerName, 'Legacy Customer');
  assert.equal(result.rows[0].payload.bookingStatus, 'registered');
});
test('Khách đăng ký một lịch; server gắn đúng chủ sở hữu và sinh mã duy nhất', async () => {
  first = await save('alice', { ...booking('event-1'), customerId: ids.bob });
  assert.equal(first.customerId, ids.alice); assert.match(first.code, /^TD-/); assert.equal(first.revision, 1);
  assert.equal((await as('alice','SELECT id FROM event_records')).rows.length, 1);
  assert.equal((await as('bob','SELECT id FROM event_records')).rows.length, 0);
  await assert.rejects(as(null,'SELECT * FROM event_records'), /permission denied/);
});
test('Khách khác không được sửa; khách không tự nâng lịch thành hợp đồng', async () => {
  await assert.rejects(save('bob', { ...first, customerName: 'Attack' }), /quyền/);
  await assert.rejects(save('alice', { ...first, contractStatus: 'completed' }), /hợp đồng|quyền/);
});
test('Chuyển hợp đồng trên cùng ID; phiên bản cũ không ghi đè và không tạo bản ghi lặp', async () => {
  const previous = first;
  first = await save('admin', { ...first, address: 'Ninh Binh', bookingStatus: 'contacted', contractStatus: 'preparing', lines: [{ id: 'line', itemCode: 'TEST-TABLE', name: 'Test table', unit: 'cai', category: 'ban', quantity: 1, unitPriceVND: 100000 }] });
  assert.equal(first.id, previous.id); assert.match(first.contractNumber,/^HD-/); assert.equal(first.contractStatus,'preparing');
  await assert.rejects(save('admin', { ...previous, customerName: 'Stale' }), /vừa được cập nhật/);
  assert.equal((await as('admin',"SELECT id FROM event_records WHERE id='event-1'")).rows.length,1);
  await assert.rejects(save('alice', { ...first, contractStatus: null, bookingStatus: 'cancelled' }), /quyền/);
});
test('Kiểm tra kho chặn hợp đồng trùng thời gian và hoàn tác toàn bộ thay đổi', async () => {
  second = await save('bob', booking('event-2','bob'));
  await assert.rejects(save('admin', { ...second, address: 'Ninh Binh', bookingStatus: 'contacted', contractStatus: 'preparing', lines: [{ id: 'line', itemCode: 'TEST-TABLE', name: 'Test table', unit: 'cai', category: 'ban', quantity: 5, unitPriceVND: 100000 }] }), /Kho không đủ/);
  const row = (await as('bob',"SELECT payload FROM event_records WHERE id='event-2'")).rows[0].payload;
  assert.equal(row.contractStatus,null); assert.equal(row.revision,second.revision);
});
test('Hoàn thành không tự thanh toán hoặc trả kho; chỉ trả thực tế mới giải phóng dụng cụ', async () => {
  first = await save('admin',{ ...first, contractStatus: 'completed' });
  assert.equal(first.payments.length,0); assert.equal(first.inventoryReturnedAt,null);
  first = await save('admin',{ ...first, inventoryReturnedAt: new Date().toISOString() });
  second = await save('admin',{ ...second,address:'Ninh Binh',bookingStatus:'contacted',contractStatus:'preparing',lines:[{id:'line',itemCode:'TEST-TABLE',name:'Test table',unit:'cai',category:'ban',quantity:5,unitPriceVND:100000}] });
  assert.equal(second.contractStatus,'preparing');
  await assert.rejects(save('admin',{ ...first,payments:[{id:'payment',amountVND:100001,paidAt:new Date().toISOString(),method:'cash',note:''}] }),/vượt/);
  first = await save('admin',{ ...first,payments:[{id:'payment',amountVND:100000,paidAt:new Date().toISOString(),method:'cash',note:''}] });
  assert.equal(first.payments[0].amountVND,100000);
});
test('Chủ lịch tạo và công bố thiệp; danh sách quản lý không nhận ID giả từ client', async () => {
  const person={name:'Bride',father:'Father',mother:'Mother',familyAddress:'Address',phone:'',familyRole:''}; const bank={bankName:'Bank',accountName:'Name',accountNumber:'123',qrImage:''};
  const draft={id:'invitation-1',eventId:first.id,slug:'wedding-example',ownerIds:[ids.bob],published:true,revision:0,updatedAt:new Date().toISOString(),content:{bride:person,groom:{...person,name:'Groom'},title:'Invitation',invitationText:'Welcome',coverImage:'',photos:[],ceremonies:[{title:'Wedding',at:first.eventStart,venue:'Venue',address:'Address',mapUrl:''}],brideBank:bank,groomBank:bank,story:'',dressCode:'',contactPhone:''}};
  invitation=(await as('alice','SELECT save_wedding_invitation($1::jsonb,0) AS invitation',[JSON.stringify(draft)])).rows[0].invitation;
  assert.deepEqual(invitation.ownerIds,[ids.alice]);
  assert.equal((await as('bob','SELECT id FROM wedding_invitations')).rows.length,0);
  const publicData=(await as(null,"SELECT get_public_wedding_invitation('wedding-example') AS invitation")).rows[0].invitation;
  assert.equal(publicData.invitation.content.bride.name,'Bride'); assert.deepEqual(publicData.invitation.ownerIds,[]);
});
test('Cô dâu/chú rể có tài khoản riêng được cấp quyền quản lý cùng thiệp', async () => {
  await as('alice',"SELECT add_wedding_manager('invitation-1','bob@example.test')");
  assert.equal((await as('bob','SELECT id FROM wedding_invitations')).rows.length,1);
});
test('Khách mời không cần tài khoản gửi RSVP; cùng token cập nhật một phản hồi, số điện thoại không công khai', async () => {
  const guest={guestName:'Guest',phone:'0901234567',attendance:'yes',partySize:2,message:'Congratulations!',isPublic:true};
  const token='11111111-1111-4111-8111-111111111111';
  const result=await as(null,"SELECT submit_wedding_response('wedding-example',$1,$2::jsonb) AS id",[token,JSON.stringify(guest)]);
  const id=result.rows[0].id;
  const again=await as(null,"SELECT submit_wedding_response('wedding-example',$1,$2::jsonb) AS id",[token,JSON.stringify({...guest,partySize:3})]);
  assert.equal(again.rows[0].id,id);
  await assert.rejects(as(null,'SELECT * FROM wedding_responses'),/permission denied/);
  const responses=await as('bob','SELECT payload FROM wedding_responses');
  assert.equal(responses.rows.length,1); assert.equal(responses.rows[0].payload.partySize,3);
  const before=(await as(null,"SELECT get_public_wedding_invitation('wedding-example') AS data")).rows[0].data;
  assert.equal(before.wishes.length,0);
  await as('bob','SELECT moderate_wedding_response($1,true)',[id]);
  const after=(await as(null,"SELECT get_public_wedding_invitation('wedding-example') AS data")).rows[0].data;
  assert.equal(after.wishes.length,1); assert.equal(after.wishes[0].phone,undefined); assert.equal(after.wishes[0].message,'Congratulations!');
});
test('RSVP quá số lượng, thiệp chưa công bố và tải ảnh vào thư mục người khác đều bị chặn', async () => {
  await assert.rejects(as(null,"SELECT submit_wedding_response('wedding-example',$1,$2::jsonb)",['22222222-2222-4222-8222-222222222222',JSON.stringify({guestName:'Guest',attendance:'yes',partySize:999,message:'',isPublic:true})]),/Số người/);
  await assert.rejects(as(null,"SELECT submit_wedding_response('unpublished-link',$1,$2::jsonb)",['22222222-2222-4222-8222-222222222222',JSON.stringify({guestName:'Guest',attendance:'yes',partySize:1,message:'',isPublic:true})]),/chưa được công bố/);
  await assert.rejects(as('bob',"INSERT INTO storage.objects(bucket_id,name) VALUES('wedding-photos',$1)",[`${ids.alice}/test.jpg`]),/row-level security/);
  await as('alice',"INSERT INTO storage.objects(bucket_id,name) VALUES('wedding-photos',$1)",[`${ids.alice}/test.jpg`]);
});
test('Từ chối payload thiếu loại hình, trạng thái RSVP và trả kho trước khi hoàn thành', async () => {
  const missingService = booking('invalid-missing-service'); delete missingService.serviceType;
  await assert.rejects(save('alice',missingService), /loại hình/);
  await assert.rejects(save('admin',{...second,inventoryReturnedAt:new Date().toISOString()}), /hoàn thành/);
  await assert.rejects(as(null,"SELECT submit_wedding_response('wedding-example',$1,$2::jsonb)",['33333333-3333-4333-8333-333333333333',JSON.stringify({guestName:'Guest',partySize:1,message:'',isPublic:true})]), /không hợp lệ/);
  await assert.rejects(as('alice','SELECT save_wedding_invitation($1::jsonb,NULL)',[JSON.stringify(invitation)]), /Thiếu phiên bản/);
});
test('Lưu đủ năm phong cách và trường thiệp mới; hạn RSVP và ghi chú riêng được bảo vệ', async () => {
  let draft=(await as('alice',"SELECT payload FROM wedding_invitations WHERE id='invitation-1'")).rows[0].payload;
  for (const style of ['quan_ho','cong_nghe','hoang_gia','thanh_lich','sang_trong']) {
    draft=(await as('alice','SELECT save_wedding_invitation($1::jsonb,$2) AS data',[JSON.stringify({...draft,content:{...draft.content,style,guestName:'Family',milestones:[{date:'2030-01-01',title:'First met',description:'Story'}]}}),draft.revision])).rows[0].data;
    assert.equal((await as(null,"SELECT get_public_wedding_invitation('wedding-example') AS data")).rows[0].data.invitation.content.style,style);
  }
  await assert.rejects(as('alice','SELECT save_wedding_invitation($1::jsonb,$2)',[JSON.stringify({...draft,content:{...draft.content,style:'invalid'}}),draft.revision]),/Phong cách/);
  const id=(await as(null,"SELECT submit_wedding_response('wedding-example',$1,$2::jsonb) AS id",['44444444-4444-4444-8444-444444444444',JSON.stringify({guestName:'Guest private',attendance:'yes',partySize:1,message:'Wish',isPublic:true,relationship:'nha_gai',note:'Private dietary needs'})])).rows[0].id;
  await as('bob','SELECT moderate_wedding_response($1,true)',[id]);
  const publicData=(await as(null,"SELECT get_public_wedding_invitation('wedding-example') AS data")).rows[0].data;
  assert.equal(publicData.wishes.find(wish=>wish.id===id).note,undefined);
  draft=(await as('alice','SELECT save_wedding_invitation($1::jsonb,$2) AS data',[JSON.stringify({...draft,content:{...draft.content,rsvpDeadline:'2000-01-01'}}),draft.revision])).rows[0].data;
  await assert.rejects(as(null,"SELECT submit_wedding_response('wedding-example',$1,$2::jsonb)",['55555555-5555-4555-8555-555555555555',JSON.stringify({guestName:'Late guest',attendance:'yes',partySize:1})]),/hết hạn/);
  await as('bob','SELECT moderate_wedding_response($1,false)',[id]);
  await assert.rejects(as(null,"SELECT _submit_wedding_response_v1('wedding-example',$1,'{}'::jsonb)",['55555555-5555-4555-8555-555555555555']),/permission denied/);
});
