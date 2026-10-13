// packages/shared/src/workflowEngine.ts
import type {
  IntakeRecord,
  JobRecord,
  JobTask,
  UserRole,
  InventoryItem,
  InventoryReservation,
  ConvertedItemDemand,
  InventoryCheckResult
} from './types.ts';
import { convertTableChairConfigs } from './tableChairRules.ts';
import { convertTentConfigs, convertCateringConfigs } from './tentCateringRules.ts';
import { checkInventoryAvailability } from './inventoryEngine.ts';

export interface ConfirmIntakeResult {
  success: boolean;
  isDuplicateCall?: boolean;
  job?: JobRecord;
  reservations?: InventoryReservation[];
  shortages?: InventoryCheckResult[];
  errorMessage?: string;
}

/**
 * Kiểm tra xem người dùng có quyền xác nhận hồ sơ hay không.
 */
export function canConfirmIntake(role: UserRole): boolean {
  return role === 'chu_don_vi' || role === 'quan_ly';
}

/**
 * Kiểm tra xem hồ sơ có đủ điều kiện bỏ qua khảo sát không.
 */
export function canSkipSurvey(intake: IntakeRecord, role: UserRole): boolean {
  if (!canConfirmIntake(role)) return false;
  // Bỏ qua khảo sát khi có đủ thông tin địa chỉ cụ thể và cấu hình
  const hasAddress = Boolean(intake.eventAddress && intake.eventAddress.trim().length > 5);
  const hasTime = Boolean(intake.eventDateStart && intake.setupDateStart && intake.teardownDateEnd);
  const hasConfigs = intake.tableChairConfigs && intake.tableChairConfigs.length > 0;
  return hasAddress && hasTime && hasConfigs;
}

/**
 * Tạo danh sách 7 đầu việc chuẩn cho một Job sự kiện.
 */
