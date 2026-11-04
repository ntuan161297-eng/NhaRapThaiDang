import { useSyncExternalStore } from 'react';
import { checkInventoryAvailability, convertEvent, validateEvent, stampEvent, eventTotal, proposedEventSchedule, type EventRecord, type EventAccount, type WeddingInvitation, type WeddingResponse, type WeddingContent, type InventoryItem, type InventoryReservation } from '@thai-dang/shared';
import { accountService } from './accountService';
import { appStore } from './store';
import { supabase, cloudEnabled } from './supabase';

const EVENT_KEY = 'td_unified_events_v2';
const INVITE_KEY = 'td_wedding_invitations_v2';
const RESPONSE_KEY = 'td_wedding_responses_v2';
const read = <T,>(key: string, fallback: T): T => { try { return JSON.parse(localStorage.getItem(key) || 'null') || fallback; } catch { return fallback; } };
const copy = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
export function blankEvent(account: EventAccount | null, at: string): EventRecord {
  return { id: crypto.randomUUID(), code: `TD-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-${crypto.randomUUID().slice(0, 5).toUpperCase()}`,
    customerId: account?.role === 'customer' ? account.id : null, customerName: account?.fullName || '', customerPhone: account?.phone || '', customerEmail: account?.email || '',
    serviceType: 'dam_cuoi', themeId: '', themeName: '', ...proposedEventSchedule(at),
    address: '', note: '', bookingStatus: 'registered', contractStatus: null, contractNumber: null, lines: [], discountVND: 0, payments: [], inventoryReturnedAt: null, convertedAt: null,
    history: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), revision: 0 };
}
function importLegacy(): EventRecord[] {
  const intakes = appStore.getIntakes(); const jobs = appStore.getJobs();
  const sources = [...intakes, ...jobs.filter(job => !intakes.some(intake => intake.id === job.intakeId)).map(job => ({ ...job, id: job.intakeId, setupDateStart: job.equipmentUsageStart, teardownDateEnd: job.equipmentUsageEnd, customerEmail: '', note: '', status: 'da_xac_nhan' }))];
  return sources.map(source => {
    const job = jobs.find(item => item.intakeId === source.id);
    const quote = appStore.getQuotes().filter(item => item.intakeId === source.id || item.jobId === job?.id).sort((a, b) => b.version - a.version)[0];
    const account = appStore.getCustomers().find(customer => customer.phone.replace(/\D/g, '') === source.customerPhone.replace(/\D/g, ''));
    const draft = blankEvent(null, source.eventDateStart);
    return { ...draft, id: source.id, code: source.code.startsWith('JOB-') ? source.code.replace('JOB-', 'TD-') : source.code, customerId: account?.id || null,
      customerName: source.customerName, customerPhone: source.customerPhone, customerEmail: source.customerEmail || '',
      serviceType: ['dam_cuoi', 'dam_hoi', 'nha_moi'].includes(source.serviceType) ? source.serviceType as EventRecord['serviceType'] : 'khac',
      eventStart: source.eventDateStart, eventEnd: source.eventDateEnd, setupAt: source.setupDateStart, recoveryAt: source.teardownDateEnd,
      address: source.eventAddress, note: source.note || '',
      bookingStatus: source.status === 'da_huy' || source.status === 'khong_tiep_tuc' ? 'cancelled' : source.status === 'moi_gui' ? 'registered' : source.status === 'dang_lien_he' ? 'received' : 'contacted',
      contractStatus: job ? job.status === 'da_hoan_thanh' ? 'completed' : job.status === 'dang_thuc_hien' ? 'serving' : 'preparing' : null,
      contractNumber: job?.code.replace('JOB-', 'HD-') || null, convertedAt: job?.createdAt || null, inventoryReturnedAt: job?.isInventoryReturned ? job.updatedAt : null,
      lines: job?.itemsSnapshot.map(item => ({ id: crypto.randomUUID(), itemCode: item.itemCode, name: item.itemName, category: appStore.getCatalog().find(stock => stock.code === item.itemCode)?.category || 'khac', unit: item.unit, quantity: item.quantity, unitPriceVND: 0 })) || [],
      payments: appStore.getPayments().filter(payment => payment.intakeId === source.id || (job && payment.jobId === job.id)).map(payment => ({ id: payment.id, amountVND: payment.amountVND, paidAt: payment.paymentDate || (payment as any).createdAt || source.createdAt, method: payment.paymentMethod === 'tien_mat' ? 'cash' as const : 'transfer' as const, note: payment.notes || '' })),
      createdAt: source.createdAt, updatedAt: source.updatedAt, revision: 1,
      history: [{ at: source.createdAt, actor: 'Hệ thống', message: 'Chuyển dữ liệu lịch và hợp đồng cũ vào bảng thống nhất' }],
      ...(job && quote ? { lines: [...job.itemsSnapshot.map(item => ({ id: crypto.randomUUID(), itemCode: item.itemCode, name: item.itemName, category: 'legacy', unit: item.unit, quantity: item.quantity, unitPriceVND: 0 })), { id: crypto.randomUUID(), itemCode: '', name: `Giá trị hợp đồng cũ ${job.code} (chi tiết dụng cụ giữ trong ghi chú)`, category: 'dich_vu', unit: 'gói', quantity: 1, unitPriceVND: quote.finalAmountVND }], note: `${source.note || ''}\nDụng cụ cũ: ${job.itemsSnapshot.map(item => `${item.itemName}: ${item.quantity} ${item.unit}`).join('; ')}` } : {}),
    } as EventRecord;
  });
}
type Snapshot = { events: EventRecord[]; invitations: WeddingInvitation[]; responses: WeddingResponse[]; catalog: InventoryItem[]; loading: boolean; error: string };
class EventStore {
  private state: Snapshot = { events: [], invitations: [], responses: [], catalog: appStore.getCatalog(), loading: false, error: '' };
  private listeners = new Set<() => void>();
  private activeAccount = '';
  private loadVersion = 0;
  private timer: number;
  constructor() {
    if (!cloudEnabled) {
      this.state.events = read(EVENT_KEY, null) || importLegacy();
      this.state.invitations = read(INVITE_KEY, []); this.state.responses = read(RESPONSE_KEY, []);
      this.persist();
    }
    accountService.subscribe(() => {
      const id = accountService.getSnapshot().account?.id || '';
      if (id !== this.activeAccount) { this.activeAccount = id; if (supabase) { ++this.loadVersion; this.emit({ events: [], invitations: [], responses: [] }); void this.refresh(); } else this.emit({}); }
    });
    if (supabase) void this.refresh();
    this.timer = window.setInterval(() => { if (supabase && accountService.getSnapshot().account && !document.hidden) void this.refresh(false); }, 15000);
    window.addEventListener('storage', event => { if (!supabase && [EVENT_KEY, INVITE_KEY, RESPONSE_KEY].includes(event.key || '')) this.emit({ events: read(EVENT_KEY, []), invitations: read(INVITE_KEY, []), responses: read(RESPONSE_KEY, []) }); });
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private emit(patch: Partial<Snapshot>) { this.state = { ...this.state, ...patch }; this.listeners.forEach(listener => listener()); }
  private persist() {
    if (supabase) return;
    localStorage.setItem(EVENT_KEY, JSON.stringify(this.state.events));
    localStorage.setItem(INVITE_KEY, JSON.stringify(this.state.invitations));
    localStorage.setItem(RESPONSE_KEY, JSON.stringify(this.state.responses));
  }
  async refresh(showLoading = true) {
    if (!supabase || !accountService.getSnapshot().account) return;
    const version = ++this.loadVersion;
    if (showLoading) this.emit({ loading: true });
    try {
      const [events, invitations, responses, catalog] = await Promise.all([supabase.from('event_records').select('payload').order('created_at', { ascending: false }), supabase.from('wedding_invitations').select('payload'), supabase.from('wedding_responses').select('payload'), supabase.from('inventory_items').select('*')]);
      for (const result of [events, invitations, responses, catalog]) if (result.error) throw result.error;
      if (version !== this.loadVersion) return;
      this.emit({ events: events.data!.map(row => row.payload), invitations: invitations.data!.map(row => row.payload), responses: responses.data!.map(row => row.payload),
        catalog: catalog.data!.map(row => ({ id: row.id, code: row.code, name: row.name, category: row.category, unit: row.unit, totalOwnedQuantity: row.total_owned_quantity, inRepairQuantity: row.in_repair_quantity, scrappedQuantity: row.scrapped_quantity, externalRentedQuantity: row.external_rented_quantity, bufferRatio: row.buffer_ratio, cleaningTurnaroundHours: row.cleaning_turnaround_hours, rentalPriceVND: row.rental_price_vnd || 0, imageUrl: row.image_url || '', notes: row.notes || '' })), loading: false, error: '' });
    } catch (error) { if (version === this.loadVersion) this.emit({ loading: false, error: error instanceof Error ? error.message : (error as any).message || 'Không thể tải dữ liệu trực tuyến.' }); }
  }
  myEvents(account = accountService.getSnapshot().account) { return account ? this.state.events.filter(event => account.role === 'admin' || event.customerId === account.id) : []; }
  reservations(excludeId?: string): InventoryReservation[] {
    return this.state.events.filter(event => event.id !== excludeId && event.contractStatus && event.bookingStatus !== 'cancelled' && !event.inventoryReturnedAt).flatMap(event => event.lines.filter(line => line.itemCode).map(line => ({ id: `${event.id}-${line.id}`, jobId: event.id, itemCode: line.itemCode, requestedQuantity: line.quantity, periodStart: event.setupAt, periodEnd: event.recoveryAt, status: event.contractStatus === 'preparing' ? 'held' as const : 'dispatched' as const, createdAt: event.createdAt })));
  }
  async save(candidate: EventRecord, message = 'Cập nhật lịch đặt') {
    candidate = copy(candidate);
    const actor = accountService.getSnapshot().account;
    if (!actor) throw new Error('Vui lòng đăng nhập để quản lý lịch đặt.');
    const previous = this.state.events.find(event => event.id === candidate.id);
    if (previous && previous.revision !== candidate.revision) throw new Error('Bản ghi vừa được thay đổi. Tải lại trước khi lưu.');
    if (actor.role !== 'admin') {
      if (candidate.customerId !== actor.id || (previous && previous.customerId !== actor.id)) throw new Error('Bạn chỉ được quản lý lịch của mình.');
      if (candidate.contractStatus || previous?.contractStatus || previous?.bookingStatus === 'cancelled' || (previous && previous.bookingStatus !== 'registered' && candidate.bookingStatus !== 'cancelled')) throw new Error('Lịch đã được tiếp nhận. Vui lòng liên hệ để thay đổi chi tiết.');
      if (!['registered', 'cancelled'].includes(candidate.bookingStatus)) throw new Error('Trạng thái này do quản trị cập nhật.');
      if (JSON.stringify(candidate.lines) !== JSON.stringify(previous?.lines || []) || JSON.stringify(candidate.payments) !== JSON.stringify(previous?.payments || [])) throw new Error('Khách hàng không được sửa chi tiết hợp đồng.');
    }
    if (!supabase && actor.role === 'admin' && (!candidate.customerId || !/^[0-9a-f-]{36}$/i.test(candidate.customerId))) {
      const owner = read<EventAccount[]>('td_event_accounts', []).find(account => account.email.toLowerCase() === candidate.customerEmail.toLowerCase());
      if (owner) candidate.customerId = owner.id;
    }
    const validation = validateEvent(candidate);
    if (validation) throw new Error(validation);
    if (candidate.contractStatus && !candidate.inventoryReturnedAt) {
      const demands = candidate.lines.filter(line => line.itemCode).map(line => ({ itemCode: line.itemCode, itemName: line.name, quantity: line.quantity, unit: line.unit }));
      const check = checkInventoryAvailability(demands, candidate.setupAt, candidate.recoveryAt, new Map(this.state.catalog.map(item => [item.code, item])), this.reservations(candidate.id));
      if (!check.isAllAvailable) throw new Error(`Không đủ kho: ${check.shortages.map(item => `${item.itemName} thiếu ${item.shortageQuantity}`).join(', ')}`);
    }
    let next = stampEvent(copy(candidate), actor.fullName, message);
    if (supabase) {
      const { data, error } = await supabase.rpc('save_event_record', { p_record: next, p_expected_revision: previous?.revision || 0 });
      if (error) throw new Error(error.message);
      next = data;
    }
    if (accountService.getSnapshot().account?.id !== actor.id) throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng tải lại.');
    ++this.loadVersion;
    this.emit({ events: [next, ...this.state.events.filter(event => event.id !== next.id)], error: '' }); this.persist(); return next;
  }
  async convert(candidate: EventRecord) {
    if (accountService.getSnapshot().account?.role !== 'admin') throw new Error('Chỉ quản trị được lập hợp đồng.');
    const converted = convertEvent(candidate, accountService.getSnapshot().account!.fullName);
    if (candidate.contractStatus) return candidate;
    return this.save({ ...converted, revision: candidate.revision, history: candidate.history }, 'Chuyển lịch đặt sang hợp đồng');
  }
  async saveCatalog(item: InventoryItem) {
    if (accountService.getSnapshot().account?.role !== 'admin') throw new Error('Bạn không có quyền sửa kho.');
    if (!item.code.trim() || !item.name.trim() || [item.totalOwnedQuantity, item.inRepairQuantity, item.rentalPriceVND || 0].some(value => !Number.isFinite(value) || value < 0) || item.inRepairQuantity > item.totalOwnedQuantity) throw new Error('Kiểm tra tên, mã, số lượng và đơn giá dụng cụ.');
    if (this.state.catalog.some(other => other.code === item.code && other.id !== item.id)) throw new Error('Mã dụng cụ đã tồn tại.');
    if (supabase) {
      const { error } = await supabase.from('inventory_items').upsert({ id: item.id, code: item.code, name: item.name, category: item.category, unit: item.unit, total_owned_quantity: item.totalOwnedQuantity, in_repair_quantity: item.inRepairQuantity, scrapped_quantity: item.scrappedQuantity, external_rented_quantity: item.externalRentedQuantity, buffer_ratio: item.bufferRatio, cleaning_turnaround_hours: item.cleaningTurnaroundHours, rental_price_vnd: item.rentalPriceVND || 0, image_url: item.imageUrl || '', notes: item.notes || '' });
      if (error) throw error;
    }
    this.emit({ catalog: [...this.state.catalog.filter(other => other.id !== item.id), item] });
    if (!supabase) localStorage.setItem('td_catalog', JSON.stringify(this.state.catalog));
  }
  async saveInvitation(candidate: WeddingInvitation) {
    const actor = accountService.getSnapshot().account;
    const existing = this.state.invitations.find(item => item.id === candidate.id);
    const event = this.state.events.find(item => item.id === candidate.eventId);
    if (!existing && this.state.invitations.some(item => item.eventId === candidate.eventId)) throw new Error('Lịch này đã có thiệp. Mở thiệp đã tạo để chỉnh sửa.');
    if (!actor || (actor.role !== 'admin' && !candidate.ownerIds.includes(actor.id))) throw new Error('Bạn không có quyền quản lý thiệp này.');
    if (actor.role !== 'admin' && (existing ? !existing.ownerIds.includes(actor.id) : !event || event.customerId !== actor.id)) throw new Error('Thiệp phải liên kết với lịch của bạn.');
    if (existing && existing.revision !== candidate.revision) throw new Error('Thiệp vừa thay đổi. Đóng và mở lại để tải phiên bản mới.');
    if (candidate.content.ceremonies.length < 1 || candidate.content.ceremonies.length > 8 || candidate.content.photos.length > 12) throw new Error('Thiệp có từ 1–8 buổi lễ và tối đa 12 ảnh album.');
    if ((candidate.content.milestones?.length || 0) > 8) throw new Error('Thiệp có tối đa 8 dấu mốc tình yêu.');
    if ([candidate.content.musicUrl, candidate.content.videoUrl].some(url => url && !/^https?:\/\//i.test(url))) throw new Error('Nhạc và video cần liên kết HTTP hoặc HTTPS.');
    if (candidate.content.rsvpDeadline && !/^\d{4}-\d{2}-\d{2}$/.test(candidate.content.rsvpDeadline)) throw new Error('Hạn xác nhận tham dự chưa hợp lệ.');
    if (candidate.published && (!candidate.content.bride.name.trim() || !candidate.content.groom.name.trim() || !candidate.content.ceremonies[0]?.at || !candidate.content.ceremonies[0]?.address)) throw new Error('Trước khi công bố, bổ sung tên cô dâu/chú rể, ngày và địa chỉ buổi lễ.');
    let next = { ...copy(candidate), updatedAt: new Date().toISOString(), revision: candidate.revision + 1 };
    if (supabase) {
      const { data, error } = await supabase.rpc('save_wedding_invitation', { p_invitation: next, p_expected_revision: candidate.revision }); if (error) throw error; next = data;
    }
    if (accountService.getSnapshot().account?.id !== actor.id) throw new Error('Phiên đăng nhập đã thay đổi. Vui lòng tải lại.');
    ++this.loadVersion;
    this.emit({ invitations: [...this.state.invitations.filter(invitation => invitation.id !== next.id), next] }); this.persist(); return next;
  }
  async addManager(invitation: WeddingInvitation, email: string) {
    if (supabase) {
      const { error } = await supabase.rpc('add_wedding_manager', { p_invitation_id: invitation.id, p_email: email.trim() }); if (error) throw error; await this.refresh();
      const updated = this.state.invitations.find(item => item.id === invitation.id);
      if (!updated) throw new Error('Không tải được thiệp mới nhất. Đóng và mở lại để tiếp tục.');
      return updated;
    }
    const account = read<EventAccount[]>('td_event_accounts', []).find(user => user.email.toLowerCase() === email.trim().toLowerCase());
    if (!account) throw new Error('Người được cấp quyền cần đăng ký tài khoản trước.');
    return this.saveInvitation({ ...invitation, ownerIds: [...new Set([...invitation.ownerIds, account.id])] });
  }
  async getPublicInvitation(slug: string): Promise<{ invitation: WeddingInvitation; wishes: Pick<WeddingResponse, 'id' | 'guestName' | 'message' | 'updatedAt'>[] } | null> {
    if (supabase) { const { data, error } = await supabase.rpc('get_public_wedding_invitation', { p_slug: slug }); if (error) throw error; return data; }
    const invitation = this.state.invitations.find(item => item.slug === slug && item.published);
    return invitation ? { invitation: { ...invitation, ownerIds: [] }, wishes: this.state.responses.filter(response => response.invitationId === invitation.id && response.isPublic && response.approved).map(({ id, guestName, message, updatedAt }) => ({ id, guestName, message, updatedAt })) } : null;
  }
  async respond(slug: string, response: Omit<WeddingResponse, 'id' | 'invitationId' | 'approved' | 'updatedAt'>) {
    if (!response.guestName.trim() || response.guestName.length > 120 || response.message.length > 2000 || !Number.isInteger(response.partySize) || response.partySize < (response.attendance === 'yes' ? 1 : 0) || response.partySize > 20) throw new Error('Nhập tên khách, số người từ 1–20 nếu tham dự và lời chúc tối đa 2.000 ký tự.');
    const tokenKey = `td_guest_token_${slug}`;
    const token = localStorage.getItem(tokenKey) || crypto.randomUUID(); localStorage.setItem(tokenKey, token);
    if (supabase) { const { error } = await supabase.rpc('submit_wedding_response', { p_slug: slug, p_guest_token: token, p_response: response }); if (error) throw error; return; }
    const invitation = this.state.invitations.find(item => item.slug === slug && item.published);
    if (!invitation) throw new Error('Thiệp chưa được công bố.');
    if (invitation.content.rsvpDeadline && Date.now() > Date.parse(`${invitation.content.rsvpDeadline}T23:59:59+07:00`)) throw new Error('Đã hết hạn xác nhận. Vui lòng liên hệ hai gia đình.');
    const id = `${invitation.id}-${token}`;
    const next = { ...response, id, invitationId: invitation.id, approved: false, updatedAt: new Date().toISOString() };
    this.emit({ responses: [...this.state.responses.filter(item => item.id !== id), next] }); this.persist();
  }
  async approveResponse(response: WeddingResponse, approved: boolean) {
    const actor = accountService.getSnapshot().account;
    const invitation = this.state.invitations.find(item => item.id === response.invitationId);
    if (!actor || (!invitation?.ownerIds.includes(actor.id) && actor.role !== 'admin')) throw new Error('Bạn không có quyền quản lý phản hồi này.');
    let next = { ...response, approved };
    if (supabase) { const { data, error } = await supabase.rpc('moderate_wedding_response', { p_response_id: response.id, p_approved: approved }); if (error) throw error; next = data; }
    this.emit({ responses: this.state.responses.map(item => item.id === next.id ? next : item) }); this.persist();
  }
  async upload(file: File) {
    const actor = accountService.getSnapshot().account;
    if (!actor) throw new Error('Vui lòng đăng nhập trước khi tải ảnh.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('Chọn ảnh JPG, PNG hoặc WebP tối đa 5 MB.');
    if (!supabase) {
      if (file.size > 500000) throw new Error('Bản cục bộ nhận ảnh dưới 500 KB. Kết nối Supabase để tải ảnh lớn hơn.');
      return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
    }
    const path = `${actor.id}/${crypto.randomUUID()}.${file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'}`;
    const { error } = await supabase.storage.from('wedding-photos').upload(path, file, { contentType: file.type }); if (error) throw error;
    return supabase.storage.from('wedding-photos').getPublicUrl(path).data.publicUrl;
  }
}
export const eventStore = new EventStore();
export const useEventData = () => useSyncExternalStore(eventStore.subscribe, eventStore.getSnapshot);
export const useAccount = () => useSyncExternalStore(accountService.subscribe, accountService.getSnapshot);
export function blankInvitation(event: EventRecord, ownerId: string): WeddingInvitation {
  const person = () => ({ name: '', father: '', mother: '', familyAddress: '', phone: '', familyRole: '' });
  const bank = () => ({ bankName: '', accountName: '', accountNumber: '', qrImage: '' });
  const content: WeddingContent = { bride: person(), groom: person(), brideBank: bank(), groomBank: bank(), style: 'quan_ho', guestSalutation: 'Quý khách', guestName: '', milestones: [], title: 'Trân trọng kính mời', invitationText: 'Sự hiện diện của bạn là niềm hạnh phúc của hai gia đình.', coverImage: '', photos: [], ceremonies: [{ title: 'Lễ thành hôn', at: event.eventStart, venue: '', address: event.address, mapUrl: '' }], story: '', dressCode: '', contactPhone: event.customerPhone };
  return { id: crypto.randomUUID(), eventId: event.id, slug: `cuoi-${crypto.randomUUID().slice(0, 12)}`, ownerIds: [...new Set([ownerId, ...(event.customerId ? [event.customerId] : [])])], published: false, content, updatedAt: new Date().toISOString(), revision: 0 };
}
