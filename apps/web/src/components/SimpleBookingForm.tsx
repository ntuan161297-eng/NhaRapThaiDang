import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, Moon, Phone, Send, CheckCircle2 } from 'lucide-react';
import { EVENT_SERVICES, type EventService, type EventRecord } from '@thai-dang/shared';
import { BookingSuccessDialog } from './BookingSuccessDialog';
import { appStore } from '../services/store';
import { blankEvent, eventStore, useAccount } from '../services/eventStore';
import { inputDateTime, fromVietnamInput, lunarForDay, formatEventDate } from '../utils/eventDates';
import { vietnamDateAfter } from '../utils/publicSite';

const DRAFT_KEY = 'td_simple_booking_draft';
type Draft = { id: string; service: EventService; themeId: string; date: string; time: string; name: string; phone: string; email: string; note: string };
export function SimpleBookingForm({ themeId = '', preferredService = 'dam_cuoi' }: { themeId?: string; preferredService?: EventService }) {
  const { account } = useAccount();
  const [draft, setDraft] = useState<Draft>(() => {
    try { const saved = sessionStorage.getItem(DRAFT_KEY); if (saved) return { id: crypto.randomUUID(), ...JSON.parse(saved) }; } catch {}
    return { id: crypto.randomUUID(), service: preferredService, themeId, date: vietnamDateAfter(7), time: '10:30', name: '', phone: '', email: '', note: '' };
  });
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [code, setCode] = useState('');
  const [savedEvent, setSavedEvent] = useState<EventRecord | null>(null); const [showSuccess, setShowSuccess] = useState(false);
  const themes = appStore.getCmsThemes().filter(theme => theme.isActive && theme.service === draft.service);
  const change = (key: keyof Draft, value: string) => setDraft(previous => ({ ...previous, [key]: value }));
  useEffect(() => { setDraft(previous => ({ ...previous, name: account?.fullName || previous.name, phone: account?.phone || previous.phone, email: account?.email || previous.email })); }, [account?.id]);
  const selection = useRef({ themeId, preferredService });
  useEffect(() => {
    if (selection.current.themeId === themeId && selection.current.preferredService === preferredService) return;
    selection.current = { themeId, preferredService };
    setDraft(previous => ({ ...previous, themeId, service: preferredService }));
  }, [themeId, preferredService]);
  useEffect(() => { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); }, [draft]);
  const at = draft.date && draft.time ? `${draft.date}T${draft.time}:00+07:00` : '';
  const estimate = at ? blankEvent(account, at) : null;
  const lunar = draft.date ? lunarForDay(draft.date) : null;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    if (busy || code) return;
    if (!account) { sessionStorage.setItem('td_auth_return', '#dat-lich'); location.hash = '#login'; return; }
    if (!estimate) return;
    setBusy(true);
    try {
      const theme = themes.find(item => item.id === draft.themeId);
      const saved = await eventStore.save({ ...estimate, id: draft.id, customerName: draft.name.trim(), customerPhone: draft.phone.trim(), customerEmail: draft.email.trim(), serviceType: draft.service,
        themeId: theme?.id || '', themeName: theme?.name || '', note: draft.note.trim() }, 'Mới đăng ký lịch từ website');
      setCode(saved.code); setSavedEvent(saved); setShowSuccess(true); sessionStorage.removeItem(DRAFT_KEY);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Chưa thể lưu lịch. Vui lòng thử lại.'); }
    finally { setBusy(false); }
  };
  return <section id="dat-lich" className="simple-booking-section">
    <div className="simple-booking-heading"><span className="public-eyebrow">HẸN LỊCH CÙNG THÁI ĐĂNG</span><h2>Cho chúng tôi biết ngày vui của bạn</h2><p>Chọn loại hình, thời gian và thông tin liên hệ. Chi tiết dụng cụ sẽ được tư vấn khi lập hợp đồng.</p></div>
    <form className="simple-booking-form" onSubmit={submit}>
      <fieldset><legend>1. Loại hình tổ chức</legend><div className="event-service-options">{Object.entries(EVENT_SERVICES).map(([value, label]) => <button type="button" key={value} aria-pressed={draft.service === value} onClick={() => setDraft(previous => ({ ...previous, service: value as EventService, themeId: '' }))}>{label}</button>)}</div>
        {['dam_cuoi', 'dam_hoi'].includes(draft.service) && <label>Chủ đề trang trí<select value={themes.some(theme => theme.id === draft.themeId) ? draft.themeId : ''} onChange={event => change('themeId', event.target.value)}><option value="">Tôi muốn được tư vấn thêm</option>{themes.map(theme => <option key={theme.id} value={theme.id}>{theme.name}</option>)}</select></label>}
      </fieldset>
      <fieldset><legend>2. Thời gian tổ chức</legend><div className="event-form-grid"><label>Ngày đám chính (Dương lịch)<input aria-label="Ngày tổ chức Dương lịch" type="date" required value={draft.date} min={vietnamDateAfter(0)} onChange={event => change('date', event.target.value)} /></label><label>Giờ bắt đầu<input aria-label="Giờ bắt đầu sự kiện" type="time" required value={draft.time} onChange={event => change('time', event.target.value)} /></label></div>
        {lunar && <p className="event-lunar"><Moon size={16} />{lunar.lunarDateStr}</p>}
        {estimate && <div className="booking-estimates"><div><CalendarDays /><span>Lắp đặt dự kiến<strong>{formatEventDate(estimate.setupAt)}</strong></span></div><div><CalendarDays /><span>Thu hồi dự kiến<strong>{formatEventDate(estimate.recoveryAt)}</strong></span></div><small>Lắp đặt trước ngày đám chính 2–3 ngày (dự kiến trước 2 ngày). Thu hồi vào chiều ngày đám chính. Nếu tổ chức tiệc tối, thời gian thu hồi sẽ được trao đổi riêng.</small></div>}
      </fieldset>
      <fieldset><legend>3. Thông tin liên hệ</legend><div className="event-form-grid"><label>Họ và tên<input aria-label="Tên người đặt lịch" required autoComplete="name" value={draft.name} onChange={event => change('name', event.target.value)} /></label><label>Số điện thoại<input aria-label="Điện thoại người đặt lịch" required type="tel" autoComplete="tel" value={draft.phone} onChange={event => change('phone', event.target.value)} /></label></div><label>Email<input aria-label="Email người đặt lịch" type="email" autoComplete="email" value={draft.email} onChange={event => change('email', event.target.value)} /></label><label>Ghi chú (không bắt buộc)<textarea aria-label="Ghi chú đặt lịch" rows={2} placeholder="Địa điểm dự kiến hoặc yêu cầu cần tư vấn…" value={draft.note} onChange={event => change('note', event.target.value)} /></label></fieldset>
      {error && <p className="event-error" role="alert">{error}</p>}
      {code && <div className="event-success" role="status"><CheckCircle2 /><div>Đã đăng ký lịch <strong>{code}</strong><br />Trạng thái: Mới đăng ký. <a href="#tai-khoan/lich-hen">Xem trong tài khoản của tôi →</a></div></div>}
      <button className="event-primary" type="submit" disabled={busy || !!code}><Send size={17} />{code ? 'Đã gửi yêu cầu' : busy ? 'Đang lưu…' : account ? 'Gửi yêu cầu đặt lịch' : 'Đăng nhập để lưu và theo dõi lịch'}</button>
      {code && <button type="button" onClick={() => { setCode(''); setDraft(previous => ({ ...previous, id: crypto.randomUUID() })); }}>Đăng ký một lịch khác</button>}
      {code && <button type="button" onClick={() => setShowSuccess(true)}>Xem thông báo đặt lịch</button>}
      {!account && <p className="event-hint">Thông tin đang nhập được giữ lại khi bạn đăng nhập hoặc tạo tài khoản.</p>}
    </form>
    {showSuccess && savedEvent && <BookingSuccessDialog event={savedEvent} onClose={() => setShowSuccess(false)} />}
  </section>;
}
