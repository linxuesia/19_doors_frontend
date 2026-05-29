import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import api from '../../../utils/api';
import './index.scss';

interface WarrantyData {
  order: {
    orderNo: string;
    productName: string;
    clientName: string;
    clientPhone: string;
    storeName: string;
    storePhone: string;
  };
  warranty: {
    warrantyYears: number;
    startDate: string;
    endDate: string;
    remainingDays: number;
    isExpired: boolean;
  } | null;
  message?: string;
}

export default function Warranty() {
  const router = useRouter();
  const { orderId } = router.params;
  const [data, setData] = useState<WarrantyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    api.get(`/orders/${orderId}/warranty`)
      .then((res: any) => setData(res))
      .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <View className='wty-page'>
        <View className='wty-loading'><Text className='wty-loading-text'>加载中...</Text></View>
      </View>
    );
  }

  if (!data) {
    return (
      <View className='wty-page'>
        <View className='wty-empty'>
          <Text className='wty-empty-text'>暂无质保信息</Text>
        </View>
      </View>
    );
  }

  const { order, warranty } = data;

  return (
    <ScrollView className='wty-page' scrollY>
      <View className='wty-content'>
        {/* 质保卡 */}
        <View className='wty-card'>
          <View className='wty-card-bg' />
          <View className='wty-card-body'>
            <View className='wty-card-header'>
              <View>
                <Text className='wty-card-subtitle'>SOJOY GUARANTEE</Text>
                <Text className='wty-card-title'>19分贝质保凭证</Text>
              </View>
              <View className='wty-card-badge'>
                <Text className='wty-badge-num'>19</Text>
              </View>
            </View>

            {/* 质保倒计时 */}
            {warranty ? (
              <View className='wty-countdown-box'>
                <Text className='wty-countdown-label'>质保倒计时</Text>
                <View className='wty-countdown-row'>
                  <Text className='wty-countdown-num'>{warranty.remainingDays}</Text>
                  <Text className='wty-countdown-unit'>天</Text>
                </View>
                <Text className='wty-countdown-date'>
                  自 {warranty.startDate} 起至 {warranty.endDate} 止 ({warranty.warrantyYears === 99 ? '终身' : `${warranty.warrantyYears}年`}质保)
                </Text>
                {warranty.isExpired && (
                  <Text className='wty-expired-tag'>已过期</Text>
                )}
              </View>
            ) : (
              <View className='wty-countdown-box'>
                <Text className='wty-countdown-label'>状态</Text>
                <Text className='wty-no-warranty-text'>{data.message || '订单尚未完成，暂无质保卡'}</Text>
              </View>
            )}

            {/* 订单信息 */}
            <View className='wty-info-list'>
              <View className='wty-info-row'>
                <Text className='wty-info-label'>客户姓名</Text>
                <Text className='wty-info-value'>{order.clientName || '-'}</Text>
              </View>
              <View className='wty-info-row'>
                <Text className='wty-info-label'>服务门店</Text>
                <Text className='wty-info-value'>{order.storeName || '-'}</Text>
              </View>
              <View className='wty-info-row'>
                <Text className='wty-info-label'>订单编号</Text>
                <Text className='wty-info-value'>{order.orderNo}</Text>
              </View>
              <View className='wty-info-row'>
                <Text className='wty-info-label'>产品</Text>
                <Text className='wty-info-value'>{order.productName || '-'}</Text>
              </View>
            </View>
          </View>
        </View>

        <View className='wty-footer-text'>
          <Text>如有疑问，请联系您的专属服务门店</Text>
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
