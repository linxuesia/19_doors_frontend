import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

interface OrderItem {
  id: number;
  orderNo: string;
  status: string;
  installAddress: string;
  communityName: string;
  client?: {
    name: string;
    phone: string;
  };
  productName: string;
  createdAt: string;
  updatedAt: string;
}

const statusTabs = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待接工' },
  { value: 'ASSIGNED', label: '特派工' },
  { value: 'INSTALLING', label: '施工中' },
  { value: 'COMPLETED', label: '已完成' },
];

const statusConfig: Record<string, { label: string; class: string; statusClass: string }> = {
  PENDING: { label: '待接工', class: 'io-card-pending', statusClass: 'io-status-pending' },
  ASSIGNED: { label: '特派工', class: 'io-card-assigned', statusClass: 'io-status-assigned' },
  INSTALLING: { label: '施工中', class: 'io-card-installing', statusClass: 'io-status-installing' },
  COMPLETED: { label: '已完成', class: 'io-card-completed', statusClass: 'io-status-completed' },
};

function maskPhone(phone?: string): string {
  if (!phone) return '-';
  const str = phone.toString();
  if (str.length <= 7) return str;
  return str.slice(0, 3) + '****' + str.slice(-4);
}

function formatTime(timeStr?: string): string {
  if (!timeStr) return '-';
  try {
    const date = new Date(timeStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  } catch {
    return '-';
  }
}

export default function InstallerOrders() {
  const { user, requireBusinessLogin } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, installing: 0, completed: 0 });

  useEffect(() => {
    if (!requireBusinessLogin()) return;
    setPage(1);
    // 加载统计数据
    api.get('/orders/stats', { installerId: user?.id })
      .then((res: any) => setStats(res || { total: 0, pending: 0, installing: 0, completed: 0 }))
      .catch(() => {});
  }, [user, activeTab]);

  useEffect(() => {
    if (!user || user.role !== 'INSTALLER') return;
    setLoading(true);

    const params: Record<string, any> = { installerId: user.id, page: String(page), pageSize: '20' };
    if (activeTab) params.status = activeTab;

    api.get('/orders', params)
      .then((res: any) => {
        const list = res?.list || [];
        if (page === 1) {
          setOrders(list);
        } else {
          setOrders(prev => [...prev, ...list]);
        }
        setHasMore(res?.page < res?.totalPages);
      })
      .catch((err) => {
        console.error('获取工单失败:', err);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  }, [user, activeTab, page]);

  if (!user || !requireBusinessLogin()) return null;

  const handleCardClick = (order: OrderItem) => {
    Taro.navigateTo({
      url: `/subpackages/business/order-manage/index?id=${order.id}`,
    });
  };

  return (
    <ScrollView className='io-page' scrollY>
      {/* 头部区域 */}
      <View className='io-header'>
        <Text className='io-header-title'>我的工单</Text>
        <Text className='io-header-desc'>管理您的安装任务与进度</Text>

        {/* 统计信息 */}
        <View className='io-stats'>
          <View className='io-stat-item'>
            <Text className='io-stat-num'>{stats.total}</Text>
            <Text className='io-stat-label'>全部</Text>
          </View>
          <View className='io-stat-item'>
            <Text className='io-stat-num'>{stats.pending}</Text>
            <Text className='io-stat-label'>待接工</Text>
          </View>
          <View className='io-stat-item'>
            <Text className='io-stat-num'>{stats.installing}</Text>
            <Text className='io-stat-label'>施工中</Text>
          </View>
          <View className='io-stat-item'>
            <Text className='io-stat-num'>{stats.completed}</Text>
            <Text className='io-stat-label'>已完成</Text>
          </View>
        </View>
      </View>

      {/* 状态筛选 */}
      <View className='io-tabs-container'>
        <View className='io-tabs'>
          {statusTabs.map((tab) => (
            <View
              key={tab.value}
              className={`io-tab ${activeTab === tab.value ? 'io-tab-active' : ''}`}
              onClick={() => setActiveTab(tab.value)}
            >
              <Text className={`io-tab-text ${activeTab === tab.value ? 'io-tab-text-active' : ''}`}>
                {tab.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* 工单列表 */}
      <View className='io-list'>
        {orders.map((item) => {
          const config = statusConfig[item.status] || statusConfig.PENDING;
          return (
            <View
              key={item.id}
              className={`io-card ${config.class}`}
              onClick={() => handleCardClick(item)}
            >
              {/* 卡片顶部：工单号 + 状态 */}
              <View className='io-card-top'>
                <View className='io-card-no-wrapper'>
                  <View className='io-card-no-icon'>
                    <Icon name='file-text' size={24} color='#3b82f6' />
                  </View>
                  <Text className='io-card-no'>{item.orderNo || String(item.id).padStart(2, '0')}</Text>
                </View>
                <View className={`io-card-status ${config.statusClass}`}>
                  <Text>{config.label}</Text>
                </View>
              </View>

              {/* 地址信息 */}
              <View className='io-card-address'>
                <View className='io-card-addr-icon'>
                  <Icon name='map-pin' size={28} color='#f59e0b' />
                </View>
                <Text className='io-card-addr-text'>
                  {item.installAddress || item.communityName || '未填写地址'}
                </Text>
              </View>

              {/* 产品标签 */}
              {item.productName && (
                <View className='io-card-product-tag'>
                  <Icon name='package' size={22} color='#15803d' />
                  <Text className='io-product-text'>{item.productName}</Text>
                </View>
              )}

              {/* 客户信息 + 时间 */}
              <View className='io-card-info-row'>
                <View className='io-card-client-info'>
                  <View className='io-client-avatar'>
                    <Icon name='user' size={20} color='#6366f1' />
                  </View>
                  <Text className='io-client-name'>{item.client?.name || '未知客户'}</Text>
                  <Text className='io-client-phone'>{maskPhone(item.client?.phone)}</Text>
                </View>
                <Text className='io-card-time'>{formatTime(item.createdAt)}</Text>
              </View>
            </View>
          );
        })}

        {/* 空状态 */}
        {orders.length === 0 && !loading && (
          <View className='io-empty'>
            <View className='io-empty-icon'>
              <Icon name='clipboard-list' size={80} color='#cbd5e1' />
            </View>
            <Text className='io-empty-text'>暂无工单</Text>
            <Text className='io-empty-subtext'>新的工单会在这里显示</Text>
          </View>
        )}

        {loading && (
          <View className='io-load-more'><Text className='io-load-more-text'>加载中...</Text></View>
        )}
        {hasMore && !loading && (
          <View className='io-load-more' onClick={() => setPage(p => p + 1)}>
            <Text className='io-load-more-text'>加载更多</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
