// packages/shared/src/tentCateringRules.ts
import type { TentConfigItem, CateringConfigItem, ConvertedItemDemand } from './types.ts';
import { ITEM_CODES } from './tableChairRules.ts';

export const CATERING_ITEM_CODES = {
  BAT_AN_COM: 'BAT_AN_COM',
  DIA_SU_TRON: 'DIA_SU_TRON',
  TO_CANH_LON: 'TO_CANH_LON',
  BO_DUA_THIA: 'BO_DUA_THIA',
  LY_COI_UONG_BIA: 'LY_COI_UONG_BIA',
  NOI_LALU_GAS: 'NOI_LALU_GAS',
} as const;

/**
 * Quy đổi rạp thành các thành phần kết cấu theo số khoang.
 * Ví dụ: Mỗi khoang rạp tiêu chuẩn (thường 3m - 6m) cần:
 * - 1 bộ khung rạp khẩu độ tương ứng
 * - 1 tấm mái bạt chống thấm
 * - 2 tấm vách rèm quây hai bên
 * - 1 đèn chùm / dải đèn LED trang trí
 */
export function convertTentConfigs(tents: TentConfigItem[]): ConvertedItemDemand[] {
  const result: ConvertedItemDemand[] = [];
  let totalBays = 0;

  for (const tent of tents) {
    totalBays += tent.bayCount || 1;
  }

  if (totalBays > 0) {
    result.push({
      itemCode: ITEM_CODES.KHUNG_RAP_KHOANG,
      itemName: 'Khung rạp khẩu độ nhôm/sắt (theo khoang)',
      quantity: totalBays,
      unit: 'khoang',
    });
    result.push({
      itemCode: ITEM_CODES.BAT_MAI_KHOANG,
      itemName: 'Bạt mái che rạp cách nhiệt',
      quantity: totalBays,
      unit: 'tấm',
    });
    result.push({
      itemCode: ITEM_CODES.VACH_RAP_SET,
      itemName: 'Vách rèm lụa quây rạp',
      quantity: totalBays * 2,
      unit: 'tấm',
    });
    result.push({
      itemCode: ITEM_CODES.DEN_CHUM_LED,
      itemName: 'Đèn chùm trang trí trần rạp',
      quantity: totalBays,
      unit: 'bộ',
    });
  }

  return result;
}

/**
 * Quy đổi mâm cỗ thành định mức bát đĩa thìa cốc (cho đơn vị tự cung cấp).
 */
export function convertCateringConfigs(caterings: CateringConfigItem[]): ConvertedItemDemand[] {
  const result: ConvertedItemDemand[] = [];
  let totalTraysThaiDang = 0;

  for (const cat of caterings) {
    if (cat.provider === 'thai_dang') {
      totalTraysThaiDang += cat.trayCount;
    }
  }

  if (totalTraysThaiDang > 0) {
    // Mỗi mâm 6 người: 6 bát ăn cơm, 5 đĩa sứ thức ăn, 2 tô canh lớn, 6 bộ đũa thìa, 6 cốc
    result.push({
      itemCode: CATERING_ITEM_CODES.BAT_AN_COM,
      itemName: 'Bát sứ trắng ăn cơm',
      quantity: totalTraysThaiDang * 6,
      unit: 'cái',
    });
    result.push({
      itemCode: CATERING_ITEM_CODES.DIA_SU_TRON,
      itemName: 'Đĩa sứ trắng bày cỗ',
      quantity: totalTraysThaiDang * 5,
      unit: 'cái',
    });
    result.push({
      itemCode: CATERING_ITEM_CODES.TO_CANH_LON,
      itemName: 'Tô sứ đựng canh lớn',
      quantity: totalTraysThaiDang * 2,
      unit: 'cái',
    });
    result.push({
      itemCode: CATERING_ITEM_CODES.BO_DUA_THIA,
      itemName: 'Bộ đũa và thìa ăn cỗ',
      quantity: totalTraysThaiDang * 6,
      unit: 'bộ',
    });
    result.push({
      itemCode: CATERING_ITEM_CODES.LY_COI_UONG_BIA,
      itemName: 'Cốc thủy tinh uống bia/nước ngọt',
      quantity: totalTraysThaiDang * 6,
      unit: 'cái',
    });
  }

  return result;
}
