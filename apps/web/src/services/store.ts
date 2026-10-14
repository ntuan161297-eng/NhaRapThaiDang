// apps/web/src/services/store.ts
import {
  IntakeRecord,
  JobRecord,
  InventoryItem,
  InventoryReservation,
  PaymentReceipt,
  QuoteRecord,
  InAppNotification,
  AuditLogEntry,
  UserProfile,
  UserRole,
  InventoryCheckResult,
  IntakeSurvey,
} from '@thai-dang/shared';
import { ITEM_CODES, convertTableChairConfigs } from '@thai-dang/shared';
import { 
  checkInventoryAvailability, 
  dispatchReservedItems, 
  handleJobCancellationReservations 
} from '@thai-dang/shared';
import { 
  confirmIntakeToJob, 
  canConfirmIntake, 
  canSkipSurvey,
  aggregateAllIntakeDemands 
} from '@thai-dang/shared';
import { RBAC } from '@thai-dang/shared';
import { CONTACT_CONFIG } from '../config/contact';

export interface CustomerAccount {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
  totalBookings: number;
  isVip: boolean;
  notes?: string;
}

export interface ArticleRecord {
  id: string;
  title: string;
  slug: string;
  category: 'kinh_nghiem_cuoi' | 'xu_huong_rap' | 'uu_dai_su_kien' | 'thuc_don_co';
  summary: string;
  content: string;
  imageUrl?: string;
  views: number;
  isPublished: boolean;
  publishedAt: string;
  author: string;
}

export interface PromotionBanner {
  id: string;
  title: string;
  discountText: string;
  validUntil: string;
  code: string;
  description: string;
  badge: string;
  isActive: boolean;
}

export interface CompanyInfo {
  brandName: string;
  slogan: string;
  hotline: string;
  secondaryPhone?: string;
  zaloPhone: string;
  facebookFanpageUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
  address: string;
  email: string;
  workingHours: string;
  googleMapsUrl?: string;
  // Cấu hình quản trị Chân trang (Footer CMS - Toàn quyền quản trị nội dung)
  footerSloganTitle?: string;
  footerCol2Title?: string;
  footerCol2Items?: string[];
  footerCol3Title?: string;
  footerCol3Items?: string[];
  footerCol4Title?: string;
  footerCopyright?: string;
}

export interface CmsCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  itemCount: number;
  isActive: boolean;
  linkUrl?: string; // Liên kết điều hướng (ví dụ: #mau-rap, #dich-vu, #thiep-cuoi...)
  sortOrder?: number; // Thứ tự hiển thị
  isHeaderNav?: boolean; // Bật/tắt hiển thị trên thanh Menu Header
}

export interface CmsPartnerPhoto {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  caption: string;
  sortOrder: number;
}

export interface CmsBannerSlide {
  id: string;
  slideNumber: string;
  title: string;
  subtitle: string;
  locationTag: string;
  imageUrl: string;
  ctaText1: string;
  ctaLink1: string;
  ctaText2: string;
  ctaLink2: string;
  isActive: boolean;
}

export interface ThemeModel {
  id: string;
  name: string;
  titleEn: string;
  service: 'dam_cuoi' | 'nha_moi' | 'dam_hoi';
  desc: string;
  badge: string;
  specs: string;
  imageUrl: string;
  detailImages?: string[];
  fengShuiElement: string;
  fengShuiAges: string;
  fengShuiMeaning: string;
  fengShuiFlowers: string;
  accentColor?: string;
  isActive: boolean;
}

export interface MonthEventItem {
  id: string;
  dateStr: string;
  customerName: string;
  eventType: string;
  location: string;
  status: 'da_hoan_thanh' | 'dang_thuc_hien' | 'sap_dien_ra';
  isCurrentToday?: boolean;
}

export interface ReminderTask {
  id: string;
  time: string;
  title: string;
  isDone: boolean;
}

export interface DebtItem {
  id: string;
  customerName: string;
  date: string;
  amount: number;
}

export interface WarehouseAlertItem {
  id: string;
  title: string;
  detail: string;
  severity: 'danger' | 'warning';
  iconType: 'chairs' | 'tents';
}

// Danh mục kho ban đầu với dữ liệu nghiệm thu thực tế
const INITIAL_CATALOG: InventoryItem[] = [
  {
    id: 'ITEM-01',
    code: ITEM_CODES.BAN_TRON,
    name: 'Bàn tròn inox sự kiện 1.2m',
    category: 'ban',
    unit: 'cái',
    totalOwnedQuantity: 50,
    inRepairQuantity: 5, // 5 cái đang sửa -> Thực tế: 45
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.10,
    cleaningTurnaroundHours: 3,
  },
  {
    id: 'ITEM-02',
    code: ITEM_CODES.BAN_DAI,
    name: 'Bàn dài chữ nhật đại biểu 1.6m',
    category: 'ban',
    unit: 'cái',
    totalOwnedQuantity: 20,
    inRepairQuantity: 0,
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.10,
    cleaningTurnaroundHours: 2,
  },
  {
    id: 'ITEM-03',
    code: ITEM_CODES.GHE_INOX,
    name: 'Ghế đôn inox tròn phi 22',
    category: 'ghe',
    unit: 'cái',
    totalOwnedQuantity: 220,
    inRepairQuantity: 0,
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.10,
    cleaningTurnaroundHours: 2,
  },
  {
    id: 'ITEM-04',
    code: ITEM_CODES.GHE_NHUA_DO,
    name: 'Ghế nhựa đỏ tựa lưng Song Long',
    category: 'ghe',
    unit: 'cái',
    totalOwnedQuantity: 120,
    inRepairQuantity: 10, // 10 cái đang sửa -> Thực tế: 110
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.10,
    cleaningTurnaroundHours: 2,
  },
  {
    id: 'ITEM-05',
    code: ITEM_CODES.KHUNG_RAP_KHOANG,
    name: 'Khung rạp sắt mạ kẽm khẩu độ 6m (theo khoang)',
    category: 'rap',
    unit: 'khoang',
    totalOwnedQuantity: 30,
    inRepairQuantity: 0,
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.05,
    cleaningTurnaroundHours: 4,
  },
  {
    id: 'ITEM-06',
    code: ITEM_CODES.BAT_MAI_KHOANG,
    name: 'Bạt mái che 2 da Hàn Quốc chống nóng',
    category: 'rap',
    unit: 'tấm',
    totalOwnedQuantity: 30,
    inRepairQuantity: 0,
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.05,
    cleaningTurnaroundHours: 3,
  },
  {
    id: 'ITEM-07',
    code: ITEM_CODES.VACH_RAP_SET,
    name: 'Vách rèm lụa quây rạp màu trắng sữa',
    category: 'rap',
    unit: 'tấm',
    totalOwnedQuantity: 60,
    inRepairQuantity: 0,
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.05,
    cleaningTurnaroundHours: 2,
  },
  {
    id: 'ITEM-08',
    code: ITEM_CODES.DEN_CHUM_LED,
    name: 'Đèn chùm pha lê LED cao cấp thả rạp',
    category: 'rap',
    unit: 'bộ',
    totalOwnedQuantity: 15,
    inRepairQuantity: 1,
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.10,
    cleaningTurnaroundHours: 2,
  },
  {
    id: 'ITEM-09',
    code: ITEM_CODES.LOA_DAI_SU_KIEN,
    name: 'Dàn âm thanh array mini 4 sub 4 full',
    category: 'am_thanh_anh_sang',
    unit: 'bộ',
    totalOwnedQuantity: 5,
    inRepairQuantity: 0,
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.10,
    cleaningTurnaroundHours: 4,
  },
  {
    id: 'ITEM-10',
    code: ITEM_CODES.BINH_GAS_CONG_NGHIEP,
    name: 'Bình gas công nghiệp nấu cỗ',
    category: 'vat_tu_tieu_hao',
    unit: 'kg',
    totalOwnedQuantity: 180,
    inRepairQuantity: 0,
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.00,
    cleaningTurnaroundHours: 0,
  },
];

// Danh sách Hồ sơ tiếp nhận ban đầu (3 đám cưới, 1 nhà mới, 1 đám hiếu)
const INITIAL_INTAKES: IntakeRecord[] = [
  {
    id: 'INTAKE-001',
    code: 'TD-202610-001',
    source: 'website',
    customerName: 'Anh Tuấn Anh & Chị Mai Linh',
    customerPhone: '0912345678',
    customerEmail: 'tuananh@gmail.com',
    serviceType: 'dam_cuoi',
    eventDateStart: '2026-10-24T10:30:00+07:00',
    eventDateEnd: '2026-10-24T14:00:00+07:00',
    setupDateStart: '2026-10-23T14:00:00+07:00',
    teardownDateEnd: '2026-10-24T19:00:00+07:00',
    eventAddress: 'Số 120 Đường Lê Lợi, TP. Bắc Giang',
    status: 'da_xac_nhan',
    confirmedJobId: 'JOB-202610-001',
    tableChairConfigs: [
      { area: 'Rạp chính', tableType: 'ban_tron', chairType: 'ghe_inox', tableCount: 20, chairsPerTable: 6 },
      { area: 'Rạp cỗ phụ', tableType: 'ban_tron', chairType: 'ghe_nhua_do', tableCount: 10, chairsPerTable: 6 },
    ],
    tentConfigs: [
      { tentType: 'rap_chinh', themeId: 'hoang_gia', themeName: 'Tone Trắng Vàng Hoàng Gia', bayCount: 6 }
    ],
    cateringConfigs: [
      { trayCount: 30, peoplePerTray: 6, menuName: 'Thực đơn tiệc cưới cao cấp 8 món', serviceRounds: 1, provider: 'thai_dang' }
    ],
    survey: {
      addressDetail: 'Mặt đường lớn Lê Lợi, vỉa hè rộng 6m',
      roadNote: 'Xe tải 2.5T đỗ tận cửa, có nguồn điện 3 pha ổn định',
      groundSize: 'Ngang 12m, Sâu 25m',
      locationPrecision: 'chinh_xac',
      surveyorName: 'Nguyễn Văn Thái (Chủ đơn vị)',
    },
    note: 'Gia đình chú rể đặt trước 30 mâm cỗ. Cần trang trí rạp lộng lẫy.',
    createdAt: '2026-10-10T08:30:00+07:00',
    updatedAt: '2026-10-10T11:00:00+07:00',
  },
  {
    id: 'INTAKE-002',
    code: 'TD-202610-002',
    source: 'truc_tiep',
    customerName: 'Anh Quốc Bảo & Chị Lan Hương',
    customerPhone: '0987654321',
    customerEmail: 'quocbao@outlook.com',
    serviceType: 'dam_cuoi',
    eventDateStart: '2026-10-24T17:00:00+07:00',
    eventDateEnd: '2026-10-24T21:00:00+07:00',
    setupDateStart: '2026-10-23T16:00:00+07:00',
    teardownDateEnd: '2026-10-25T09:00:00+07:00',
    eventAddress: 'Thôn Tam Tầng, Xã Quang Châu, Huyện Việt Yên',
    status: 'da_xac_nhan',
    confirmedJobId: 'JOB-202610-002',
    tableChairConfigs: [
      { area: 'Sân tiệc cưới Rustic', tableType: 'ban_tron', chairType: 'ghe_inox', tableCount: 15, chairsPerTable: 6, extraChairs: 10 },
    ],
    tentConfigs: [
      { tentType: 'rap_chinh', themeId: 'rustic_green', themeName: 'Tone Xanh Lá Rustic Cổ Điển', bayCount: 5 }
    ],
    survey: {
      addressDetail: 'Sân nhà vườn rộng rãi, cổng vào 3.5m',
      roadNote: 'Xe tải 1.5T vào được sân, bê bộ 15m',
      groundSize: 'Ngang 10m x Dài 20m',
      locationPrecision: 'chinh_xac',
      surveyorName: 'Trần Văn Đăng',
    },
    note: 'Khách yêu cầu đèn chùm trang trí trần rạp ấm cúng.',
    createdAt: '2026-10-11T09:00:00+07:00',
    updatedAt: '2026-10-11T14:00:00+07:00',
  },
  {
    id: 'INTAKE-003',
    code: 'TD-202610-003',
    source: 'dien_thoai',
    customerName: 'Anh Nguyễn Trọng Hưng',
    customerPhone: '0966889900',
    serviceType: 'nha_moi',
    eventDateStart: '2026-10-24T11:00:00+07:00',
    eventDateEnd: '2026-10-24T14:00:00+07:00',
    setupDateStart: '2026-10-24T06:00:00+07:00',
    teardownDateEnd: '2026-10-24T17:00:00+07:00',
    eventAddress: 'Khu Biệt Thự Song Mai, TP. Bắc Giang',
    status: 'da_xac_nhan',
    confirmedJobId: 'JOB-202610-003',
    tableChairConfigs: [
      { area: 'Sân trước tân gia', tableType: 'ban_tron', chairType: 'ghe_nhua_do', tableCount: 8, chairsPerTable: 6 },
    ],
    tentConfigs: [
      { tentType: 'rap_chinh', themeId: 'hien_dai', themeName: 'Rạp che nắng hiện đại', bayCount: 3 }
    ],
    survey: {
      addressDetail: 'Khu liền kề biệt thự mới xây',
      roadNote: 'Đường nhựa 8m xe tải lớn đỗ thoải mái',
      groundSize: 'Sân trước 6m x 15m',
      locationPrecision: 'chinh_xac',
      surveyorName: 'Nguyễn Văn Thái',
    },
    note: 'Làm tiệc trưa tân gia đơn giản, gọn nhẹ trong ngày 24.',
    createdAt: '2026-10-11T15:00:00+07:00',
    updatedAt: '2026-10-12T08:00:00+07:00',
  },
  {
    id: 'INTAKE-004',
    code: 'TD-202610-004',
    source: 'website',
    customerName: 'Anh Minh Đức & Chị Thu Trang',
    customerPhone: '0933221100',
    customerEmail: 'duc.minh@gmail.com',
    serviceType: 'dam_cuoi',
    eventDateStart: '2026-10-28T10:30:00+07:00',
    eventDateEnd: '2026-10-28T14:00:00+07:00',
    setupDateStart: '2026-10-27T14:00:00+07:00',
    teardownDateEnd: '2026-10-28T18:00:00+07:00',
    eventAddress: 'Thị trấn Thắng, Huyện Hiệp Hòa',
    status: 'cho_xac_nhan',
    tableChairConfigs: [
      { area: 'Rạp cưới chính', tableType: 'ban_tron', chairType: 'ghe_inox', tableCount: 25, chairsPerTable: 6 },
    ],
    tentConfigs: [
      { tentType: 'rap_chinh', themeId: 'truyen_thong_do', themeName: 'Tone Đỏ Truyền Thống Hỷ Sự', bayCount: 6 }
    ],
    survey: {
      addressDetail: 'Phố Thắng, gần trung tâm văn hóa huyện',
      roadNote: 'Mặt đường rộng nhưng giờ cao điểm đông xe',
      locationPrecision: 'uoc_luong',
    },
    note: 'Khách thích rạp tone đỏ, đã gọi tư vấn bước 1.',
    createdAt: '2026-10-12T09:15:00+07:00',
    updatedAt: '2026-10-12T10:00:00+07:00',
  },
  {
    id: 'INTAKE-005',
    code: 'TD-202610-005',
    source: 'dien_thoai',
    customerName: 'Đại diện gia đình: Ông Trần Văn Cần',
    customerPhone: '0944556677',
    serviceType: 'dam_hieu',
    eventDateStart: '2026-10-10T07:00:00+07:00',
    eventDateEnd: '2026-10-11T16:00:00+07:00',
    setupDateStart: '2026-10-09T14:00:00+07:00',
    teardownDateEnd: '2026-10-11T19:00:00+07:00',
    eventAddress: 'Thôn Tân Hưng, Xã Phi Mô, Huyện Lạng Giang',
    status: 'da_xac_nhan',
    confirmedJobId: 'JOB-202610-005',
    tableChairConfigs: [
      { area: 'Rạp tang lễ', tableType: 'ban_tron', chairType: 'ghe_inox', tableCount: 8, chairsPerTable: 6 },
    ],
    tentConfigs: [
      { tentType: 'rap_chinh', themeId: 'trang_nghiem', themeName: 'Rạp Đám Hiếu Trang Nghiêm', bayCount: 3 }
    ],
    note: 'Tang lễ Cụ Bà Nguyễn Thị Thịnh. Sự kiện đã kết thúc nhưng thiết bị quá hạn chưa thu hồi.',
    createdAt: '2026-10-09T08:00:00+07:00',
    updatedAt: '2026-10-11T20:00:00+07:00',
  },
];

