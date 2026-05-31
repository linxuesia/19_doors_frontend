import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

const statusTabs = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待处理' },
  { value: 'INSTALLING', label: '施工中' },
  { value: 'COMPLETED', label: '已完工' },
];

const statusStyle: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: '#fef3c7', text: '#d97706' },
  INSTALLING: { bg: '#dbeafe', text: '#2563eb' },
  COMPLETED: { bg: '#d1fae5', text: '#059669' },
};

export default function Orders() {
  const { user, requireBusinessLogin } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!requireBusinessLogin()) return;
    setPage(1);
  }, [user, activeTab]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const params: any = { page: String(page), pageSize: '20' };
    if (user?.storeId && user.role !== 'CLIENT') params.storeId = user.storeId;
    if (user?.role === 'INSTALLER') params.installerId = user.id;
    if (activeTab) params.status = activeTab;

    api.get('/orders', { ...params })
      .then((res: any) => {
        const list = res?.list || [];
        if (page === 1) {
          setOrders(list);
        } else {
          setOrders(prev => [...prev, ...list]);
        }
        setHasMore(res?.page < res?.totalPages);
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user, activeTab, page]);

  if (!user || !requireBusinessLogin()) return null;

  const isInstaller = user.role === 'INSTALLER';

  return (
    <ScrollView className='bo-page' scrollY>
      {/* 页面标题 */}
      <View className='bo-header'>
        <Text className='bo-header-title'>{isInstaller ? '我的工单' : '订单管理'}</Text>
        <Text className='bo-header-desc'>{isInstaller ? '查看分配给我的工单' : `管理${user.storeName || ''}门店所有订单`}</Text>
      </View>

      {/* 状态筛选 */}
      <View className='bo-tabs'>
        {statusTabs.map((tab) => (
          <View
            key={tab.value}
            className={`bo-tab ${activeTab === tab.value ? 'bo-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            <Text className={`bo-tab-text ${activeTab === tab.value ? 'bo-tab-text-active' : ''}`}>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 订单列表 */}
      <View className='bo-list'>
        {orders.map((item: any) => {
          const st = statusStyle[item.status] || statusStyle.PENDING;
          return (
            <View
              key={item.id}
              className='bo-card'
              onClick={() =>
                Taro.navigateTo({ url: `/subpackages/business/order-manage/index?id=${item.id}` })
              }
            >
              <View className='bo-card-top'>
                <Text className='bo-card-no'>{item.orderNo || `#${item.id}`}</Text>
                <View className='bo-card-status' style={{ background: st.bg }}>
                  <Text className='bo-card-status-text' style={{ color: st.text }}>
                    {item.status === 'PENDING' ? (isInstaller ? '待开工' : '待处理') : item.status === 'INSTALLING' ? '施工中' : item.status === 'COMPLETED' ? (isInstaller ? '已完成' : '已完工') : item.status}
                  </Text>
                </View>
              </View>

              <Text className='bo-card-product'>{item.productName || '未指定产品'}</Text>

              <View className='bo-card-row'>
                <Icon name='map-pin' size={24} color='#9ca3af' />
                <Text className='bo-card-addr'>{item.installAddress || item.communityName || '-'}</Text>
              </View>

              <View className='bo-card-bottom'>
                <View className='bo-card-left'>
                  <Text className='bo-card-client'>客户：{item.client?.name || '-'}</Text>
                  {!isInstaller && item.installer && <Text className='bo-card-installer'>工人：{item.installer.name}</Text>}
                </View>
                <Text className='bo-card-amount'>¥{item.totalAmount?.toLocaleString() || 0}</Text>
              </View>
            </View>
          );
        })}
        {orders.length === 0 && !loading && (
          <View className='bo-empty'>
            <Icon name='file-text' size={72} color='#d1d5db' />
            <Text className='bo-empty-text'>{isInstaller ? '暂无工单' : '暂无订单'}</Text>
          </View>
        )}

        {loading && (
          <View className='bo-loading'>
            <Text className='bo-loading-text'>加载中...</Text>
          </View>
        )}

        {hasMore && !loading && (
          <View className='bo-load-more' onClick={() => setPage(p => p + 1)}>
            <Text className='bo-load-more-text'>加载更多</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
