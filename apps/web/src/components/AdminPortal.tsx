// apps/web/src/components/AdminPortal.tsx
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Home,
  Inbox,
  Briefcase,
  Boxes,
  CalendarDays,
  DollarSign,
  Coins,
  BarChart3,
  TrendingUp,
  Settings,
  ScrollText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Truck,
  ArrowRight,
  Filter,
  Check,
  X,
  FileText,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Calendar,
  Layers,
  ShieldAlert,
  Users,
  UserCheck,
  Shield,
  Crown,
  LogOut,
  Globe,
  SlidersHorizontal,
  Bell,
  RotateCcw,
  UserPlus,
  Lock,
  Unlock,
  Building2,
  DollarSign as CashIcon,
  Sparkles,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  Share2,
  MoreHorizontal
} from 'lucide-react';
import { 
  UserProfile, 
  IntakeRecord, 
  JobRecord, 
  InventoryItem, 
  InventoryReservation, 
  QuoteRecord, 
  PaymentReceipt, 
  AuditLogEntry,
  TaskStatus,
  IntakeStatus,
  JobStatus,
  UserRole
} from '@thai-dang/shared';
import { 
  appStore, 
  CustomerAccount, 
  MOCK_USERS, 
  ArticleRecord, 
  PromotionBanner, 
  CompanyInfo,
  CmsCategory,
  CmsPartnerPhoto,
  CmsBannerSlide,
  MonthEventItem,
  ReminderTask,
  DebtItem,
  WarehouseAlertItem,
  ThemeModel
} from '../services/store';
import { RBAC, ROLE_LABELS } from '@thai-dang/shared';

