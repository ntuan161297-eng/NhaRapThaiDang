// packages/shared/src/tentCateringRules.ts
import type { TentConfigItem, CateringConfigItem, ConvertedItemDemand, TentBomComponent } from './types.ts';
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
 * Định mức linh kiện BOM tiêu chuẩn để dựng 1 Khung/Khoang rạp (khẩu độ 6m x 3m).
 * Khung rạp tính theo số lượng khung ghép thành từ các dụng cụ gốc:
 * - 4 Cột rạp
 * - 2 Kèo rạp nóc
 * - 4 Thanh giằng xà gồ
 * - 1 Tấm bạt mái che
 * - 2 Tấm vách rèm lụa
 */
export const DEFAULT_TENT_FRAME_BOM: TentBomComponent[] = [
  {
    itemCode: ITEM_CODES.COT_RAP,
    itemName: 'Cột rạp sắt mạ kẽm chịu lực 3m',
    quantityPerBay: 4,
    unit: 'cây',
  },
  {
    itemCode: ITEM_CODES.KEO_RAP,
    itemName: 'Kèo nóc rạp khẩu độ 6m',
    quantityPerBay: 2,
    unit: 'thanh',
  },
  {
    itemCode: ITEM_CODES.XA_GO_GIANG,
    itemName: 'Xà gồ / Thanh giằng ngang liên kết 3m',
    quantityPerBay: 4,
    unit: 'thanh',
  },
  {
    itemCode: ITEM_CODES.BAT_MAI_KHOANG,
    itemName: 'Bạt mái che 2 da Hàn Quốc cách nhiệt',
    quantityPerBay: 1,
    unit: 'tấm',
  },
  {
    itemCode: ITEM_CODES.VACH_RAP_SET,
    itemName: 'Vách rèm lụa quây rạp màu trắng sữa',
    quantityPerBay: 2,
    unit: 'tấm',
  },
];

/**
 * Quy đổi N khung rạp thành danh sách chi tiết các dụng cụ gốc cấu thành theo BOM.
 */
export function calculateTentBomDemand(
  bayCount: number,
  customBom: TentBomComponent[] = DEFAULT_TENT_FRAME_BOM
): ConvertedItemDemand[] {
  const count = Math.max(0, bayCount);
  return customBom.map(component => ({
    itemCode: component.itemCode,
    itemName: component.itemName,
    quantity: component.quantityPerBay * count,
    unit: component.unit,
  }));
}

/**
 * Tính số lượng Khung rạp ghép tối đa có thể dựng được dựa trên tồn kho thực tế,
 * và chỉ ra chi tiết dụng cụ nào đang là "nút thắt cổ chai" (bottleneck).
 */
export function calculateMaxAssembleableBays(
  inventory: Array<{ code: string; available: number; name?: string }>,
  bom: TentBomComponent[] = DEFAULT_TENT_FRAME_BOM
): {
  maxBays: number;
  bottleneckItem: string;
  details: Array<{
    itemCode: string;
    itemName: string;
    available: number;
    neededPerBay: number;
    maxSupportedBays: number;
    unit: string;
  }>;
} {
  let minBays = Infinity;
  let bottleneck = '';
  const details: Array<{
    itemCode: string;
    itemName: string;
    available: number;
    neededPerBay: number;
    maxSupportedBays: number;
    unit: string;
  }> = [];

  for (const comp of bom) {
    const inv = inventory.find(i => i.code === comp.itemCode);
    const avail = inv ? Math.max(0, inv.available) : 0;
    const supported = comp.quantityPerBay > 0 ? Math.floor(avail / comp.quantityPerBay) : 0;

    details.push({
      itemCode: comp.itemCode,
      itemName: comp.itemName,
      available: avail,
      neededPerBay: comp.quantityPerBay,
      maxSupportedBays: supported,
      unit: comp.unit,
    });

    if (supported < minBays) {
      minBays = supported;
      bottleneck = comp.itemName;
    }
  }

  return {
    maxBays: minBays === Infinity ? 0 : minBays,
    bottleneckItem: bottleneck || 'Không xác định',
    details,
  };
}

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
