import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth, roleLabels } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

const ownerFunctions = [
  { icon: 'clipboard', label: '订单管理', url: '/subpackages/business/orders/index' },
  { icon: 'calendar', label: '预约管理', url: '/subpackages/business/reservations/index' },
  { icon: 'add', label: '录入订单', url: '/subpackages/business/order-manage/index' },
  { icon: 'user', label: '客户档案', url: '/subpackages/business/clients/index' },
  { icon: 'image', label: '案例库', url: '/pages/cases/index' },
  { icon: 'settings', label: '门店设置', url: '/subpackages/business/store-manage/index' },
];

const managerFunctions = [
  { icon: 'clipboard', label: '订单管理', url: '/subpackages/business/orders/index' },
  { icon: 'calendar', label: '预约管理', url: '/subpackages/business/reservations/index' },
  { icon: 'add', label: '录入订单', url: '/subpackages/business/order-manage/index' },
  { icon: 'user', label: '客户档案', url: '/subpackages/business/clients/index' },
  { icon: 'image', label: '案例库', url: '/pages/cases/index' },
];

const installerFunctions = [
  { icon: 'clipboard', label: '我的工单', url: '/subpackages/business/orders/index' },
];

export default function Workbench() {
  const { user, requireBusinessLogin, canManageStaff, refreshUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, installing: 0, completed: 0 });

  // 每次进入工作台时刷新用户信息（角色变更后无需重新登录）
  useEffect(() => { refreshUser(); }, []);

  useEffect(() => {
    if (!requireBusinessLogin()) return;

    const params: any = {};
    if (user?.storeId) params.storeId = user.storeId;
    if (user?.role === 'INSTALLER') params.installerId = user.id;

    api.get('/orders', { ...params })
      .then((res: any) => {
        const list = res || [];
        setOrders(list);
        setStats({
          total: list.length,
          pending: list.filter((o: any) => o.status === 'PENDING').length,
          installing: list.filter((o: any) => o.status === 'INSTALLING').length,
          completed: list.filter((o: any) => o.status === 'COMPLETED').length,
        });
      })
      .catch(() => {});
  }, [user]);

  if (!user || !requireBusinessLogin()) return null;

  const isOwner = user.role === 'STORE_OWNER';
  const isManager = user.role === 'STORE_MANAGER';
  const isInstaller = user.role === 'INSTALLER';

  let functions = ownerFunctions;
  if (isInstaller) functions = installerFunctions;
  else if (isManager) functions = managerFunctions;

  return (
    <ScrollView className='wb-page' scrollY>
      {/* 头部 */}
      <View className='wb-header'>
        <View className='wb-header-bg' />
        <View className='wb-header-content'>
          <View className='wb-user-row'>
            <View className='wb-avatar'>
              <Icon name='user' size={44} color='#ffffff' />
            </View>
            <View className='wb-user-info'>
              <Text className='wb-user-name'>{user.name}</Text>
              <View className='wb-user-meta-row'>
                <Text className='wb-user-role'>{roleLabels[user.role] || user.role}</Text>
                {user.storeName && (
                  <>
                    <Text className='wb-user-sep'>·</Text>
                    <Text className='wb-user-store'>{user.storeName}</Text>
                  </>
                )}
              </View>
            </View>
            <View className='wb-store-tag'>
              <Text className='wb-store-tag-text'>工作台</Text>
            </View>
          </View>

          {/* 统计栏 */}
          <View className='wb-stats'>
            <View className='wb-stat-item'>
              <Text className='wb-stat-num'>{stats.total}</Text>
              <Text className='wb-stat-label'>{isInstaller ? '全部' : '全部'}</Text>
            </View>
            <View className='wb-stat-divider' />
            <View className='wb-stat-item'>
              <Text className='wb-stat-num wb-stat-warn'>{stats.pending}</Text>
              <Text className='wb-stat-label'>{isInstaller ? '待开工' : '待处理'}</Text>
            </View>
            <View className='wb-stat-divider' />
            <View className='wb-stat-item'>
              <Text className='wb-stat-num wb-stat-blue'>{stats.installing}</Text>
              <Text className='wb-stat-label'>{isInstaller ? '施工中' : '施工中'}</Text>
            </View>
            <View className='wb-stat-divider' />
            <View className='wb-stat-item'>
              <Text className='wb-stat-num wb-stat-green'>{stats.completed}</Text>
              <Text className='wb-stat-label'>{isInstaller ? '已完成' : '已完工'}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 功能入口 */}
      <View className='wb-fn-section'>
        <Text className='wb-section-title'>功能入口</Text>
        <View className={`wb-fn-grid ${isInstaller ? 'wb-fn-grid-sm' : ''}`}>
          {functions.map((fn) => (
            <View
              key={fn.label}
              className='wb-fn-card'
              onClick={() => fn.url ? Taro.navigateTo({ url: fn.url }) : Taro.showToast({ title: '功能开发中', icon: 'none' })}
            >
              <View className='wb-fn-icon-wrap'>
                <Icon name={fn.icon as any} size={40} color='#122b4d' />
              </View>
              <Text className='wb-fn-label'>{fn.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 最新动态（老板/店长显示） */}
      {!isInstaller && (
        <View className='wb-dynamic-section'>
          <View className='wb-dynamic-header'>
            <Text className='wb-section-title'>最新动态</Text>
            <Text className='wb-dynamic-more' onClick={() => Taro.navigateTo({ url: '/subpackages/business/orders/index' })}>查看全部 ›</Text>
          </View>
          <View className='wb-dynamic-list'>
            {orders.slice(0, 5).map((item: any) => {
              const statusKey = (item.status || 'PENDING').toLowerCase();
              return (
                <View key={item.id} className='wb-dynamic-card'>
                  <View className='wb-dynamic-top'>
                    <Text className='wb-dynamic-no'>{item.orderNo || `#${item.id}`}</Text>
                    <View className={`wb-dynamic-status wb-status-${statusKey}`}>
                      <Text className='wb-dynamic-status-text'>
                        {item.status === 'PENDING' ? '待处理' : item.status === 'INSTALLING' ? '施工中' : item.status === 'COMPLETED' ? '已完工' : item.status}
                      </Text>
                    </View>
                  </View>
                  <Text className='wb-dynamic-product'>{item.productName || '未指定产品'}</Text>
                  <View className='wb-dynamic-row'>
                    <Icon name='map-pin' size={24} color='#9ca3af' />
                    <Text className='wb-dynamic-addr'>{item.installAddress || item.communityName || '-'}</Text>
                  </View>
                  <View className='wb-dynamic-bottom'>
                    <Text className='wb-dynamic-client'>{item.client?.name || '-'}</Text>
                    <Text className='wb-dynamic-amount'>¥{item.totalAmount?.toLocaleString() || 0}</Text>
                  </View>
                </View>
              );
            })}
            {orders.length === 0 && (
              <View className='wb-empty'>
                <Icon name='file-text' size={64} color='#d1d5db' />
                <Text className='wb-empty-text'>暂无动态</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View className='safe-bottom' />
    </ScrollView>
  );
}
