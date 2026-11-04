import { getVietnameseLunarDate } from './lunarCalendar';
export const solarDay = (iso: string) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso));
export const inputDateTime = (iso: string) => `${solarDay(iso)}T${new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(iso))}`;
export const fromVietnamInput = (value: string) => value ? new Date(`${value}:00+07:00`).toISOString() : '';
export const formatEventDate = (iso: string) => new Date(iso).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
export function lunarForDay(day: string) { const [year, month, date] = day.split('-').map(Number); return getVietnameseLunarDate(new Date(year, month - 1, date, 12)); }
export const money = (amount: number) => `${amount.toLocaleString('vi-VN')} đ`;
