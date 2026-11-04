import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useEventData } from '../services/eventStore';
import { eventPaid, eventTotal } from '@thai-dang/shared';
export function EventAlerts({ onNavigate }: { onNavigate: (menu: 'jobs' | 'finance') => void }) {
  const { events } = useEventData(); const [open, setOpen] = useState(false);
  const fresh = events.filter(event => event.bookingStatus === 'registered' && !event.contractStatus).length;
  const debts = events.filter(event => event.contractStatus === 'completed' && eventPaid(event) < eventTotal(event)).length;
  return <div className="event-alerts"><button type="button" aria-label="Thông báo hồ sơ và công nợ" aria-expanded={open} onClick={() => setOpen(!open)}><Bell size={21} />{!!(fresh + debts) && <span>{fresh + debts}</span>}</button>{open && <div><h3>Việc cần theo dõi</h3><button type="button" onClick={() => { setOpen(false); onNavigate('jobs'); }}>{fresh} lịch mới đăng ký</button><button type="button" onClick={() => { setOpen(false); onNavigate('finance'); }}>{debts} hợp đồng hoàn thành còn công nợ</button></div>}</div>;
}
