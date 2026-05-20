import { Text } from '@tarojs/components';
import './Icon.scss';

export type IconName =
  | 'window'
  | 'image'
  | 'map-pin'
  | 'clipboard'
  | 'eye'
  | 'building'
  | 'time'
  | 'phone'
  | 'user'
  | 'chart'
  | 'calendar'
  | 'shield-check'
  | 'settings'
  | 'chat'
  | 'arrow-right'
  | 'check-circle'
  | 'home'
  | 'ruler'
  | 'design'
  | 'quality'
  | 'add'
  | 'close'
  | 'edit'
  | 'delete'
  | 'search'
  | 'star'
  | 'notification'
  | 'logout'
  | 'lock'
  | 'tools'
  | 'palette'
  | 'check'
  | 'arrow-down';

const iconMap: Record<IconName, string> = {
  window: 'ri-window-2-line',
  image: 'ri-image-line',
  'map-pin': 'ri-map-pin-line',
  clipboard: 'ri-clipboard-line',
  eye: 'ri-eye-line',
  building: 'ri-building-line',
  time: 'ri-time-line',
  phone: 'ri-phone-line',
  user: 'ri-user-line',
  chart: 'ri-bar-chart-line',
  calendar: 'ri-calendar-line',
  'shield-check': 'ri-shield-check-line',
  settings: 'ri-settings-line',
  chat: 'ri-question-answer-line',
  'arrow-right': 'ri-arrow-right-s-line',
  'arrow-down': 'ri-arrow-down-s-line',
  'check-circle': 'ri-checkbox-circle-line',
  home: 'ri-home-line',
  ruler: 'ri-ruler-line',
  design: 'ri-pencil-ruler-2-line',
  quality: 'ri-shield-star-line',
  add: 'ri-add-line',
  close: 'ri-close-line',
  edit: 'ri-edit-line',
  delete: 'ri-delete-bin-line',
  search: 'ri-search-line',
  star: 'ri-star-line',
  notification: 'ri-notification-line',
  logout: 'ri-logout-box-line',
  lock: 'ri-lock-line',
  tools: 'ri-tools-line',
  palette: 'ri-palette-line',
  check: 'ri-check-line',
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}

export default function Icon({ name, size = 24, color, className = '' }: IconProps) {
  const riClass = iconMap[name] || 'ri-question-line';
  const style = {
    fontSize: `${size}px`,
    ...(color ? { color } : {}),
  };

  return (
    <Text
      className={`icon-ri ${riClass} ${className}`}
      style={style}
    />
  );
}
