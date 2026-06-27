import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import { measurementStatusMap } from '../../../constants/status';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

const statusTabs = [
  { value: '', label: '全部' },
  { value: 'PENDING', label: '待处理' },
  { value: 'ASSIGNED', label: '已分配' },
  { value: 'MEASURED', label: '已量尺' },
];

export default function Reservations() {
  const { user, requireBusinessLogin } = useAuth();
  const [list, setList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('');
  const [storeStaff, setStoreStaff] = useState<any[]>([]);

  useEffect(() => {
    if (!requireBusinessLogin(undefined, 'STORE_OWNER,STORE_MANAGER')) return;

    const params: any = {};
    if (user?.storeId) params.storeId = user.storeId;
    if (activeTab) params.status = activeTab;

    api.get('/measurements', { ...params, pageSize: '100' })
      .then((res: any) => setList(res?.list || res || []))
      .catch(() => setList([]));
  }, [user, activeTab]);

  useEffect(() => {
    if (user?.storeId) {
      api.get(`/stores/${user.storeId}`)
        .then((res: any) => setStoreStaff(res.users || []))
        .catch(() => {});
    }
  }, [user?.storeId]);

  /** 分配量尺人员 - 使用选择器（仅安装工） */
  const handleAssignPicker = (reservationId: string) => {
    const installers = storeStaff.filter((s: any) => (s.role || '').includes('INSTALLER'));
    if (installers.length === 0) {
      Taro.showToast({ title: '暂无可用安装工', icon: 'none' });
      return;
    }
    Taro.showActionSheet({
      itemList: installers.map((s: any) => s.name),
      success: async (res) => {
        const assigneeId = installers[res.tapIndex].id;
        try {
          await api.post(`/measurements/${reservationId}/assign`, { assigneeId });
          setList((prev) =>
            prev.map((item) =>
              item.id === reservationId ? { ...item, assignee: storeStaff.find((s: any) => s.id === assigneeId), status: 'ASSIGNED' } : item,
            ),
          );
          Taro.showToast({ title: `已分配给 ${installers[res.tapIndex].name}`, icon: 'success' });
        } catch (e: any) {
          Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
        }
      },
    });
  };

  /** 标记已量尺 */
  const handleMeasured = async (reservationId: string) => {
    try {
      await api.put(`/measurements/${reservationId}`, { status: 'MEASURED' });
      setList((prev) =>
        prev.map((item) => (item.id === reservationId ? { ...item, status: 'MEASURED' } : item)),
      );
      Taro.showToast({ title: '已标记为已量尺', icon: 'success' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
  };

  if (!user || !requireBusinessLogin(undefined, 'STORE_OWNER,STORE_MANAGER')) {
    return <View className='cl-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>加载中...</Text></View>;
  }

  return (
    <ScrollView className='br-page' scrollY>
      <View className='br-header'>
        <Text className='br-header-title'>预约管理</Text>
        <Text className='br-header-desc'>管理{user.storeName || ''}门店的量尺预约</Text>
      </View>

      {/* 状态筛选 */}
      <View className='br-tabs'>
        {statusTabs.map((tab) => (
          <View
            key={tab.value}
            className={`br-tab ${activeTab === tab.value ? 'br-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.value)}
          >
            <Text className={`br-tab-text ${activeTab === tab.value ? 'br-tab-text-active' : ''}`}>{tab.label}</Text>
          </View>
        ))}
      </View>

      {/* 预约列表 */}
      <View className='br-list'>
        {list.map((item: any) => {
          const st = measurementStatusMap[item.status] || measurementStatusMap.PENDING;
          return (
            <View key={item.id} className='br-card'>
              <View className='br-card-top'>
                <Text className='br-card-name'>{item.contactName}</Text>
                <View className='br-card-status' style={{ background: st.bg }}>
                  <Text className='br-card-status-text'>{st.label}</Text>
                </View>
              </View>

              <View className='br-card-info'>
                <View className='br-info-row'>
                  <Icon name='phone' size={24} color='#9ca3af' />
                  <Text className='br-info-text'>{item.phone}</Text>
                </View>
                <View className='br-info-row'>
                  <Icon name='map-pin' size={24} color='#9ca3af' />
                  <Text className='br-info-text'>{item.address || item.communityName || '未填写地址'}</Text>
                </View>
                {item.houseArea && (
                  <View className='br-info-row'>
                    <Icon name='ruler' size={24} color='#9ca3af' />
                    <Text className='br-info-text'>{item.houseArea}㎡</Text>
                  </View>
                )}
                {item.assignee && (
                  <View className='br-info-row'>
                    <Icon name='user' size={24} color='#9ca3af' />
                    <Text className='br-info-text'>量尺人员：{item.assignee.name}</Text>
                  </View>
                )}
                {item.expectedDate && (
                  <View className='br-info-row'>
                    <Icon name='calendar' size={24} color='#9ca3af' />
                    <Text className='br-info-text'>期望日期：{item.expectedDate}</Text>
                  </View>
                )}
              </View>

              {item.remarks && <Text className='br-card-remark'>备注：{item.remarks}</Text>}

              {/* 操作按钮 */}
              <View className='br-card-actions'>
                {item.status === 'PENDING' && (
                  <>
                    <View className='btn-primary br-action-btn' onClick={() => handleAssignPicker(item.id)}>
                      <Icon name='ruler' size={26} color='#ffffff' />
                      <Text>安排量尺</Text>
                    </View>
                    <View
                      className='btn-secondary br-action-btn'
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (item.contactName) params.set('clientName', item.contactName.slice(0, 20));
                        if (item.phone) params.set('clientPhone', item.phone);
                        if (item.communityName) params.set('communityName', item.communityName.slice(0, 50));
                        if (item.address) params.set('installAddress', item.address.slice(0, 100));
                        Taro.navigateTo({ url: `/subpackages/business/order-manage/index?${params.toString()}` });
                      }}
                    >
                      <Icon name='add' size={26} color='#122b4d' />
                      <Text>转订单</Text>
                    </View>
                  </>
                )}
                {item.status === 'ASSIGNED' && (
                  <>
                    <View className='btn-success br-action-btn' onClick={() => handleMeasured(item.id)}>
                      <Icon name='check' size={26} color='#ffffff' />
                      <Text>已量尺</Text>
                    </View>
                    <View
                      className='btn-secondary br-action-btn'
                      onClick={() => {
                        const params = new URLSearchParams();
                        if (item.contactName) params.set('clientName', item.contactName.slice(0, 20));
                        if (item.phone) params.set('clientPhone', item.phone);
                        if (item.communityName) params.set('communityName', item.communityName.slice(0, 50));
                        if (item.address) params.set('installAddress', item.address.slice(0, 100));
                        Taro.navigateTo({ url: `/subpackages/business/order-manage/index?${params.toString()}` });
                      }}
                    >
                      <Icon name='add' size={26} color='#122b4d' />
                      <Text>转订单</Text>
                    </View>
                  </>
                )}
                {item.status === 'MEASURED' && (
                  <View
                    className='btn-primary br-action-btn btn-full'
                    onClick={() => {
                        const params = new URLSearchParams();
                        if (item.contactName) params.set('clientName', item.contactName.slice(0, 20));
                        if (item.phone) params.set('clientPhone', item.phone);
                        if (item.communityName) params.set('communityName', item.communityName.slice(0, 50));
                        if (item.address) params.set('installAddress', item.address.slice(0, 100));
                        Taro.navigateTo({ url: `/subpackages/business/order-manage/index?${params.toString()}` });
                      }}
                  >
                    <Icon name='clipboard' size={28} color='#ffffff' />
                    <Text>转为订单</Text>
                  </View>
                )}
                {item.status === 'CANCELED' && (
                  <View className='br-card-canceled-tag'>
                    <Text className='canceled-text'>已取消</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
        {list.length === 0 && (
          <View className='br-empty'>
            <Icon name='file-text' size={72} color='#d1d5db' />
            <Text className='br-empty-text'>暂无预约</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
