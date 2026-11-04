import React, { useState, useEffect, useRef } from 'react';
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
  Menu,
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
  MoreHorizontal,
  User,
  UserCircle,
  BookOpen,
  Hammer,
  Calculator,
  PackagePlus,
  PackageCheck,
  Wrench,
  Grid,
  Table as TableIcon,
  Layers as LayersIcon,
  Sparkle,
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
  UserRole,
  TableChairCombo,
  TentFrameConfig,
  TentBomComponent,
  InventoryCategory,
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
import { toast, showConfirm } from '../services/notification';
import { AdminGreetingBanner } from './AdminGreetingBanner';
import { NotificationBell } from './NotificationBell';
import './AdminPortal.css';
import { EventWorkspace, EventCustomers, EventInventory } from './EventWorkspace';
import { EventDashboard } from './EventDashboard';
import { accountService } from '../services/accountService';
import { AdminCustomerAccounts } from './AdminCustomerAccounts';
import { EventAlerts } from './EventAlerts';

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
  monthEvents?: MonthEventItem[];
  debtItems?: DebtItem[];
  reminderTasks?: ReminderTask[];
  warehouseAlerts?: WarehouseAlertItem[];
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
  monthEvents,
  debtItems,
  reminderTasks,
  warehouseAlerts,
  onBackToCustomerSite,
  onLogout,
}) => {
  const currentMonthEvents = monthEvents || appStore.getMonthEvents();
  const currentDebtItems = debtItems || appStore.getDebtItems();
  const currentReminderTasks = reminderTasks || appStore.getReminderTasks();
  const currentWarehouseAlerts = warehouseAlerts || appStore.getWarehouseAlerts();

  const handleLogout = () => {
    showConfirm({
      title: 'Đăng xuất khỏi hệ thống',
      message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị Thái Đăng?',
      confirmText: 'Đăng xuất',
      cancelText: 'Hủy bỏ',
      isDanger: true,
      onConfirm: () => {
        void accountService.signOut();
        toast.success('Đã đăng xuất khỏi hệ thống quản trị thành công!');
        if (onLogout) {
          onLogout();
        } else {
          window.location.hash = '#login';
        }
      }
    });
  };

  // Top-Left User Menu & Profile Modal State
  const [showTopUserMenu, setShowTopUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const topUserMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (topUserMenuRef.current && !topUserMenuRef.current.contains(event.target as Node)) {
        setShowTopUserMenu(false);
      }
    };
    if (showTopUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTopUserMenu]);

  // Navigation Menu Left
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'intake' | 'jobs' | 'inventory' | 'timeline' | 'calendar' | 'finance' | 'reports' | 'accounts' | 'customers' | 'staff' | 'audit' | 'articles' | 'promotions' | 'settings'
  >((window.location.hash === '#admin/tai-khoan') ? 'accounts' : 'dashboard');

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
  const [themeService, setThemeService] = useState<ThemeModel['service']>('dam_cuoi');
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
  
  // Category Modal State (Quản trị thanh Menu Header & Chuyên mục CMS)
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catName, setCatName] = useState('');
  const [catSlug, setCatSlug] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catLinkUrl, setCatLinkUrl] = useState('');
  const [catSortOrder, setCatSortOrder] = useState<number>(1);
  const [catIsHeaderNav, setCatIsHeaderNav] = useState(true);
  const [catIsActive, setCatIsActive] = useState(true);

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

  // --- QUẢN LÝ DỤNG CỤ, KHUNG RẠP & BÀN GHẾ GHÉP ---
  const [invSubTab, setInvSubTab] = useState<'items' | 'tent_assembly' | 'combos'>('items');
  const [invSearchQuery, setInvSearchQuery] = useState('');
  const [invCategoryFilter, setInvCategoryFilter] = useState<string>('all');
  const [invViewMode, setInvViewMode] = useState<'cards' | 'table'>('cards');

  // Item Modal (Thêm / Sửa Dụng Cụ)
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemCode, setItemCode] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemCategory, setItemCategory] = useState<InventoryCategory>('ban');
  const [itemUnit, setItemUnit] = useState('cái');
  const [itemImageUrl, setItemImageUrl] = useState('');
  const [itemPurchaseDate, setItemPurchaseDate] = useState('2024-01-15');
  const [itemPurchasePriceVND, setItemPurchasePriceVND] = useState<number>(0);
  const [itemRentalPriceVND, setItemRentalPriceVND] = useState<number>(0);
  const [itemTotalOwned, setItemTotalOwned] = useState<number>(10);
  const [itemInRepair, setItemInRepair] = useState<number>(0);
  const [itemNotes, setItemNotes] = useState('');

  // Table-Chair Combo Modal (Gói Bàn Ghế Ghép & Bảng Giá)
  const [showComboModal, setShowComboModal] = useState(false);
  const [editingComboId, setEditingComboId] = useState<string | null>(null);
  const [comboCode, setComboCode] = useState('');
  const [comboName, setComboName] = useState('');
  const [comboTableCode, setComboTableCode] = useState('BAN_TRON');
  const [comboChairCode, setComboChairCode] = useState('GHE_NHUA_DO');
  const [comboChairsPerTable, setComboChairsPerTable] = useState<number>(6);
  const [comboRentalPriceVND, setComboRentalPriceVND] = useState<number>(120000);
  const [comboImageUrl, setComboImageUrl] = useState('');
  const [comboDescription, setComboDescription] = useState('');

  // Table-Chair Simulator (Máy tính đặt bàn tiệc)
  const [simComboCode, setSimComboCode] = useState('BAN_INOX_GHE_NHUA');
  const [simComboSets, setSimComboSets] = useState<number>(15);
  const [simBackupTables, setSimBackupTables] = useState<number>(2);
  const [simExtraChairs, setSimExtraChairs] = useState<number>(6);

  // Tent Frame Config & Simulation State (Máy tính ghép khung rạp)
  const [selectedTentConfigCode, setSelectedTentConfigCode] = useState('KHUNG_RAP_6M');
  const [simTentBayCount, setSimTentBayCount] = useState<number>(6);
  const [showTentConfigModal, setShowTentConfigModal] = useState(false);
  const [editingTentConfigId, setEditingTentConfigId] = useState<string | null>(null);
  const [tentConfigCode, setTentConfigCode] = useState('');
  const [tentConfigName, setTentConfigName] = useState('');
  const [tentConfigBayWidth, setTentConfigBayWidth] = useState<number>(6);
  const [tentConfigRentalPrice, setTentConfigRentalPrice] = useState<number>(350000);
  const [tentConfigDesc, setTentConfigDesc] = useState('');
  const [tentConfigBom, setTentConfigBom] = useState<TentBomComponent[]>([]);

  // Article CMS state
  const [articleCategoryFilter, setArticleCategoryFilter] = useState<string>('all');
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [articleTitle, setArticleTitle] = useState('');
  const [articleSlug, setArticleSlug] = useState('');
  const [articleCategory, setArticleCategory] = useState<ArticleRecord['category']>('xu_huong_rap');
  const [articleSummary, setArticleSummary] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleImageUrl, setArticleImageUrl] = useState('');
  const [articleAuthor, setArticleAuthor] = useState('Ban Biên Tập Thái Đăng');
  const [articleIsPublished, setArticleIsPublished] = useState(true);

  // Promotion CMS state & view mode
  const [promoViewMode, setPromoViewMode] = useState<'table' | 'cards'>('table');
  const [promoSearchQuery, setPromoSearchQuery] = useState('');
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDiscountText, setPromoDiscountText] = useState('');
  const [promoValidUntil, setPromoValidUntil] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoBadge, setPromoBadge] = useState('');
  const [promoIsActive, setPromoIsActive] = useState(true);

  // Dashboard Month Event Modal State
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventDateStr, setEventDateStr] = useState('');
  const [eventCustomerName, setEventCustomerName] = useState('');
  const [eventServiceType, setEventServiceType] = useState('Tiệc cưới');
  const [eventLocation, setEventLocation] = useState('');
  const [eventStatus, setEventStatus] = useState<'da_hoan_thanh' | 'dang_thuc_hien' | 'sap_dien_ra'>('sap_dien_ra');

  // Dashboard Debt Modal State
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [debtCustomerName, setDebtCustomerName] = useState('');
  const [debtDate, setDebtDate] = useState('');
  const [debtAmount, setDebtAmount] = useState<number>(5000000);

  // Quick reminder task input
  const [newReminderTitle, setNewReminderTitle] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('09:00');

  // Quick warehouse alert modal
  const [showWarehouseAlertModal, setShowWarehouseAlertModal] = useState(false);
  const [warehouseAlertTitle, setWarehouseAlertTitle] = useState('');
  const [warehouseAlertDetail, setWarehouseAlertDetail] = useState('');
  const [warehouseAlertSeverity, setWarehouseAlertSeverity] = useState<'danger' | 'warning'>('warning');

  // Company Info & Chân Trang (Footer) Settings State
  const initialComp = appStore.getCompanyInfo();
  const [settingsForm, setSettingsForm] = useState<CompanyInfo>(() => ({
    ...initialComp,
    footerSloganTitle: initialComp.footerSloganTitle || 'SỰ KIỆN TRỌN NIỀM VUI',
    footerCol2Title: initialComp.footerCol2Title || 'DỊCH VỤ TỔ CHỨC',
    footerCol2Items: initialComp.footerCol2Items || [
      'Tiệc cưới hoành tráng',
      'Lễ ăn hỏi & đính hôn',
      'Lễ tân gia mừng nhà mới',
      'Sự kiện khai trương & khánh thành',
      'Cung cấp thiết bị bàn ghế & âm thanh',
    ],
    footerCol3Title: initialComp.footerCol3Title || 'CHÍNH SÁCH & CAM KẾT',
    footerCol3Items: initialComp.footerCol3Items || [
      'Khảo sát đo đạc mặt bằng miễn phí',
      'Bảo đảm an toàn kết cấu rạp khẩu độ lớn',
      'Cam kết đúng giờ hoàng đạo 100%',
      'Dụng cụ bàn ghế sạch sẽ, khử khuẩn',
    ],
    footerCol4Title: initialComp.footerCol4Title || 'LIÊN HỆ TRỰC TIẾP',
    footerCopyright: initialComp.footerCopyright || '© 2026 • Tất cả các quyền được bảo lưu. Thiết kế & phát triển cho Nhà Rạp Thái Đăng.',
  }));
  const [footerCol2Text, setFooterCol2Text] = useState(() => (settingsForm.footerCol2Items || []).join('\n'));
  const [footerCol3Text, setFooterCol3Text] = useState(() => (settingsForm.footerCol3Items || []).join('\n'));
  const [settingsSavedAlert, setSettingsSavedAlert] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isMobileSidebarOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const drawer = document.getElementById('admin-mobile-navigation');
    drawer?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileSidebarOpen(false);
      if (event.key !== 'Tab' || !drawer) return;
      const buttons = drawer.querySelectorAll<HTMLButtonElement>('button');
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isMobileSidebarOpen]);

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
    toast.success('Đã lưu thông tin khảo sát mặt bằng và chuyển trạng thái sang "Đã khảo sát"!');
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
      toast.error(`Không thể xác nhận: ${res.message}`);
      return;
    }

    setShowConfirmModal(false);
    toast.success(res.message);
  };

  // Xuất kho dụng cụ
  const handleDispatch = (jobId: string) => {
    showConfirm({
      title: 'Xác nhận xuất kho',
      message: `Xác nhận xuất kho các thiết bị cho Job ${jobId} lên xe chuyển đến công trình?`,
      confirmText: 'Xuất kho ngay',
      cancelText: 'Hủy bỏ',
      onConfirm: () => {
        const res = appStore.dispatchJobItems(jobId);
        if (res.success) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      }
    });
  };

  // Hoàn trả dụng cụ nhập kho
  const handleReturn = (jobId: string) => {
    showConfirm({
      title: 'Xác nhận hoàn trả thiết bị',
      message: `Xác nhận đã kiểm đếm đủ thiết bị từ Job ${jobId} và hoàn trả về kho lưu trữ?`,
      confirmText: 'Hoàn trả kho',
      cancelText: 'Hủy bỏ',
      onConfirm: () => {
        const res = appStore.returnJobItems(jobId);
        if (res.success) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      }
    });
  };

  // Hủy Job
  const handleCancelJob = (jobId: string) => {
    showConfirm({
      title: 'Xác nhận hủy Job',
      message: `Bạn có chắc chắn muốn hủy Job ${jobId}? Hành động này sẽ cập nhật trạng thái hủy sự kiện.`,
      confirmText: 'Hủy Job',
      cancelText: 'Đóng',
      isDanger: true,
      onConfirm: () => {
        const res = appStore.cancelJob(jobId, 'Hủy theo yêu cầu của ban quản trị');
        if (res.success) {
          toast.success(res.message);
        } else {
          toast.error(res.message);
        }
      }
    });
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
      toast.success(res.message);
    } else {
      toast.error(res.message);
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
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  // CMS Category Handlers (Quản trị thanh Menu Header & Chuyên mục)
  const handleOpenAddCategory = () => {
    setEditingCatId(null);
    setCatName('');
    setCatSlug('');
    setCatDesc('');
    setCatLinkUrl('');
    setCatSortOrder(cmsCategoriesList.length + 1);
    setCatIsHeaderNav(true);
    setCatIsActive(true);
    setShowCatModal(true);
  };

  const handleOpenEditCategory = (cat: CmsCategory) => {
    setEditingCatId(cat.id);
    setCatName(cat.name);
    setCatSlug(cat.slug);
    setCatDesc(cat.description);
    setCatLinkUrl(cat.linkUrl || `#${cat.slug}`);
    setCatSortOrder(cat.sortOrder || 1);
    setCatIsHeaderNav(cat.isHeaderNav !== false);
    setCatIsActive(cat.isActive !== false);
    setShowCatModal(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    const slug = catSlug.trim() || catName.toLowerCase().replace(/[^a-z0-9àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ\s]/g, '').replace(/\s+/g, '-');
    if (editingCatId) {
      appStore.updateCmsCategory(editingCatId, { 
        name: catName.trim(), 
        slug, 
        description: catDesc.trim(),
        linkUrl: catLinkUrl.trim() || `#${slug}`,
        sortOrder: Number(catSortOrder) || 1,
        isHeaderNav: catIsHeaderNav,
        isActive: catIsActive,
      });
      toast.success('Đã cập nhật chuyên mục thành công!');
    } else {
      appStore.addCmsCategory({ 
        name: catName.trim(), 
        slug, 
        description: catDesc.trim(),
        linkUrl: catLinkUrl.trim() || `#${slug}`,
        iconName: 'Sparkles', 
        itemCount: 0, 
        sortOrder: Number(catSortOrder) || (cmsCategoriesList.length + 1),
        isHeaderNav: catIsHeaderNav,
        isActive: catIsActive,
      });
      toast.success('Đã thêm chuyên mục mới thành công!');
    }
    setCmsCategoriesList(appStore.getCmsCategories());
    setShowCatModal(false);
  };

  const handleDeleteCategory = (id: string) => {
    showConfirm({
      title: 'Xác nhận xóa chuyên mục',
      message: 'Bạn có chắc chắn muốn xóa chuyên mục này? Các bài viết thuộc chuyên mục này có thể bị ảnh hưởng.',
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ',
      isDanger: true,
      onConfirm: () => {
        appStore.deleteCmsCategory(id);
        setCmsCategoriesList(appStore.getCmsCategories());
        toast.success('Đã xóa chuyên mục thành công!');
      }
    });
  };

  const handleToggleCategoryActive = (id: string, current: boolean) => {
    appStore.updateCmsCategory(id, { isActive: !current });
    setCmsCategoriesList(appStore.getCmsCategories());
    toast.success(current ? 'Đã tạm ẩn chuyên mục.' : 'Đã hiển thị chuyên mục.');
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
    toast.success('Đã thêm ảnh liên kết thành công!');
  };

  const handleDeletePhoto = (id: string) => {
    showConfirm({
      title: 'Xác nhận xóa ảnh',
      message: 'Bạn có chắc chắn muốn xóa ảnh liên kết này khỏi website?',
      confirmText: 'Xóa ảnh',
      cancelText: 'Hủy',
      isDanger: true,
      onConfirm: () => {
        appStore.deleteCmsPartnerPhoto(id);
        setCmsPartnerPhotosList(appStore.getCmsPartnerPhotos());
        toast.success('Đã xóa ảnh liên kết thành công!');
      }
    });
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
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleToggleStaff = (userId: string) => {
    const res = appStore.toggleStaffStatus(userId);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleSelectRoleInDropdown = (user: UserProfile) => {
    appStore.setCurrentUser(user);
    setShowRoleDropdown(false);
    toast.success(`Đã chuyển phiên làm việc sang: ${user.fullName}`);
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
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
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
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    }
    setShowArticleModal(false);
  };

  const handleDeleteArticle = (id: string) => {
    showConfirm({
      title: 'Xác nhận xóa bài viết',
      message: 'Bạn có chắc chắn muốn xóa bài viết này khỏi hệ thống tin tức / cẩm nang?',
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ',
      isDanger: true,
      onConfirm: () => {
        const res = appStore.deleteArticle(id);
        if (res.success) toast.success(res.message);
        else toast.error(res.message);
      }
    });
  };

  const handleToggleArticlePublish = (art: ArticleRecord) => {
    const res = appStore.updateArticle(art.id, { isPublished: !art.isPublished });
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
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
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
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
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    }
    setShowPromoModal(false);
  };

  const handleDeletePromo = (id: string) => {
    showConfirm({
      title: 'Xác nhận xóa ưu đãi',
      message: 'Bạn có chắc chắn muốn xóa chương trình ưu đãi này khỏi website?',
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ',
      isDanger: true,
      onConfirm: () => {
        const res = appStore.deletePromotion(id);
        if (res.success) toast.success(res.message);
        else toast.error(res.message);
      }
    });
  };

  const handleTogglePromoActive = (p: PromotionBanner) => {
    const res = appStore.updatePromotion(p.id, { isActive: !p.isActive });
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
  };

  // --- HANDLERS: QUẢN LÝ DỤNG CỤ GỐC (INVENTORY ITEM) ---
  const handleOpenAddItem = () => {
    setEditingItemId(null);
    setItemCode(`DC-${Date.now().toString().slice(-4)}`);
    setItemName('');
    setItemCategory('ban');
    setItemUnit('cái');
    setItemImageUrl('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80');
    setItemPurchaseDate(new Date().toISOString().split('T')[0]);
    setItemPurchasePriceVND(500000);
    setItemRentalPriceVND(50000);
    setItemTotalOwned(20);
    setItemInRepair(0);
    setItemNotes('');
    setShowItemModal(true);
  };

  const handleOpenEditItem = (item: InventoryItem) => {
    setEditingItemId(item.id);
    setItemCode(item.code);
    setItemName(item.name);
    setItemCategory(item.category);
    setItemUnit(item.unit);
    setItemImageUrl(item.imageUrl || '');
    setItemPurchaseDate(item.purchaseDate || '2023-01-01');
    setItemPurchasePriceVND(item.purchasePriceVND || 0);
    setItemRentalPriceVND(item.rentalPriceVND || 0);
    setItemTotalOwned(item.totalOwnedQuantity);
    setItemInRepair(item.inRepairQuantity);
    setItemNotes(item.notes || '');
    setShowItemModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemCode.trim() || !itemName.trim()) {
      toast.error('Vui lòng nhập đầy đủ mã và tên dụng cụ!');
      return;
    }

    if (editingItemId) {
      const existing = catalog.find(i => i.id === editingItemId);
      if (!existing) return;
      const res = appStore.updateCatalogItem({
        ...existing,
        code: itemCode.trim().toUpperCase(),
        name: itemName.trim(),
        category: itemCategory,
        unit: itemUnit.trim(),
        imageUrl: itemImageUrl.trim(),
        purchaseDate: itemPurchaseDate,
        purchasePriceVND: Number(itemPurchasePriceVND) || 0,
        rentalPriceVND: Number(itemRentalPriceVND) || 0,
        totalOwnedQuantity: Math.max(0, Number(itemTotalOwned) || 0),
        inRepairQuantity: Math.max(0, Number(itemInRepair) || 0),
        notes: itemNotes.trim(),
      });
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    } else {
      const res = appStore.addCatalogItem({
        code: itemCode.trim().toUpperCase(),
        name: itemName.trim(),
        category: itemCategory,
        unit: itemUnit.trim(),
        imageUrl: itemImageUrl.trim(),
        purchaseDate: itemPurchaseDate,
        purchasePriceVND: Number(itemPurchasePriceVND) || 0,
        rentalPriceVND: Number(itemRentalPriceVND) || 0,
        totalOwnedQuantity: Math.max(0, Number(itemTotalOwned) || 0),
        inRepairQuantity: Math.max(0, Number(itemInRepair) || 0),
        scrappedQuantity: 0,
        externalRentedQuantity: 0,
        bufferRatio: 0.1,
        cleaningTurnaroundHours: 2,
        notes: itemNotes.trim(),
      });
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    }
    setShowItemModal(false);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    showConfirm({
      title: 'Xác nhận xóa dụng cụ',
      message: `Bạn có chắc chắn muốn xóa "${item.name}" (${item.code}) khỏi kho thiết bị?`,
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ',
      isDanger: true,
      onConfirm: () => {
        const res = appStore.deleteCatalogItem(item.id);
        if (res.success) toast.success(res.message);
        else toast.error(res.message);
      }
    });
  };

  // --- HANDLERS: QUẢN LÝ GÓI BÀN GHẾ GHÉP (TABLE-CHAIR COMBOS) ---
  const handleOpenAddCombo = () => {
    setEditingComboId(null);
    setComboCode(`COMBO_BG_${Date.now().toString().slice(-4)}`);
    setComboName('Bộ Bàn Inox + Ghế Tùy Chọn');
    setComboTableCode('BAN_TRON');
    setComboChairCode('GHE_NHUA_DO');
    setComboChairsPerTable(6);
    setComboRentalPriceVND(120000);
    setComboImageUrl('https://images.unsplash.com/photo-1580481077195-c2666a0d4c8e?w=500&q=80');
    setComboDescription('');
    setShowComboModal(true);
  };

  const handleOpenEditCombo = (c: TableChairCombo) => {
    setEditingComboId(c.id);
    setComboCode(c.code);
    setComboName(c.name);
    setComboTableCode(c.tableItemCode);
    setComboChairCode(c.chairItemCode);
    setComboChairsPerTable(c.chairsPerTable);
    setComboRentalPriceVND(c.rentalPriceVND);
    setComboImageUrl(c.imageUrl || '');
    setComboDescription(c.description || '');
    setShowComboModal(true);
  };

  const handleSaveCombo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboName.trim()) {
      toast.error('Vui lòng nhập tên gói bàn ghế ghép!');
      return;
    }
    const tableItem = catalog.find(i => i.code === comboTableCode);
    const chairItem = catalog.find(i => i.code === comboChairCode);

    if (editingComboId) {
      const res = appStore.updateTableChairCombo({
        id: editingComboId,
        code: comboCode.trim().toUpperCase(),
        name: comboName.trim(),
        tableItemCode: comboTableCode,
        tableName: tableItem?.name || 'Bàn sự kiện',
        chairItemCode: comboChairCode,
        chairName: chairItem?.name || 'Ghế sự kiện',
        chairsPerTable: Number(comboChairsPerTable) || 6,
        rentalPriceVND: Number(comboRentalPriceVND) || 0,
        imageUrl: comboImageUrl.trim(),
        description: comboDescription.trim(),
      });
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    } else {
      const res = appStore.addTableChairCombo({
        code: comboCode.trim().toUpperCase(),
        name: comboName.trim(),
        tableItemCode: comboTableCode,
        tableName: tableItem?.name || 'Bàn sự kiện',
        chairItemCode: comboChairCode,
        chairName: chairItem?.name || 'Ghế sự kiện',
        chairsPerTable: Number(comboChairsPerTable) || 6,
        rentalPriceVND: Number(comboRentalPriceVND) || 0,
        imageUrl: comboImageUrl.trim(),
        description: comboDescription.trim(),
      });
      if (res.success) toast.success(res.message);
      else toast.error(res.message);
    }
    setShowComboModal(false);
  };

  const handleDeleteCombo = (id: string, name: string) => {
    showConfirm({
      title: 'Xác nhận xóa gói combo',
      message: `Bạn có chắc chắn muốn xóa gói "${name}"?`,
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ',
      isDanger: true,
      onConfirm: () => {
        const res = appStore.deleteTableChairCombo(id);
        if (res.success) toast.success(res.message);
        else toast.error(res.message);
      }
    });
  };

  // --- HANDLERS: CẤU HÌNH KHUNG RẠP (TENT FRAME BOM) ---
  const handleOpenEditTentConfig = (cfg: TentFrameConfig) => {
    setEditingTentConfigId(cfg.id);
    setTentConfigCode(cfg.code);
    setTentConfigName(cfg.name);
    setTentConfigBayWidth(cfg.bayWidthMeters);
    setTentConfigRentalPrice(cfg.rentalPricePerBayVND);
    setTentConfigDesc(cfg.description || '');
    setTentConfigBom(JSON.parse(JSON.stringify(cfg.bomComponents)));
    setShowTentConfigModal(true);
  };

  const handleSaveTentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTentConfigId) return;
    const res = appStore.updateTentFrameConfig({
      id: editingTentConfigId,
      code: tentConfigCode,
      name: tentConfigName.trim(),
      bayWidthMeters: Number(tentConfigBayWidth) || 6,
      bayLengthMeters: 3,
      rentalPricePerBayVND: Number(tentConfigRentalPrice) || 350000,
      description: tentConfigDesc.trim(),
      bomComponents: tentConfigBom,
    });
    if (res.success) toast.success(res.message);
    else toast.error(res.message);
    setShowTentConfigModal(false);
  };

  // Month Events Handlers (Bảng Quản Lý Sự Kiện Tháng)
  const handleOpenAddEvent = () => {
    setEditingEventId(null);
    setEventDateStr('15/10 (T5)');
    setEventCustomerName('');
    setEventServiceType('Tiệc cưới');
    setEventLocation('xã Cổ Lễ, Ninh Bình');
    setEventStatus('sap_dien_ra');
    setShowEventModal(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventCustomerName.trim() || !eventDateStr.trim()) return;

    if (editingEventId) {
      const res = appStore.updateMonthEvent(editingEventId, {
        dateStr: eventDateStr.trim(),
        customerName: eventCustomerName.trim(),
        eventType: eventServiceType.trim(),
        location: eventLocation.trim(),
        status: eventStatus,
      });
      if (res.success) toast.success(res.message);
    } else {
      const res = appStore.addMonthEvent({
        dateStr: eventDateStr.trim(),
        customerName: eventCustomerName.trim(),
        eventType: eventServiceType.trim(),
        location: eventLocation.trim(),
        status: eventStatus,
      });
      if (res.success) toast.success(res.message);
    }
    setShowEventModal(false);
  };

  const handleChangeEventStatus = (id: string, newStatus: 'da_hoan_thanh' | 'dang_thuc_hien' | 'sap_dien_ra') => {
    appStore.updateMonthEvent(id, { status: newStatus });
    toast.success('Đã cập nhật trạng thái sự kiện!');
  };

  const handleDeleteEvent = (id: string) => {
    showConfirm({
      title: 'Xóa sự kiện',
      message: 'Bạn có chắc chắn muốn xóa sự kiện này khỏi lịch tháng?',
      confirmText: 'Xác nhận xóa',
      cancelText: 'Hủy bỏ',
      isDanger: true,
      onConfirm: () => {
        const res = appStore.deleteMonthEvent(id);
        if (res.success) toast.success(res.message);
      }
    });
  };

  // Debt Handlers (Bảng Quản Lý Công Nợ)
  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtCustomerName.trim() || !debtAmount) return;
    const res = appStore.addDebtItem({
      customerName: debtCustomerName.trim(),
      date: debtDate.trim() || new Date().toLocaleDateString('vi-VN').slice(0, 5),
      amount: Number(debtAmount),
    });
    if (res.success) toast.success(res.message);
    setShowDebtModal(false);
    setDebtCustomerName('');
  };

  const handleDeleteDebt = (id: string) => {
    showConfirm({
      title: 'Đã thu xong / Xóa công nợ',
      message: 'Bạn có chắc chắn khách hàng đã thanh toán xong khoản công nợ này?',
      confirmText: 'Xác nhận xong',
      cancelText: 'Hủy bỏ',
      onConfirm: () => {
        const res = appStore.deleteDebtItem(id);
        if (res.success) toast.success('Đã ghi nhận thanh toán / xóa công nợ thành công!');
      }
    });
  };

  // Reminder Task Quick Add Handler (Nhắc việc hôm nay)
  const handleQuickAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    const res = appStore.addReminderTask(newReminderTitle.trim(), newReminderTime);
    if (res.success) {
      toast.success(res.message);
      setNewReminderTitle('');
    }
  };

  // Warehouse Alert Handlers (Cảnh báo kho)
  const handleSaveWarehouseAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warehouseAlertTitle.trim()) return;
    const res = appStore.addWarehouseAlert({
      title: warehouseAlertTitle.trim(),
      detail: warehouseAlertDetail.trim() || 'Cần kiểm tra thiết bị kho',
      severity: warehouseAlertSeverity,
      iconType: warehouseAlertTitle.toLowerCase().includes('bạt') ? 'tents' : 'chairs',
    });
    if (res.success) toast.success(res.message);
    setShowWarehouseAlertModal(false);
    setWarehouseAlertTitle('');
    setWarehouseAlertDetail('');
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
      toast.success('Đã cập nhật mẫu rạp & tư vấn phong thủy thành công!');
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
      toast.success('Đã thêm mẫu rạp cưới mới vào hệ thống thành công!');
    }

    setCmsThemesList(appStore.getCmsThemes());
    setShowThemeModal(false);
  };

  const handleToggleThemeActive = (th: ThemeModel) => {
    appStore.updateCmsTheme(th.id, { isActive: !th.isActive });
    setCmsThemesList(appStore.getCmsThemes());
    toast.success(th.isActive ? 'Đã tạm ẩn mẫu rạp.' : 'Đã hiển thị mẫu rạp trên web.');
  };

  const handleDeleteTheme = (id: string) => {
    showConfirm({
      title: 'Xác nhận xóa mẫu rạp',
      message: 'Bạn có chắc chắn muốn xóa mẫu rạp cưới này khỏi bộ sưu tập?',
      confirmText: 'Xóa mẫu rạp',
      cancelText: 'Hủy bỏ',
      isDanger: true,
      onConfirm: () => {
        appStore.deleteCmsTheme(id);
        setCmsThemesList(appStore.getCmsThemes());
        toast.success('Đã xóa mẫu rạp thành công!');
      }
    });
  };

  // Settings Handlers (Lưu thông tin Chân trang Footer & Cấu hình thương hiệu)
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: CompanyInfo = {
      ...settingsForm,
      footerCol2Items: footerCol2Text.split('\n').map(s => s.trim()).filter(Boolean),
      footerCol3Items: footerCol3Text.split('\n').map(s => s.trim()).filter(Boolean),
    };
    const res = appStore.updateCompanyInfo(updated);
    setSettingsForm(updated);
    setSettingsSavedAlert(true);
    setTimeout(() => setSettingsSavedAlert(false), 3500);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const menuLabels = {
    dashboard: 'Tổng quan', intake: 'Hồ sơ tiếp nhận', calendar: 'Lịch sự kiện',
    jobs: 'Đặt lịch / Hợp đồng', promotions: 'Ưu đãi & Khuyến mại', articles: 'Tin tức & Cẩm nang',
    accounts: 'Tài khoản khách hàng', customers: 'Khách hàng', inventory: 'Kho dụng cụ', finance: 'Doanh thu & Công nợ', reports: 'Báo cáo',
    staff: 'Nhân sự', settings: 'Cấu hình', timeline: 'Khả dụng thiết bị', audit: 'Nhật ký',
  };

  const navigationItems: { id: typeof activeMenu; label?: string; icon: typeof Home; count?: number }[] = [
    { id: 'dashboard', icon: Home },
    { id: 'calendar', icon: Calendar },
    { id: 'jobs', icon: FileText },
    { id: 'articles', icon: BookOpen, count: articles.length },
    { id: 'customers', icon: Briefcase },
    { id: 'accounts', label: 'Tài khoản khách hàng', icon: User },
    { id: 'inventory', icon: Boxes },
    { id: 'finance', icon: DollarSign },
    { id: 'reports', icon: BarChart3 },
    { id: 'settings', icon: Settings },
  ];

  const renderSidebarNav = (isMobile = false) => (
    <nav className="admin-navigation" aria-label="Menu quản trị">
      {navigationItems.map(({ id, label, icon: Icon, count }) => (
        <button key={label || id} type="button"
          aria-current={activeMenu === id && !label ? 'page' : undefined}
          onClick={() => { setActiveMenu(id); if (isMobile) setIsMobileSidebarOpen(false); }}>
          <Icon aria-hidden="true" />
          <span>{label || menuLabels[id]}</span>
          {!!count && <span className={`admin-nav-count admin-nav-count-${id}`}>{count}</span>}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="admin-portal h-screen w-full bg-[#f4efe6] flex overflow-hidden">
      
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR MENU (DESKTOP)                            */}
      {/* ======================================================== */}
      <aside className="admin-sidebar hidden lg:flex w-64 bg-[#fbfaf8] text-slate-700 flex-col shrink-0 border-r border-[#ece8df] shadow-xs select-none">
        
        {/* Brand Header Logo - Cố định đúng chiều cao h-[74px] thẳng hàng 100% với Top Header */}
        <div className="admin-brand h-[74px] px-4 flex items-center justify-center border-b border-[#e2d9cb] shrink-0">
          <img 
            src="/logo_thai_dang.png" 
            alt="Nhà Rạp Thái Đăng" 
            className="h-11 max-h-11 mx-auto object-contain drop-shadow-2xs" 
          />
        </div>

        {/* 10 Menu Items chính xác theo Ảnh 2 */}
        {renderSidebarNav(false)}

        {/* Địa chỉ cơ sở ở chân Sidebar */}
        <div className="admin-location p-3 mx-3 mb-4 rounded-2xl bg-[#f5f3ee] border border-[#e8e4dc] text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
          <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
          <div className="font-medium text-slate-800 leading-snug">
            Thôn Trực Đông,<br />
            xã Cổ Lễ, tỉnh Ninh Bình
          </div>
        </div>

      </aside>

      {/* ======================================================== */}
      {/* MOBILE DRAWER SIDEBAR (KHI MỞ TRÊN ĐIỆN THOẠI)             */}
      {/* ======================================================== */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden animate-fade-in"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      {isMobileSidebarOpen && (
        <aside id="admin-mobile-navigation" role="dialog" aria-modal="true" aria-label="Điều hướng quản trị" className="admin-mobile-sidebar fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#fbfaf8] z-50 flex flex-col shadow-2xl lg:hidden select-none animate-slide-right">
          <div className="h-[74px] px-4 border-b border-[#e2d9cb] flex items-center justify-between shrink-0">
            <img 
              src="/logo_thai_dang.png" 
              alt="Nhà Rạp Thái Đăng" 
              className="h-10 object-contain drop-shadow-2xs" 
            />
            <button 
              type="button" 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 cursor-pointer"
              title="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {renderSidebarNav(true)}

          <div className="p-3 mx-3 mb-4 rounded-2xl bg-[#f5f3ee] border border-[#e8e4dc] text-xs text-slate-700 flex items-start gap-2.5 shadow-2xs">
            <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="font-medium text-slate-800 leading-snug">
              Thôn Trực Đông,<br />
              xã Cổ Lễ, tỉnh Ninh Bình
            </div>
          </div>
        </aside>
      )}

      {/* ======================================================== */}
      {/* 2. MAIN WORKSPACE CONTAINER (HEADER CỐ ĐỊNH + NỘI DUNG CUỘN)*/}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        
        {/* TOP HEADER BAR CỐ ĐỊNH (STICKY TOP-0 - KHÔNG BỊ TRÔI KHI CUỘN, CAO ĐỘ h-[74px] THẲNG HÀNG 100% VỚI LOGO) */}
        <header className="admin-topbar sticky top-0 z-30 h-[74px] bg-[#f4efe6]/95 backdrop-blur-md px-3 sm:px-6 lg:px-8 border-b border-[#e2d9cb] flex items-center justify-between gap-3 shrink-0 shadow-2xs">
          
          {/* Bên trái: Nút Hamburger Menu trên Mobile + Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden h-11 w-11 rounded-2xl bg-white border border-[#dcd7cd] text-slate-700 flex items-center justify-center hover:bg-stone-50 active:bg-stone-100 transition-colors shadow-2xs cursor-pointer shrink-0"
              title="Mở menu quản trị"
              aria-label="Mở menu quản trị"
              aria-expanded={isMobileSidebarOpen}
              aria-controls="admin-mobile-navigation"
            >
              <Menu className="w-5 h-5 text-slate-700" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="hidden sm:inline">Hệ Thống Quản Trị</span>
                <span className="hidden sm:inline text-slate-400">/</span>
                <span className="font-bold text-[#0e4b44] uppercase tracking-wider truncate">
                  {menuLabels[activeMenu]}
                </span>
              </div>
              <h1 className="text-sm sm:text-lg lg:text-xl font-bold text-stone-900 mt-0.5 truncate leading-tight">
                {activeMenu === 'dashboard' && 'Bảng Điều Khiển & Hoạt Động'}
                {activeMenu === 'intake' && 'Hồ Sơ Tiếp Nhận & Khảo Sát'}
                {activeMenu === 'jobs' && 'Đặt Lịch & Hợp Đồng'}
                {activeMenu === 'inventory' && 'Quản Lý Kho Thiết Bị'}
                {activeMenu === 'timeline' && 'Kiểm Tra Khả Dụng Thiết Bị'}
                {activeMenu === 'calendar' && 'Lịch Biểu & Điều Phối'}
                {activeMenu === 'finance' && 'Doanh Thu & Công Nợ'}
                {activeMenu === 'reports' && 'Biểu Đồ & Báo Cáo Kinh Doanh'}
                {activeMenu === 'customers' && 'Quản Lý Khách Hàng (CRM)'}
                {activeMenu === 'accounts' && 'Tài Khoản & Mật Khẩu'}
                {activeMenu === 'staff' && 'Nhân Sự & Phân Quyền'}
                {activeMenu === 'audit' && 'Nhật Ký & Kiểm Toán'}
                {activeMenu === 'articles' && 'Tin Tức & Cẩm Nang'}
                {activeMenu === 'promotions' && 'Ưu Đãi & Khuyến Mại'}
                {activeMenu === 'settings' && 'Cấu Hình & Quản Trị CMS'}
              </h1>
            </div>
          </div>

          {/* Bên phải: Đồng nhất kích thước chiều cao h-11 và bo góc rounded-2xl */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
            
            {/* 1. Chuông thông báo nhắc việc (h-11 w-11 rounded-2xl) */}
            <EventAlerts onNavigate={(menu) => setActiveMenu(menu)} />

            {/* 2. Nút Về Website: Chiều cao h-11, bo góc rounded-2xl đồng nhất */}
            <button
              type="button"
              onClick={onBackToCustomerSite}
              className="admin-website-button h-11 px-3 sm:px-4 rounded-2xl bg-white hover:bg-stone-50 active:bg-stone-100 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-[#dcd7cd] transition-all cursor-pointer shadow-2xs hover:shadow-xs shrink-0"
              title="Quay lại giao diện website khách hàng"
            >
              <Globe className="w-4.5 h-4.5 text-[#0e4b44]" />
              <span className="hidden sm:inline">Về Website</span>
            </button>

            {/* 3. Khối thông tin tài khoản: Chiều cao h-11, bo góc rounded-2xl đồng nhất */}
            <div className="relative" ref={topUserMenuRef}>
              <button
                type="button"
                onClick={() => setShowTopUserMenu(!showTopUserMenu)}
                title="Menu chức năng tài khoản"
                aria-label="Menu chức năng tài khoản"
                aria-expanded={showTopUserMenu}
                className="admin-account-button h-11 bg-[#0e4b44] text-white pl-3 sm:pl-4 pr-1.5 rounded-2xl flex items-center gap-2.5 sm:gap-3 shadow-2xs cursor-pointer transition-all shrink-0"
              >
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold truncate tracking-wide text-white flex items-center gap-1 leading-tight">
                    <span>Quản trị hệ thống</span>
                    <span className="text-emerald-200 font-normal">({currentUser.email?.split('@')[0] || 'admin'})</span>
                  </div>
                  <div className="text-[11px] text-emerald-200/90 truncate font-medium leading-tight mt-0.5">
                    {currentUser.fullName}
                  </div>
                </div>

                {/* Avatar bo tròn */}
                <div className="w-8 h-8 rounded-xl bg-white/15 text-white flex items-center justify-center shrink-0 ring-1 ring-white/20">
                  <User className="w-4.5 h-4.5 text-white" />
                </div>
              </button>

              {/* Popup menu chức năng */}
              {showTopUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 p-3 z-50 text-slate-800 animate-fade-in">
                  <div className="flex flex-col items-center p-3 pb-3 border-b border-stone-100">
                    <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center shadow-inner mb-2 text-stone-400">
                      <User className="w-9 h-9" />
                    </div>
                    <div className="font-bold text-sm text-stone-900 text-center leading-snug">{currentUser.fullName}</div>
                    <div className="text-xs text-stone-500 text-center">{currentUser.email}</div>
                    <span className="mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#0e4b44] border border-emerald-200 uppercase tracking-wider">
                      {ROLE_LABELS[currentUser.role]}
                    </span>
                  </div>

                  <div className="pt-2 space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowTopUserMenu(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-100 text-stone-700 hover:text-stone-900 font-semibold text-xs transition-colors text-left cursor-pointer"
                    >
                      <UserCircle className="w-4.5 h-4.5 text-stone-500 shrink-0" />
                      <span>Thông tin cá nhân</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowTopUserMenu(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-50 text-rose-700 font-semibold text-xs transition-colors text-left cursor-pointer border-t border-stone-100 mt-1 pt-2"
                    >
                      <LogOut className="w-4.5 h-4.5 text-rose-600 shrink-0" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* PHẦN CUỘN NỘI DUNG CHÍNH (ĐỘC LẬP BÊN DƯỚI HEADER CỐ ĐỊNH) */}
        <main className="admin-workspace flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <AdminGreetingBanner userName={currentUser.fullName || 'Admin'} roleLabel={ROLE_LABELS[currentUser.role]} />

        {/* --- MODULE 1: DASHBOARD (TỔNG QUAN) --- */}
        {activeMenu === 'dashboard' && (<EventDashboard onOpenBookings={() => setActiveMenu('jobs')} />)}
        {activeMenu === 'reports' && (<EventDashboard onOpenBookings={() => setActiveMenu('jobs')} />)}

        {activeMenu === 'intake' && (<EventWorkspace view="bookings" />)}

        {activeMenu === 'jobs' && (<EventWorkspace view="all" />)}

        {activeMenu === 'inventory' && (<EventInventory />)}

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
        {activeMenu === 'calendar' && (<EventWorkspace view="calendar" />)}

        {activeMenu === 'finance' && (<EventWorkspace view="finance" />)}

        {activeMenu === 'customers' && (<><AdminCustomerAccounts /><details className="event-customer-booking-summary"><summary>Khách có lịch đặt / hợp đồng</summary><EventCustomers /></details></>)}
        {activeMenu === 'accounts' && <AdminCustomerAccounts />}

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
                        <span>{art.views} lượt xem</span>
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
            {settingsTab === 'chuyen_muc' && (
              <div className="bg-white rounded-3xl border border-[#ede8de] p-6 shadow-xs space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                      <Globe className="w-5 h-5 text-[#0e4b44]" />
                      <span>Quản Lý Chuyên Mục & Thanh Menu Điều Hướng Header</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cấu hình các mục hiển thị trên thanh Menu điều hướng đầu trang (Image 4: Trang chủ, Mẫu rạp, Dịch vụ, Thiệp cưới, Về chúng tôi, Liên hệ...) và danh mục bài viết.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddCategory}
                    className="px-4 py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Thêm Chuyên Mục Mới</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cmsCategoriesList
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((cat) => (
                    <div key={cat.id} className="p-4 rounded-2xl border border-slate-200 bg-[#fbfaf8] hover:border-[#c5a059] transition-all space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              #{cat.sortOrder || 1}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              {cat.linkUrl || `/${cat.slug}`}
                            </span>
                          </div>
                          <h5 className="font-bold text-slate-900 text-sm mt-1">{cat.name}</h5>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            cat.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {cat.isActive ? 'Đang kích hoạt' : 'Tạm ẩn'}
                          </span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md ${
                            cat.isHeaderNav !== false ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {cat.isHeaderNav !== false ? '● Hiện trên Menu Top' : '○ Chỉ bài viết'}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{cat.description || 'Chuyên mục điều hướng trên hệ thống Thái Đăng'}</p>
                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                        <span className="text-slate-600 text-[11px] font-medium">Neo: <strong className="text-slate-700">{cat.linkUrl || `#${cat.slug}`}</strong></span>
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
                            title="Sửa chuyên mục"
                          >
                            <Edit className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Xóa chuyên mục"
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

            {/* TAB 5: CHÂN TRANG & THÔNG TIN CHUNG (FOOTER - QUẢN TRỊ 100% NỘI DUNG) */}
            {settingsTab === 'footer' && (
              <div className="bg-white rounded-3xl border border-[#ede8de] p-6 sm:p-8 shadow-xs max-w-5xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <Share2 className="w-5 h-5 text-[#b8860b]" />
                      Quản Trị Toàn Bộ Nội Dung Chân Trang (Footer) & Kênh Liên Hệ
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Toàn quyền quản trị tiêu đề, các mục dịch vụ, chính sách cam kết, hotline, trụ sở và bản quyền hiển thị ở Chân trang (Footer) website.
                    </p>
                  </div>
                  <a
                    href={settingsForm.facebookFanpageUrl || 'https://facebook.com'}
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
                    <span>Đã lưu thành công! Toàn bộ nội dung chân trang (Footer) đã được cập nhật ra website khách hàng.</span>
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
                  
                  {/* KHỐI 1: THƯƠNG HIỆU & CỘT 1 (SLOGAN CHÂN TRANG) */}
                  <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e8e2d5] space-y-4">
                    <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <Crown className="w-4 h-4 text-[#c59b4c]" />
                      <span>Cột 1: Slogan & Thông Tin Thương Hiệu</span>
                    </h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">Tên thương hiệu đơn vị</label>
                        <input
                          type="text"
                          value={settingsForm.brandName || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1.5">
                          Tiêu đề Slogan Chân trang (Cột 1) *
                        </label>
                        <input
                          type="text"
                          value={settingsForm.footerSloganTitle || 'SỰ KIỆN TRỌN NIỀM VUI'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, footerSloganTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-[#c5a059]/60 bg-white font-bold text-[#0e4b44] focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                          required
                        />
                        <p className="text-[11px] text-slate-500 mt-1">Mặc định: &ldquo;SỰ KIỆN TRỌN NIỀM VUI&rdquo;</p>
                      </div>
                    </div>
                  </div>

                  {/* KHỐI 2: QUẢN TRỊ CỘT 2 & CỘT 3 CHÂN TRANG */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Cột 2: Dịch Vụ Tổ Chức */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <Briefcase className="w-4 h-4 text-[#0e4b44]" />
                          <span>Cột 2: Tiêu đề & Danh Sách Dịch Vụ</span>
                        </label>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                          Mỗi dòng 1 dịch vụ
                        </span>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Tiêu đề cột 2</label>
                        <input
                          type="text"
                          value={settingsForm.footerCol2Title || 'DỊCH VỤ TỔ CHỨC'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, footerCol2Title: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-[#0e4b44]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Danh sách các dịch vụ tổ chức</label>
                        <textarea
                          rows={6}
                          value={footerCol2Text}
                          onChange={(e) => setFooterCol2Text(e.target.value)}
                          placeholder="Tiệc cưới hoành tráng&#10;Lễ ăn hỏi & đính hôn&#10;Lễ tân gia mừng nhà mới&#10;Sự kiện khai trương & khánh thành&#10;Cung cấp thiết bị bàn ghế & âm thanh"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium leading-relaxed font-sans"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">Xuống dòng để tạo mục dịch vụ mới ở chân trang.</p>
                      </div>
                    </div>

                    {/* Cột 3: Chính Sách & Cam Kết */}
                    <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <label className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Cột 3: Tiêu đề & Cam Kết Chất Lượng</span>
                        </label>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                          Mỗi dòng 1 cam kết
                        </span>
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Tiêu đề cột 3</label>
                        <input
                          type="text"
                          value={settingsForm.footerCol3Title || 'CHÍNH SÁCH & CAM KẾT'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, footerCol3Title: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 font-bold text-[#0e4b44]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-slate-600 mb-1">Danh sách các chính sách & cam kết</label>
                        <textarea
                          rows={6}
                          value={footerCol3Text}
                          onChange={(e) => setFooterCol3Text(e.target.value)}
                          placeholder="Khảo sát đo đạc mặt bằng miễn phí&#10;Bảo đảm an toàn kết cấu rạp khẩu độ lớn&#10;Cam kết đúng giờ hoàng đạo 100%&#10;Dụng cụ bàn ghế sạch sẽ, khử khuẩn"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium leading-relaxed font-sans"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">Xuống dòng để tạo cam kết mới ở chân trang.</p>
                      </div>
                    </div>

                  </div>

                  {/* KHỐI 3: QUẢN TRỊ CỘT 4 (LIÊN HỆ TRỰC TIẾP) */}
                  <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                    <h5 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#e05638]" />
                      <span>Cột 4: Tiêu đề & Thông Tin Liên Hệ Trực Tiếp</span>
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Tiêu đề cột 4</label>
                        <input
                          type="text"
                          value={settingsForm.footerCol4Title || 'LIÊN HỆ TRỰC TIẾP'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, footerCol4Title: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-[#0e4b44]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-rose-600 flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          Hotline 24/7 *
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
                        <label className="block font-bold text-slate-700 mb-1">Email tiếp nhận liên hệ</label>
                        <input
                          type="email"
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold"
                          required
                        />
                      </div>
                    </div>

                    {/* Địa chỉ trụ sở kho bãi */}
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Trụ sở kho bãi & văn phòng (Hiển thị chân trang):
                      </label>
                      <input
                        type="text"
                        value={settingsForm.address}
                        onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-bold text-slate-900 bg-white"
                        required
                      />
                    </div>
                  </div>

                  {/* KHỐI 4: KÊNH MẠNG XÃ HỘI (ICON TRÒN CỘT 1) */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                    <h5 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-600" />
                      Liên Kết Kênh Mạng Xã Hội (Hiển thị các icon Chia sẻ, Zalo, TikTok, YouTube ở Cột 1)
                    </h5>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-blue-700">Link Facebook Fanpage</label>
                        <input
                          type="url"
                          value={settingsForm.facebookFanpageUrl || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, facebookFanpageUrl: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl border border-blue-200 bg-white font-medium"
                          required
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-700 mb-1 text-cyan-700">Link / Số Zalo Official</label>
                        <input
                          type="text"
                          value={settingsForm.zaloPhone || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, zaloPhone: e.target.value })}
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

                  {/* KHỐI 5: DÒNG BẢN QUYỀN CHÂN TRANG */}
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2">
                    <label className="block font-bold text-slate-800 text-xs">
                      Dòng Bản Quyền Phía Chân Trang (Copyright):
                    </label>
                    <input
                      type="text"
                      value={settingsForm.footerCopyright || '© 2026 • Tất cả các quyền được bảo lưu. Thiết kế & phát triển cho Nhà Rạp Thái Đăng.'}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footerCopyright: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 font-medium text-slate-800 bg-white"
                      required
                    />
                  </div>

                  {/* LIVE PREVIEW CHÂN TRANG THỰC TẾ (CHUẨN ẢNH 3) */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-700 text-xs uppercase tracking-wider">
                        Xem Trước Giao Diện Chân Trang Thực Tế (Live Preview):
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                        Tự động đồng bộ theo nội dung trên
                      </span>
                    </div>

                    <div className="p-6 rounded-2xl bg-[#faf7f2] border border-[#ede7dc] text-[#1c2434] shadow-inner space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
                        {/* Col 1 */}
                        <div className="space-y-2.5">
                          <Crown className="w-5 h-5 text-[#c59b4c]" />
                          <h6 className="font-bold text-[#0e4b44] uppercase tracking-wider">
                            {settingsForm.footerSloganTitle || 'SỰ KIỆN TRỌN NIỀM VUI'}
                          </h6>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="w-7 h-7 rounded-full bg-[#f4ece1] text-[#8c6b3e] flex items-center justify-center font-bold text-[10px]">FB</span>
                            <span className="w-7 h-7 rounded-full bg-[#f4ece1] text-[#8c6b3e] flex items-center justify-center font-bold text-[10px]">ZL</span>
                            <span className="w-7 h-7 rounded-full bg-[#f4ece1] text-[#8c6b3e] flex items-center justify-center font-bold text-[10px]">TT</span>
                            <span className="w-7 h-7 rounded-full bg-[#f4ece1] text-[#8c6b3e] flex items-center justify-center font-bold text-[10px]">YT</span>
                          </div>
                        </div>

                        {/* Col 2 */}
                        <div className="space-y-2">
                          <h6 className="font-bold text-[#0e4b44] uppercase tracking-wider">
                            {settingsForm.footerCol2Title || 'DỊCH VỤ TỔ CHỨC'}
                          </h6>
                          <ul className="space-y-1.5 text-stone-600">
                            {footerCol2Text.split('\n').filter(Boolean).map((line, idx) => (
                              <li key={idx}>• {line}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Col 3 */}
                        <div className="space-y-2">
                          <h6 className="font-bold text-[#0e4b44] uppercase tracking-wider">
                            {settingsForm.footerCol3Title || 'CHÍNH SÁCH & CAM KẾT'}
                          </h6>
                          <ul className="space-y-1.5 text-stone-600">
                            {footerCol3Text.split('\n').filter(Boolean).map((line, idx) => (
                              <li key={idx}>• {line}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Col 4 */}
                        <div className="space-y-2">
                          <h6 className="font-bold text-[#0e4b44] uppercase tracking-wider">
                            {settingsForm.footerCol4Title || 'LIÊN HỆ TRỰC TIẾP'}
                          </h6>
                          <p className="text-stone-600 leading-snug">
                            Trụ sở: {settingsForm.address}
                          </p>
                          <p className="text-stone-800 font-bold">
                            Hotline: <span className="text-[#ee5a45]">{settingsForm.hotline}</span>
                          </p>
                          <p className="text-stone-600">
                            Email: {settingsForm.email}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#e8e2d4] text-[11px] text-stone-500 flex justify-between">
                        <span>{settingsForm.footerCopyright || '© 2026 • Tất cả các quyền được bảo lưu.'}</span>
                        <span>Nhà Rạp Thái Đăng</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                    <button
                      type="submit"
                      className="px-8 py-3 rounded-2xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold shadow-md hover:scale-102 transition-transform text-xs cursor-pointer flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Lưu Toàn Bộ Chân Trang & Áp Dụng Ngay</span>
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
                                  toast.success(`Đã chuyển phiên đăng nhập sang: ${staff.fullName} (${ROLE_LABELS[staff.role]})`);
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
      </div>

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
                    onChange={(e) => setThemeService(e.target.value as ThemeModel['service'])}
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

      {/* MODAL THÔNG TIN CÁ NHÂN (PROFILE MODAL) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden text-slate-800">
            {/* Modal Header */}
            <div className="bg-[#0e4b44] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCircle className="w-5 h-5 text-emerald-300" />
                <h3 className="font-bold text-base text-white">Thông Tin Cá Nhân Quản Trị</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Avatar to ở giữa */}
              <div className="flex flex-col items-center pb-4 border-b border-stone-100">
                <div className="w-20 h-20 rounded-3xl bg-stone-100 border border-stone-200 flex items-center justify-center shadow-inner mb-3 text-stone-400">
                  <User className="w-11 h-11" />
                </div>
                <h4 className="font-bold text-lg text-stone-900 text-center">{currentUser.fullName}</h4>
                <div className="text-xs text-stone-500">{currentUser.email}</div>
                <span className="mt-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#0e4b44] border border-emerald-200 uppercase tracking-wider">
                  {ROLE_LABELS[currentUser.role]}
                </span>
              </div>

              {/* Chi tiết tài khoản */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-500 font-medium">Tên đăng nhập:</span>
                  <strong className="text-stone-800 font-mono">{currentUser.email?.split('@')[0]}</strong>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-500 font-medium">Số điện thoại:</span>
                  <strong className="text-stone-800">{currentUser.phone || '0349.481.256'}</strong>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-500 font-medium">Đơn vị công tác:</span>
                  <strong className="text-[#0e4b44]">Nhà Rạp Thái Đăng Palace</strong>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-100">
                  <span className="text-stone-500 font-medium">Trạng thái:</span>
                  <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Đang hoạt động
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    handleLogout();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / CHỈNH SỬA CHUYÊN MỤC CMS & MENU HEADER */}
      {showCatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#0e4b44]" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingCatId ? 'Chỉnh Sửa Chuyên Mục & Menu' : 'Thêm Chuyên Mục Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCatModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên chuyên mục / Nhãn Menu *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trang chủ, Mẫu rạp, Dịch vụ, Thiệp cưới..."
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#c5a059]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã định danh (Slug)</label>
                  <input
                    type="text"
                    placeholder="mau-rap, dich-vu..."
                    value={catSlug}
                    onChange={(e) => setCatSlug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono text-slate-800"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Để trống hệ thống tự sinh theo tên</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thứ tự hiển thị (Sort Order)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={catSortOrder}
                    onChange={(e) => setCatSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Đường dẫn liên kết / Neo cuộn trang (linkUrl) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: #top, #mau-rap, #dich-vu, #thiep-cuoi, #ve-chung-toi, #lien-he"
                  value={catLinkUrl}
                  onChange={(e) => setCatLinkUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium font-mono text-emerald-800"
                />
                <p className="text-[10px] text-slate-500 mt-1">Dùng #id để cuộn mượt đến vị trí tương ứng ngoài website</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả tóm tắt</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả nội dung chuyên mục này..."
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="catIsHeaderNavCheck"
                    checked={catIsHeaderNav}
                    onChange={(e) => setCatIsHeaderNav(e.target.checked)}
                    className="rounded text-[#0e4b44] focus:ring-[#0e4b44] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="catIsHeaderNavCheck" className="font-bold text-slate-800 cursor-pointer">
                    Hiển thị chuyên mục này trên Thanh Menu Header chính (Image 4)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="catIsActiveCheck"
                    checked={catIsActive}
                    onChange={(e) => setCatIsActive(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-600 w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="catIsActiveCheck" className="font-semibold text-slate-700 cursor-pointer">
                    Kích hoạt hoạt động (Cho phép khách hàng truy cập)
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCatModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold shadow-md hover:scale-102 transition-transform cursor-pointer"
                >
                  {editingCatId ? 'Cập Nhật Chuyên Mục' : 'Lưu Chuyên Mục Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM / SỬA SỰ KIỆN THÁNG */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingEventId ? 'Chỉnh Sửa Sự Kiện' : 'Thêm Sự Kiện Tháng Mới'}
              </h3>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên khách hàng / Gia đình *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Anh Nam / Chị Hương"
                  value={eventCustomerName}
                  onChange={(e) => setEventCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời gian hiển thị *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 15/10 (T5)"
                    value={eventDateStr}
                    onChange={(e) => setEventDateStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Loại sự kiện *</label>
                  <select
                    value={eventServiceType}
                    onChange={(e) => setEventServiceType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                  >
                    <option value="Tiệc cưới">Tiệc cưới</option>
                    <option value="Lễ ăn hỏi">Lễ ăn hỏi</option>
                    <option value="Nhà mới">Nhà mới</option>
                    <option value="Sự kiện khác">Sự kiện khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Địa điểm tổ chức *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: xã Cổ Lễ, Ninh Bình"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Trạng thái sự kiện</label>
                <select
                  value={eventStatus}
                  onChange={(e) => setEventStatus(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="sap_dien_ra">⏳ Sắp diễn ra</option>
                  <option value="dang_thuc_hien">⚙ Đang thực hiện</option>
                  <option value="da_hoan_thanh">✓ Đã hoàn thành</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold shadow-md cursor-pointer"
                >
                  Lưu Sự Kiện
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM CÔNG NỢ */}
      {showDebtModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Ghi Nhận Khoản Công Nợ</h3>
              <button onClick={() => setShowDebtModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDebt} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên khách hàng nợ *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Anh Tuấn (xã Cổ Lễ)"
                  value={debtCustomerName}
                  onChange={(e) => setDebtCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ngày hẹn thu</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 15/10"
                    value={debtDate}
                    onChange={(e) => setDebtDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số tiền còn nợ (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    step="500000"
                    placeholder="5000000"
                    value={debtAmount}
                    onChange={(e) => setDebtAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-[#d93025]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDebtModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold shadow-md cursor-pointer"
                >
                  Lưu Công Nợ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: THÊM CẢNH BÁO KHO */}
      {showWarehouseAlertModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Thêm Cảnh Báo Kho</h3>
              <button onClick={() => setShowWarehouseAlertModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouseAlert} className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề cảnh báo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thiếu 30 ghế inox"
                  value={warehouseAlertTitle}
                  onChange={(e) => setWarehouseAlertTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chi tiết cảnh báo</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cho đơn hàng ngày mai tại Cổ Lễ"
                  value={warehouseAlertDetail}
                  onChange={(e) => setWarehouseAlertDetail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mức độ khẩn cấp</label>
                <select
                  value={warehouseAlertSeverity}
                  onChange={(e) => setWarehouseAlertSeverity(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                >
                  <option value="danger">🚨 Nghiêm trọng (Màu đỏ)</option>
                  <option value="warning">⚠️ Cảnh báo vừa (Màu vàng)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWarehouseAlertModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold shadow-md cursor-pointer"
                >
                  Lưu Cảnh Báo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 1: THÊM / SỬA DỤNG CỤ GỐC (HÌNH ẢNH, NGÀY MUA, GIÁ MUA, GIÁ THUÊ)
      ======================================================== */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-[#0e4b44]" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingItemId ? 'Chỉnh Sửa Dụng Cụ Kho' : 'Nhập Đầu Mục Dụng Cụ Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã dụng cụ *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: BAN_TRON, COT_RAP..."
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân loại *</label>
                  <select
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                  >
                    <option value="ban">Bàn sự kiện</option>
                    <option value="ghe">Ghế tiệc</option>
                    <option value="rap">Khung rạp & phụ kiện</option>
                    <option value="am_thanh_anh_sang">Âm thanh - Ánh sáng</option>
                    <option value="dung_cu_tiec">Bát đĩa & dụng cụ tiệc</option>
                    <option value="vat_tu_tieu_hao">Vật tư tiêu hao</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Tên dụng cụ *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Bàn tròn inox sự kiện 1.2m"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn vị tính *</label>
                  <input
                    type="text"
                    required
                    placeholder="cái, bộ, cây..."
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              {/* Hình ảnh dụng cụ */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Link hình ảnh dụng cụ (URL)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://..."
                    value={itemImageUrl}
                    onChange={(e) => setItemImageUrl(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                  {itemImageUrl && (
                    <img
                      src={itemImageUrl}
                      alt="Preview"
                      className="w-10 h-10 rounded-xl object-cover border border-slate-300 shrink-0"
                    />
                  )}
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5 text-[11px] text-slate-500">
                  <span>Ảnh mẫu nhanh:</span>
                  <button
                    type="button"
                    onClick={() => setItemImageUrl('https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500&q=80')}
                    className="text-[#0e4b44] hover:underline"
                  >Bàn tròn</button>
                  •
                  <button
                    type="button"
                    onClick={() => setItemImageUrl('https://images.unsplash.com/photo-1503602642458-232111445657?w=500&q=80')}
                    className="text-[#0e4b44] hover:underline"
                  >Ghế inox</button>
                  •
                  <button
                    type="button"
                    onClick={() => setItemImageUrl('https://images.unsplash.com/photo-1580481077195-c2666a0d4c8e?w=500&q=80')}
                    className="text-[#0e4b44] hover:underline"
                  >Ghế nhựa đỏ</button>
                  •
                  <button
                    type="button"
                    onClick={() => setItemImageUrl('https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=500&q=80')}
                    className="text-[#0e4b44] hover:underline"
                  >Cột rạp</button>
                </div>
              </div>

              {/* Ngày mua & Đơn giá */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Thời điểm mua *</label>
                  <input
                    type="date"
                    required
                    value={itemPurchaseDate}
                    onChange={(e) => setItemPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn giá mua (VND) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    placeholder="Nguyên giá đầu tư"
                    value={itemPurchasePriceVND}
                    onChange={(e) => setItemPurchasePriceVND(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Giá cho thuê lẻ (VND) *</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    required
                    placeholder="Giá thuê 1 ngày"
                    value={itemRentalPriceVND}
                    onChange={(e) => setItemRentalPriceVND(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold text-[#e05638]"
                  />
                </div>
              </div>

              {/* Số lượng sở hữu và đang sửa chữa */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tổng số lượng sở hữu *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={itemTotalOwned}
                    onChange={(e) => setItemTotalOwned(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đang sửa chữa / bảo dưỡng</label>
                  <input
                    type="number"
                    min="0"
                    value={itemInRepair}
                    onChange={(e) => setItemInRepair(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Ghi chú quy cách & bảo quản</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Inox 201 dập hoa văn, xếp chồng gọn gàng"
                  value={itemNotes}
                  onChange={(e) => setItemNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold shadow-md cursor-pointer"
                >
                  {editingItemId ? 'Cập Nhật Dụng Cụ' : 'Lưu Dụng Cụ Vào Kho'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: THÊM / SỬA GÓI BÀN GHẾ GHÉP & BẢNG GIÁ COMBO
      ======================================================== */}
      {showComboModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <LayersIcon className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingComboId ? 'Chỉnh Sửa Gói Bàn Ghế Ghép' : 'Thêm Gói Bàn Ghế Ghép Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowComboModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCombo} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên gói bàn ghế ghép *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bộ Bàn Inox + Ghế Nhựa Đỏ"
                  value={comboName}
                  onChange={(e) => setComboName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mã combo *</label>
                  <input
                    type="text"
                    required
                    placeholder="BAN_INOX_GHE_NHUA"
                    value={comboCode}
                    onChange={(e) => setComboCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn giá trọn bộ (VND) *</label>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    required
                    placeholder="120000"
                    value={comboRentalPriceVND}
                    onChange={(e) => setComboRentalPriceVND(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold text-sm text-[#e05638]"
                  />
                </div>
              </div>

              {/* Lựa chọn linh kiện cấu thành: 1 Bàn + N Ghế */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                <span className="font-bold text-slate-800 block text-xs">Cấu tạo ghép bộ (1 Bàn + N Ghế):</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Chọn loại bàn gốc:</label>
                    <select
                      value={comboTableCode}
                      onChange={(e) => setComboTableCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                    >
                      {catalog.filter(i => i.category === 'ban').map(b => (
                        <option key={b.code} value={b.code}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Chọn loại ghế gốc:</label>
                    <select
                      value={comboChairCode}
                      onChange={(e) => setComboChairCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold"
                    >
                      {catalog.filter(i => i.category === 'ghe').map(g => (
                        <option key={g.code} value={g.code}>{g.name} ({g.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Số lượng ghế trên 1 bàn:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={comboChairsPerTable}
                    onChange={(e) => setComboChairsPerTable(Number(e.target.value))}
                    className="w-32 px-3 py-2 rounded-xl border border-slate-200 bg-white font-bold text-sm"
                  />
                  <span className="text-[11px] text-slate-500 ml-2">(Thường 6 ghế cho mâm gia đình hoặc 10 ghế cho tiệc cưới VIP)</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Link hình ảnh đại diện</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={comboImageUrl}
                  onChange={(e) => setComboImageUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả gói bàn ghế</label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Thích hợp cho đám cưới quê hoặc liên hoan gia đình, tiết kiệm chi phí..."
                  value={comboDescription}
                  onChange={(e) => setComboDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowComboModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold shadow-md cursor-pointer"
                >
                  {editingComboId ? 'Cập Nhật Gói Combo' : 'Tạo Gói Bàn Ghế'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: CẤU HÌNH ĐỊNH MỨC KHUNG RẠP GHÉP (TENT BOM)
      ======================================================== */}
      {showTentConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 max-h-[90vh] overflow-y-auto text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Hammer className="w-5 h-5 text-purple-700" />
                <h3 className="font-bold text-slate-900 text-base">Định Mức Chi Tiết 1 Khung Rạp (BOM)</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTentConfigModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTentConfig} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên cấu hình khung rạp</label>
                <input
                  type="text"
                  required
                  value={tentConfigName}
                  onChange={(e) => setTentConfigName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Khẩu độ ngang (mét)</label>
                  <input
                    type="number"
                    min="2"
                    max="20"
                    value={tentConfigBayWidth}
                    onChange={(e) => setTentConfigBayWidth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Đơn giá thuê 1 khung (VND)</label>
                  <input
                    type="number"
                    min="0"
                    step="10000"
                    value={tentConfigRentalPrice}
                    onChange={(e) => setTentConfigRentalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-bold text-[#e05638]"
                  />
                </div>
              </div>

              {/* Danh sách định mức từng dụng cụ cấu thành 1 khung */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-800">
                  Định mức dụng cụ gốc cấu thành 1 khung ({tentConfigBayWidth}m x 3m):
                </label>
                <div className="space-y-2 border border-slate-200 rounded-2xl p-3 bg-stone-50">
                  {tentConfigBom.map((comp, idx) => (
                    <div key={comp.itemCode} className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-slate-200 text-xs">
                      <div className="flex-1">
                        <span className="font-bold text-slate-900 block">{comp.itemName}</span>
                        <span className="font-mono text-[10px] text-slate-400">{comp.itemCode}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={comp.quantityPerBay}
                          onChange={(e) => {
                            const newBom = [...tentConfigBom];
                            newBom[idx].quantityPerBay = Math.max(1, parseInt(e.target.value) || 1);
                            setTentConfigBom(newBom);
                          }}
                          className="w-16 px-2 py-1 rounded-lg border border-slate-300 font-bold text-center text-xs"
                        />
                        <span className="font-semibold text-slate-600 text-xs w-8">{comp.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả cấu hình</label>
                <textarea
                  rows={2}
                  value={tentConfigDesc}
                  onChange={(e) => setTentConfigDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTentConfigModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0e4b44] hover:bg-[#155e55] text-white font-bold shadow-md cursor-pointer"
                >
                  Lưu Định Mức Khung Rạp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
