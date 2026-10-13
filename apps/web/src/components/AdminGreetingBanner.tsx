// apps/web/src/components/AdminGreetingBanner.tsx
import React, { useState, useEffect } from 'react';
import { Sun, Moon, CloudSun, CloudRain, RefreshCw } from 'lucide-react';
import { getVietnameseLunarDate } from '../utils/lunarCalendar';

interface AdminGreetingBannerProps {
  userName?: string;
  roleLabel?: string;
}

const INSPIRATIONAL_QUOTES = [
  '“Dễ mười lần không dân cũng chịu, khó vạn lần dân liệu cũng xong.” — Hồ Chí Minh',
  '“Không có việc gì khó, chỉ sợ lòng không bền, đào núi và lấp biển, quyết chí ắt làm nên.” — Hồ Chí Minh',
  '“Uy tín tạo nên thương hiệu, sự tận tâm xây dựng niềm tin trường tồn.” — Nhà Rạp Thái Đăng',
  '“Hạnh phúc trọn vẹn của đôi lứa là sứ mệnh và niềm tự hào lớn nhất của chúng tôi.” — Thái Đăng Events',
  '“Thuận vợ thuận chồng, tát biển Đông cũng cạn.” — Tục ngữ Việt Nam',
  '“Nghề phục vụ đám cưới là nghề gieo nụ cười và lưu giữ khoảnh khắc trăm năm.” — Thái Đăng',
];

export const AdminGreetingBanner: React.FC<AdminGreetingBannerProps> = ({
  userName = 'Admin',
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [quoteIndex, setQuoteIndex] = useState<number>(0);

  // Cập nhật đồng hồ thời gian thực mỗi giây
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Lời chào buổi sáng / chiều / tối linh hoạt
  const hour = currentTime.getHours();
  let greetingPrefix = 'Chào buổi tối';
  if (hour >= 5 && hour < 11) {
    greetingPrefix = 'Chào buổi sáng';
  } else if (hour >= 11 && hour < 14) {
    greetingPrefix = 'Chào buổi trưa';
  } else if (hour >= 14 && hour < 18) {
    greetingPrefix = 'Chào buổi chiều';
  }

  // Định dạng ngày Thứ Ba, 13/10/2026
  const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayOfWeek = dayNames[currentTime.getDay()];
  const dateFormatted = `${String(currentTime.getDate()).padStart(2, '0')}/${String(currentTime.getMonth() + 1).padStart(2, '0')}/${currentTime.getFullYear()}`;
  const fullDateString = `${dayOfWeek}, ${dateFormatted}`;

  // Giờ và phút và giây
  const hoursStr = String(currentTime.getHours()).padStart(2, '0');
  const minutesStr = String(currentTime.getMinutes()).padStart(2, '0');
  const secondsStr = String(currentTime.getSeconds()).padStart(2, '0');

  // Tính ngày âm lịch chuẩn xác
  const lunar = getVietnameseLunarDate(currentTime);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % INSPIRATIONAL_QUOTES.length);
  };

  return (
    <div className="w-full bg-[#eef5fc] border border-[#d6e5f5] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 transition-all">
      {/* 1. KHỐI TRÁI: LỜI CHÀO & CÂU CHÂM NGÔN THEO NGÀY (CHUẨN XÁC ẢNH 2) */}
      <div className="flex-1 space-y-1.5 min-w-0 pr-2">
        <h2 className="text-lg sm:text-2xl font-extrabold text-[#0a3a60] tracking-tight truncate">
          {greetingPrefix}, {userName.split('(')[0].trim() || 'Admin'}!
        </h2>
        <div className="flex items-center gap-2 group">
          <p className="text-xs sm:text-sm text-[#4a6b82] italic font-medium leading-relaxed">
            {INSPIRATIONAL_QUOTES[quoteIndex]}
          </p>
          <button
            type="button"
            onClick={handleNextQuote}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-blue-100/60 text-[#4a6b82] transition-opacity cursor-pointer shrink-0"
            title="Đổi câu châm ngôn khác"
            aria-label="Đổi câu châm ngôn"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. KHỐI PHẢI: THỜI TIẾT & ĐỒNG HỒ THỜI GIAN THỰC + ÂM LỊCH (CHUẨN XÁC ẢNH 2) */}
      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-6 sm:gap-8 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#d6e5f5]">
        
        {/* Tiện ích thời tiết Ninh Bình */}
        <div className="flex items-center gap-3">
          <div className="text-[#1d5b8c]">
            {hour >= 6 && hour < 18 ? (
              <Sun className="w-8 h-8 animate-spin-slow" />
            ) : (
              <Moon className="w-8 h-8" />
            )}
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-bold text-[#0a3a60] leading-none">
              25°C
            </div>
            <div className="text-xs font-semibold text-[#2b4b66] mt-0.5">
              {hour >= 6 && hour < 18 ? 'Trời quang, nắng ấm' : 'Trời quang'}
            </div>
            <div className="text-[11px] text-[#55768e] flex items-center gap-2 mt-0.5 font-medium">
              <span>Độ ẩm 90%</span>
              <span>•</span>
              <span>Khả năng mưa 0%</span>
            </div>
          </div>
        </div>

        {/* Vạch ngăn cách dọc tinh tế */}
        <div className="hidden sm:block h-12 w-[1px] bg-[#d2e2f3]" />

        {/* Đồng hồ số lớn & Ngày dương lịch, Âm lịch */}
        <div className="text-left sm:text-right">
          <div className="flex items-baseline justify-start sm:justify-end gap-1 text-[#0a3a60] leading-none">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-mono">
              {hoursStr}:{minutesStr}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-[#4a6b82] font-mono">
              :{secondsStr}
            </span>
          </div>

          <div className="text-xs font-semibold text-[#2b4b66] mt-1">
            {fullDateString}
          </div>

          <div className="text-[11px] font-medium text-[#0a3a60] flex items-center justify-start sm:justify-end gap-1.5 mt-0.5">
            <span>🌙</span>
            <span className="font-semibold">{lunar.lunarDateStr}</span>
          </div>
        </div>

      </div>
    </div>
  );
};
