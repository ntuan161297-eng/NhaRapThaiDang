export const EVENT_SERVICES = { dam_cuoi: 'Đám cưới', dam_hoi: 'Đám hỏi', nha_moi: 'Nhà mới', khac: 'Khác' } as const;
export const BOOKING_STATES = { registered: 'Mới đăng ký', received: 'Tiếp nhận', cancelled: 'Hủy', contacted: 'Đã liên hệ' } as const;
export const CONTRACT_STATES = { preparing: 'Chuẩn bị', transporting: 'Vận chuyển', installing: 'Lắp đặt', serving: 'Phục vụ', dismantling: 'Tháo dỡ', completed: 'Hoàn thành' } as const;
export type EventService = keyof typeof EVENT_SERVICES;
export type BookingState = keyof typeof BOOKING_STATES;
export type ContractState = keyof typeof CONTRACT_STATES;
export interface EquipmentLine { id: string; itemCode: string; name: string; category: string; unit: string; quantity: number; unitPriceVND: number }
export interface EventPayment { id: string; amountVND: number; paidAt: string; method: 'cash' | 'transfer'; note: string }
export interface EventHistory { at: string; actor: string; message: string }
export interface EventRecord {
  id: string; code: string; customerId: string | null;
  customerName: string; customerPhone: string; customerEmail: string;
  serviceType: EventService; themeId: string; themeName: string;
  eventStart: string; eventEnd: string; setupAt: string; recoveryAt: string;
  address: string; note: string; bookingStatus: BookingState;
  contractStatus: ContractState | null; contractNumber: string | null;
  lines: EquipmentLine[]; discountVND: number; payments: EventPayment[];
  inventoryReturnedAt: string | null; convertedAt: string | null;
  history: EventHistory[]; createdAt: string; updatedAt: string; revision: number;
}
export interface PersonInvitation { name: string; father: string; mother: string; familyAddress: string; phone: string; familyRole: string; portraitUrl?: string }
export interface WeddingBank { bankName: string; accountName: string; accountNumber: string; qrImage: string }
export interface WeddingCeremony { title: string; at: string; venue: string; address: string; mapUrl: string; host?: 'groom' | 'bride' | 'both'; kind?: 'le_cuoi' | 'tiec_moi' | 'an_hoi' | 'khac'; note?: string }
export type WeddingStyle = 'quan_ho' | 'cong_nghe' | 'hoang_gia' | 'thanh_lich' | 'sang_trong';
export interface WeddingStoryMilestone { date: string; title: string; description: string }
export interface WeddingContent {
  bride: PersonInvitation; groom: PersonInvitation; title: string; invitationText: string;
  coverImage: string; photos: string[]; ceremonies: WeddingCeremony[];
  brideBank: WeddingBank; groomBank: WeddingBank; story: string; dressCode: string; contactPhone: string;
  style?: WeddingStyle; guestSalutation?: string; guestName?: string; closingMessage?: string;
  musicUrl?: string; videoUrl?: string; rsvpDeadline?: string; transportNote?: string; milestones?: WeddingStoryMilestone[];
}
export interface WeddingInvitation { id: string; eventId: string; slug: string; ownerIds: string[]; published: boolean; content: WeddingContent; updatedAt: string; revision: number }
export interface WeddingResponse { id: string; invitationId: string; guestName: string; phone: string; attendance: 'yes' | 'no' | 'maybe'; partySize: number; message: string; isPublic: boolean; approved: boolean; updatedAt: string; relationship?: string; note?: string }
export interface EventAccount { id: string; fullName: string; email: string; phone: string; role: 'customer' | 'admin' }

/** Main event day is in Vietnam: install two days earlier, recover that afternoon. */
export function proposedEventSchedule(at: string) {
  const start = new Date(at);
  if (!Number.isFinite(start.getTime())) throw new Error('Ngày tổ chức không hợp lệ.');
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(start);
  const setup = new Date(`${day}T08:00:00+07:00`); setup.setUTCDate(setup.getUTCDate() - 2);
  const afternoon = new Date(`${day}T17:00:00+07:00`);
  const desiredEnd = new Date(start.getTime() + 4 * 3600000);
  // Late/evening events cannot be recovered before the event ends.
  const end = start < afternoon ? new Date(Math.min(desiredEnd.getTime(), afternoon.getTime())) : desiredEnd;
  return { eventStart: start.toISOString(), eventEnd: end.toISOString(), setupAt: setup.toISOString(), recoveryAt: new Date(Math.max(afternoon.getTime(), end.getTime())).toISOString() };
}

