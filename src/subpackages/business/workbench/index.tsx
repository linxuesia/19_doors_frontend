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
  { icon: 'image', label: '案例库', url: '/subpackages/business/case-manage/index' },
  { icon: 'users', label: '人员管理', url: '/subpackages/business/staff-manage/index' },
  { icon: 'settings', label: '门店设置', url: '/subpackages/business/store-manage/index' },
  { icon: 'clipboard-list', label: '验收反馈', url: '/subpackages/business/inspections/index' },
];

const managerFunctions = [
  { icon: 'clipboard', label: '订单管理', url: '/subpackages/business/orders/index' },
  { icon: 'calendar', label: '预约管理', url: '/subpackages/business/reservations/index' },
  { icon: 'add', label: '录入订单', url: '/subpackages/business/order-manage/index' },
  { icon: 'user', label: '客户档案', url: '/subpackages/business/clients/index' },
  { icon: 'image', label: '案例库', url: '/subpackages/business/case-manage/index' },
  { icon: 'users', label: '人员管理', url: '/subpackages/business/staff-manage/index' },
  { icon: 'settings', label: '门店设置', url: '/subpackages/business/store-manage/index' },
  { icon: 'clipboard-list', label: '验收反馈', url: '/subpackages/business/inspections/index' },
];

export default function Workbench() {
  const { user, requireBusinessLogin, canManageStaff, refreshUser } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, installing: 0, completed: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // 每次进入工作台时刷新用户信息（角色变更后无需重新登录）
  useEffect(() => { refreshUser(); }, []);

  useEffect(() => {
    if (!requireBusinessLogin(undefined, 'STORE_OWNER,STORE_MANAGER')) return;

    const params: any = {};
    if (user?.storeId) params.storeId = user.storeId;

    // 统计数据
    setStatsLoading(true);
    api.get('/orders/stats', { ...params })
      .then((res: any) => setStats(res || { total: 0, pending: 0, installing: 0, completed: 0 }))
      .catch(() => Taro.showToast({ title: '加载统计数据失败', icon: 'none' }))
      .finally(() => setStatsLoading(false));

    // 最近订单（仅显示前5条）
    setOrdersLoading(true);
    api.get('/orders', { ...params, page: '1', pageSize: '5' })
      .then((res: any) => setOrders(res?.list || []))
      .catch(() => Taro.showToast({ title: '加载订单列表失败', icon: 'none' }))
      .finally(() => setOrdersLoading(false));
  }, [user]);

  if (!user || !requireBusinessLogin(undefined, 'STORE_OWNER,STORE_MANAGER')) {
    return <View className='wb-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>加载中...</Text></View>;
  }

  const isOwner = (user.role || '').includes('STORE_OWNER');
  const isManager = (user.role || '').includes('STORE_MANAGER');

  const functions = isManager ? managerFunctions : ownerFunctions;

  return (
    <ScrollView className='wb-page' scrollY>
      {/* 头部 - 专业设计 */}
      <View className='wb-header'>
        {/* 背景层 */}
        <View className='wb-header-bg' />

        {/* 装饰几何图形 */}
        <View className='wb-header-decor'>
          <View className='wb-decor-circle wb-decor-circle-1' />
          <View className='wb-decor-circle wb-decor-circle-2' />
          <View className='wb-decor-line wb-decor-line-1' />
        </View>

        {/* 内容区 */}
        <View className='wb-header-content'>
          {/* 品牌行 */}
          <View className='wb-brand-row'>
            <View className='wb-brand-section'>
              <Text className='wb-brand-name'>SOJOY</Text>
              <Text className='wb-brand-divider'>|</Text>
              <Text className='wb-brand-role'>{isOwner ? '门店老板' : '门店店长'}</Text>
            </View>
            <View className='wb-workbench-tag'>
              <Icon name='clipboard' size={18} color='#ffffff' />
              <Text className='wb-workbench-text'>工作台</Text>
            </View>
          </View>

          {/* 用户信息行 */}
          <View className='wb-user-row'>
            <View className='wb-avatar'>
              <Text className='wb-avatar-text'>{user.name?.charAt(0) || 'U'}</Text>
            </View>
            <View className='wb-user-info'>
              <Text className='wb-user-name'>{user.name}</Text>
              <View className='wb-user-meta-row'>
                {user.storeName && (
                  <>
                    <Icon name='building' size={16} color='rgba(255,255,255,0.5)' />
                    <Text className='wb-user-store'>{user.storeName}</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* 统计栏 */}
          <View className='wb-stats'>
            <View className='wb-stat-item'>
              <Text className='wb-stat-num'>{statsLoading ? '-' : stats.total}</Text>
              <Text className='wb-stat-label'>全部订单</Text>
            </View>
            <View className='wb-stat-divider' />
            <View className='wb-stat-item'>
              <Text className='wb-stat-num wb-stat-warn'>{statsLoading ? '-' : stats.pending}</Text>
              <Text className='wb-stat-label'>待处理</Text>
            </View>
            <View className='wb-stat-divider' />
            <View className='wb-stat-item'>
              <Text className='wb-stat-num wb-stat-blue'>{statsLoading ? '-' : stats.installing}</Text>
              <Text className='wb-stat-label'>施工中</Text>
            </View>
            <View className='wb-stat-divider' />
            <View className='wb-stat-item'>
              <Text className='wb-stat-num wb-stat-green'>{statsLoading ? '-' : stats.completed}</Text>
              <Text className='wb-stat-label'>已完工</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 功能入口 */}
      <View className='wb-fn-section'>
        <Text className='wb-section-title'>功能入口</Text>
        <View className='wb-fn-grid'>
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

      {/* 最新动态 */}
      <View className='wb-dynamic-section'>
        <View className='wb-dynamic-header'>
          <Text className='wb-section-title'>最新动态</Text>
          <Text className='wb-dynamic-more' onClick={() => Taro.navigateTo({ url: '/subpackages/business/orders/index' })}>查看全部 ›</Text>
        </View>
        <View className='wb-dynamic-list'>
          {ordersLoading ? (
            <View className='wb-empty'>
              <Text className='wb-empty-text'>加载中...</Text>
            </View>
          ) : (
            <>
              {orders.slice(0, 5).map((item: any) => {
                const statusKey = (item.status || 'PENDING').toLowerCase();
                return (
                  <View key={item.id} className='wb-dynamic-card'>
                    <View className='wb-dynamic-top'>
                      <Text className='wb-dynamic-title'>{item.client?.name || item.installAddress || item.communityName || item.productName || `订单${item.id}`}</Text>
                      <View className={`wb-dynamic-status wb-status-${statusKey}`}>
                        <Text className='wb-dynamic-status-text'>
                          {item.status === 'PENDING' ? '待处理' : item.status === 'INSTALLING' ? '施工中' : item.status === 'COMPLETED' ? '已完工' : item.status}
                        </Text>
                      </View>
                    </View>
                    <Text className='wb-dynamic-product'>{item.productName || '未指定产品'}</Text>
                    <View className='wb-dynamic-row'>
                      <Text className='wb-dynamic-no-small'>{item.orderNo || `#${item.id}`}</Text>
                      <View style={{ flex: 1 }} />
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
            </>
          )}
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
