// packages/shared/src/inventoryEngine.ts
import type { 
  InventoryItem, 
  InventoryReservation, 
  InventoryCheckResult, 
  ConvertedItemDemand 
} from './types.ts';

/**
 * Kiểm tra xem 2 khoảng thời gian [startA, endA] và [startB, endB] có giao nhau không.
 */
export function isTimeOverlap(startA: string | Date, endA: string | Date, startB: string | Date, endB: string | Date): boolean {
  const tA_start = new Date(startA).getTime();
  const tA_end = new Date(endA).getTime();
  const tB_start = new Date(startB).getTime();
  const tB_end = new Date(endB).getTime();

  return tA_start < tB_end && tB_start < tA_end;
}

/**
 * Tính thời gian kết thúc chiếm dụng thực tế có tính thời gian bảo dưỡng/vệ sinh luân chuyển (turnaround).
 */
export function calculateEffectiveEndTime(baseEndTime: string, turnaroundHours: number): string {
  const date = new Date(baseEndTime);
  date.setHours(date.getHours() + (turnaroundHours || 0));
  return date.toISOString();
}

/**
 * Tính toán khả năng đáp ứng của kho cho danh sách nhu cầu thiết bị trong một khoảng thời gian.
 * @param demands Danh sách nhu cầu (mã dụng cụ và số lượng)
 * @param periodStart Thời điểm bắt đầu chiếm dụng (setupDateStart)
 * @param periodEnd Thời điểm kết thúc chiếm dụng (teardownDateEnd)
 * @param catalog Danh mục thiết bị trong kho
 * @param existingReservations Danh sách các lượt giữ/xuất kho hiện có của tất cả các Job
 * @param currentTime Thời điểm hiện tại (dùng để kiểm tra quá hạn chưa thu hồi)
 */
export function checkInventoryAvailability(
  demands: ConvertedItemDemand[],
  periodStart: string,
  periodEnd: string,
  catalog: Map<string, InventoryItem>,
  existingReservations: InventoryReservation[],
  currentTime: string = new Date().toISOString()
): {
  isAllAvailable: boolean;
  results: InventoryCheckResult[];
  shortages: InventoryCheckResult[];
} {
  const results: InventoryCheckResult[] = [];
  const shortages: InventoryCheckResult[] = [];
  const nowMs = new Date(currentTime).getTime();

  for (const demand of demands) {
    const item = catalog.get(demand.itemCode);
    const itemName = item?.name || demand.itemName;
    const totalOwned = item?.totalOwnedQuantity || 0;
    const inRepair = item?.inRepairQuantity || 0;
    const scrapped = item?.scrappedQuantity || 0;
    const externalRented = item?.externalRentedQuantity || 0;
    const bufferRatio = item?.bufferRatio ?? 0.1; // Mặc định 10%
    const turnaroundHours = item?.cleaningTurnaroundHours || 0;

    // Sức chứa vật lý khả dụng = Sở hữu + Thuê ngoài đã chốt - Đang sửa - Đã thanh lý
    const netPhysicalCapacity = Math.max(0, totalOwned + externalRented - inRepair - scrapped);

    // Tìm các giữ chỗ/xuất kho của các Job khác trùng khoảng thời gian này
    const candidateStartMs = new Date(periodStart).getTime();
    const candidateEndEffective = calculateEffectiveEndTime(periodEnd, turnaroundHours);
    const candidateEndMs = new Date(candidateEndEffective).getTime();

    const conflictingJobSet = new Set<string>();
    let alreadyReservedOtherJobs = 0;

    for (const res of existingReservations) {
      if (res.itemCode !== demand.itemCode) continue;
      // Chỉ tính các giữ chỗ đang hoạt động: held (đã giữ) hoặc dispatched (đã xuất)
      if (res.status !== 'held' && res.status !== 'dispatched') continue;

      let resStartMs = new Date(res.periodStart).getTime();
      let resEndMs = new Date(res.periodEnd).getTime();

      // QUY TẮC QUAN TRỌNG:
      // "Dụng cụ chưa trả quá hạn vẫn không được coi là sẵn sàng chỉ vì ngày dự kiến thu hồi đã qua."
      if (res.status === 'dispatched' && nowMs > resEndMs) {
        // Kéo dài thời gian chiếm dụng đến ít nhất là hiện tại
        resEndMs = nowMs;
      }

      // Kiểm tra trùng lặp thời gian
      if (candidateStartMs < resEndMs && resStartMs < candidateEndMs) {
        alreadyReservedOtherJobs += res.requestedQuantity;
        conflictingJobSet.add(res.jobId);
      }
    }

    const requestedThisJob = demand.quantity;
    const remainingAfterThisJob = netPhysicalCapacity - alreadyReservedOtherJobs - requestedThisJob;
    const isShortage = remainingAfterThisJob < 0;
    const shortageQuantity = isShortage ? Math.abs(remainingAfterThisJob) : 0;

    let status: 'du' | 'sat_nguong' | 'thieu' = 'du';
    if (isShortage) {
      status = 'thieu';
    } else if (remainingAfterThisJob <= netPhysicalCapacity * bufferRatio) {
      status = 'sat_nguong';
    }

    const checkResult: InventoryCheckResult = {
      isAvailable: !isShortage,
      status,
      itemCode: demand.itemCode,
      itemName,
      totalOwned,
      inRepair,
      netPhysicalCapacity,
      alreadyReservedOtherJobs,
      requestedThisJob,
      remainingAfterThisJob,
      shortageQuantity,
      conflictingJobCodes: Array.from(conflictingJobSet),
    };

    results.push(checkResult);
    if (isShortage) {
      shortages.push(checkResult);
    }
  }

  return {
    isAllAvailable: shortages.length === 0,
    results,
    shortages,
  };
}

/**
 * Xử lý trạng thái khi xuất kho dụng cụ đã giữ:
 * Tránh trừ hai lần khi dụng cụ đã giữ rồi được xuất:
 * Chuyển reservation từ 'held' sang 'dispatched', không tạo reservation mới.
 */
export function dispatchReservedItems(
  reservations: InventoryReservation[],
  jobId: string
): InventoryReservation[] {
  return reservations.map(res => {
    if (res.jobId === jobId && res.status === 'held') {
      return { ...res, status: 'dispatched' };
    }
    return res;
  });
}

/**
 * Xử lý khi HỦY Job:
 * Quy tắc: "Hủy Job đã xuất không tự đưa dụng cụ trở lại kho."
 * Nếu status là 'held' -> an toàn hủy bỏ (cancelled), giải phóng giữ chỗ.
 * Nếu status là 'dispatched' -> KHÔNG tự chuyển thành 'returned'; giữ nguyên trạng thái cần thu hồi!
 */
export function handleJobCancellationReservations(
  reservations: InventoryReservation[],
  jobId: string
): { updatedReservations: InventoryReservation[]; hasUnreturnedDispatchedItems: boolean } {
  let hasUnreturnedDispatchedItems = false;

  const updatedReservations = reservations.map(res => {
    if (res.jobId === jobId) {
      if (res.status === 'held') {
        return { ...res, status: 'cancelled' as const };
      } else if (res.status === 'dispatched') {
        hasUnreturnedDispatchedItems = true;
        // Giữ nguyên trạng thái dispatched, vì đồ đã đi ra ngoài công trình chưa thu hồi vật lý!
        return res;
      }
    }
    return res;
  });

  return { updatedReservations, hasUnreturnedDispatchedItems };
}
