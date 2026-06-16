export const orderStatusMap: Record<string, { label: string; bg: string }> = {
  PENDING: { label: '待分配', bg: '#fff7ed' },
  INSTALLING: { label: '施工中', bg: '#eff6ff' },
  COMPLETED: { label: '已完工', bg: '#f0fdf4' },
  WARRENTY: { label: '质保中', bg: '#ecfdf5' },
};

export const measurementStatusMap: Record<string, { label: string; bg: string }> = {
  PENDING: { label: '待处理', bg: '#fff7ed' },
  ASSIGNED: { label: '已分配', bg: '#eff6ff' },
  MEASURED: { label: '已量尺', bg: '#f0fdf4' },
  CANCELED: { label: '已取消', bg: '#f3f4f6' },
};

export const orderFilters = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待分配' },
  { value: 'INSTALLING', label: '施工中' },
  { value: 'COMPLETED', label: '已完工' },
];

export const productionStatusMap: Record<string, { label: string; color: string }> = {
  ORDERED: { label: '已下单', color: '#6b7280' },
  PRODUCING: { label: '生产中', color: '#2563eb' },
  SHIPPING: { label: '运输中', color: '#f59e0b' },
  DELIVERED: { label: '已完成', color: '#059669' },
};

export const productionStatusOrder = ['ORDERED', 'PRODUCING', 'SHIPPING', 'DELIVERED'];
