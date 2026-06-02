import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import { orderStatusMap } from '../../../constants/status';
import './index.scss';

export default function OrderDetail() {
  const router = useRouter();
  const id = router.params.id;
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  const isListMode = router.params.list === '1' || !id;

  useEffect(() => {
    if (isListMode && user) {
      api.get('/orders', { clientId: user.id })
        .then((res: any) => setOrders(res?.list || res || []))
        .catch(() => setOrders([]));
    } else if (id) {
      api.get(`/orders/${id}`)
        .then((res: any) => setOrder(res))
        .catch(() => setOrder(null));
    }
  }, [id, isListMode, user]);

  // 列表模式
  if (isListMode) {
    return (
      <View className='ol-page'>
        <View className='ol-list'>
          <Text className='ol-list-title'>我的订单</Text>
          {orders.map((item: any) => (
            <View
              key={item.id}
              className='ol-card'
              onClick={() => Taro.redirectTo({ url: `/subpackages/client/order-detail/index?id=${item.id}` })}
            >
              <View className='ol-card-header'>
                <Text className='ol-card-no'>{item.orderNo}</Text>
                <Text className='ol-card-status' style={{ backgroundColor: orderStatusMap[item.status]?.bg || '#f3f4f6' }}>
                  {orderStatusMap[item.status]?.label || item.status}
                </Text>
              </View>
              <Text className='ol-card-product'>{item.productName || '未指定产品'}</Text>
              <View className='ol-card-row'>
                <Icon name='map-pin' size={28} color='#6b7280' />
                <Text className='ol-card-addr'> {item.installAddress || item.communityName || '-'}</Text>
              </View>
              <View className='ol-card-footer'>
                <Text className='ol-card-amount'>¥{item.totalAmount?.toLocaleString() || 0}</Text>
                <View className='ol-card-right'>
                  <Text className='ol-card-warranty'>质保{item.warrantyYears}年</Text>
                  {item.status === 'COMPLETED' && (
                    <Text className='ol-warranty-link' onClick={(e) => { e.stopPropagation(); Taro.navigateTo({ url: `/subpackages/client/warranty/index?orderId=${item.id}` }); }}>
                      质保卡 ›
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ))}
          {orders.length === 0 && (
            <View className='ol-empty'><Text className='ol-empty-text'>暂无订单</Text></View>
          )}
        </View>
        <View className='safe-bottom' />
      </View>
    );
  }

  // 详情模式
  if (!order) {
    return <View className='loading'><Text className='loading-text'>加载中...</Text></View>;
  }

  return (
    <View className='od-page'>
      {/* 订单头部 */}
      <View className='od-header'>
        <View className='od-header-bg' />
        <View className='od-header-content'>
          <View className='od-header-top'>
            <Text className='od-order-no'>{order.orderNo}</Text>
            <Text className='od-status' style={{ backgroundColor: orderStatusMap[order.status]?.bg || '#f3f4f6' }}>
              {orderStatusMap[order.status]?.label || order.status}
            </Text>
          </View>
          <Text className='od-product'>{order.productName || '未指定产品'}</Text>
          {order.status === 'COMPLETED' && (
            <View className='od-warranty-btn' onClick={() => Taro.navigateTo({ url: `/subpackages/client/warranty/index?orderId=${order.id}` })}>
              <Text className='od-warranty-btn-text'>查看质保卡 ›</Text>
            </View>
          )}
        </View>
      </View>

      {/* 订单信息 */}
      <View className='od-info-card'>
        <Text className='od-section-title'>订单信息</Text>
        <View className='od-info-list'>
          {[
            { label: '收货人', value: order.client?.name || '-' },
            { label: '联系手机', value: order.client?.phone || '-', highlight: true, isPhone: true },
            { label: '服务门店', value: order.store?.name || '-' },
            { label: '安装师傅', value: order.installer?.name || '待分配' },
            { label: '安装地址', value: order.installAddress || '-' },
            { label: '所在小区', value: order.communityName || '-' },
            { label: '订单金额', value: `¥${order.totalAmount?.toLocaleString() || 0}` },
            order.paidAmount > 0 && { label: '已付金额', value: `¥${order.paidAmount?.toLocaleString() || 0}` },
            { label: '质保时长', value: `${order.warrantyYears}年` },
            order.scheduledInstallDate && { label: '预约安装日期', value: order.scheduledInstallDate },
            order.remarks && { label: '订单备注', value: order.remarks },
          ].filter(Boolean).map((item: any) => (
            <View key={item.label} className={`od-info-row ${item.highlight ? 'od-info-row-highlight' : ''}`}>
              <Text className='od-info-label'>{item.label}</Text>
              {item.isPhone ? (
                <View className='od-phone-value'>
                  <Text className='od-info-value od-phone-text'>{item.value}</Text>
                  {item.value && item.value !== '-' && (
                    <View className='od-phone-call' onClick={() => {
                      Taro.showModal({ title: '拨打电话', content: item.value, confirmText: '拨打', success: (r) => { if (r.confirm) Taro.makePhoneCall({ phoneNumber: item.value }); } });
                    }}>
                      <Icon name='phone' size={28} color='#122b4d' />
                    </View>
                  )}
                </View>
              ) : (
                <Text className='od-info-value'>{item.value}</Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className='safe-bottom' />
    </View>
  );
}
