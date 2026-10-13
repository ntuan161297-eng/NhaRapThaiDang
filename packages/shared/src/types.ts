// packages/shared/src/types.ts

export type UserRole = 
  | 'chu_don_vi'            // Toàn quyền
  | 'quan_ly'               // Tiếp nhận, khảo sát, điều phối, xác nhận Job
  | 'tu_van'                // Khách, hồ sơ, báo giá trong phạm vi
  | 'kho'                   // Quản lý dụng cụ, kiểm tra, xuất - trả
  | 'ke_toan'               // Thu tiền, cọc, công nợ
  | 'nhan_vien_thuc_hien';  // Xem và cập nhật đầu việc được giao

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
}

export type IntakeStatus =
  | 'moi_gui'           // Mới gửi
  | 'dang_lien_he'      // Đang liên hệ
  | 'da_hen_khao_sat'   // Đã hẹn khảo sát
  | 'da_khao_sat'       // Đã khảo sát
  | 'cho_xac_nhan'      // Chờ xác nhận
  | 'da_xac_nhan'       // Đã xác nhận -> Tạo Job
  | 'khong_tiep_tuc'    // Không tiếp tục
  | 'da_huy';           // Đã hủy

export type IntakeSource = 'website' | 'truc_tiep' | 'dien_thoai' | 'khac';

export type ServiceType = 
  | 'dam_cuoi'     // Đám cưới
  | 'dam_hoi'      // Đám hỏi
  | 'dam_hieu'     // Đám hiếu
  | 'nha_moi'      // Nhà mới (tân gia)
  | 'le_49_ngay';  // Lễ 49 ngày (có thể liên kết đám hiếu, quyết toán riêng)

export type ChairType = 'ghe_inox' | 'ghe_nhua_do';
export type TableType = 'ban_tron' | 'ban_dai';

export interface TableChairConfigItem {
  id?: string;
  area: string;                 // e.g., 'Rạp chính', 'Rạp cỗ', 'Khu VIP'
  tableType: TableType;         // e.g., 'ban_tron'
  chairType: ChairType;         // e.g., 'ghe_inox' | 'ghe_nhua_do'
  tableCount: number;           // e.g., 20
  chairsPerTable: number;       // e.g., 6
  extraChairs?: number;         // Ghế lẻ dự phòng
  backupTables?: number;        // Bàn dự phòng
}

export interface ConvertedItemDemand {
  itemCode: string;
  itemName: string;
  quantity: number;
  unit: string;
  isCustomQuota?: boolean;
}

export interface TentConfigItem {
  id?: string;
  tentType: 'rap_chinh' | 'rap_hau_can' | 'rap_co';
  themeId?: string;
  themeName?: string;
  bayCount: number;             // Số khoang rạp
  widthMeters?: number;         // Chiều ngang (m)
  lengthMeters?: number;        // Chiều dài (m)
  note?: string;
}

export interface CateringConfigItem {
  id?: string;
  trayCount: number;            // Số mâm
  peoplePerTray: number;        // Số người/mâm (thường 6)
  menuName: string;             // Thực đơn
  serviceRounds: number;        // Số lượt phục vụ
  provider: 'thai_dang' | 'doi_tac_ngoai'; // Đơn vị cung cấp
}

export interface IntakeSurvey {
  surveyDate?: string;
  surveyorId?: string;
  surveyorName?: string;
  addressDetail?: string;
  locationPrecision?: 'chinh_xac' | 'uoc_luong' | 'can_xac_minh';
  roadNote?: string;            // Ghi chú đường vào: xe tải vào được hay phải bê bộ
  groundSize?: string;          // Kích thước mặt bằng (dài x rộng)
  powerSourceNote?: string;     // Nguồn điện sẵn có
  surveyNotes?: string;
}

export interface IntakeRecord {
  id: string;
  code: string;                 // Mã hồ sơ: e.g., TD-20261012-001
  source: IntakeSource;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: ServiceType;
  eventDateStart: string;       // Ngày giờ bắt đầu tiệc
  eventDateEnd: string;         // Ngày giờ kết thúc tiệc
  setupDateStart: string;       // Ngày giờ bắt đầu chiếm dụng thiết bị (lắp dựng)
  teardownDateEnd: string;      // Ngày giờ kết thúc hoàn trả thiết bị
  eventAddress: string;
  status: IntakeStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  tableChairConfigs: TableChairConfigItem[];
  tentConfigs?: TentConfigItem[];
  cateringConfigs?: CateringConfigItem[];
  survey?: IntakeSurvey;
  note?: string;
  createdAt: string;
  updatedAt: string;
  confirmedJobId?: string;
  estimatedPriceVND?: number;
  idempotencyKey?: string;
}

export type JobStatus = 
  | 'chua_thuc_hien' 
  | 'dang_thuc_hien' 
  | 'da_hoan_thanh' 
  | 'tam_hoan' 
  | 'da_huy';

