// packages/shared/test/business-rules.test.ts
import test from 'node:test';
import assert from 'node:assert/strict';

import type {
  TableChairConfigItem,
  InventoryItem,
  InventoryReservation,
  IntakeRecord,
  JobRecord,
} from '../src/types.ts';
import { convertTableChairConfigs, ITEM_CODES } from '../src/tableChairRules.ts';
import {
  checkInventoryAvailability,
  dispatchReservedItems,
  handleJobCancellationReservations,
} from '../src/inventoryEngine.ts';
import { confirmIntakeToJob } from '../src/workflowEngine.ts';
import { RBAC } from '../src/rbac.ts';

// Helper tạo danh mục kho mẫu
function createMockCatalog(): Map<string, InventoryItem> {
  const catalog = new Map<string, InventoryItem>();

  catalog.set(ITEM_CODES.BAN_TRON, {
    id: 'ITEM-BAN-TRON',
    code: ITEM_CODES.BAN_TRON,
    name: 'Bàn tròn sự kiện (1.2m)',
    category: 'ban',
    unit: 'cái',
    totalOwnedQuantity: 50,
    inRepairQuantity: 5, // 5 cái đang sửa -> Khả dụng: 45
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.1,
    cleaningTurnaroundHours: 3,
  });

  catalog.set(ITEM_CODES.GHE_INOX, {
    id: 'ITEM-GHE-INOX',
    code: ITEM_CODES.GHE_INOX,
    name: 'Ghế đôn inox tròn',
    category: 'ghe',
    unit: 'cái',
    totalOwnedQuantity: 200,
    inRepairQuantity: 0,
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.1,
    cleaningTurnaroundHours: 2,
  });

  catalog.set(ITEM_CODES.GHE_NHUA_DO, {
    id: 'ITEM-GHE-NHUA-DO',
    code: ITEM_CODES.GHE_NHUA_DO,
    name: 'Ghế nhựa đỏ tựa lưng',
    category: 'ghe',
    unit: 'cái',
    totalOwnedQuantity: 100,
    inRepairQuantity: 10, // 10 cái đang sửa -> Khả dụng: 90
    scrappedQuantity: 0,
    externalRentedQuantity: 0,
    bufferRatio: 0.1,
    cleaningTurnaroundHours: 2,
  });

  return catalog;
}

test('QUY TẮC 1: Quy đổi 20 bàn x 6 ghế inox + 10 bàn x 6 ghế nhựa đỏ đúng 30 bàn, 120 ghế inox, 60 ghế nhựa đỏ', () => {
  const configs: TableChairConfigItem[] = [
    {
      area: 'Rạp chính',
      tableType: 'ban_tron',
      chairType: 'ghe_inox',
      tableCount: 20,
      chairsPerTable: 6,
    },
    {
      area: 'Rạp cỗ',
      tableType: 'ban_tron',
      chairType: 'ghe_nhua_do',
      tableCount: 10,
      chairsPerTable: 6,
    },
  ];

  const demands = convertTableChairConfigs(configs);

  const banTron = demands.find(d => d.itemCode === ITEM_CODES.BAN_TRON);
  const gheInox = demands.find(d => d.itemCode === ITEM_CODES.GHE_INOX);
  const gheNhua = demands.find(d => d.itemCode === ITEM_CODES.GHE_NHUA_DO);

  assert.ok(banTron, 'Phải có nhu cầu bàn tròn');
  assert.equal(banTron.quantity, 30, 'Tổng số bàn tròn phải là 20 + 10 = 30 cái');

  assert.ok(gheInox, 'Phải có nhu cầu ghế inox');
  assert.equal(gheInox.quantity, 120, 'Tổng số ghế inox phải là 20 x 6 = 120 cái');

  assert.ok(gheNhua, 'Phải có nhu cầu ghế nhựa đỏ');
  assert.equal(gheNhua.quantity, 60, 'Tổng số ghế nhựa đỏ phải là 10 x 6 = 60 cái');
});

