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
  const [storeStaff, setStoreStaff] = useState<any[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (!requireBusinessLogin()) return;
    setPage(1);
  }, [user, activeTab]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    const params: any = { page: String(page), pageSize: '20' };
    if (user?.storeId && !(user.role || '').includes('CLIENT')) params.storeId = user.storeId;
    if ((user?.role || '').includes('INSTALLER')) params.installerId = user.id;
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

  useEffect(() => {
    if (user?.storeId && !isInstaller) {
      api.get(`/stores/${user.storeId}`)
        .then((res: any) => setStoreStaff(res.users || []))
        .catch(() => {});
    }
  }, [user?.storeId, isInstaller]);

  /** 分配安装工 */
  const handleAssign = async (orderId: string, assigneeId: string) => {
    try {
      await api.post(`/orders/${orderId}/assign`, { installerId: assigneeId });
      setOrders((prev) =>
        prev.map((item) =>
          item.id === orderId ? { ...item, installer: storeStaff.find((s) => s.id === assigneeId), status: 'INSTALLING' } : item,
        ),
      );
      setAssigningId(null);
      Taro.showToast({ title: '已分配安装工', icon: 'success' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
  };

  /** 标记完工 */
  const handleComplete = async (orderId: string) => {
    try {
      await Taro.showModal({ title: '确认完工', content: '确定该订单已施工完成？' });
      await api.put(`/orders/${orderId}`, { status: 'COMPLETED' });
      setOrders((prev) =>
        prev.map((item) => (item.id === orderId ? { ...item, status: 'COMPLETED' } : item)),
      );
      Taro.showToast({ title: '已标记完工', icon: 'success' });
    } catch (e: any) {
      if (e?.errMsg !== 'showModal:fail cancel') {
        Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
      }
    }
  };

  if (!user || !requireBusinessLogin()) {
    return <View className='cl-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>加载中...</Text></View>;
  }

  const isInstaller = (user.role || '').includes('INSTALLER');

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

              {/* 操作按钮 - 仅门店端显示 */}
              {!isInstaller && (
              <View className='bo-card-actions'>
                {item.status === 'PENDING' && (
                  <>
                    {assigningId === item.id ? (
                      <View className='bo-assign-panel'>
                        <Text className='bo-assign-hint'>选择安装工</Text>
                        {storeStaff
                          .filter((s: any) => (s.role || '').includes('INSTALLER'))
                          .map((staff: any) => (
                            <View
                              key={staff.id}
                              className='bo-assign-item'
                              onClick={() => handleAssign(item.id, staff.id)}
                            >
                              <Text className='bo-assign-name'>{staff.name}</Text>
                              <Text className='bo-assign-role'>安装工</Text>
                            </View>
                          ))}
                        {storeStaff.filter((s: any) => (s.role || '').includes('INSTALLER')).length === 0 && (
                          <Text className='bo-assign-empty'>暂无安装工</Text>
                        )}
                        <View className='bo-assign-cancel' onClick={() => setAssigningId(null)}>
                          <Text>取消</Text>
                        </View>
                      </View>
                    ) : (
                      <>
                        <View className='btn-primary bo-action-btn' onClick={() => setAssigningId(item.id)}>
                          <Icon name='user' size={26} color='#ffffff' />
                          <Text>分配工人</Text>
                        </View>
                        <View className='bo-action-btn btn-disabled' onClick={() => Taro.showToast({ title: '请先分配安装工', icon: 'none' })}>
                          <Icon name='tools' size={26} color='#9ca3af' />
                          <Text>开工</Text>
                        </View>
                      </>
                    )}
                  </>
                )}
                {item.status === 'INSTALLING' && (
                  <>
                    <View className='btn-success bo-action-btn' onClick={() => handleComplete(item.id)}>
                      <Icon name='check' size={26} color='#ffffff' />
                      <Text>确认完工</Text>
                    </View>
                    <View
                      className='btn-secondary bo-action-btn'
                      onClick={() => Taro.navigateTo({ url: `/subpackages/business/order-manage/index?id=${item.id}` })}
                    >
                      <Icon name='edit' size={26} color='#122b4d' />
                      <Text>编辑</Text>
                    </View>
                  </>
                )}
                {item.status === 'COMPLETED' && (
                  <View className='bo-card-done-tag'>
                    <Icon name='check-circle' size={28} color='#059669' />
                    <Text className='done-text'>订单已完成</Text>
                  </View>
                )}
              </View>
              )}
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