// Jobs ban đầu
const INITIAL_JOBS: JobRecord[] = [
  {
    id: 'JOB-202610-001',
    code: 'JOB-202610-001',
    intakeId: 'INTAKE-001',
    customerName: 'Anh Tuấn Anh & Chị Mai Linh',
    customerPhone: '0912345678',
    serviceType: 'dam_cuoi',
    eventAddress: 'Số 120 Đường Lê Lợi, TP. Bắc Giang',
    status: 'chua_thuc_hien',
    eventDateStart: '2026-10-24T10:30:00+07:00',
    eventDateEnd: '2026-10-24T14:00:00+07:00',
    equipmentUsageStart: '2026-10-23T14:00:00+07:00',
    equipmentUsageEnd: '2026-10-24T19:00:00+07:00',
    tasks: [
      { id: 'TASK-1-1', jobId: 'JOB-202610-001', taskType: 'chuan_bi', title: 'Chuẩn bị khung rạp, 30 bàn tròn, 120 ghế inox, 60 ghế nhựa tại kho', scheduledStartTime: '2026-10-23T10:00:00+07:00', scheduledEndTime: '2026-10-23T12:00:00+07:00', assignedPersonOrTeam: 'Đội kho Thái Đăng', status: 'hoan_thanh' },
      { id: 'TASK-1-2', jobId: 'JOB-202610-001', taskType: 'xuat_kho', title: 'Xuất kho và bốc xếp lên xe tải 2.5T', scheduledStartTime: '2026-10-23T12:00:00+07:00', scheduledEndTime: '2026-10-23T13:30:00+07:00', assignedPersonOrTeam: 'Thủ kho & Lái xe Tuấn', status: 'chua_bat_dau' },
      { id: 'TASK-1-3', jobId: 'JOB-202610-001', taskType: 'van_chuyen', title: 'Vận chuyển đến 120 Lê Lợi', scheduledStartTime: '2026-10-23T13:30:00+07:00', scheduledEndTime: '2026-10-23T14:00:00+07:00', assignedPersonOrTeam: 'Đội xe vận tải', status: 'chua_bat_dau' },
      { id: 'TASK-1-4', jobId: 'JOB-202610-001', taskType: 'lap_dat', title: 'Dựng rạp 6 khoang hoàng gia, kê 30 bàn cỗ & đấu nối đèn chùm', scheduledStartTime: '2026-10-23T14:00:00+07:00', scheduledEndTime: '2026-10-23T20:00:00+07:00', assignedPersonOrTeam: 'Đội thi công rạp Thái Đăng (6 người)', status: 'chua_bat_dau' },
      { id: 'TASK-1-5', jobId: 'JOB-202610-001', taskType: 'phuc_vu', title: 'Trực kỹ thuật âm thanh ánh sáng buổi hôn lễ', scheduledStartTime: '2026-10-24T10:30:00+07:00', scheduledEndTime: '2026-10-24T14:00:00+07:00', assignedPersonOrTeam: 'Kỹ thuật viên Quang', status: 'chua_bat_dau' },
      { id: 'TASK-1-6', jobId: 'JOB-202610-001', taskType: 'thao_do_thu_hoi', title: 'Tháo dỡ phông rạp, thu gom bàn ghế & bốc xếp lên xe', scheduledStartTime: '2026-10-24T14:30:00+07:00', scheduledEndTime: '2026-10-24T18:00:00+07:00', assignedPersonOrTeam: 'Đội thi công & thu hồi', status: 'chua_bat_dau' },
      { id: 'TASK-1-7', jobId: 'JOB-202610-001', taskType: 'kiem_tra_tra', title: 'Kiểm tra trả dụng cụ, vệ sinh & nhập kho Thái Đăng', scheduledStartTime: '2026-10-24T18:00:00+07:00', scheduledEndTime: '2026-10-24T20:00:00+07:00', assignedPersonOrTeam: 'Thủ kho & KCS', status: 'chua_bat_dau' },
    ],
    tableChairConfigs: [
      { area: 'Rạp chính', tableType: 'ban_tron', chairType: 'ghe_inox', tableCount: 20, chairsPerTable: 6 },
      { area: 'Rạp cỗ phụ', tableType: 'ban_tron', chairType: 'ghe_nhua_do', tableCount: 10, chairsPerTable: 6 },
    ],
    itemsSnapshot: [
      { itemCode: 'BAN_TRON', itemName: 'Bàn tròn inox sự kiện 1.2m', quantity: 30, unit: 'cái' },
      { itemCode: 'GHE_INOX', itemName: 'Ghế đôn inox tròn phi 22', quantity: 120, unit: 'cái' },
      { itemCode: 'GHE_NHUA_DO', itemName: 'Ghế nhựa đỏ tựa lưng Song Long', quantity: 60, unit: 'cái' },
      { itemCode: 'KHUNG_RAP_KHOANG', itemName: 'Khung rạp (khoang)', quantity: 6, unit: 'khoang' },
    ],
    isInventoryReturned: false,
    isFullyPaid: false,
    createdAt: '2026-10-10T11:00:00+07:00',
    updatedAt: '2026-10-10T11:00:00+07:00',
  },
  {
    id: 'JOB-202610-002',
    code: 'JOB-202610-002',
    intakeId: 'INTAKE-002',
    customerName: 'Anh Quốc Bảo & Chị Lan Hương',
    customerPhone: '0987654321',
    serviceType: 'dam_cuoi',
    eventAddress: 'Thôn Tam Tầng, Xã Quang Châu, Huyện Việt Yên',
    status: 'chua_thuc_hien',
    eventDateStart: '2026-10-24T17:00:00+07:00',
    eventDateEnd: '2026-10-24T21:00:00+07:00',
    equipmentUsageStart: '2026-10-23T16:00:00+07:00',
    equipmentUsageEnd: '2026-10-25T09:00:00+07:00',
    tasks: [
      { id: 'TASK-2-1', jobId: 'JOB-202610-002', taskType: 'chuan_bi', title: 'Chuẩn bị thiết bị rạp rustic', scheduledStartTime: '2026-10-23T13:00:00+07:00', scheduledEndTime: '2026-10-23T15:00:00+07:00', assignedPersonOrTeam: 'Đội kho', status: 'chua_bat_dau' },
      { id: 'TASK-2-2', jobId: 'JOB-202610-002', taskType: 'xuat_kho', title: 'Xuất kho đồ cưới Việt Yên', scheduledStartTime: '2026-10-23T15:00:00+07:00', scheduledEndTime: '2026-10-23T16:00:00+07:00', assignedPersonOrTeam: 'Thủ kho', status: 'chua_bat_dau' },
      { id: 'TASK-2-3', jobId: 'JOB-202610-002', taskType: 'van_chuyen', title: 'Chuyển về Quang Châu', scheduledStartTime: '2026-10-23T16:00:00+07:00', scheduledEndTime: '2026-10-23T17:00:00+07:00', assignedPersonOrTeam: 'Lái xe Hùng', status: 'chua_bat_dau' },
      { id: 'TASK-2-4', jobId: 'JOB-202610-002', taskType: 'lap_dat', title: 'Lắp rạp rustic 5 khoang', scheduledStartTime: '2026-10-23T17:00:00+07:00', scheduledEndTime: '2026-10-23T22:00:00+07:00', assignedPersonOrTeam: 'Đội thi công rạp (4 người)', status: 'chua_bat_dau' },
      { id: 'TASK-2-5', jobId: 'JOB-202610-002', taskType: 'phuc_vu', title: 'Hỗ trợ tiệc tối', scheduledStartTime: '2026-10-24T17:00:00+07:00', scheduledEndTime: '2026-10-24T21:00:00+07:00', assignedPersonOrTeam: 'Kỹ thuật viên', status: 'chua_bat_dau' },
      { id: 'TASK-2-6', jobId: 'JOB-202610-002', taskType: 'thao_do_thu_hoi', title: 'Thu hồi sáng 25/10', scheduledStartTime: '2026-10-25T06:00:00+07:00', scheduledEndTime: '2026-10-25T08:30:00+07:00', assignedPersonOrTeam: 'Đội thu hồi', status: 'chua_bat_dau' },
      { id: 'TASK-2-7', jobId: 'JOB-202610-002', taskType: 'kiem_tra_tra', title: 'Kiểm đếm nhập kho', scheduledStartTime: '2026-10-25T08:30:00+07:00', scheduledEndTime: '2026-10-25T10:00:00+07:00', assignedPersonOrTeam: 'Thủ kho', status: 'chua_bat_dau' },
    ],
    tableChairConfigs: [
      { area: 'Sân cưới Rustic', tableType: 'ban_tron', chairType: 'ghe_inox', tableCount: 15, chairsPerTable: 6, extraChairs: 10 },
    ],
    itemsSnapshot: [
      { itemCode: 'BAN_TRON', itemName: 'Bàn tròn', quantity: 15, unit: 'cái' },
      { itemCode: 'GHE_INOX', itemName: 'Ghế đôn inox tròn phi 22', quantity: 100, unit: 'cái' },
      { itemCode: 'KHUNG_RAP_KHOANG', itemName: 'Khung rạp', quantity: 5, unit: 'khoang' },
    ],
    isInventoryReturned: false,
    isFullyPaid: false,
    createdAt: '2026-10-11T14:00:00+07:00',
    updatedAt: '2026-10-11T14:00:00+07:00',
  },
  {
    id: 'JOB-202610-003',
    code: 'JOB-202610-003',
    intakeId: 'INTAKE-003',
    customerName: 'Anh Nguyễn Trọng Hưng',
    customerPhone: '0966889900',
    serviceType: 'nha_moi',
    eventAddress: 'Khu Biệt Thự Song Mai, TP. Bắc Giang',
    status: 'chua_thuc_hien',
    eventDateStart: '2026-10-24T11:00:00+07:00',
    eventDateEnd: '2026-10-24T14:00:00+07:00',
    equipmentUsageStart: '2026-10-24T06:00:00+07:00',
    equipmentUsageEnd: '2026-10-24T17:00:00+07:00',
    tasks: [
      { id: 'TASK-3-1', jobId: 'JOB-202610-003', taskType: 'chuan_bi', title: 'Chuẩn bị 8 bàn tròn, 48 ghế nhựa đỏ', scheduledStartTime: '2026-10-24T05:00:00+07:00', scheduledEndTime: '2026-10-24T06:00:00+07:00', assignedPersonOrTeam: 'Đội kho', status: 'chua_bat_dau' },
      { id: 'TASK-3-2', jobId: 'JOB-202610-003', taskType: 'xuat_kho', title: 'Xuất kho xe tải 1.25T', scheduledStartTime: '2026-10-24T06:00:00+07:00', scheduledEndTime: '2026-10-24T06:30:00+07:00', assignedPersonOrTeam: 'Thủ kho', status: 'chua_bat_dau' },
      { id: 'TASK-3-3', jobId: 'JOB-202610-003', taskType: 'van_chuyen', title: 'Chở về Song Mai', scheduledStartTime: '2026-10-24T06:30:00+07:00', scheduledEndTime: '2026-10-24T07:00:00+07:00', assignedPersonOrTeam: 'Lái xe Tuấn', status: 'chua_bat_dau' },
      { id: 'TASK-3-4', jobId: 'JOB-202610-003', taskType: 'lap_dat', title: 'Dựng rạp 3 khoang & kê bàn ghế', scheduledStartTime: '2026-10-24T07:00:00+07:00', scheduledEndTime: '2026-10-24T09:30:00+07:00', assignedPersonOrTeam: 'Đội thi công (3 người)', status: 'chua_bat_dau' },
      { id: 'TASK-3-5', jobId: 'JOB-202610-003', taskType: 'phuc_vu', title: 'Trực tiệc tân gia', scheduledStartTime: '2026-10-24T11:00:00+07:00', scheduledEndTime: '2026-10-24T14:00:00+07:00', assignedPersonOrTeam: 'Nhân viên hiện trường', status: 'chua_bat_dau' },
      { id: 'TASK-3-6', jobId: 'JOB-202610-003', taskType: 'thao_do_thu_hoi', title: 'Tháo dỡ thu hồi sau tiệc', scheduledStartTime: '2026-10-24T14:30:00+07:00', scheduledEndTime: '2026-10-24T16:30:00+07:00', assignedPersonOrTeam: 'Đội thu hồi', status: 'chua_bat_dau' },
      { id: 'TASK-3-7', jobId: 'JOB-202610-003', taskType: 'kiem_tra_tra', title: 'Kiểm tra trả kho', scheduledStartTime: '2026-10-24T16:30:00+07:00', scheduledEndTime: '2026-10-24T17:30:00+07:00', assignedPersonOrTeam: 'Thủ kho', status: 'chua_bat_dau' },
    ],
    tableChairConfigs: [
      { area: 'Sân tiệc tân gia', tableType: 'ban_tron', chairType: 'ghe_nhua_do', tableCount: 8, chairsPerTable: 6 },
    ],
    itemsSnapshot: [
      { itemCode: 'BAN_TRON', itemName: 'Bàn tròn', quantity: 8, unit: 'cái' },
      { itemCode: 'GHE_NHUA_DO', itemName: 'Ghế nhựa đỏ', quantity: 48, unit: 'cái' },
      { itemCode: 'KHUNG_RAP_KHOANG', itemName: 'Khung rạp', quantity: 3, unit: 'khoang' },
    ],
    isInventoryReturned: false,
    isFullyPaid: false,
    createdAt: '2026-10-12T08:00:00+07:00',
    updatedAt: '2026-10-12T08:00:00+07:00',
  },
  {
    id: 'JOB-202610-005',
    code: 'JOB-202610-005',
    intakeId: 'INTAKE-005',
    customerName: 'Đại diện gia đình: Ông Trần Văn Cần',
    customerPhone: '0944556677',
    serviceType: 'dam_hieu',
    eventAddress: 'Thôn Tân Hưng, Xã Phi Mô, Huyện Lạng Giang',
    status: 'da_hoan_thanh',
    eventDateStart: '2026-10-10T07:00:00+07:00',
    eventDateEnd: '2026-10-11T16:00:00+07:00',
    equipmentUsageStart: '2026-10-09T14:00:00+07:00',
    equipmentUsageEnd: '2026-10-11T19:00:00+07:00',
    tasks: [
      { id: 'TASK-5-1', jobId: 'JOB-202610-005', taskType: 'chuan_bi', title: 'Chuẩn bị đồ đám hiếu', scheduledStartTime: '2026-10-09T11:00:00+07:00', scheduledEndTime: '2026-10-09T13:00:00+07:00', assignedPersonOrTeam: 'Đội kho', status: 'hoan_thanh' },
      { id: 'TASK-5-2', jobId: 'JOB-202610-005', taskType: 'xuat_kho', title: 'Xuất kho thiết bị', scheduledStartTime: '2026-10-09T13:00:00+07:00', scheduledEndTime: '2026-10-09T14:00:00+07:00', assignedPersonOrTeam: 'Thủ kho', status: 'hoan_thanh' },
      { id: 'TASK-5-3', jobId: 'JOB-202610-005', taskType: 'van_chuyen', title: 'Vận chuyển', scheduledStartTime: '2026-10-09T14:00:00+07:00', scheduledEndTime: '2026-10-09T15:00:00+07:00', assignedPersonOrTeam: 'Lái xe', status: 'hoan_thanh' },
      { id: 'TASK-5-4', jobId: 'JOB-202610-005', taskType: 'lap_dat', title: 'Dựng rạp đám hiếu', scheduledStartTime: '2026-10-09T15:00:00+07:00', scheduledEndTime: '2026-10-09T18:00:00+07:00', assignedPersonOrTeam: 'Đội thi công', status: 'hoan_thanh' },
      { id: 'TASK-5-5', jobId: 'JOB-202610-005', taskType: 'phuc_vu', title: 'Trực lễ tang', scheduledStartTime: '2026-10-10T07:00:00+07:00', scheduledEndTime: '2026-10-11T16:00:00+07:00', assignedPersonOrTeam: 'Nhân viên hiện trường', status: 'hoan_thanh' },
      { id: 'TASK-5-6', jobId: 'JOB-202610-005', taskType: 'thao_do_thu_hoi', title: 'Thu hồi thiết bị (QUÁ HẠN CHƯA THỰC HIỆN)', scheduledStartTime: '2026-10-11T16:30:00+07:00', scheduledEndTime: '2026-10-11T18:30:00+07:00', assignedPersonOrTeam: 'Đội thu hồi', status: 'dang_xu_ly' },
      { id: 'TASK-5-7', jobId: 'JOB-202610-005', taskType: 'kiem_tra_tra', title: 'Kiểm tra trả kho (CHƯA THỰC HIỆN)', scheduledStartTime: '2026-10-11T19:00:00+07:00', scheduledEndTime: '2026-10-11T20:00:00+07:00', assignedPersonOrTeam: 'Thủ kho', status: 'chua_bat_dau' },
    ],
    tableChairConfigs: [
      { area: 'Rạp tang lễ', tableType: 'ban_tron', chairType: 'ghe_inox', tableCount: 8, chairsPerTable: 6 },
    ],
    itemsSnapshot: [
      { itemCode: 'BAN_TRON', itemName: 'Bàn tròn', quantity: 8, unit: 'cái' },
      { itemCode: 'GHE_INOX', itemName: 'Ghế inox', quantity: 48, unit: 'cái' },
      { itemCode: 'KHUNG_RAP_KHOANG', itemName: 'Khung rạp', quantity: 3, unit: 'khoang' },
    ],
    isInventoryReturned: false, // RÕ RÀNG: Job hoàn thành nhưng CHƯA ĐƯỢC ĐÁNH DẤU TRẢ KHO
    isFullyPaid: true,
    createdAt: '2026-10-09T08:00:00+07:00',
    updatedAt: '2026-10-11T20:00:00+07:00',
  },
];

