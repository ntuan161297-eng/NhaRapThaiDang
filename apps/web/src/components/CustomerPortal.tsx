// apps/web/src/components/CustomerPortal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Phone, 
  User, 
  Clock, 
  Layers, 
  CheckCircle, 
  Search, 
  Info, 
  ArrowRight,
  ShieldCheck,
  Send,
  Crown,
  Heart,
  Home,
  Star,
  Plus,
  Trash2,
  QrCode,
  Music,
  Settings,
  Check,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Share2,
  ExternalLink,
  MessageCircle,
  Tag,
  FileText,
  X,
  Copy,
  CheckCheck,
  Mail,
  Lock,
  HelpCircle,
  Users,
  Pause,
  Play,
  ClipboardCheck,
  Tent,
  Flower2,
} from 'lucide-react';
import { appStore, ArticleRecord, CompanyInfo, ThemeModel, CmsBannerSlide } from '../services/store';
import { CONTACT_CONFIG, getOfficialContactHotline } from '../config/contact';
import { DragonPhoenixBackground } from './DragonPhoenixBackground';
import { PublicImage } from './PublicImage';
import { PublicServiceCards } from './PublicServiceCards';
import { SimpleBookingForm } from './SimpleBookingForm';
import { WeddingServiceIntro } from './WeddingServiceIntro';
import type { EventService } from '@thai-dang/shared';
import { ARTICLE_CATEGORIES, articleCategoryLabel, navigatePublicLink, publicLink, vietnamDateAfter } from '../utils/publicSite';
import './PublicSite.css';

export interface CustomerPortalProps {
  articles: ArticleRecord[];
  companyInfo: CompanyInfo;
}

const FALLBACK_SLIDE: CmsBannerSlide = {
  id: 'public-fallback', slideNumber: 'NHÀ RẠP & TỔ CHỨC SỰ KIỆN',
  title: 'Dựng nên ngày vui trọn vẹn', subtitle: 'Rạp đẹp, thiết bị đầy đủ, đội ngũ tận tâm.',
  locationTag: 'Phục vụ tại Ninh Bình', imageUrl: '/public-wedding-hero.jpg',
  ctaText1: 'Đặt lịch tư vấn', ctaLink1: '#dat-lich',
  ctaText2: 'Khám phá mẫu rạp', ctaLink2: '#mau-rap', isActive: true,
};

