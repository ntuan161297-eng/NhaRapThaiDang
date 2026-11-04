import type { EventAccount } from '@thai-dang/shared';
import type { Session } from '@supabase/supabase-js';
import { cloudEnabled, supabase } from './supabase';
import { appStore } from './store';

type LocalAccount = EventAccount & { salt: string; hash: string; registeredAt?: string };
export type CustomerAccountSummary = EventAccount & { registeredAt?: string; emailConfirmed: boolean; lastSignInAt?: string };
const read = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; } };
let state: { account: EventAccount | null; ready: boolean; error: string } = { account: null, ready: !cloudEnabled, error: '' };
const listeners = new Set<() => void>();
function emit(patch: Partial<typeof state>) { state = { ...state, ...patch }; listeners.forEach(listener => listener()); }
const publicAccount = ({ salt, hash, ...account }: LocalAccount) => account;
async function passwordHash(password: string, salt: string) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode(salt), iterations: 210000, hash: 'SHA-256' }, material, 256);
  return Array.from(new Uint8Array(bits)).map(value => value.toString(16).padStart(2, '0')).join('');
}
let authGeneration = 0;
async function cloudAccount(session: Session | null) {
  const generation = ++authGeneration;
  if (!session) { emit({ account: null, ready: true, error: '' }); return null; }
  const { data: admin, error } = await supabase!.rpc('event_is_admin');
  if (generation !== authGeneration) return null;
  if (error) { emit({ account: null, ready: true, error: 'Chưa thể tải quyền tài khoản. Kiểm tra migration và kết nối Supabase.' }); return null; }
  const user = session.user;
  const account: EventAccount = { id: user.id, email: user.email || '', fullName: user.user_metadata.full_name || user.email || 'Khách hàng', phone: user.user_metadata.phone || '', role: admin ? 'admin' : 'customer' };
  if (admin) appStore.setCurrentUser({ id: account.id, fullName: account.fullName, email: account.email, phone: account.phone, role: 'chu_don_vi', isActive: true });
  emit({ account, ready: true, error: '' });
  return account;
}
if (supabase) {
  supabase.auth.getSession().then(({ data, error }) => { if (error) emit({ ready: true, error: error.message }); else void cloudAccount(data.session); }).catch(error => emit({ ready: true, error: error.message }));
  supabase.auth.onAuthStateChange((_event, session) => { queueMicrotask(() => void cloudAccount(session)); });
} else {
  const localId = localStorage.getItem('td_event_account_session');
  const account = read<LocalAccount[]>('td_event_accounts', []).find(item => item.id === localId);
  const staff = appStore.getAuthenticatedStaff();
  state = { account: account ? publicAccount(account) : staff ? { id: staff.id, email: staff.email, fullName: staff.fullName, phone: staff.phone || '', role: 'admin' } : null, ready: true, error: '' };
}
export const accountService = {
  getSnapshot: () => state,
  subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
  async listCustomers(search = '', page = 0): Promise<{ accounts: CustomerAccountSummary[]; total: number }> {
    if (state.account?.role !== 'admin') throw new Error('Chỉ quản trị được xem tài khoản khách hàng.');
    if (supabase) {
      const { data, error } = await supabase.rpc('admin_list_customer_accounts', { p_search: search.trim(), p_limit: 50, p_offset: Math.max(0, page) * 50 });
      if (error) throw new Error(error.message); return data;
    }
    const query = search.trim().toLocaleLowerCase('vi');
    const matches = read<LocalAccount[]>('td_event_accounts', []).filter(account => account.role === 'customer' && `${account.fullName} ${account.email} ${account.phone}`.toLocaleLowerCase('vi').includes(query));
    return { accounts: matches.slice(page * 50, (page + 1) * 50).map(account => ({ ...publicAccount(account), emailConfirmed: true })), total: matches.length };
  },
  async resetCustomerPassword(id: string, password: string) {
    const actor = state.account;
    if (actor?.role !== 'admin') throw new Error('Chỉ quản trị được cấp lại mật khẩu.');
    if (password.length < 8 || password.length > 128) throw new Error('Mật khẩu cần từ 8 đến 128 ký tự.');
    if (supabase) {
      const { data, error } = await supabase.functions.invoke('manage-customer-accounts', { body: { action: 'reset-password', userId: id, password } });
      if (error || !data?.success) throw new Error(data?.error || 'Chưa thể cấp lại mật khẩu. Kiểm tra Edge Function manage-customer-accounts.');
      return;
    }
    const accounts = read<LocalAccount[]>('td_event_accounts', []); const index = accounts.findIndex(account => account.id === id && account.role === 'customer');
    if (index < 0) throw new Error('Không tìm thấy tài khoản khách hàng.');
    const salt = crypto.randomUUID(); const hash = await passwordHash(password, salt);
    if (state.account?.id !== actor.id) throw new Error('Phiên đăng nhập đã thay đổi.');
    accounts[index] = { ...accounts[index], salt, hash };
    localStorage.setItem('td_event_accounts', JSON.stringify(accounts));
  },
  async updateProfile(input: { fullName: string; phone: string }) {
    const actor = state.account;
    if (!actor) throw new Error('Vui lòng đăng nhập để cập nhật thông tin.');
    const fullName = input.fullName.trim(); const phone = input.phone.replace(/\D/g, '');
    if (!fullName || fullName.length > 120 || !/^\d{10,11}$/.test(phone)) throw new Error('Nhập họ tên và số điện thoại hợp lệ (10–11 số).');
    if (supabase) {
      const { data, error } = await supabase.auth.updateUser({ data: { full_name: fullName, phone } });
      if (error) throw new Error(error.message);
      if (data.user.id !== actor.id || state.account?.id !== actor.id) throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng tải lại.');
    } else {
      const accounts = read<LocalAccount[]>('td_event_accounts', []);
      const index = accounts.findIndex(account => account.id === actor.id);
      if (index < 0) throw new Error('Không tìm thấy tài khoản khách hàng. Vui lòng đăng nhập lại.');
      if (accounts.some(account => account.id !== actor.id && account.phone === phone)) throw new Error('Số điện thoại đã được sử dụng bởi tài khoản khác.');
      accounts[index] = { ...accounts[index], fullName, phone };
      localStorage.setItem('td_event_accounts', JSON.stringify(accounts));
    }
    const account = { ...actor, fullName, phone };
    emit({ account, error: '' });
    return account;
  },
  async signIn(identifier: string, password: string) {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: identifier.trim(), password });
      if (error) throw new Error(error.message);
      const account = await cloudAccount(data.session);
      if (!account) throw new Error(state.error || 'Chưa thể tải tài khoản. Vui lòng thử đăng nhập lại.');
      return account;
    }
    const accounts = read<LocalAccount[]>('td_event_accounts', []);
    const account = accounts.find(item => item.email.toLowerCase() === identifier.trim().toLowerCase() || item.phone === identifier.replace(/\D/g, ''));
    if (account && await passwordHash(password, account.salt) === account.hash) {
      const result = publicAccount(account);
      localStorage.setItem('td_event_account_session', account.id);
      appStore.logoutStaff();
      emit({ account: result, error: '' });
      return result;
    }
    if (identifier.trim().toLowerCase() === 'admin') {
      const result = appStore.loginWithCredentials(identifier, password);
      if (result.success && result.user) {
        localStorage.removeItem('td_event_account_session');
        const user: EventAccount = { id: result.user.id, fullName: result.user.fullName, email: result.user.email, phone: result.user.phone || '', role: 'admin' };
        emit({ account: user, error: '' }); return user;
      }
    }
    throw new Error('Email/số điện thoại hoặc mật khẩu không đúng.');
  },
  async signUp(fullName: string, phone: string, email: string, password: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!fullName.trim() || !/^\d{10,11}$/.test(cleanPhone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) throw new Error('Nhập tên, số điện thoại, email hợp lệ và mật khẩu từ 8 ký tự.');
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: fullName.trim(), phone: cleanPhone }, emailRedirectTo: `${location.origin}/#tai-khoan` } });
      if (error) throw new Error(error.message);
      if (data.session) return await cloudAccount(data.session);
      return null;
    }
    const accounts = read<LocalAccount[]>('td_event_accounts', []);
    if (accounts.some(item => item.phone === cleanPhone || item.email.toLowerCase() === email.trim().toLowerCase())) throw new Error('Email hoặc số điện thoại đã có tài khoản. Vui lòng đăng nhập.');
    const salt = crypto.randomUUID();
    const account: LocalAccount = { id: crypto.randomUUID(), fullName: fullName.trim(), phone: cleanPhone, email: email.trim().toLowerCase(), role: 'customer', registeredAt: new Date().toISOString(), salt, hash: await passwordHash(password, salt) };
    localStorage.setItem('td_event_accounts', JSON.stringify([...accounts, account]));
    localStorage.setItem('td_event_account_session', account.id);
    appStore.logoutStaff();
    emit({ account: publicAccount(account), error: '' });
    return publicAccount(account);
  },
  async signOut() {
    if (supabase) { const { error } = await supabase.auth.signOut(); if (error) throw error; }
    localStorage.removeItem('td_event_account_session');
    appStore.logoutStaff(); appStore.logoutCustomer();
    emit({ account: null, error: '' });
  },
};
