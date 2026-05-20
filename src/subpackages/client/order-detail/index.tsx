import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import { orderStatusMap } from '../../../constants/status';
import './index.scss';

const stageSteps = ['材料入场', '拆旧', '安装窗框', '玻璃安装', '打胶密封', '完工清理'];

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
        .then((res: any) => setOrders(res || []))
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
                <Text className='ol-card-warranty'>质保{item.warrantyYears}年</Text>
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

  const completedStages = order.constructionLogs?.length || 0;
  const progress = Math.min(Math.round((completedStages / stageSteps.length) * 100), 100);

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
          <View className='od-amount-row'>
            <View className='od-amount-item'>
              <Text className='od-amount-label'>订单金额</Text>
              <Text className='od-amount-value'>¥{order.totalAmount?.toLocaleString() || 0}</Text>
            </View>
            <View className='od-amount-item'>
              <Text className='od-amount-label'>已付金额</Text>
              <Text className='od-amount-sub'>¥{order.paidAmount?.toLocaleString() || 0}</Text>
            </View>
            <View className='od-amount-item'>
              <Text className='od-amount-label'>质保年限</Text>
              <Text className='od-amount-sub'>{order.warrantyYears}年</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 施工进度 */}
      <View className='od-progress-card'>
        <Text className='od-section-title'>施工进度</Text>
        <View className='od-progress-bar'>
          <View className='od-progress-fill' style={{ width: `${progress}%` }} />
        </View>
        <Text className='od-progress-text'>{progress}% 完成</Text>
        <View className='od-stages'>
          {stageSteps.map((stage, i) => {
            const log = order.constructionLogs?.find((l: any) => l.stage === stage);
            return (
              <View key={stage} className='od-stage-row'>
                <View className={`od-stage-dot ${log ? 'od-stage-done' : ''}`}>
                  {log ? (
                    <Icon name='check' size={26} color='#ffffff' />
                  ) : (
                    <Text className='od-stage-dot-text'>{i + 1}</Text>
                  )}
                </View>
                <View className='od-stage-info'>
                  <Text className={`od-stage-name ${log ? '' : 'od-stage-pending'}`}>{stage}</Text>
                  {log && <Text className='od-stage-content'>{log.content}</Text>}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* 订单信息 */}
      <View className='od-info-card'>
        <Text className='od-section-title'>订单信息</Text>
        <View className='od-info-list'>
          {[
            { label: '客户', value: `${order.client?.name || '-'} ${order.client?.phone || ''}` },
            { label: '门店', value: order.store?.name || '-' },
            { label: '安装工', value: order.installer?.name || '-' },
            { label: '施工地址', value: order.installAddress || '-' },
            { label: '小区', value: order.communityName || '-' },
            order.scheduledInstallDate && { label: '预计安装', value: order.scheduledInstallDate },
            order.remarks && { label: '备注', value: order.remarks },
          ].filter(Boolean).map((item: any) => (
            <View key={item.label} className='od-info-row'>
              <Text className='od-info-label'>{item.label}</Text>
              <Text className='od-info-value'>{item.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 施工日志 */}
      {order.constructionLogs?.length > 0 && (
        <View className='od-logs-card'>
          <Text className='od-section-title'>工地动态</Text>
          {order.constructionLogs.map((log: any) => (
            <View key={log.id} className='od-log-item'>
              <View className='od-log-header'>
                <Text className='tag tag-brand'>{log.stage}</Text>
                <Text className='od-log-meta'>
                  {log.uploader?.name || ''} · {new Date(log.createdAt).toLocaleDateString('zh-CN')}
                </Text>
              </View>
              <Text className='od-log-content'>{log.content}</Text>
            </View>
          ))}
        </View>
      )}

      <View className='safe-bottom' />
    </View>
  );
}
