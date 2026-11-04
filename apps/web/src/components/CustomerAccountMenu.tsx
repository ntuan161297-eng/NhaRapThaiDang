import React, { useEffect, useId, useRef, useState } from 'react';
import { CalendarDays, ChevronDown, ChevronRight, Heart, LayoutDashboard, LogOut, UserRound, UsersRound } from 'lucide-react';
import type { EventAccount } from '@thai-dang/shared';
import { accountService } from '../services/accountService';
import { toast } from '../services/notification';
import './CustomerAccount.css';

export const customerAccountLinks = [
  { href: '#tai-khoan/thong-tin', label: 'Thông tin cá nhân', description: 'Xem và cập nhật thông tin của bạn', icon: UserRound },
  { href: '#tai-khoan/thiep-online', label: 'Quản lý thiệp online', description: 'Thiệp cưới, khách mời và lời chúc', icon: Heart },
  { href: '#tai-khoan/lich-hen', label: 'Theo dõi lịch hẹn', description: 'Lịch đã đặt và tiến độ hợp đồng', icon: CalendarDays },
] as const;
const adminAccountLinks = [
  { href: '#admin', label: 'Trang quản trị', description: 'Điều hành sự kiện, hợp đồng và kho', icon: LayoutDashboard },
  { href: '#admin/tai-khoan', label: 'Quản lý tài khoản', description: 'Tài khoản khách hàng và cấp lại mật khẩu', icon: UsersRound },
] as const;

export function CustomerAvatar({ name, large = false }: { name: string; large?: boolean }) {
  const words = name.replace(/\s*\([^)]*\)\s*/g, ' ').trim().split(/\s+/).filter(Boolean);
  const initials = words.slice(-2).map(word => Array.from(word)[0]).join('').toLocaleUpperCase('vi');
  return <span aria-hidden="true" className={`customer-avatar${large ? ' customer-avatar-large' : ''}`}>{initials || <UserRound size={20} />}</span>;
}

export function CustomerAccountMenu({ account, onNavigate }: { account: EventAccount; onNavigate: (href: string) => void }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const id = useId();
  const admin = account.role === 'admin';
  const links = admin ? adminAccountLinks : customerAccountLinks;
  const close = (restoreFocus = false) => { setOpen(false); if (restoreFocus) trigger.current?.focus(); };
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const focus = (event: FocusEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    const navigation = () => setOpen(false);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('focusin', focus);
    document.addEventListener('keydown', escape);
    window.addEventListener('hashchange', navigation);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('focusin', focus);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('hashchange', navigation);
    };
  }, [open]);
  const signOut = async () => {
    setBusy(true);
    try { await accountService.signOut(); onNavigate('#top'); toast.success('Đã đăng xuất tài khoản.'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Chưa thể đăng xuất. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };
  return <div className={`customer-account-menu${admin ? ' customer-account-menu-admin' : ''}`} ref={root}>
    <button type="button" ref={trigger} className="customer-account-trigger" aria-label={`Menu tài khoản của ${account.fullName}`} aria-expanded={open} aria-controls={id}
      onClick={() => setOpen(value => !value)} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setOpen(true); requestAnimationFrame(() => panel.current?.querySelector<HTMLAnchorElement>('a')?.focus()); } }}>
      <CustomerAvatar name={account.fullName} /><span className="customer-account-trigger-name">{admin ? 'Quản trị · ' : ''}{account.fullName}</span><ChevronDown size={15} className="customer-account-chevron" />
    </button>
    {open && <div className="customer-account-popover" id={id} ref={panel} onKeyDown={event => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const items = Array.from(panel.current?.querySelectorAll<HTMLElement>('a,button:not(:disabled)') || []);
      const current = items.indexOf(document.activeElement as HTMLElement);
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      event.preventDefault(); items[next]?.focus();
    }}>
      <div className="customer-menu-identity"><CustomerAvatar name={account.fullName} large /><div><strong>{account.fullName}</strong><span>{account.email}</span><small>{admin ? 'Tài khoản quản trị' : 'Tài khoản khách hàng'}</small></div></div>
      <nav aria-label="Chức năng tài khoản cá nhân">{links.map(({ href, label, description, icon: Icon }) => <a href={href} key={href} onClick={event => { event.preventDefault(); close(); onNavigate(href); }}><span className="customer-menu-icon"><Icon size={20} /></span><span><strong>{label}</strong><small>{description}</small></span><ChevronRight size={17} /></a>)}</nav>
      <button type="button" className="customer-menu-logout" disabled={busy} onClick={() => void signOut()}><span className="customer-menu-icon"><LogOut size={20} /></span><strong>{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</strong></button>
    </div>}
  </div>;
}