export function generateStandardJobTasks(
  jobId: string,
  setupStart: string,
  eventStart: string,
  eventEnd: string,
  teardownEnd: string
): JobTask[] {
  const dSetup = new Date(setupStart);
  const dEventStart = new Date(eventStart);
  const dEventEnd = new Date(eventEnd);
  const dTeardown = new Date(teardownEnd);

  // 1. Chuẩn bị (Trước giờ xuất kho 3 tiếng)
  const tChuanBiStart = new Date(dSetup.getTime() - 4 * 3600 * 1000).toISOString();
  const tChuanBiEnd = new Date(dSetup.getTime() - 2 * 3600 * 1000).toISOString();

  // 2. Xuất kho (Trước giờ chuyển 2 tiếng)
  const tXuatKhoStart = new Date(dSetup.getTime() - 2 * 3600 * 1000).toISOString();
  const tXuatKhoEnd = new Date(dSetup.getTime() - 1 * 3600 * 1000).toISOString();

  // 3. Vận chuyển
  const tVanChuyenStart = new Date(dSetup.getTime() - 1 * 3600 * 1000).toISOString();
  const tVanChuyenEnd = setupStart;

  // 4. Lắp đặt (Từ lúc bắt đầu chiếm dụng đến trước khi tiệc diễn ra 2 tiếng)
  const tLapDatStart = setupStart;
  const tLapDatEnd = new Date(dEventStart.getTime() - 2 * 3600 * 1000).toISOString();

  // 5. Phục vụ (Suốt thời gian diễn ra tiệc)
  const tPhucVuStart = eventStart;
  const tPhucVuEnd = eventEnd;

  // 6. Tháo dỡ và thu hồi (Từ khi kết thúc tiệc đến hạn trả)
  const tThaoDoStart = eventEnd;
  const tThaoDoEnd = teardownEnd;

  // 7. Kiểm tra trả dụng cụ (Sau khi xe về kho 2 tiếng)
  const tKiemTraStart = teardownEnd;
  const dKiemTraEnd = new Date(new Date(teardownEnd).getTime() + 2 * 3600 * 1000).toISOString();

  return [
    {
      id: `${jobId}-TASK-1`,
      jobId,
      taskType: 'chuan_bi',
      title: 'Chuẩn bị thiết bị & kiểm đếm vật tư tại xưởng',
      scheduledStartTime: tChuanBiStart,
      scheduledEndTime: tChuanBiEnd,
      assignedPersonOrTeam: 'Đội kho & Kỹ thuật chuẩn bị',
      status: 'chua_bat_dau',
    },
    {
      id: `${jobId}-TASK-2`,
      jobId,
      taskType: 'xuat_kho',
      title: 'Xuất kho thiết bị lên xe tải',
      scheduledStartTime: tXuatKhoStart,
      scheduledEndTime: tXuatKhoEnd,
      assignedPersonOrTeam: 'Thủ kho Thái Đăng',
      status: 'chua_bat_dau',
    },
    {
      id: `${jobId}-TASK-3`,
      jobId,
      taskType: 'van_chuyen',
      title: 'Vận chuyển đến địa điểm tổ chức sự kiện',
      scheduledStartTime: tVanChuyenStart,
      scheduledEndTime: tVanChuyenEnd,
      assignedPersonOrTeam: 'Đội xe vận tải',
      status: 'chua_bat_dau',
    },
    {
      id: `${jobId}-TASK-4`,
      jobId,
      taskType: 'lap_dat',
      title: 'Dựng khung rạp, căng bạt, kê bàn ghế & kết nối điện',
      scheduledStartTime: tLapDatStart,
      scheduledEndTime: tLapDatEnd,
      assignedPersonOrTeam: 'Đội thi công rạp Thái Đăng',
      status: 'chua_bat_dau',
    },
    {
      id: `${jobId}-TASK-5`,
      jobId,
      taskType: 'phuc_vu',
      title: 'Trực kỹ thuật âm thanh, ánh sáng & hỗ trợ sự kiện',
      scheduledStartTime: tPhucVuStart,
      scheduledEndTime: tPhucVuEnd,
      assignedPersonOrTeam: 'Kỹ thuật viên hiện trường',
      status: 'chua_bat_dau',
    },
    {
      id: `${jobId}-TASK-6`,
      jobId,
      taskType: 'thao_do_thu_hoi',
      title: 'Tháo dỡ phông rạp, thu gom bàn ghế & bốc xếp lên xe',
      scheduledStartTime: tThaoDoStart,
      scheduledEndTime: tThaoDoEnd,
      assignedPersonOrTeam: 'Đội thi công & thu hồi',
      status: 'chua_bat_dau',
    },
    {
      id: `${jobId}-TASK-7`,
      jobId,
      taskType: 'kiem_tra_tra',
      title: 'Kiểm tra trả dụng cụ, vệ sinh & nhập kho',
      scheduledStartTime: tKiemTraStart,
      scheduledEndTime: dKiemTraEnd,
      assignedPersonOrTeam: 'Thủ kho & KCS',
      status: 'chua_bat_dau',
    },
  ];
}

/**
 * Tổng hợp toàn bộ nhu cầu dụng cụ từ cấu hình của hồ sơ.
 */
export function aggregateAllIntakeDemands(intake: IntakeRecord): ConvertedItemDemand[] {
  const tableChairDemands = convertTableChairConfigs(intake.tableChairConfigs || []);
  const tentDemands = convertTentConfigs(intake.tentConfigs || []);
  const cateringDemands = convertCateringConfigs(intake.cateringConfigs || []);

  const merged = new Map<string, ConvertedItemDemand>();

  for (const item of [...tableChairDemands, ...tentDemands, ...cateringDemands]) {
    const existing = merged.get(item.itemCode);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      merged.set(item.itemCode, { ...item });
    }
  }

  return Array.from(merged.values());
}

