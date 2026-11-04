import React from 'react';
import { createPortal } from 'react-dom';
import { CalendarCheck2, CheckCircle2, X } from 'lucide-react';
import { EVENT_SERVICES, type EventRecord } from '@thai-dang/shared';
import { useEventModal } from '../utils/useEventModal';
import { formatEventDate, lunarForDay, solarDay } from '../utils/eventDates';

export function BookingSuccessDialog({ event, onClose }: { event: EventRecord; onClose: () => void }) {
  const modal = useEventModal(onClose, false);
  return createPortal(<div className="event-modal-overlay booking-success-overlay" onClick={click => { if (click.target === click.currentTarget) onClose(); }}><section ref={modal} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="booking-success-title" className="event-modal booking-success-dialog">
    <button type="button" className="booking-success-close" aria-label="Đóng thông báo đặt lịch" onClick={onClose}><X size={20} /></button>
    <div className="booking-success-brand"><img src="/logo_thai_dang.png" alt="Nhà rạp Thái Đăng" /><span><CheckCircle2 size={28} /></span></div>
    <p className="public-eyebrow">CẢM ƠN QUÝ KHÁCH ĐÃ TIN TƯỞNG</p><h2 id="booking-success-title">Nhà rạp Thái Đăng<br />trân trọng thông báo</h2>
    <p>Kính chào <strong>{event.customerName}</strong>, chúng tôi đã tiếp nhận yêu cầu đặt lịch tổ chức sự kiện của quý khách trên website.</p>
    <div className="booking-success-code"><small>MÃ ĐẶT LỊCH CỦA QUÝ KHÁCH</small><strong>{event.code}</strong><span className="event-badge registered">Mới đăng ký</span></div>
    <dl><div><dt>Loại hình</dt><dd>{EVENT_SERVICES[event.serviceType]}</dd></div><div><dt>Ngày tổ chức chính</dt><dd>{formatEventDate(event.eventStart)}<small>{lunarForDay(solarDay(event.eventStart)).lunarDateStr}</small></dd></div><div><dt>Lắp đặt dự kiến</dt><dd>{formatEventDate(event.setupAt)}</dd></div><div><dt>Thu hồi dự kiến</dt><dd>{formatEventDate(event.recoveryAt)}</dd></div><div><dt>Điện thoại liên hệ</dt><dd>{event.customerPhone}</dd></div></dl>
    <p className="booking-success-note">Thái Đăng sẽ liên hệ để trao đổi phương án, chi phí và xác nhận lịch phục vụ. Quý khách có thể theo dõi tiến độ trong tài khoản cá nhân.</p>
    <footer><button type="button" onClick={onClose}>Tiếp tục xem website</button><a href="#tai-khoan/lich-hen" onClick={onClose} className="event-primary"><CalendarCheck2 size={17} />Theo dõi lịch của tôi</a></footer>
  </section></div>, document.body);
}
