// apps/web/src/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, 
  Calendar, 
  Menu, 
  X, 
  Lock,
  Search,
  Accessibility,
  Settings,
  Plus,
  Minus,
  Contrast,
  RotateCcw,
  User,
  LogOut,
  ChevronDown,
  CheckCircle,
  ChevronRight,
  Crown,
} from 'lucide-react';
import { CompanyInfo, appStore } from '../services/store';
import { UserProfile } from '@thai-dang/shared';
import { toast, showConfirm } from '../services/notification';
import { CONTACT_CONFIG, getOfficialContactHotline } from '../config/contact';

interface HeaderProps {
  currentView: 'customer' | 'admin' | 'login' | 'customer_auth' | 'admin_auth';
  onViewChange: (view: 'customer' | 'admin' | 'login') => void;
  currentUser: UserProfile;
  authenticatedStaff: UserProfile | null;
  authenticatedCustomer: any | null;
  companyInfo?: CompanyInfo;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  currentUser,
  authenticatedStaff,
  authenticatedCustomer,
  companyInfo,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('trang-chu');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const hotline = getOfficialContactHotline(companyInfo?.hotline);

  // Danh mục chuyên mục thanh Menu Header quản trị từ CMS
  const [navCategories, setNavCategories] = useState(() => 
    appStore.getCmsCategories()
      .filter(c => c.isActive && c.isHeaderNav !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  );

  useEffect(() => {
    const unsub = appStore.subscribe(() => {
      setNavCategories(
        appStore.getCmsCategories()
          .filter(c => c.isActive && c.isHeaderNav !== false)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      );
    });
    return unsub;
  }, []);

  // Khóa cuộn trang trên mobile khi Menu mở & hỗ trợ phím Escape
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  // --- TRỢ NĂNG (ACCESSIBILITY: CỠ CHỮ & TƯƠNG PHẢN CAO) ---
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const accessibilityRef = useRef<HTMLDivElement>(null);

  const [fontScale, setFontScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('td_font_scale');
      if (saved) return parseInt(saved, 10);
    } catch {}
    return 120;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem('td_high_contrast') === 'true';
    } catch {}
    return false;
  });

  // Áp dụng cỡ chữ và tương phản lên toàn bộ trang web
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', `${fontScale / 100}`);
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [fontScale, highContrast]);

  // Click ra ngoài để tự động đóng popup trợ năng
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accessibilityRef.current && !accessibilityRef.current.contains(event.target as Node)) {
        setAccessibilityOpen(false);
      }
    };
    if (accessibilityOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accessibilityOpen]);

  const handleIncreaseFont = () => {
    const next = Math.min(fontScale + 10, 150);
    setFontScale(next);
    try { localStorage.setItem('td_font_scale', next.toString()); } catch {}
  };

  const handleDecreaseFont = () => {
    const next = Math.max(fontScale - 10, 80);
    setFontScale(next);
    try { localStorage.setItem('td_font_scale', next.toString()); } catch {}
  };

  const handleToggleContrast = () => {
    const next = !highContrast;
    setHighContrast(next);
    try { localStorage.setItem('td_high_contrast', next.toString()); } catch {}
  };

  const handleResetDefault = () => {
    setFontScale(120);
    setHighContrast(false);
    try {
      localStorage.setItem('td_font_scale', '120');
      localStorage.setItem('td_high_contrast', 'false');
    } catch {}
  };

  const handleNavClick = (tabKey: any, hash: string) => {
    setActiveTab(tabKey);
    setMobileMenuOpen(false);
    if (currentView !== 'customer') {
      onViewChange('customer');
    }
    const elem = document.querySelector(hash);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/70 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO: ĐỒNG BỘ CHUẨN XÁC VỚI LOGO NHÀ RẠP THÁI ĐĂNG (CÓ KHOẢNG CÁCH RÕ RÀNG VỚI MENU) */}
        <div 
          onClick={() => { setActiveTab('trang-chu'); onViewChange('customer'); }}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0 mr-4 sm:mr-6 md:mr-8 lg:mr-10 xl:mr-14"
        >
          <img 
            src="/logo_thai_dang.png" 
            alt="Nhà Rạp Thái Đăng" 
            className="h-11 sm:h-13 md:h-16 w-auto object-contain transform group-hover:scale-102 transition-transform drop-shadow-2xs" 
          />
        </div>

        {/* MENU TRUNG TÂM TRÊN 1 HÀNG DUY NHẤT (QUẢN TRỊ NỘI DUNG TỪ CMS) */}
        <nav className="hidden md:flex items-center gap-3 lg:gap-6 text-xs lg:text-sm font-semibold text-stone-700 whitespace-nowrap shrink-0">
          {navCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleNavClick(cat.slug, cat.linkUrl || `#${cat.slug}`)}
              className={`py-2 relative transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === cat.slug ? 'text-stone-900 font-bold' : 'hover:text-[#ee5a45]'
              }`}
            >
              {cat.name}
              {activeTab === cat.slug && (
                <span className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#ee5a45] rounded-full" />
              )}
            </button>
          ))}

          {/* Nút Trợ năng Accessibility (Kèm Menu Popover Chuẩn Ảnh) */}
          <div className="flex items-center pl-2 border-l border-stone-200">
            <div className="relative" ref={accessibilityRef}>
              <button
                type="button"
                onClick={() => setAccessibilityOpen(!accessibilityOpen)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xs ${
                  accessibilityOpen || fontScale !== 120 || highContrast
                    ? 'bg-[#0e4b44] text-white ring-2 ring-emerald-300'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
                title="Cấu hình trợ năng (Cỡ chữ & tương phản)"
              >
                <Accessibility className="w-4 h-4" />
              </button>

              {/* MENU TRỢ NĂNG THEO ĐÚNG ẢNH MẪU */}
              {accessibilityOpen && (
                <div className="absolute right-0 top-full mt-2.5 w-56 sm:w-60 bg-white rounded-2xl border border-stone-300/90 shadow-2xl p-3 z-50 animate-fade-in text-stone-800">
                  <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider px-2 pb-2 border-b border-stone-100">
                    CỠ CHỮ: {fontScale}%
                  </div>

                  <div className="space-y-1 pt-2 text-xs">
                    {/* Tăng cỡ chữ */}
                    <button
                      type="button"
                      onClick={handleIncreaseFont}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-stone-100 font-semibold transition-colors text-left cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-stone-600 shrink-0" />
                      <span>Tăng cỡ chữ</span>
                    </button>

                    {/* Giảm cỡ chữ */}
                    <button
                      type="button"
                      onClick={handleDecreaseFont}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-stone-100 font-semibold transition-colors text-left cursor-pointer"
                    >
                      <Minus className="w-4 h-4 text-stone-600 shrink-0" />
                      <span>Giảm cỡ chữ</span>
                    </button>

                    {/* Tương phản cao */}
                    <button
                      type="button"
                      onClick={handleToggleContrast}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-semibold transition-colors text-left cursor-pointer ${
                        highContrast ? 'bg-emerald-50 text-[#0e4b44] font-bold' : 'hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Contrast className="w-4 h-4 text-stone-600 shrink-0" />
                        <span>Tương phản cao</span>
                      </div>
                      {highContrast && <span className="text-[10px] text-emerald-700 font-bold">✓ Bật</span>}
                    </button>

                    {/* Mặc định */}
                    <button
                      type="button"
                      onClick={handleResetDefault}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-stone-100 font-semibold transition-colors text-left text-stone-600 hover:text-stone-900 border-t border-stone-100 mt-1 pt-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-stone-500 shrink-0" />
                      <span>Mặc định</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* CỤM BÊN PHẢI: HOTLINE + ĐẶT LỊCH NGAY + NÚT ĐĂNG NHẬP (DESKTOP) + NÚT HAMBURGER (MOBILE) */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          
          {/* Hotline (chỉ hiện trên màn hình rộng) */}
          <a
            href={`tel:${hotline.replace(/\D/g, '')}`}
            className="hidden xl:flex items-center gap-2 text-stone-800 hover:text-[#ee5a45] transition-colors py-1.5 px-2 font-bold text-sm"
          >
            <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-[#ee5a45]">
              <Phone className="w-3.5 h-3.5 fill-[#ee5a45]" />
            </div>
            <span>{hotline}</span>
          </a>

          {/* Nút "ĐẶT LỊCH NGAY" màu cam đỏ bo tròn vừa vặn */}
          <button
            onClick={() => handleNavClick('dich-vu', '#dat-lich')}
            className="px-3.5 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-full bg-[#ee5a45] hover:bg-[#e04530] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ĐẶT LỊCH NGAY</span>
            <span className="sm:hidden">ĐẶT LỊCH</span>
          </button>

          {/* NÚT ĐĂNG NHẬP / PHIÊN USER TRÊN DESKTOP (Ẩn trên mobile để menu gọn, không bị ép xuống dòng) */}
          <div className="hidden md:flex items-center">
            {authenticatedStaff ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    window.location.hash = '#admin';
                    onViewChange('admin');
                  }}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#0e4b44] hover:bg-[#093530] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title={`Vào trang quản trị (${authenticatedStaff.fullName})`}
                >
                  <Lock className="w-3.5 h-3.5 text-amber-300" />
                  <span>Quản trị ({authenticatedStaff.fullName.split(' ').pop()})</span>
                </button>
                <button
                  onClick={() => {
                    showConfirm({
                      title: 'Xác nhận đăng xuất',
                      message: `Bạn có chắc chắn muốn đăng xuất tài khoản quản trị viên (${authenticatedStaff.fullName})?`,
                      confirmText: 'Đăng xuất',
                      cancelText: 'Hủy bỏ',
                      isDanger: true,
                      onConfirm: () => {
                        appStore.logoutStaff();
                        window.location.hash = '';
                        onViewChange('customer');
                        toast.success('Đã đăng xuất tài khoản quản trị thành công!');
                      }
                    });
                  }}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                  title="Đăng xuất quản trị"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                </button>
              </div>
            ) : authenticatedCustomer ? (
              <div className="flex items-center gap-1.5">
                <div 
                  className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  title="Khách hàng đã đăng nhập"
                >
                  <User className="w-3.5 h-3.5 text-amber-700" />
                  <span className="max-w-[100px] truncate">{authenticatedCustomer.fullName}</span>
                </div>
                <button
                  onClick={() => {
                    showConfirm({
                      title: 'Xác nhận đăng xuất',
                      message: `Quý khách có chắc chắn muốn đăng xuất tài khoản (${authenticatedCustomer.fullName})?`,
                      confirmText: 'Đăng xuất',
                      cancelText: 'Hủy bỏ',
                      isDanger: false,
                      onConfirm: () => {
                        appStore.logoutCustomer();
                        toast.success('Đã đăng xuất tài khoản khách hàng thành công!');
                      }
                    });
                  }}
                  className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors cursor-pointer"
                  title="Đăng xuất khách hàng"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  window.location.hash = '#login';
                  onViewChange('login');
                }}
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200 shadow-2xs"
                title="Đăng nhập hệ thống (Khách hàng & Quản trị)"
              >
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>Đăng nhập</span>
              </button>
            )}
          </div>

          {/* Nút Menu Hamburger Mobile (Nhận diện rõ ràng, dễ chạm) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Menu điều hướng"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>

        </div>

      </div>

      {/* MOBILE SLIDE-OVER DRAWER VỚI BACKDROP VÀ NÚT ĐÓNG RÕ RÀNG (KHÔNG TRẮNG MÀN HÌNH) */}
      {mobileMenuOpen && (
        <>
          {/* Lớp nền đen bán trong suốt (Backdrop) */}
          <div 
            className="fixed inset-0 bg-black/60 z-[9998] transition-opacity duration-300 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer trượt từ bên phải */}
          <div 
            className="fixed inset-y-0 right-0 w-[320px] max-w-[88vw] bg-white z-[9999] shadow-2xl flex flex-col justify-between overflow-y-auto text-stone-800"
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng di động"
          >
            {/* Header Drawer có logo + NÚT ĐÓNG RÕ RÀNG */}
            <div>
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/90 sticky top-0 z-10">
                <div className="flex items-center gap-2.5">
                  <img src="/logo_thai_dang.png" alt="Nhà Rạp Thái Đăng" className="h-8 w-auto object-contain" />
                  <span className="font-bold text-stone-900 text-sm">Danh Mục Menu</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer border border-stone-200"
                  aria-label="Đóng menu điều hướng"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Danh sách các liên kết menu (Quản trị trực tiếp từ CMS) */}
              <div className="p-4 space-y-1 text-sm font-semibold">
                {(navCategories || []).map((cat, idx) => (
                  <button 
                    key={cat.id || cat.slug || idx}
                    onClick={() => handleNavClick(cat.slug, cat.linkUrl || `#${cat.slug}`)} 
                    className={`w-full text-left py-3 px-3.5 rounded-xl flex items-center justify-between transition-colors ${
                      activeTab === cat.slug ? 'bg-[#0e4b44]/10 text-[#0e4b44] font-bold' : 'hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))}

                {/* NÚT ĐẶT LỊCH NỔI BẬT TRONG MENU */}
                <div className="pt-2">
                  <button
                    onClick={() => handleNavClick('dich-vu', '#dat-lich')}
                    className="w-full py-3 px-4 rounded-xl bg-[#ee5a45] hover:bg-[#e04530] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>ĐẶT LỊCH KHẢO SÁT NGAY</span>
                  </button>
                </div>

                {/* MỤC ĐĂNG NHẬP / PHIÊN LÀM VIỆC TRÊN MOBILE */}
                <div className="pt-2">
                  {authenticatedStaff ? (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#0e4b44]">
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span>Quản trị viên: {authenticatedStaff.fullName}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setMobileMenuOpen(false);
                            window.location.hash = '#admin';
                            onViewChange('admin');
                          }}
                          className="py-2.5 px-3 rounded-xl bg-[#0e4b44] text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          Vào Quản trị
                        </button>
                        <button
                          onClick={() => {
                            showConfirm({
                              title: 'Xác nhận đăng xuất',
                              message: `Bạn có chắc chắn muốn đăng xuất tài khoản quản trị viên (${authenticatedStaff.fullName})?`,
                              confirmText: 'Đăng xuất',
                              cancelText: 'Hủy bỏ',
                              isDanger: true,
                              onConfirm: () => {
                                appStore.logoutStaff();
                                setMobileMenuOpen(false);
                                window.location.hash = '';
                                onViewChange('customer');
                                toast.success('Đã đăng xuất tài khoản quản trị thành công!');
                              }
                            });
                          }}
                          className="py-2.5 px-3 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  ) : authenticatedCustomer ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                        <User className="w-4 h-4 text-amber-700" />
                        <span>Khách hàng: {authenticatedCustomer.fullName}</span>
                      </div>
                      <button
                        onClick={() => {
                          showConfirm({
                            title: 'Xác nhận đăng xuất',
                            message: `Quý khách có chắc chắn muốn đăng xuất tài khoản (${authenticatedCustomer.fullName})?`,
                            confirmText: 'Đăng xuất',
                            cancelText: 'Hủy bỏ',
                            isDanger: false,
                            onConfirm: () => {
                              appStore.logoutCustomer();
                              setMobileMenuOpen(false);
                              toast.success('Đã đăng xuất tài khoản khách hàng thành công!');
                            }
                          });
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-white border border-rose-200 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        Đăng xuất tài khoản
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        window.location.hash = '#login';
                        onViewChange('login');
                      }}
                      className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                    >
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>Đăng nhập hệ thống</span>
                    </button>
                  )}
                </div>

                {/* Cụm Trợ Năng trên Mobile */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs mt-3">
                  <div className="font-bold text-stone-700 flex items-center justify-between">
                    <span>TRỢ NĂNG (CỠ CHỮ: {fontScale}%)</span>
                    <button onClick={handleResetDefault} className="text-[#ee5a45] underline cursor-pointer">Mặc định</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={handleIncreaseFont} className="p-2 bg-white rounded-xl border border-stone-200 font-bold text-center cursor-pointer">+ Tăng</button>
                    <button onClick={handleDecreaseFont} className="p-2 bg-white rounded-xl border border-stone-200 font-bold text-center cursor-pointer">− Giảm</button>
                    <button onClick={handleToggleContrast} className={`p-2 rounded-xl border font-bold text-center cursor-pointer ${highContrast ? 'bg-emerald-600 text-white' : 'bg-white border-stone-200'}`}>Tương phản</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chân Drawer: Hotline 24/7 */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 text-xs">
              <a 
                href={`tel:${hotline.replace(/\D/g, '')}`} 
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-rose-200 text-[#ee5a45] font-bold flex items-center justify-center gap-2 shadow-2xs hover:bg-rose-50 transition-colors"
              >
                <Phone className="w-4 h-4 fill-[#ee5a45]" />
                <span>Hotline 24/7: {hotline}</span>
              </a>
            </div>
          </div>
        </>
      )}
    </header>
  );
};
