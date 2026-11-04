import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BOOKING_STATES, CONTRACT_STATES, type EventRecord } from '@thai-dang/shared';
import { lunarForDay, solarDay } from '../utils/eventDates';

export function EventCalendar({ events, mini = false, onSelect, month: initialMonth }: { events: EventRecord[]; mini?: boolean; onSelect?: (event: EventRecord) => void; month?: string }) {
  const today = solarDay(new Date().toISOString());
  const [month, setMonth] = useState(initialMonth || today.slice(0, 7));
  const [day, setDay] = useState(today);
  useEffect(() => { if (initialMonth) setMonth(initialMonth); }, [initialMonth]);
  useEffect(() => { setDay(previous => previous.startsWith(month) ? previous : `${month}-01`); }, [month]);
  const [year, monthNumber] = month.split('-').map(Number);
  const first = new Date(year, monthNumber - 1, 1, 12); const offset = (first.getDay() + 6) % 7;
  const days = Array.from({ length: 42 }, (_, index) => { const date = new Date(year, monthNumber - 1, index - offset + 1, 12); return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; });
  const onDay = (value: string) => events.filter(event => event.bookingStatus !== 'cancelled' && (event.contractStatus ? solarDay(event.setupAt) <= value && solarDay(event.recoveryAt) >= value : solarDay(event.eventStart) === value));
  const move = (change: number) => { const date = new Date(year, monthNumber - 1 + change, 1, 12); setMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`); };
  return <div className={`event-calendar ${mini ? 'event-calendar-mini' : ''}`}>
    <div className="calendar-toolbar"><div><h3>{mini ? 'Lịch công việc' : 'Lịch sự kiện Dương · Âm'}</h3><span>Tháng {monthNumber} / {year}</span></div><div><button type="button" onClick={() => move(-1)} aria-label="Tháng trước"><ChevronLeft size={18} /></button><button type="button" onClick={() => { setMonth(today.slice(0, 7)); setDay(today); }}>Hôm nay</button><button type="button" onClick={() => move(1)} aria-label="Tháng sau"><ChevronRight size={18} /></button></div></div>
    <div className="calendar-weekdays">{['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(label => <span key={label}>{label}</span>)}</div>
    <div className="calendar-grid">{days.map(value => { const lunar = lunarForDay(value); const work = onDay(value); return <button type="button" key={value} className={`${value.slice(0, 7) !== month ? 'outside-month' : ''} ${value === today ? 'calendar-today' : ''} ${value === day ? 'calendar-selected' : ''}`} onClick={() => setDay(value)} aria-label={`${value}, Âm lịch ${lunar.day}/${lunar.month}, ${work.length} công việc`} aria-pressed={day === value}>
      <span className="calendar-solar">{Number(value.slice(-2))}</span><small className="calendar-lunar">{lunar.day === 1 ? `${lunar.day}/${lunar.month}${lunar.isLeapMonth ? 'N' : ''}` : lunar.day}</small>
      {mini ? <span className="calendar-dots">{work.slice(0, 3).map(event => <i key={event.id} className={event.contractStatus ? 'confirmed-work' : 'booking-work'} />)}</span> : <span className="calendar-day-work">{work.slice(0, 2).map(event => <span key={event.id} className={event.contractStatus ? 'confirmed-work' : 'booking-work'}>{event.customerName}</span>)}{work.length > 2 && <small>+{work.length - 2} công việc</small>}</span>}
    </button>; })}</div>
    <div className="calendar-legend"><span><i className="booking-work" />Lịch đặt</span><span><i className="confirmed-work" />Hợp đồng / thời gian chuẩn bị</span><span>Số nhỏ: ngày Âm</span></div>
    <div className="calendar-agenda"><h4>Ngày {day.split('-').reverse().join('/')} · Âm {lunarForDay(day).day}/{lunarForDay(day).month}</h4>{onDay(day).length ? onDay(day).map(event => <button key={event.id} type="button" onClick={() => onSelect?.(event)}><strong>{event.customerName}</strong><span>{event.code} · {event.contractStatus ? CONTRACT_STATES[event.contractStatus] : BOOKING_STATES[event.bookingStatus]}</span></button>) : <p>Chưa có công việc trong ngày này.</p>}</div>
  </div>;
}