test('QUY TẮC 2: Cộng dồn nhu cầu khi trùng thời gian và không cộng sai khi không trùng', () => {
  const catalog = createMockCatalog();

  // Job 1 giữ 30 bàn tròn từ 2026-10-20T08:00 đến 2026-10-21T18:00
  const existingReservations: InventoryReservation[] = [
    {
      id: 'RES-JOB-1',
      jobId: 'JOB-001',
      itemCode: ITEM_CODES.BAN_TRON,
      requestedQuantity: 30,
      periodStart: '2026-10-20T08:00:00Z',
      periodEnd: '2026-10-21T18:00:00Z',
      status: 'held',
      createdAt: '2026-10-15T00:00:00Z',
    },
  ];

  // Trường hợp A: Job 2 cần 20 bàn tròn TRÙNG thời gian (2026-10-21T07:00 đến 2026-10-22T12:00)
  // Tổng khả dụng: 50 - 5 (đang sửa) = 45 bàn.
  // Job 1 đã giữ 30 -> Còn lại: 45 - 30 = 15 bàn.
  // Job 2 cần 20 bàn -> Thiếu 5 bàn!
  const checkOverlap = checkInventoryAvailability(
    [{ itemCode: ITEM_CODES.BAN_TRON, itemName: 'Bàn tròn', quantity: 20, unit: 'cái' }],
    '2026-10-21T07:00:00Z',
    '2026-10-22T12:00:00Z',
    catalog,
    existingReservations
  );

  assert.equal(checkOverlap.isAllAvailable, false, 'Khi trùng thời gian và vượt sức chứa phải báo thiếu');
  assert.equal(checkOverlap.shortages.length, 1);
  assert.equal(checkOverlap.shortages[0].shortageQuantity, 5, 'Phải tính đúng thiếu 5 cái bàn tròn');

  // Trường hợp B: Job 3 cần 20 bàn tròn KHÔNG trùng thời gian (2026-10-25T08:00 đến 2026-10-26T18:00)
  // Job 1 đã kết thúc và tính cả turnaround -> Đầy đủ 45 bàn khả dụng cho Job 3.
  const checkNoOverlap = checkInventoryAvailability(
    [{ itemCode: ITEM_CODES.BAN_TRON, itemName: 'Bàn tròn', quantity: 20, unit: 'cái' }],
    '2026-10-25T08:00:00Z',
    '2026-10-26T18:00:00Z',
    catalog,
    existingReservations
  );

  assert.equal(checkNoOverlap.isAllAvailable, true, 'Khi không trùng thời gian thì không được trừ của nhau');
  assert.equal(checkNoOverlap.results[0].alreadyReservedOtherJobs, 0, 'Số lượng giữ của Job khác phải bằng 0');
});

test('QUY TẮC 3: Xác nhận lặp không tạo Job hoặc giữ kho trùng (Idempotent)', () => {
  const catalog = createMockCatalog();
  const existingReservations: InventoryReservation[] = [];
  const existingJobs = new Map<string, JobRecord>();

  const intake: IntakeRecord = {
    id: 'INTAKE-001',
    code: 'TD-202610-001',
    source: 'website',
    customerName: 'Nguyễn Văn Nam',
    customerPhone: '0988111222',
    serviceType: 'dam_cuoi',
    eventDateStart: '2026-10-25T11:00:00Z',
    eventDateEnd: '2026-10-25T14:00:00Z',
    setupDateStart: '2026-10-24T14:00:00Z',
    teardownDateEnd: '2026-10-25T18:00:00Z',
    eventAddress: 'Số 12 Đường Hùng Vương, TP. Bắc Giang',
    status: 'da_khao_sat',
    tableChairConfigs: [
      { area: 'Rạp chính', tableType: 'ban_tron', chairType: 'ghe_inox', tableCount: 10, chairsPerTable: 6 }
    ],
    createdAt: '2026-10-15T00:00:00Z',
    updatedAt: '2026-10-15T00:00:00Z',
  };

  // Xác nhận lần 1: Thành công
  const res1 = confirmIntakeToJob(intake, 'quan_ly', catalog, existingReservations, existingJobs);
  assert.equal(res1.success, true, 'Lần 1 phải thành công');
  assert.ok(res1.job, 'Phải tạo Job');
  assert.equal(res1.reservations?.length, 2, 'Phải giữ 10 bàn và 60 ghế');

  // Lưu Job và Reservations vào store mô phỏng
  const createdJob = res1.job!;
  existingJobs.set(createdJob.id, createdJob);
  existingReservations.push(...(res1.reservations || []));

  // Cập nhật trạng thái intake
  intake.status = 'da_xac_nhan';
  intake.confirmedJobId = createdJob.id;

  // Xác nhận lần 2 (nhấn đúp hoặc gọi lặp lại)
  const res2 = confirmIntakeToJob(intake, 'quan_ly', catalog, existingReservations, existingJobs);
  assert.equal(res2.success, true, 'Lần 2 vẫn trả về thành công an toàn');
  assert.equal(res2.isDuplicateCall, true, 'Phải nhận diện là cuộc gọi trùng (Idempotent)');
  assert.equal(res2.job?.id, createdJob.id, 'Phải trả về chính xác Job ban đầu');
  // Tổng reservations trong hệ thống vẫn chỉ là 2, không bị x2
  assert.equal(existingReservations.length, 2, 'Không được tạo thêm bản ghi giữ kho nào');
});