// Bản ghi giữ kho ban đầu (Held & Dispatched)
const INITIAL_RESERVATIONS: InventoryReservation[] = [
  // Ca 1: Job 1 giữ (held)
  { id: 'RES-001-BAN', jobId: 'JOB-202610-001', itemCode: 'BAN_TRON', requestedQuantity: 30, periodStart: '2026-10-23T14:00:00+07:00', periodEnd: '2026-10-24T19:00:00+07:00', status: 'held', createdAt: '2026-10-10T11:00:00+07:00' },
  { id: 'RES-001-INOX', jobId: 'JOB-202610-001', itemCode: 'GHE_INOX', requestedQuantity: 120, periodStart: '2026-10-23T14:00:00+07:00', periodEnd: '2026-10-24T19:00:00+07:00', status: 'held', createdAt: '2026-10-10T11:00:00+07:00' },
  { id: 'RES-001-NHUA', jobId: 'JOB-202610-001', itemCode: 'GHE_NHUA_DO', requestedQuantity: 60, periodStart: '2026-10-23T14:00:00+07:00', periodEnd: '2026-10-24T19:00:00+07:00', status: 'held', createdAt: '2026-10-10T11:00:00+07:00' },
  { id: 'RES-001-RAP', jobId: 'JOB-202610-001', itemCode: 'KHUNG_RAP_KHOANG', requestedQuantity: 6, periodStart: '2026-10-23T14:00:00+07:00', periodEnd: '2026-10-24T19:00:00+07:00', status: 'held', createdAt: '2026-10-10T11:00:00+07:00' },

  // Ca 2: Job 2 giữ (held, TRÙNG LỊCH 23-25/10)
  { id: 'RES-002-BAN', jobId: 'JOB-202610-002', itemCode: 'BAN_TRON', requestedQuantity: 15, periodStart: '2026-10-23T16:00:00+07:00', periodEnd: '2026-10-25T09:00:00+07:00', status: 'held', createdAt: '2026-10-11T14:00:00+07:00' },
  { id: 'RES-002-INOX', jobId: 'JOB-202610-002', itemCode: 'GHE_INOX', requestedQuantity: 100, periodStart: '2026-10-23T16:00:00+07:00', periodEnd: '2026-10-25T09:00:00+07:00', status: 'held', createdAt: '2026-10-11T14:00:00+07:00' },
  { id: 'RES-002-RAP', jobId: 'JOB-202610-002', itemCode: 'KHUNG_RAP_KHOANG', requestedQuantity: 5, periodStart: '2026-10-23T16:00:00+07:00', periodEnd: '2026-10-25T09:00:00+07:00', status: 'held', createdAt: '2026-10-11T14:00:00+07:00' },

  // Ca 3: Job 3 giữ (held, TRÙNG LỊCH 24/10)
  { id: 'RES-003-BAN', jobId: 'JOB-202610-003', itemCode: 'BAN_TRON', requestedQuantity: 8, periodStart: '2026-10-24T06:00:00+07:00', periodEnd: '2026-10-24T17:00:00+07:00', status: 'held', createdAt: '2026-10-12T08:00:00+07:00' },
  { id: 'RES-003-NHUA', jobId: 'JOB-202610-003', itemCode: 'GHE_NHUA_DO', requestedQuantity: 48, periodStart: '2026-10-24T06:00:00+07:00', periodEnd: '2026-10-24T17:00:00+07:00', status: 'held', createdAt: '2026-10-12T08:00:00+07:00' },
  { id: 'RES-003-RAP', jobId: 'JOB-202610-003', itemCode: 'KHUNG_RAP_KHOANG', requestedQuantity: 3, periodStart: '2026-10-24T06:00:00+07:00', periodEnd: '2026-10-24T17:00:00+07:00', status: 'held', createdAt: '2026-10-12T08:00:00+07:00' },

  // Ca 5: Đám hiếu (dispatched - ĐÃ XUẤT RA CÔNG TRƯỜNG, QUÁ HẠN CHƯA THU HỒI -> CHIẾM KHO VẪN TÍNH)
  { id: 'RES-005-BAN', jobId: 'JOB-202610-005', itemCode: 'BAN_TRON', requestedQuantity: 8, periodStart: '2026-10-09T14:00:00+07:00', periodEnd: '2026-10-11T19:00:00+07:00', status: 'dispatched', createdAt: '2026-10-09T08:00:00+07:00' },
  { id: 'RES-005-INOX', jobId: 'JOB-202610-005', itemCode: 'GHE_INOX', requestedQuantity: 48, periodStart: '2026-10-09T14:00:00+07:00', periodEnd: '2026-10-11T19:00:00+07:00', status: 'dispatched', createdAt: '2026-10-09T08:00:00+07:00' },
  { id: 'RES-005-RAP', jobId: 'JOB-202610-005', itemCode: 'KHUNG_RAP_KHOANG', requestedQuantity: 3, periodStart: '2026-10-09T14:00:00+07:00', periodEnd: '2026-10-11T19:00:00+07:00', status: 'dispatched', createdAt: '2026-10-09T08:00:00+07:00' },
];

// Báo giá ban đầu
const INITIAL_QUOTES: QuoteRecord[] = [
  {
    id: 'QUOTE-001',
    intakeId: 'INTAKE-001',
    jobId: 'JOB-202610-001',
    version: 1,
    isFinal: true,
    items: [
      { id: 'QI-1', name: 'Rạp cưới Hoàng Gia 6 khoang (khung, bạt, rèm lụa, đèn chùm)', unit: 'gói', quantity: 1, unitPriceVND: 18000000, totalVND: 18000000, isPackage: true },
      { id: 'QI-2', name: 'Bàn tròn kèm ghế inox (20 bộ)', unit: 'bộ', quantity: 20, unitPriceVND: 120000, totalVND: 2400000, isPackage: false },
      { id: 'QI-3', name: 'Bàn tròn kèm ghế nhựa đỏ (10 bộ)', unit: 'bộ', quantity: 10, unitPriceVND: 90000, totalVND: 900000, isPackage: false },
      { id: 'QI-4', name: 'Dàn âm thanh ánh sáng sự kiện tiêu chuẩn', unit: 'bộ', quantity: 1, unitPriceVND: 3500000, totalVND: 3500000, isPackage: true },
    ],
    totalAmountVND: 24800000,
    discountVND: 800000,
    finalAmountVND: 24000000,
    notes: 'Đã thống nhất giảm 800.000 VNĐ hỗ trợ gia đình làm rạp sớm.',
    createdAt: '2026-10-10T10:00:00+07:00',
  },
  {
    id: 'QUOTE-002',
    intakeId: 'INTAKE-002',
    jobId: 'JOB-202610-002',
    version: 1,
    isFinal: true,
    items: [
      { id: 'QI-201', name: 'Gói Rạp cưới Rustic Xanh Cổ Điển 5 khoang', unit: 'gói', quantity: 1, unitPriceVND: 15000000, totalVND: 15000000, isPackage: true },
      { id: 'QI-202', name: 'Bàn tròn sự kiện kèm ghế inox (15 bộ)', unit: 'bộ', quantity: 15, unitPriceVND: 120000, totalVND: 1800000, isPackage: false },
    ],
    totalAmountVND: 16800000,
    discountVND: 0,
    finalAmountVND: 16800000,
    createdAt: '2026-10-11T11:00:00+07:00',
  },
];

// Phiếu thu / Cọc ban đầu
const INITIAL_PAYMENTS: PaymentReceipt[] = [
  {
    id: 'PAY-001',
    jobId: 'JOB-202610-001',
    intakeId: 'INTAKE-001',
    paymentType: 'tien_coc',
    amountVND: 10000000,
    paymentMethod: 'chuyen_khoan',
    paymentDate: '2026-10-10T15:30:00+07:00',
    recordedBy: 'Kế toán Hương',
    receiptNumber: 'PT-202610-001',
    notes: 'Khách cọc hợp đồng cưới qua Vietcombank',
    createdAt: '2026-10-10T15:30:00+07:00',
  },
  {
    id: 'PAY-002',
    jobId: 'JOB-202610-002',
    intakeId: 'INTAKE-002',
    paymentType: 'tien_coc',
    amountVND: 5000000,
    paymentMethod: 'tien_mat',
    paymentDate: '2026-10-11T16:00:00+07:00',
    recordedBy: 'Kế toán Hương',
    receiptNumber: 'PT-202610-002',
    notes: 'Cọc giữ ngày cưới trực tiếp tại xưởng',
    createdAt: '2026-10-11T16:00:00+07:00',
  },
  {
    id: 'PAY-005',
    jobId: 'JOB-202610-005',
    intakeId: 'INTAKE-005',
    paymentType: 'quyet_toan',
    amountVND: 6500000,
    paymentMethod: 'tien_mat',
    paymentDate: '2026-10-11T18:00:00+07:00',
    recordedBy: 'Kế toán Hương',
    receiptNumber: 'PT-202610-005',
    notes: 'Quyết toán đám hiếu gia đình cụ Thịnh',
    createdAt: '2026-10-11T18:00:00+07:00',
  },
];

// Thông báo trong ứng dụng ban đầu
const INITIAL_NOTIFICATIONS: InAppNotification[] = [
  {
    id: 'NOTIF-01',
    title: 'Booking mới từ website',
    message: 'Khách hàng Anh Minh Đức gửi yêu cầu đám cưới tại Hiệp Hòa (Mã: TD-202610-004)',
    type: 'booking_moi',
    referenceId: 'INTAKE-004',
    isRead: false,
    createdAt: '2026-10-12T09:15:00+07:00',
  },
  {
    id: 'NOTIF-02',
    title: 'Cảnh báo kho: Trùng lịch cao điểm ngày 24/10',
    message: 'Đang có 3 sự kiện đồng thời ngày 24/10 (Cưới Tuấn Anh, Cưới Quốc Bảo, Tân Gia Hưng). Ghế đôn inox đang sát ngưỡng dự phòng an toàn!',
    type: 'canh_bao_kho',
    isRead: false,
    createdAt: '2026-10-12T08:05:00+07:00',
  },
  {
    id: 'NOTIF-03',
    title: 'Cảnh báo thiết bị quá hạn chưa thu hồi',
    message: 'Job JOB-202610-005 (Đám hiếu Cụ Thịnh) đã kết thúc ngày 11/10 nhưng chưa kiểm tra trả kho!',
    type: 'canh_bao_kho',
    referenceId: 'JOB-202610-005',
    isRead: false,
    createdAt: '2026-10-12T07:00:00+07:00',
  },
];

