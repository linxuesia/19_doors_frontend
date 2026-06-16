import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth, roleLabels } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

const menuList = [
  {
    icon: 'edit',
    iconClass: 'ip-menu-icon-edit',
    label: '个人资料编辑',
    desc: '修改头像、昵称等信息',
    action: 'editProfile' as const,
  },
  {
    icon: 'time',
    iconClass: 'ip-menu-icon-history',
    label: '施工记录历史',
    desc: '查看历史工单和施工记录',
    action: 'history' as const,
  },
  {
    icon: 'chart',
    iconClass: 'ip-menu-icon-income',
    label: '收入统计',
    desc: '查看收入明细和统计',
    action: 'income' as const,
  },
  {
    icon: 'phone',
    iconClass: 'ip-menu-icon-contact',
    label: '联系门店',
    desc: '联系所属门店客服',
    action: 'contact' as const,
  },
  {
    icon: 'logout',
    iconClass: 'ip-menu-icon-logout',
    label: '退出登录',
    desc: '安全退出当前账号',
    action: 'logout' as const,
  },
];

export default function InstallerProfile() {
  const { user, requireBusinessLogin, logout } = useAuth();
  const [stats, setStats] = useState({ completed: 0, installing: 0, rating: 0 });

  useEffect(() => {
    if (!requireBusinessLogin()) return;

    if (user?.id) {
      Promise.all([
        api.get('/orders/stats', { installerId: user.id }).catch(() => ({})),
        api.get('/measurements', { installerId: user.id, pageSize: '200' }).catch(() => ({ list: [] })),
      ]).then(([ordersRes, measuresRes]) => {
        const orders = ordersRes || {};
        const measures: any[] = measuresRes?.list || (Array.isArray(measuresRes) ? measuresRes : []);
        setStats({
          completed: (orders.completed || 0) + measures.filter((m: any) => m.status === 'MEASURED').length,
          installing: (orders.installing || 0) + measures.filter((m: any) => m.status === 'ASSIGNED').length,
          rating: 0,
        });
      }).catch(() => {});
    }
  }, [user]);

  if (!user || !requireBusinessLogin()) {
    return <View className='cl-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>加载中...</Text></View>;
  }

  const handleMenuClick = (action: string) => {
    switch (action) {
      case 'editProfile':
        Taro.showToast({ title: '功能开发中', icon: 'none' });
        break;
      case 'history':
        Taro.navigateTo({ url: '/subpackages/business/orders/index' });
        break;
      case 'income':
        Taro.showToast({ title: '功能开发中', icon: 'none' });
        break;
      case 'contact':
        Taro.showToast({ title: '暂无门店联系电话', icon: 'none' });
        break;
      case 'logout':
        Taro.showModal({
          title: '提示',
          content: '确定要退出登录吗？',
          success: (res) => {
            if (res.confirm) {
              logout();
              Taro.reLaunch({ url: '/pages/index/index' });
            }
          },
        });
        break;
    }
  };

  return (
    <ScrollView className='ip-page' scrollY>
      {/* 头部区域 */}
      <View className='ip-header'>
        <View className='ip-header-bg' />
        <View className='ip-header-content'>
          <View className='ip-user-row'>
            <View className='ip-avatar'>
              {user.avatarUrl ? (
                <Image className='ip-avatar-img' src={user.avatarUrl} mode='aspectFill' />
              ) : (
                <Icon name='user' size={52} color='#ffffff' />
              )}
            </View>
            <View className='ip-user-info'>
              <Text className='ip-user-name'>{user.name}</Text>
              <Text className='ip-user-role'>{roleLabels[user.role] || user.role}</Text>
              {user.phone && <Text className='ip-user-phone'>{user.phone}</Text>}
            </View>
          </View>
        </View>
      </View>

      {/* 统计卡片 */}
      <View className='ip-stats-section'>
        <View className='ip-stats-card'>
          <View className='ip-stat-item'>
            <Text className='ip-stat-num'>{stats.completed}</Text>
            <Text className='ip-stat-label'>已完工单</Text>
          </View>
          <View className='ip-stat-divider' />
          <View className='ip-stat-item'>
            <Text className='ip-stat-num'>{stats.installing}</Text>
            <Text className='ip-stat-label'>进行中</Text>
          </View>
          <View className='ip-stat-divider' />
          <View className='ip-stat-item'>
            <Text className='ip-stat-num'>{stats.rating > 0 ? stats.rating : '暂无'}</Text>
            <Text className='ip-stat-label'>评价分数</Text>
          </View>
        </View>
      </View>

      {/* 功能列表 */}
      <View className='ip-menu-section'>
        <Text className='ip-menu-title'>常用功能</Text>
        <View className='ip-menu-list'>
          {menuList.map((item) => (
            <View
              key={item.label}
              className='ip-menu-item'
              onClick={() => handleMenuClick(item.action)}
            >
              <View className={`ip-menu-icon-wrap ${item.iconClass}`}>
                <Icon name={item.icon as any} size={36} color='#122b4d' />
              </View>
              <View className='ip-menu-text'>
                <Text className='ip-menu-label'>{item.label}</Text>
                <Text className='ip-menu-desc'>{item.desc}</Text>
              </View>
              <Icon name='arrow-right' size={28} color='#d1d5db' className='ip-menu-arrow' />
            </View>
          ))}
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