test('QUY TẮC 4: Thiếu dụng cụ thì chặn xác nhận Job và báo rõ danh mục thiếu', () => {
  const catalog = createMockCatalog();
  const existingReservations: InventoryReservation[] = [];
  const existingJobs = new Map<string, JobRecord>();

  // Yêu cầu 80 bàn tròn trong khi chỉ có 45 cái khả dụng
  const bigIntake: IntakeRecord = {
    id: 'INTAKE-002',
    code: 'TD-202610-002',
    source: 'website',
    customerName: 'Trần Đại Gia',
    customerPhone: '0977333444',
    serviceType: 'dam_cuoi',
    eventDateStart: '2026-10-25T11:00:00Z',
    eventDateEnd: '2026-10-25T14:00:00Z',
    setupDateStart: '2026-10-24T14:00:00Z',
    teardownDateEnd: '2026-10-25T18:00:00Z',
    eventAddress: 'Khu Đô Thị Mới',
    status: 'da_khao_sat',
    tableChairConfigs: [
      { area: 'Rạp chính', tableType: 'ban_tron', chairType: 'ghe_inox', tableCount: 80, chairsPerTable: 6 }
    ],
    createdAt: '2026-10-15T00:00:00Z',
    updatedAt: '2026-10-15T00:00:00Z',
  };

  const result = confirmIntakeToJob(bigIntake, 'quan_ly', catalog, existingReservations, existingJobs);
  assert.equal(result.success, false, 'Không được phép xác nhận khi kho bị thiếu');
  assert.ok(result.shortages && result.shortages.length > 0, 'Phải có danh sách thiếu hụt');
  const banShortage = result.shortages.find(s => s.itemCode === ITEM_CODES.BAN_TRON);
  assert.ok(banShortage, 'Phải liệt kê thiếu bàn tròn');
  assert.equal(banShortage.shortageQuantity, 35, 'Khả dụng 45, cần 80 -> Thiếu đúng 35 cái');
});

test('QUY TẮC 5: Xuất sau khi giữ không bị trừ hai lần (Chuyển trạng thái held -> dispatched)', () => {
  const reservations: InventoryReservation[] = [
    {
      id: 'RES-01',
      jobId: 'JOB-100',
      itemCode: ITEM_CODES.GHE_INOX,
      requestedQuantity: 60,
      periodStart: '2026-10-20T08:00:00Z',
      periodEnd: '2026-10-20T18:00:00Z',
      status: 'held',
      createdAt: '2026-10-15T00:00:00Z',
    },
  ];

  // Tiến hành xuất kho
  const afterDispatch = dispatchReservedItems(reservations, 'JOB-100');
  assert.equal(afterDispatch.length, 1, 'Số lượng bản ghi giữ kho không tăng');
  assert.equal(afterDispatch[0].status, 'dispatched', 'Trạng thái chuyển thành dispatched');
  assert.equal(afterDispatch[0].requestedQuantity, 60, 'Số lượng giữ nguyên, không tạo thêm bản trừ');
});

test('QUY TẮC 6: Hủy Job đã xuất không tự đưa dụng cụ trở lại kho', () => {
  const reservations: InventoryReservation[] = [
    {
      id: 'RES-02',
      jobId: 'JOB-200',
      itemCode: ITEM_CODES.BAN_TRON,
      requestedQuantity: 15,
      periodStart: '2026-10-20T08:00:00Z',
      periodEnd: '2026-10-20T18:00:00Z',
      status: 'dispatched', // Đã xuất ra ngoài công trường
      createdAt: '2026-10-15T00:00:00Z',
    },
  ];

  // Hủy Job
  const cancelResult = handleJobCancellationReservations(reservations, 'JOB-200');
  assert.equal(cancelResult.hasUnreturnedDispatchedItems, true, 'Phải cảnh báo có thiết bị đã xuất chưa thu hồi');
  const res = cancelResult.updatedReservations.find(r => r.jobId === 'JOB-200');
  assert.ok(res);
  assert.equal(res.status, 'dispatched', 'Thiết bị đã xuất giữ nguyên trạng thái dispatched cho đến khi thủ kho kiểm đếm nhập kho');
});

test('QUY TẮC 7: Phân quyền RBAC bảo vệ dữ liệu', () => {
  // Chỉ Chủ đơn vị và Quản lý được xác nhận Job
  assert.equal(RBAC.canConfirmIntakeToJob('chu_don_vi'), true);
  assert.equal(RBAC.canConfirmIntakeToJob('quan_ly'), true);
  assert.equal(RBAC.canConfirmIntakeToJob('tu_van'), false);
  assert.equal(RBAC.canConfirmIntakeToJob('nhan_vien_thuc_hien'), false);
  assert.equal(RBAC.canConfirmIntakeToJob('ke_toan'), false);

  // Chỉ Chủ đơn vị và Kế toán được ghi nhận thu tiền / tiền cọc
  assert.equal(RBAC.canRecordPayment('chu_don_vi'), true);
  assert.equal(RBAC.canRecordPayment('ke_toan'), true);
  assert.equal(RBAC.canRecordPayment('tu_van'), false);
  assert.equal(RBAC.canRecordPayment('kho'), false);

  // Chỉ Chủ đơn vị, Quản lý và Kho được xuất trả thiết bị
  assert.equal(RBAC.canDispatchInventory('kho'), true);
  assert.equal(RBAC.canDispatchInventory('quan_ly'), true);
  assert.equal(RBAC.canDispatchInventory('tu_van'), false);
});
