import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convertEvent, eventPaymentState, eventPaid, eventTotal, monthlyEventMetrics, proposedEventSchedule, validateEvent, type EventRecord } from '../src/eventWorkflow.ts';

const makeEvent = (): EventRecord => ({
  id: 'one-row', code: 'TD-20261110-1', customerId: 'customer-1', customerName: 'Khách thử', customerPhone: '0912345678', customerEmail: 'customer@example.test',
  serviceType: 'dam_cuoi', themeId: '', themeName: '', eventStart: '2026-11-10T10:00:00+07:00', eventEnd: '2026-11-10T14:00:00+07:00', setupAt: '2026-11-09T14:00:00+07:00', recoveryAt: '2026-11-11T08:00:00+07:00',
  address: 'Ninh Bình', note: '', bookingStatus: 'contacted', contractStatus: null, contractNumber: null,
  lines: [{ id: 'line-1', itemCode: 'BAN', name: 'Bàn', category: 'ban', unit: 'cái', quantity: 10, unitPriceVND: 100000 }], discountVND: 100000,
  payments: [], inventoryReturnedAt: null, convertedAt: null, history: [], createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z', revision: 1,
});
test('Ngày đám chính: lắp trước 2 ngày, thu hồi lúc 17 giờ cùng ngày, qua tháng/năm vẫn đúng', () => {
  for (const [at, expected] of [['2026-11-28T07:30:00+07:00','2026-11-26T08:00:00+07:00'],['2027-01-01T10:30:00+07:00','2026-12-30T08:00:00+07:00']]) {
    const schedule = proposedEventSchedule(at);
    assert.equal(schedule.setupAt, new Date(expected).toISOString());
    assert.equal(schedule.recoveryAt, new Date(at.slice(0,10)+'T17:00:00+07:00').toISOString());
    assert.equal(validateEvent({...makeEvent(),...schedule}),null);
  }
  const evening = proposedEventSchedule('2026-11-28T19:00:00+07:00');
  assert.ok(Date.parse(evening.recoveryAt)>=Date.parse(evening.eventEnd));
  assert.throws(()=>proposedEventSchedule('invalid'));
});
test('Đặt lịch chuyển thành hợp đồng giữ nguyên một ID và không tạo bản ghi lặp', () => {
  const booking = makeEvent(); const contract = convertEvent(booking, 'Quản trị', '2026-11-02T00:00:00Z');
  assert.equal(contract.id, booking.id); assert.equal(contract.code, booking.code); assert.equal(contract.contractNumber, 'HD-20261110-1'); assert.equal(contract.contractStatus, 'preparing');
  assert.equal(contract.revision, 2); assert.equal(booking.revision, 1); assert.equal(booking.contractStatus, null);
  assert.strictEqual(convertEvent(contract, 'Quản trị'), contract);
});
test('Hợp đồng phải có địa điểm, hạng mục hợp lệ và không được lập từ lịch hủy', () => {
  for (const patch of [{ bookingStatus: 'cancelled' }, { address: '' }, { lines: [] }, { lines: [{ ...makeEvent().lines[0], quantity: -1 }] }, { discountVND: 2000000 }]) {
    assert.throws(() => convertEvent({ ...makeEvent(), ...patch } as EventRecord, 'Quản trị'));
  }
});
test('Hoàn thành công việc độc lập với thanh toán và trả kho', () => {
  const contract = { ...convertEvent(makeEvent(), 'Quản trị'), contractStatus: 'completed' as const };
  assert.equal(eventPaymentState(contract), 'unpaid'); assert.equal(contract.inventoryReturnedAt, null);
  contract.payments = [{ id: 'receipt', amountVND: eventTotal(contract), paidAt: '2026-12-01T00:00:00Z', method: 'transfer', note: '' }];
  assert.equal(eventPaid(contract), 900000); assert.equal(eventPaymentState(contract), 'paid'); assert.equal(contract.inventoryReturnedAt, null);
});
test('Kiểm tra lắp đặt trước tiệc, thu hồi sau tiệc và từ chối khoản thu vượt giá trị', () => {
  assert.match(validateEvent({ ...makeEvent(), setupAt: '2026-11-12T00:00:00Z' })!, /Thời gian/);
  assert.match(validateEvent({ ...makeEvent(), recoveryAt: '2026-11-01T00:00:00Z' })!, /Thời gian/);
  const event = convertEvent(makeEvent(), 'Quản trị');
  assert.match(validateEvent({ ...event, payments: [{ id: 'excess', amountVND: 9999999, paidAt: '2026-11-10T00:00:00Z', method: 'cash', note: '' }] })!, /vượt/);
});
test('Doanh thu theo ngày thu tiền ở Việt Nam; lịch theo ngày tổ chức, không cộng lịch hủy', () => {
  const event = convertEvent(makeEvent(), 'Quản trị');
  event.payments = [{ id: 'receipt', amountVND: 100000, paidAt: '2026-11-30T18:30:00Z', method: 'cash', note: '' }];
  const metrics = monthlyEventMetrics([event, { ...makeEvent(), id: 'cancelled', bookingStatus: 'cancelled' }], 2026);
  assert.equal(metrics[10].bookings, 1); assert.equal(metrics[10].contracts, 1); assert.equal(metrics[10].revenue, 0); assert.equal(metrics[11].revenue, 100000);
});