export function eventSubtotal(event: Pick<EventRecord, 'lines'>) { return event.lines.reduce((sum, line) => sum + line.quantity * line.unitPriceVND, 0); }
export function eventTotal(event: Pick<EventRecord, 'lines' | 'discountVND'>) { return Math.max(0, eventSubtotal(event) - event.discountVND); }
export function eventPaid(event: Pick<EventRecord, 'payments'>) { return event.payments.reduce((sum, payment) => sum + payment.amountVND, 0); }
export function eventPaymentState(event: EventRecord): 'paid' | 'unpaid' { return eventTotal(event) > 0 && eventPaid(event) >= eventTotal(event) ? 'paid' : 'unpaid'; }
export function validateEvent(event: EventRecord, contract = !!event.contractStatus): string | null {
  if (!event.customerName.trim() || !/^\d{10,11}$/.test(event.customerPhone.replace(/\D/g, ''))) return 'Vui lòng nhập tên và số điện thoại hợp lệ.';
  if (!(event.serviceType in EVENT_SERVICES)) return 'Loại hình không hợp lệ.';
  if (!(event.bookingStatus in BOOKING_STATES) || (event.contractStatus && !(event.contractStatus in CONTRACT_STATES))) return 'Trạng thái không hợp lệ.';
  if (event.inventoryReturnedAt && (event.contractStatus !== 'completed' || !Number.isFinite(Date.parse(event.inventoryReturnedAt)))) return 'Chỉ xác nhận trả kho khi hợp đồng đã hoàn thành.';
  const dates = [event.setupAt, event.eventStart, event.eventEnd, event.recoveryAt].map(value => new Date(value).getTime());
  if (dates.some(value => !Number.isFinite(value)) || dates[0] > dates[1] || dates[1] >= dates[2] || dates[2] > dates[3]) return 'Thời gian cần theo thứ tự: lắp đặt → bắt đầu → kết thúc → thu hồi.';
  if (!contract) return null;
  if (event.bookingStatus === 'cancelled') return 'Lịch đã hủy không thể chuyển sang hợp đồng.';
  if (!event.address.trim()) return 'Cần bổ sung địa điểm cụ thể trước khi lập hợp đồng.';
  if (!event.lines.length) return 'Hợp đồng cần ít nhất một hạng mục.';
  if (event.lines.some(line => !line.name.trim() || !Number.isInteger(line.quantity) || line.quantity < 1 || !Number.isFinite(line.unitPriceVND) || line.unitPriceVND < 0)) return 'Kiểm tra tên, số lượng và đơn giá của các hạng mục.';
  if (!Number.isFinite(event.discountVND) || event.discountVND < 0 || event.discountVND > eventSubtotal(event) || eventTotal(event) <= 0) return 'Tổng giá trị hợp đồng phải lớn hơn 0; giảm giá không vượt quá tổng tiền.';
  if (event.payments.some(payment => !Number.isFinite(payment.amountVND) || payment.amountVND <= 0 || !['cash', 'transfer'].includes(payment.method) || !Number.isFinite(Date.parse(payment.paidAt)))) return 'Kiểm tra số tiền, ngày thu và phương thức thanh toán.';
  if (eventPaid(event) > eventTotal(event)) return 'Tiền đã thu không được vượt giá trị hợp đồng.';
  return null;
}
export function stampEvent(event: EventRecord, actor: string, message: string, now = new Date().toISOString()): EventRecord {
  return { ...event, revision: event.revision + 1, updatedAt: now, history: [...event.history, { at: now, actor, message }] };
}
export function convertEvent(event: EventRecord, actor: string, now = new Date().toISOString()): EventRecord {
  if (event.contractStatus) return event;
  const error = validateEvent(event, true);
  if (error) throw new Error(error);
  return stampEvent({ ...event, bookingStatus: 'contacted', contractStatus: 'preparing', contractNumber: `HD-${event.code.replace(/^TD-/, '')}`, convertedAt: now }, actor, 'Chuyển lịch đặt thành hợp đồng', now);
}
export function monthlyEventMetrics(events: EventRecord[], year: number) {
  return Array.from({ length: 12 }, (_, month) => {
    const inMonth = (value: string) => { const date = new Date(value); return Number(new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(date)) === year && Number(new Intl.DateTimeFormat('en', { month: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' }).format(date)) === month + 1; };
    const bookings = events.filter(event => event.bookingStatus !== 'cancelled' && inMonth(event.eventStart));
    return { month: month + 1, bookings: bookings.length, contracts: bookings.filter(event => event.contractStatus).length,
      revenue: events.reduce((sum, event) => sum + event.payments.filter(payment => inMonth(payment.paidAt)).reduce((total, payment) => total + payment.amountVND, 0), 0) };
  });
}
