import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Lock } from 'lucide-react';
import { accountService } from '../services/accountService';
import { cloudEnabled } from '../services/supabase';

interface UnifiedAuthProps { onBack: () => void; onSuccess: (role: 'admin' | 'customer') => void }
export function UnifiedAuth({ onBack, onSuccess }: UnifiedAuthProps) {
  const [register, setRegister] = useState(false); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [repeat, setRepeat] = useState(''); const [name, setName] = useState(''); const [phone, setPhone] = useState('');
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (register && password !== repeat) throw new Error('Mật khẩu nhập lại chưa khớp.');
      const account = register ? await accountService.signUp(name, phone, email, password) : await accountService.signIn(email, password);
      if (account) onSuccess(account.role); else setNotice('Vui lòng kiểm tra email để xác nhận tài khoản, sau đó đăng nhập.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể đăng nhập. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };
  return <main className="event-auth-page"><div className="event-auth-card"><button type="button" onClick={onBack}><ArrowLeft size={16} />Về website</button><img src="/logo_thai_dang.png" alt="Nhà Rạp Thái Đăng" /><h1>{register ? 'Tạo tài khoản của bạn' : 'Chào mừng bạn trở lại'}</h1><p>Theo dõi lịch đã đặt, hợp đồng và thiệp cưới trong cùng một tài khoản.</p>{!cloudEnabled && <p className="event-hint connection-note">Chế độ cục bộ · Tài khoản và dữ liệu chỉ có trên thiết bị này.</p>}<form onSubmit={submit}>{register && <><label>Họ và tên<input required autoComplete="name" value={name} onChange={event => setName(event.target.value)} /></label><label>Số điện thoại<input required type="tel" autoComplete="tel" value={phone} onChange={event => setPhone(event.target.value)} /></label></>}<label>{cloudEnabled || register ? 'Email' : 'Email / số điện thoại / admin'}<input aria-label="Tài khoản đăng nhập" type={register || cloudEnabled ? 'email' : 'text'} required autoComplete="username" value={email} onChange={event => setEmail(event.target.value)} /></label><label>Mật khẩu<div className="event-password"><input aria-label="Mật khẩu" type={show ? 'text' : 'password'} required minLength={register ? 8 : undefined} autoComplete={register ? 'new-password' : 'current-password'} value={password} onChange={event => setPassword(event.target.value)} /><button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>{register && <label>Nhập lại mật khẩu<input type="password" required minLength={8} autoComplete="new-password" value={repeat} onChange={event => setRepeat(event.target.value)} /></label>}{error && <p className="event-error" role="alert">{error}</p>}{notice && <p className="event-success" role="status">{notice}</p>}<button className="event-primary" type="submit" disabled={busy}><Lock size={16} />{busy ? 'Đang xử lý…' : register ? 'Tạo tài khoản' : 'Đăng nhập'}</button></form><button type="button" className="event-auth-switch" onClick={() => { setRegister(!register); setError(''); setNotice(''); }}>{register ? 'Đã có tài khoản? Đăng nhập' : 'Chưa có tài khoản? Đăng ký'}</button></div></main>;
}
