import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import { orderStatusMap } from '../../../constants/status';
import './index.scss';

export default function ClientDetail() {
  const router = useRouter();
  const { user } = useAuth();
  const clientName = decodeURIComponent((router.params.name as string) || '');
  const clientPhone = decodeURIComponent((router.params.phone as string) || '');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: any = {
      clientName,
      clientPhone,
      pageSize: '500',
    };
    if (user?.storeId) params.storeId = user.storeId;
    if (user?.role === 'INSTALLER') params.installerId = user.id;

    api.get('/orders', params)
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        setOrders(list);
      })
      .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => setLoading(false));
  }, [clientName, clientPhone, user]);

  const totalAmount = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);
  const addresses = [...new Set(orders.map((o: any) => o.installAddress || o.communityName).filter(Boolean))];

  if (loading) {
    return (
      <View className='cd-page'>
        <View className='cd-loading'><Text className='cd-loading-text'>加载中...</Text></View>
      </View>
    );
  }

  return (
    <ScrollView className='cd-page' scrollY>
      {/* 客户信息卡片 */}
      <View className='cd-header-card'>
        <View className='cd-avatar'>
          <Text className='cd-avatar-text'>{clientName.charAt(0)}</Text>
        </View>
        <Text className='cd-name'>{clientName}</Text>
        <Text className='cd-phone'>{clientPhone}</Text>
        <View className='cd-stats'>
          <View className='cd-stat-item'>
            <Text className='cd-stat-num'>{orders.length}</Text>
            <Text className='cd-stat-label'>累计订单</Text>
          </View>
          <View className='cd-stat-item'>
            <Text className='cd-stat-num'>¥{totalAmount.toLocaleString()}</Text>
            <Text className='cd-stat-label'>累计金额</Text>
          </View>
          <View className='cd-stat-item'>
            <Text className='cd-stat-num'>{addresses.length}</Text>
            <Text className='cd-stat-label'>服务地址</Text>
          </View>
        </View>
        {addresses.length > 0 && (
          <View className='cd-addresses'>
            <Icon name='map-pin' size={22} color='#9ca3af' />
            <Text className='cd-addr-text'>{addresses.join(' / ')}</Text>
          </View>
        )}
      </View>

      {/* 订单列表 */}
      <View className='cd-section'>
        <Text className='cd-section-title'>订单记录 ({orders.length})</Text>
        {orders.length > 0 ? (
          <View className='cd-order-list'>
            {orders.map((order: any) => (
              <View
                key={order.id}
                className='cd-order-card'
                onClick={() => Taro.navigateTo({ url: `/subpackages/business/order-manage/index?id=${order.id}` })}
              >
                <View className='cd-order-top'>
                  <Text className='cd-order-no'>{order.orderNo}</Text>
                  <View className={`cd-order-status status-${order.status?.toLowerCase()}`}>
                    <Text className='cd-status-text'>
                      {orderStatusMap[order.status]?.label || order.status}
                    </Text>
                  </View>
                </View>
                <View className='cd-order-body'>
                  <View className='cd-order-row'>
                    <Text className='cd-order-label'>产品</Text>
                    <Text className='cd-order-value'>{order.productName || '-'}</Text>
                  </View>
                  <View className='cd-order-row'>
                    <Text className='cd-order-label'>地址</Text>
                    <Text className='cd-order-value'>{order.installAddress || order.communityName || '-'}</Text>
                  </View>
                  <View className='cd-order-row'>
                    <Text className='cd-order-label'>金额</Text>
                    <Text className='cd-order-value cd-order-amount'>¥{order.totalAmount?.toLocaleString() || 0}</Text>
                  </View>
                  <View className='cd-order-row'>
                    <Text className='cd-order-label'>日期</Text>
                    <Text className='cd-order-value'>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('zh-CN') : '-'}</Text>
                  </View>
                </View>
                <View className='cd-order-arrow'>
                  <Icon name='arrow-right' size={24} color='#d1d5db' />
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className='cd-empty'>
            <Icon name='file-text' size={48} color='#d1d5db' />
            <Text className='cd-empty-text'>暂无订单记录</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
