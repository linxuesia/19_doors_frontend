import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

interface ClientInfo {
  name: string;
  phone: string;
  orderCount: number;
  latestOrder: string;
  latestDate: string;
  totalAmount: number;
  addresses: string[];
}

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: any = { pageSize: '500' };
    if (user?.storeId) params.storeId = user.storeId;
    if (user?.role === 'INSTALLER') params.installerId = user.id;

    api.get('/orders', { ...params })
      .then((res: any) => {
        const list = res?.list || (Array.isArray(res) ? res : []);
        // 按客户姓名+电话聚合
        const map = new Map<string, ClientInfo>();
        list.forEach((order: any) => {
          const name = order.client?.name || order.clientName || '未知';
          const phone = order.client?.phone || order.clientPhone || '';
          const key = `${name}_${phone}`;
          if (!map.has(key)) {
            map.set(key, {
              name,
              phone,
              orderCount: 0,
              latestOrder: order.orderNo || '',
              latestDate: order.createdAt || '',
              totalAmount: 0,
              addresses: [],
            });
          }
          const c = map.get(key)!;
          c.orderCount++;
          c.totalAmount += order.totalAmount || 0;
          if (order.createdAt && order.createdAt > c.latestDate) {
            c.latestDate = order.createdAt;
            c.latestOrder = order.orderNo || '';
          }
          const addr = order.installAddress || order.communityName;
          if (addr && !c.addresses.includes(addr)) {
            c.addresses.push(addr);
          }
        });
        setClients(Array.from(map.values()).sort((a, b) => b.orderCount - a.orderCount));
      })
      .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <View className='cl-page'>
        <View className='cl-loading'><Text className='cl-loading-text'>加载中...</Text></View>
      </View>
    );
  }

  return (
    <ScrollView className='cl-page' scrollY>
      <View className='cl-content'>
        <View className='cl-header'>
          <Text className='cl-title'>客户档案</Text>
          <Text className='cl-count'>共 {clients.length} 位客户</Text>
        </View>

        {clients.length > 0 ? (
          <View className='cl-list'>
            {clients.map((client, idx) => (
              <View
                key={idx}
                className='cl-card'
                onClick={() => Taro.navigateTo({
                  url: `/subpackages/business/client-detail/index?name=${encodeURIComponent(client.name)}&phone=${encodeURIComponent(client.phone)}`,
                })}
              >
                <View className='cl-card-top'>
                  <View className='cl-avatar'>
                    <Text className='cl-avatar-text'>{client.name.charAt(0)}</Text>
                  </View>
                  <View className='cl-info'>
                    <Text className='cl-name'>{client.name}</Text>
                    <Text className='cl-phone'>{client.phone}</Text>
                  </View>
                </View>

                {client.addresses.length > 0 && (
                  <View className='cl-addresses'>
                    <Icon name='map-pin' size={24} color='#9ca3af' />
                    <Text className='cl-addr-text'>{client.addresses.slice(0, 2).join(' / ')}</Text>
                    {client.addresses.length > 2 && (
                      <Text className='cl-addr-more'>等{client.addresses.length}处</Text>
                    )}
                  </View>
                )}

                <View className='cl-card-bottom'>
                  <View className='cl-bottom-item'>
                    <Text className='cl-bottom-label'>订单金额</Text>
                    <Text className='cl-bottom-value'>¥{client.totalAmount.toLocaleString()}</Text>
                  </View>
                  <View className='cl-bottom-item'>
                    <Text className='cl-bottom-label'>订单编号</Text>
                    <Text className='cl-bottom-value'>{client.latestOrder}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className='cl-empty'>
            <Icon name='user' size={64} color='#d1d5db' />
            <Text className='cl-empty-text'>暂无客户数据</Text>
          </View>
        )}
      </View>
      <View className='safe-bottom' />
    </ScrollView>
  );
}