/**
 * Quy trình xác nhận hồ sơ thành Job và giữ kho (Có tính IDEMPOTENT).
 */
export function confirmIntakeToJob(
  intake: IntakeRecord,
  userRole: UserRole,
  catalog: Map<string, InventoryItem>,
  existingReservations: InventoryReservation[],
  existingJobs: Map<string, JobRecord>,
  currentTime: string = new Date().toISOString()
): ConfirmIntakeResult {
  // 1. Kiểm tra quyền
  if (!canConfirmIntake(userRole)) {
    return {
      success: false,
      errorMessage: 'Bạn không có quyền xác nhận hồ sơ thành Job (Yêu cầu Chủ đơn vị hoặc Quản lý).',
    };
  }

  // 2. IDEMPOTENT: Nếu hồ sơ đã xác nhận và đã có Job, trả về Job hiện tại
  if (intake.status === 'da_xac_nhan' && intake.confirmedJobId) {
    const existingJob = existingJobs.get(intake.confirmedJobId);
    if (existingJob) {
      const relatedReservations = existingReservations.filter(r => r.jobId === existingJob.id);
      return {
        success: true,
        isDuplicateCall: true,
        job: existingJob,
        reservations: relatedReservations,
      };
    }
  }

  // 3. Quy đổi nhu cầu dụng cụ
  const demands = aggregateAllIntakeDemands(intake);

  // 4. Kiểm tra khả năng đáp ứng của kho
  const checkResult = checkInventoryAvailability(
    demands,
    intake.setupDateStart,
    intake.teardownDateEnd,
    catalog,
    existingReservations,
    currentTime
  );

  // 5. Nếu thiếu dụng cụ: Chặn xác nhận và báo rõ
  if (!checkResult.isAllAvailable) {
    const shortageNames = checkResult.shortages
      .map(s => `${s.itemName}: Thiếu ${s.shortageQuantity} ${s.itemCode}`)
      .join(', ');
    return {
      success: false,
      shortages: checkResult.shortages,
      errorMessage: `Không thể xác nhận Job do kho không đủ thiết bị: ${shortageNames}`,
    };
  }

  // 6. Tạo Job mới và giữ kho trong cùng phiên
  const jobId = `JOB-${intake.code.replace('TD-', '')}`;
  const now = new Date().toISOString();

  const tasks = generateStandardJobTasks(
    jobId,
    intake.setupDateStart,
    intake.eventDateStart,
    intake.eventDateEnd,
    intake.teardownDateEnd
  );

  const newJob: JobRecord = {
    id: jobId,
    code: jobId,
    intakeId: intake.id,
    customerName: intake.customerName,
    customerPhone: intake.customerPhone,
    serviceType: intake.serviceType,
    eventAddress: intake.eventAddress,
    status: 'chua_thuc_hien',
    eventDateStart: intake.eventDateStart,
    eventDateEnd: intake.eventDateEnd,
    equipmentUsageStart: intake.setupDateStart,
    equipmentUsageEnd: intake.teardownDateEnd,
    tasks,
    tableChairConfigs: JSON.parse(JSON.stringify(intake.tableChairConfigs || [])),
    tentConfigs: JSON.parse(JSON.stringify(intake.tentConfigs || [])),
    itemsSnapshot: demands, // Snapshot bất biến tại thời điểm chốt
    isInventoryReturned: false,
    isFullyPaid: false,
    createdAt: now,
    updatedAt: now,
  };

  const newReservations: InventoryReservation[] = demands.map((d, idx) => ({
    id: `RES-${jobId}-${idx + 1}`,
    jobId,
    itemCode: d.itemCode,
    requestedQuantity: d.quantity,
    periodStart: intake.setupDateStart,
    periodEnd: intake.teardownDateEnd,
    status: 'held',
    createdAt: now,
  }));

  return {
    success: true,
    job: newJob,
    reservations: newReservations,
  };
}
