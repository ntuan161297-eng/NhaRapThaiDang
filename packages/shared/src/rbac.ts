// packages/shared/src/rbac.ts
import type { UserRole } from './types.ts';

export const ROLE_LABELS: Record<UserRole, string> = {
  chu_don_vi: 'Chủ đơn vị (Toàn quyền)',
  quan_ly: 'Quản lý điều hành',
  tu_van: 'Nhân viên tư vấn & Sale',
  kho: 'Thủ kho & Kỹ thuật',
  ke_toan: 'Kế toán & Thu ngân',
  nhan_vien_thuc_hien: 'Nhân viên hiện trường',
};

export const RBAC = {
  // Tiếp nhận & Hồ sơ
  canCreateIntake(role: UserRole): boolean {
    return ['chu_don_vi', 'quan_ly', 'tu_van'].includes(role);
  },
  canEditIntake(role: UserRole): boolean {
    return ['chu_don_vi', 'quan_ly', 'tu_van'].includes(role);
  },
  canConfirmIntakeToJob(role: UserRole): boolean {
    return ['chu_don_vi', 'quan_ly'].includes(role);
  },
  canCancelIntake(role: UserRole): boolean {
    return ['chu_don_vi', 'quan_ly'].includes(role);
  },

  // Kho & Dụng cụ
  canViewInventory(role: UserRole): boolean {
    return true; // Tất cả nhân viên có thể xem tình trạng kho
  },
  canAdjustStockCatalog(role: UserRole): boolean {
    return ['chu_don_vi', 'kho'].includes(role);
  },
  canDispatchInventory(role: UserRole): boolean {
    return ['chu_don_vi', 'quan_ly', 'kho'].includes(role);
  },
  canReturnInventory(role: UserRole): boolean {
    return ['chu_don_vi', 'quan_ly', 'kho'].includes(role);
  },

  // Job & Phân công đầu việc
  canAssignTasks(role: UserRole): boolean {
    return ['chu_don_vi', 'quan_ly'].includes(role);
  },
  canUpdateAnyTask(role: UserRole): boolean {
    return ['chu_don_vi', 'quan_ly'].includes(role);
  },
  canUpdateOwnTask(role: UserRole): boolean {
    return ['chu_don_vi', 'quan_ly', 'nhan_vien_thuc_hien', 'kho'].includes(role);
  },

  // Tài chính & Báo giá
  canCreateQuote(role: UserRole): boolean {
    return ['chu_don_vi', 'quan_ly', 'tu_van', 'ke_toan'].includes(role);
  },
  canViewFinancials(role: UserRole): boolean {
    return ['chu_don_vi', 'quan_ly', 'ke_toan'].includes(role);
  },
  canRecordPayment(role: UserRole): boolean {
    return ['chu_don_vi', 'ke_toan'].includes(role);
  },
};
