// packages/shared/src/contracts.ts
/**
 * HỢP ĐỒNG API VÀ GIAO THỨC DỮ LIỆU DÙNG CHUNG (API CONTRACTS)
 * Dùng thống nhất giữa Website và Ứng dụng Di động Android Nhà Rạp Thái Đăng
 */

import { ServiceType, TableChairConfigItem, TentConfigItem } from './types.ts';

// 1. API ĐỌC CẤU HÌNH LIÊN HỆ CÔNG KHAI
export interface PublicContactConfigResponse {
  brandName: string;
  slogan: string;
  hotline: string;
  officialHotlineStatus: string;
  isHotlineConfirmed: boolean;
  zaloPhone: string;
  address: string;
  email: string;
  workingHours: string;
  facebookFanpageUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
}

// 2. API TẠO BOOKING CÔNG KHAI (WEBSITE / ANDROID APP)
export interface CreatePublicBookingRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceType: ServiceType;
  eventDateStart: string; // ISO 8601
  eventDateEnd: string;   // ISO 8601
  eventAddress: string;
  tableChairConfigs?: TableChairConfigItem[];
  tentConfigs?: TentConfigItem[];
  note?: string;
}

export interface CreatePublicBookingResponse {
  success: boolean;
  intakeId?: string;
  code?: string;
  message: string;
}

// 3. API TRA CỨU TRẠNG THÁI BOOKING CÓ KIỂM SOÁT QUYỀN (THEO MÃ + SĐT)
export interface CheckBookingStatusRequest {
  bookingCode: string;
  customerPhone: string;
}

export interface CheckBookingStatusResponse {
  found: boolean;
  code?: string;
  customerName?: string;
  serviceType?: string;
  status?: string;
  eventDate?: string;
  address?: string;
  createdAt?: string;
  message?: string;
}

// 4. API KIỂM TRA KHẢ NĂNG ĐÁP ỨNG THIẾT BỊ KHO (INVENTORY AVAILABILITY)
export interface DemandItemCheck {
  itemCode: string;
  quantity: number;
}

export interface CheckInventoryAvailabilityRequest {
  items: DemandItemCheck[];
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
}

export interface ShortageDetail {
  itemCode: string;
  itemName: string;
  needed: number;
  available: number;
  missing: number;
}

export interface CheckInventoryAvailabilityResponse {
  isAvailable: boolean;
  shortageItems: ShortageDetail[];
  message: string;
}

// 5. API XÁC NHẬN BOOKING THÀNH JOB & GIỮ KHO (TRANSACTION RPC)
export interface ConfirmBookingToJobRequest {
  bookingId: string;
  itemsDemand: DemandItemCheck[];
  actorUserId: string;
}

export interface ConfirmBookingToJobResponse {
  success: boolean;
  alreadyConfirmed?: boolean;
  isShortage?: boolean;
  jobId?: string;
  jobCode?: string;
  shortageItems?: ShortageDetail[];
  message: string;
}

// 6. API GHI NHẬN XUẤT KHO / THU HỒI DỤNG CỤ
export interface DispatchInventoryRequest {
  jobId: string;
  actorUserId: string;
}

export interface DispatchInventoryResponse {
  success: boolean;
  message: string;
}

// 7. API UPLOAD & TRUY CẬP FILE THEO PHÂN QUYỀN
export type StorageBucketType = 'event-public-photos' | 'contracts-and-receipts' | 'identity-documents';

export interface FileUploadMetadata {
  bucket: StorageBucketType;
  filePath: string;
  fileSize: number;
  mimeType: string;
  isPublic: boolean;
  uploadedBy: string;
}
