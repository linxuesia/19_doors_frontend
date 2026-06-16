/**
 * 门窗安装统一施工阶段标准
 * 全部门店、所有产品类型共用
 */
export const CONSTRUCTION_STAGES = [
  { key: 'preparation', label: '施工准备与防护' },
  { key: 'site_check', label: '洞口复核与基层处理' },
  { key: 'frame_install', label: '窗框定位与固定' },
  { key: 'sealing', label: '发泡与防水密封' },
  { key: 'glass_install', label: '中空玻璃安装' },
  { key: 'finishing', label: '完工保护与验收' },
  { key: 'warranty', label: '质保服务' },
] as const;

export type ConstructionStageKey = typeof CONSTRUCTION_STAGES[number]['key'];

/** 根据 key 获取标签 */
export function getStageLabel(key: string): string {
  return CONSTRUCTION_STAGES.find(s => s.key === key)?.label || key;
}

/** 获取所有阶段 key 列表 */
export function getStageKeys(): ConstructionStageKey[] {
  return CONSTRUCTION_STAGES.map(s => s.key);
}
