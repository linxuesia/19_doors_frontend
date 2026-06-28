import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

interface TaskItem {
  id: string;
  type: 'measurement' | 'order';
  status: string;
  orderNo?: string;
  installAddress?: string;
  communityName?: string;
  contactName?: string;
  phone?: string;
  productName?: string;
  houseArea?: string;
  expectedDate?: string;
  client?: { name: string; phone: string };
  createdAt?: string;
  assignee?: { name: string };
}

const typeTabs = [
  { value: '', label: '全部' },
  { value: 'measurement', label: '量尺' },
  { value: 'order', label: '施工' },
];

const statusTabs = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待处理' },
  { value: 'ASSIGNED', label: '已分配' },
  { value: 'INSTALLING', label: '进行中' },
  { value: 'MEASURED', label: '已完成' },
];

// 安装工程师订单列表页面
export default function InstallerOrders() {
  const { user, requireBusinessLogin } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeType, setActiveType] = useState('');
  const [activeStatus, setActiveStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({ total: 0, pending: 0, doing: 0, completed: 0 });

  useEffect(() => {
    if (!requireBusinessLogin(undefined, 'INSTALLER')) return;
    setPage(1);
    loadStats();
  }, [user, activeType, activeStatus]);

  useEffect(() => {
    if (!user || !(user.role || '').includes('INSTALLER')) return;
    setLoading(true);

    const baseParams = { page: String(page), pageSize: '20', installerId: user.id };

    // 状态映射：前端「已完成」tab 对应订单 COMPLETED / 量尺 MEASURED
    const orderStatus = activeStatus === 'MEASURED' ? 'COMPLETED' : (activeStatus || undefined);
    const measureStatus = activeStatus === 'INSTALLING' ? 'ASSIGNED' : (activeStatus || undefined);

    Promise.all([
      (!activeType || activeType === 'order')
        ? api.get('/orders', { ...baseParams, status: orderStatus }).catch(() => ({ list: [] }))
        : Promise.resolve({ list: [] }),
      (!activeType || activeType === 'measurement')
        ? api.get('/measurements', { ...baseParams, status: measureStatus }).catch(() => ({ list: [] }))
        : Promise.resolve({ list: [] }),
    ])
      .then(([ordersRes, measurementsRes]) => {
        const orderList = ((ordersRes?.list || []) as any[]).map((item: any) => ({
          ...item,
          type: 'order' as const,
          contactName: item.client?.name,
          phone: item.client?.phone,
        }));
        const measureList = ((measurementsRes?.list || (Array.isArray(measurementsRes) ? measurementsRes : [])) as any[]).map((item: any) => ({
          ...item,
          type: 'measurement' as const,
          orderNo: `M${String(item.id).padStart(5, '0')}`,
          installAddress: item.address || item.communityName,
        }));

        let combined = [...orderList, ...measureList];
        if (activeStatus) {
          if (activeStatus === 'INSTALLING') {
            combined = combined.filter((t) =>
              t.type === 'order' ? t.status === 'INSTALLING' : t.status === 'ASSIGNED',
            );
          } else if (activeStatus === 'MEASURED') {
            combined = combined.filter((t) =>
              t.type === 'order' ? t.status === 'COMPLETED' : t.status === 'MEASURED',
            );
          } else {
            combined = combined.filter((t) => t.status === activeStatus);
          }
        }

        if (page === 1) {
          setTasks(combined);
        } else {
          setTasks((prev) => [...prev, ...combined]);
        }
        setHasMore(combined.length >= 20);
      })
      .finally(() => setLoading(false));
  }, [user, activeType, activeStatus, page]);

  const loadStats = async () => {
    try {
      const [ordersRes, measuresRes] = await Promise.all([
        api.get('/orders/stats', { installerId: user?.id }).catch(() => ({})),
        api.get('/measurements', { installerId: user?.id, pageSize: '100' }).catch(() => ({ list: [] })),
      ]);
      const orders = ordersRes || {};
      const measures = (measuresRes?.list || (Array.isArray(measuresRes) ? measuresRes : [])) as any[];
      setStats({
        total: (orders.total || 0) + (measuresRes?.total || measures.length),
        pending: (orders.pending || 0) + measures.filter((m: any) => m.status === 'PENDING').length,
        doing: (orders.installing || 0) + measures.filter((m: any) => m.status === 'ASSIGNED').length,
        completed: (orders.completed || 0) + measures.filter((m: any) => m.status === 'MEASURED').length,
      });
    } catch {}
  };

  if (!user || !requireBusinessLogin(undefined, 'INSTALLER')) {
    return <View className='cl-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>加载中...</Text></View>;
  }

  const handleCardClick = (task: TaskItem) => {
    if (task.type === 'measurement') {
      Taro.navigateTo({
        url: `/subpackages/business/installer-order-detail/index?id=${task.id}&type=measurement`,
      });
    } else {
      Taro.navigateTo({
        url: `/subpackages/business/installer-order-detail/index?id=${task.id}&type=order`,
      });
    }
  };

  const getStatusConfig = (task: TaskItem) => {
    if (task.type === 'measurement') {
      switch (task.status) {
        case 'PENDING':
          return { label: '待量尺', class: 'io-card-pending', statusClass: 'io-status-pending' };
        case 'ASSIGNED':
          return { label: '已分配', class: 'io-card-assigned', statusClass: 'io-status-assigned' };
        case 'MEASURED':
          return { label: '已量尺', class: 'io-card-completed', statusClass: 'io-status-completed' };
        default:
          return { label: task.status, class: 'io-card-pending', statusClass: 'io-status-pending' };
      }
    }
    switch (task.status) {
      case 'PENDING':
        return { label: '待接工', class: 'io-card-pending', statusClass: 'io-status-pending' };
      case 'ASSIGNED':
        return { label: '特派工', class: 'io-card-assigned', statusClass: 'io-status-assigned' };
      case 'INSTALLING':
        return { label: '施工中', class: 'io-card-installing', statusClass: 'io-status-installing' };
      case 'COMPLETED':
        return { label: '已完成', class: 'io-card-completed', statusClass: 'io-status-completed' };
      default:
        return { label: task.status, class: 'io-card-pending', statusClass: 'io-status-pending' };
    }
  };

  return (
    <ScrollView className='io-page' scrollY>
      {/* 头部区域 */}
      <View className='io-header'>
        <Text className='io-header-title'>我的任务</Text>
        <Text className='io-header-desc'>管理您的量尺与安装任务</Text>

        {/* 统计信息 */}
        <View className='io-stats'>
          <View className='io-stat-item'>
            <Text className='io-stat-num'>{stats.total}</Text>
            <Text className='io-stat-label'>全部</Text>
          </View>
          <View className='io-stat-item'>
            <Text className='io-stat-num'>{stats.pending}</Text>
            <Text className='io-stat-label'>待处理</Text>
          </View>
          <View className='io-stat-item'>
            <Text className='io-stat-num'>{stats.doing}</Text>
            <Text className='io-stat-label'>进行中</Text>
          </View>
          <View className='io-stat-item'>
            <Text className='io-stat-num'>{stats.completed}</Text>
            <Text className='io-stat-label'>已完成</Text>
          </View>
        </View>
      </View>

      {/* 任务类型筛选 */}
      <View className='io-tabs-container'>
        <View className='io-tabs'>
          {typeTabs.map((tab) => (
            <View
              key={tab.value}
              className={`io-tab ${activeType === tab.value ? 'io-tab-active' : ''}`}
              onClick={() => setActiveType(tab.value)}
            >
              <Text className={`io-tab-text ${activeType === tab.value ? 'io-tab-text-active' : ''}`}>{tab.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 状态筛选 */}
      <View className='io-tabs-container'>
        <View className='io-tabs io-tabs-sm'>
          {statusTabs.map((tab) => (
            <View
              key={tab.value}
              className={`io-tab ${activeStatus === tab.value ? 'io-tab-active' : ''}`}
              onClick={() => setActiveStatus(tab.value)}
            >
              <Text className={`io-tab-text ${activeStatus === tab.value ? 'io-tab-text-active' : ''}`}>{tab.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 任务列表 */}
      <View className='io-list'>
        {tasks.map((item) => {
          const config = getStatusConfig(item);
          const isPending = item.status === 'PENDING' || (item.type === 'measurement' && item.status === 'ASSIGNED');
          const titleText = (() => {
            const name = item.contactName || item.client?.name || '未知客户';
            const community = item.communityName || '';
            return community ? `${name} · ${community}` : name;
          })();

          return (
            <View
              key={`${item.type}-${item.id}`}
              className={`io-card ${config.class} ${isPending ? 'io-card-urgent' : ''}`}
              onClick={() => handleCardClick(item)}
            >
              {/* 卡片顶部：标题行（客户+小区）+ 状态标签 */}
              <View className='io-card-top'>
                <View className='io-title-row'>
                  {isPending && (
                    <View className='io-urgent-dot' />
                  )}
                  <Text className={`io-card-title-text ${isPending ? 'io-title-bold' : ''}`}>{titleText}</Text>
                </View>
                <View className={`io-card-status ${config.statusClass}`}>
                  <Text>{config.label}</Text>
                </View>
              </View>

              {/* 类型标签 + 地址信息（同一行，标签不挤压状态） */}
              <View className='io-card-sub-row'>
                <View className={`io-type-badge ${item.type === 'measurement' ? 'io-badge-measure' : 'io-badge-order'}`}>
                  <Icon name={item.type === 'measurement' ? 'ruler' : 'package'} size={20} color='#ffffff' />
                  <Text>{item.type === 'measurement' ? '量尺' : '施工'}</Text>
                </View>
                <View className='io-card-address'>
                  <Icon name='map-pin' size={24} color='#9ca3af' />
                  <Text className='io-addr-text'>{item.installAddress || item.communityName || '未填写地址'}</Text>
                </View>
              </View>

              {/* 附加信息：面积/产品 */}
              {(item.type === 'measurement' && item.houseArea) && (
                <View className='io-card-extra'>
                  <Icon name='home' size={20} color='#7c3aed' />
                  <Text>{item.houseArea}㎡</Text>
                </View>
              )}
              {(item.type === 'order' && item.productName) && (
                <View className='io-card-extra'>
                  <Icon name='package' size={20} color='#15803d' />
                  <Text>{item.productName}</Text>
                </View>
              )}

              {/* 底部：客户电话 + 时间 */}
              <View className='io-card-footer'>
                <Text className='io-footer-phone'>{item.phone || item.client?.phone}</Text>
                <Text className='io-footer-time'>{item.expectedDate || item.createdAt ? formatShortTime(item.expectedDate || item.createdAt) : '-'}</Text>
              </View>
            </View>
          );
        })}

        {/* 空状态 */}
        {tasks.length === 0 && !loading && (
          <View className='io-empty'>
            <View className='io-empty-icon'>
              <Icon name='clipboard-list' size={80} color='#cbd5e1' />
            </View>
            <Text className='io-empty-text'>暂无任务</Text>
            <Text className='io-empty-subtext'>新的量尺和安装任务会在这里显示</Text>
          </View>
        )}

        {loading && <View className='io-load-more'><Text className='io-load-more-text'>加载中...</Text></View>}
        {hasMore && !loading && (
          <View className='io-load-more' onClick={() => setPage((p) => p + 1)}>
            <Text className='io-load-more-text'>加载更多</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}

function formatShortTime(timeStr?: string): string {
  if (!timeStr) return '-';
  try {
    const date = new Date(timeStr);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  } catch {
    return '-';
  }
}
