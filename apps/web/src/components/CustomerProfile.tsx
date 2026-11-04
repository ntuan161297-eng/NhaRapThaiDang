import React, { useState } from 'react';
import { CheckCircle2, Mail, Save, ShieldCheck, UserRound } from 'lucide-react';
import type { EventAccount } from '@thai-dang/shared';
import { accountService } from '../services/accountService';
import { CustomerAvatar } from './CustomerAccountMenu';

export function CustomerProfile({ account }: { account: EventAccount }) {
  const [name, setName] = useState(account.fullName);
  const [phone, setPhone] = useState(account.phone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const changed = name.trim() !== account.fullName || phone.replace(/\D/g, '') !== account.phone;
  return <div className="customer-profile">
    <div className="customer-profile-heading"><div><h2>Thông tin cá nhân</h2><p>Cập nhật thông tin để Thái Đăng liên hệ và hỗ trợ bạn.</p></div><UserRound size={25} /></div>
    <div className="customer-profile-identity"><CustomerAvatar name={account.fullName} large /><div><strong>{account.fullName}</strong><span><Mail size={14} />{account.email}</span></div></div>
    <form onSubmit={async event => {
      event.preventDefault(); if (busy || !changed) return;
      setBusy(true); setError(''); setSaved(false);
      try { const updated = await accountService.updateProfile({ fullName: name, phone }); setName(updated.fullName); setPhone(updated.phone); setSaved(true); }
      catch (cause) { setError(cause instanceof Error ? cause.message : 'Chưa lưu được thông tin. Vui lòng thử lại.'); }
      finally { setBusy(false); }
    }}>
      <div className="event-form-grid"><label>Họ và tên<input aria-label="Họ và tên cá nhân" required maxLength={120} autoComplete="name" value={name} onChange={event => { setName(event.target.value); setSaved(false); }} /></label><label>Số điện thoại<input aria-label="Số điện thoại cá nhân" type="tel" required autoComplete="tel" value={phone} onChange={event => { setPhone(event.target.value); setSaved(false); }} /></label></div>
      <label>Email đăng nhập<input type="email" readOnly value={account.email} aria-label="Email đăng nhập cá nhân" /><small>Email được dùng để đăng nhập và nhận thông báo tài khoản.</small></label>
      <p className="customer-profile-privacy"><ShieldCheck size={17} />Thông tin liên hệ này chỉ dành cho tài khoản của bạn và việc hỗ trợ đặt lịch.</p>
      {error && <p className="event-error" role="alert">{error}</p>}{saved && <p className="event-success" role="status"><CheckCircle2 size={18} />Đã cập nhật thông tin cá nhân.</p>}
      <footer><button className="event-primary" disabled={busy || !changed} type="submit"><Save size={17} />{busy ? 'Đang lưu…' : 'Lưu thay đổi'}</button></footer>
    </form>
  </div>;
}
