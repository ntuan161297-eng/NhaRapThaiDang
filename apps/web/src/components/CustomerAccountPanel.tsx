import React, { useEffect, useState } from 'react';
import { ArrowLeft, CalendarDays, ChevronRight, Heart, LogOut, Plus, RefreshCw } from 'lucide-react';
import { BOOKING_STATES, CONTRACT_STATES, EVENT_SERVICES, eventPaymentState, type EventRecord, type WeddingInvitation } from '@thai-dang/shared';
import { eventStore, useAccount, useEventData, blankInvitation } from '../services/eventStore';
import { accountService } from '../services/accountService';
import { formatEventDate } from '../utils/eventDates';
import { EventRecordDialog } from './EventRecordDialog';
import { WeddingInvitationEditor } from './WeddingInvitationEditor';
import { CustomerAvatar, customerAccountLinks } from './CustomerAccountMenu';
import { CustomerProfile } from './CustomerProfile';
import { cloudEnabled } from '../services/supabase';
import './CustomerAccount.css';

export type CustomerAccountSection = 'profile' | 'invitations' | 'bookings';
const sectionLinks = { profile: '#tai-khoan/thong-tin', invitations: '#tai-khoan/thiep-online', bookings: '#tai-khoan/lich-hen' };
export function CustomerAccountPanel({ section = 'profile' }: { section?: CustomerAccountSection }) {
  const { account, ready } = useAccount(); const data = useEventData();
  const [contractsOnly, setContractsOnly] = useState(false);
  const [selected, setSelected] = useState<EventRecord | null>(null);
  const [editing, setEditing] = useState<WeddingInvitation | null>(null);
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { document.getElementById('public-content')?.focus({ preventScroll: true }); }, [section]);
  const mine = account ? data.events.filter(event => event.customerId === account.id) : [];
  const invitations = account ? data.invitations.filter(invitation => invitation.ownerIds.includes(account.id)) : [];
  const eligible = mine.filter(event => ['dam_cuoi', 'dam_hoi'].includes(event.serviceType) && event.bookingStatus !== 'cancelled' && !invitations.some(invitation => invitation.eventId === event.id));
  const createInvitation = async (event: EventRecord) => {
    if (busy || !account) return;
    setBusy(true); setError('');
    try {
      const existing = invitations.find(invitation => invitation.eventId === event.id);
      setEditing(existing || await eventStore.saveInvitation(blankInvitation(event, account.id)));
      location.hash = sectionLinks.invitations;
    } catch (cause) { setError(cause instanceof Error ? cause.message : (cause as any).message); }
    finally { setBusy(false); }
  };
  const signOut = async () => {
    setBusy(true); setError('');
    try { await accountService.signOut(); location.hash = '#top'; }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Chưa thể đăng xuất. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };
  if (!ready || !account) return <main className="customer-account-page" id="public-content" tabIndex={-1}><div className="event-empty">{!ready ? 'Đang kiểm tra tài khoản…' : <><h1>Tài khoản của bạn</h1><p>Đăng nhập để quản lý thông tin, thiệp online và lịch hẹn.</p><a href="#login" className="event-primary">Đăng nhập / tạo tài khoản</a></>}</div></main>;
  return <main className="customer-account-page" id="public-content" tabIndex={-1}>
    <div className="customer-account-topline"><a href="#top"><ArrowLeft size={15} />Về trang chủ</a><span>KHÔNG GIAN CÁ NHÂN CỦA BẠN</span></div>
    <div className="customer-account-layout">
      <aside className="customer-account-sidebar"><div className="customer-sidebar-cover" /><div className="customer-sidebar-identity"><CustomerAvatar name={account.fullName} large /><h1>{account.fullName}</h1><p>{account.email}</p><small>Khách hàng Thái Đăng</small></div>
        <nav aria-label="Điều hướng tài khoản">{customerAccountLinks.map(({ href, label, icon: Icon }) => <a key={href} href={href} aria-current={sectionLinks[section] === href ? 'page' : undefined}><Icon size={19} /><span>{label}</span><ChevronRight size={16} /></a>)}<button type="button" disabled={busy} className="customer-sidebar-logout" onClick={() => void signOut()}><LogOut size={19} /><span>{busy ? 'Đang đăng xuất…' : 'Đăng xuất'}</span></button></nav>
      </aside>
      <section className="customer-account-content customer-account-section" aria-label={customerAccountLinks.find(link => link.href === sectionLinks[section])?.label}>
        {error && <p className="event-error" role="alert">{error}</p>}
        {section === 'profile' ? <CustomerProfile key={account.id} account={account} /> : <>
          <header className="customer-account-content-heading"><div><span className="public-eyebrow">{section === 'invitations' ? 'NGÀY VUI CỦA HAI BẠN' : 'LUÔN CẬP NHẬT CÙNG BẠN'}</span><h2>{section === 'invitations' ? 'Quản lý thiệp online' : 'Theo dõi lịch hẹn'}</h2><p>{section === 'invitations' ? 'Chỉnh sửa thiệp, xem xác nhận tham dự và lời chúc của khách mời.' : 'Xem lịch đã đặt, tiến độ chuẩn bị và tình hình thanh toán.'}</p></div><button type="button" onClick={() => void eventStore.refresh()} aria-label="Làm mới dữ liệu tài khoản"><RefreshCw size={18} /></button></header>
          {!cloudEnabled && <p className="event-hint customer-local-note">Dữ liệu đang lưu trên thiết bị này.</p>}
          {data.error && <p className="event-error" role="alert">{data.error}</p>}
          {data.loading && <p role="status" className="event-hint">Đang tải dữ liệu…</p>}
          {section === 'bookings' && <>
            <div className="customer-booking-toolbar"><nav className="event-tabs" aria-label="Lọc lịch hẹn"><button type="button" aria-pressed={!contractsOnly} onClick={() => setContractsOnly(false)}>Tất cả lịch<span>{mine.length}</span></button><button type="button" aria-pressed={contractsOnly} onClick={() => setContractsOnly(true)}>Hợp đồng<span>{mine.filter(event => event.contractStatus).length}</span></button></nav><a className="event-primary" href="#dat-lich"><Plus size={16} />Đặt lịch mới</a></div>
            <div className="my-events">{mine.filter(event => !contractsOnly || event.contractStatus).map(event => <article key={event.id}><div><CalendarDays /><span><strong>{event.code}</strong><small>{EVENT_SERVICES[event.serviceType]} · {formatEventDate(event.eventStart)}</small></span><span className={`event-badge ${event.bookingStatus}`}>{BOOKING_STATES[event.bookingStatus]}</span></div>{event.themeName && <p>Trang trí: {event.themeName}</p>}{event.contractStatus && <div className="event-status-line"><span>{event.contractNumber}</span><span className="event-badge">{CONTRACT_STATES[event.contractStatus]}</span><span className={`event-badge ${eventPaymentState(event)}`}>{eventPaymentState(event) === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></div>}<footer><button type="button" onClick={() => setSelected(event)}>Xem chi tiết / theo dõi</button>{['dam_cuoi', 'dam_hoi'].includes(event.serviceType) && event.bookingStatus !== 'cancelled' && <button type="button" disabled={busy} onClick={() => void createInvitation(event)}><Heart size={15} />Quản lý thiệp online</button>}</footer></article>)}</div>
            {!data.loading && !mine.filter(event => !contractsOnly || event.contractStatus).length && <div className="customer-account-empty"><CalendarDays size={36} /><h3>{contractsOnly ? 'Chưa có hợp đồng' : 'Bạn chưa có lịch hẹn nào'}</h3><p>{contractsOnly ? 'Hợp đồng sẽ hiển thị sau khi Thái Đăng tiếp nhận và xác nhận chi tiết.' : 'Chọn ngày tổ chức để Thái Đăng đồng hành cùng bạn.'}</p><a href="#dat-lich" className="event-primary">Đăng ký lịch tổ chức<ChevronRight size={16} /></a></div>}
          </>}
          {section === 'invitations' && <>
            <div className="my-events customer-invitation-list">{invitations.map(invitation => <article key={invitation.id}><span className="customer-invite-symbol"><Heart size={23} /></span><h3>{invitation.content.groom.name || 'Chú rể'} &amp; {invitation.content.bride.name || 'Cô dâu'}</h3><span className="event-badge">{invitation.published ? 'Đã công bố' : 'Bản nháp'}</span><p>{data.responses.filter(response => response.invitationId === invitation.id).length} phản hồi · {data.responses.filter(response => response.invitationId === invitation.id && response.message).length} lời chúc</p><footer><button type="button" className="event-primary" onClick={() => setEditing(invitation)}>Chỉnh sửa thiệp & quản lý khách mời</button>{invitation.published && <a href={`#thiep/${invitation.slug}`} target="_blank" rel="noreferrer">Xem thiệp<ChevronRight size={15} /></a>}</footer></article>)}</div>
            {!!eligible.length && <div className="customer-create-invitation"><h3>Tạo thiệp từ lịch của bạn</h3><p>Mỗi lịch cưới hoặc đám hỏi có thể tạo một thiệp online.</p>{eligible.map(event => <div key={event.id}><span><strong>{EVENT_SERVICES[event.serviceType]} · {event.code}</strong><small>{formatEventDate(event.eventStart)}</small></span><button type="button" disabled={busy} onClick={() => void createInvitation(event)}><Plus size={15} />Tạo thiệp</button></div>)}</div>}
            {!data.loading && !invitations.length && !eligible.length && <div className="customer-account-empty"><Heart size={36} /><h3>Thiệp mời cho ngày vui của bạn</h3><p>Đặt lịch cưới hoặc đám hỏi để tạo thiệp. Thiệp được cô dâu/chú rể cấp quyền quản lý cũng hiển thị tại đây.</p><a className="event-primary" href="#dat-lich">Đặt lịch cưới / đám hỏi<ChevronRight size={16} /></a></div>}
          </>}
        </>}
      </section>
    </div>
    {selected && <EventRecordDialog event={data.events.find(event => event.id === selected.id) || selected} onClose={() => setSelected(null)} />}
    {editing && <WeddingInvitationEditor invitation={editing} onClose={() => setEditing(null)} />}
  </main>;
}