// Danh mục mẫu chủ đề phông rạp đẳng cấp
export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  articles = [],
  companyInfo: propCompanyInfo,
}) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(propCompanyInfo || appStore.getCompanyInfo());

  // Slider State (Cấu hình Banner Hero từ CMS)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const [heroHovered, setHeroHovered] = useState(false);
  const [heroFocused, setHeroFocused] = useState(false);
  const [cmsBannerSlides, setCmsBannerSlides] = useState<CmsBannerSlide[]>(appStore.getCmsBannerSlides());

  // Chỉ hiển thị banner đang bật; ảnh dự phòng khi CMS chưa có banner.
  const activeBannerSlides = cmsBannerSlides.filter(s => s.isActive);
  const slidesToDisplay = activeBannerSlides.length > 0 ? activeBannerSlides : [FALLBACK_SLIDE];
  const visibleSlideIndex = currentSlideIndex % slidesToDisplay.length;
  const currentSlide = slidesToDisplay[visibleSlideIndex];
  const hotline = getOfficialContactHotline(companyInfo.hotline);
  const zaloUrl = companyInfo.zaloPhone?.startsWith('https://')
    ? companyInfo.zaloPhone : `https://zalo.me/${(companyInfo.zaloPhone || CONTACT_CONFIG.DEFAULT_ZALO).replace(/\D/g, '')}`;
  const facebookUrl = publicLink(companyInfo.facebookFanpageUrl, CONTACT_CONFIG.FACEBOOK_URL);

  // CMS & Modal States
  const [selectedArticle, setSelectedArticle] = useState<ArticleRecord | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const filteredArticles = articles.filter(article => article.isPublished && article.category !== 'uu_dai_su_kien' && (selectedCategory === 'all' || article.category === selectedCategory));
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactMsg, setContactMsg] = useState('');

  // CMS Themes & Tư Vấn Phong Thủy State
  const [cmsThemes, setCmsThemes] = useState<ThemeModel[]>(appStore.getCmsThemes());
  const [viewingThemeDetail, setViewingThemeDetail] = useState<ThemeModel | null>(null);
  const [activeThemeDetailImg, setActiveThemeDetailImg] = useState<string>('');

  // Khóa cuộn trang khi mở modal chi tiết bài viết hoặc chi tiết mẫu rạp & hỗ trợ Escape
  useEffect(() => {
    if (viewingThemeDetail || selectedArticle) {
      const previousFocus = document.activeElement as HTMLElement | null;
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const dialog = document.querySelector<HTMLElement>('.public-dialog');
      dialog?.focus();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setViewingThemeDetail(null);
          setSelectedArticle(null);
        }
        if (e.key === 'Tab' && dialog) {
          const items = dialog.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]');
          const first = items[0];
          const last = items[items.length - 1];
          if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { e.preventDefault(); last?.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = previousOverflow;
        previousFocus?.focus({ preventScroll: true });
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [viewingThemeDetail, selectedArticle]);

  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start', behavior: 'instant' }));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const unsub = appStore.subscribe(() => {
      setCmsThemes(appStore.getCmsThemes());
      setCmsBannerSlides(appStore.getCmsBannerSlides());
      setCompanyInfo(appStore.getCompanyInfo());
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (propCompanyInfo) {
      setCompanyInfo(propCompanyInfo);
    }
  }, [propCompanyInfo]);

  // Tự động chuyển slide mượt mà theo thời gian (4.5 giây)
  useEffect(() => {
    if (slidesToDisplay.length <= 1 || carouselPaused || heroHovered || heroFocused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
      setCurrentSlideIndex(prev => (prev + 1) % slidesToDisplay.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [slidesToDisplay.length, carouselPaused, heroHovered, heroFocused]);

  const handleOpenThemeDetail = (theme: ThemeModel) => {
    setViewingThemeDetail(theme);
    setActiveThemeDetailImg(theme.detailImages?.[0] || theme.imageUrl);
  };

  // Touch Gesture State cho Banner Slideshow
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const [serviceType, setServiceType] = useState<EventService>('dam_cuoi');
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Tư vấn dịch vụ — ${contactName.trim()}`);
    const body = encodeURIComponent(`Họ tên: ${contactName.trim()}\nĐiện thoại: ${contactPhone.trim()}\nEmail: ${contactEmail.trim()}\n\n${contactMsg.trim()}`);
    window.location.href = `mailto:${companyInfo.email || CONTACT_CONFIG.EMAIL}?subject=${subject}&body=${body}`;
    setContactSubmitted(true);
  };

  return (
    <main id="public-content" tabIndex={-1} className="public-site relative bg-[#f7f3ec] text-[#1a1f2c] w-full max-w-full">
      {/* Họa tiết rồng phượng ẩn chìm phía sau nền theo yêu cầu người dùng */}
      <DragonPhoenixBackground />
      
      {/* ======================================================== */}
      {/* 1. HERO BANNER SLIDESHOW (CHẠY TỰ ĐỘNG THEO CMS, CHỈ CÓ DẤU CHẤM MỜ, HỖ TRỢ VUỐT TRÊN MOBILE) */}
      {/* ======================================================== */}
      <section 
        id="top"
        className="public-hero relative overflow-hidden w-full max-w-full bg-stone-900 group touch-pan-y"
        aria-label="Không gian và dịch vụ Thái Đăng"
        aria-roledescription="Trình chiếu"
        onMouseEnter={() => setHeroHovered(true)}
        onMouseLeave={() => setHeroHovered(false)}
        onFocusCapture={() => setHeroFocused(true)}
        onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setHeroFocused(false); }}
        onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStartX === null) return;
          const diff = touchStartX - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 40) {
            if (diff > 0) {
              setCurrentSlideIndex(prev => (prev + 1) % slidesToDisplay.length);
            } else {
              setCurrentSlideIndex(prev => (prev === 0 ? slidesToDisplay.length - 1 : prev - 1));
            }
          }
          setTouchStartX(null);
        }}
      >
        {/* Danh sách ảnh slide chạy mượt mà không chồng ảnh */}
        {slidesToDisplay.map((slide, idx) => (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
              visibleSlideIndex === idx ? 'opacity-100 z-10 pointer-events-auto visible' : 'opacity-0 pointer-events-none z-0 invisible'
            }`}
          >
            <PublicImage
              src={slide.imageUrl}
              alt={slide.title || `Banner ${idx + 1}`}
              loading={idx === 0 ? 'eager' : 'lazy'}
              fetchPriority={idx === 0 ? 'high' : 'low'}
              className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-7000 ease-out"
            />
            {/* Lớp phủ chuyển sắc nhẹ ở đáy để làm nổi bật các chấm mờ */}
            <div className="public-hero-shade absolute inset-0 pointer-events-none" />
          </div>
        ))}

        <div className="public-hero-content" key={currentSlide.id}>
          <span className="public-eyebrow">NHÀ RẠP &amp; TỔ CHỨC SỰ KIỆN</span>
          <h1>{currentSlide.title || FALLBACK_SLIDE.title}</h1>
          <p>{currentSlide.subtitle || FALLBACK_SLIDE.subtitle}</p>
          <span className="public-hero-location"><MapPin size={16} aria-hidden="true" />{(currentSlide.locationTag || 'Phục vụ tại Ninh Bình').replace(/^📍\s*/, '')}</span>
          <div className="public-hero-actions">
            <a className="public-button public-button-coral" href={publicLink(currentSlide.ctaLink1)}
              onClick={event => { event.preventDefault(); navigatePublicLink(currentSlide.ctaLink1 || '#dat-lich'); }}>
              <Calendar size={17} aria-hidden="true" />{currentSlide.ctaText1 || 'Đặt lịch tư vấn'}<ArrowRight size={17} aria-hidden="true" />
            </a>
            <a className="public-button public-button-glass" href={publicLink(currentSlide.ctaLink2, '#mau-rap')}
              onClick={event => { event.preventDefault(); navigatePublicLink(currentSlide.ctaLink2 || '#mau-rap'); }}>
              {currentSlide.ctaText2 || 'Khám phá mẫu rạp'}<ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Nút lùi/tiến 2 bên tinh tế (chỉ hiện khi hover trên desktop để không che ảnh) */}
        {slidesToDisplay.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setCurrentSlideIndex(prev => (prev === 0 ? slidesToDisplay.length - 1 : prev - 1))}
              className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-xs cursor-pointer shadow-md"
              title="Ảnh trước"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentSlideIndex(prev => (prev === slidesToDisplay.length - 1 ? 0 : prev + 1))}
              className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/30 hover:bg-black/60 text-white/80 hover:text-white items-center justify-center transition-all opacity-0 group-hover:opacity-100 backdrop-blur-xs cursor-pointer shadow-md"
              title="Ảnh tiếp theo"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        <div className="public-carousel-controls">
          <span className="public-carousel-counter">{String(visibleSlideIndex + 1).padStart(2, '0')}<span>/ {String(slidesToDisplay.length).padStart(2, '0')}</span></span>
          <div className="public-carousel-dots">
          {slidesToDisplay.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer py-1.5 px-0.5 ${
                visibleSlideIndex === idx
                  ? 'w-7 h-2 bg-white/90 shadow-md ring-1 ring-white/50'
                  : 'w-2 h-2 bg-white/35 hover:bg-white/70'
              }`}
              title={`Ảnh ${idx + 1} / ${slidesToDisplay.length}`}
              aria-label={`Chuyển tới ảnh ${idx + 1}`}
              aria-current={visibleSlideIndex === idx ? 'true' : undefined}
            />
          ))}
          </div>
          {slidesToDisplay.length > 1 && <button className="public-carousel-pause" type="button"
            onClick={() => setCarouselPaused(value => !value)}
            aria-label={carouselPaused ? 'Tiếp tục trình chiếu' : 'Tạm dừng trình chiếu'} aria-pressed={carouselPaused}>
            {carouselPaused ? <Play size={15} /> : <Pause size={15} />}
          </button>}
        </div>
      </section>

      <div className="public-assurances" aria-label="Dịch vụ đồng hành">
        <div><MapPin /><span><strong>Tư vấn theo mặt bằng</strong><small>Phương án phù hợp với không gian của bạn</small></span></div>
        <div><Tent /><span><strong>Đồng bộ từng chi tiết</strong><small>Phông rạp, bàn ghế và thiết bị sự kiện</small></span></div>
        <div><ClipboardCheck /><span><strong>Chuẩn bị theo lịch tiệc</strong><small>Khảo sát, lắp dựng và thu hồi rõ ràng</small></span></div>
      </div>

      {/* ======================================================== */}
      {/* 2. DỊCH VỤ CỦA THÁI ĐĂNG (CHUẨN XÁC ẢNH 1)                 */}
      {/* ======================================================== */}
      <section id="dich-vu" className="public-services relative z-10 bg-[#faf8f5]/60 py-16 px-4 sm:px-6 lg:px-8 border-b border-[#ece7de]/70">
        <div className="max-w-7xl mx-auto space-y-9">
          
          {/* Tiêu đề mục hoa sen vàng (Chuẩn Ảnh 1) */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 text-[#b38338]">
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#b38338]/60" />
              <svg viewBox="0 0 40 24" className="w-8 h-5 fill-current">
                <path d="M20 0 C22 8 26 14 36 18 C28 17 24 13 20 22 C16 13 12 17 4 18 C14 14 18 8 20 0 Z" />
              </svg>
              <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#b38338]/60" />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-stone-900 tracking-tight">
              Dịch vụ của <span className="text-[#a87428]">Thái Đăng</span>
            </h2>

            <p className="text-sm sm:text-base text-stone-600 max-w-xl mx-auto font-normal">
              Đồng hành cùng bạn trong những cột mốc quan trọng của cuộc đời
            </p>
          </div>

          {/* 4 Cards hàng ngang bo góc mềm mại (Chuẩn Ảnh 1) */}
          <PublicServiceCards onSelect={setServiceType} />
          <p className="public-image-note">Hình ảnh gợi ý phong cách. Phương án được điều chỉnh theo mặt bằng thực tế.</p>
        </div>
      </section>

      {/* 3. SHOWCASE MẪU PHÔNG RẠP HOÀNG GIA & TƯ VẤN PHONG THỦY */}
      <section id="mau-rap" className="relative z-10 bg-[#f5f1e8]/60 py-20 px-4 sm:px-6 lg:px-8 border-y border-[#ede4d4]/70">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#b8860b]">
              BỘ SƯU TẬP KHÔNG GIAN ĐẲNG CẤP
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-stone-900 tracking-tight">
              Các Mẫu Phông Rạp Cưới &amp; Không Gian Tiệc
            </h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-2xl mx-auto font-normal">
              Được thiết kế đồng bộ với hệ khung kiên cố, vải rèm lụa nhập khẩu, tư vấn màu sắc tương sinh theo phong thủy bản mệnh cô dâu chú rể.
            </p>
          </div>

          <div className="public-theme-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {cmsThemes.filter(t => t.isActive).map((theme) => {
              const isSelected = selectedThemeId === theme.id;
              return (
                <div
                  key={theme.id}
                  className={`public-theme-card rounded-3xl bg-white border-2 transition-all p-5 flex flex-col justify-between group shadow-xs ${
                    isSelected
                      ? 'border-[#c5a059] shadow-xl ring-2 ring-amber-200 transform -translate-y-1'
                      : 'border-[#ede4d4] hover:border-[#c5a059]/70 hover:shadow-lg'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Visual Photo Banner */}
                    <div className="h-48 rounded-2xl relative overflow-hidden bg-slate-900 group">
                      <PublicImage
                        src={theme.imageUrl} 
                        alt={theme.name} 
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-between p-3.5 text-white">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md self-start border border-white/20">
                          {theme.badge}
                        </span>
                        <div>
                          <div className="text-[11px] text-amber-300 font-semibold tracking-wider uppercase">
                            {theme.titleEn}
                          </div>
                          <div className="font-bold text-lg text-white drop-shadow-sm">
                            {theme.name}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{theme.name}</h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed line-clamp-2">{theme.desc}</p>
                    </div>

                    {/* Feng Shui Advisory Tag */}
                    <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 space-y-1 text-xs">
                      <div className="font-bold text-[#946517] flex items-center gap-1.5 text-[11px]">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Phong thủy: {theme.fengShuiElement}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1">{theme.fengShuiAges}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-medium">
                      {theme.specs}
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenThemeDetail(theme)}
                      className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 text-[#b8860b]" />
                      <span>Xem Chi Tiết</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedThemeId(theme.id);
                        setServiceType(theme.service);
                        const target = document.getElementById('dat-lich');
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#e05638] text-white shadow-xs'
                          : 'bg-amber-50 hover:bg-amber-100 text-[#946517] border border-amber-200'
                      }`}
                      aria-pressed={isSelected}
                    >
                      {isSelected ? '✓ Đã Chọn Mẫu' : 'Bấm Chọn Mẫu'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      <section id="ve-chung-toi" className="public-about">
        <div className="public-about-inner">
          <figure className="public-about-photo">
            <PublicImage src="/public-wedding-hero.jpg" alt="Minh họa không gian tiệc cưới sân vườn với rạp trắng và hoa tươi" width={1536} height={1024} />
            <figcaption>Gợi ý không gian cho ngày vui của bạn · Ảnh minh họa</figcaption>
          </figure>
          <div className="public-about-copy">
            <span className="public-eyebrow">VỀ NHÀ RẠP THÁI ĐĂNG</span>
            <h2>Chỉn chu từng chi tiết.<br /><span>Ấm áp mỗi ngày vui.</span></h2>
            <p>Mỗi gia đình có một câu chuyện, mỗi ngày vui xứng đáng có một không gian riêng. Thái Đăng đồng hành từ phương án phông rạp đến bàn ghế và thiết bị, phù hợp với mặt bằng và nhu cầu tổ chức.</p>
            <ol className="public-process">
              <li><span>01</span><div><h3>Lắng nghe &amp; khảo sát</h3><p>Trao đổi mong muốn, quy mô và điều kiện mặt bằng.</p></div></li>
              <li><span>02</span><div><h3>Thống nhất phương án</h3><p>Chọn mẫu rạp, cấu hình bàn ghế và thời gian chuẩn bị.</p></div></li>
              <li><span>03</span><div><h3>Chuẩn bị cho ngày vui</h3><p>Lắp dựng, phục vụ và thu hồi theo lịch đã xác nhận.</p></div></li>
            </ol>
            <a className="public-text-link" href="#dat-lich" onClick={event => { event.preventDefault(); navigatePublicLink('#dat-lich'); }}>Cùng lên kế hoạch cho sự kiện <ArrowRight size={17} /></a>
          </div>
        </div>
      </section>

      {/* SECTION: CHƯƠNG TRÌNH KHUYẾN MẠI & ƯU ĐÃI (TONE MÀU TRẮNG SÁNG HOÀNG GIA ĐỒNG BỘ) */}
      {/* 4. ĐẶT LỊCH & DỰ TÍNH CHI PHÍ (CHUẨN ẢNH 1) */}
      <SimpleBookingForm themeId={selectedThemeId} preferredService={serviceType} />

      {/* 5. PHẦN THIỆP CƯỚI ONLINE (CHUẨN ẢNH 2: TONE TRẮNG SANG TRỌNG & HOA VĂN THỰC VẬT) */}
      <WeddingServiceIntro />

      {/* 6. TRA CỨU HỒ SƠ ĐÃ GỬI */}

      {/* 7. TIN TỨC SỰ KIỆN & CẨM NĂNG QUẢNG BÁ (CMS ARTICLES) */}
      <section id="tin-tuc" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ede8de] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-[#b8860b] text-xs font-bold tracking-wider uppercase">
              <FileText className="w-3.5 h-3.5" />
              <span>GÓC CHUẨN BỊ NGÀY VUI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-stone-900 tracking-tight">
              Xu Hướng Rạp Cưới &amp; Tin Tức Sự Kiện
            </h2>
            <p className="text-sm sm:text-base text-stone-600 max-w-2xl font-normal">
              Cập nhật các mẫu phông rạp mới nhất năm 2026, kinh nghiệm chọn ngày tổ chức tiệc và phóng sự ảnh thực tế từ các công trình chúng tôi đã thi công.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {ARTICLE_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                aria-pressed={selectedCategory === cat.id}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? 'gold-gradient text-[#121722] shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-[#c5a059]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="public-article-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.length === 0 && <div className="public-empty-state"><FileText /><h3>Bài viết đang được cập nhật</h3><p>Bạn có thể chọn chuyên mục khác hoặc liên hệ Thái Đăng để được tư vấn.</p></div>}
          {filteredArticles
            .map(art => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                role="button" tabIndex={0}
                onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setSelectedArticle(art); } }}
                aria-label={`Đọc bài viết: ${art.title}`}
                className="bg-white rounded-3xl border border-[#ede8de] overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
              >
                <div>
                  <div className="h-52 relative overflow-hidden bg-slate-100">
                    {art.imageUrl ? (
                      <PublicImage
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">Ảnh bài viết</div>
                    )}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-[#121722]/85 text-[#dfba73] backdrop-blur-md uppercase tracking-wider">
                      {articleCategoryLabel(art.category)}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md">
                      {art.views} lượt xem
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span>Biên tập: <strong className="text-stone-700 font-semibold">{art.author}</strong></span>
                      <span>•</span>
                      <span>{new Date(art.publishedAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900 group-hover:text-[#b8860b] transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h3>

                    <p className="text-sm text-stone-600 line-clamp-3 leading-relaxed font-normal">
                      {art.summary}
                    </p>
                  </div>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-bold text-[#b8860b] group-hover:text-amber-800">
                  <span>Xem Chi Tiết Bài Viết</span>
                  <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* 8. LIÊN HỆ NHÀ RẠP THÁI ĐĂNG (CHUẨN ẢNH 2) */}
      <section id="lien-he" className="bg-[#fbf9f4] py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t border-[#ece7dc]">
        <div className="max-w-6xl mx-auto space-y-12 relative z-10">
          
          {/* Header với Logo chuẩn và Tiêu đề */}
          <div className="text-center space-y-2">
            <PublicImage
              src="/logo_thai_dang.png" 
              alt="Nhà Rạp Thái Đăng" 
              className="h-16 mx-auto object-contain drop-shadow-2xs" 
            />
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#0e4b44] tracking-tight">
              Liên hệ Nhà rạp Thái Đăng
            </h2>
            <p className="text-sm sm:text-base text-stone-600 font-normal">
              Chúng tôi sẵn sàng tư vấn và khảo sát theo nhu cầu của gia đình.
            </p>
            <div className="w-16 h-0.5 bg-amber-400 mx-auto rounded-full mt-2" />
          </div>

          {/* 4 Cards hàng ngang thẳng hàng tuyệt đối, icon căn giữa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            
            {/* Card 1: Gọi điện */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full text-center">
              <div className="space-y-3 flex-1 flex flex-col items-center">
                {/* Icon căn giữa */}
                <div className="w-12 h-12 rounded-full bg-[#fdeee9] text-[#ee5a45] flex items-center justify-center shadow-2xs shrink-0 mx-auto">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#0e4b44] text-lg text-center">Gọi điện</h3>
                <p className="text-sm text-stone-600 leading-relaxed font-normal flex-1 text-center">
                  Tư vấn báo giá, giải đáp thắc mắc và hỗ trợ trực tiếp về dịch vụ nhà rạp.
                </p>
                <div className="text-2xl font-extrabold text-[#ee5a45] font-sans tracking-tight pt-1 text-center">
                  {getOfficialContactHotline(companyInfo.hotline)}
                </div>
              </div>
              <div className="mt-4 pt-2">
                <a
                  href={`tel:${getOfficialContactHotline(companyInfo.hotline).replace(/[^0-9]/g, '')}`}
                  className="w-full py-2.5 rounded-xl bg-[#ee5a45] hover:bg-[#e04530] text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>GỌI NGAY</span>
                </a>
              </div>
            </div>

            {/* Card 2: Facebook Fanpage */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full text-center">
              <div className="space-y-3 flex-1 flex flex-col items-center">
                {/* Logo Facebook SVG chuẩn sắc nét, căn giữa */}
                <div className="w-12 h-12 rounded-full bg-[#1877f2] flex items-center justify-center shadow-2xs shrink-0 mx-auto">
                  <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                    <path d="M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z"/>
                  </svg>
                </div>
                <h3 className="font-bold text-[#0e4b44] text-lg text-center">Facebook Fanpage</h3>
                <p className="text-sm text-stone-600 leading-relaxed font-normal flex-1 text-center">
                  Cập nhật video thực tế các đám cưới, livestream không gian tiệc mỗi ngày.
                </p>
              </div>
              <div className="mt-4 pt-2">
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>GHÉ FANPAGE</span>
                </a>
              </div>
            </div>

            {/* Card 3: Zalo */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full text-center">
              <div className="space-y-3 flex-1 flex flex-col items-center">
                {/* Logo Zalo SVG chuẩn sắc nét, căn giữa */}
                <div className="w-12 h-12 rounded-full bg-[#0068ff] flex items-center justify-center shadow-2xs shrink-0 mx-auto">
                  <span className="text-white font-extrabold text-sm tracking-tight leading-none text-center">Zalo</span>
                </div>
                <h3 className="font-bold text-[#0e4b44] text-lg text-center">Zalo</h3>
                <p className="text-sm text-stone-600 leading-relaxed font-normal flex-1 text-center">
                  Gửi ảnh mặt bằng sân rạp, nhận demo phối cảnh và trao đổi chi tiết qua Zalo.
                </p>
              </div>
              <div className="mt-4 pt-2">
                <a
                  href={zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>NHẮN TIN ZALO</span>
                </a>
              </div>
            </div>

            {/* Card 4: Địa chỉ (Căn giữa, link Maps động theo cấu hình CMS) */}
            <div className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full text-center">
              <div className="space-y-3 flex-1 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-[#fdeee9] text-[#c57d38] flex items-center justify-center shadow-2xs shrink-0 mx-auto">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-[#0e4b44] text-lg text-center">Địa chỉ</h3>
                <p className="text-sm text-stone-800 font-semibold leading-relaxed flex-1 text-center">
                  {companyInfo.address || 'Thôn Trực Đông, xã Cổ Lễ, tỉnh Ninh Bình'}
                </p>
              </div>
              <div className="mt-4 pt-2">
                <a
                  href={companyInfo.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(companyInfo.address || 'Thôn Trực Đông, xã Cổ Lễ, tỉnh Ninh Bình')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-xl bg-[#fffbf0] hover:bg-[#fff5d6] border border-[#fde68a] text-[#a06822] hover:text-[#7d4e12] font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#c57d38]" />
                  <span>XEM BẢN ĐỒ</span>
                </a>
              </div>
            </div>

          </div>

          {/* Form để lại thông tin tư vấn chuẩn Ảnh 2 */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-6 sm:p-10 max-w-3xl mx-auto space-y-6">
            <h3 className="font-bold text-stone-900 text-lg sm:text-xl text-center">
              Trao đổi thêm qua email
            </h3>

            {contactSubmitted ? (
              <div role="status" className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold text-center flex flex-col items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Nội dung đã được chuyển sang ứng dụng email. Vui lòng bấm gửi trong ứng dụng để hoàn tất.</span>
                <a href={`mailto:${companyInfo.email || CONTACT_CONFIG.EMAIL}`}>{companyInfo.email || CONTACT_CONFIG.EMAIL}</a>
                <button type="button" className="underline" onClick={() => setContactSubmitted(false)}>Quay lại chỉnh sửa nội dung</button>
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Họ và tên *"
                      aria-label="Họ và tên liên hệ"
                      autoComplete="name"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0e4b44] text-sm"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="Số điện thoại *"
                      aria-label="Số điện thoại liên hệ"
                      autoComplete="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0e4b44] text-sm"
                    />
                  </div>
                </div>

                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    placeholder="Email (không bắt buộc)"
                    aria-label="Email liên hệ"
                    autoComplete="email"
                    value={contactEmail || ''}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0e4b44] text-sm"
                  />
                </div>

                <div className="relative">
                  <FileText className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
                  <textarea
                    rows={3}
                    placeholder="Nội dung cần hỗ trợ (ví dụ: ngày cưới dự kiến, địa điểm sân ngõ, quy mô bàn tiệc...)"
                    value={contactMsg}
                    aria-label="Nội dung cần tư vấn"
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 placeholder-stone-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0e4b44] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#ee5a45] hover:bg-[#e04530] text-white font-bold text-sm uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>SOẠN EMAIL TƯ VẤN</span>
                </button>

                <p className="text-xs text-stone-500 text-center flex items-center justify-center gap-1.5 pt-1">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Mở ứng dụng email của bạn. Bạn sẽ xem lại nội dung trước khi gửi.</span>
                </p>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* FOOTER ĐẲNG CẤP: TONE MÀU SÁNG TRANG NHÃ, DỄ ĐỌC */}
      <footer className="public-footer bg-[#fbf9f6] text-stone-700 pt-16 pb-10 border-t border-[#ede5d8] text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#ede5d8]">
          
          {/* Cột 1: Vương miện, Slogan & Các biểu tượng mạng xã hội */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PublicImage src="/logo_thai_dang.png" fallbackSrc="/logo_thai_dang.png" alt="Nhà Rạp Thái Đăng" className="public-footer-logo" width={180} height={94} />
            </div>
            <h4 className="font-bold text-[#0e4b44] text-sm tracking-wider uppercase">
              {companyInfo.footerSloganTitle || 'SỰ KIỆN TRỌN NIỀM VUI'}
            </h4>
            <p className="public-footer-description">{companyInfo.slogan && companyInfo.slogan !== companyInfo.footerSloganTitle ? companyInfo.slogan : 'Phông rạp, bàn ghế và thiết bị sự kiện. Đồng hành cùng ngày vui của gia đình tại Ninh Bình.'}</p>
            <div className="flex items-center gap-2.5 pt-1">
              {/* Nút Chia sẻ / Fanpage */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#f4ece1] hover:bg-[#ebdcc8] text-[#8c6b3e] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Facebook Fanpage"
              >
                <Share2 className="w-4 h-4" />
              </a>
              {/* Nút Zalo */}
              <a
                href={companyInfo.zaloPhone ? (companyInfo.zaloPhone.startsWith('http') ? companyInfo.zaloPhone : `https://zalo.me/${companyInfo.zaloPhone.replace(/\D/g, '')}`) : 'https://zalo.me'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#f4ece1] hover:bg-[#ebdcc8] text-[#8c6b3e] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Zalo Chat"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              {/* Nút TikTok */}
              <a
                href={publicLink(companyInfo.tiktokUrl, CONTACT_CONFIG.TIKTOK_URL)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#f4ece1] hover:bg-[#ebdcc8] text-[#8c6b3e] font-bold text-xs flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="TikTok"
              >
                TT
              </a>
              {/* Nút YouTube */}
              <a
                href={publicLink(companyInfo.youtubeUrl, CONTACT_CONFIG.YOUTUBE_URL)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#f4ece1] hover:bg-[#ebdcc8] text-[#8c6b3e] font-bold text-xs flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="YouTube"
              >
                YT
              </a>
            </div>
          </div>

          {/* Cột 2: Dịch Vụ Tổ Chức (Quản trị được nội dung từ CMS) */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#0e4b44] uppercase tracking-wider text-sm">
              {companyInfo.footerCol2Title || 'DỊCH VỤ TỔ CHỨC'}
            </h4>
            <ul className="space-y-2.5 text-stone-600 font-medium">
              {(companyInfo.footerCol2Items && companyInfo.footerCol2Items.length > 0
                ? companyInfo.footerCol2Items
                : [
                    'Tiệc cưới hoành tráng',
                    'Lễ ăn hỏi & đính hôn',
                    'Lễ tân gia mừng nhà mới',
                    'Sự kiện khai trương & khánh thành',
                    'Cung cấp thiết bị bàn ghế & âm thanh',
                  ]
              ).map((item, idx) => (
                <li key={idx} className="hover:text-stone-900 transition-colors">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Chính Sách & Cam Kết (Quản trị được nội dung từ CMS) */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#0e4b44] uppercase tracking-wider text-sm">
              {companyInfo.footerCol3Title || 'CHÍNH SÁCH & CAM KẾT'}
            </h4>
            <ul className="space-y-2.5 text-stone-600 font-medium">
              {(companyInfo.footerCol3Items && companyInfo.footerCol3Items.length > 0
                ? companyInfo.footerCol3Items
                : [
                    'Khảo sát đo đạc mặt bằng miễn phí',
                    'Bảo đảm an toàn kết cấu rạp khẩu độ lớn',
                    'Cam kết đúng giờ hoàng đạo 100%',
                    'Dụng cụ bàn ghế sạch sẽ, khử khuẩn',
                  ]
              ).map((item, idx) => (
                <li key={idx} className="hover:text-stone-900 transition-colors">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Liên Hệ Trực Tiếp (Quản trị được nội dung từ CMS) */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#0e4b44] uppercase tracking-wider text-sm">
              {companyInfo.footerCol4Title || 'LIÊN HỆ TRỰC TIẾP'}
            </h4>
            <p className="text-stone-600 font-medium leading-relaxed">
              Trụ sở kho bãi &amp; văn phòng: {companyInfo.address || 'Thôn Trực Đông, xã Cổ Lễ, tỉnh Ninh Bình'}
            </p>
            <p className="text-stone-800 font-medium">
              Hotline: <a href={`tel:${hotline.replace(/\D/g, '')}`} className="text-[#ee5a45] font-bold text-base">{hotline}</a>
            </p>
            <p className="text-stone-600 font-medium">
              Email: <a href={`mailto:${companyInfo.email || CONTACT_CONFIG.EMAIL}`}>{companyInfo.email || CONTACT_CONFIG.EMAIL}</a>
            </p>
          </div>

        </div>

        {/* Thanh bản quyền phía chân trang (Quản trị được nội dung từ CMS) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 flex flex-wrap items-center justify-between text-stone-500 text-xs font-medium gap-2">
          <p>{companyInfo.footerCopyright || '© 2026 • Tất cả các quyền được bảo lưu. Thiết kế & phát triển cho Nhà Rạp Thái Đăng.'}</p>
          <p>Hệ Thống Sự Kiện &amp; Rạp Cưới Thái Đăng Ninh Bình.</p>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* PHẦN LIÊN HỆ CỐ ĐỊNH: TRÊN MOBILE GỌN GÀNG GÓC DƯỚI, KHÔNG CHE NỘI DUNG CHÍNH GIỮA */}
      {/* ======================================================== */}
      <div className="public-contact-rail fixed right-2.5 sm:right-5 bottom-20 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-40 flex flex-col items-center gap-2 sm:gap-3 pointer-events-auto animate-fade-in">
        
        {/* 1. NÚT GỌI HOTLINE: TRÒN MÀU VÀNG GOLD, ICON ĐIỆN THOẠI ĐEN */}
        <a
          href={`tel:${hotline.replace(/[^0-9]/g, '')}`}
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-[#e8c676] to-[#cba048] text-stone-900 shadow-lg flex items-center justify-center hover:scale-108 active:scale-95 transition-all group relative border-2 border-white/60 cursor-pointer"
          title={`Hotline: ${companyInfo.hotline}`}
        >
          <Phone className="w-4 h-4 sm:w-6 sm:h-6 text-stone-900 stroke-[2.3]" />
          <span className="hidden sm:block absolute right-16 bg-[#161c2b] text-[#dfba73] text-[11px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-2xl pointer-events-none border border-[#dfba73]/30">
            Hotline: {companyInfo.hotline}
          </span>
        </a>

        {/* 2. NÚT CHAT ZALO: TRÒN MÀU XANH NGỌC/CYAN */}
        <a
          href={zaloUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#0098b9] hover:bg-[#008ba9] text-white shadow-lg flex items-center justify-center hover:scale-108 active:scale-95 transition-all group relative border-2 border-white/60 cursor-pointer"
          title="Chat Zalo Trực Tiếp"
        >
          <MessageCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white stroke-[2.3]" />
          <span className="hidden sm:block absolute right-16 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-2xl pointer-events-none border border-white/10">
            Chat Zalo Trực Tiếp
          </span>
        </a>

        {/* 3. NÚT FACEBOOK FANPAGE: TRÒN MÀU XANH DƯƠNG */}
        <a
          href={facebookUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-lg flex items-center justify-center hover:scale-108 active:scale-95 transition-all group relative border-2 border-white/60 cursor-pointer"
          title="Kết nối Facebook Fanpage"
        >
          <Share2 className="w-4 h-4 sm:w-6 sm:h-6 text-white stroke-[2.3]" />
          <span className="hidden sm:block absolute right-16 bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-2xl pointer-events-none border border-white/10">
            Facebook Fanpage
          </span>
        </a>

      </div>

      {/* LÊN ĐẦU TRANG (SCROLL TO TOP): BỐ TRÍ DƯỚI CÙNG GÓC PHẢI KHÔNG VA CHẠM */}
      <div className="public-back-to-top fixed bottom-5 right-2.5 sm:right-5 z-40 pointer-events-auto">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#121722]/90 hover:bg-[#1a2233] text-[#dfba73] border border-[#dfba73]/40 shadow-md flex items-center justify-center hover:scale-108 transition-all group relative cursor-pointer"
          title="Lên đầu trang"
        >
          <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="hidden sm:block absolute right-14 bg-slate-900 text-white text-[11px] font-bold px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
            Lên đầu trang
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* ARTICLE READER MODAL (FULL EXPERIENCE)                   */}
      {/* ======================================================== */}
      {selectedArticle && (
        <div className="public-modal-backdrop fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto" onClick={event => { if (event.target === event.currentTarget) setSelectedArticle(null); }}>
          <div className="public-dialog bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800 animate-fade-in relative" role="dialog" aria-modal="true" aria-labelledby="public-article-title" tabIndex={-1}>
            
            <button
              onClick={() => setSelectedArticle(null)}
              aria-label="Đóng bài viết"
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {(
              <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-slate-100">
                <PublicImage
                  src={selectedArticle.imageUrl || '/public-wedding-hero.jpg'}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold gold-gradient text-[#121722] uppercase tracking-wider">
                      {articleCategoryLabel(selectedArticle.category)}
                    </span>
                    <h2 id="public-article-title" className="text-xl sm:text-2xl font-bold text-white leading-tight">
                      {selectedArticle.title}
                    </h2>
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 text-slate-400 text-xs border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span>Tác giả: <strong className="text-slate-700">{selectedArticle.author}</strong></span>
                  <span>•</span>
                  <span>{new Date(selectedArticle.publishedAt).toLocaleDateString('vi-VN')}</span>
                </div>
                <div>{selectedArticle.views} lượt xem</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-slate-700 font-medium italic leading-relaxed">
                {selectedArticle.summary}
              </div>

              <div className="text-slate-700 leading-relaxed space-y-4 font-sans whitespace-pre-line text-sm">
                {selectedArticle.content}
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-[#faf8f5] border border-stone-200/90 text-stone-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm sm:text-base">Cùng chuẩn bị cho sự kiện của bạn</h4>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">Đội ngũ kỹ thuật Thái Đăng Palace sẽ đo đạc và lên phương án tận nơi.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto shrink-0">
                  <button
                    onClick={() => {
                      setSelectedArticle(null);
                      const target = document.getElementById('dat-lich');
                      if (target) target.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#ee5a45] hover:bg-[#e04530] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer text-center"
                  >
                    Đặt Lịch Khảo Sát
                  </button>
                  <a
                    href={`tel:${companyInfo.hotline.replace(/[^0-9]/g, '')}`}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#ee5a45]" />
                    <span>Gọi Ngay</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT MẪU RẠP & TƯ VẤN PHONG THỦY TUỔI TÁC HỢP MỆNH */}
      {viewingThemeDetail && (
        <div className="public-modal-backdrop fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto" onClick={event => { if (event.target === event.currentTarget) setViewingThemeDetail(null); }}>
          <div className="public-dialog bg-white rounded-3xl max-w-3xl w-full my-8 shadow-2xl overflow-hidden border border-[#e8dfcf] animate-fade-in text-slate-800" role="dialog" aria-modal="true" aria-labelledby="public-theme-title" tabIndex={-1}>
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-[#fcfaf6]">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                  {viewingThemeDetail.badge}
                </span>
                <h3 id="public-theme-title" className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                  {viewingThemeDetail.name}
                </h3>
                <p className="text-xs text-[#b8860b] font-medium tracking-wide">
                  {viewingThemeDetail.titleEn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingThemeDetail(null)}
                aria-label="Đóng chi tiết mẫu rạp"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* Image Preview & Gallery */}
              <div className="space-y-3">
                <div className="h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner">
                  <PublicImage
                    src={activeThemeDetailImg || viewingThemeDetail.imageUrl}
                    alt={viewingThemeDetail.name}
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>

                {viewingThemeDetail.detailImages && viewingThemeDetail.detailImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {viewingThemeDetail.detailImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveThemeDetailImg(img)}
                        aria-label={`Xem ảnh mẫu rạp ${idx + 1}`}
                        className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeThemeDetailImg === img ? 'border-[#e05638] ring-2 ring-rose-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <PublicImage src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Thông số kỹ thuật & Mô tả */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thông số & Phong cách</div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {viewingThemeDetail.desc}
                </p>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-700">
                  {viewingThemeDetail.specs}
                </div>
              </div>

              {/* KHỐI TƯ VẤN PHONG THỦY TUỔI TÁC HỢP MỆNH */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 via-[#fffbf3] to-amber-100/50 border border-amber-300/80 space-y-4">
                <div className="flex items-center gap-2 border-b border-amber-200/80 pb-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    🔮
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-950 text-sm sm:text-base">
                      Tư Vấn Phong Thủy &amp; Tuổi Tác Hợp Mệnh
                    </h4>
                    <p className="text-[11px] text-amber-800">
                      Bí quyết chọn tone màu rạp cưới mang lại vượng khí, tài lộc và gia đạo hạnh phúc
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-amber-200/70 space-y-1">
                    <span className="font-bold text-[#b8860b] flex items-center gap-1.5 text-[11px]">
                      <span>⚡</span> Bản Mệnh Tương Sinh:
                    </span>
                    <p className="font-semibold text-slate-800">{viewingThemeDetail.fengShuiElement}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-amber-200/70 space-y-1">
                    <span className="font-bold text-[#b8860b] flex items-center gap-1.5 text-[11px]">
                      <span>💐</span> Hoa Tươi &amp; Phụ Kiện Phối:
                    </span>
                    <p className="font-semibold text-slate-800">{viewingThemeDetail.fengShuiFlowers}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-amber-200/70 space-y-1 text-xs">
                  <span className="font-bold text-[#b8860b] flex items-center gap-1.5 text-[11px]">
                    <span>📅</span> Năm Sinh / Tuổi Cô Dâu &amp; Chú Rể Đại Cát:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{viewingThemeDetail.fengShuiAges}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-amber-200/70 space-y-1 text-xs">
                  <span className="font-bold text-[#b8860b] flex items-center gap-1.5 text-[11px]">
                    <span>🌟</span> Ý Nghĩa Tài Lộc &amp; Gia Đạo:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{viewingThemeDetail.fengShuiMeaning}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewingThemeDetail(null)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 font-bold text-xs hover:bg-slate-50 cursor-pointer text-center text-stone-700"
                >
                  ← Đóng / Quay lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedThemeId(viewingThemeDetail.id);
                    setServiceType(viewingThemeDetail.service);
                    setViewingThemeDetail(null);
                    const target = document.getElementById('dat-lich');
                    if (target) target.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>✓ Chọn Mẫu Rạp Này &amp; Đặt Lịch</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </main>
  );
};