interface AdminPortalProps {
  currentUser: UserProfile;
  intakes: IntakeRecord[];
  jobs: JobRecord[];
  catalog: InventoryItem[];
  reservations: InventoryReservation[];
  quotes: QuoteRecord[];
  payments: PaymentReceipt[];
  auditLogs: AuditLogEntry[];
  customers: CustomerAccount[];
  staffMembers: UserProfile[];
  articles: ArticleRecord[];
  promotions: PromotionBanner[];
  companyInfo: CompanyInfo;
  onBackToCustomerSite: () => void;
  onLogout?: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  intakes,
  jobs,
  catalog,
  reservations,
  quotes,
  payments,
  auditLogs,
  customers,
  staffMembers,
  articles,
  promotions,
  companyInfo,
  onBackToCustomerSite,
  onLogout,
}) => {
  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị Thái Đăng?')) {
      appStore.logoutStaff();
      if (onLogout) {
        onLogout();
      } else {
        window.location.hash = '#login';
      }
    }
  };

  // Navigation Menu Left
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'intake' | 'jobs' | 'inventory' | 'timeline' | 'calendar' | 'finance' | 'customers' | 'staff' | 'audit' | 'articles' | 'promotions' | 'settings'
  >('dashboard');

  // Filter & Search States
  const [intakeStatusFilter, setIntakeStatusFilter] = useState<string>('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState<string>('all');

  // Selected Records for Modals
  const [selectedIntake, setSelectedIntake] = useState<IntakeRecord | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobRecord | null>(null);

  // Survey Modal State
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [surveyAddressDetail, setSurveyAddressDetail] = useState('');
  const [surveyRoadNote, setSurveyRoadNote] = useState('');
  const [surveyGroundSize, setSurveyGroundSize] = useState('');
  const [surveyPrecision, setSurveyPrecision] = useState<'chinh_xac' | 'uoc_luong' | 'can_xac_minh'>('chinh_xac');

  // Confirmation Modal State (with live inventory check)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [skipSurveyChecked, setSkipSurveyChecked] = useState(false);

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(5000000);
  const [paymentType, setPaymentType] = useState<PaymentReceipt['paymentType']>('tien_coc');
  const [paymentMethod, setPaymentMethod] = useState<PaymentReceipt['paymentMethod']>('chuyen_khoan');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentTargetJobId, setPaymentTargetJobId] = useState('');

  // Add Staff Modal State
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffUsername, setNewStaffUsername] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('123456');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<UserRole>('tu_van');

  // CMS Settings Sub-tab State
  const [settingsTab, setSettingsTab] = useState<'mau_rap' | 'uu_dai' | 'chuyen_muc' | 'tin_bai' | 'anh_lien_ket' | 'banner' | 'footer' | 'tai_khoan'>('mau_rap');
  const [cmsThemesList, setCmsThemesList] = useState<ThemeModel[]>(appStore.getCmsThemes());
  const [cmsCategoriesList, setCmsCategoriesList] = useState<CmsCategory[]>(appStore.getCmsCategories());
  const [cmsPartnerPhotosList, setCmsPartnerPhotosList] = useState<CmsPartnerPhoto[]>(appStore.getCmsPartnerPhotos());
  const [cmsBannerSlidesList, setCmsBannerSlidesList] = useState<CmsBannerSlide[]>(appStore.getCmsBannerSlides());

  // Theme & Feng Shui Modal State
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [editingThemeId, setEditingThemeId] = useState<string | null>(null);
  const [themeName, setThemeName] = useState('');
  const [themeTitleEn, setThemeTitleEn] = useState('');
  const [themeService, setThemeService] = useState('dam_cuoi');
  const [themeDesc, setThemeDesc] = useState('');
  const [themeBadge, setThemeBadge] = useState('Bộ Sưu Tập Nổi Bật Nhất');
  const [themeSpecs, setThemeSpecs] = useState('Khẩu độ rạp 6m - 18m • Đèn chùm pha lê • Thảm trải sàn cao cấp');
  const [themeImageUrl, setThemeImageUrl] = useState('/hero_backdrop.jpg');
  const [themeDetailImages, setThemeDetailImages] = useState('/hero_backdrop.jpg, /card_dam_cuoi.jpg');
  const [themeFengShuiElement, setThemeFengShuiElement] = useState('Mệnh Kim & Mệnh Thổ (Thổ sinh Kim)');
  const [themeFengShuiAges, setThemeFengShuiAges] = useState('Canh Thìn (2000), Tân Tỵ (2001), Mậu Dần (1998), Kỷ Mão (1999)');
  const [themeFengShuiMeaning, setThemeFengShuiMeaning] = useState('Thu hút vượng khí, tài lộc dồi dào, vợ chồng đồng thuận làm ăn phát đạt');
  const [themeFengShuiFlowers, setThemeFengShuiFlowers] = useState('Hoa hồng kem pastel, hoa lan hồ điệp trắng, tú cầu vàng champagne');
  const [themeIsActive, setThemeIsActive] = useState(true);
  
  // Category Modal State
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Partner Photo Modal State
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState('Rạp Cưới');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');

  // Banner Slide Modal State
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerTag, setBannerTag] = useState('📍 Phục vụ tại Ninh Bình');
  const [bannerImgUrl, setBannerImgUrl] = useState('');
  const [bannerCta1, setBannerCta1] = useState('ĐẶT LỊCH TƯ VẤN');
  const [bannerCta2, setBannerCta2] = useState('XEM MẪU RẠP');

  // Inventory Timeline Tool State
  const [timelineItemCode, setTimelineItemCode] = useState('BAN_TRON');
  const [timelineStart, setTimelineStart] = useState('2026-10-23T08:00');
  const [timelineEnd, setTimelineEnd] = useState('2026-10-25T18:00');

  // Article CMS state
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [articleCategory, setArticleCategory] = useState<'xu_huong_rap' | 'kinh_nghiem_cuoi' | 'thuc_don_co' | 'gioi_thieu'>('xu_huong_rap');
  const [articleSummary, setArticleSummary] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleImageUrl, setArticleImageUrl] = useState('');
  const [articleAuthor, setArticleAuthor] = useState('Ban Biên Tập Thái Đăng');
  const [articleIsPublished, setArticleIsPublished] = useState(true);

  // Promotion CMS state
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDiscountText, setPromoDiscountText] = useState('');
  const [promoValidUntil, setPromoValidUntil] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoBadge, setPromoBadge] = useState('');
  const [promoIsActive, setPromoIsActive] = useState(true);

  // Company Info & Fanpage Settings State
  const [settingsForm, setSettingsForm] = useState<CompanyInfo>(companyInfo);
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);

  // Quick Role Switcher Dropdown in Sidebar
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  // Helper tính trùng số điện thoại
  const getPhoneDuplicateCount = (phone: string, currentId: string) => {
    return intakes.filter(i => i.customerPhone === phone && i.id !== currentId).length;
  };

  // Mở modal Khảo sát
  const handleOpenSurvey = (intake: IntakeRecord) => {
    setSelectedIntake(intake);
    setSurveyAddressDetail(intake.survey?.addressDetail || '');
    setSurveyRoadNote(intake.survey?.roadNote || '');
    setSurveyGroundSize(intake.survey?.groundSize || '');
    setSurveyPrecision(intake.survey?.locationPrecision || 'chinh_xac');
    setShowSurveyModal(true);
  };

  const handleSaveSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntake) return;

    appStore.updateIntakeSurvey(
      selectedIntake.id,
      {
        addressDetail: surveyAddressDetail,
        roadNote: surveyRoadNote,
        groundSize: surveyGroundSize,
        locationPrecision: surveyPrecision,
        surveyorName: currentUser.fullName,
      },
      'da_khao_sat'
    );

    setShowSurveyModal(false);
    alert('Đã lưu thông tin khảo sát mặt bằng và chuyển trạng thái sang "Đã khảo sát"!');
  };

  // Mở modal Xác nhận thành Job
  const handleOpenConfirmModal = (intake: IntakeRecord) => {
    setSelectedIntake(intake);
    setSkipSurveyChecked(false);
    setShowConfirmModal(true);
  };

  // Thực hiện Xác nhận thành Job (Idempotent & Kiểm tra kho)
  const handleExecuteConfirm = () => {
    if (!selectedIntake) return;

    const res = appStore.confirmIntake(selectedIntake.id, skipSurveyChecked);
    if (!res.success) {
      alert(`KHÔNG THỂ XÁC NHẬN:\n${res.message}`);
      return;
    }

    setShowConfirmModal(false);
    alert(res.message);
  };

  // Xuất kho dụng cụ
  const handleDispatch = (jobId: string) => {
    if (window.confirm('Xác nhận xuất kho các thiết bị lên xe chuyển đến công trình?')) {
      const res = appStore.dispatchJobItems(jobId);
      alert(res.message);
    }
  };

  // Hoàn trả dụng cụ nhập kho
  const handleReturn = (jobId: string) => {
    if (window.confirm('Xác nhận kiểm đếm đủ thiết bị và hoàn trả về kho?')) {
      const res = appStore.returnJobItems(jobId);
      alert(res.message);
    }
  };

  // Hủy Job
  const handleCancelJob = (jobId: string) => {
    const reason = prompt('Nhập lý do hủy Job:');
    if (reason !== null) {
      const res = appStore.cancelJob(jobId, reason);
      alert(res.message);
    }
  };

  // Mở modal thu tiền
  const handleOpenPayment = (jobId: string) => {
    setPaymentTargetJobId(jobId);
    setPaymentAmount(5000000);
    setPaymentType('tien_coc');
    setPaymentNotes('');
    setShowPaymentModal(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const job = jobs.find(j => j.id === paymentTargetJobId);
    if (!job) return;

    const res = appStore.recordPayment({
      jobId: job.id,
      intakeId: job.intakeId,
      paymentType,
      amountVND: Number(paymentAmount),
      paymentMethod,
      notes: paymentNotes,
    });

    if (res.success) {
      setShowPaymentModal(false);
      alert(res.message);
    } else {
      alert(res.message);
    }
  };

  // Thêm nhân viên / tài khoản quản trị mới
  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    const res = appStore.addStaffMember({
      fullName: newStaffName,
      email: newStaffEmail,
      phone: newStaffPhone,
      role: newStaffRole,
      username: newStaffUsername || newStaffEmail.split('@')[0],
      password: newStaffPassword || '123456',
    });
    if (res.success) {
      setShowAddStaffModal(false);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPhone('');
      setNewStaffUsername('');
      setNewStaffPassword('123456');
      alert(res.message);
    }
  };

  // CMS Category Handlers
  const handleOpenAddCategory = () => {
    setEditingCatId(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setShowCatModal(true);
  };

  const handleOpenEditCategory = (cat: CmsCategory) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description);
    setShowCatModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const slug = catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, '').replace(/\s+/g, '-');
    if (editingCatId) {
      appStore.updateCmsCategory(editingCatId, { name: catName, slug, description: catDesc });
    } else {
      appStore.addCmsCategory({ name: catName, slug, description: catDesc, iconName: 'Sparkles', itemCount: 0, isActive: true });
    }
    setCmsCategoriesList(appStore.getCmsCategories());
    setShowCatModal(false);
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chuyên mục này?')) {
      appStore.deleteCmsCategory(id);
      setCmsCategoriesList(appStore.getCmsCategories());
    }
  };

  const handleToggleCategoryActive = (id: string, current: boolean) => {
    appStore.updateCmsCategory(id, { isActive: !current });
    setCmsCategoriesList(appStore.getCmsCategories());
  };

  // CMS Partner Photo Handlers
  const handleOpenAddPhoto = () => {
    setPhotoTitle('');
    setPhotoCategory('Rạp Cưới');
    setPhotoUrl('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80');
    setPhotoCaption('');
    setShowPhotoModal(true);
  };

  const handleSavePhoto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoTitle.trim() || !photoUrl.trim()) return;
    appStore.addCmsPartnerPhoto({
      title: photoTitle,
      category: photoCategory,
      imageUrl: photoUrl,
      caption: photoCaption || photoTitle,
      sortOrder: cmsPartnerPhotosList.length + 1
    });
    setCmsPartnerPhotosList(appStore.getCmsPartnerPhotos());
    setShowPhotoModal(false);
  };

  const handleDeletePhoto = (id: string) => {
    if (window.confirm('Xóa ảnh liên kết này?')) {
      appStore.deleteCmsPartnerPhoto(id);
      setCmsPartnerPhotosList(appStore.getCmsPartnerPhotos());
    }
  };

  // CMS Banner Slide Handlers
  const handleOpenEditBanner = (slide: CmsBannerSlide) => {
    setEditingBannerId(slide.id);
    setBannerTitle(slide.title);
    setBannerSubtitle(slide.subtitle);
    setBannerTag(slide.locationTag);
    setBannerImgUrl(slide.imageUrl);
    setBannerCta1(slide.ctaText1);
    setBannerCta2(slide.ctaText2);
    setShowBannerModal(true);
  };

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBannerId) return;
    appStore.updateCmsBannerSlide(editingBannerId, {
      title: bannerTitle,
      subtitle: bannerSubtitle,
      locationTag: bannerTag,
      imageUrl: bannerImgUrl,
      ctaText1: bannerCta1,
      ctaText2: bannerCta2
    });
    setCmsBannerSlidesList(appStore.getCmsBannerSlides());
    setShowBannerModal(false);
  };

  const handleToggleBannerActive = (slide: CmsBannerSlide) => {
    appStore.updateCmsBannerSlide(slide.id, { isActive: !slide.isActive });
    setCmsBannerSlidesList(appStore.getCmsBannerSlides());
  };

  // Đổi vai trò nhân viên
  const handleChangeRole = (userId: string, newRole: UserRole) => {
    const res = appStore.updateStaffRole(userId, newRole);
    alert(res.message);
  };

  const handleToggleStaff = (userId: string) => {
    const res = appStore.toggleStaffStatus(userId);
    alert(res.message);
  };

  const handleSelectRoleInDropdown = (user: UserProfile) => {
    appStore.setCurrentUser(user);
    setShowRoleDropdown(false);
  };

  // Tính khả dụng cho Timeline Lookup Tool
  const timelineResult = appStore.checkItemAvailabilityOverTime(
    timelineItemCode,
    timelineStart,
    timelineEnd
  );

  // Article CMS Handlers
  const handleOpenAddArticle = () => {
    setEditingArticleId(null);
    setArticleTitle('');
    setArticleSlug('');
    setArticleCategory('xu_huong_rap');
    setArticleSummary('');
    setArticleContent('');
    setArticleImageUrl('https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80');
    setArticleAuthor(currentUser.fullName);
    setArticleIsPublished(true);
    setShowArticleModal(true);
  };

  const handleOpenEditArticle = (art: ArticleRecord) => {
    setEditingArticleId(art.id);
    setArticleTitle(art.title);
    setArticleSlug(art.slug);
    setArticleCategory(art.category);
    setArticleSummary(art.summary);
    setArticleContent(art.content);
    setArticleImageUrl(art.imageUrl || '');
    setArticleAuthor(art.author);
    setArticleIsPublished(art.isPublished);
    setShowArticleModal(true);
  };

  const handleSaveArticle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!articleTitle.trim()) return;

    if (editingArticleId) {
      const res = appStore.updateArticle(editingArticleId, {
        title: articleTitle,
        category: articleCategory,
        summary: articleSummary,
        content: articleContent,
        imageUrl: articleImageUrl,
        author: articleAuthor,
        isPublished: articleIsPublished,
      });
      alert(res.message);
    } else {
      const slug = articleTitle.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, '').replace(/\s+/g, '-');
      const res = appStore.addArticle({
        title: articleTitle,
        slug,
        category: articleCategory,
        summary: articleSummary,
        content: articleContent,
        imageUrl: articleImageUrl,
        author: articleAuthor,
        isPublished: articleIsPublished,
      });
      alert(res.message);
    }
    setShowArticleModal(false);
  };

  const handleDeleteArticle = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      const res = appStore.deleteArticle(id);
      alert(res.message);
    }
  };

  const handleToggleArticlePublish = (art: ArticleRecord) => {
    const res = appStore.updateArticle(art.id, { isPublished: !art.isPublished });
    alert(res.message);
  };

  // Promotion CMS Handlers
  const handleOpenAddPromo = () => {
    setEditingPromoId(null);
    setPromoTitle('');
    setPromoDiscountText('');
    setPromoValidUntil('31/12/2026');
    setPromoCode('UUDAI-2026');
    setPromoDesc('');
    setPromoBadge('Khuyến Mại Đặc Biệt');
    setPromoIsActive(true);
    setShowPromoModal(true);
  };

  const handleOpenEditPromo = (promo: PromotionBanner) => {
    setEditingPromoId(promo.id);
    setPromoTitle(promo.title);
    setPromoDiscountText(promo.discountText);
    setPromoValidUntil(promo.validUntil);
    setPromoCode(promo.code || '');
    setPromoDesc(promo.description);
    setPromoBadge(promo.badge || '');
    setPromoIsActive(promo.isActive);
    setShowPromoModal(true);
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim()) return;

    if (editingPromoId) {
      const res = appStore.updatePromotion(editingPromoId, {
        title: promoTitle,
        discountText: promoDiscountText,
        validUntil: promoValidUntil,
        code: promoCode,
        description: promoDesc,
        badge: promoBadge,
        isActive: promoIsActive,
      });
      alert(res.message);
    } else {
      const res = appStore.addPromotion({
        title: promoTitle,
        discountText: promoDiscountText,
        validUntil: promoValidUntil,
        code: promoCode,
        description: promoDesc,
        badge: promoBadge,
        isActive: promoIsActive,
      });
      alert(res.message);
    }
    setShowPromoModal(false);
  };

  const handleDeletePromo = (id: string) => {
    if (window.confirm('Xóa chương trình ưu đãi này?')) {
      const res = appStore.deletePromotion(id);
      alert(res.message);
    }
  };

  const handleTogglePromoActive = (p: PromotionBanner) => {
    const res = appStore.updatePromotion(p.id, { isActive: !p.isActive });
    alert(res.message);
  };

  // Theme & Feng Shui CMS Handlers
  const handleOpenAddTheme = () => {
    setEditingThemeId(null);
    setThemeName('');
    setThemeTitleEn('');
    setThemeService('dam_cuoi');
    setThemeDesc('');
    setThemeBadge('Mẫu Rạp Cưới 2026');
    setThemeSpecs('Khẩu độ rạp 6m - 18m • Đèn chùm pha lê • Thảm trải sàn cao cấp');
    setThemeImageUrl('/hero_backdrop.jpg');
    setThemeDetailImages('/hero_backdrop.jpg, /card_dam_cuoi.jpg');
    setThemeFengShuiElement('Mệnh Kim & Mệnh Thổ (Thổ sinh Kim)');
    setThemeFengShuiAges('Canh Thìn (2000), Tân Tỵ (2001), Mậu Dần (1998), Kỷ Mão (1999)');
    setThemeFengShuiMeaning('Sắc vàng ánh kim đại diện cho vinh hoa, tiền tài; màu trắng sữa tượng trưng cho sự thuần khiết.');
    setThemeFengShuiFlowers('Hoa hồng kem pastel, hoa lan hồ điệp trắng, tú cầu vàng champagne');
    setThemeIsActive(true);
    setShowThemeModal(true);
  };

  const handleOpenEditTheme = (th: ThemeModel) => {
    setEditingThemeId(th.id);
    setThemeName(th.name);
    setThemeTitleEn(th.titleEn || '');
    setThemeService(th.service || 'dam_cuoi');
    setThemeDesc(th.desc);
    setThemeBadge(th.badge || '');
    setThemeSpecs(th.specs);
    setThemeImageUrl(th.imageUrl);
    setThemeDetailImages((th.detailImages || []).join(', '));
    setThemeFengShuiElement(th.fengShuiElement);
    setThemeFengShuiAges(th.fengShuiAges);
    setThemeFengShuiMeaning(th.fengShuiMeaning);
    setThemeFengShuiFlowers(th.fengShuiFlowers);
    setThemeIsActive(th.isActive);
    setShowThemeModal(true);
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!themeName.trim()) return;

    const detailList = themeDetailImages
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingThemeId) {
      appStore.updateCmsTheme(editingThemeId, {
        name: themeName.trim(),
        titleEn: themeTitleEn.trim(),
        service: themeService,
        desc: themeDesc.trim(),
        badge: themeBadge.trim(),
        specs: themeSpecs.trim(),
        imageUrl: themeImageUrl.trim() || '/hero_backdrop.jpg',
        detailImages: detailList.length > 0 ? detailList : [themeImageUrl.trim() || '/hero_backdrop.jpg'],
        fengShuiElement: themeFengShuiElement.trim(),
        fengShuiAges: themeFengShuiAges.trim(),
        fengShuiMeaning: themeFengShuiMeaning.trim(),
        fengShuiFlowers: themeFengShuiFlowers.trim(),
        isActive: themeIsActive,
      });
      alert('Đã cập nhật mẫu rạp & tư vấn phong thủy thành công!');
    } else {
      appStore.addCmsTheme({
        name: themeName.trim(),
        titleEn: themeTitleEn.trim(),
        service: themeService,
        desc: themeDesc.trim(),
        badge: themeBadge.trim(),
        specs: themeSpecs.trim(),
        imageUrl: themeImageUrl.trim() || '/hero_backdrop.jpg',
        detailImages: detailList.length > 0 ? detailList : [themeImageUrl.trim() || '/hero_backdrop.jpg'],
        fengShuiElement: themeFengShuiElement.trim(),
        fengShuiAges: themeFengShuiAges.trim(),
        fengShuiMeaning: themeFengShuiMeaning.trim(),
        fengShuiFlowers: themeFengShuiFlowers.trim(),
        isActive: themeIsActive,
      });
      alert('Đã thêm mẫu rạp cưới mới vào hệ thống thành công!');
    }

    setCmsThemesList(appStore.getCmsThemes());
    setShowThemeModal(false);
  };

  const handleToggleThemeActive = (th: ThemeModel) => {
    appStore.updateCmsTheme(th.id, { isActive: !th.isActive });
    setCmsThemesList(appStore.getCmsThemes());
  };

  const handleDeleteTheme = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mẫu rạp này không?')) {
      appStore.deleteCmsTheme(id);
      setCmsThemesList(appStore.getCmsThemes());
    }
  };

  // Settings Handlers
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const res = appStore.updateCompanyInfo(settingsForm);
    setSettingsSavedAlert(true);
    setTimeout(() => setSettingsSavedAlert(false), 3000);
    alert(res.message);
  };

  return (
    <div className="min-h-screen bg-[#f4efe6] flex">
      
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR MENU (CHUẨN XÁC ẢNH 2)                    */}
      {/* ======================================================== */}
      <aside className="w-64 bg-[#fbfaf8] text-slate-700 flex flex-col shrink-0 border-r border-[#ece8df] shadow-xs select-none">
        
        {/* Brand Header có Logo Nhà Rạp Thái Đăng (Chuẩn Ảnh 2) */}
        <div className="pt-6 pb-4 px-4 text-center border-b border-[#ece8df]/60">
          <img 
            src="/logo_thai_dang.png" 
            alt="Nhà Rạp Thái Đăng" 
            className="h-16 mx-auto object-contain drop-shadow-2xs" 
          />
        </div>

        {/* 10 Menu Items chính xác theo Ảnh 2 */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 text-sm font-medium">
          
          {/* 1. Tổng quan */}
          <button
            onClick={() => setActiveMenu('dashboard')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'dashboard'
                ? 'bg-[#ffece7] text-[#e05638] font-bold shadow-2xs'
                : 'text-slate-700 hover:bg-stone-100/70 hover:text-slate-900'
            }`}
          >
            <Home className={`w-5 h-5 ${activeMenu === 'dashboard' ? 'text-[#e05638]' : 'text-slate-500'}`} />
            <span>Tổng quan</span>
          </button>

          {/* 2. Lịch sự kiện */}
          <button
            onClick={() => setActiveMenu('calendar')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'calendar'
                ? 'bg-[#ffece7] text-[#e05638] font-bold shadow-2xs'
                : 'text-slate-700 hover:bg-stone-100/70 hover:text-slate-900'
            }`}
          >
            <Calendar className={`w-5 h-5 ${activeMenu === 'calendar' ? 'text-[#e05638]' : 'text-slate-500'}`} />
            <span>Lịch sự kiện</span>
          </button>

          {/* 3. Sự kiện / Hợp đồng */}
          <button
            onClick={() => setActiveMenu('jobs')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'jobs'
                ? 'bg-[#ffece7] text-[#e05638] font-bold shadow-2xs'
                : 'text-slate-700 hover:bg-stone-100/70 hover:text-slate-900'
            }`}
          >
            <FileText className={`w-5 h-5 ${activeMenu === 'jobs' ? 'text-[#e05638]' : 'text-slate-500'}`} />
            <span>Sự kiện / Hợp đồng</span>
          </button>

          {/* 4. Khách hàng */}
          <button
            onClick={() => setActiveMenu('customers')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'customers'
                ? 'bg-[#ffece7] text-[#e05638] font-bold shadow-2xs'
                : 'text-slate-700 hover:bg-stone-100/70 hover:text-slate-900'
            }`}
          >
            <Briefcase className={`w-5 h-5 ${activeMenu === 'customers' ? 'text-[#e05638]' : 'text-slate-500'}`} />
            <span>Khách hàng</span>
          </button>

          {/* 5. Kho dụng cụ */}
          <button
            onClick={() => setActiveMenu('inventory')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'inventory'
                ? 'bg-[#ffece7] text-[#e05638] font-bold shadow-2xs'
                : 'text-slate-700 hover:bg-stone-100/70 hover:text-slate-900'
            }`}
          >
            <Boxes className={`w-5 h-5 ${activeMenu === 'inventory' ? 'text-[#e05638]' : 'text-slate-500'}`} />
            <span>Kho dụng cụ</span>
          </button>

          {/* 6. Doanh thu - Chi phí */}
          <button
            onClick={() => setActiveMenu('finance')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'finance'
                ? 'bg-[#ffece7] text-[#e05638] font-bold shadow-2xs'
                : 'text-slate-700 hover:bg-stone-100/70 hover:text-slate-900'
            }`}
          >
            <DollarSign className={`w-5 h-5 ${activeMenu === 'finance' ? 'text-[#e05638]' : 'text-slate-500'}`} />
            <span>Doanh thu - Chi phí</span>
          </button>

          {/* 7. Công nợ */}
          <button
            onClick={() => setActiveMenu('finance')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'finance' && false
                ? 'bg-[#ffece7] text-[#e05638] font-bold shadow-2xs'
                : 'text-slate-700 hover:bg-stone-100/70 hover:text-slate-900'
            }`}
          >
            <Coins className="w-5 h-5 text-slate-500" />
            <span>Công nợ</span>
          </button>

          {/* 8. Nhân sự */}
          <button
            onClick={() => setActiveMenu('staff')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'staff'
                ? 'bg-[#ffece7] text-[#e05638] font-bold shadow-2xs'
                : 'text-slate-700 hover:bg-stone-100/70 hover:text-slate-900'
            }`}
          >
            <Users className={`w-5 h-5 ${activeMenu === 'staff' ? 'text-[#e05638]' : 'text-slate-500'}`} />
            <span>Nhân sự</span>
          </button>

          {/* 9. Báo cáo */}
          <button
            onClick={() => setActiveMenu('finance')}
            className="w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-slate-700 hover:bg-stone-100/70 hover:text-slate-900 transition-all cursor-pointer"
          >
            <BarChart3 className="w-5 h-5 text-slate-500" />
            <span>Báo cáo</span>
          </button>

          {/* 10. Cấu hình (Bổ sung đầy đủ CMS: Chuyên mục, tin bài, banner, footer) */}
          <button
            onClick={() => setActiveMenu('settings')}
            className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all cursor-pointer ${
              activeMenu === 'settings'
                ? 'bg-[#ffece7] text-[#e05638] font-bold shadow-2xs'
                : 'text-slate-700 hover:bg-stone-100/70 hover:text-slate-900'
            }`}
          >
            <Settings className={`w-5 h-5 ${activeMenu === 'settings' ? 'text-[#e05638]' : 'text-slate-500'}`} />
            <span>Cấu hình</span>
          </button>

        </nav>

        {/* Địa chỉ cơ sở ở chân Sidebar (Chuẩn xác Ảnh 2) */}
        <div className="p-3 mx-3 mb-2 rounded-2xl bg-[#f5f3ee] border border-[#e8e4dc] text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
          <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="font-medium text-slate-800 leading-snug">
            Thôn Trực Đông,<br />
            xã Cổ Lễ, tỉnh Ninh Bình
          </div>
        </div>

        {/* Bottom Profile & Role Bar */}
        <div className="p-3 border-t border-[#ece8df] space-y-2 bg-[#f8f6f0]">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#0e4b44] text-white font-bold flex items-center justify-center text-xs">
                {currentUser.fullName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <div className="font-bold text-slate-800 truncate max-w-[110px]">{currentUser.fullName}</div>
                <div className="text-[10px] text-amber-700 font-medium truncate">{ROLE_LABELS[currentUser.role]}</div>
              </div>
            </div>

            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="p-1.5 rounded-lg bg-stone-200/80 hover:bg-stone-300 text-slate-700 text-xs"
              title="Đổi vai trò kiểm thử RBAC"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>

          {showRoleDropdown && (
            <div className="p-2 rounded-xl bg-white border border-stone-200 shadow-xl space-y-1 text-xs">
              <div className="text-[10px] font-bold text-slate-400 uppercase pb-1">Chuyển vai trò:</div>
              {MOCK_USERS.map(u => (
                <button
                  key={u.id}
                  onClick={() => handleSelectRoleInDropdown(u)}
                  className={`w-full text-left p-1.5 rounded-lg flex items-center justify-between ${
                    u.id === currentUser.id ? 'bg-[#ffece7] text-[#e05638] font-bold' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <span>{u.fullName}</span>
                  {u.id === currentUser.id && <Check className="w-3 h-3 text-[#e05638]" />}
                </button>
              ))}
            </div>
          )}

          <button
            onClick={onBackToCustomerSite}
            className="w-full py-2 px-3 rounded-xl bg-white hover:bg-stone-100 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 border border-[#e8e4dc] transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>Về Website Khách Hàng</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-2 border border-rose-200 transition-all cursor-pointer shadow-2xs"
            title="Đăng xuất khỏi hệ thống quản trị"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span>Đăng Xuất Quản Trị</span>
          </button>
        </div>

      </aside>

      {/* ======================================================== */}
      {/* 2. MAIN CONTENT WORKSPACE AREA                           */}
      {/* ======================================================== */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
        
        {/* Header trên thanh công cụ cho các mục khác ngoài dashboard */}
        {activeMenu !== 'dashboard' && (
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#e2d9cb]">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Hệ Thống Quản Trị</span>
                <span>/</span>
                <span className="font-bold text-slate-800 uppercase tracking-wider">{activeMenu}</span>
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mt-0.5">
                {activeMenu === 'intake' && 'Quản Lý Hồ Sơ Tiếp Nhận & Khảo Sát'}
                {activeMenu === 'jobs' && 'Sự Kiện / Hợp Đồng (Jobs & 7 Đầu Việc)'}
                {activeMenu === 'inventory' && 'Quản Lý Danh Mục Kho Thiết Bị'}
                {activeMenu === 'timeline' && 'Kiểm Tra Khả Dụng Thiết Bị Theo Giờ'}
                {activeMenu === 'calendar' && 'Lịch Biểu Sự Kiện & Điều Phối'}
                {activeMenu === 'finance' && 'Doanh Thu, Chi Phí, Báo Giá & Thu Cọc'}
                {activeMenu === 'customers' && 'Quản Lý Khách Hàng (Customer CRM)'}
                {activeMenu === 'staff' && 'Quản Lý Nhân Sự & Phân Quyền'}
                {activeMenu === 'audit' && 'Nhật Ký Hoạt Động & Kiểm Toán'}
                {activeMenu === 'settings' && 'Cấu Hình Hệ Thống & Quản Trị CMS'}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-xl bg-white border border-[#ede8de] text-xs font-semibold text-slate-700 shadow-2xs">
                Múi giờ: <strong>Asia/Ho_Chi_Minh</strong>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Khôi phục lại dữ liệu mẫu ban đầu?')) {
                    appStore.resetToDefaultSeed();
                    alert('Đã khôi phục dữ liệu mẫu thành công!');
                  }
                }}
                className="p-2 rounded-xl bg-white border border-[#ede8de] hover:bg-amber-50 text-slate-600 hover:text-amber-800 transition-colors"
                title="Khôi phục dữ liệu mẫu ban đầu"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                title="Đăng xuất khỏi hệ thống quản trị"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-600" />
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        )}

        {/* --- MODULE 1: DASHBOARD (CHUẨN XÁC ẢNH 2) --- */}
        {activeMenu === 'dashboard' && (
          <div className="space-y-6">
            
            {/* 1. Header Lời chào & Nút Tạo sự kiện (Chuẩn Ảnh 2) */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight">
                  Xin chào, anh Thái
                </h1>
                <div className="w-12 h-1 bg-[#c59239] rounded-full mt-2 mb-1" />
                <p className="text-xs text-slate-500 font-medium">
                  Đây là tình hình hoạt động Nhà rạp Thái Đăng hôm nay.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-4 py-2.5 rounded-xl bg-white border border-[#e5e7eb] text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Thứ Hai, 12 tháng 10 năm 2025</span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveMenu('jobs')}
                  className="px-5 py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#093530] text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo sự kiện</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  title="Đăng xuất khỏi hệ thống quản trị"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            </div>

            {/* 2. 4 Stat KPI Cards (Chuẩn Ảnh 2) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Sự kiện đã nhận tháng này */}
              <div className="bg-white rounded-2xl p-5 border border-[#ece7de] shadow-xs flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1 z-10">
                  <span className="text-xs text-slate-500 font-medium">Sự kiện đã nhận tháng này</span>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">08</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#ffece7] text-[#e05638] flex items-center justify-center shrink-0 z-10">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-24 h-12 bg-gradient-to-t from-rose-100/40 to-transparent rounded-full blur-md" />
              </div>

              {/* Card 2: Sự kiện đã nhận tháng tới */}
              <div className="bg-white rounded-2xl p-5 border border-[#ece7de] shadow-xs flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1 z-10">
                  <span className="text-xs text-slate-500 font-medium">Sự kiện đã nhận tháng tới</span>
                  <div className="flex items-baseline gap-3">
                    <div className="text-3xl font-extrabold text-slate-900 tracking-tight">12</div>
                    <div className="flex items-end gap-1 h-5 pb-0.5">
                      <span className="w-1.5 h-2 bg-emerald-300 rounded-xs" />
                      <span className="w-1.5 h-3 bg-emerald-400 rounded-xs" />
                      <span className="w-1.5 h-4 bg-emerald-500 rounded-xs" />
                    </div>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#ebf8f2] text-[#10b981] flex items-center justify-center shrink-0 z-10">
                  <CalendarDays className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-24 h-12 bg-gradient-to-t from-emerald-100/40 to-transparent rounded-full blur-md" />
              </div>

              {/* Card 3: Tiền đã thu tháng này */}
              <div className="bg-white rounded-2xl p-5 border border-[#ece7de] shadow-xs flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1 z-10">
                  <span className="text-xs text-slate-500 font-medium">Tiền đã thu tháng này</span>
                  <div className="text-2xl font-extrabold text-slate-900 tracking-tight">35.000.000 đ</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#fef8e7] text-[#f59e0b] flex items-center justify-center shrink-0 z-10">
                  <Coins className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-24 h-12 bg-gradient-to-t from-amber-100/40 to-transparent rounded-full blur-md" />
              </div>

              {/* Card 4: Cảnh báo cần xử lý */}
              <div className="bg-white rounded-2xl p-5 border border-[#ece7de] shadow-xs flex items-center justify-between relative overflow-hidden">
                <div className="space-y-1 z-10">
                  <span className="text-xs text-slate-500 font-medium">Cảnh báo cần xử lý</span>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">02</div>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-[#fef2f2] text-[#ef4444] flex items-center justify-center shrink-0 z-10">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-24 h-12 bg-gradient-to-t from-rose-100/40 to-transparent rounded-full blur-md" />
              </div>

            </div>

            {/* 3. Bố cục 2 Cột: Bảng Sự kiện Tháng này (Trái) & 3 Widget Cột Phải (Chuẩn Ảnh 2) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* CỘT TRÁI (8/12): Lịch sự kiện tháng này (Chuẩn Ảnh 2) */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-[#ece7de] p-6 shadow-xs space-y-4">
                
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-slate-700">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        Lịch sự kiện tháng này
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Chỉ hiển thị các sự kiện đã xác nhận (đã ký hợp đồng hoặc đặt cọc).
                      </p>
                    </div>
                  </div>

                  {/* Nút lùi/tiến tháng */}
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700">
                    <button className="hover:text-slate-900 cursor-pointer">&lt;</button>
                    <span>Tháng 10 năm 2025</span>
                    <button className="hover:text-slate-900 cursor-pointer">&gt;</button>
                  </div>
                </div>

                {/* Bảng Danh sách Sự kiện 8 dòng Chuẩn Ảnh 2 */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-3">Ngày</th>
                        <th className="py-2.5 px-3">Khách hàng</th>
                        <th className="py-2.5 px-3">Loại sự kiện</th>
                        <th className="py-2.5 px-3">Địa điểm</th>
                        <th className="py-2.5 px-3">Trạng thái</th>
                        <th className="py-2.5 px-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { date: '04/10 (T7)', name: 'Anh Nam', type: 'Tiệc cưới', loc: 'xã Cổ Lễ, Ninh Bình', status: 'da_hoan_thanh', statusLabel: 'Đã hoàn thành', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        { date: '07/10 (T3)', name: 'Chị Hương', type: 'Lễ ăn hỏi', loc: 'TP Ninh Bình', status: 'da_hoan_thanh', statusLabel: 'Đã hoàn thành', badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
                        { date: '12/10 (CN)', name: 'Anh Tuấn', type: 'Tiệc cưới', loc: 'xã Cổ Lễ, Ninh Bình', status: 'dang_thuc_hien', statusLabel: 'Đang thực hiện', badgeColor: 'bg-blue-50 text-blue-700 border-blue-200', isToday: true },
                        { date: '18/10 (T7)', name: 'Chị Mai', type: 'Tiệc cưới', loc: 'huyện Yên Mô', status: 'sap_dien_ra', statusLabel: 'Sắp diễn ra', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
                        { date: '22/10 (T4)', name: 'Anh Dũng', type: 'Lễ ăn hỏi', loc: 'TP Hoa Lư', status: 'sap_dien_ra', statusLabel: 'Sắp diễn ra', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
                        { date: '26/10 (CN)', name: 'Chị Lan', type: 'Tiệc cưới', loc: 'xã Gia Viễn', status: 'sap_dien_ra', statusLabel: 'Sắp diễn ra', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
                        { date: '29/10 (T4)', name: 'Cô Thu', type: 'Tiệc cưới', loc: 'huyện Nho Quan', status: 'sap_dien_ra', statusLabel: 'Sắp diễn ra', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
                        { date: '31/10 (T6)', name: 'Anh Long', type: 'Lễ ăn hỏi', loc: 'huyện Kim Sơn', status: 'sap_dien_ra', statusLabel: 'Sắp diễn ra', badgeColor: 'bg-amber-50 text-amber-700 border-amber-200' },
                      ].map((item, idx) => (
                        <tr 
                          key={idx} 
                          className={`hover:bg-stone-50/80 transition-colors ${
                            item.isToday ? 'bg-blue-50/40 font-bold' : ''
                          }`}
                        >
                          <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                            {item.date}
                          </td>
                          <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                            {item.name}
                          </td>
                          <td className="py-3 px-3 text-slate-700 whitespace-nowrap">
                            {item.type}
                          </td>
                          <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                            {item.loc}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${item.badgeColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                item.status === 'da_hoan_thanh' ? 'bg-emerald-600' : item.status === 'dang_thuc_hien' ? 'bg-blue-600' : 'bg-amber-600'
                              }`} />
                              <span>{item.statusLabel}</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            <button className="hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Chú thích & Nút xem tất cả */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="text-slate-400 italic text-[11px]">
                    ⓘ Số liệu minh hoạ phục vụ thiết kế giao diện, không phải số liệu thực tế.
                  </div>
                  <button
                    onClick={() => setActiveMenu('calendar')}
                    className="font-bold text-slate-700 hover:text-[#e05638] flex items-center gap-1 transition-colors"
                  >
                    <span>Xem tất cả sự kiện tháng này</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* CỘT PHẢI (4/12): 3 Widget Thống Kê & Nhắc Việc (Chuẩn Ảnh 2) */}
              <div className="lg:col-span-4 space-y-4">
                
                {/* WIDGET 1: CÔNG NỢ CÒN LẠI (Chuẩn Ảnh 2) */}
                <div className="bg-white rounded-3xl border border-[#ece7de] p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <Coins className="w-4 h-4 text-amber-600" />
                      <span>Công nợ còn lại</span>
                    </div>
                    <button 
                      onClick={() => setActiveMenu('finance')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-0.5"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div>
                    <div className="text-2xl font-extrabold text-[#d93025] tracking-tight">
                      40.000.000 đ
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">của 5 khách hàng</p>
                  </div>

                  <div className="space-y-2 pt-1 text-xs divide-y divide-slate-100">
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Anh Tuấn (12/10)</span>
                      </span>
                      <strong className="text-slate-900 font-bold">20.000.000 đ</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1.5">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Chị Mai (18/10)</span>
                      </span>
                      <strong className="text-slate-900 font-bold">8.000.000 đ</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1.5">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Anh Dũng (22/10)</span>
                      </span>
                      <strong className="text-slate-900 font-bold">7.000.000 đ</strong>
                    </div>
                    <div className="flex items-center justify-between pt-1.5">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <span className="text-slate-400">···</span>
                        <span>Khác (2 khách)</span>
                      </span>
                      <strong className="text-slate-700 font-semibold">5.000.000 đ</strong>
                    </div>
                  </div>
                </div>

                {/* WIDGET 2: NHẮC VIỆC HÔM NAY (Chuẩn Ảnh 2) */}
                <div className="bg-white rounded-3xl border border-[#ece7de] p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <Bell className="w-4 h-4 text-rose-500" />
                      <span>Nhắc việc hôm nay</span>
                    </div>
                    <button 
                      onClick={() => setActiveMenu('jobs')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-0.5"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    {[
                      { id: 'TASK-1', time: '08:00', title: 'Liên hệ khách Anh Tuấn xác nhận giờ lắp rạp', done: true },
                      { id: 'TASK-2', time: '10:00', title: 'Kiểm tra xe vận chuyển, xếp hàng', done: true },
                      { id: 'TASK-3', time: '14:00', title: 'Chuẩn bị bản hợp đồng cho Chị Mai', done: false },
                      { id: 'TASK-4', time: '16:00', title: 'Liên hệ nhà bạt dự phòng', done: false },
                    ].map(task => (
                      <div key={task.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <input 
                            type="checkbox" 
                            defaultChecked={task.done} 
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer" 
                          />
                          <span className="font-mono text-slate-400 text-[11px] whitespace-nowrap">{task.time}</span>
                          <span className={`text-[12px] leading-tight ${task.done ? 'text-slate-600' : 'font-semibold text-slate-900'}`}>
                            {task.title}
                          </span>
                        </div>
                        <span className="text-slate-300">···</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* WIDGET 3: CẢNH BÁO KHO (Chuẩn Ảnh 2) */}
                <div className="bg-white rounded-3xl border border-[#ece7de] p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                      <Boxes className="w-4 h-4 text-rose-600" />
                      <span>Cảnh báo kho</span>
                    </div>
                    <button 
                      onClick={() => setActiveMenu('inventory')}
                      className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-0.5"
                    >
                      <span>Xem tất cả</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="space-y-3 text-xs">
                    {/* Cảnh báo ghế inox (Có hình ảnh thumbnail ghế inox cắt chuẩn từ Ảnh 2) */}
                    <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-rose-50/50 border border-rose-100">
                      <div className="flex items-center gap-3">
                        <img 
                          src="/thumb_ghe_inox.png" 
                          alt="Ghế inox" 
                          className="w-10 h-10 object-contain rounded-lg bg-white p-1 border border-stone-200" 
                        />
                        <div>
                          <div className="font-extrabold text-[#d93025] text-xs">Thiếu 20 ghế inox</div>
                          <div className="text-[11px] text-slate-500">cho lịch ngày mai (13/10)</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                        <span className="text-slate-400 text-xs">···</span>
                      </div>
                    </div>

                    {/* Cảnh báo bạt trắng 10m */}
                    <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-amber-50/50 border border-amber-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                          BẠT
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 text-xs">Bạt trắng 10m: chỉ còn 1 bộ</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                        <span className="text-slate-400 text-xs">···</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* --- MODULE 2: HỒ SƠ TIẾP NHẬN & KHẢO SÁT --- */}
        {activeMenu === 'intake' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#ede8de]">
              <div className="flex items-center gap-3 text-xs">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="font-bold text-slate-700">Lọc trạng thái:</span>
                <select
                  value={intakeStatusFilter}
                  onChange={(e) => setIntakeStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-semibold text-xs"
                >
                  <option value="all">Tất cả ({intakes.length})</option>
                  <option value="moi_gui">Mới gửi</option>
                  <option value="dang_lien_he">Đang liên hệ</option>
                  <option value="da_hen_khao_sat">Đã hẹn khảo sát</option>
                  <option value="da_khao_sat">Đã khảo sát</option>
                  <option value="cho_xac_nhan">Chờ xác nhận</option>
                  <option value="da_xac_nhan">Đã xác nhận (Job)</option>
                </select>
              </div>

              <div className="text-xs text-slate-500">
                Quyền thực thi: <strong>{ROLE_LABELS[currentUser.role]}</strong>
              </div>
            </div>

            <div className="space-y-3">
              {intakes
                .filter(i => intakeStatusFilter === 'all' || i.status === intakeStatusFilter)
                .map(intake => {
                  const dupCount = getPhoneDuplicateCount(intake.customerPhone, intake.id);
                  return (
                    <div key={intake.id} className="p-5 rounded-3xl bg-white border border-[#ede8de] shadow-xs space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[#b8860b]">{intake.code}</span>
                          <h4 className="font-bold text-slate-900 text-sm">{intake.customerName}</h4>
                          <span className="text-xs text-slate-500">({intake.customerPhone})</span>
                          {dupCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                              ⚠️ Khách có {dupCount} đám khác
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            intake.status === 'da_xac_nhan' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : intake.status === 'da_khao_sat'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {intake.status.replace(/_/g, ' ')}
                          </span>
                          {intake.confirmedJobId && (
                            <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-200">
                              Job: {intake.confirmedJobId}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                        <div>
                          <strong>Địa chỉ:</strong> {intake.eventAddress}
                          {intake.survey?.roadNote && (
                            <div className="text-[11px] text-slate-500 italic mt-0.5">
                              Khảo sát đường: {intake.survey.roadNote}
                            </div>
                          )}
                        </div>
                        <div>
                          <strong>Thời gian tiệc:</strong> {new Date(intake.eventDateStart).toLocaleString('vi-VN')}
                          <div className="text-[11px] text-amber-800 mt-0.5">
                            Chiếm dụng kho: {new Date(intake.setupDateStart).toLocaleDateString('vi-VN')} → {new Date(intake.teardownDateEnd).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        <div>
                          <strong>Cấu hình bàn ghế:</strong>
                          <ul className="list-disc list-inside mt-0.5 text-slate-700">
                            {intake.tableChairConfigs.map((cfg, idx) => (
                              <li key={idx}>
                                {cfg.area}: {cfg.tableCount} bàn • {cfg.tableCount * cfg.chairsPerTable} {cfg.chairType === 'ghe_inox' ? 'ghế inox' : 'ghế nhựa đỏ'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                        <span className="text-slate-400">Nguồn: <strong>{intake.source}</strong></span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenSurvey(intake)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                          >
                            {intake.survey ? '✏️ Sửa khảo sát' : '📐 Khảo sát mặt bằng'}
                          </button>
                          {intake.status !== 'da_xac_nhan' && (
                            <button
                              type="button"
                              onClick={() => handleOpenConfirmModal(intake)}
                              className="px-3.5 py-1.5 rounded-xl gold-gradient text-[#161c2b] font-bold shadow-xs flex items-center gap-1"
                            >
                              <span>Xác nhận Job & Giữ kho</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* --- MODULE 3: JOBS & 7 ĐẦU VIỆC CHUẨN --- */}
        {activeMenu === 'jobs' && (
          <div className="space-y-5">
            {jobs.map(job => (
              <div key={job.id} className="p-6 rounded-3xl bg-white border border-[#ede8de] shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-base text-indigo-700">{job.code}</span>
                      <h4 className="font-bold text-slate-900 text-base">{job.customerName}</h4>
                      <span className="text-xs text-slate-500">({job.customerPhone})</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {job.serviceType.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Địa điểm: <strong>{job.eventAddress}</strong> • Tiệc chính: {new Date(job.eventDateStart).toLocaleString('vi-VN')}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      job.status === 'da_hoan_thanh' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {job.status.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                      job.isInventoryReturned 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {job.isInventoryReturned ? '✓ Đã trả đủ kho' : '⏳ Chưa kiểm tra trả kho'}
                    </span>
                  </div>
                </div>

                {/* 7 Đầu Việc */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                    Tiến độ 7 Đầu việc chuẩn:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
                    {job.tasks.map((task, idx) => {
                      const isDone = task.status === 'hoan_thanh';
                      return (
                        <div
                          key={task.id}
                          className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                            isDone ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between font-bold mb-1">
                              <span>#{idx + 1} {task.taskType}</span>
                              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                            </div>
                            <p className="text-[11px] text-slate-600 leading-tight mb-2">{task.title}</p>
                          </div>
                          <div className="pt-2 border-t border-slate-200/60">
                            <span className="text-[10px] text-slate-500 block truncate">{task.assignedPersonOrTeam}</span>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase">{task.status.replace(/_/g, ' ')}</span>
                              {!isDone && (
                                <button
                                  type="button"
                                  onClick={() => appStore.updateTaskStatus(job.id, task.id, 'hoan_thanh')}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                                >
                                  Xong
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Hàng nút nghiệp vụ */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="text-slate-500">
                    Snapshot định mức: {job.itemsSnapshot?.map(i => `${i.itemName} (${i.quantity} ${i.unit})`).join(', ')}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDispatch(job.id)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1 shadow-xs"
                      title="Xuất thiết bị lên xe tải (không trừ kho 2 lần)"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Xuất kho lên xe</span>
                    </button>

                    {!job.isInventoryReturned && (
                      <button
                        type="button"
                        onClick={() => handleReturn(job.id)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shadow-xs"
                      >
                        <Boxes className="w-3.5 h-3.5" />
                        <span>Kiểm tra trả dụng cụ</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenPayment(job.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold flex items-center gap-1"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Thu tiền / Cọc</span>
                    </button>

                    {job.status !== 'da_huy' && (
                      <button
                        type="button"
                        onClick={() => handleCancelJob(job.id)}
                        className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold"
                      >
                        Hủy Job
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- MODULE 4: KHO & THIẾT BỊ --- */}
        {activeMenu === 'inventory' && (
          <div className="bg-white rounded-3xl border border-[#ede8de] overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Danh Mục Thiết Bị Kho & Tình Trạng Vật Lý</h3>
              <span className="text-xs text-slate-500">Tổng {catalog.length} chủng loại</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mã</th>
                    <th className="py-3 px-4">Tên Thiết Bị</th>
                    <th className="py-3 px-4">ĐVT</th>
                    <th className="py-3 px-4 text-center">Tổng Sở Hữu</th>
                    <th className="py-3 px-4 text-center">Đang Sửa Chữa</th>
                    <th className="py-3 px-4 text-center">Đang Giữ (Held)</th>
                    <th className="py-3 px-4 text-center">Tại Công Trình (Dispatched)</th>
                    <th className="py-3 px-4 text-center">Sẵn Sàng Tại Kho</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {catalog.map(item => {
                    const heldCount = reservations.filter(r => r.itemCode === item.code && r.status === 'held').reduce((s, r) => s + r.requestedQuantity, 0);
                    const dispatchedCount = reservations.filter(r => r.itemCode === item.code && r.status === 'dispatched').reduce((s, r) => s + r.requestedQuantity, 0);
                    const inWarehouseNow = Math.max(0, item.totalOwnedQuantity - item.inRepairQuantity - dispatchedCount);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{item.code}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{item.name}</td>
                        <td className="py-3 px-4 text-slate-500">{item.unit}</td>
                        <td className="py-3 px-4 text-center font-bold">{item.totalOwnedQuantity}</td>
                        <td className="py-3 px-4 text-center text-amber-600 font-bold">{item.inRepairQuantity > 0 ? `${item.inRepairQuantity} (Đang sửa)` : '0'}</td>
                        <td className="py-3 px-4 text-center text-blue-600 font-bold">{heldCount}</td>
                        <td className="py-3 px-4 text-center text-indigo-600 font-bold">{dispatchedCount}</td>
                        <td className="py-3 px-4 text-center font-bold text-emerald-700 bg-emerald-50/50">{inWarehouseNow}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- MODULE 5: TIMELINE AVAILABILITY CHECKER --- */}
        {activeMenu === 'timeline' && (
          <div className="p-6 rounded-3xl bg-white border border-[#ede8de] shadow-xs space-y-5">
            <div>
              <h3 className="text-xl font-bold text-stone-900">
                Công Cụ Kiểm Tra Khả Dụng Dụng Cụ Theo Khoảng Thời Gian
              </h3>
              <p className="text-xs text-slate-500">
                Tự động tính toán trùng lịch với các Job khác, cộng thời gian vệ sinh luân chuyển (turnaround) và phát hiện thiếu hụt.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mã dụng cụ kiểm tra:</label>
                <select
                  value={timelineItemCode}
                  onChange={(e) => setTimelineItemCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold bg-white"
                >
                  {catalog.map(item => (
                    <option key={item.code} value={item.code}>{item.name} ({item.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Từ ngày giờ:</label>
                <input
                  type="datetime-local"
                  value={timelineStart}
                  onChange={(e) => setTimelineStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Đến ngày giờ:</label>
                <input
                  type="datetime-local"
                  value={timelineEnd}
                  onChange={(e) => setTimelineEnd(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                />
              </div>
            </div>

            {timelineResult && (
              <div className={`p-5 rounded-2xl border text-xs space-y-2 ${
                timelineResult.status === 'thieu'
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : timelineResult.status === 'sat_nguong'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-950'
              }`}>
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>Trạng thái: {
                    timelineResult.status === 'thieu' ? '🔴 THIẾU HỤT THIẾT BỊ' :
                    timelineResult.status === 'sat_nguong' ? '🟡 SÁT NGƯỠNG DỰ PHÒNG AN TOÀN' :
                    '🟢 ĐỦ KHẢ NĂNG ĐÁP ỨNG'
                  }</span>
                  <span className="font-mono text-xs">
                    Còn lại khả dụng: <strong>{timelineResult.remainingAfterThisJob} {timelineResult.itemCode}</strong>
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/60">
                  <div>Sở hữu: <strong>{timelineResult.totalOwned}</strong></div>
                  <div>Đang sửa: <strong>{timelineResult.inRepair}</strong></div>
                  <div>Sức chứa vật lý: <strong>{timelineResult.netPhysicalCapacity}</strong></div>
                  <div>Job khác đang giữ: <strong>{timelineResult.alreadyReservedOtherJobs}</strong></div>
                </div>
                {timelineResult.conflictingJobCodes.length > 0 && (
                  <div className="text-[11px] pt-1">
                    Các Job đang chiếm dụng trùng thời gian này: <strong>{timelineResult.conflictingJobCodes.join(', ')}</strong>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* --- MODULE 6: LỊCH BIỂU --- */}
        {activeMenu === 'calendar' && (
          <div className="p-6 rounded-3xl bg-white border border-[#ede8de] shadow-xs space-y-4">
            <h3 className="text-xl font-bold text-stone-900">
              Lịch Biểu Điều Phối (Múi giờ Asia/Ho_Chi_Minh)
            </h3>
            <div className="space-y-3">
              {jobs.map(job => (
                <div key={job.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span className="font-mono text-indigo-700">{job.code} - {job.customerName}</span>
                    <span className="text-slate-500">{new Date(job.eventDateStart).toLocaleString('vi-VN')}</span>
                  </div>
                  <div className="text-slate-600">Địa chỉ: {job.eventAddress}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200">
                    <div><strong>Chiếm dụng thiết bị:</strong> {new Date(job.equipmentUsageStart).toLocaleString('vi-VN')} → {new Date(job.equipmentUsageEnd).toLocaleString('vi-VN')}</div>
                    <div><strong>Đội thi công:</strong> Đội thi công rạp Thái Đăng</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MODULE 7: TÀI CHÍNH & THU TIỀN --- */}
        {activeMenu === 'finance' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl card-luxury">
                <span className="text-xs text-slate-500 font-bold uppercase">Tổng giá trị báo giá</span>
                <span className="text-2xl font-bold text-stone-900 mt-1 block">
                  {quotes.reduce((s, q) => s + q.finalAmountVND, 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="p-5 rounded-2xl card-luxury">
                <span className="text-xs text-slate-500 font-bold uppercase">Tiền cọc & Thực thu</span>
                <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                  {payments.reduce((s, p) => s + p.amountVND, 0).toLocaleString('vi-VN')} đ
                </span>
              </div>
              <div className="p-5 rounded-2xl card-luxury">
                <span className="text-xs text-slate-500 font-bold uppercase">Công nợ còn lại</span>
                <span className="text-2xl font-bold text-rose-700 mt-1 block">
                  {Math.max(0, quotes.reduce((s, q) => s + q.finalAmountVND, 0) - payments.reduce((s, p) => s + p.amountVND, 0)).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Lịch Sử Phiếu Thu & Tiền Cọc</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Số Phiếu</th>
                      <th className="py-3 px-4">Job</th>
                      <th className="py-3 px-4">Loại Thu</th>
                      <th className="py-3 px-4">Phương Thức</th>
                      <th className="py-3 px-4">Số Tiền (VNĐ)</th>
                      <th className="py-3 px-4">Người Lập</th>
                      <th className="py-3 px-4">Ngày Thu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{p.receiptNumber}</td>
                        <td className="py-3 px-4 font-mono text-indigo-700">{p.jobId}</td>
                        <td className="py-3 px-4 font-semibold uppercase">{p.paymentType.replace(/_/g, ' ')}</td>
                        <td className="py-3 px-4 text-slate-600">{p.paymentMethod === 'chuyen_khoan' ? 'Chuyển khoản' : 'Tiền mặt'}</td>
                        <td className="py-3 px-4 font-extrabold text-emerald-600">{p.amountVND.toLocaleString('vi-VN')} đ</td>
                        <td className="py-3 px-4 text-slate-600">{p.recordedBy}</td>
                        <td className="py-3 px-4 text-slate-500">{new Date(p.paymentDate).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- MODULE 8: QUẢN LÝ KHÁCH HÀNG (CUSTOMER CRM) --- */}
        {activeMenu === 'customers' && (
          <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  Danh Bạ Khách Hàng (Customer CRM)
                </h3>
                <p className="text-xs text-slate-500">
                  Quản lý thông tin liên hệ, phân loại khách VIP và lịch sử đặt tiệc.
                </p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc số điện thoại..."
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mã KH</th>
                    <th className="py-3 px-4">Họ và Tên</th>
                    <th className="py-3 px-4">Số Điện Thoại</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Địa Chỉ</th>
                    <th className="py-3 px-4 text-center">Số Tiệc Đã Đặt</th>
                    <th className="py-3 px-4 text-center">Phân Loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers
                    .filter(c => 
                      !customerSearchQuery || 
                      c.fullName.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
                      c.phone.includes(customerSearchQuery)
                    )
                    .map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">{c.id}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">{c.fullName}</td>
                        <td className="py-3 px-4 font-mono text-slate-700">{c.phone}</td>
                        <td className="py-3 px-4 text-slate-500">{c.email || '—'}</td>
                        <td className="py-3 px-4 text-slate-600">{c.address || '—'}</td>
                        <td className="py-3 px-4 text-center font-bold text-slate-800">{c.totalBookings}</td>
                        <td className="py-3 px-4 text-center">
                          {c.isVip ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                              VIP Gold
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 uppercase">
                              Khách thường
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- MODULE 9: TÀI KHOẢN NHÂN VIÊN & PHÂN QUYỀN (STAFF & RBAC) --- */}
        {activeMenu === 'staff' && (
          <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  Quản Lý Tài Khoản Quản Trị & Phân Quyền (RBAC)
                </h3>
                <p className="text-xs text-slate-500">
                  Cấp tài khoản cho các bộ phận (Chủ đơn vị, Quản lý, Tư vấn, Kho, Kế toán, Nhân viên hiện trường).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStaffModal(true)}
                className="px-4 py-2 rounded-xl gold-gradient text-[#121722] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md"
              >
                <UserPlus className="w-4 h-4" />
                <span>Thêm Nhân Viên Mới</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Mã NV</th>
                    <th className="py-3 px-4">Họ và Tên</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Số Điện Thoại</th>
                    <th className="py-3 px-4">Vai Trò Phân Quyền</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                    <th className="py-3 px-4 text-center">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {staffMembers.map(staff => (
                    <tr key={staff.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{staff.id}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{staff.fullName}</td>
                      <td className="py-3 px-4 text-slate-600">{staff.email}</td>
                      <td className="py-3 px-4 font-mono text-slate-700">{staff.phone || '—'}</td>
                      <td className="py-3 px-4">
                        <select
                          value={staff.role}
                          onChange={(e) => handleChangeRole(staff.id, e.target.value as UserRole)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                        >
                          <option value="chu_don_vi">Chủ đơn vị (Toàn quyền)</option>
                          <option value="quan_ly">Quản lý điều hành</option>
                          <option value="tu_van">Tư vấn & Sale</option>
                          <option value="kho">Thủ kho & Kỹ thuật</option>
                          <option value="ke_toan">Kế toán & Thu ngân</option>
                          <option value="nhan_vien_thuc_hien">Nhân viên hiện trường</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          staff.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {staff.isActive ? 'Đang hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStaff(staff.id)}
                          className="p-1 rounded-lg hover:bg-slate-200 text-slate-600"
                          title={staff.isActive ? 'Khóa tài khoản' : 'Mở khóa'}
                        >
                          {staff.isActive ? <Lock className="w-4 h-4 text-slate-500" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- MODULE 10: NHẬT KÝ KIỂM TOÁN (AUDIT LOGS) --- */}
        {activeMenu === 'audit' && (
          <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Nhật Ký Thao Tác Hệ Thống (Audit Trail)</h3>
            <div className="space-y-2">
              {auditLogs.map(log => (
                <div key={log.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#b8860b]">{log.action}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold">
                        {log.userRole}
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">[{log.entityType}: {log.entityId}]</span>
                    </div>
                    <p className="text-slate-700">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MODULE 11: QUẢN TRỊ TIN BÀI & CẨM NĂNG (CMS) --- */}
        {activeMenu === 'articles' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#ede8de] shadow-xs">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#b8860b]" />
                  Quản Trị Tin Bài & Cẩm Nang Quảng Bá
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Đăng tải bài viết giới thiệu không gian tiệc, kinh nghiệm tổ chức đám cưới, xu hướng rạp cưới cao cấp.
                </p>
              </div>
              <button
                onClick={handleOpenAddArticle}
                className="px-4 py-2.5 rounded-xl gold-gradient text-[#121722] font-bold text-xs flex items-center gap-2 shadow-md hover:scale-102 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>Soạn Tin Bài Mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((art) => (
                <div key={art.id} className="bg-white rounded-3xl border border-[#ede8de] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all group">
                  <div>
                    <div className="h-44 relative overflow-hidden bg-slate-100">
                      {art.imageUrl ? (
                        <img
                          src={art.imageUrl}
                          alt={art.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">Không có ảnh</div>
                      )}
                      <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${
                        art.isPublished ? 'bg-emerald-600/90 text-white' : 'bg-slate-700/90 text-slate-200'
                      }`}>
                        {art.isPublished ? 'Đang Hiển Thị' : 'Bản Nháp (Ẩn)'}
                      </span>
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#121722]/80 text-[#dfba73] backdrop-blur-md">
                        {art.category === 'xu_huong_rap' ? 'Xu hướng rạp' : art.category === 'kinh_nghiem_cuoi' ? 'Kinh nghiệm' : art.category === 'du_an_thuc_te' ? 'Dự án thực tế' : 'Ưu đãi'}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium">
                        <span>Tác giả: <strong className="text-slate-600">{art.author}</strong></span>
                        <span>•</span>
                        <span>{art.viewCount} lượt xem</span>
                        <span>•</span>
                        <span>{new Date(art.publishedAt).toLocaleDateString('vi-VN')}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-[#b8860b] transition-colors">
                        {art.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {art.summary}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleToggleArticlePublish(art)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        art.isPublished
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                          : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                      }`}
                      title={art.isPublished ? 'Ẩn khỏi trang khách hàng' : 'Xuất bản ra trang khách hàng'}
                    >
                      {art.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      <span>{art.isPublished ? 'Ẩn' : 'Hiện'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditArticle(art)}
                        className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Edit className="w-3.5 h-3.5 text-blue-600" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(art.id)}
                        className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 shadow-xs"
                        title="Xóa bài viết"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MODULE 12: QUẢN TRỊ ƯU ĐÃI & KHUYẾN MẠI (CMS) --- */}
        {activeMenu === 'promotions' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#ede8de] shadow-xs">
              <div>
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Tag className="w-5 h-5 text-[#b8860b]" />
                  Quản Trị Ưu Đãi & Banner Khuyến Mại
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cấu hình các gói ưu đãi, voucher chiết khấu tiệc cưới hiển thị trực quan trên cổng thông tin khách hàng.
                </p>
              </div>
              <button
                onClick={handleOpenAddPromo}
                className="px-4 py-2.5 rounded-xl gold-gradient text-[#121722] font-bold text-xs flex items-center gap-2 shadow-md hover:scale-102 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm Ưu Đãi Mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className={`rounded-3xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                    promo.isActive
                      ? 'bg-gradient-to-br from-white via-[#fffdf9] to-[#faf6ee] text-slate-800 border-[#e2d5bd]'
                      : 'bg-slate-100/90 text-slate-500 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        promo.isActive ? 'bg-[#c5a059] text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {promo.badge || 'Khuyến mại'}
                      </span>
                      <span className={`text-xs font-semibold ${promo.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                        {promo.isActive ? '● Đang hiển thị trên web' : '○ Tạm ẩn'}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between gap-4">
                      <h4 className={`text-xl font-bold ${promo.isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                        {promo.title}
                      </h4>
                      <span className="font-bold text-lg text-[#b8860b] whitespace-nowrap">
                        {promo.discountText}
                      </span>
                    </div>

                    <p className={`text-xs leading-relaxed ${promo.isActive ? 'text-slate-600' : 'text-slate-500'}`}>
                      {promo.description}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                      {promo.code && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-mono text-[#b8860b] font-bold">
                          <span>MÃ:</span>
                          <span className="tracking-wider">{promo.code}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hạn áp dụng: {promo.validUntil}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                    <button
                      onClick={() => handleTogglePromoActive(promo)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        promo.isActive
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                      }`}
                    >
                      {promo.isActive ? 'Tạm Ẩn' : 'Kích Hoạt'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditPromo(promo)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Chỉnh Sửa</span>
                      </button>
                      <button
                        onClick={() => handleDeletePromo(promo.id)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                        title="Xóa khuyến mại"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- MODULE 10: CẤU HÌNH CMS TOÀN DIỆN & TÀI KHOẢN PHÂN QUYỀN --- */}
        {activeMenu === 'settings' && (
          <div className="space-y-6">
            
            {/* Header Module Cấu hình */}
            <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-xl flex items-center gap-2.5">
                  <Settings className="w-6 h-6 text-[#e05638]" />
                  <span>Cấu Hình CMS & Quản Trị Hệ Thống</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Quản lý chuyên mục, tin bài quảng bá, ảnh liên kết, banner trang chủ, thông tin chân trang và phân quyền tài khoản quản trị.
                </p>
              </div>

              {/* Sub-tab Navigation */}
              <div className="flex flex-wrap items-center gap-1.5 bg-[#f6f3ee] p-1.5 rounded-2xl border border-[#e8e4dc]">
                <button
                  onClick={() => setSettingsTab('mau_rap')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settingsTab === 'mau_rap'
                      ? 'bg-white text-[#e05638] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mẫu rạp & Phong thủy ({cmsThemesList.length})
                </button>
                <button
                  onClick={() => setSettingsTab('uu_dai')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settingsTab === 'uu_dai'
                      ? 'bg-white text-[#e05638] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ưu đãi & Khuyến mại ({promotions.length})
                </button>
                <button
                  onClick={() => setSettingsTab('chuyen_muc')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settingsTab === 'chuyen_muc'
                      ? 'bg-white text-[#e05638] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chuyên mục
                </button>
                <button
                  onClick={() => setSettingsTab('tin_bai')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settingsTab === 'tin_bai'
                      ? 'bg-white text-[#e05638] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tin bài ({articles.length})
                </button>
                <button
                  onClick={() => setSettingsTab('anh_lien_ket')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settingsTab === 'anh_lien_ket'
                      ? 'bg-white text-[#e05638] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ảnh liên kết ({cmsPartnerPhotosList.length})
                </button>
                <button
                  onClick={() => setSettingsTab('banner')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settingsTab === 'banner'
                      ? 'bg-white text-[#e05638] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Banner & Slide ({cmsBannerSlidesList.length})
                </button>
                <button
                  onClick={() => setSettingsTab('footer')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settingsTab === 'footer'
                      ? 'bg-white text-[#e05638] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Chân trang & Liên hệ
                </button>
                <button
                  onClick={() => setSettingsTab('tai_khoan')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    settingsTab === 'tai_khoan'
                      ? 'bg-[#ffece7] text-[#e05638] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tài khoản & Phân quyền
                </button>
              </div>
            </div>

            {/* TAB: MẪU RẠP & TƯ VẤN PHONG THỦY */}
            {settingsTab === 'mau_rap' && (
              <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[#c5a059]" />
                      <span>Quản Lý Mẫu Rạp Cưới & Tư Vấn Phong Thủy Bản Mệnh</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cấu hình mẫu rạp, bộ ảnh chụp thực tế, bản mệnh tương sinh và năm sinh cô dâu chú rể đại cát hiển thị trên website.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddTheme}
                    className="px-4 py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Mẫu Rạp Mới</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cmsThemesList.map((th) => (
                    <div
                      key={th.id}
                      className="rounded-3xl border border-slate-200 bg-[#fbfaf8] hover:border-[#c5a059] transition-all overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md group"
                    >
                      <div>
                        {/* Photo Preview & Badges */}
                        <div className="relative h-48 overflow-hidden bg-stone-100">
                          <img
                            src={th.imageUrl}
                            alt={th.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/hero_backdrop.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#c5a059] text-white shadow-xs">
                            {th.badge || 'Mẫu Rạp'}
                          </span>
                          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md ${
                            th.isActive ? 'bg-emerald-600/90 text-white' : 'bg-slate-700/90 text-slate-200'
                          }`}>
                            {th.isActive ? 'Đang Hiển Thị' : 'Tạm Ẩn'}
                          </span>
                          <div className="absolute bottom-3 left-3 right-3 text-white">
                            <p className="text-[10px] uppercase font-mono tracking-wider text-amber-200 truncate">
                              {th.titleEn}
                            </p>
                            <h5 className="font-bold text-sm text-white drop-shadow-sm truncate">
                              {th.name}
                            </h5>
                          </div>
                        </div>

                        {/* Content & Specs */}
                        <div className="p-5 space-y-3.5">
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {th.desc}
                          </p>

                          <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100 font-medium">
                            <strong>Thông số:</strong> {th.specs}
                          </div>

                          {/* Phong thủy & Tuổi tác hợp mệnh */}
                          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2 text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-amber-950">
                              <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0" />
                              <span>{th.fengShuiElement}</span>
                            </div>
                            <div className="text-[11px] text-amber-900 leading-snug">
                              <strong>Tuổi đại cát:</strong> {th.fengShuiAges}
                            </div>
                            <div className="text-[11px] text-slate-600 line-clamp-2 leading-snug">
                              <strong>Ý nghĩa:</strong> {th.fengShuiMeaning}
                            </div>
                            {th.fengShuiFlowers && (
                              <div className="text-[10px] text-slate-500 pt-1 border-t border-amber-200/50">
                                🌸 <em>Hoa phối:</em> {th.fengShuiFlowers}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleToggleThemeActive(th)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            th.isActive
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          }`}
                        >
                          {th.isActive ? 'Tạm Ẩn' : 'Kích Hoạt'}
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditTheme(th)}
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-600" />
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={() => handleDeleteTheme(th.id)}
                            className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 shadow-2xs cursor-pointer"
                            title="Xóa mẫu rạp"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: ƯU ĐÃI & KHUYẾN MẠI TONE TRẮNG SÁNG */}
            {settingsTab === 'uu_dai' && (
              <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Tag className="w-5 h-5 text-[#c5a059]" />
                      <span>Cấu Hình Ưu Đãi & Khuyến Mại (Tone Trắng Sáng)</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tùy chỉnh các gói khuyến mại, voucher chiết khấu tiệc cưới hiển thị đồng bộ tone sáng sang trọng trên website.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddPromo}
                    className="px-4 py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Ưu Đãi Mới</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {promotions.map((promo) => (
                    <div
                      key={promo.id}
                      className={`rounded-3xl p-6 border transition-all relative overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
                        promo.isActive
                          ? 'bg-gradient-to-br from-white via-[#fffdf9] to-[#faf6ee] text-slate-800 border-[#e2d5bd]'
                          : 'bg-slate-100/90 text-slate-500 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            promo.isActive ? 'bg-[#c5a059] text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {promo.badge || 'Khuyến mại'}
                          </span>
                          <span className={`text-xs font-semibold ${promo.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                            {promo.isActive ? '● Đang hiển thị trên web' : '○ Tạm ẩn'}
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between gap-4">
                          <h4 className={`text-xl font-bold ${promo.isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                            {promo.title}
                          </h4>
                          <span className="font-bold text-lg text-[#b8860b] whitespace-nowrap">
                            {promo.discountText}
                          </span>
                        </div>

                        <p className={`text-xs leading-relaxed ${promo.isActive ? 'text-slate-600' : 'text-slate-500'}`}>
                          {promo.description}
                        </p>

                        <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                          {promo.code && (
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 font-mono text-[#b8860b] font-bold">
                              <span>MÃ:</span>
                              <span className="tracking-wider">{promo.code}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-[11px] text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Hạn áp dụng: {promo.validUntil}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
                        <button
                          onClick={() => handleTogglePromoActive(promo)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            promo.isActive
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          }`}
                        >
                          {promo.isActive ? 'Tạm Ẩn' : 'Kích Hoạt'}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditPromo(promo)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Chỉnh Sửa</span>
                          </button>
                          <button
                            onClick={() => handleDeletePromo(promo.id)}
                            className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                            title="Xóa khuyến mại"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 1: CHUYÊN MỤC CMS */}
            {settingsTab === 'chuyen_muc' && (
              <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Danh Sách Chuyên Mục Dịch Vụ & Tin Tức</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Phân loại hiển thị bài viết và mẫu rạp trên website cổng thông tin</p>
                  </div>
                  <button
                    onClick={handleOpenAddCategory}
                    className="px-4 py-2 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Chuyên Mục Mới</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cmsCategoriesList.map((cat) => (
                    <div key={cat.id} className="p-4 rounded-2xl border border-slate-200 bg-[#fbfaf8] hover:border-[#c5a059] transition-all space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            /{cat.slug}
                          </span>
                          <h5 className="font-bold text-slate-900 text-sm mt-1">{cat.name}</h5>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {cat.isActive ? 'Đang kích hoạt' : 'Tạm ẩn'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{cat.description}</p>
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-600 text-[11px]">{cat.itemCount} bài / mục</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleToggleCategoryActive(cat.id, cat.isActive)}
                            className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                          >
                            {cat.isActive ? 'Ẩn' : 'Hiện'}
                          </button>
                          <button
                            onClick={() => handleOpenEditCategory(cat)}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                            title="Sửa"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TIN BÀI CMS */}
            {settingsTab === 'tin_bai' && (
              <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Quản Lý Tin Bài & Cẩm Nang Sự Kiện</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Biên tập các bài viết chia sẻ kinh nghiệm cưới hỏi, xu hướng rạp và thực đơn</p>
                  </div>
                  <button
                    onClick={handleOpenAddArticle}
                    className="px-4 py-2 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Viết Bài Mới</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold">
                        <th className="py-3 px-3">Hình ảnh & Tiêu đề</th>
                        <th className="py-3 px-3">Chuyên mục</th>
                        <th className="py-3 px-3">Tác giả</th>
                        <th className="py-3 px-3 text-center">Lượt xem</th>
                        <th className="py-3 px-3 text-center">Trạng thái</th>
                        <th className="py-3 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {articles.map((art) => (
                        <tr key={art.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-3 max-w-sm">
                            <div className="flex items-center gap-3">
                              {art.imageUrl && (
                                <img src={art.imageUrl} alt="" className="w-12 h-10 rounded-lg object-cover shrink-0" />
                              )}
                              <div>
                                <span className="font-bold text-slate-900 line-clamp-1">{art.title}</span>
                                <span className="text-[11px] text-slate-600 line-clamp-1">{art.summary}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-bold text-[10px]">
                              {art.category === 'xu_huong_rap' ? 'Xu hướng rạp' :
                               art.category === 'kinh_nghiem_cuoi' ? 'Kinh nghiệm cưới' :
                               art.category === 'thuc_don_co' ? 'Thực đơn cỗ' : 'Giới thiệu'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-600">{art.author}</td>
                          <td className="py-3 px-3 text-center font-semibold text-slate-700">{art.views.toLocaleString()}</td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => handleToggleArticlePublish(art)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ${
                                art.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {art.isPublished ? 'Công khai' : 'Bản nháp'}
                            </button>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditArticle(art)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteArticle(art.id)}
                                className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                                title="Xóa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 3: ẢNH LIÊN KẾT CMS */}
            {settingsTab === 'anh_lien_ket' && (
              <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Quản Lý Thư Viện Ảnh Liên Kết & Đối Tác</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Hình ảnh thực tế rạp cưới, hoa tươi, bàn ghế hiển thị trên các khối album quảng bá</p>
                  </div>
                  <button
                    onClick={handleOpenAddPhoto}
                    className="px-4 py-2 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Ảnh Liên Kết Mới</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cmsPartnerPhotosList.map((photo) => (
                    <div key={photo.id} className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 aspect-4/3">
                      <img src={photo.imageUrl} alt={photo.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent p-3 flex flex-col justify-end text-white">
                        <span className="text-[10px] font-bold text-amber-400 uppercase">{photo.category}</span>
                        <h6 className="font-bold text-xs line-clamp-1">{photo.title}</h6>
                        <p className="text-[10px] text-slate-300 line-clamp-1">{photo.caption}</p>
                      </div>
                      <button
                        onClick={() => handleDeletePhoto(photo.id)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white/80 hover:text-rose-400 hover:bg-black/80 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: BANNER & SLIDE TRANG CHỦ CMS */}
            {settingsTab === 'banner' && (
              <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Banner Hero & Slide Trình Diễn Trang Chủ</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Các slide hình ảnh tự động trình diễn mượt mà ngoài trang chủ với các dấu chấm mờ điều hướng</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {cmsBannerSlidesList.map((slide, idx) => (
                    <div key={slide.id} className="p-4 rounded-2xl border border-slate-200 bg-[#fbfaf8] flex flex-wrap md:flex-nowrap items-center gap-5">
                      <div className="w-32 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-300 bg-slate-900 relative">
                        <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/70 text-[9px] font-bold text-white">
                          #{idx + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#e05638] text-[11px]">{slide.slideNumber}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            slide.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {slide.isActive ? 'Hiển thị' : 'Tắt'}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm">{slide.title}</h5>
                        <p className="text-slate-600 line-clamp-1">{slide.subtitle}</p>
                        <div className="text-[11px] text-slate-600 flex items-center gap-3 pt-1">
                          <span>Nút 1: <strong className="text-slate-700">{slide.ctaText1}</strong></span>
                          <span>•</span>
                          <span>Nút 2: <strong className="text-slate-700">{slide.ctaText2}</strong></span>
                          <span>•</span>
                          <span>{slide.locationTag}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleToggleBannerActive(slide)}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                        >
                          {slide.isActive ? 'Ẩn Slide' : 'Bật Slide'}
                        </button>
                        <button
                          onClick={() => handleOpenEditBanner(slide)}
                          className="px-3 py-1.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Chỉnh Sửa</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: CHÂN TRANG & THÔNG TIN CHUNG (FOOTER) */}
            {settingsTab === 'footer' && (
              <div className="bg-white rounded-3xl border border-[#ede8de] p-8 shadow-xs max-w-4xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-[#b8860b]" />
                      Thông Tin Chân Trang, Hotline & Địa Chỉ Cơ Sở
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Cập nhật địa chỉ, số hotline, giờ làm việc và liên kết mạng xã hội hiển thị tại trang chủ, trang liên hệ và chân trang (Footer).
                    </p>
                  </div>
                  <a
                    href={settingsForm.facebookFanpage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 border border-blue-200 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Mở Fanpage Thử Nghiệm</span>
                  </a>
                </div>

                {settingsSavedAlert && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Đã lưu thành công! Thông tin chân trang và thương hiệu đã được cập nhật toàn hệ thống.</span>
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Tên thương hiệu đơn vị</label>
                      <input
                        type="text"
                        value={settingsForm.companyName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, companyName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Slogan thương hiệu</label>
                      <input
                        type="text"
                        value={settingsForm.slogan}
                        onChange={(e) => setSettingsForm({ ...settingsForm, slogan: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5 text-rose-600 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        Hotline Tư Vấn Chính (Đầu trang & Chân trang) *
                      </label>
                      <input
                        type="text"
                        value={settingsForm.hotline}
                        onChange={(e) => setSettingsForm({ ...settingsForm, hotline: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-rose-200 font-bold text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Số điện thoại phụ / Điều hành kho</label>
                      <input
                        type="text"
                        value={settingsForm.secondaryPhone || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, secondaryPhone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1.5">Email tiếp nhận liên hệ</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                        required
                      />
                    </div>
                  </div>

                  {/* Địa chỉ cơ sở chính - Theo yêu cầu chuẩn xác của chủ rạp */}
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
                    <label className="block font-bold text-slate-800 text-xs flex items-center gap-1.5 text-amber-900">
                      <MapPin className="w-4 h-4 text-[#e05638]" />
                      Địa chỉ cơ sở chính thức (Hiển thị toàn bộ website, liên hệ và footer):
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-slate-900 bg-white"
                      required
                    />
                    <p className="text-[11px] text-amber-800">
                      Giá trị chuẩn: &ldquo;Nhà rạp Thái Đăng, Thôn Trực Đông, xã Cổ Lễ, tỉnh Ninh Bình&rdquo;
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Thời gian phục vụ & tư vấn</label>
                      <input
                        type="text"
                        value={settingsForm.workingHours}
                        onChange={(e) => setSettingsForm({ ...settingsForm, workingHours: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Link Google Maps (Chỉ đường kho rạp)</label>
                      <input
                        type="url"
                        value={settingsForm.googleMapsUrl || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, googleMapsUrl: e.target.value })}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-medium"
                      />
                    </div>
                  </div>

                  {/* Nhóm Kênh Mạng Xã Hội */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h5 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      Kênh Mạng Xã Hội & Fanpage Chính Thức
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-blue-700">Link Facebook Fanpage</label>
                        <input
                          type="url"
                          value={settingsForm.facebookFanpage}
                          onChange={(e) => setSettingsForm({ ...settingsForm, facebookFanpage: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-blue-200 bg-white font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-cyan-700">Link Zalo Official / Tư Vấn Chat</label>
                        <input
                          type="url"
                          value={settingsForm.zaloChat}
                          onChange={(e) => setSettingsForm({ ...settingsForm, zaloChat: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-cyan-200 bg-white font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-slate-800">Kênh TikTok (Video dự án)</label>
                        <input
                          type="url"
                          value={settingsForm.tiktokUrl || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, tiktokUrl: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-red-600">Kênh YouTube (Phim tiệc cưới)</label>
                        <input
                          type="url"
                          value={settingsForm.youtubeUrl || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold shadow-md hover:scale-102 transition-transform text-xs cursor-pointer"
                    >
                      Lưu Thông Tin Chân Trang & Áp Dụng
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 6: TÀI KHOẢN & PHÂN QUYỀN (RBAC) */}
            {settingsTab === 'tai_khoan' && (
              <div className="space-y-6">
                
                {/* Banner Tài Khoản Admin Mặc Định */}
                <div className="p-5 rounded-3xl bg-linear-to-r from-[#ffece7] to-[#fff7ed] border border-[#fbd3c7] flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#e05638] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">Tài Khoản Admin Toàn Quyền Mặc Định</h4>
                        <span className="px-2 py-0.5 rounded-md bg-[#e05638] text-white text-[10px] font-bold">Chủ đơn vị</span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Tên đăng nhập: <strong className="font-mono text-slate-900 bg-white px-1.5 py-0.5 rounded border border-rose-200">admin</strong> &nbsp;|&nbsp; 
                        Mật khẩu: <strong className="font-mono text-slate-900 bg-white px-1.5 py-0.5 rounded border border-rose-200">123456</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setNewStaffRole('chu_don_vi');
                        setShowAddStaffModal(true);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>+ Thêm Tài Khoản Mới</span>
                    </button>
                  </div>
                </div>

                {/* Danh Sách Tài Khoản & Phân Quyền */}
                <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Danh Sách Tài Khoản Quản Trị & Nhân Sự ({staffMembers.length})</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Phân quyền theo vai trò: Chủ đơn vị, Quản lý điều hành, Thủ kho, Kế toán, Tư vấn, Thi công</p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold">
                          <th className="py-3 px-3">Tài khoản & Họ tên</th>
                          <th className="py-3 px-3">Tên đăng nhập</th>
                          <th className="py-3 px-3">Mật khẩu</th>
                          <th className="py-3 px-3">Liên hệ</th>
                          <th className="py-3 px-3">Vai trò phân quyền</th>
                          <th className="py-3 px-3 text-center">Trạng thái</th>
                          <th className="py-3 px-3 text-right">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {staffMembers.map((staff) => (
                          <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                                  {staff.fullName.charAt(0)}
                                </div>
                                <div>
                                  <span className="font-bold text-slate-900 block">{staff.fullName}</span>
                                  <span className="text-[10px] text-slate-600 font-mono">{staff.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                                {(staff as any).username || staff.email.split('@')[0]}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                                {(staff as any).password || '123456'}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              <div>{staff.phone}</div>
                              <div className="text-[10px] text-slate-600">{staff.email}</div>
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={staff.role}
                                onChange={(e) => handleChangeRole(staff.id, e.target.value as UserRole)}
                                className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                                  staff.role === 'chu_don_vi' ? 'bg-[#ffece7] text-[#e05638] border-[#fbd3c7]' :
                                  staff.role === 'quan_ly' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                  staff.role === 'kho' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  staff.role === 'ke_toan' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  'bg-slate-100 text-slate-700 border-slate-200'
                                }`}
                              >
                                <option value="chu_don_vi">Chủ đơn vị (Admin)</option>
                                <option value="quan_ly">Quản lý điều hành</option>
                                <option value="tu_van">Tư vấn & Chăm sóc</option>
                                <option value="kho">Thủ kho thiết bị</option>
                                <option value="ke_toan">Kế toán</option>
                                <option value="nhan_vien_thuc_hien">Nhân viên hiện trường</option>
                              </select>
                            </td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => handleToggleStaff(staff.id)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer ${
                                  staff.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {staff.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                              </button>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  appStore.setCurrentUser(staff);
                                  alert(`Đã chuyển phiên đăng nhập sang: ${staff.fullName} (${ROLE_LABELS[staff.role]})`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 text-[11px] font-bold cursor-pointer"
                              >
                                Đăng nhập tài khoản này
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* --- MODAL 1: KHẢO SÁT MẶT BẰNG --- */}
      {showSurveyModal && selectedIntake && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Khảo Sát Mặt Bằng: {selectedIntake.code}</h3>
              <button onClick={() => setShowSurveyModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveSurvey} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kích thước mặt bằng (dài x rộng):</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Sân rộng 10m x 20m, ngõ 4m"
                  value={surveyGroundSize}
                  onChange={(e) => setSurveyGroundSize(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú đường xe tải & Nguồn điện:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Ví dụ: Xe tải 2.5T vào tận sân, có nguồn điện 3 pha..."
                  value={surveyRoadNote}
                  onChange={(e) => setSurveyRoadNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                ></textarea>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowSurveyModal(false)} className="px-4 py-2 rounded-xl border border-slate-200">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl gold-gradient text-[#121722] font-bold">Lưu Khảo Sát</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 2: XÁC NHẬN HỒ SƠ THÀNH JOB --- */}
      {showConfirmModal && selectedIntake && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Xác Nhận Hồ Sơ Thành Job & Giữ Kho</h3>
                <span className="font-mono text-slate-500">{selectedIntake.code}</span>
              </div>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div>Khách hàng: <strong>{selectedIntake.customerName}</strong> ({selectedIntake.customerPhone})</div>
                <div>Địa chỉ: {selectedIntake.eventAddress}</div>
                <div>Chiếm dụng kho: {new Date(selectedIntake.setupDateStart).toLocaleDateString('vi-VN')} → {new Date(selectedIntake.teardownDateEnd).toLocaleDateString('vi-VN')}</div>
              </div>
              {selectedIntake.status !== 'da_khao_sat' && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1 text-amber-950">
                  <span className="font-bold block">⚠️ Hồ sơ chưa qua khảo sát thực tế</span>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold">
                    <input
                      type="checkbox"
                      checked={skipSurveyChecked}
                      onChange={(e) => setSkipSurveyChecked(e.target.checked)}
                      className="rounded text-[#c5a059]"
                    />
                    <span>Bỏ qua khảo sát (Đã có đủ địa chỉ và thông số chi tiết)</span>
                  </label>
                </div>
              )}
              <p className="text-slate-600">
                Thao tác này kiểm tra kho theo khoảng thời gian thực, sinh 7 đầu việc tiêu chuẩn và giữ dụng cụ nguyên tử (Idempotent).
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button type="button" onClick={() => setShowConfirmModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 font-bold">Hủy</button>
              <button type="button" onClick={handleExecuteConfirm} className="px-5 py-2 rounded-xl gold-gradient text-[#121722] font-bold shadow-md">Xác Nhận Tạo Job Ngay</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 3: THU TIỀN / CỌC --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Lập Phiếu Thu Cho Job: {paymentTargetJobId}</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Loại thu:</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="tien_coc">Tiền cọc giữ ngày</option>
                  <option value="thanh_toan_dot">Thanh toán đợt</option>
                  <option value="quyet_toan">Quyết toán hợp đồng</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Số tiền (VNĐ):</label>
                <input
                  type="number"
                  min="100000"
                  step="100000"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-emerald-700 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Hình thức thanh toán:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="chuyen_khoan">Chuyển khoản</option>
                  <option value="tien_mat">Tiền mặt</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 font-bold">Đóng</button>
                <button type="submit" className="px-4 py-2 rounded-xl gold-gradient text-[#121722] font-bold shadow-md">Lưu Phiếu Thu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4: THÊM TÀI KHOẢN MỚI & PHÂN QUYỀN --- */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Thêm Tài Khoản Quản Trị & Phân Quyền</h3>
              <button onClick={() => setShowAddStaffModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Họ và tên nhân sự *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Thái"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên đăng nhập *</label>
                  <input
                    type="text"
                    required
                    placeholder="admin2 / thaidang"
                    value={newStaffUsername}
                    onChange={(e) => setNewStaffUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mật khẩu ban đầu *</label>
                  <input
                    type="text"
                    required
                    placeholder="123456"
                    value={newStaffPassword}
                    onChange={(e) => setNewStaffPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="nhanvien@thaidang.vn"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  placeholder="0988..."
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Vai trò phân quyền (RBAC) *</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="chu_don_vi">Chủ đơn vị (Toàn quyền Admin)</option>
                  <option value="quan_ly">Quản lý điều hành</option>
                  <option value="tu_van">Tư vấn & Chăm sóc khách</option>
                  <option value="kho">Thủ kho thiết bị</option>
                  <option value="ke_toan">Kế toán</option>
                  <option value="nhan_vien_thuc_hien">Nhân viên hiện trường</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddStaffModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#0e4b44] text-white font-bold shadow-md cursor-pointer">Tạo Tài Khoản</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4B: THÊM / SỬA CHUYÊN MỤC CMS --- */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">{editingCatId ? 'Chỉnh Sửa Chuyên Mục' : 'Thêm Chuyên Mục Mới'}</h3>
              <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên chuyên mục *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lễ Cưới Hoàng Gia"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Đường dẫn Slug (URL tĩnh)</label>
                <input
                  type="text"
                  placeholder="le-cuoi-hoang-gia"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả tóm tắt</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả danh mục hiển thị..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCatModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#0e4b44] text-white font-bold shadow-md cursor-pointer">Lưu Chuyên Mục</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4C: THÊM ẢNH LIÊN KẾT CMS --- */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Thêm Ảnh Liên Kết / Album Mới</h3>
              <button onClick={() => setShowPhotoModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSavePhoto} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề ảnh *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Rạp cưới tone trắng vàng tại Gia Viễn"
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chuyên mục ảnh</label>
                <select
                  value={photoCategory}
                  onChange={(e) => setPhotoCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Rạp Cưới">Rạp Cưới</option>
                  <option value="Lễ Ăn Hỏi">Lễ Ăn Hỏi</option>
                  <option value="Nhà Mới">Nhà Mới</option>
                  <option value="Bàn Ghế">Bàn Ghế</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Hình ảnh *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chú thích ảnh</label>
                <input
                  type="text"
                  placeholder="Ghi chú chi tiết cho ảnh..."
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowPhotoModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#0e4b44] text-white font-bold shadow-md cursor-pointer">Thêm Ảnh</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 4D: CHỈNH SỬA BANNER SLIDE CMS --- */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Chỉnh Sửa Banner Slide Hero</h3>
              <button onClick={() => setShowBannerModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSaveBanner} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề lớn (Headline) *</label>
                <input
                  type="text"
                  required
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Phụ đề mô tả</label>
                <input
                  type="text"
                  value={bannerSubtitle}
                  onChange={(e) => setBannerSubtitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Thẻ địa điểm / Tag</label>
                <input
                  type="text"
                  value={bannerTag}
                  onChange={(e) => setBannerTag(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Ảnh nền Banner</label>
                <input
                  type="url"
                  required
                  value={bannerImgUrl}
                  onChange={(e) => setBannerImgUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nút bấm 1 (Chính)</label>
                  <input
                    type="text"
                    value={bannerCta1}
                    onChange={(e) => setBannerCta1(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nút bấm 2 (Phụ)</label>
                  <input
                    type="text"
                    value={bannerCta2}
                    onChange={(e) => setBannerCta2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowBannerModal(false)} className="px-4 py-2 rounded-xl border border-slate-200 font-bold cursor-pointer">Hủy</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-[#0e4b44] text-white font-bold shadow-md cursor-pointer">Lưu Banner Slide</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 5: THÊM / SỬA BÀI VIẾT (CMS) --- */}
      {showArticleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingArticleId ? 'Chỉnh Sửa Bài Viết Cẩm Nang' : 'Soạn Thảo Bài Viết Mới'}
              </h3>
              <button onClick={() => setShowArticleModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArticle} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề bài viết *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Xu Hướng Nhà Rạp Cưới Hoàng Gia Sang Trọng Năm 2026"
                  value={articleTitle}
                  onChange={(e) => setArticleTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chuyên mục bài viết *</label>
                  <select
                    value={articleCategory}
                    onChange={(e) => setArticleCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="xu_huong_rap">Xu hướng rạp tiệc</option>
                    <option value="kinh_nghiem_cuoi">Kinh nghiệm cưới</option>
                    <option value="du_an_thuc_te">Dự án thực tế</option>
                    <option value="khuyen_mai">Ưu đãi & Sự kiện</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tác giả biên tập</label>
                  <input
                    type="text"
                    value={articleAuthor}
                    onChange={(e) => setArticleAuthor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">URL Hình ảnh bìa bài viết</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={articleImageUrl}
                  onChange={(e) => setArticleImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Đoạn tóm tắt mở đầu (Hiển thị ngoài danh sách) *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Mô tả súc tích giới thiệu điểm nhấn của bài viết..."
                  value={articleSummary}
                  onChange={(e) => setArticleSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung chi tiết bài viết *</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Nhập toàn văn nội dung bài viết chia sẻ kinh nghiệm, thông số, dịch vụ..."
                  value={articleContent}
                  onChange={(e) => setArticleContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-sans leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="artPublished"
                  checked={articleIsPublished}
                  onChange={(e) => setArticleIsPublished(e.target.checked)}
                  className="rounded text-[#c5a059] focus:ring-[#c5a059] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="artPublished" className="font-bold text-slate-800 cursor-pointer">
                  Xuất bản công khai ngay lên Website khách hàng
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowArticleModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl gold-gradient text-[#121722] font-bold shadow-md hover:scale-102 transition-transform"
                >
                  {editingArticleId ? 'Cập Nhật Bài Viết' : 'Lưu & Đăng Bài'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL 6: THÊM / SỬA ƯU ĐÃI (CMS) --- */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingPromoId ? 'Chỉnh Sửa Ưu Đãi' : 'Tạo Chương Trình Ưu Đãi Mới'}
              </h3>
              <button onClick={() => setShowPromoModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên chương trình ưu đãi *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Gói Cưới Hoàng Gia Mùa Thu 2026"
                  value={promoTitle}
                  onChange={(e) => setPromoTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức ưu đãi / Quà tặng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Giảm 15% trọn gói"
                    value={promoDiscountText}
                    onChange={(e) => setPromoDiscountText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tag / Huy hiệu nổi bật</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: ƯU ĐÃI ĐỘC QUYỀN"
                    value={promoBadge}
                    onChange={(e) => setPromoBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã khuyến mại (Coupon)</label>
                  <input
                    type="text"
                    placeholder="CUOI-2026"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn áp dụng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 31/12/2026"
                    value={promoValidUntil}
                    onChange={(e) => setPromoValidUntil(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả điều kiện & chi tiết ưu đãi *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Áp dụng cho hợp đồng ký kết trong tháng, từ 30 bàn trở lên..."
                  value={promoDesc}
                  onChange={(e) => setPromoDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="promoActiveCheck"
                  checked={promoIsActive}
                  onChange={(e) => setPromoIsActive(e.target.checked)}
                  className="rounded text-[#c5a059] focus:ring-[#c5a059] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="promoActiveCheck" className="font-bold text-slate-800 cursor-pointer">
                  Kích hoạt hiển thị ngay trên Website khách hàng
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl gold-gradient text-[#121722] font-bold shadow-md hover:scale-102 transition-transform"
                >
                  {editingPromoId ? 'Cập Nhật Ưu Đãi' : 'Tạo Ưu Đãi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA MẪU RẠP & TƯ VẤN PHONG THỦY */}
      {showThemeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#c5a059]" />
                <span>{editingThemeId ? 'Chỉnh Sửa Mẫu Rạp & Phong Thủy' : 'Thêm Mẫu Rạp Cưới Mới'}</span>
              </h3>
              <button 
                onClick={() => setShowThemeModal(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTheme} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên mẫu rạp *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Tone Trắng Vàng Hoàng Gia"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tên tiếng Anh / Phong cách</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Royal Ivory & Champagne Gold"
                    value={themeTitleEn}
                    onChange={(e) => setThemeTitleEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại sự kiện *</label>
                  <select
                    value={themeService}
                    onChange={(e) => setThemeService(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold bg-white"
                  >
                    <option value="dam_cuoi">Hỷ Sự / Đám Cưới</option>
                    <option value="dam_hoi">Lễ Ăn Hỏi Gia Tiên</option>
                    <option value="nha_moi">Tân Gia Nhà Mới</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Huy hiệu nổi bật (Badge)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: BỘ SƯU TẬP NỔI BẬT NHẤT"
                    value={themeBadge}
                    onChange={(e) => setThemeBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thông số kỹ thuật rạp *</label>
                <input
                  type="text"
                  required
                  placeholder="Khẩu độ rạp 6m - 18m • Đèn chùm pha lê • Thảm trải sàn cao cấp"
                  value={themeSpecs}
                  onChange={(e) => setThemeSpecs(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả chi tiết không gian tiệc *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Mô tả không gian, chất liệu vải rèm lụa, hệ thống đèn chiếu sáng..."
                  value={themeDesc}
                  onChange={(e) => setThemeDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">URL ảnh đại diện mẫu *</label>
                  <input
                    type="text"
                    required
                    placeholder="/hero_backdrop.jpg hoặc link URL ảnh"
                    value={themeImageUrl}
                    onChange={(e) => setThemeImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bộ ảnh chi tiết (cách nhau dấu phẩy)</label>
                  <input
                    type="text"
                    placeholder="/hero_backdrop.jpg, /card_dam_cuoi.jpg"
                    value={themeDetailImages}
                    onChange={(e) => setThemeDetailImages(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* KHỐI TƯ VẤN PHONG THỦY BẢN MỆNH */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                <h5 className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-[#c5a059]" />
                  <span>Cấu Hình Tư Vấn Phong Thủy & Tuổi Tác Hợp Mệnh</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Bản mệnh ngũ hành tương sinh *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mệnh Kim & Mệnh Thổ (Thổ sinh Kim)"
                      value={themeFengShuiElement}
                      onChange={(e) => setThemeFengShuiElement(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-amber-900 mb-1">Gợi ý hoa tươi phối kèm</label>
                    <input
                      type="text"
                      placeholder="Lan hồ điệp trắng, hồng kem pastel..."
                      value={themeFengShuiFlowers}
                      onChange={(e) => setThemeFengShuiFlowers(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-amber-900 mb-1">Năm sinh cô dâu chú rể đại cát (Thiên can - Địa chi) *</label>
                  <input
                    type="text"
                    required
                    placeholder="Canh Thìn (2000), Tân Tỵ (2001), Mậu Dần (1998), Kỷ Mão (1999)..."
                    value={themeFengShuiAges}
                    onChange={(e) => setThemeFengShuiAges(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-amber-900 mb-1">Ý nghĩa phong thủy & tài lộc gia đạo *</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ý nghĩa màu sắc đem lại hòa thuận phu thê, tài lộc hanh thông..."
                    value={themeFengShuiMeaning}
                    onChange={(e) => setThemeFengShuiMeaning(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="themeActiveCheck"
                  checked={themeIsActive}
                  onChange={(e) => setThemeIsActive(e.target.checked)}
                  className="rounded text-[#c5a059] focus:ring-[#c5a059] w-4 h-4 cursor-pointer"
                />
                <label htmlFor="themeActiveCheck" className="font-bold text-slate-800 cursor-pointer">
                  Kích hoạt hiển thị mẫu rạp này trên Website khách hàng
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowThemeModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
                >
                  {editingThemeId ? 'Cập Nhật Mẫu Rạp' : 'Thêm Mẫu Rạp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
