import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import { orderFilters, orderStatusMap } from '../../../constants/status';
import './index.scss';

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (!user) return;
    const params: any = {};
    if (user.storeId && user.role !== 'CLIENT') params.storeId = user.storeId;
    if (user.role === 'INSTALLER') params.installerId = user.id;
    if (filter) params.status = filter;

    api.get('/orders', { ...params })
      .then((res: any) => setOrders(res || []))
      .catch(() => setOrders([]));
  }, [user, filter]);

  return (
    <View className='bo-page'>
      {/* 筛选 */}
      <View className='bo-filter-scroll'>
        {orderFilters.map((f) => (
          <View
            key={f.value}
            className={`bo-filter-item ${filter === f.value ? 'bo-filter-active' : ''}`}
            onClick={() => setFilter(f.value)}
          >
            <Text className={`bo-filter-text ${filter === f.value ? 'bo-filter-text-active' : ''}`}>
              {f.label}
            </Text>
          </View>
        ))}
      </View>

      {/* 订单列表 */}
      <View className='bo-list'>
        {orders.map((item: any) => (
          <View
            key={item.id}
            className='bo-card'
            onClick={() =>
              Taro.navigateTo({ url: `/subpackages/business/order-manage/index?id=${item.id}` })
            }
          >
            <View className='bo-card-top'>
              <Text className='bo-card-no'>{item.orderNo}</Text>
              <Text className='bo-card-status' style={{ backgroundColor: orderStatusMap[item.status]?.bg || '#f3f4f6' }}>
                {orderStatusMap[item.status]?.label || item.status}
              </Text>
            </View>
            <Text className='bo-card-product'>{item.productName || '未指定产品'}</Text>
            <View className='bo-card-row'>
              <Icon name='map-pin' size={28} color='#6b7280' />
              <Text className='bo-card-addr'> {item.installAddress || item.communityName || '-'}</Text>
            </View>
            <View className='bo-card-bottom'>
              <View className='bo-card-people'>
                <Text className='bo-card-client'>客户：{item.client?.name || '-'}</Text>
                {item.installer && <Text className='bo-card-installer'>工人：{item.installer.name}</Text>}
              </View>
              <Text className='bo-card-amount'>¥{item.totalAmount?.toLocaleString() || 0}</Text>
            </View>
          </View>
        ))}
        {orders.length === 0 && (
          <View className='bo-empty'>
            <Text className='bo-empty-text'>暂无订单</Text>
          </View>
        )}
      </View>
      <View className='safe-bottom' />
    </View>
  );
}
