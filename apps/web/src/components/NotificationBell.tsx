// apps/web/src/components/NotificationBell.tsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Calendar, 
  UserPlus, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  X
} from 'lucide-react';
import { IntakeRecord, JobRecord, QuoteRecord } from '@thai-dang/shared';

export interface ReminderNotificationItem {
  id: string;
  type: 'new_booking' | 'upcoming_event' | 'overdue_payment';
  title: string;
  customerName: string;
  customerPhone: string;
  dateStr: string;
  description: string;
  targetMenu: 'intake' | 'jobs' | 'finance';
  recordId?: string;
  badgeLabel: string;
  badgeColor: string;
}

interface NotificationBellProps {
  intakes: IntakeRecord[];
  jobs: JobRecord[];
  quotes?: QuoteRecord[];
  onNavigateMenu: (menu: 'intake' | 'jobs' | 'finance') => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  intakes = [],
  jobs = [],
  quotes = [],
  onNavigateMenu,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'new_booking' | 'upcoming_event' | 'overdue_payment'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // TÍNH TOÁN CÁC NHẮC VIỆC THEO 3 TIÊU CHÍ NGƯỜI DÙNG YÊU CẦU:
  const now = new Date();
  const notifications: ReminderNotificationItem[] = [];

  // 1. CÓ NGƯỜI ĐẶT LỊCH MỚI (Trạng thái 'received' hoặc chưa khảo sát)
  const newIntakes = intakes.filter((i) => i.status === 'received' || !i.survey?.surveyDate);
  newIntakes.slice(0, 10).forEach((item) => {
    notifications.push({
      id: `intake-${item.id}`,
      type: 'new_booking',
      title: 'Khách hàng đặt lịch mới',
      customerName: item.customerName || 'Khách hàng',
      customerPhone: item.customerPhone || '',
      dateStr: item.eventDateStart || item.createdAt,
      description: `Đặt lịch tiệc (${item.code}) - Cần liên hệ tư vấn và xếp lịch khảo sát`,
      targetMenu: 'intake',
      recordId: item.id,
      badgeLabel: 'Đặt lịch mới',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    });
  });

