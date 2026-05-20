import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState } from 'react';
import Icon, { IconName } from '../components/Icon';
import './index.scss';

const tabs: { path: string; text: string; icon: IconName }[] = [
  { path: '/pages/index/index', text: '首页', icon: 'home' },
  { path: '/pages/products/index', text: '产品', icon: 'window' },
  { path: '/pages/cases/index', text: '案例', icon: 'image' },
  { path: '/pages/stores/index', text: '门店', icon: 'building' },
  { path: '/pages/profile/index', text: '我的', icon: 'user' },
];

export default function CustomTabBar() {
  const [current, setCurrent] = useState('');

  useDidShow(() => {
    const pages = Taro.getCurrentPages();
    if (pages.length > 0) {
      const route = pages[pages.length - 1].route || '';
      // route format: 'pages/index/index'
      setCurrent(route);
    }
  });

  return (
    <View className='custom-tab-bar'>
      {tabs.map((tab) => {
        const route = tab.path.replace(/^\//, '');
        const isActive = current === route;
        return (
          <View
            key={tab.path}
            className={`tab-item ${isActive ? 'tab-active' : ''}`}
            onClick={() => Taro.switchTab({ url: tab.path })}
          >
            <Icon
              name={tab.icon}
              size={44}
              color={isActive ? '#122b4d' : '#999999'}
            />
            <Text className={`tab-text ${isActive ? 'tab-text-active' : ''}`}>
              {tab.text}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