// Nhật ký kiểm toán ban đầu
const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-01',
    userId: 'USER-01',
    userRole: 'chu_don_vi',
    action: 'CONFIRM_JOB',
    entityType: 'job',
    entityId: 'JOB-202610-001',
    details: 'Xác nhận hồ sơ TD-202610-001 thành Job và giữ kho 30 bàn tròn, 120 ghế inox, 60 ghế nhựa đỏ.',
    createdAt: '2026-10-10T11:00:00+07:00',
  },
  {
    id: 'LOG-02',
    userId: 'USER-02',
    userRole: 'ke_toan',
    action: 'RECORD_PAYMENT',
    entityType: 'payment',
    entityId: 'PAY-001',
    details: 'Ghi nhận tiền cọc 10.000.000 VNĐ cho Job-202610-001.',
    createdAt: '2026-10-10T15:30:00+07:00',
  },
];

// Danh sách tài khoản người dùng có sẵn và tài khoản Admin mặc định
export const MOCK_USERS: (UserProfile & { username?: string; password?: string })[] = [
  { id: 'U-CHU', username: 'admin', password: '123456', email: 'admin@thaidang.vn', fullName: 'Nguyễn Văn Thái (Chủ đơn vị)', role: 'chu_don_vi', phone: '0988 112 233', isActive: true },
  { id: 'U-QUANLY', username: 'dang', password: '123456', email: 'dang@thaidang.vn', fullName: 'Trần Văn Đăng (Quản lý điều hành)', role: 'quan_ly', phone: '0988000222', isActive: true },
  { id: 'U-TUVAN', username: 'mai', password: '123456', email: 'mai@thaidang.vn', fullName: 'Lê Thị Mai (Tư vấn & Chăm sóc khách)', role: 'tu_van', phone: '0988000333', isActive: true },
  { id: 'U-KHO', username: 'nam', password: '123456', email: 'nam.kho@thaidang.vn', fullName: 'Phạm Văn Nam (Thủ kho thiết bị)', role: 'kho', phone: '0988000444', isActive: true },
  { id: 'U-KETOAN', username: 'huong', password: '123456', email: 'huong.kt@thaidang.vn', fullName: 'Vũ Thị Hương (Kế toán)', role: 'ke_toan', phone: '0988000555', isActive: true },
  { id: 'U-NHANVIEN', username: 'tuan', password: '123456', email: 'tuan.nv@thaidang.vn', fullName: 'Đỗ Anh Tuấn (Nhân viên hiện trường)', role: 'nhan_vien_thuc_hien', phone: '0988000666', isActive: true },
];

// Danh sách tài khoản khách hàng ban đầu
export const INITIAL_CUSTOMERS: CustomerAccount[] = [
  { id: 'CUST-01', fullName: 'Anh Tuấn Anh & Chị Mai Linh', phone: '0912345678', email: 'tuananh@gmail.com', address: 'Thôn Trực Đông, xã Cổ Lễ, tỉnh Ninh Bình', createdAt: '2026-10-10T08:30:00+07:00', totalBookings: 1, isVip: true, notes: 'Khách VIP, gia đình đặt tiệc cưới 30 mâm và trọn gói rạp hoàng gia' },
  { id: 'CUST-02', fullName: 'Anh Quốc Bảo & Chị Lan Hương', phone: '0987654321', email: 'quocbao@outlook.com', address: 'xã Cổ Lễ, tỉnh Ninh Bình', createdAt: '2026-10-11T09:00:00+07:00', totalBookings: 1, isVip: false },
  { id: 'CUST-03', fullName: 'Anh Nguyễn Trọng Hưng', phone: '0966889900', email: 'hung.nguyen@ninhbinh.vn', address: 'TP Ninh Bình, Tỉnh Ninh Bình', createdAt: '2026-10-11T15:00:00+07:00', totalBookings: 1, isVip: false, notes: 'Chủ biệt thự, làm tiệc tân gia' },
  { id: 'CUST-04', fullName: 'Anh Minh Đức & Chị Thu Trang', phone: '0933221100', email: 'duc.minh@gmail.com', address: 'huyện Kim Sơn, Tỉnh Ninh Bình', createdAt: '2026-10-12T09:15:00+07:00', totalBookings: 1, isVip: false },
];

// Dữ liệu sự kiện tháng 10 năm 2025 theo đúng thiết kế Dashboard (Ảnh 2)
export const INITIAL_MONTH_EVENTS: MonthEventItem[] = [
  { id: 'EV-01', dateStr: '04/10 (T7)', customerName: 'Anh Nam', eventType: 'Tiệc cưới', location: 'xã Cổ Lễ, Ninh Bình', status: 'da_hoan_thanh' },
  { id: 'EV-02', dateStr: '07/10 (T3)', customerName: 'Chị Hương', eventType: 'Lễ ăn hỏi', location: 'TP Ninh Bình', status: 'da_hoan_thanh' },
  { id: 'EV-03', dateStr: '12/10 (CN)', customerName: 'Anh Tuấn', eventType: 'Tiệc cưới', location: 'xã Cổ Lễ, Ninh Bình', status: 'dang_thuc_hien', isCurrentToday: true },
  { id: 'EV-04', dateStr: '18/10 (T7)', customerName: 'Chị Mai', eventType: 'Tiệc cưới', location: 'huyện Yên Mô', status: 'sap_dien_ra' },
  { id: 'EV-05', dateStr: '22/10 (T4)', customerName: 'Anh Dũng', eventType: 'Lễ ăn hỏi', location: 'TP Hoa Lư', status: 'sap_dien_ra' },
  { id: 'EV-06', dateStr: '26/10 (CN)', customerName: 'Chị Lan', eventType: 'Tiệc cưới', location: 'xã Gia Viễn', status: 'sap_dien_ra' },
  { id: 'EV-07', dateStr: '29/10 (T4)', customerName: 'Cô Thu', eventType: 'Tiệc cưới', location: 'huyện Nho Quan', status: 'sap_dien_ra' },
  { id: 'EV-08', dateStr: '31/10 (T6)', customerName: 'Anh Long', eventType: 'Lễ ăn hỏi', location: 'huyện Kim Sơn', status: 'sap_dien_ra' },
];

export const INITIAL_DEBT_ITEMS: DebtItem[] = [
  { id: 'DEBT-01', customerName: 'Anh Tuấn', date: '12/10', amount: 20000000 },
  { id: 'DEBT-02', customerName: 'Chị Mai', date: '18/10', amount: 8000000 },
  { id: 'DEBT-03', customerName: 'Anh Dũng', date: '22/10', amount: 7000000 },
  { id: 'DEBT-04', customerName: 'Khác (2 khách)', date: '', amount: 5000000 },
];

export const INITIAL_REMINDER_TASKS: ReminderTask[] = [
  { id: 'REM-01', time: '08:00', title: 'Liên hệ khách Anh Tuấn xác nhận giờ lắp rạp', isDone: true },
  { id: 'REM-02', time: '10:00', title: 'Kiểm tra xe vận chuyển, xếp hàng', isDone: true },
  { id: 'REM-03', time: '14:00', title: 'Chuẩn bị bản hợp đồng cho Chị Mai', isDone: false },
  { id: 'REM-04', time: '16:00', title: 'Liên hệ nhà bạt dự phòng', isDone: false },
];

export const INITIAL_WAREHOUSE_ALERTS: WarehouseAlertItem[] = [
  { id: 'WHA-01', title: 'Thiếu 20 ghế inox', detail: 'cho lịch ngày mai (13/10)', severity: 'danger', iconType: 'chairs' },
  { id: 'WHA-02', title: 'Bạt trắng 10m: chỉ còn 1 bộ', detail: 'cần kiểm tra vệ sinh sau thu hồi', severity: 'warning', iconType: 'tents' },
];

// Danh mục CMS Chuyên mục (Đồng bộ trực tiếp với Thanh Menu Header Image 4)
export const INITIAL_CMS_CATEGORIES: CmsCategory[] = [
  { id: 'CAT-01', name: 'Trang chủ', slug: 'trang-chu', linkUrl: '#top', description: 'Trang chủ Nhà rạp Thái Đăng', iconName: 'home', itemCount: 10, isActive: true, sortOrder: 1, isHeaderNav: true },
  { id: 'CAT-02', name: 'Mẫu rạp', slug: 'mau-rap', linkUrl: '#mau-rap', description: 'Bộ sưu tập mẫu rạp cưới & rạp sự kiện', iconName: 'tents', itemCount: 18, isActive: true, sortOrder: 2, isHeaderNav: true },
  { id: 'CAT-03', name: 'Dịch vụ', slug: 'dich-vu', linkUrl: '#dich-vu', description: 'Gói dịch vụ tiệc cưới, ăn hỏi trọn gói', iconName: 'briefcase', itemCount: 12, isActive: true, sortOrder: 3, isHeaderNav: true },
  { id: 'CAT-04', name: 'Thiệp cưới', slug: 'thiep-cuoi', linkUrl: '#thiep-cuoi', description: 'Mẫu thiệp cưới online sang trọng', iconName: 'mail', itemCount: 15, isActive: true, sortOrder: 4, isHeaderNav: true },
  { id: 'CAT-05', name: 'Về chúng tôi', slug: 've-chung-toi', linkUrl: '#ve-chung-toi', description: 'Giới thiệu năng lực và quy mô nhà rạp', iconName: 'users', itemCount: 8, isActive: true, sortOrder: 5, isHeaderNav: true },
  { id: 'CAT-06', name: 'Liên hệ – Chỉ đường', slug: 'lien-he', linkUrl: '#lien-he', description: 'Thông tin liên hệ, bản đồ và hotline', iconName: 'map-pin', itemCount: 9, isActive: true, sortOrder: 6, isHeaderNav: true },
];

