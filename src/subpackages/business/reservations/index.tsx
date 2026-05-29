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
  const [assigningId, setAssigningId] = useState<string | null>(null);

  useEffect(() => {
    if (!requireBusinessLogin()) return;

    const params: any = {};
    if (user?.storeId) params.storeId = user.storeId;
    if (activeTab) params.status = activeTab;

    api.get('/measurements', params)
      .then((res: any) => setList(res || []))
      .catch(() => setList([]));
  }, [user, activeTab]);

  useEffect(() => {
    if (user?.storeId) {
      api.get(`/stores/${user.storeId}`)
        .then((res: any) => setStoreStaff(res.users || []))
        .catch(() => {});
    }
  }, [user?.storeId]);

  /** 分配量尺人员 */
  const handleAssign = async (reservationId: string, assigneeId: string) => {
    try {
      await api.post(`/measurements/${reservationId}/assign`, { assigneeId });
      setList((prev) =>
        prev.map((item) =>
          item.id === reservationId ? { ...item, assignee: storeStaff.find((s) => s.id === assigneeId), status: 'ASSIGNED' } : item,
        ),
      );
      setAssigningId(null);
      Taro.showToast({ title: '已分配', icon: 'success' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    }
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

  if (!user || !requireBusinessLogin()) return null;

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
                    {assigningId === item.id ? (
                      <View className='br-assign-panel'>
                        {storeStaff
                          .filter((s: any) => s.role === 'STORE_MANAGER' || s.role === 'INSTALLER')
                          .map((staff: any) => (
                            <View
                              key={staff.id}
                              className='br-assign-item'
                              onClick={() => handleAssign(item.id, staff.id)}
                            >
                              <Text className='br-assign-name'>{staff.name}</Text>
                              <Text className='br-assign-role'>{staff.role === 'STORE_MANAGER' ? '店长' : '安装工'}</Text>
                            </View>
                          ))}
                        {storeStaff.filter((s: any) => s.role === 'STORE_MANAGER' || s.role === 'INSTALLER').length === 0 && (
                          <Text className='br-assign-empty'>暂无可用员工</Text>
                        )}
                        <View className='br-assign-cancel' onClick={() => setAssigningId(null)}>
                          <Text>取消</Text>
                        </View>
                      </View>
                    ) : (
                      <View className='btn-outline br-action-btn' onClick={() => setAssigningId(item.id)}>
                        <Text>分配人员</Text>
                      </View>
                    )}
                  </>
                )}
                {item.status === 'ASSIGNED' && (
                  <View className='btn-outline br-action-btn' onClick={() => handleMeasured(item.id)}>
                    <Text>标记已量尺</Text>
                  </View>
                )}
                {item.status !== 'CANCELED' && (
                  <View
                    className='btn-ghost br-action-btn'
                    onClick={() => Taro.navigateTo({ url: `/subpackages/business/order-manage/index?reservationId=${item.id}` })}
                  >
                    <Text>转为订单</Text>
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
