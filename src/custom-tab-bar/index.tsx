import { View, Text } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { useState, useCallback } from 'react';
import Icon, { IconName } from '../components/Icon';
import './index.scss';

const tabs: { path: string; text: string; icon: IconName }[] = [
  { path: '/pages/index/index', text: '首页', icon: 'home' },
  { path: '/pages/products/index', text: '产品', icon: 'window' },
  { path: '/pages/cases/index', text: '案例·服务', icon: 'image' },
  { path: '/pages/about/index', text: '公司简介', icon: 'file-text' },
  { path: '/pages/profile/index', text: '我的', icon: 'user' },
];

function getCurrentRoute(): string {
  const pages = Taro.getCurrentPages();
  if (pages.length > 0) {
    return '/' + pages[pages.length - 1].route;
  }
  return '';
}

function matchTab(route: string, tabPath: string): boolean {
  // 只精确匹配，或匹配到 tab 页本身（不含子页面）
  return route === tabPath;
}

export default function CustomTabBar() {
  const [current, setCurrent] = useState(() => getCurrentRoute());

  // 页面显示时同步路由（处理 switchTab 跳转）
  useDidShow(() => {
    setCurrent(getCurrentRoute());
  });

  const handleClick = useCallback((path: string) => {
    // 避免重复跳转当前页
    if (getCurrentRoute() === path) return;
    Taro.switchTab({ url: path });
  }, []);

  return (
    <View className='custom-tab-bar'>
      {tabs.map((tab) => {
        const isActive = matchTab(current, tab.path);
        return (
          <View
            key={tab.path}
            className={`tab-item ${isActive ? 'tab-active' : ''}`}
            onClick={() => handleClick(tab.path)}
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
