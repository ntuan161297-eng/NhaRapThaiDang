// apps/web/src/components/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
import { UserProfile, type EventAccount } from '@thai-dang/shared';
import { CustomerAccountMenu, customerAccountLinks } from './CustomerAccountMenu';
import { toast, showConfirm } from '../services/notification';
import { CONTACT_CONFIG, getOfficialContactHotline } from '../config/contact';
import { navigatePublicLink } from '../utils/publicSite';
import './PublicSite.css';
import { accountService } from '../services/accountService';

interface HeaderProps {
  currentView: 'customer' | 'account' | 'admin' | 'login' | 'customer_auth' | 'admin_auth';
  onViewChange: (view: 'customer' | 'admin' | 'login') => void;
  currentUser: UserProfile;
  authenticatedStaff: UserProfile | null;
  authenticatedCustomer: EventAccount | null;
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
  const hotline = getOfficialContactHotline(companyInfo?.hotline);

  useEffect(() => {
    const updateActiveTab = () => {
      const hash = window.location.hash || '#top';
      const category = appStore.getCmsCategories().find(item => item.linkUrl === hash);
      if (category) setActiveTab(category.slug);
    };
    updateActiveTab();
    window.addEventListener('hashchange', updateActiveTab);
    window.addEventListener('public-navigation', updateActiveTab);
    return () => {
      window.removeEventListener('hashchange', updateActiveTab);
      window.removeEventListener('public-navigation', updateActiveTab);
    };
  }, []);

  // Danh mục chuyên mục thanh Menu Header quản trị từ CMS
  const [navCategories, setNavCategories] = useState(() => 
    appStore.getCmsCategories()
      .filter(c => c.isActive && c.isHeaderNav !== false && !/uu[-_]dai|khuyen[-_]mai/.test(`${c.slug} ${c.linkUrl}`))
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  );

  useEffect(() => {
    const unsub = appStore.subscribe(() => {
      setNavCategories(
        appStore.getCmsCategories()
          .filter(c => c.isActive && c.isHeaderNav !== false && !/uu[-_]dai|khuyen[-_]mai/.test(`${c.slug} ${c.linkUrl}`))
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      );
    });
    return unsub;
  }, []);

