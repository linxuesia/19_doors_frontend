import { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import ThankYouModal from '../../../components/ThankYouModal';
import api from '../../../utils/api';
import './index.scss';

interface Order {
  id: string;
  orderNo: string;
  status: string;
  productName: string;
  installAddress: string;
  communityName: string;
  scheduledInstallDate: string;
  createdAt: string;
  completedAt?: string;
  totalAmount: number;
  warrantyYears: number;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: '待分配', className: 'status-pending' },
  INSTALLING: { label: '施工中', className: 'status-installing' },
  REVIEWING: { label: '待确认完工', className: 'status-reviewing' },
  COMPLETED: { label: '已完工', className: 'status-completed' },
  WARRANTY: { label: '质保中', className: 'status-warranty' },
};

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showThanks, setShowThanks] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      setPage(1);
    }
  }, [user]);

  useEffect(() => {
    if (!user || page <= 0) return;
    fetchOrders();
  }, [user, page]);

  const fetchOrders = () => {
    setLoading(true);
    api.get('/orders', { clientId: user?.id, page: String(page), pageSize: '20' })
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
        console.error('获取订单失败:', err);
        Taro.showToast({ title: '获取订单失败', icon: 'none' });
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  const handleContactService = (e: any, order: Order) => {
    e.stopPropagation();
    Taro.showModal({
      title: '联系客服',
      content: `是否联系客服咨询订单 ${order.orderNo}？`,
      confirmText: '拨打',
      success: (res) => {
        if (res.confirm) {
          Taro.makePhoneCall({
            phoneNumber: '400-123-4567',
            fail: () => {
              Taro.showToast({ title: '拨号失败', icon: 'none' });
            }
          });
        }
      }
    });
  };

  const handleConfirmComplete = (e: any, order: Order) => {
    e.stopPropagation();
    Taro.showModal({
      title: '确认完成',
      content: `确认订单 ${order.orderNo} 已完工？`,
      confirmText: '确认',
      success: (res) => {
        if (res.confirm) {
          api.put(`/orders/${order.id}/complete`)
            .then(() => {
              setCompletedOrder(order);
              setShowThanks(true);
              fetchOrders();
            })
            .catch(() => {
              Taro.showToast({ title: '操作失败', icon: 'none' });
            });
        }
      }
    });
  };

  const handleCloseThanks = () => {
    setShowThanks(false);
    setCompletedOrder(null);
  };

  const handleViewDetail = (order: Order) => {
    Taro.navigateTo({
      url: `/subpackages/client/order-detail/index?id=${order.id}`
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('zh-CN');
  };

  if (loading) {
    return (
      <View className='mo-page'>
        <View className='mo-loading'>
          <Text className='mo-loading-text'>加载中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='mo-page'>
      <View className='mo-list'>
        <Text className='mo-title'>我的订单</Text>

        {orders.length === 0 && !loading ? (
          <View className='mo-empty'>
            <Icon name='file-text' size={120} color='#d1d5db' />
            <Text className='mo-empty-text'>暂无订单</Text>
            <Text className='mo-empty-subtext'>您还没有任何订单记录</Text>
          </View>
        ) : (
          orders.map((order) => {
            const status = statusConfig[order.status] || { label: order.status, className: '' };
            
            return (
              <View
                key={order.id}
                className='mo-card'
                onClick={() => handleViewDetail(order)}
              >
                {/* 卡片头部：订单号 + 状态 */}
                <View className='mo-card-header'>
                  <Text className='mo-order-no'>{order.orderNo}</Text>
                  <Text className={`mo-status-tag ${status.className}`}>
                    {status.label}
                  </Text>
                </View>

                {/* 产品名称 */}
                <Text className='mo-product-name'>{order.productName || '未指定产品'}</Text>

                {/* 地址信息 */}
                <View className='mo-info-row'>
                  <Icon name='map-pin' size={28} color='#9ca3af' />
                  <Text className='mo-info-text'>
                    {order.installAddress || order.communityName || '未填写地址'}
                  </Text>
                </View>

                {/* 时间信息 */}
                <View className='mo-time-row'>
                  <View className='mo-time-item'>
                    <Icon name='calendar' size={24} color='#9ca3af' />
                    <Text className='mo-time-label'>创建：</Text>
                    <Text className='mo-time-value'>{formatDate(order.createdAt)}</Text>
                  </View>
                  {order.scheduledInstallDate && (
                    <View className='mo-time-item'>
                      <Icon name='clock' size={24} color='#9ca3af' />
                      <Text className='mo-time-label'>预计安装：</Text>
                      <Text className='mo-time-value'>{formatDate(order.scheduledInstallDate)}</Text>
                    </View>
                  )}
                </View>

                {/* 底部操作按钮 */}
                <View className='mo-card-footer'>
                  <Text
                    className='mo-btn mo-btn-outline'
                    onClick={(e) => handleContactService(e, order)}
                  >
                    联系客服
                  </Text>
                  
                  {order.status === 'REVIEWING' ? (
                    <Text
                      className='mo-btn mo-btn-primary'
                      onClick={(e) => handleConfirmComplete(e, order)}
                    >
                      确认完成订单
                    </Text>
                  ) : (
                    <Text
                      className='mo-btn mo-btn-primary'
                      onClick={() => handleViewDetail(order)}
                    >
                      查看详情
                    </Text>
                  )}
                </View>
              </View>
            );
          })
        )}

        {loading && (
          <View className='mo-load-more'><Text className='mo-load-more-text'>加载中...</Text></View>
        )}
        {hasMore && !loading && (
          <View className='mo-load-more' onClick={() => setPage(p => p + 1)}>
            <Text className='mo-load-more-text'>加载更多</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />

      {completedOrder && (
        <ThankYouModal
          visible={showThanks}
          onClose={handleCloseThanks}
          orderInfo={{
            orderId: completedOrder.id,
            orderNo: completedOrder.orderNo,
            address: completedOrder.installAddress || completedOrder.communityName || '',
            productName: completedOrder.productName || '',
          }}
        />
      )}
    </View>
  );
}
