import React, { useState, useEffect } from 'react';
import { Sun, Moon, RefreshCw } from 'lucide-react';
import { getVietnameseLunarDate } from '../utils/lunarCalendar';

interface AdminGreetingBannerProps {
  userName?: string;
  roleLabel?: string;
}

const QUOTES = [
  '“Dễ mười lần không dân cũng chịu, khó vạn lần dân liệu cũng xong.” — Hồ Chí Minh',
  '“Uy tín tạo nên thương hiệu, sự tận tâm xây dựng niềm tin trường tồn.” — Nhà Rạp Thái Đăng',
  '“Thuận vợ thuận chồng, tát biển Đông cũng cạn.” — Tục ngữ Việt Nam',
];

const vietnamClock = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

export const AdminGreetingBanner: React.FC<AdminGreetingBannerProps> = ({ userName = 'Admin' }) => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = Object.fromEntries(vietnamClock.formatToParts(currentTime).map(part => [part.type, part.value]));
  const hour = Number(parts.hour);
  const localDate = new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
  const greeting = hour >= 5 && hour < 11 ? 'Chào buổi sáng'
    : hour >= 11 && hour < 14 ? 'Chào buổi trưa'
    : hour >= 14 && hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const dayOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][localDate.getDay()];
  const lunar = getVietnameseLunarDate(localDate);
  const isDay = hour >= 6 && hour < 18;

  return (
    <section className="admin-greeting" aria-label="Lời chào và thời gian tại Việt Nam">
      <div className="admin-greeting-copy">
        <h2>{greeting}, {userName.split('(')[0].trim() || 'Admin'}!</h2>
        <div className="admin-greeting-quote">
          <p>{QUOTES[quoteIndex]}</p>
          <button type="button" onClick={() => setQuoteIndex(index => (index + 1) % QUOTES.length)}
            title="Đổi câu châm ngôn" aria-label="Đổi câu châm ngôn">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="admin-greeting-widget">
        <div className="admin-weather" title="Ngày hiện tại theo múi giờ Việt Nam">
          {isDay ? <Sun className="admin-weather-icon" /> : <Moon className="admin-weather-icon" />}
          <div>
            <div className="admin-weather-temperature">{parts.day}/{parts.month}</div>
            <p>Lịch hôm nay · {parts.year}</p>
            <small>Giờ Việt Nam <span>•</span> UTC+7</small>
          </div>
        </div>
        <div className="admin-clock">
          <time dateTime={currentTime.toISOString()} aria-label={`${parts.hour} giờ ${parts.minute} phút`}>
            {parts.hour}:{parts.minute}<span>:{parts.second}</span>
          </time>
          <p>{dayOfWeek}, {parts.day}/{parts.month}/{parts.year}</p>
          <small><Moon size={13} aria-hidden="true" /> {lunar.lunarDateStr}</small>
        </div>
      </div>
    </section>
  );
};
