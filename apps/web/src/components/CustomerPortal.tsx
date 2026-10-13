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
  Users
} from 'lucide-react';
import { 
  ServiceType, 
  TableChairConfigItem, 
  TentConfigItem, 
  IntakeRecord 
} from '@thai-dang/shared';
import { convertTableChairConfigs } from '@thai-dang/shared';
import { appStore, ArticleRecord, PromotionBanner, CompanyInfo, ThemeModel, CmsBannerSlide } from '../services/store';
import { CONTACT_CONFIG, getOfficialContactHotline } from '../config/contact';

export interface CustomerPortalProps {
  articles: ArticleRecord[];
  promotions: PromotionBanner[];
  companyInfo: CompanyInfo;
}

// Danh mục mẫu chủ đề phông rạp đẳng cấp
const LUXURY_THEMES = [
  {
    id: 'hoang_gia',
    name: 'Tone Trắng Vàng Hoàng Gia',
    titleEn: 'Royal Ivory & Champagne Gold',
    service: 'dam_cuoi',
    desc: 'Không gian quý phái với trần rèm lụa trắng sữa xếp ly, hoa tú cầu vàng champagne, điểm xuyết đèn chùm pha lê thả rạp lộng lẫy và thảm đỏ tiếp đón.',
    badge: 'Bộ Sưu Tập Nổi Bật Nhất',
    specs: 'Khẩu độ rạp 6m - 18m • Đèn chùm pha lê • Thảm trải sàn cao cấp',
    imageBg: 'from-amber-900/60 via-amber-800/40 to-[#161c2b]',
    accentColor: '#c5a059',
  },
  {
    id: 'rustic_green',
    name: 'Tone Xanh Lá Rustic Cổ Điển',
    titleEn: 'Romantic Forest & Rustic Garden',
    service: 'dam_cuoi',
    desc: 'Lấy cảm hứng từ những khu vườn cổ tích châu Âu, kết hợp dải dây leo xanh biếc, hoa hồng kem pastel, trụ gỗ mộc và hệ thống đèn búp mờ ảo.',
    badge: 'Xu Hướng Cưới 2026',
    specs: 'Phù hợp sân vườn rộng • Hoa tươi phối cành khô • Ánh sáng ấm 3000K',
    imageBg: 'from-emerald-950/70 via-teal-900/40 to-[#161c2b]',
    accentColor: '#059669',
  },
  {
    id: 'truyen_thong_do',
    name: 'Tone Đỏ Hỷ Sự Truyền Thống',
    titleEn: 'Traditional Red & Gold Heritage',
    service: 'dam_cuoi',
    desc: 'Sắc đỏ tượng trưng cho hạnh phúc viên mãn và may mắn trường cửu. Chữ Song Hỷ dát kim tuyến, đèn lồng cung đình kết hợp voan rèm thanh lịch.',
    badge: 'Đậm Nét Văn Hóa Việt',
    specs: 'Rạp khẩu độ lớn • Chữ Song Hỷ dát vàng • Bàn đón khách sơn mài',
    imageBg: 'from-rose-950/80 via-red-900/40 to-[#161c2b]',
    accentColor: '#dc2626',
  },
  {
    id: 'hien_dai_tangiay',
    name: 'Rạp Che Nắng Hiện Đại (Tân Gia)',
    titleEn: 'Modern Pavilion & Housewarming',
    service: 'nha_moi',
    desc: 'Hệ khung sắt mạ kẽm kiên cố khẩu độ lớn, bạt 2 da chống nóng Hàn Quốc, trần thả lụa ghi sáng trang nhã phục vụ tiệc mừng nhà mới khang trang.',
    badge: 'Kiên Cố & Thoáng Mát',
    specs: 'Cách nhiệt chống nóng 95% • Lắp dựng nhanh • Phù hợp mặt đường lớn',
    imageBg: 'from-blue-950/70 via-slate-900/50 to-[#161c2b]',
    accentColor: '#2563eb',
  },
  {
    id: 'gia_tien_thanh_lich',
    name: 'Phông Lễ Ăn Hỏi Gia Tiên Thanh Lịch',
    titleEn: 'Heritage Engagement & Tea Ceremony',
    service: 'dam_hoi',
    desc: 'Phông gia tiên chữ Hỷ dát vàng, hoa lụa cao cấp phối đèn lồng cung đình ấm cúng, bàn dài đại biểu hai họ trang trọng chuẩn nghi thức.',
    badge: 'Nghi Lễ Gia Tiên Chu Đáo',
    specs: 'Phù hợp tư gia • Khăn trải ren thêu • Bàn ghế bọc nơ lụa',
    imageBg: 'from-amber-950/80 via-rose-900/40 to-[#161c2b]',
    accentColor: '#e11d48',
  },
];

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  articles = [],
  promotions = [],
  companyInfo: propCompanyInfo,
}) => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(propCompanyInfo || appStore.getCompanyInfo());

  // Slider State (Cấu hình Banner Hero từ CMS)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [cmsBannerSlides, setCmsBannerSlides] = useState<CmsBannerSlide[]>(appStore.getCmsBannerSlides());

  // Lọc các slide được bật (isActive) trong CMS, nếu chưa bật cái nào thì dùng toàn bộ danh sách
  const activeBannerSlides = cmsBannerSlides.filter(s => s.isActive);
  const slidesToDisplay = activeBannerSlides.length > 0 ? activeBannerSlides : cmsBannerSlides;

  // CMS & Modal States
  const [selectedArticle, setSelectedArticle] = useState<ArticleRecord | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedPromoCode, setCopiedPromoCode] = useState<string | null>(null);
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
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setViewingThemeDetail(null);
          setSelectedArticle(null);
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
  }, [viewingThemeDetail, selectedArticle]);

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
    if (slidesToDisplay.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex(prev => (prev + 1) % slidesToDisplay.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [slidesToDisplay.length]);

  const handleOpenThemeDetail = (theme: ThemeModel) => {
    setViewingThemeDetail(theme);
    setActiveThemeDetailImg(theme.detailImages?.[0] || theme.imageUrl);
  };

  // Touch Gesture State cho Banner Slideshow
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('dam_cuoi');
  const [selectedThemeId, setSelectedThemeId] = useState('hoang_gia');
  const [eventStartDate, setEventStartDate] = useState('2026-11-15');
  const [eventStartTime, setEventStartTime] = useState('10:30');
  const [setupDate, setSetupDate] = useState('2026-11-14');
  const [setupTime, setSetupTime] = useState('02:00');
  const [teardownDate, setTeardownDate] = useState('2026-11-15');
  const [teardownTime, setTeardownTime] = useState('06:00');
  const [eventAddress, setEventAddress] = useState('');
  const [note, setNote] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  // Helper áp dụng ưu đãi vào đơn đặt lịch
  const handleApplyPromo = (promo: PromotionBanner) => {
    if (promo.code) {
      setNote(prev => prev ? `${prev} [Mã ưu đãi: ${promo.code}]` : `[Mã ưu đãi: ${promo.code} - ${promo.discountText}]`);
    }
    const target = document.getElementById('dat-lich');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedPromoCode(code);
    setTimeout(() => setCopiedPromoCode(null), 2500);
  };

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactMsg('');
    }, 400);
  };

  // Cấu hình Bàn Ghế động
  const [tableConfigs, setTableConfigs] = useState<TableChairConfigItem[]>([
    {
      area: 'Rạp chính',
      tableType: 'ban_tron',
      chairType: 'ghe_inox',
      tableCount: 20,
      chairsPerTable: 6,
      extraChairs: 0,
      backupTables: 0,
    },
    {
      area: 'Rạp gia đình',
      tableType: 'ban_tron',
      chairType: 'ghe_nhua_do',
      tableCount: 10,
      chairsPerTable: 6,
      extraChairs: 0,
      backupTables: 0,
    },
  ]);

  // Kết quả gửi booking
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    code?: string;
    message: string;
  } | null>(null);

  // Tra cứu hồ sơ
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<IntakeRecord | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Tính toán quy đổi thời gian thực
  const convertedDemands = convertTableChairConfigs(tableConfigs);
  const totalTables = tableConfigs.reduce((s, c) => s + c.tableCount + (c.backupTables || 0), 0);
  const totalChairs = tableConfigs.reduce((s, c) => s + (c.tableCount * c.chairsPerTable) + (c.extraChairs || 0), 0);
  const inoxCount = tableConfigs
    .filter(c => c.chairType === 'ghe_inox')
    .reduce((sum, c) => sum + (c.tableCount * c.chairsPerTable) + (c.extraChairs || 0), 0);
  const nhuaCount = tableConfigs
    .filter(c => c.chairType === 'ghe_nhua_do')
    .reduce((sum, c) => sum + (c.tableCount * c.chairsPerTable) + (c.extraChairs || 0), 0);

  // Thêm khu vực bàn ghế mới
  const handleAddConfigRow = () => {
    setTableConfigs([
      ...tableConfigs,
      {
        area: `Khu vực ${tableConfigs.length + 1}`,
        tableType: 'ban_tron',
        chairType: 'ghe_inox',
        tableCount: 5,
        chairsPerTable: 6,
        extraChairs: 0,
        backupTables: 0,
      },
    ]);
  };

  const handleRemoveConfigRow = (index: number) => {
    if (tableConfigs.length <= 1) return;
    setTableConfigs(tableConfigs.filter((_, i) => i !== index));
  };

  const handleUpdateConfigRow = (index: number, field: keyof TableChairConfigItem, value: any) => {
    const updated = [...tableConfigs];
    updated[index] = { ...updated[index], [field]: value };
    setTableConfigs(updated);
  };

  // Submit Booking
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedTheme = LUXURY_THEMES.find(t => t.id === selectedThemeId);
    const tentConfigs: TentConfigItem[] = [
      {
        tentType: 'rap_chinh',
        themeId: selectedThemeId,
        themeName: selectedTheme?.name,
        bayCount: Math.max(3, Math.ceil(totalTables / 5)), // Ước tính 5 bàn/khoang
      },
    ];

    const eventDateStart = `${eventStartDate}T${eventStartTime}:00+07:00`;
    const eventDateEnd = `${eventStartDate}T14:30:00+07:00`;
    const setupDateStart = `${setupDate}T${setupTime}:00+07:00`;
    const teardownDateEnd = `${teardownDate}T${teardownTime}:00+07:00`;

    const result = appStore.submitPublicBooking({
      customerName,
      customerPhone,
      customerEmail: customerEmail || undefined,
      serviceType,
      eventDateStart,
      eventDateEnd,
      setupDateStart,
      teardownDateEnd,
      eventAddress,
      tableChairConfigs: tableConfigs,
      tentConfigs,
      note,
    });

    setSubmissionResult(result);

    if (result.success) {
      window.scrollTo({ top: document.getElementById('booking-result')?.offsetTop || 0, behavior: 'smooth' });
    }
  };

  // Tìm kiếm hồ sơ
  const handleSearchBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setSearchResult(null);
      return;
    }

    const allIntakes = appStore.getIntakes();
    const found = allIntakes.find(i => 
      i.code.toLowerCase() === q || 
      i.customerPhone.includes(q)
    );
    setSearchResult(found || null);
  };

  return (
    <div className="bg-[#faf8f5] text-[#1a1f2c] overflow-x-hidden w-full max-w-full">
      
      {/* ======================================================== */}
      {/* 1. HERO BANNER SLIDESHOW (CHẠY TỰ ĐỘNG THEO CMS, CHỈ CÓ DẤU CHẤM MỜ, HỖ TRỢ VUỐT TRÊN MOBILE) */}
      {/* ======================================================== */}
      <section 
        id="top"
        className="relative overflow-hidden w-full max-w-full h-[380px] sm:h-[480px] md:h-[580px] lg:h-[660px] bg-stone-900 group select-none touch-pan-y"
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
              currentSlideIndex === idx ? 'opacity-100 z-10 pointer-events-auto visible' : 'opacity-0 pointer-events-none z-0 invisible'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title || `Banner ${idx + 1}`}
              className="w-full h-full object-cover object-center transform scale-100 transition-transform duration-7000 ease-out"
            />
            {/* Lớp phủ chuyển sắc nhẹ ở đáy để làm nổi bật các chấm mờ */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/15 pointer-events-none" />
          </div>
        ))}

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

        {/* CÁC DẤU CHẤM MỜ THỂ HIỆN ĐANG Ở ẢNH NÀO (THEO YÊU CẦU NGƯỜI DÙNG: KHÔNG HIỂN THỊ TIÊU ĐỀ Ở GIỮA) */}
        <div className="absolute bottom-5 sm:bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-2 pointer-events-auto">
          {slidesToDisplay.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlideIndex(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer py-1.5 px-0.5 ${
                currentSlideIndex === idx
                  ? 'w-7 h-2 bg-white/90 shadow-md ring-1 ring-white/50'
                  : 'w-2 h-2 bg-white/35 hover:bg-white/70'
              }`}
              title={`Ảnh ${idx + 1} / ${slidesToDisplay.length}`}
              aria-label={`Chuyển tới ảnh ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. DỊCH VỤ CỦA THÁI ĐĂNG (CHUẨN XÁC ẢNH 1)                 */}
      {/* ======================================================== */}
      <section id="dich-vu" className="bg-[#faf8f5] py-16 px-4 sm:px-6 lg:px-8 border-b border-[#ece7de]">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Đám cưới */}
            <div 
              onClick={() => {
                setServiceType('dam_cuoi');
                document.getElementById('dat-lich')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col group"
            >
              <div className="h-44 w-full overflow-hidden bg-stone-100 relative">
                <img 
                  src="/card_dam_cuoi.jpg" 
                  alt="Đám cưới Thái Đăng" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-3 flex-1 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-[#b38338] border border-amber-200/60 flex items-center justify-center shrink-0 text-lg">
                    💍
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base group-hover:text-[#ee5a45] transition-colors">
                      Đám cưới
                    </h3>
                    <p className="text-xs sm:text-[13px] text-stone-600 leading-snug">
                      Rạp cưới trọn gói, sang trọng, ấm cúng
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-stone-50 text-stone-400 group-hover:bg-[#ee5a45] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Card 2: Đám hỏi */}
            <div 
              onClick={() => {
                setServiceType('dam_hoi');
                document.getElementById('dat-lich')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col group"
            >
              <div className="h-44 w-full overflow-hidden bg-stone-100 relative">
                <img 
                  src="/card_dam_hoi.jpg" 
                  alt="Đám hỏi Thái Đăng" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-3 flex-1 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center shrink-0 text-lg">
                    ❤️
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base group-hover:text-[#ee5a45] transition-colors">
                      Đám hỏi
                    </h3>
                    <p className="text-xs sm:text-[13px] text-stone-600 leading-snug">
                      Tinh tế, trang trọng, đúng phong tục
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-stone-50 text-stone-400 group-hover:bg-[#ee5a45] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Card 3: Nhà mới */}
            <div 
              onClick={() => {
                setServiceType('nha_moi');
                document.getElementById('dat-lich')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col group"
            >
              <div className="h-44 w-full overflow-hidden bg-stone-100 relative">
                <img 
                  src="/card_nha_moi.jpg" 
                  alt="Nhà mới Thái Đăng" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-3 flex-1 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center shrink-0 text-lg">
                    🏡
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base group-hover:text-[#ee5a45] transition-colors">
                      Nhà mới
                    </h3>
                    <p className="text-xs sm:text-[13px] text-stone-600 leading-snug">
                      Không gian ấm cúng, khởi đầu may mắn
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-stone-50 text-stone-400 group-hover:bg-[#ee5a45] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Card 4: Thiệp cưới online */}
            <div 
              onClick={() => {
                document.getElementById('thiep-cuoi')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col group"
            >
              <div className="h-44 w-full overflow-hidden bg-stone-100 relative">
                <img 
                  src="/card_thiep_cuoi.jpg" 
                  alt="Thiệp cưới online Thái Đăng" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              </div>
              <div className="p-4 flex items-center justify-between gap-3 flex-1 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center justify-center shrink-0 text-lg">
                    ✉️
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 text-base group-hover:text-[#ee5a45] transition-colors">
                      Thiệp cưới online
                    </h3>
                    <p className="text-xs sm:text-[13px] text-stone-600 leading-snug">
                      Mẫu đẹp, cá nhân hoá theo yêu cầu
                    </p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-stone-50 text-stone-400 group-hover:bg-[#ee5a45] group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. SHOWCASE MẪU PHÔNG RẠP HOÀNG GIA & TƯ VẤN PHONG THỦY */}
      <section id="mau-rap" className="bg-[#f5f1e8] py-20 px-4 sm:px-6 lg:px-8 border-y border-[#ede4d4]">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {cmsThemes.filter(t => t.isActive).map((theme) => {
              const isSelected = selectedThemeId === theme.id;
              return (
                <div
                  key={theme.id}
                  className={`rounded-3xl bg-white border-2 transition-all p-5 flex flex-col justify-between group shadow-xs ${
                    isSelected
                      ? 'border-[#c5a059] shadow-xl ring-2 ring-amber-200 transform -translate-y-1'
                      : 'border-[#ede4d4] hover:border-[#c5a059]/70 hover:shadow-lg'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Visual Photo Banner */}
                    <div className="h-48 rounded-2xl relative overflow-hidden bg-slate-900 group">
                      <img 
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
                        const target = document.getElementById('dat-lich');
                        if (target) target.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#e05638] text-white shadow-xs'
                          : 'bg-amber-50 hover:bg-amber-100 text-[#946517] border border-amber-200'
                      }`}
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

      {/* SECTION: CHƯƠNG TRÌNH KHUYẾN MẠI & ƯU ĐÃI (TONE MÀU TRẮNG SÁNG HOÀNG GIA ĐỒNG BỘ) */}
      <section id="uu-dai" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-br from-white via-[#fffdf9] to-[#faf5ea] rounded-3xl p-8 sm:p-12 border-2 border-[#e8dfcf] shadow-xl relative overflow-hidden">
          {/* Background decorative glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-[#b38338] text-[11px] font-bold tracking-widest uppercase border border-amber-200">
                  <Tag className="w-3.5 h-3.5" />
                  <span>ƯU ĐÃI ĐỘC QUYỀN MÙA CƯỚI 2026</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-stone-900 tracking-tight">
                  Chương Trình Khuyến Mại &amp; Gói Quà Tặng
                </h2>
                <p className="text-sm sm:text-base text-stone-600 max-w-2xl font-normal">
                  Nhận ngay voucher chiết khấu trực tiếp và gói quà tặng trang trí sân khấu tiệc cưới khi đăng ký dịch vụ sớm tại Nhà Rạp Thái Đăng.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-amber-800 font-semibold bg-white/80 px-4 py-2 rounded-2xl border border-amber-200 shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Số lượng ưu đãi có hạn theo tháng</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {(promotions || []).filter(p => p.isActive).map((promo) => (
                <div
                  key={promo.id}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-[#e8dfcf] hover:border-[#c5a059] transition-all duration-300 space-y-4 hover:shadow-lg flex flex-col justify-between group shadow-xs w-full"
                >
                  <div className="space-y-3">
                    {/* Hàng 1: Badge + Hạn dùng */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#ffece7] text-[#e05638] uppercase tracking-wider border border-[#fbd3c7]">
                        {promo.badge || 'HOT DEAL'}
                      </span>
                      <span className="text-xs text-stone-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Hạn dùng: {promo.validUntil}</span>
                      </span>
                    </div>

                    {/* Hàng 2: Tiêu đề riêng biệt full-width - Cho phép xuống dòng tự nhiên, không ngắt từng từ */}
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 group-hover:text-[#ee5a45] transition-colors leading-snug">
                        {promo.title}
                      </h3>
                    </div>

                    {/* Hàng 3: Badge mức giảm giá to bản, rõ ràng, không bị co ép */}
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-[#0e4b44] border border-emerald-200 text-sm sm:text-base font-extrabold">
                        <span>🎁</span>
                        <span>{promo.discountText}</span>
                      </span>
                    </div>

                    {/* Hàng 4: Mô tả chi tiết */}
                    <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
                      {promo.description}
                    </p>
                  </div>

                  {/* Chân thẻ: Mã ưu đãi + Nút Áp Dụng Ngay */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    {promo.code ? (
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs font-bold text-[#b38338] tracking-widest">
                          {promo.code}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(promo.code!)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Sao chép mã"
                        >
                          {copiedPromoCode === promo.code ? (
                            <>
                              <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 text-[11px]">Đã chép</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Chép mã</span>
                            </>
                          )}
                        </button>
                      </div>
                    ) : <div />}

                    <button
                      type="button"
                      onClick={() => handleApplyPromo(promo)}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold text-xs uppercase tracking-wider shadow-sm hover:shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>Áp Dụng Ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. ĐẶT LỊCH & DỰ TÍNH CHI PHÍ (CHUẨN ẢNH 1) */}
      <section id="dat-lich" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#fdfbf7] relative border-b border-[#ece5d8]">
        <div className="max-w-5xl mx-auto space-y-8">
          
          {/* Header với Logo chuẩn và Tiêu đề */}
          <div className="text-center space-y-2">
            <img 
              src="/logo_thai_dang.png" 
              alt="Nhà Rạp Thái Đăng" 
              className="h-16 mx-auto object-contain drop-shadow-2xs" 
            />
            <h2 className="text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#0e4b44] tracking-tight">
              Đặt lịch &amp; dự tính chi phí
            </h2>
            <p className="text-sm sm:text-base text-stone-600 font-normal max-w-xl mx-auto">
              Chọn dịch vụ, cấu hình rạp và để lại thông tin — Thái Đăng sẽ liên hệ tư vấn.
            </p>
          </div>

          {/* Stepper Indicator (Chuẩn Ảnh 1) */}
          <div className="max-w-2xl mx-auto pt-2 pb-4">
            <div className="relative flex items-center justify-between">
              {/* Connecting Line */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 z-0" />
              <div className="absolute top-4 left-6 w-1/3 h-0.5 bg-[#f06148] z-0" />

              {/* Step 1 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-[#f06148] text-white font-bold text-xs flex items-center justify-center shadow-md">
                  1
                </div>
                <span className="text-[11px] sm:text-xs font-bold text-[#f06148] mt-2 text-center max-w-[85px] sm:max-w-none">
                  1. Dịch vụ &amp; quy mô
                </span>
                <div className="w-12 h-0.5 bg-[#f06148] rounded-full mt-1" />
              </div>

              {/* Step 2 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-300 text-slate-500 font-bold text-xs flex items-center justify-center">
                  2
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-slate-500 mt-2 text-center max-w-[85px] sm:max-w-none">
                  2. Thời gian &amp; địa điểm
                </span>
              </div>

              {/* Step 3 */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-300 text-slate-500 font-bold text-xs flex items-center justify-center">
                  3
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-slate-500 mt-2 text-center max-w-[85px] sm:max-w-none">
                  3. Thông tin liên hệ
                </span>
              </div>
            </div>
          </div>

          {/* Main White Card Form */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-6 sm:p-10 space-y-8">
            <form onSubmit={handleSubmitBooking} className="space-y-8">

              {/* MỤC 1: Chọn dịch vụ tổ chức */}
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#0e4b44] font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Chọn dịch vụ tổ chức</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Chọn loại hình sự kiện của gia đình.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: 'dam_cuoi', label: 'Đám cưới', sub: 'Rạp cưới trọn gói', icon: '💍' },
                    { id: 'dam_hoi', label: 'Đám hỏi', sub: 'Dàn dựng không gian', icon: '🌸' },
                    { id: 'nha_moi', label: 'Nhà mới', sub: 'Nhà đài nay niên', icon: '🏡' },
                    { id: 'su_kien_khac', label: 'Sự kiện khác', sub: 'Khánh thành, lễ tạ...', icon: '🎉' },
                  ].map((s) => {
                    const isSelected = serviceType === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setServiceType(s.id as ServiceType)}
                        className={`p-4 rounded-2xl border text-center transition-all cursor-pointer relative ${
                          isSelected
                            ? 'border-2 border-[#f06148] bg-[#fff6f4] shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#f06148] text-white flex items-center justify-center shadow-2xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <div className="text-2xl mb-1.5">{s.icon}</div>
                        <div className="font-bold text-xs text-slate-900">{s.label}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{s.sub}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MỤC 2: Cấu hình rạp và bàn ghế */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#0e4b44] font-bold text-xs flex items-center justify-center shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Cấu hình rạp và bàn ghế</h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Chọn khu vực, loại bàn và loại ghế. Có thể thêm nhiều khu vực khác nhau nếu cần.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddConfigRow}
                    className="px-4 py-1.5 rounded-full border border-amber-300 bg-[#fffdf7] hover:bg-amber-100/60 text-amber-900 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm khu vực</span>
                  </button>
                </div>

                {/* Table Cấu hình chuẩn Ảnh 1 */}
                <div className="overflow-x-auto w-full max-w-full border border-slate-200/80 rounded-2xl">
                  <table className="w-full min-w-[560px] text-xs text-left">
                    <thead>
                      <tr className="text-[11px] font-bold text-slate-500 border-b border-slate-100">
                        <th className="py-2 px-2 w-8 text-center">#</th>
                        <th className="py-2 px-2">Khu vực</th>
                        <th className="py-2 px-2">Loại bàn</th>
                        <th className="py-2 px-2">Loại ghế</th>
                        <th className="py-2 px-2 w-20">Số bàn</th>
                        <th className="py-2 px-2 w-20">Ghế / bàn</th>
                        <th className="py-2 px-2 w-16 text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tableConfigs.map((cfg, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-2 text-center font-bold text-slate-400">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="text"
                              value={cfg.area}
                              onChange={(e) => handleUpdateConfigRow(idx, 'area', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-[#0e4b44]"
                              placeholder="Rạp chính"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <select
                              value={cfg.tableType}
                              onChange={(e) => handleUpdateConfigRow(idx, 'tableType', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                            >
                              <option value="ban_tron">Bàn tròn 1,2 m</option>
                              <option value="ban_dai">Bàn dài 1,6 m</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-2">
                            <select
                              value={cfg.chairType}
                              onChange={(e) => handleUpdateConfigRow(idx, 'chairType', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                            >
                              <option value="ghe_inox">Ghế inox</option>
                              <option value="ghe_nhua_do">Ghế nhựa đỏ</option>
                            </select>
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              min="1"
                              max="150"
                              value={cfg.tableCount}
                              onChange={(e) => handleUpdateConfigRow(idx, 'tableCount', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-center"
                            />
                          </td>
                          <td className="py-2.5 px-2">
                            <input
                              type="number"
                              min="4"
                              max="12"
                              value={cfg.chairsPerTable}
                              onChange={(e) => handleUpdateConfigRow(idx, 'chairsPerTable', parseInt(e.target.value) || 6)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-900 text-center"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {tableConfigs.length > 1 ? (
                              <button
                                type="button"
                                onClick={() => handleRemoveConfigRow(idx)}
                                className="p-1.5 text-slate-400 hover:text-[#f06148] transition-colors cursor-pointer"
                                title="Xóa khu vực này"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-slate-300 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Banner Tổng quy mô bàn ghế chuẩn Ảnh 1 */}
                <div className="p-3.5 rounded-2xl bg-[#eaf5ef] border border-[#d0ebd9] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 font-bold text-[#0e4b44]">
                    <Users className="w-4 h-4 text-[#0e4b44]" />
                    <span>Tổng dự kiến: {totalTables} bàn • {totalChairs} ghế</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#fff9ea] border border-[#fce6b6] text-amber-900 font-bold flex items-center gap-1.5 shadow-2xs">
                      <span>🪑</span>
                      <span>Ghế inox: {inoxCount}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#fff9ea] border border-[#fce6b6] text-amber-900 font-bold flex items-center gap-1.5 shadow-2xs">
                      <span>🪑</span>
                      <span>Ghế nhựa đỏ: {nhuaCount}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* MỤC 3: Thời gian tổ chức & địa điểm sự kiện */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#0e4b44] font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Thời gian tổ chức & địa điểm sự kiện</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Khối 1: Thời gian diễn ra tiệc chính */}
                  <div className="p-4 rounded-2xl bg-[#fffbf9] border border-rose-200/80 space-y-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-[#e05638]">
                      <Calendar className="w-4 h-4" />
                      <span>Thời gian diễn ra tiệc chính</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1 font-medium">Ngày bắt đầu</label>
                        <input
                          type="date"
                          value={eventStartDate}
                          onChange={(e) => setEventStartDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1 font-medium">Giờ bắt đầu</label>
                        <input
                          type="time"
                          value={eventStartTime}
                          onChange={(e) => setEventStartTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Khối 2: Thời gian chuẩn bị (lắp dựng & thu hồi) */}
                  <div className="p-4 rounded-2xl bg-[#fffdf7] border border-amber-200/80 space-y-2.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                      <Calendar className="w-4 h-4" />
                      <span>Thời gian chuẩn bị (lắp dựng & thu hồi)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1 font-medium">Bắt đầu lắp dựng</label>
                        <div className="space-y-1.5">
                          <input
                            type="date"
                            value={setupDate}
                            onChange={(e) => setSetupDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                            required
                          />
                          <input
                            type="time"
                            value={setupTime}
                            onChange={(e) => setSetupTime(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] text-slate-500 mb-1 font-medium">Hoàn tất thu hồi</label>
                        <div className="space-y-1.5">
                          <input
                            type="date"
                            value={teardownDate}
                            onChange={(e) => setTeardownDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                            required
                          />
                          <input
                            type="time"
                            value={teardownTime}
                            onChange={(e) => setTeardownTime(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Địa điểm tổ chức */}
                <div className="space-y-1.5">
                  <label className="block font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#e05638]" />
                    <span>Địa điểm tổ chức sự kiện</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập địa chỉ tổ chức của gia đình (thôn/xóm, xã, huyện...)"
                    value={eventAddress}
                    onChange={(e) => setEventAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-[#0e4b44]"
                  />
                  <p className="text-[11px] text-stone-500 font-normal">
                    Địa chỉ nơi dựng rạp sự kiện (Quý khách nhập cụ thể thôn/xóm, xã, huyện nơi tổ chức).
                  </p>
                </div>
              </div>

              {/* MỤC 4: Thông tin người đại diện đặt tiệc */}
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-[#0e4b44] font-bold text-xs flex items-center justify-center">
                    4
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Thông tin người đại diện đặt tiệc</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Anh Nam / Chị Lan"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Số điện thoại *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="0988 123 456"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        placeholder="khachhang@gmail.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Ghi chú / yêu cầu đặc biệt (nếu có)</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <textarea
                      rows={2}
                      placeholder="Ví dụ: Cần thêm dàn âm thanh 4 sub 4 full, đường vào ngõ rộng 4m..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Submit button chuẩn Ảnh 1 */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#f06148] hover:bg-[#e05038] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-rose-900/10 transition-all cursor-pointer hover:scale-101"
                >
                  <Send className="w-4 h-4" />
                  <span>GỬI YÊU CẦU ĐẶT LỊCH</span>
                </button>

                <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Đây là yêu cầu tư vấn, lịch sẽ được xác nhận sau khi nhân viên kiểm tra.</span>
                </p>
              </div>

            </form>

            {/* KẾT QUẢ GỬI YÊU CẦU */}
            {submissionResult && (
              <div id="booking-result" className="p-6 bg-amber-50/70 border border-amber-200 rounded-2xl">
                <div className="flex items-start gap-4">
                  <CheckCircle className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="text-base font-bold text-slate-900">
                      {submissionResult.message}
                    </h4>
                    {submissionResult.code && (
                      <div className="p-3.5 rounded-xl bg-white border border-amber-200 inline-block font-mono">
                        <span className="text-xs text-slate-500 block">Mã hồ sơ tiếp nhận của gia đình:</span>
                        <strong className="text-xl text-[#b8860b] font-extrabold">{submissionResult.code}</strong>
                      </div>
                    )}
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Trạng thái hiện tại: <strong className="text-amber-800">Chờ nhân viên liên hệ xác nhận</strong>.<br />
                      <em>Đội ngũ kỹ thuật Thái Đăng sẽ liên hệ để khảo sát mặt bằng thực tế trước khi chốt lịch và điều phối kho.</em>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 5. PHẦN THIỆP CƯỚI ONLINE (CHUẨN ẢNH 2: TONE TRẮNG SANG TRỌNG & HOA VĂN THỰC VẬT) */}
      <section id="thiep-cuoi" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-8 sm:p-12 relative overflow-hidden">
          
          {/* Họa tiết lá xanh / thực vật trang nhã ở góc trên & dưới bên phải (Chuẩn Ảnh 2) */}
          <div className="absolute top-0 right-0 w-72 h-72 pointer-events-none opacity-40">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
              <path d="M190 10 C140 40 120 90 130 140 C140 100 170 50 190 10Z" fill="#2d6a4f" opacity="0.6"/>
              <path d="M200 60 C150 85 135 125 145 165 C155 125 180 90 200 60Z" fill="#52b788" opacity="0.5"/>
              <path d="M140 25 C120 60 110 100 120 130 C130 90 150 60 140 25Z" fill="#74c69d" opacity="0.4"/>
              <circle cx="110" cy="110" r="4" fill="#eedcc2"/>
              <circle cx="160" cy="80" r="3" fill="#eedcc2"/>
            </svg>
          </div>
          <div className="absolute bottom-0 right-0 w-56 h-56 pointer-events-none opacity-30">
            <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
              <path d="M160 190 C130 145 110 110 120 65 C130 110 150 145 160 190Z" fill="#2d6a4f" opacity="0.5"/>
              <path d="M190 170 C150 130 135 95 145 60 C155 95 180 130 190 170Z" fill="#52b788" opacity="0.4"/>
            </svg>
          </div>

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            
            {/* Cột trái: Nội dung giới thiệu */}
            <div className="md:col-span-8 space-y-5">
              {/* Badge tính năng đang phát triển (Chuẩn Ảnh 2) */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fdeee9] border border-[#fbdcd3] text-[#d3523b] text-xs font-bold uppercase tracking-wider">
                <Settings className="w-3.5 h-3.5" />
                <span>TÍNH NĂNG ĐANG PHÁT TRIỂN</span>
              </div>

              {/* Tiêu đề 2 dòng màu xanh lục đậm */}
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0e4b44] leading-tight tracking-tight">
                Thiệp cưới online &amp;<br />quản lý khách mời
              </h3>

              {/* Đoạn văn mô tả */}
              <div className="space-y-2 text-sm sm:text-base text-stone-600 leading-relaxed font-normal max-w-xl">
                <p>
                  Dành riêng cho các cặp đôi đặt trọn gói dịch vụ rạp cưới tại <strong className="text-stone-900 font-semibold">Thái Đăng Palace</strong>.
                </p>
                <p>
                  Tạo thiệp cưới số sang trọng với ảnh cưới, lời mời, bản đồ định vị Google Maps và nhận phản hồi tham dự từ đồng ý, đến bạn bè, người thân.
                </p>
              </div>

              {/* Thông báo khóa vàng gold (Chuẩn Ảnh 2) */}
              <div className="pt-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#faedd8] border border-[#f2dac0] flex items-center justify-center shrink-0 shadow-2xs">
                  <Lock className="w-4 h-4 text-[#996515]" />
                </div>
                <div className="h-6 w-[1.5px] bg-[#eedcc2]" />
                <span className="text-xs sm:text-sm text-[#996515] font-semibold">
                  Sẽ mở sau khi Job tổ chức cưới được xác nhận.
                </span>
              </div>
            </div>

            {/* Cột phải: Khung Mẫu thiệp số Thái Đăng với đồ họa mã QR cách điệu vàng gold (Chuẩn Ảnh 2) */}
            <div className="md:col-span-4 flex justify-center md:justify-end">
              <div className="w-56 p-6 sm:p-7 rounded-3xl bg-[#faf8f5] border-2 border-[#eedcc2] text-center shadow-md relative group hover:border-[#c59b4c] transition-all">
                
                {/* Đồ họa QR Monogram cách điệu màu vàng gold */}
                <div className="w-28 h-28 mx-auto flex items-center justify-center mb-3">
                  <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-[#c59b4c]">
                    {/* Ô vuông bo góc trên-trái kèm chấm */}
                    <rect x="10" y="10" width="34" height="34" rx="8" stroke="currentColor" strokeWidth="6" fill="none"/>
                    <circle cx="27" cy="27" r="4" fill="currentColor"/>
                    {/* Ô vuông bo góc trên-phải kèm chấm */}
                    <rect x="56" y="10" width="34" height="34" rx="8" stroke="currentColor" strokeWidth="6" fill="none"/>
                    <circle cx="73" cy="27" r="4" fill="currentColor"/>
                    {/* Ô vuông bo góc dưới-trái kèm chấm */}
                    <rect x="10" y="56" width="34" height="34" rx="8" stroke="currentColor" strokeWidth="6" fill="none"/>
                    <circle cx="27" cy="73" r="4" fill="currentColor"/>
                    {/* Cung bo góc dưới-phải */}
                    <path d="M56 56 H90 V76 C90 83.7 83.7 90 76 90 H56 V56Z" stroke="currentColor" strokeWidth="6" fill="none"/>
                    <circle cx="73" cy="73" r="4" fill="currentColor"/>
                  </svg>
                </div>

                {/* Trái tim vàng gold */}
                <div className="flex items-center justify-center gap-2 my-2 text-[#c59b4c]">
                  <div className="h-[1px] w-5 bg-[#eedcc2]" />
                  <Heart className="w-3.5 h-3.5 fill-[#c59b4c] text-[#c59b4c]" />
                  <div className="h-[1px] w-5 bg-[#eedcc2]" />
                </div>

                {/* Nhãn chữ MẪU THIỆP SỐ THÁI ĐĂNG */}
                <div className="space-y-0.5 pt-1">
                  <div className="text-[11px] font-bold text-[#0e4b44] uppercase tracking-wider">
                    MẪU THIỆP SỐ
                  </div>
                  <div className="text-xs font-bold text-[#0e4b44] tracking-widest uppercase">
                    THÁI ĐĂNG
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. TRA CỨU HỒ SƠ ĐÃ GỬI */}
      <section id="tra-cuu" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-3xl shadow-xl border border-[#ede8de] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#b8860b]">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-900">
                Tra Cứu Hồ Sơ &amp; Lịch Trình Sự Kiện
              </h3>
              <p className="text-sm text-stone-600 mt-0.5">
                Nhập mã hồ sơ (ví dụ: TD-202610-001) hoặc số điện thoại để kiểm tra tình trạng xử lý.
              </p>
            </div>
          </div>

          <form onSubmit={handleSearchBooking} className="flex gap-2.5">
            <input
              type="text"
              placeholder="Nhập mã hồ sơ hoặc số điện thoại đã đăng ký..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0e4b44]"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"
            >
              Tra Cứu
            </button>
          </form>

          {hasSearched && (
            <div className="pt-2">
              {searchResult ? (
                <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#ede8de] space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <div>
                      <span className="font-mono font-bold text-[#b8860b] text-base">{searchResult.code}</span>
                      <strong className="text-slate-900 text-sm ml-2">{searchResult.customerName}</strong>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 uppercase">
                      {searchResult.status.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                    <div><strong>Dịch vụ:</strong> {searchResult.serviceType.replace('_', ' ')}</div>
                    <div><strong>Số điện thoại:</strong> {searchResult.customerPhone}</div>
                    <div><strong>Ngày tiệc:</strong> {new Date(searchResult.eventDateStart).toLocaleDateString('vi-VN')}</div>
                    <div className="col-span-2"><strong>Địa chỉ:</strong> {searchResult.eventAddress}</div>
                    <div><strong>Mã Job:</strong> {searchResult.confirmedJobId || 'Đang chờ duyệt Job'}</div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 text-center">
                  Không tìm thấy hồ sơ nào khớp với từ khóa tìm kiếm. Vui lòng kiểm tra lại mã hoặc số điện thoại!
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 7. TIN TỨC SỰ KIỆN & CẨM NĂNG QUẢNG BÁ (CMS ARTICLES) */}
      <section id="tin-tuc" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-[#ede8de] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-[#b8860b] text-xs font-bold tracking-wider uppercase">
              <FileText className="w-3.5 h-3.5" />
              <span>CẨM NĂNG & DỰ ÁN THỰC TẾ</span>
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
            {[
              { id: 'all', label: 'Tất Cả Bài Viết' },
              { id: 'xu_huong_rap', label: 'Xu Hướng Rạp' },
              { id: 'kinh_nghiem_cuoi', label: 'Kinh Nghiệm Cưới' },
              { id: 'du_an_thuc_te', label: 'Dự Án Thực Tế' },
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(articles || [])
            .filter(a => a.isPublished && (selectedCategory === 'all' || a.category === selectedCategory))
            .map(art => (
              <div
                key={art.id}
                onClick={() => setSelectedArticle(art)}
                className="bg-white rounded-3xl border border-[#ede8de] overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group cursor-pointer transform hover:-translate-y-1"
              >
                <div>
                  <div className="h-52 relative overflow-hidden bg-slate-100">
                    {art.imageUrl ? (
                      <img
                        src={art.imageUrl}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">Ảnh bài viết</div>
                    )}
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-[#121722]/85 text-[#dfba73] backdrop-blur-md uppercase tracking-wider">
                      {art.category === 'xu_huong_rap' ? 'Xu hướng' : art.category === 'kinh_nghiem_cuoi' ? 'Kinh nghiệm' : art.category === 'du_an_thuc_te' ? 'Dự án thực tế' : 'Ưu đãi'}
                    </span>
                    <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md">
                      {art.viewCount} lượt xem
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
            <img 
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
                  href={companyInfo.facebookFanpageUrl || companyInfo.facebookFanpage || 'https://facebook.com'}
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
                  href={companyInfo.zaloChat || (companyInfo.zaloPhone ? `https://zalo.me/${companyInfo.zaloPhone.replace(/\D/g, '')}` : 'https://zalo.me')}
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
              Để lại thông tin, Thái Đăng sẽ liên hệ tư vấn
            </h3>

            {contactSubmitted ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-sm font-semibold text-center flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Cảm ơn quý khách! Đội ngũ Nhà Rạp Thái Đăng đã nhận thông tin và sẽ gọi lại ngay.</span>
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
                    onChange={(e) => setContactMsg(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-stone-300 bg-white font-medium text-stone-900 placeholder-stone-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0e4b44] text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#ee5a45] hover:bg-[#e04530] text-white font-bold text-sm uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer hover:shadow-md"
                >
                  <Send className="w-4 h-4" />
                  <span>GỬI YÊU CẦU TƯ VẤN</span>
                </button>

                <p className="text-xs text-stone-500 text-center flex items-center justify-center gap-1.5 pt-1">
                  <Lock className="w-3.5 h-3.5 text-stone-400" />
                  <span>Thông tin chỉ dùng để liên hệ tư vấn dịch vụ.</span>
                </p>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* FOOTER ĐẲNG CẤP: TONE MÀU SÁNG TRANG NHÃ, DỄ ĐỌC */}
      <footer className="bg-[#fbf9f6] text-stone-700 pt-16 pb-10 border-t border-[#ede5d8] text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pb-12 border-b border-[#ede5d8]">
          
          {/* Cột 1: Vương miện, Slogan & Các biểu tượng mạng xã hội */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-[#c59b4c]" />
            </div>
            <h4 className="font-bold text-[#0e4b44] text-sm tracking-wider uppercase">
              SỰ KIỆN TRỌN NIỀM VUI
            </h4>
            <div className="flex items-center gap-2.5 pt-1">
              {/* Nút Chia sẻ / Fanpage */}
              <a
                href={companyInfo.facebookFanpage || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#f4ece1] hover:bg-[#ebdcc8] text-[#8c6b3e] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Facebook Fanpage"
              >
                <Share2 className="w-4 h-4" />
              </a>
              {/* Nút Zalo */}
              <a
                href={companyInfo.zaloChat || 'https://zalo.me'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#f4ece1] hover:bg-[#ebdcc8] text-[#8c6b3e] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="Zalo Chat"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              {/* Nút TikTok */}
              <a
                href={companyInfo.tiktokUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#f4ece1] hover:bg-[#ebdcc8] text-[#8c6b3e] font-bold text-xs flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="TikTok"
              >
                TT
              </a>
              {/* Nút YouTube */}
              <a
                href={companyInfo.youtubeUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-[#f4ece1] hover:bg-[#ebdcc8] text-[#8c6b3e] font-bold text-xs flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
                title="YouTube"
              >
                YT
              </a>
            </div>
          </div>

          {/* Cột 2: Dịch Vụ Tổ Chức */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#0e4b44] uppercase tracking-wider text-sm">
              DỊCH VỤ TỔ CHỨC
            </h4>
            <ul className="space-y-2.5 text-stone-600 font-medium">
              <li>Tiệc cưới hoành tráng</li>
              <li>Lễ ăn hỏi &amp; đính hôn</li>
              <li>Lễ tân gia mừng nhà mới</li>
              <li>Sự kiện khai trương &amp; khánh thành</li>
              <li>Cung cấp thiết bị bàn ghế &amp; âm thanh</li>
            </ul>
          </div>

          {/* Cột 3: Chính Sách & Cam Kết */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#0e4b44] uppercase tracking-wider text-sm">
              CHÍNH SÁCH &amp; CAM KẾT
            </h4>
            <ul className="space-y-2.5 text-stone-600 font-medium">
              <li>Khảo sát đo đạc mặt bằng miễn phí</li>
              <li>Bảo đảm an toàn kết cấu rạp khẩu độ lớn</li>
              <li>Cam kết đúng giờ hoàng đạo 100%</li>
              <li>Dụng cụ bàn ghế sạch sẽ, khử khuẩn</li>
            </ul>
          </div>

          {/* Cột 4: Liên Hệ Trực Tiếp */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#0e4b44] uppercase tracking-wider text-sm">
              LIÊN HỆ TRỰC TIẾP
            </h4>
            <p className="text-stone-600 font-medium leading-relaxed">
              Trụ sở kho bãi &amp; văn phòng: {companyInfo.address || 'Thôn Trực Đông, xã Cổ Lễ, tỉnh Ninh Bình'}
            </p>
            <p className="text-stone-800 font-medium">
              Hotline 24/7: <strong className="text-[#ee5a45] font-bold text-base">{getOfficialContactHotline(companyInfo.hotline)}</strong>
            </p>
            <p className="text-stone-600 font-medium">
              Email: {companyInfo.email || 'sukien@nharapthaidang.vn'}
            </p>
          </div>

        </div>

        {/* Thanh bản quyền phía chân trang */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 flex flex-wrap items-center justify-between text-stone-500 text-xs font-medium gap-2">
          <p>© 2026 • Tất cả các quyền được bảo lưu.</p>
          <p>Thiết kế &amp; phát triển cho Nhà Rạp Thái Đăng.</p>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* PHẦN LIÊN HỆ CỐ ĐỊNH: TRÊN MOBILE GỌN GÀNG GÓC DƯỚI, KHÔNG CHE NỘI DUNG CHÍNH GIỮA */}
      {/* ======================================================== */}
      <div className="fixed right-2.5 sm:right-5 bottom-20 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-40 flex flex-col items-center gap-2 sm:gap-3 pointer-events-auto animate-fade-in">
        
        {/* 1. NÚT GỌI HOTLINE: TRÒN MÀU VÀNG GOLD, ICON ĐIỆN THOẠI ĐEN */}
        <a
          href={`tel:${companyInfo.hotline.replace(/[^0-9]/g, '')}`}
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
          href={companyInfo.zaloChat}
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
          href={companyInfo.facebookFanpage}
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
      <div className="fixed bottom-5 right-2.5 sm:right-5 z-40 pointer-events-auto">
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
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-slate-800 animate-fade-in relative">
            
            <button
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedArticle.imageUrl && (
              <div className="h-64 sm:h-80 w-full relative overflow-hidden bg-slate-100">
                <img
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                  <div className="space-y-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold gold-gradient text-[#121722] uppercase tracking-wider">
                      {selectedArticle.category === 'xu_huong_rap' ? 'Xu hướng rạp' : selectedArticle.category === 'kinh_nghiem_cuoi' ? 'Kinh nghiệm cưới' : selectedArticle.category === 'du_an_thuc_te' ? 'Dự án thực tế' : 'Ưu đãi'}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
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
                <div>{selectedArticle.viewCount} lượt xem</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/70 text-slate-700 font-medium italic leading-relaxed">
                {selectedArticle.summary}
              </div>

              <div className="text-slate-700 leading-relaxed space-y-4 font-sans whitespace-pre-line text-sm">
                {selectedArticle.content}
              </div>

              <div className="p-4 sm:p-6 rounded-2xl bg-[#faf8f5] border border-stone-200/90 text-stone-900 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6">
                <div>
                  <h4 className="font-bold text-stone-900 text-sm sm:text-base">Bạn cần tư vấn phong cách rạp cưới này?</h4>
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full my-8 shadow-2xl overflow-hidden border border-[#e8dfcf] animate-fade-in text-slate-800">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-[#fcfaf6]">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100/80 px-2.5 py-0.5 rounded-full">
                  {viewingThemeDetail.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1">
                  {viewingThemeDetail.name}
                </h3>
                <p className="text-xs text-[#b8860b] font-medium tracking-wide">
                  {viewingThemeDetail.titleEn}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewingThemeDetail(null)}
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
                  <img
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
                        className={`w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                          activeThemeDetailImg === img ? 'border-[#e05638] ring-2 ring-rose-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
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

    </div>
  );
};
