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
  | 'arrow-down'
  | 'qr-code'
  | 'file-text'
  | 'camera'
  | 'wind'
  | 'thermometer'
  | 'award'
  | 'play-circle';

// Unicode code points from Remix Icon v4.6.0 (subset)
const iconUnicode: Record<IconName, string> = {
  'add': '\uea13',
  'arrow-down': '\uea4e',
  'arrow-right': '\uea6e',
  'chart': '\uea9e',
  'building': '\ueb0f',
  'calendar': '\ueb27',
  'camera': '\uef0f',
  'check': '\ueb7b',
  'check-circle': '\ueb81',
  'clipboard': '\ueb91',
  'close': '\ueb99',
  'delete': '\uec2a',
  'edit': '\uec86',
  'eye': '\uecb5',
  'file-text': '\ued0f',
  'home': '\uee2b',
  'image': '\uee4b',
  'lock': '\ueece',
  'logout': '\ueed8',
  'map-pin': '\uef14',
  'notification': '\uef9a',
  'palette': '\uefc5',
  'design': '\uefe2',
  'phone': '\uefec',
  'qr-code': '\uf03d',
  'chat': '\uf043',
  'ruler': '\uf0a3',
  'search': '\uf0d1',
  'settings': '\uf0ee',
  'shield-check': '\uf100',
  'quality': '\uf10a',
  'star': '\uf18b',
  'time': '\uf20f',
  'tools': '\uf21b',
  'user': '\uf264',
  'window': '\uf2c4',
  'wind': '\uf3c9',
  'thermometer': '\uf0b5',
  'award': '\uf1cd',
  'play-circle': '\uf0ae',
};

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function Icon({ name, size = 24, color, className = '', style: extraStyle, onClick }: IconProps) {
  const char = iconUnicode[name] || '';
  const style = {
    fontSize: `${size}rpx`,
    ...(color ? { color } : {}),
    ...(extraStyle || {}),
  };

  return (
    <Text
      className={`icon-ri ${className}`}
      style={style}
      onClick={onClick}
    >
      {char}
    </Text>
  );
}
