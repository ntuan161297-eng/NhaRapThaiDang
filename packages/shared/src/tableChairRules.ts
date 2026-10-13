// packages/shared/src/tableChairRules.ts
import type { TableChairConfigItem, ConvertedItemDemand } from './types.ts';

export const ITEM_CODES = {
  BAN_TRON: 'BAN_TRON',
  BAN_DAI: 'BAN_DAI',
  GHE_INOX: 'GHE_INOX',
  GHE_NHUA_DO: 'GHE_NHUA_DO',
  KHUNG_RAP_KHOANG: 'KHUNG_RAP_KHOANG',
  BAT_MAI_KHOANG: 'BAT_MAI_KHOANG',
  VACH_RAP_SET: 'VACH_RAP_SET',
  DEN_CHUM_LED: 'DEN_CHUM_LED',
  LOA_DAI_SU_KIEN: 'LOA_DAI_SU_KIEN',
  BINH_GAS_CONG_NGHIEP: 'BINH_GAS_CONG_NGHIEP',
} as const;

/**
 * Quy đổi cấu hình bàn ghế thành danh sách nhu cầu dụng cụ chi tiết.
 * Quy tắc:
 * - Số ghế = số bàn × số ghế/bàn + số ghế lẻ dự phòng.
 * - Số bàn = số bàn + số bàn dự phòng.
 * - Gom cùng mã dụng cụ (ví dụ 2 khu vực cùng dùng bàn tròn thì cộng dồn số bàn tròn).
 * - Ghế inox và ghế nhựa đỏ quản lý độc lập theo đúng mã, không tự thay thế.
 */
export function convertTableChairConfigs(configs: TableChairConfigItem[]): ConvertedItemDemand[] {
  const demandMap = new Map<string, { itemName: string; quantity: number; unit: string }>();

  for (const cfg of configs) {
    // 1. Tính toán số bàn
    const totalTables = cfg.tableCount + (cfg.backupTables || 0);
    const tableCode = cfg.tableType === 'ban_tron' ? ITEM_CODES.BAN_TRON : ITEM_CODES.BAN_DAI;
    const tableName = cfg.tableType === 'ban_tron' ? 'Bàn tròn sự kiện (1.2m)' : 'Bàn dài chữ nhật';

    const currentTable = demandMap.get(tableCode) || { itemName: tableName, quantity: 0, unit: 'cái' };
    currentTable.quantity += totalTables;
    demandMap.set(tableCode, currentTable);

    // 2. Tính toán số ghế
    const totalChairs = (cfg.tableCount * cfg.chairsPerTable) + (cfg.extraChairs || 0);
    const chairCode = cfg.chairType === 'ghe_inox' ? ITEM_CODES.GHE_INOX : ITEM_CODES.GHE_NHUA_DO;
    const chairName = cfg.chairType === 'ghe_inox' ? 'Ghế đôn inox tròn' : 'Ghế nhựa đỏ tựa lưng';

    const currentChair = demandMap.get(chairCode) || { itemName: chairName, quantity: 0, unit: 'cái' };
    currentChair.quantity += totalChairs;
    demandMap.set(chairCode, currentChair);
  }

  const result: ConvertedItemDemand[] = [];
  for (const [code, val] of demandMap.entries()) {
    result.push({
      itemCode: code,
      itemName: val.itemName,
      quantity: val.quantity,
      unit: val.unit,
    });
  }

  return result;
}
