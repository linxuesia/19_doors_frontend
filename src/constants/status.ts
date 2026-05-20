export const orderStatusMap: Record<string, { label: string; bg: string }> = {
  PENDING: { label: '待分配', bg: '#fff7ed' },
  INSTALLING: { label: '施工中', bg: '#eff6ff' },
  REVIEWING: { label: '待确认', bg: '#f3e8ff' },
  COMPLETED: { label: '已完工', bg: '#f0fdf4' },
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
  { value: 'REVIEWING', label: '待确认' },
  { value: 'COMPLETED', label: '已完工' },
];