  useEffect(() => {
    const categories = navCategories.map(category => ({
      category,
      element: category.linkUrl?.startsWith('#') ? document.getElementById(category.linkUrl.slice(1)) : null,
    })).filter(item => item.element);
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting)
        .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top))[0];
      if (!visible) return;
      const match = categories.find(item => item.element === visible.target);
      if (match) setActiveTab(match.category.slug);
    }, { rootMargin: '-90px 0px -55% 0px', threshold: 0 });
    categories.forEach(item => observer.observe(item.element!));
    return () => observer.disconnect();
  }, [navCategories]);

  // Khóa cuộn trang trên mobile khi Menu mở & hỗ trợ phím Escape
  useEffect(() => {
    if (mobileMenuOpen) {
      const previousFocus = document.activeElement as HTMLElement | null;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const drawer = document.getElementById('public-mobile-menu');
      drawer?.querySelector<HTMLButtonElement>('button')?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
        }
        if (e.key === 'Tab' && drawer) {
          const items = drawer.querySelectorAll<HTMLElement>('button, a[href]');
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = previousOverflow;
        previousFocus?.focus();
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
    if (currentView !== 'customer' && !hash.startsWith('#tai-khoan')) {
      onViewChange('customer');
    }
    navigatePublicLink(hash);
  };

  return (
    <header className={`public-header ${fontScale > 120 ? 'public-header-zoomed' : ''} sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/70 shadow-xs transition-all`}>
      <a className="public-skip-link" href="#public-content" onClick={event => { event.preventDefault(); const content = document.getElementById('public-content'); content?.focus({ preventScroll: true }); content?.scrollIntoView({ block: 'start' }); }}>Chuyển đến nội dung</a>
      <div className="public-header-inner max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* LOGO: ĐỒNG BỘ CHUẨN XÁC VỚI LOGO NHÀ RẠP THÁI ĐĂNG (CÓ KHOẢNG CÁCH RÕ RÀNG VỚI MENU) */}
        <button type="button"
          aria-label="Nhà Rạp Thái Đăng — về đầu trang"
          onClick={() => handleNavClick('trang-chu', '#top')}
          className="public-brand flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <img 
            src="/logo_thai_dang.png" 
            alt="Nhà Rạp Thái Đăng" 
            className="h-11 sm:h-13 md:h-16 w-auto object-contain transform group-hover:scale-102 transition-transform drop-shadow-2xs" 
          />
        </button>

        {/* MENU TRUNG TÂM TRÊN 1 HÀNG DUY NHẤT (QUẢN TRỊ NỘI DUNG TỪ CMS) */}
        <nav aria-label="Điều hướng chính" className="public-desktop-nav hidden md:flex items-center gap-3 lg:gap-6 text-xs lg:text-sm font-semibold text-stone-700 whitespace-nowrap shrink-0">
          {navCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              aria-current={activeTab === cat.slug ? 'page' : undefined}
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
                aria-label="Cấu hình trợ năng"
                aria-expanded={accessibilityOpen}
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
        <div className="public-header-actions flex items-center gap-2 sm:gap-3 lg:gap-4 shrink-0">
          
          {/* Hotline (chỉ hiện trên màn hình rộng) */}
          <a
            href={`tel:${hotline.replace(/\D/g, '')}`}
            className="public-header-hotline hidden xl:flex items-center gap-2 text-stone-800 hover:text-[#ee5a45] transition-colors py-1.5 px-2 font-bold text-sm"
          >
            <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-[#ee5a45]">
              <Phone className="w-3.5 h-3.5 fill-[#ee5a45]" />
            </div>
            <span>{hotline}</span>
          </a>

          {/* Nút "ĐẶT LỊCH NGAY" màu cam đỏ bo tròn vừa vặn */}
          <button
            onClick={() => handleNavClick('dich-vu', '#dat-lich')}
            className="public-book-button px-3.5 sm:px-4 lg:px-5 py-2 sm:py-2.5 rounded-full bg-[#ee5a45] hover:bg-[#e04530] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ĐẶT LỊCH NGAY</span>
            <span className="sm:hidden">ĐẶT LỊCH</span>
          </button>

          {/* NÚT ĐĂNG NHẬP / PHIÊN USER TRÊN DESKTOP (Ẩn trên mobile để menu gọn, không bị ép xuống dòng) */}
          <div className="public-desktop-account hidden md:flex items-center">
            {authenticatedStaff || authenticatedCustomer ? null : (
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

          {(authenticatedStaff || authenticatedCustomer) && <CustomerAccountMenu account={authenticatedCustomer || { id: authenticatedStaff!.id, fullName: authenticatedStaff!.fullName, email: authenticatedStaff!.email, phone: authenticatedStaff!.phone || '', role: 'admin' }} onNavigate={href => { if (href.startsWith('#admin')) { window.location.hash = href; onViewChange('admin'); } else handleNavClick('tai-khoan', href); }} />}

          {/* Nút Menu Hamburger Mobile (Nhận diện rõ ràng, dễ chạm) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="public-menu-toggle md:hidden w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Menu điều hướng"
            aria-expanded={mobileMenuOpen}
            aria-controls="public-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 stroke-[2.5]" /> : <Menu className="w-5 h-5 stroke-[2.5]" />}
          </button>

        </div>

      </div>

      {/* MOBILE SLIDE-OVER DRAWER VỚI PORTAL ĐỘC LẬP (KHÔNG BỊ ẢNH HƯỞNG BỞI HEADER HOẶC CUỘN ĐÈ) */}
      {mobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] flex justify-end">
          {/* Lớp nền đen bán trong suốt (Backdrop) phủ kín toàn màn hình */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Panel Drawer trượt từ bên phải */}
          <div 
            id="public-mobile-menu"
            className="public-mobile-menu relative w-[320px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col justify-between text-stone-800 z-10"
            role="dialog"
            aria-modal="true"
            aria-label="Menu điều hướng di động"
          >
            {/* 1. Header cố định nền đặc (Không bị chữ trượt qua đè lên) */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
              <div className="flex items-center gap-2.5">
                <img src="/logo_thai_dang.png" alt="Nhà Rạp Thái Đăng" className="h-8 w-auto object-contain" />
                <span className="font-bold text-stone-900 text-sm">Danh Mục Menu</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer border border-stone-300"
                aria-label="Đóng menu điều hướng"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* 2. Phần thân có thể cuộn riêng biệt (flex-1 overflow-y-auto) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm font-semibold">
              {/* Danh sách các chuyên mục CMS */}
              <div className="space-y-1">
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
              </div>

              {/* NÚT ĐẶT LỊCH NỔI BẬT TRONG MENU */}
              <div className="pt-1">
                <button
                  onClick={() => handleNavClick('dich-vu', '#dat-lich')}
                  className="w-full py-3 px-4 rounded-xl bg-[#ee5a45] hover:bg-[#e04530] text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  <span>ĐẶT LỊCH KHẢO SÁT NGAY</span>
                </button>
              </div>

              {/* MỤC ĐĂNG NHẬP / PHIÊN LÀM VIỆC TRÊN MOBILE */}
              <div className="pt-1">
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
                              void accountService.signOut();
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
                  <nav className="customer-mobile-account-links" aria-label="Tài khoản khách hàng">
                    <strong>{authenticatedCustomer.fullName}</strong>
                    {customerAccountLinks.map(({ href, label, icon: Icon }) => <button type="button" key={href} onClick={() => handleNavClick('tai-khoan', href)}><Icon size={18} />{label}</button>)}
                    <button type="button" onClick={async () => { try { await accountService.signOut(); handleNavClick('trang-chu', '#top'); toast.success('Đã đăng xuất tài khoản.'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Chưa thể đăng xuất.'); } }}><LogOut size={18} />Đăng xuất</button>
                  </nav>
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
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
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

            {/* 3. Chân Drawer cố định: Hotline 24/7 */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 text-xs shrink-0">
              <a 
                href={`tel:${hotline.replace(/\D/g, '')}`} 
                className="w-full py-2.5 px-3 rounded-xl bg-white border border-rose-200 text-[#ee5a45] font-bold flex items-center justify-center gap-2 shadow-2xs hover:bg-rose-50 transition-colors"
              >
                <Phone className="w-4 h-4 fill-[#ee5a45]" />
                <span>Hotline 24/7: {hotline}</span>
              </a>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