  // 2. ĐẾN LỊCH KHOẢNG 1 TUẦN KHI GẦN TỚI SỰ KIỆN (Từ hôm nay đến 7-8 ngày tới)
  jobs.forEach((job) => {
    if (job.status !== 'da_hoan_thanh' && job.status !== 'da_huy') {
      const eventTime = new Date(job.eventDateStart || job.equipmentUsageStart).getTime();
      const diffDays = Math.ceil((eventTime - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 8) {
        notifications.push({
          id: `job-upcoming-${job.id}`,
          type: 'upcoming_event',
          title: `Sự kiện sắp diễn ra (${diffDays === 0 ? 'Hôm nay' : `còn ${diffDays} ngày`})`,
          customerName: job.customerName || 'Khách hàng',
          customerPhone: job.customerPhone || '',
          dateStr: job.eventDateStart || '',
          description: `Mã ${job.code} tại ${job.eventAddress || 'Ninh Bình'} - Cần chuẩn bị xuất kho & đội thợ`,
          targetMenu: 'jobs',
          recordId: job.id,
          badgeLabel: diffDays <= 2 ? 'Gấp: 1-2 ngày' : 'Khoảng 1 tuần',
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
        });
      }
    }
  });

  // 3. SỰ KIỆN CHƯA THANH TOÁN 1 TUẦN - 2 TUẦN SAU KHI KẾT THÚC
  jobs.forEach((job) => {
    const isFinished = job.status === 'da_hoan_thanh' || new Date(job.eventDateEnd).getTime() < now.getTime();
    if (isFinished && !job.isFullyPaid) {
      const finishTime = new Date(job.eventDateEnd || job.equipmentUsageEnd).getTime();
      const daysPassed = Math.floor((now.getTime() - finishTime) / (1000 * 60 * 60 * 24));

      // Trong khoảng 7 đến 14 ngày (1 tuần - 2 tuần sau khi kết thúc) hoặc quá hạn
      if (daysPassed >= 7) {
        notifications.push({
          id: `job-debt-${job.id}`,
          type: 'overdue_payment',
          title: `Chưa thanh toán (${daysPassed} ngày sau tiệc)`,
          customerName: job.customerName || 'Khách hàng',
          customerPhone: job.customerPhone || '',
          dateStr: job.eventDateEnd || '',
          description: `Sự kiện ${job.code} đã kết thúc ${daysPassed} ngày trước nhưng chưa thanh toán đủ hợp đồng`,
          targetMenu: 'finance',
          recordId: job.id,
          badgeLabel: 'Nhắc công nợ',
          badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
        });
      }
    }
  });

  const filteredList = filterType === 'all' 
    ? notifications 
    : notifications.filter((n) => n.type === filterType);

  const totalCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* NÚT QUẢ CHUÔNG THÔNG BÁO */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
        title="Thông báo nhắc việc hệ thống"
        aria-label="Thông báo nhắc việc hệ thống"
      >
        <Bell className="w-5 h-5 text-slate-600" />
        
        {/* Huy hiệu đỏ đếm thông báo */}
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-extrabold text-white ring-2 ring-white shadow-xs animate-pulse">
            {totalCount > 99 ? '99+' : totalCount}
          </span>
        )}
      </button>

      {/* POPUP DROPDOWN DANH SÁCH NHẮC VIỆC */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-[340px] sm:w-[420px] max-w-[92vw] bg-white rounded-2xl shadow-2xl border border-stone-200 z-50 overflow-hidden flex flex-col text-slate-800 animate-fade-in">
          
          {/* Header chuông */}
          <div className="p-3.5 bg-stone-50/80 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-900 leading-none">Nhắc việc &amp; Cảnh báo</h3>
                <p className="text-[11px] text-stone-500 mt-1">
                  {totalCount} thông báo cần theo dõi
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Bộ lọc 3 tiêu chí */}
          <div className="p-2 border-b border-stone-100 flex items-center gap-1 overflow-x-auto text-xs bg-stone-50/40">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#0e4b44] text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('new_booking')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                filterType === 'new_booking'
                  ? 'bg-[#0e4b44] text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Đặt lịch mới
            </button>
            <button
              type="button"
              onClick={() => setFilterType('upcoming_event')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                filterType === 'upcoming_event'
                  ? 'bg-[#0e4b44] text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Sắp tới 1 tuần
            </button>
            <button
              type="button"
              onClick={() => setFilterType('overdue_payment')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                filterType === 'overdue_payment'
                  ? 'bg-[#0e4b44] text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              Nhắc thu tiền
            </button>
          </div>

          {/* Danh sách thông báo */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-stone-100 p-1">
            {filteredList.length === 0 ? (
              <div className="p-8 text-center text-stone-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 opacity-80" />
                <p className="text-xs font-semibold text-stone-600">Tuyệt vời! Không có việc nào tồn đọng</p>
                <p className="text-[11px] text-stone-400">Các hồ sơ, sự kiện và thanh toán đều đã được xử lý xong.</p>
              </div>
            ) : (
              filteredList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateMenu(item.targetMenu);
                  }}
                  className="p-3 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.badgeColor}`}>
                        {item.badgeLabel}
                      </span>
                      <span className="font-bold text-xs text-stone-900 group-hover:text-[#0e4b44] transition-colors">
                        {item.customerName}
                      </span>
                    </div>
                    {item.customerPhone && (
                      <span className="text-[11px] font-mono font-medium text-stone-500">
                        {item.customerPhone}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {item.dateStr ? new Date(item.dateStr).toLocaleDateString('vi-VN') : 'Gần đây'}
                    </span>
                    <span className="text-[#0e4b44] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                      <span>Mở xử lý</span>
                      <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-stone-50 border-t border-stone-200 text-center">
            <span className="text-[11px] text-stone-500">
              Nhà rạp Thái Đăng • Tự động nhắc việc thông minh
            </span>
          </div>

        </div>
      )}
    </div>
  );
};