export type TaskType =
  | 'chuan_bi'          // Chuẩn bị
  | 'xuat_kho'          // Xuất kho
  | 'van_chuyen'        // Vận chuyển
  | 'lap_dat'           // Lắp đặt
  | 'phuc_vu'           // Phục vụ
  | 'thao_do_thu_hoi'   // Tháo dỡ và thu hồi
  | 'kiem_tra_tra';     // Kiểm tra trả dụng cụ

export type TaskStatus = 'chua_bat_dau' | 'dang_xu_ly' | 'hoan_thanh' | 'bo_qua';

export interface JobTask {
  id: string;
  jobId: string;
  taskType: TaskType;
  title: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  assignedPersonOrTeam: string;
  status: TaskStatus;
  notes?: string;
  completedAt?: string;
}

export interface JobRecord {
  id: string;
  code: string;                 // Mã Job: e.g., JOB-202610-001
  intakeId: string;
  customerName: string;
  customerPhone: string;
  serviceType: ServiceType;
  eventAddress: string;
  status: JobStatus;
  eventDateStart: string;
  eventDateEnd: string;
  equipmentUsageStart: string;  // Thời gian bắt đầu chiếm dụng thiết bị
  equipmentUsageEnd: string;    // Thời gian sẵn sàng dùng lại thiết bị
  tasks: JobTask[];
  tableChairConfigs: TableChairConfigItem[];
  tentConfigs?: TentConfigItem[];
  itemsSnapshot: ConvertedItemDemand[]; // Snapshot định mức tại thời điểm xác nhận
  isInventoryReturned: boolean; // Job hoàn thành không tự động đánh dấu đã trả kho
  isFullyPaid: boolean;         // Job hoàn thành không tự động đánh dấu đã thanh toán
  createdAt: string;
  updatedAt: string;
}

export type InventoryCategory = 'ban' | 'ghe' | 'rap' | 'am_thanh_anh_sang' | 'dung_cu_tiec' | 'vat_tu_tieu_hao';

export interface InventoryItem {
  id: string;
  code: string;                 // e.g., 'BAN_TRON', 'GHE_INOX', 'GHE_NHUA_DO'
  name: string;
  category: InventoryCategory;
  unit: string;                 // 'cái', 'bộ', 'kg', 'khoang'
  totalOwnedQuantity: number;   // Số lượng sở hữu
  inRepairQuantity: number;     // Đang bảo dưỡng / sửa chữa
  scrappedQuantity: number;     // Đã thanh lý
  externalRentedQuantity: number; // Thuê ngoài bổ sung (đã xác nhận)
  bufferRatio: number;          // Tỷ lệ dự phòng an toàn (e.g., 0.1 = 10%)
  cleaningTurnaroundHours: number; // Thời gian vệ sinh kiểm tra trước khi dùng lại (giờ)
}

export type ReservationStatus = 'held' | 'dispatched' | 'returned' | 'cancelled';

export interface InventoryReservation {
  id: string;
  jobId: string;
  itemCode: string;
  requestedQuantity: number;
  periodStart: string;          // ISO string
  periodEnd: string;            // ISO string (bao gồm turnaround time)
  status: ReservationStatus;
  createdAt: string;
}

export interface InventoryCheckResult {
  isAvailable: boolean;
  status: 'du' | 'sat_nguong' | 'thieu';
  itemCode: string;
  itemName: string;
  totalOwned: number;
  inRepair: number;
  netPhysicalCapacity: number;  // totalOwned + externalRented - inRepair - scrapped
  alreadyReservedOtherJobs: number;
  requestedThisJob: number;
  remainingAfterThisJob: number;
  shortageQuantity: number;     // > 0 nếu thiếu
  conflictingJobCodes: string[];
}

export interface QuoteItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitPriceVND: number;
  totalVND: number;
  isPackage: boolean;
}

export interface QuoteRecord {
  id: string;
  intakeId: string;
  jobId?: string;
  version: number;
  isFinal: boolean;
  items: QuoteItem[];
  totalAmountVND: number;
  discountVND: number;
  finalAmountVND: number;
  notes?: string;
  createdAt: string;
}

export type PaymentType = 'tien_coc' | 'thanh_toan_dot' | 'quyet_toan';
export type PaymentMethod = 'tien_mat' | 'chuyen_khoan';

export interface PaymentReceipt {
  id: string;
  jobId: string;
  intakeId: string;
  paymentType: PaymentType;
  amountVND: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  recordedBy: string;
  notes?: string;
  receiptNumber: string;
}

export interface JobFinancialSummary {
  totalQuoteVND: number;
  depositReceivedVND: number;
  totalPaidVND: number;
  remainingDebtVND: number;
  isFullySettled: boolean;
}

export interface InAppNotification {
  id: string;
  userId?: string;              // Target user hoặc null cho tất cả quản lý
  title: string;
  message: string;
  type: 'booking_moi' | 'giao_viec' | 'canh_bao_kho' | 'thay_doi_lich';
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  entityType: 'intake' | 'job' | 'inventory' | 'payment' | 'quote';
  entityId: string;
  details: string;
  createdAt: string;
}