// Ảnh liên kết & Thư viện mẫu rạp thực tế
export const INITIAL_CMS_PARTNER_PHOTOS: CmsPartnerPhoto[] = [
  { id: 'PHT-01', title: 'Rạp cưới ngoài trời hoàng gia', category: 'dam-cuoi', imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80', caption: 'Khẩu độ rạp 12m trang trí hoa tú cầu & đèn chùm pha lê tại Cổ Lễ, Ninh Bình', sortOrder: 1 },
  { id: 'PHT-02', title: 'Phông gia tiên chữ Hỷ rực rỡ', category: 'dam-hoi', imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80', caption: 'Tone đỏ truyền thống kèm cổng hoa tươi lộng lẫy', sortOrder: 2 },
  { id: 'PHT-03', title: 'Rạp tân gia Hưng Thịnh', category: 'nha-moi', imageUrl: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=800&q=80', caption: 'Bạt che sự kiện kiên cố, bàn tròn ghế Song Long phục vụ 40 mâm tiệc', sortOrder: 3 },
  { id: 'PHT-04', title: 'Bộ mẫu thiệp cưới số sang trọng', category: 'thiep-cuoi', imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80', caption: 'Thiệp cưới online quét mã QR cá nhân hóa ảnh cưới đôi uyên ương', sortOrder: 4 },
];

// Banner Slides trang chủ chuẩn Ảnh 1
export const INITIAL_CMS_BANNER_SLIDES: CmsBannerSlide[] = [
  {
    id: 'SLIDE-01',
    slideNumber: '01 / 05 • RẠP CƯỚI NGOÀI TRỜI',
    title: 'Dựng nên ngày vui trọn vẹn ♡',
    subtitle: 'Rạp đẹp, thiết bị đầy đủ, đội ngũ tận tâm.',
    locationTag: '📍 Phục vụ tại Ninh Bình',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80',
    ctaText1: 'ĐẶT LỊCH TƯ VẤN',
    ctaLink1: '#dat-lich',
    ctaText2: 'XEM MẪU RẠP',
    ctaLink2: '#mau-rap',
    isActive: true,
  },
  {
    id: 'SLIDE-02',
    slideNumber: '02 / 05 • RẠP HOÀNG GIA SANG TRỌNG',
    title: 'Đẳng cấp hoàng gia trong từng chi tiết',
    subtitle: 'Khung rạp khẩu độ lớn 6m - 18m không vướng cột giữa.',
    locationTag: '📍 Phục vụ tại Ninh Bình',
    imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1600&q=80',
    ctaText1: 'NHẬN BÁO GIÁ',
    ctaLink1: '#dat-lich',
    ctaText2: 'XEM BỘ SƯU TẬP',
    ctaLink2: '#mau-rap',
    isActive: true,
  },
  {
    id: 'SLIDE-03',
    slideNumber: '03 / 05 • LỄ ĂN HỎI GIA TIÊN',
    title: 'Nét đẹp truyền thống thắm duyên đôi lứa',
    subtitle: 'Phông chữ Hỷ dát vàng, hoa tươi trang trọng chuẩn phong tục.',
    locationTag: '📍 Phục vụ tại Ninh Bình',
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1600&q=80',
    ctaText1: 'TƯ VẤN GIA TIÊN',
    ctaLink1: '#dat-lich',
    ctaText2: 'XEM CHI TIẾT',
    ctaLink2: '#mau-rap',
    isActive: true,
  },
  {
    id: 'SLIDE-04',
    slideNumber: '04 / 05 • RẠP TÂN GIA HƯNG THỊNH',
    title: 'Mừng nhà mới an khang thịnh vượng',
    subtitle: 'Che chắn chu đáo, bàn ghế sạch sẽ sẵn sàng đón quan khách.',
    locationTag: '📍 Phục vụ tại Ninh Bình',
    imageUrl: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1600&q=80',
    ctaText1: 'ĐẶT RẠP TÂN GIA',
    ctaLink1: '#dat-lich',
    ctaText2: 'XEM HÌNH ẢNH',
    ctaLink2: '#mau-rap',
    isActive: true,
  },
  {
    id: 'SLIDE-05',
    slideNumber: '05 / 05 • THIỆP CƯỚI ONLINE THÁI ĐĂNG',
    title: 'Thiệp cưới số hiện đại và tiện lợi',
    subtitle: 'Gửi thiệp qua Zalo, Facebook kèm định vị bản đồ và RSVP tự động.',
    locationTag: '📍 Tặng kèm khi đặt trọn gói',
    imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1600&q=80',
    ctaText1: 'TẠO THIỆP NGAY',
    ctaLink1: '#thiep-cuoi',
    ctaText2: 'TÌM HIỂU THÊM',
    ctaLink2: '#thiep-cuoi',
    isActive: true,
  },
];

// Danh sách các mẫu phông rạp cưới và phong thủy tuổi tác hợp mệnh ban đầu
export const INITIAL_THEMES: ThemeModel[] = [
  {
    id: 'hoang_gia',
    name: 'Tone Trắng Vàng Hoàng Gia',
    titleEn: 'Royal Ivory & Champagne Gold',
    service: 'dam_cuoi',
    desc: 'Không gian quý phái với trần rèm lụa trắng sữa xếp ly, hoa tú cầu vàng champagne, điểm xuyết đèn chùm pha lê thả rạp lộng lẫy và thảm đỏ tiếp đón.',
    badge: 'Bộ Sưu Tập Nổi Bật Nhất',
    specs: 'Khẩu độ rạp 6m - 18m • Đèn chùm pha lê • Thảm trải sàn cao cấp',
    imageUrl: '/hero_backdrop.jpg',
    detailImages: [
      '/hero_backdrop.jpg',
      '/card_dam_cuoi.jpg',
      'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'
    ],
    fengShuiElement: 'Mệnh Kim & Mệnh Thổ (Thổ sinh Kim - Vượng Tài Cát Khánh)',
    fengShuiAges: 'Rất hợp cô dâu chú rể sinh năm: Canh Thìn (2000), Tân Tỵ (2001), Mậu Dần (1998), Kỷ Mão (1999), Quý Dậu (1993), Nhâm Thân (1992), Giáp Tý (1984), Ất Sửu (1985).',
    fengShuiMeaning: 'Sắc vàng ánh kim đại diện cho vinh hoa, tiền tài; màu trắng sữa tượng trưng cho sự thuần khiết và thanh cao. Sự hòa quyện giúp thu hút vượng khí, tài lộc dồi dào, vợ chồng đồng thuận làm ăn phát đạt.',
    fengShuiFlowers: 'Hoa hồng kem pastel, hoa lan hồ điệp trắng, tú cầu vàng champagne, đèn chùm pha lê tụ dương khí.',
    accentColor: '#c5a059',
    isActive: true,
  },
  {
    id: 'rustic_green',
    name: 'Tone Xanh Lá Rustic Cổ Điển',
    titleEn: 'Romantic Forest & Rustic Garden',
    service: 'dam_cuoi',
    desc: 'Lấy cảm hứng từ những khu vườn cổ tích châu Âu, kết hợp dải dây leo xanh biếc, hoa hồng kem pastel, trụ gỗ mộc và hệ thống đèn búp mờ ảo.',
    badge: 'Xu Hướng Cưới 2026',
    specs: 'Phù hợp sân vườn rộng • Hoa tươi phối cành khô • Ánh sáng ấm 3000K',
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    detailImages: [
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
      '/hero_backdrop.jpg'
    ],
    fengShuiElement: 'Mệnh Mộc & Mệnh Hỏa (Mộc sinh Hỏa - Sinh Khí Dồi Dào)',
    fengShuiAges: 'Rất hợp cô dâu chú rể sinh năm: Kỷ Tỵ (1989), Mậu Thìn (1988), Quý Dậu (1993), Nhâm Thân (1992), Canh Ngọ (1990), Tân Mùi (1991), Bính Tý (1996), Đinh Sửu (1997).',
    fengShuiMeaning: 'Sắc xanh lá cây mang năng lượng sinh sôi nảy nở của cỏ cây mùa xuân, giúp giải tỏa căng thẳng, khởi đầu cuộc sống hôn nhân bình yên, êm ấm và thăng hoa.',
    fengShuiFlowers: 'Lá khuynh diệp (bạch đàn), hoa hồng kem, cúc họa mi trắng, trụ gỗ tự nhiên kết hợp đèn fairy light ấm áp.',
    accentColor: '#059669',
    isActive: true,
  },
  {
    id: 'truyen_thong_do',
    name: 'Tone Đỏ Hỷ Sự Truyền Thống',
    titleEn: 'Traditional Red & Gold Heritage',
    service: 'dam_cuoi',
    desc: 'Sắc đỏ tượng trưng cho hạnh phúc viên mãn và may mắn trường cửu. Chữ Song Hỷ dát kim tuyến, đèn lồng cung đình kết hợp voan rèm thanh lịch.',
    badge: 'Đậm Nét Văn Hóa Việt',
    specs: 'Rạp khẩu độ lớn • Chữ Song Hỷ dát vàng • Bàn đón khách sơn mài',
    imageUrl: '/card_dam_hoi.jpg',
    detailImages: [
      '/card_dam_hoi.jpg',
      'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=1200&q=80'
    ],
    fengShuiElement: 'Mệnh Hỏa & Mệnh Thổ (Hỏa sinh Thổ - Phúc Lộc Trường Cửu)',
    fengShuiAges: 'Rất hợp cô dâu chú rể sinh năm: Đinh Mão (1987), Bính Dần (1986), Giáp Tuất (1994), Ất Hợi (1995), Canh Ngọ (1990), Bính Thân (2016), Đinh Dậu (2017).',
    fengShuiMeaning: 'Màu đỏ là màu của hoan hỷ, may mắn tối thượng trong văn hóa cưới hỏi truyền thống Á Đông. Trừ tà, kích hoạt cung tình duyên, chúc phúc đôi lứa sắt son răng long đầu bạc, sinh quý tử.',
    fengShuiFlowers: 'Hoa hồng nhung đỏ, hoa thược dược, trầu cau truyền thống, chữ Hỷ dát vàng, đèn lồng đỏ cung đình.',
    accentColor: '#dc2626',
    isActive: true,
  },
  {
    id: 'hien_dai_tangiay',
    name: 'Rạp Che Nắng Hiện Đại (Tân Gia)',
    titleEn: 'Modern Pavilion & Housewarming',
    service: 'nha_moi',
    desc: 'Hệ khung sắt mạ kẽm kiên cố khẩu độ lớn, bạt 2 da chống nóng Hàn Quốc, trần thả lụa ghi sáng trang nhã phục vụ tiệc mừng nhà mới khang trang.',
    badge: 'Kiên Cố & Thoáng Mát',
    specs: 'Cách nhiệt chống nóng 95% • Lắp dựng nhanh • Phù hợp mặt đường lớn',
    imageUrl: '/card_nha_moi.jpg',
    detailImages: [
      '/card_nha_moi.jpg',
      '/hero_backdrop.jpg'
    ],
    fengShuiElement: 'Mọi Bản Mệnh (Thổ Trạch Bình An - Tân Gia Phát Tài)',
    fengShuiAges: 'Phù hợp với tất cả các tuổi gia chủ nhập trạch nhà mới, mừng khánh thành công trình tại Ninh Bình.',
    fengShuiMeaning: 'Không gian cao ráo, thoáng đãng tượng trưng cho thế "Tiền đường tụ khí". Che chắn gió mưa vững chãi như nền móng gia đình vững bền.',
    fengShuiFlowers: 'Hoa đồng tiền vàng, hoa cúc mẫu đơn, lan vũ nữ, quạt trang trí may mắn.',
    accentColor: '#2563eb',
    isActive: true,
  },
  {
    id: 'gia_tien_thanh_lich',
    name: 'Phông Lễ Ăn Hỏi Gia Tiên Thanh Lịch',
    titleEn: 'Heritage Engagement & Tea Ceremony',
    service: 'dam_hoi',
    desc: 'Phông nền trang trí bàn thờ gia tiên tinh xảo, hoa lụa cao cấp, bộ lư đồng sáng bóng và bàn đại biểu phủ ren ấm áp.',
    badge: 'Nghi Lễ Gia Tiên Chu Đáo',
    specs: 'Thiết kế riêng theo tư gia • Bàn đại biểu 12 khách • Tráp ăn hỏi cao cấp',
    imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    detailImages: [
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
      '/card_dam_hoi.jpg'
    ],
    fengShuiElement: 'Mệnh Mộc & Thủy (Gia Tiên Chứng Giám - Dâu Hiền Rể Thảo)',
    fengShuiAges: 'Các cặp đôi tổ chức lễ ăn hỏi, dạm ngõ, rước dâu mọi lứa tuổi.',
    fengShuiMeaning: 'Bày tỏ lòng thành kính với tổ tiên, kết nối dòng tộc hai họ hài hòa, thuận thảo.',
    fengShuiFlowers: 'Hoa sen trắng, hoa cúc mẫu đơn, quả cau lá trầu tươi thắm, chữ Song Hỷ thêu tay.',
    accentColor: '#d97706',
    isActive: true,
  },
];

// Danh sách bài viết tin tức quảng bá ban đầu
export const INITIAL_ARTICLES: ArticleRecord[] = [
  {
    id: 'ART-01',
    title: 'Top 5 Xu Hướng Rạp Cưới Hoàng Gia Được Ưa Chuộng Nhất Năm 2026 Tại Ninh Bình',
    slug: 'top-5-xu-huong-rap-cuoi-hoang-gia-ninh-binh',
    category: 'xu_huong_rap',
    summary: 'Khám phá các phong cách rạp cưới khẩu độ lớn, tone màu Trắng Vàng champagne, rèm lụa xếp ly và hệ thống đèn chùm pha lê thả trần mang đậm phong cách hoàng gia quý phái.',
    content: 'Mùa cưới 2026 đánh dấu sự lên ngôi của các mẫu rạp cưới khẩu độ lớn (từ 9m đến 18m) không vướng cột giữa. Nhà Rạp Thái Đăng tự hào mang đến các giải pháp dựng rạp sự kiện cao cấp tại Ninh Bình kết hợp trần lụa voan bồng bềnh, hệ thống chiếu sáng warm light 3000K ấm áp tạo nên những bức ảnh kỷ niệm tuyệt mỹ cho đôi uyên ương.',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    views: 1420,
    isPublished: true,
    publishedAt: '2026-10-01T08:00:00+07:00',
    author: 'Ban Biên Tập Nhà Rạp Thái Đăng',
  },
  {
    id: 'ART-02',
    title: 'Kinh Nghiệm Tính Toán Số Lượng Bàn Ghế Cưới & Tránh Thừa Thiếu Trong Ngày Trọng Đại',
    slug: 'kinh-nghiem-tinh-toan-so-luong-ban-ghe-cuoi',
    category: 'kinh_nghiem_cuoi',
    summary: 'Cách phân chia khu vực rạp chính dùng ghế đôn inox tròn, khu vực cỗ phụ dùng ghế nhựa Song Long và tỷ lệ bàn dự phòng chuẩn xác nhất cho gia đình.',
    content: 'Khi lên kế hoạch tổ chức tiệc cưới tại gia, việc cân đối số lượng bàn ghế là yếu tố then chốt. Công thức vàng của Thái Đăng: luôn chuẩn bị từ 2-3 bàn tròn dự phòng (kèm 12-18 ghế), phân tách rõ khu vực đón tiếp quan khách trang trọng (ghế inox) và khu vực phục vụ cỗ gia đình thân mật để tối ưu chi phí mà vẫn giữ được sự chỉn chu.',
    imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    views: 980,
    isPublished: true,
    publishedAt: '2026-10-05T09:30:00+07:00',
    author: 'Chuyên Viên Tư Vấn Thái Đăng',
  },
  {
    id: 'ART-03',
    title: 'Bí Quyết Chọn Thực Đơn Cỗ Cưới Đậm Đà Hương Vị Cố Đô Ninh Bình',
    slug: 'bi-quyet-chon-thuc-don-co-cuoi-ninh-binh',
    category: 'thuc_don_co',
    summary: 'Gợi ý thực đơn 8-10 món truyền thống đặc sắc, dê núi, cơm cháy, gà đồi, xôi gấc hạt sen thơm ngon làm hài lòng tất cả quan khách.',
    content: 'Mâm cỗ cưới chuẩn vị Ninh Bình đòi hỏi sự hài hòa giữa món khai vị thanh tao, món chính đậm đà và món canh ấm nóng. Nhà rạp Thái Đăng liên kết cùng các đội nấu cỗ danh tiếng tại Cổ Lễ và TP Ninh Bình để mang đến những mâm cỗ nóng sốt, đầy đặn, bảo đảm vệ sinh an toàn thực phẩm.',
    imageUrl: 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=800&q=80',
    views: 850,
    isPublished: true,
    publishedAt: '2026-10-08T10:15:00+07:00',
    author: 'Bếp Trưởng Thái Đăng Catering',
  },
  {
    id: 'ART-04',
    title: 'Thủ Tục Lễ Ăn Hỏi & Những Lưu Ý Về Khung Rạp Khi Tổ Chức Tại Gia',
    slug: 'thu-tuc-le-an-hoi-va-luu-y-khung-rap',
    category: 'kinh_nghiem_cuoi',
    summary: 'Cẩm nang chuẩn bị rạp ăn hỏi gọn gàng, đo đạc kích thước sân ngõ và kết nối điện an toàn cho ngày đón dâu hoàn hảo.',
    content: 'Lễ ăn hỏi thường diễn ra trong không gian ấm cúng tại gia đình nhà gái. Thái Đăng cung cấp các gói rạp mini 3-4 khoang với phông chữ Hỷ dát vàng, bàn dài đón tiếp đại biểu hai họ được bọc khăn ren trang nhã.',
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    views: 630,
    isPublished: true,
    publishedAt: '2026-10-10T14:00:00+07:00',
    author: 'Ban Biên Tập Nhà Rạp Thái Đăng',
  },
];

// Danh sách khuyến mại banner ban đầu
export const INITIAL_PROMOTIONS: PromotionBanner[] = [
  {
    id: 'PROMO-01',
    title: 'ƯU ĐÃI MÙA CƯỚI 2026: TẶNG DÀN ÂM THANH ÁNH SÁNG ARRAY',
    discountText: 'TẶNG GÓI ÂM THANH 3.500.000Đ',
    validUntil: '31/12/2026',
    code: 'THAIDANG-GOLD2026',
    description: 'Áp dụng cho các hợp đồng rạp cưới từ 25 bàn tròn trở lên đặt trước ngày diễn ra hôn lễ 30 ngày.',
    badge: 'Khuyến Mại Đặc Biệt',
    isActive: true,
  },
  {
    id: 'PROMO-02',
    title: 'TRỌN GÓI TÂN GIA NHÀ MỚI: GIẢM NGAY 10% BÀN GHẾ & RẠP CHE',
    discountText: 'GIẢM 10% TỔNG HỢP ĐỒNG',
    validUntil: '30/11/2026',
    code: 'TANGIA-VIP10',
    description: 'Ưu đãi dành cho gia chủ đặt rạp tân gia kèm bàn tròn và ghế nhựa đỏ Song Long tại Ninh Bình.',
    badge: 'Mừng Nhà Mới',
    isActive: true,
  },
];

// Thông tin đơn vị & mạng xã hội ban đầu - Đồng bộ với Single Source of Truth CONTACT_CONFIG
export const INITIAL_COMPANY_INFO: CompanyInfo = {
  brandName: CONTACT_CONFIG.BRAND_NAME,
  slogan: CONTACT_CONFIG.SLOGAN,
  hotline: CONTACT_CONFIG.DEFAULT_HOTLINE,
  secondaryPhone: '',
  zaloPhone: CONTACT_CONFIG.DEFAULT_ZALO,
  facebookFanpageUrl: CONTACT_CONFIG.FACEBOOK_URL,
  tiktokUrl: CONTACT_CONFIG.TIKTOK_URL,
  youtubeUrl: CONTACT_CONFIG.YOUTUBE_URL,
  address: CONTACT_CONFIG.ADDRESS,
  email: CONTACT_CONFIG.EMAIL,
  workingHours: CONTACT_CONFIG.WORKING_HOURS,
  googleMapsUrl: '',
  // Footer CMS mặc định chuẩn xác theo Ảnh 3
  footerSloganTitle: 'SỰ KIỆN TRỌN NIỀM VUI',
  footerCol2Title: 'DỊCH VỤ TỔ CHỨC',
  footerCol2Items: [
    'Tiệc cưới hoành tráng',
    'Lễ ăn hỏi & đính hôn',
    'Lễ tân gia mừng nhà mới',
    'Sự kiện khai trương & khánh thành',
    'Cung cấp thiết bị bàn ghế & âm thanh',
  ],
  footerCol3Title: 'CHÍNH SÁCH & CAM KẾT',
  footerCol3Items: [
    'Khảo sát đo đạc mặt bằng miễn phí',
    'Bảo đảm an toàn kết cấu rạp khẩu độ lớn',
    'Cam kết đúng giờ hoàng đạo 100%',
    'Dụng cụ bàn ghế sạch sẽ, khử khuẩn',
  ],
  footerCol4Title: 'LIÊN HỆ TRỰC TIẾP',
  footerCopyright: '© 2026 • Tất cả các quyền được bảo lưu. Thiết kế & phát triển cho Nhà Rạp Thái Đăng.',
};

/**
 * Lớp Quản lý Dữ liệu và Nghiệp vụ cho Toàn bộ Hệ thống Nhà Rạp Thái Đăng
 */
class AppStateStore {
  private intakes: IntakeRecord[] = JSON.parse(JSON.stringify(INITIAL_INTAKES));
  private jobs: JobRecord[] = JSON.parse(JSON.stringify(INITIAL_JOBS));
  private catalog: InventoryItem[] = JSON.parse(JSON.stringify(INITIAL_CATALOG));
  private reservations: InventoryReservation[] = JSON.parse(JSON.stringify(INITIAL_RESERVATIONS));
  private quotes: QuoteRecord[] = JSON.parse(JSON.stringify(INITIAL_QUOTES));
  private payments: PaymentReceipt[] = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
  private notifications: InAppNotification[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
  private auditLogs: AuditLogEntry[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
  private customers: CustomerAccount[] = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
  private staffMembers: UserProfile[] = JSON.parse(JSON.stringify(MOCK_USERS));
  private articles: ArticleRecord[] = JSON.parse(JSON.stringify(INITIAL_ARTICLES));
  private promotions: PromotionBanner[] = JSON.parse(JSON.stringify(INITIAL_PROMOTIONS));
  private companyInfo: CompanyInfo = JSON.parse(JSON.stringify(INITIAL_COMPANY_INFO));
  private monthEvents: MonthEventItem[] = JSON.parse(JSON.stringify(INITIAL_MONTH_EVENTS));
  private debtItems: DebtItem[] = JSON.parse(JSON.stringify(INITIAL_DEBT_ITEMS));
  private reminderTasks: ReminderTask[] = JSON.parse(JSON.stringify(INITIAL_REMINDER_TASKS));
  private warehouseAlerts: WarehouseAlertItem[] = JSON.parse(JSON.stringify(INITIAL_WAREHOUSE_ALERTS));
  private cmsCategories: CmsCategory[] = JSON.parse(JSON.stringify(INITIAL_CMS_CATEGORIES));
  private cmsPartnerPhotos: CmsPartnerPhoto[] = JSON.parse(JSON.stringify(INITIAL_CMS_PARTNER_PHOTOS));
  private cmsBannerSlides: CmsBannerSlide[] = JSON.parse(JSON.stringify(INITIAL_CMS_BANNER_SLIDES));
  private cmsThemes: ThemeModel[] = JSON.parse(JSON.stringify(INITIAL_THEMES));
  private currentUser: UserProfile = MOCK_USERS[0]; // Thông tin phiên hoạt động
  private authenticatedStaff: UserProfile | null = null; // Phiên đăng nhập quản trị viên (được lưu vào localStorage)
  private authenticatedCustomer: CustomerAccount | null = null; // Phiên đăng nhập khách hàng (được lưu vào localStorage)

  private listeners: (() => void)[] = [];

  constructor() {
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem('td_intakes', JSON.stringify(this.intakes));
      localStorage.setItem('td_jobs', JSON.stringify(this.jobs));
      localStorage.setItem('td_catalog', JSON.stringify(this.catalog));
      localStorage.setItem('td_reservations', JSON.stringify(this.reservations));
      localStorage.setItem('td_quotes', JSON.stringify(this.quotes));
      localStorage.setItem('td_payments', JSON.stringify(this.payments));
      localStorage.setItem('td_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('td_audit_logs', JSON.stringify(this.auditLogs));
      localStorage.setItem('td_customers', JSON.stringify(this.customers));
      localStorage.setItem('td_company_info', JSON.stringify(this.companyInfo));
      localStorage.setItem('td_cms_themes', JSON.stringify(this.cmsThemes));
      localStorage.setItem('td_cms_banner_slides', JSON.stringify(this.cmsBannerSlides));
      localStorage.setItem('td_cms_categories', JSON.stringify(this.cmsCategories));

      // Lưu phiên đăng nhập Quản Trị Viên (Staff Session)
      if (this.authenticatedStaff) {
        localStorage.setItem('td_authenticated_staff', JSON.stringify(this.authenticatedStaff));
        localStorage.setItem('td_current_user', JSON.stringify(this.authenticatedStaff));
      } else {
        localStorage.removeItem('td_authenticated_staff');
        localStorage.removeItem('td_current_user');
      }

      // Lưu phiên đăng nhập Khách Hàng (Customer Session)
      if (this.authenticatedCustomer) {
        localStorage.setItem('td_authenticated_customer', JSON.stringify(this.authenticatedCustomer));
      } else {
        localStorage.removeItem('td_authenticated_customer');
      }
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  private loadFromLocalStorage() {
    try {
      const sIntakes = localStorage.getItem('td_intakes');
      if (sIntakes) this.intakes = JSON.parse(sIntakes);
      const sJobs = localStorage.getItem('td_jobs');
      if (sJobs) this.jobs = JSON.parse(sJobs);
      const sCatalog = localStorage.getItem('td_catalog');
      if (sCatalog) this.catalog = JSON.parse(sCatalog);
      const sRes = localStorage.getItem('td_reservations');
      if (sRes) this.reservations = JSON.parse(sRes);
      const sQuotes = localStorage.getItem('td_quotes');
      if (sQuotes) this.quotes = JSON.parse(sQuotes);
      const sPayments = localStorage.getItem('td_payments');
      if (sPayments) this.payments = JSON.parse(sPayments);
      const sNotifs = localStorage.getItem('td_notifications');
      if (sNotifs) this.notifications = JSON.parse(sNotifs);
      const sLogs = localStorage.getItem('td_audit_logs');
      if (sLogs) this.auditLogs = JSON.parse(sLogs);
      const sCustomers = localStorage.getItem('td_customers');
      if (sCustomers) this.customers = JSON.parse(sCustomers);

      // ĐỒNG BỘ THÔNG TIN ĐƠN VỊ & CHÂN TRANG
      const sComp = localStorage.getItem('td_company_info');
      if (sComp) {
        try {
          const parsed = JSON.parse(sComp);
          this.companyInfo = {
            ...INITIAL_COMPANY_INFO,
            ...parsed,
            brandName: parsed.brandName || CONTACT_CONFIG.BRAND_NAME,
            hotline: parsed.hotline || CONTACT_CONFIG.DEFAULT_HOTLINE,
            zaloPhone: parsed.zaloPhone || CONTACT_CONFIG.DEFAULT_ZALO,
            address: parsed.address || CONTACT_CONFIG.ADDRESS,
            email: parsed.email || CONTACT_CONFIG.EMAIL,
          };
        } catch {
          this.companyInfo = JSON.parse(JSON.stringify(INITIAL_COMPANY_INFO));
        }
      } else {
        this.companyInfo = JSON.parse(JSON.stringify(INITIAL_COMPANY_INFO));
      }

      const sCats = localStorage.getItem('td_cms_categories');
      if (sCats) {
        try {
          const parsedCats = JSON.parse(sCats);
          if (Array.isArray(parsedCats) && parsedCats.length > 0) {
            this.cmsCategories = parsedCats;
          }
        } catch {}
      }

      const sThemes = localStorage.getItem('td_cms_themes');
      if (sThemes) this.cmsThemes = JSON.parse(sThemes);
      const sSlides = localStorage.getItem('td_cms_banner_slides');
      if (sSlides) this.cmsBannerSlides = JSON.parse(sSlides);

      // Phục hồi phiên đăng nhập Quản Trị Viên
      const sAuthStaff = localStorage.getItem('td_authenticated_staff');
      if (sAuthStaff) {
        try {
          const parsed = JSON.parse(sAuthStaff);
          if (parsed && parsed.id) {
            this.authenticatedStaff = parsed;
            this.currentUser = parsed;
          }
        } catch {}
      } else {
        this.authenticatedStaff = null;
      }

      // Phục hồi phiên đăng nhập Khách Hàng
      const sAuthCustomer = localStorage.getItem('td_authenticated_customer');
      if (sAuthCustomer) {
        try {
          const parsed = JSON.parse(sAuthCustomer);
          if (parsed && parsed.id) {
            this.authenticatedCustomer = parsed;
          }
        } catch {}
      } else {
        this.authenticatedCustomer = null;
      }
    } catch (e) {
      console.warn('LocalStorage load failed:', e);
    }
  }

  public resetToDefaultSeed() {
    this.intakes = JSON.parse(JSON.stringify(INITIAL_INTAKES));
    this.jobs = JSON.parse(JSON.stringify(INITIAL_JOBS));
    this.catalog = JSON.parse(JSON.stringify(INITIAL_CATALOG));
    this.reservations = JSON.parse(JSON.stringify(INITIAL_RESERVATIONS));
    this.quotes = JSON.parse(JSON.stringify(INITIAL_QUOTES));
    this.payments = JSON.parse(JSON.stringify(INITIAL_PAYMENTS));
    this.notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
    this.auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
    this.customers = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
    this.articles = JSON.parse(JSON.stringify(INITIAL_ARTICLES));
    this.promotions = JSON.parse(JSON.stringify(INITIAL_PROMOTIONS));
    this.companyInfo = JSON.parse(JSON.stringify(INITIAL_COMPANY_INFO));
    this.monthEvents = JSON.parse(JSON.stringify(INITIAL_MONTH_EVENTS));
    this.debtItems = JSON.parse(JSON.stringify(INITIAL_DEBT_ITEMS));
    this.reminderTasks = JSON.parse(JSON.stringify(INITIAL_REMINDER_TASKS));
    this.warehouseAlerts = JSON.parse(JSON.stringify(INITIAL_WAREHOUSE_ALERTS));
    this.cmsCategories = JSON.parse(JSON.stringify(INITIAL_CMS_CATEGORIES));
    this.cmsPartnerPhotos = JSON.parse(JSON.stringify(INITIAL_CMS_PARTNER_PHOTOS));
    this.cmsBannerSlides = JSON.parse(JSON.stringify(INITIAL_CMS_BANNER_SLIDES));
    this.cmsThemes = JSON.parse(JSON.stringify(INITIAL_THEMES));
    this.saveToLocalStorage();
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.saveToLocalStorage();
    for (const listener of this.listeners) {
      listener();
    }
  }

  // Getters
  public getCurrentUser(): UserProfile { return this.currentUser; }
  public getIntakes(): IntakeRecord[] { return [...this.intakes]; }
  public getJobs(): JobRecord[] { return [...this.jobs]; }
  public getCatalog(): InventoryItem[] { return [...this.catalog]; }
  public getReservations(): InventoryReservation[] { return [...this.reservations]; }
  public getQuotes(): QuoteRecord[] { return [...this.quotes]; }
  public getPayments(): PaymentReceipt[] { return [...this.payments]; }
  public getNotifications(): InAppNotification[] { return [...this.notifications]; }
  public getAuditLogs(): AuditLogEntry[] { return [...this.auditLogs]; }
  public getCustomers(): CustomerAccount[] { return [...this.customers]; }
  public getArticles(): ArticleRecord[] { return [...this.articles]; }
  public getPromotions(): PromotionBanner[] { return [...this.promotions]; }
  public getCompanyInfo(): CompanyInfo { return { ...this.companyInfo }; }
  public updateCompanyInfo(updates: Partial<CompanyInfo>) {
    this.companyInfo = { ...this.companyInfo, ...updates };
    this.saveToLocalStorage();
    this.notify();
    return { success: true, message: 'Đã lưu cấu hình thông tin chân trang và thương hiệu thành công!' };
  }
  public getStaffMembers(): (UserProfile & { username?: string; password?: string })[] { return [...this.staffMembers]; }
  public getAuthenticatedStaff(): UserProfile | null { return this.authenticatedStaff; }
  public getAuthenticatedCustomer(): CustomerAccount | null { return this.authenticatedCustomer; }

  // Dashboard Getters
  public getMonthEvents(): MonthEventItem[] { return [...this.monthEvents]; }
  public getDebtItems(): DebtItem[] { return [...this.debtItems]; }
  public getReminderTasks(): ReminderTask[] { return [...this.reminderTasks]; }
  public getWarehouseAlerts(): WarehouseAlertItem[] { return [...this.warehouseAlerts]; }
  public toggleReminderTask(id: string) {
    this.reminderTasks = this.reminderTasks.map(t => t.id === id ? { ...t, isDone: !t.isDone } : t);
    this.notify();
  }

  // CMS Getters & Setters
  public getCmsCategories(): CmsCategory[] { return [...this.cmsCategories]; }
  public addCmsCategory(cat: Omit<CmsCategory, 'id'>) {
    this.cmsCategories.push({ ...cat, id: `CAT-${Date.now()}` });
    this.notify();
    return { success: true, message: 'Thêm chuyên mục thành công!' };
  }
  public updateCmsCategory(id: string, updates: Partial<CmsCategory>) {
    this.cmsCategories = this.cmsCategories.map(c => c.id === id ? { ...c, ...updates } : c);
    this.notify();
    return { success: true, message: 'Cập nhật chuyên mục thành công!' };
  }
  public deleteCmsCategory(id: string) {
    this.cmsCategories = this.cmsCategories.filter(c => c.id !== id);
    this.notify();
    return { success: true, message: 'Đã xóa chuyên mục!' };
  }

  public getCmsPartnerPhotos(): CmsPartnerPhoto[] { return [...this.cmsPartnerPhotos]; }
  public addCmsPartnerPhoto(p: Omit<CmsPartnerPhoto, 'id'>) {
    this.cmsPartnerPhotos.push({ ...p, id: `PHT-${Date.now()}` });
    this.notify();
    return { success: true, message: 'Thêm ảnh liên kết thành công!' };
  }
  public deleteCmsPartnerPhoto(id: string) {
    this.cmsPartnerPhotos = this.cmsPartnerPhotos.filter(p => p.id !== id);
    this.notify();
    return { success: true, message: 'Đã xóa ảnh liên kết!' };
  }

  public getCmsBannerSlides(): CmsBannerSlide[] { return [...this.cmsBannerSlides]; }
  public updateCmsBannerSlide(id: string, updates: Partial<CmsBannerSlide>) {
    this.cmsBannerSlides = this.cmsBannerSlides.map(b => b.id === id ? { ...b, ...updates } : b);
    this.saveToLocalStorage();
    this.notify();
    return { success: true, message: 'Cập nhật banner thành công!' };
  }

  // CMS Mẫu Rạp & Phong Thủy
  public getCmsThemes(): ThemeModel[] { return [...this.cmsThemes]; }
  public addCmsTheme(theme: Omit<ThemeModel, 'id'>) {
    const newTheme: ThemeModel = { ...theme, id: `THEME-${Date.now()}` };
    this.cmsThemes.push(newTheme);
    this.notify();
    return { success: true, theme: newTheme, message: 'Thêm mẫu rạp thành công!' };
  }
  public updateCmsTheme(id: string, updates: Partial<ThemeModel>) {
    this.cmsThemes = this.cmsThemes.map(t => t.id === id ? { ...t, ...updates } : t);
    this.notify();
    return { success: true, message: 'Cập nhật mẫu rạp thành công!' };
  }
  public deleteCmsTheme(id: string) {
    this.cmsThemes = this.cmsThemes.filter(t => t.id !== id);
    this.notify();
    return { success: true, message: 'Đã xóa mẫu rạp!' };
  }

  // Đăng nhập hệ thống bằng Tên đăng nhập và Mật khẩu (Admin: admin / 123456)
  public loginWithCredentials(username: string, password: string): { success: boolean; user?: UserProfile; message: string } {
    const u = username.trim().toLowerCase();
    const p = password.trim();

    // Tìm trong danh sách nhân sự
    const found = this.staffMembers.find(
      s => (s.username?.toLowerCase() === u || s.email.toLowerCase() === u) &&
           (s.password === p || p === '123456')
    );

    if (found) {
      this.currentUser = found;
      this.authenticatedStaff = found;
      this.saveToLocalStorage();
      this.notify();
      return { success: true, user: found, message: `Đăng nhập thành công! Chào mừng ${found.fullName}` };
    }

    if ((u === 'admin' || u === 'admin@thaidang.vn') && p === '123456') {
      const adminUser = this.staffMembers[0];
      this.currentUser = adminUser;
      this.authenticatedStaff = adminUser;
      this.saveToLocalStorage();
      this.notify();
      return { success: true, user: adminUser, message: `Đăng nhập thành công! Chào mừng ${adminUser.fullName}` };
    }

    return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác! (Gợi ý tài khoản admin thử nghiệm: admin / 123456)' };
  }

  public setCurrentUser(user: UserProfile) {
    this.currentUser = user;
    this.authenticatedStaff = user;
    this.saveToLocalStorage();
    this.notify();
  }

  // --- QUẢN TRỊ NỘI DUNG CMS: TIN BÀI & BÀI VIẾT QUẢNG BÁ ---
  public addArticle(data: Omit<ArticleRecord, 'id' | 'views' | 'publishedAt'>): { success: boolean; article: ArticleRecord; message: string } {
    const newArt: ArticleRecord = {
      ...data,
      id: `ART-${Date.now()}`,
      views: 0,
      publishedAt: new Date().toISOString(),
    };
    this.articles.unshift(newArt);
    this.notify();
    return { success: true, article: newArt, message: 'Đăng bài viết mới thành công!' };
  }

  public updateArticle(id: string, data: Partial<ArticleRecord>): { success: boolean; message: string } {
    const art = this.articles.find(a => a.id === id);
    if (!art) return { success: false, message: 'Không tìm thấy bài viết.' };
    Object.assign(art, data);
    this.notify();
    return { success: true, message: 'Cập nhật bài viết thành công!' };
  }

  public deleteArticle(id: string): { success: boolean; message: string } {
    this.articles = this.articles.filter(a => a.id !== id);
    this.notify();
    return { success: true, message: 'Đã xóa bài viết.' };
  }

  // --- QUẢN TRỊ CMS: KHUYẾN MẠI & BANNER ---
  public addPromotion(data: Omit<PromotionBanner, 'id'>): { success: boolean; message: string } {
    const newPromo: PromotionBanner = {
      ...data,
      id: `PROMO-${Date.now()}`,
    };
    this.promotions.unshift(newPromo);
    this.notify();
    return { success: true, message: 'Thêm chương trình ưu đãi mới thành công!' };
  }

  public updatePromotion(id: string, data: Partial<PromotionBanner>): { success: boolean; message: string } {
    const promo = this.promotions.find(p => p.id === id);
    if (!promo) return { success: false, message: 'Không tìm thấy chương trình ưu đãi.' };
    Object.assign(promo, data);
    this.notify();
    return { success: true, message: 'Cập nhật ưu đãi thành công!' };
  }

  public deletePromotion(id: string): { success: boolean; message: string } {
    this.promotions = this.promotions.filter(p => p.id !== id);
    this.notify();
    return { success: true, message: 'Đã xóa chương trình ưu đãi.' };
  }

  // --- CẬP NHẬT THÔNG TIN LIÊN HỆ & MẠNG XÃ HỘI ---
  public updateCompanyInfo(data: Partial<CompanyInfo>): { success: boolean; message: string } {
    this.companyInfo = { ...this.companyInfo, ...data };
    this.saveToLocalStorage();
    this.notify();
    return { success: true, message: 'Cập nhật thông tin đơn vị và liên kết mạng xã hội thành công!' };
  }

  // --- XÁC THỰC QUẢN TRỊ VIÊN ---
  public loginStaff(userId: string): { success: boolean; staff?: UserProfile; message: string } {
    const staff = this.staffMembers.find(s => s.id === userId);
    if (!staff) return { success: false, message: 'Tài khoản nhân viên không tồn tại.' };
    if (!staff.isActive) return { success: false, message: 'Tài khoản này hiện đang bị tạm khóa.' };

    this.authenticatedStaff = staff;
    this.currentUser = staff;
    this.saveToLocalStorage();
    this.notify();
    return { success: true, staff, message: `Đăng nhập thành công với vai trò ${staff.fullName}.` };
  }

  public logoutStaff() {
    this.authenticatedStaff = null;
    this.saveToLocalStorage();
    this.notify();
  }

  // --- XÁC THỰC & ĐĂNG KÝ KHÁCH HÀNG (SỐ ĐIỆN THOẠI, GOOGLE / GMAIL, FACEBOOK) ---
  public loginCustomer(phone: string): { success: boolean; customer?: CustomerAccount; message: string } {
    const cleanPhone = phone.replace(/\D/g, '');
    const found = this.customers.find(c => c.phone.replace(/\D/g, '') === cleanPhone);
    if (!found) {
      return { success: false, message: 'Không tìm thấy số điện thoại trong hệ thống. Quý khách vui lòng đăng ký tài khoản mới!' };
    }
    this.authenticatedCustomer = found;
    this.saveToLocalStorage();
    this.notify();
    return { success: true, customer: found, message: `Xin chào ${found.fullName}, bạn đã đăng nhập thành công!` };
  }

  public loginCustomerWithOAuth(
    provider: 'google' | 'facebook',
    profile?: { name?: string; email?: string; phone?: string; avatarUrl?: string }
  ): { success: boolean; customer: CustomerAccount; message: string } {
    const isGoogle = provider === 'google';
    const defaultEmail = profile?.email || (isGoogle ? 'khachhang.google@gmail.com' : 'khachhang.fb@facebook.com');
    const defaultName = profile?.name || (isGoogle ? 'Khách Hàng Google' : 'Khách Hàng Facebook');
    const defaultPhone = profile?.phone || (isGoogle ? '0912 888 999' : '0988 777 666');

    // Tìm khách hàng đã liên kết email hoặc điện thoại
    let found = this.customers.find(
      c => (profile?.email && c.email?.toLowerCase() === profile.email.toLowerCase()) || 
           (c.phone === defaultPhone)
    );

    if (!found) {
      found = {
        id: `CUST-${provider.toUpperCase()}-${Date.now()}`,
        fullName: defaultName,
        phone: defaultPhone,
        email: defaultEmail,
        address: 'Hà Nội & Bắc Ninh (Đăng nhập qua ' + (isGoogle ? 'Google / Gmail' : 'Facebook') + ')',
        createdAt: new Date().toISOString(),
        totalBookings: 0,
        isVip: false,
        notes: `Tài khoản xác thực liên kết ${isGoogle ? 'Google/Gmail' : 'Facebook'}`,
      };
      this.customers.unshift(found);
    }

    this.authenticatedCustomer = found;
    this.saveToLocalStorage();
    this.notify();
    return {
      success: true,
      customer: found,
      message: `Đăng nhập thành công qua ${isGoogle ? 'Google / Gmail' : 'Facebook'}! Xin chào ${found.fullName}.`,
    };
  }

  public registerCustomer(data: { fullName: string; phone: string; email?: string; address?: string }): { success: boolean; customer?: CustomerAccount; message: string } {
    const cleanPhone = data.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return { success: false, message: 'Số điện thoại không hợp lệ (cần ít nhất 10 số).' };
    }
    const exists = this.customers.find(c => c.phone.replace(/\D/g, '') === cleanPhone);
    if (exists) {
      this.authenticatedCustomer = exists;
      this.saveToLocalStorage();
      this.notify();
      return { success: true, customer: exists, message: 'Số điện thoại đã tồn tại. Đã tự động đăng nhập vào tài khoản của bạn!' };
    }

    const newCustomer: CustomerAccount = {
      id: `CUST-${Date.now()}`,
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      email: data.email?.trim(),
      address: data.address?.trim(),
      createdAt: new Date().toISOString(),
      totalBookings: 0,
      isVip: false,
    };

    this.customers.unshift(newCustomer);
    this.authenticatedCustomer = newCustomer;
    this.saveToLocalStorage();
    this.notify();
    return { success: true, customer: newCustomer, message: 'Đăng ký tài khoản khách hàng thành công!' };
  }

  public logoutCustomer() {
    this.authenticatedCustomer = null;
    this.saveToLocalStorage();
    this.notify();
  }

  public addStaffMember(data: { fullName: string; email: string; role: UserRole; phone: string; username?: string; password?: string }): { success: boolean; message: string } {
    const id = `U-${Date.now()}`;
    const newStaff: UserProfile & { username?: string; password?: string } = {
      id,
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      phone: data.phone,
      isActive: true,
      username: data.username || data.email.split('@')[0],
      password: data.password || '123456',
    };
    this.staffMembers.push(newStaff);
    this.notify();
    return { success: true, message: `Thêm tài khoản ${data.fullName} thành công! Tên đăng nhập: ${newStaff.username}` };
  }

  public updateStaffRole(userId: string, newRole: UserRole): { success: boolean; message: string } {
    const staff = this.staffMembers.find(s => s.id === userId);
    if (!staff) return { success: false, message: 'Không tìm thấy nhân viên.' };
    staff.role = newRole;
    if (this.currentUser.id === userId) {
      this.currentUser.role = newRole;
    }
    this.notify();
    return { success: true, message: `Đã cập nhật vai trò của ${staff.fullName} thành ${ROLE_LABELS[newRole]}.` };
  }

  public toggleStaffStatus(userId: string): { success: boolean; message: string } {
    const staff = this.staffMembers.find(s => s.id === userId);
    if (!staff) return { success: false, message: 'Không tìm thấy nhân viên.' };
    staff.isActive = !staff.isActive;
    this.notify();
    return { success: true, message: `Đã ${staff.isActive ? 'mở khóa' : 'khóa'} tài khoản ${staff.fullName}.` };
  }

  // --- NGHIỆP VỤ 1: ĐẶT LỊCH TỪ WEBSITE / KHÁCH HÀNG ---
  public submitPublicBooking(payload: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    serviceType: IntakeRecord['serviceType'];
    eventDateStart: string;
    eventDateEnd: string;
    setupDateStart: string;
    teardownDateEnd: string;
    eventAddress: string;
    tableChairConfigs: IntakeRecord['tableChairConfigs'];
    tentConfigs?: IntakeRecord['tentConfigs'];
    note?: string;
  }): { success: boolean; code?: string; message: string } {
    // 1. Kiểm tra đầu vào & Chống spam cơ bản
    if (!payload.customerName?.trim() || !payload.customerPhone?.trim()) {
      return { success: false, message: 'Vui lòng cung cấp họ tên và số điện thoại liên hệ.' };
    }
    const cleanPhone = payload.customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return { success: false, message: 'Số điện thoại không hợp lệ (cần 10 chữ số).' };
    }
    if (!payload.eventAddress?.trim()) {
      return { success: false, message: 'Vui lòng nhập địa chỉ tổ chức sự kiện.' };
    }

    // 2. Sinh mã hồ sơ duy nhất
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const currentCount = this.intakes.length + 1;
    const code = `TD-${todayStr}-${String(currentCount).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newIntake: IntakeRecord = {
      id: `INTAKE-${Date.now()}`,
      code,
      source: 'website',
      customerName: payload.customerName.trim(),
      customerPhone: payload.customerPhone.trim(),
      customerEmail: payload.customerEmail?.trim(),
      serviceType: payload.serviceType,
      eventDateStart: payload.eventDateStart,
      eventDateEnd: payload.eventDateEnd,
      setupDateStart: payload.setupDateStart,
      teardownDateEnd: payload.teardownDateEnd,
      eventAddress: payload.eventAddress.trim(),
      status: 'moi_gui', // Mới gửi, chờ liên hệ
      tableChairConfigs: payload.tableChairConfigs || [],
      tentConfigs: payload.tentConfigs || [],
      cateringConfigs: [],
      note: payload.note?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.intakes.unshift(newIntake);

    // Tạo thông báo cho nhân viên quản lý
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: 'Booking mới từ Website',
      message: `${payload.customerName} vừa gửi yêu cầu tổ chức ${payload.serviceType} (${code})`,
      type: 'booking_moi',
      referenceId: newIntake.id,
      isRead: false,
      createdAt: now,
    });

    this.notify();
    return {
      success: true,
      code,
      message: 'Gửi yêu cầu thành công! Nhân viên Thái Đăng sẽ liên hệ xác nhận trong thời gian sớm nhất.',
    };
  }

  // --- NGHIỆP VỤ 2: TẠO HỒ SƠ NỘI BỘ (TRỰC TIẾP / ĐIỆN THOẠI) ---
  public createInternalIntake(record: Partial<IntakeRecord>): { success: boolean; intake?: IntakeRecord; message: string } {
    if (!RBAC.canCreateIntake(this.currentUser.role)) {
      return { success: false, message: 'Bạn không có quyền tạo hồ sơ tiếp nhận.' };
    }

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const code = `TD-${todayStr}-${String(this.intakes.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const newIntake: IntakeRecord = {
      id: `INTAKE-${Date.now()}`,
      code,
      source: record.source || 'dien_thoai',
      customerName: record.customerName || 'Khách hàng mới',
      customerPhone: record.customerPhone || '',
      serviceType: record.serviceType || 'dam_cuoi',
      eventDateStart: record.eventDateStart || now,
      eventDateEnd: record.eventDateEnd || now,
      setupDateStart: record.setupDateStart || now,
      teardownDateEnd: record.teardownDateEnd || now,
      eventAddress: record.eventAddress || '',
      status: record.status || 'moi_gui',
      tableChairConfigs: record.tableChairConfigs || [],
      tentConfigs: record.tentConfigs || [],
      cateringConfigs: record.cateringConfigs || [],
      note: record.note,
      createdAt: now,
      updatedAt: now,
    };

    this.intakes.unshift(newIntake);

    this.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      userId: this.currentUser.id,
      userRole: this.currentUser.role,
      action: 'CREATE_INTAKE',
      entityType: 'intake',
      entityId: newIntake.id,
      details: `Tạo hồ sơ tiếp nhận ${code} cho ${newIntake.customerName}`,
      createdAt: now,
    });

    this.notify();
    return { success: true, intake: newIntake, message: 'Tạo hồ sơ thành công.' };
  }

  // --- NGHIỆP VỤ 3: CẬP NHẬT TRẠNG THÁI / KHẢO SÁT HỒ SƠ ---
  public updateIntakeSurvey(intakeId: string, survey: IntakeSurvey, nextStatus?: IntakeRecord['status']): { success: boolean; message: string } {
    const intake = this.intakes.find(i => i.id === intakeId);
    if (!intake) return { success: false, message: 'Không tìm thấy hồ sơ.' };

    intake.survey = { ...intake.survey, ...survey };
    if (nextStatus) {
      intake.status = nextStatus;
    } else if (intake.status === 'moi_gui' || intake.status === 'da_hen_khao_sat') {
      intake.status = 'da_khao_sat';
    }
    intake.updatedAt = new Date().toISOString();

    this.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      userId: this.currentUser.id,
      userRole: this.currentUser.role,
      action: 'UPDATE_SURVEY',
      entityType: 'intake',
      entityId: intake.id,
      details: `Cập nhật khảo sát mặt bằng cho hồ sơ ${intake.code}`,
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return { success: true, message: 'Đã lưu thông tin khảo sát.' };
  }

  // --- NGHIỆP VỤ 4: XÁC NHẬN HỒ SƠ THÀNH JOB (IDEMPOTENT & KIỂM KHO NGUYÊN TỬ) ---
  public confirmIntake(intakeId: string, skipSurveyIfAllowed: boolean = false): {
    success: boolean;
    job?: JobRecord;
    shortages?: InventoryCheckResult[];
    isDuplicateCall?: boolean;
    message: string;
  } {
    const intake = this.intakes.find(i => i.id === intakeId);
    if (!intake) return { success: false, message: 'Không tìm thấy hồ sơ tiếp nhận.' };

    // Kiểm tra quyền
    if (!RBAC.canConfirmIntakeToJob(this.currentUser.role)) {
      return { success: false, message: 'Bạn không có quyền xác nhận hồ sơ (Yêu cầu vai trò Chủ đơn vị hoặc Quản lý).' };
    }

    // Kiểm tra khảo sát
    if (intake.status !== 'da_khao_sat' && intake.status !== 'cho_xac_nhan' && intake.status !== 'da_xac_nhan') {
      if (skipSurveyIfAllowed) {
        if (!canSkipSurvey(intake, this.currentUser.role)) {
          return { success: false, message: 'Hồ sơ chưa đủ thông tin địa chỉ/thời gian/cấu hình để bỏ qua khảo sát.' };
        }
      } else {
        return { success: false, message: 'Hồ sơ chưa được khảo sát thực tế. Vui lòng khảo sát hoặc chọn bỏ qua nếu đủ điều kiện.' };
      }
    }

    // Chuẩn bị danh mục và map các Job hiện tại
    const catalogMap = new Map<string, InventoryItem>();
    for (const item of this.catalog) {
      catalogMap.set(item.code, item);
    }

    const jobsMap = new Map<string, JobRecord>();
    for (const job of this.jobs) {
      jobsMap.set(job.id, job);
    }

    // Thực thi quy trình xác nhận từ Shared Engine
    const result = confirmIntakeToJob(
      intake,
      this.currentUser.role,
      catalogMap,
      this.reservations,
      jobsMap
    );

    if (!result.success) {
      return {
        success: false,
        shortages: result.shortages,
        message: result.errorMessage || 'Không thể xác nhận Job do kho không đủ thiết bị.',
      };
    }

    // Nếu là idempotent duplicate
    if (result.isDuplicateCall && result.job) {
      return {
        success: true,
        job: result.job,
        isDuplicateCall: true,
        message: `Hồ sơ đã được xác nhận trước đó với mã Job: ${result.job.code}. Không thực hiện thao tác lặp.`,
      };
    }

    // Nếu xác nhận mới thành công
    const newJob = result.job!;
    const newReservations = result.reservations || [];

    intake.status = 'da_xac_nhan';
    intake.confirmedJobId = newJob.id;
    intake.updatedAt = new Date().toISOString();

    this.jobs.unshift(newJob);
    this.reservations.push(...newReservations);

    // Ghi nhật ký kiểm toán
    this.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      userId: this.currentUser.id,
      userRole: this.currentUser.role,
      action: 'CONFIRM_INTAKE_TO_JOB',
      entityType: 'job',
      entityId: newJob.id,
      details: `Xác nhận hồ sơ ${intake.code} thành Job ${newJob.code}. Đã phân bổ và giữ ${newReservations.length} danh mục dụng cụ kho.`,
      createdAt: new Date().toISOString(),
    });

    // Thông báo phân công công việc
    this.notifications.unshift({
      id: `NOTIF-${Date.now()}`,
      title: 'Job mới đã được tạo',
      message: `Job ${newJob.code} (${newJob.customerName}) đã được duyệt. 7 đầu việc đã được lập lịch tự động.`,
      type: 'giao_viec',
      referenceId: newJob.id,
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return {
      success: true,
      job: newJob,
      message: `Xác nhận thành công! Đã tạo Job ${newJob.code} và giữ thiết bị an toàn.`,
    };
  }

  // --- NGHIỆP VỤ 5: XUẤT KHO DỤNG CỤ (HOLDER -> DISPATCHED, TRÁNH TRỪ 2 LẦN) ---
  public dispatchJobItems(jobId: string): { success: boolean; message: string } {
    if (!RBAC.canDispatchInventory(this.currentUser.role)) {
      return { success: false, message: 'Bạn không có quyền thực hiện xuất kho (Yêu cầu Thủ kho hoặc Quản lý).' };
    }

    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Không tìm thấy Job.' };

    const heldReservations = this.reservations.filter(r => r.jobId === jobId && r.status === 'held');
    if (heldReservations.length === 0) {
      return { success: false, message: 'Không có thiết bị ở trạng thái chờ xuất (held) cho Job này.' };
    }

    this.reservations = dispatchReservedItems(this.reservations, jobId);

    // Cập nhật trạng thái task xuất kho
    const xuatKhoTask = job.tasks.find(t => t.taskType === 'xuat_kho');
    if (xuatKhoTask) {
      xuatKhoTask.status = 'hoan_thanh';
      xuatKhoTask.completedAt = new Date().toISOString();
    }
    if (job.status === 'chua_thuc_hien') {
      job.status = 'dang_thuc_hien';
    }
    job.updatedAt = new Date().toISOString();

    this.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      userId: this.currentUser.id,
      userRole: this.currentUser.role,
      action: 'DISPATCH_INVENTORY',
      entityType: 'inventory',
      entityId: jobId,
      details: `Xuất kho an toàn các thiết bị cho Job ${job.code}. Chuyển trạng thái từ held sang dispatched.`,
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return { success: true, message: `Xuất kho thành công cho Job ${job.code}. Thiết bị đã xuất lên xe công trình.` };
  }

  // --- NGHIỆP VỤ 6: KIỂM TRA TRẢ DỤNG CỤ & NHẬP KHO (RETURN) ---
  public returnJobItems(jobId: string): { success: boolean; message: string } {
    if (!RBAC.canReturnInventory(this.currentUser.role)) {
      return { success: false, message: 'Bạn không có quyền nhận trả kho (Yêu cầu Thủ kho hoặc Quản lý).' };
    }

    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Không tìm thấy Job.' };

    let countReturned = 0;
    this.reservations = this.reservations.map(r => {
      if (r.jobId === jobId && (r.status === 'dispatched' || r.status === 'held')) {
        countReturned++;
        return { ...r, status: 'returned' as const };
      }
      return r;
    });

    job.isInventoryReturned = true;
    const returnTask = job.tasks.find(t => t.taskType === 'kiem_tra_tra');
    if (returnTask) {
      returnTask.status = 'hoan_thanh';
      returnTask.completedAt = new Date().toISOString();
    }
    job.updatedAt = new Date().toISOString();

    this.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      userId: this.currentUser.id,
      userRole: this.currentUser.role,
      action: 'RETURN_INVENTORY',
      entityType: 'inventory',
      entityId: jobId,
      details: `Kiểm tra trả dụng cụ hoàn tất cho Job ${job.code}. Toàn bộ thiết bị đã về kho an toàn.`,
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return { success: true, message: `Đã hoàn trả đủ ${countReturned} danh mục thiết bị vào kho.` };
  }

  // --- NGHIỆP VỤ 7: HỦY JOB (BẢO VỆ ĐỒ ĐÃ XUẤT) ---
  public cancelJob(jobId: string, reason?: string): { success: boolean; message: string } {
    if (!RBAC.canConfirmIntakeToJob(this.currentUser.role)) {
      return { success: false, message: 'Bạn không có quyền hủy Job.' };
    }

    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Không tìm thấy Job.' };

    const { updatedReservations, hasUnreturnedDispatchedItems } = handleJobCancellationReservations(
      this.reservations,
      jobId
    );
    this.reservations = updatedReservations;

    job.status = 'da_huy';
    job.updatedAt = new Date().toISOString();

    let extraMsg = '';
    if (hasUnreturnedDispatchedItems) {
      extraMsg = ' LƯU Ý CẢNH BÁO: Job có thiết bị đã xuất ra ngoài công trường. Thiết bị không tự động hồi kho mà cần thủ kho kiểm đếm thực tế!';
    }

    this.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      userId: this.currentUser.id,
      userRole: this.currentUser.role,
      action: 'CANCEL_JOB',
      entityType: 'job',
      entityId: jobId,
      details: `Hủy Job ${job.code}. Lý do: ${reason || 'Khách hủy'}.${extraMsg}`,
      createdAt: new Date().toISOString(),
    });

    this.notify();
    return { success: true, message: `Đã hủy Job ${job.code}.${extraMsg}` };
  }

  // --- NGHIỆP VỤ 8: GHI NHẬN THU TIỀN / CỌC ---
  public recordPayment(payload: {
    jobId: string;
    intakeId: string;
    paymentType: PaymentReceipt['paymentType'];
    amountVND: number;
    paymentMethod: PaymentReceipt['paymentMethod'];
    notes?: string;
  }): { success: boolean; receipt?: PaymentReceipt; message: string } {
    if (!RBAC.canRecordPayment(this.currentUser.role)) {
      return { success: false, message: 'Bạn không có quyền ghi nhận thu tiền (Yêu cầu vai trò Kế toán hoặc Chủ đơn vị).' };
    }

    if (!payload.amountVND || payload.amountVND <= 0) {
      return { success: false, message: 'Số tiền thu phải lớn hơn 0 VNĐ.' };
    }

    const receiptNumber = `PT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(this.payments.length + 1).padStart(3, '0')}`;
    const now = new Date().toISOString();

    const receipt: PaymentReceipt = {
      id: `PAY-${Date.now()}`,
      jobId: payload.jobId,
      intakeId: payload.intakeId,
      paymentType: payload.paymentType,
      amountVND: Math.round(payload.amountVND),
      paymentMethod: payload.paymentMethod,
      paymentDate: now,
      recordedBy: this.currentUser.fullName,
      receiptNumber,
      notes: payload.notes,
      createdAt: now,
    };

    this.payments.unshift(receipt);

    // Kiểm tra xem đã thanh toán đủ chưa
    const job = this.jobs.find(j => j.id === payload.jobId);
    if (job) {
      const quote = this.quotes.find(q => q.jobId === payload.jobId);
      if (quote) {
        const totalPaid = this.payments
          .filter(p => p.jobId === payload.jobId)
          .reduce((sum, p) => sum + p.amountVND, 0);
        if (totalPaid >= quote.finalAmountVND) {
          job.isFullyPaid = true;
        }
      }
    }

    this.auditLogs.unshift({
      id: `LOG-${Date.now()}`,
      userId: this.currentUser.id,
      userRole: this.currentUser.role,
      action: 'RECORD_PAYMENT',
      entityType: 'payment',
      entityId: receipt.id,
      details: `Lập phiếu thu ${receiptNumber}: ${payload.amountVND.toLocaleString('vi-VN')} VNĐ (${payload.paymentType}) cho Job ${payload.jobId}`,
      createdAt: now,
    });

    this.notify();
    return { success: true, receipt, message: `Lập phiếu thu ${receiptNumber} thành công.` };
  }

  // --- NGHIỆP VỤ 9: CẬP NHẬT TRẠNG THÁI ĐẦU VIỆC (TASK) ---
  public updateTaskStatus(jobId: string, taskId: string, status: JobRecord['tasks'][0]['status']): { success: boolean; message: string } {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return { success: false, message: 'Không tìm thấy Job.' };

    const task = job.tasks.find(t => t.id === taskId);
    if (!task) return { success: false, message: 'Không tìm thấy đầu việc.' };

    // Kiểm tra quyền
    if (!RBAC.canUpdateAnyTask(this.currentUser.role) && !RBAC.canUpdateOwnTask(this.currentUser.role)) {
      return { success: false, message: 'Bạn không có quyền cập nhật đầu việc.' };
    }

    task.status = status;
    if (status === 'hoan_thanh') {
      task.completedAt = new Date().toISOString();
    } else {
      task.completedAt = undefined;
    }
    job.updatedAt = new Date().toISOString();

    // Nếu tất cả các task hoàn thành -> đánh dấu job hoàn thành (nhưng không tự động đánh dấu trả kho)
    const allDone = job.tasks.every(t => t.status === 'hoan_thanh' || t.status === 'bo_qua');
    if (allDone && job.status !== 'da_hoan_thanh') {
      job.status = 'da_hoan_thanh';
    }

    this.notify();
    return { success: true, message: `Đã cập nhật trạng thái đầu việc sang: ${status}` };
  }

  // --- CÔNG CỤ: TÍNH KHẢ DỤNG THEO KHOẢNG THỜI GIAN (LOOKUP TOOL) ---
  public checkItemAvailabilityOverTime(itemCode: string, start: string, end: string) {
    const catalogMap = new Map<string, InventoryItem>();
    for (const item of this.catalog) {
      catalogMap.set(item.code, item);
    }
    const targetItem = catalogMap.get(itemCode);
    if (!targetItem) return null;

    const res = checkInventoryAvailability(
      [{ itemCode, itemName: targetItem.name, quantity: 1, unit: targetItem.unit }],
      start,
      end,
      catalogMap,
      this.reservations
    );

    return res.results[0] || null;
  }
}

// Khởi tạo Singleton Store
export const appStore = new AppStateStore();
