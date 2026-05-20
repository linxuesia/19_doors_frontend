import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth, roleLabels } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import { orderStatusMap, measurementStatusMap } from '../../../constants/status';
import './index.scss';

const statusMap = { ...orderStatusMap, ...measurementStatusMap };

export default function Workbench() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!user) return;
    const params: any = {};
    if (user.storeId && (user.role === 'STORE_OWNER' || user.role === 'STORE_MANAGER')) {
      params.storeId = user.storeId;
    }
    if (user.role === 'INSTALLER') params.installerId = user.id;
    if (user.role === 'CLIENT') params.clientId = user.id;

    Promise.all([
      api.get('/orders', { ...params }).catch(() => []),
      api.get('/measurements', { storeId: user.storeId || undefined }).catch(() => []),
    ]).then(([o, m]) => {
      setOrders((o as any) || []);
      setMeasurements((m as any) || []);
    });
  }, [user]);

  if (!user) return null;

  const stats = {
    total: orders.length,
    installing: orders.filter((o: any) => o.status === 'INSTALLING').length,
    completed: orders.filter((o: any) => o.status === 'COMPLETED').length,
  };

  return (
    <View className='wb-page'>
      {/* 头部信息卡 */}
      <View className='wb-header'>
        <View className='wb-header-bg' />
        <View className='wb-header-content'>
          <View className='wb-user-row'>
            <View className='wb-avatar'>
              <Icon name='user' size={48} color='#ffffff' />
            </View>
            <View className='wb-user-info'>
              <Text className='wb-user-name'>{user.name}</Text>
              <Text className='wb-user-role'>{roleLabels[user.role] || user.role} 工作台</Text>
            </View>
          </View>
          <View className='wb-stats'>
            <View className='wb-stat-item'>
              <Text className='wb-stat-num'>{stats.total}</Text>
              <Text className='wb-stat-label'>总工单</Text>
            </View>
            <View className='wb-stat-item'>
              <Text className='wb-stat-num wb-stat-blue'>{stats.installing}</Text>
              <Text className='wb-stat-label'>施工中</Text>
            </View>
            <View className='wb-stat-item'>
              <Text className='wb-stat-num wb-stat-green'>{stats.completed}</Text>
              <Text className='wb-stat-label'>已完工</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab切换 */}
      <View className='wb-tabs'>
        <View
          className={`wb-tab ${activeTab === 'orders' ? 'wb-tab-active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Text className={`wb-tab-text ${activeTab === 'orders' ? 'wb-tab-text-active' : ''}`}>工单列表</Text>
        </View>
        <View
          className={`wb-tab ${activeTab === 'measurements' ? 'wb-tab-active' : ''}`}
          onClick={() => setActiveTab('measurements')}
        >
          <Text className={`wb-tab-text ${activeTab === 'measurements' ? 'wb-tab-text-active' : ''}`}>量尺预约</Text>
        </View>
      </View>

      {/* 工单列表 */}
      {activeTab === 'orders' && (
        <View className='wb-list'>
          {orders.map((item: any) => (
            <View
              key={item.id}
              className='wb-card'
              onClick={() =>
                Taro.navigateTo({ url: `/subpackages/business/order-manage/index?id=${item.id}` })
              }
            >
              <View className='wb-card-top'>
                <Text className='wb-card-no'>{item.orderNo}</Text>
                <Text className='wb-card-status' style={{ backgroundColor: statusMap[item.status]?.bg || '#f3f4f6' }}>
                  {statusMap[item.status]?.label || item.status}
                </Text>
              </View>
              <Text className='wb-card-product'>{item.productName || '未指定产品'}</Text>
              <View className='wb-card-row'>
                <Icon name='map-pin' size={28} color='#6b7280' />
                <Text className='wb-card-addr'> {item.installAddress || item.communityName || '-'}</Text>
              </View>
              <View className='wb-card-bottom'>
                <Text className='wb-card-client'>客户：{item.client?.name || '-'}</Text>
                <Text className='wb-card-amount'>¥{item.totalAmount?.toLocaleString() || 0}</Text>
              </View>
            </View>
          ))}
          {orders.length === 0 && <View className='wb-empty'><Text className='wb-empty-text'>暂无工单</Text></View>}
        </View>
      )}

      {/* 量尺预约 */}
      {activeTab === 'measurements' && (
        <View className='wb-list'>
          {measurements.map((item: any) => (
            <View key={item.id} className='wb-card'>
              <View className='wb-card-top'>
                <Text className='wb-card-client-name'>{item.contactName}</Text>
                <Text className='wb-card-status' style={{ backgroundColor: statusMap[item.status]?.bg || '#f3f4f6' }}>
                  {statusMap[item.status]?.label || item.status}
                </Text>
              </View>
              <View className='wb-card-row'>
                <Icon name='phone' size={28} color='#6b7280' />
                <Text className='wb-card-addr'> {item.phone}</Text>
              </View>
              <View className='wb-card-row'>
                <Icon name='map-pin' size={28} color='#6b7280' />
                <Text className='wb-card-addr'> {item.address}</Text>
              </View>
              {item.expectedDate && (
                <View className='wb-card-row'>
                  <Icon name='calendar' size={28} color='#6b7280' />
                  <Text className='wb-card-date'> 期望：{item.expectedDate}</Text>
                </View>
              )}
            </View>
          ))}
          {measurements.length === 0 && <View className='wb-empty'><Text className='wb-empty-text'>暂无预约</Text></View>}
        </View>
      )}

      {/* 快捷操作 */}
      <View className='wb-actions'>
        <Text className='wb-actions-title'>快捷操作</Text>
        <View className='wb-action-grid'>
          <View className='wb-action-btn' onClick={() => Taro.navigateTo({ url: '/subpackages/business/orders/index' })}>
            <Icon name='clipboard' size={40} color='#122b4d' />
            <Text className='wb-action-label'>录入线下订单</Text>
          </View>
          <View className='wb-action-btn' onClick={() => Taro.navigateTo({ url: '/subpackages/client/reservation/index' })}>
            <Icon name='calendar' size={40} color='#122b4d' />
            <Text className='wb-action-label'>新增量尺预约</Text>
          </View>
        </View>
      </View>
      <View className='safe-bottom' />
    </View>
  );
}
