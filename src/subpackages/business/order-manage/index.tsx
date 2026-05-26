import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import { orderStatusMap } from '../../../constants/status';
import './index.scss';

export default function OrderManage() {
  const router = useRouter();
  const id = router.params.id;
  const [order, setOrder] = useState<any>(null);
  const [isCreate, setIsCreate] = useState(!id);

  useEffect(() => {
    if (id) {
      api.get(`/orders/${id}`)
        .then((res: any) => setOrder(res))
        .catch(() => setOrder(null));
    }
  }, [id]);

  if (isCreate) {
    return <CreateOrderForm onDone={() => Taro.navigateBack()} />;
  }

  if (!order) {
    return <View className='loading'><Text className='loading-text'>加载中...</Text></View>;
  }

  return <OrderDetailView order={order} />;
}

// 创建订单表单
function CreateOrderForm({ onDone }: { onDone: () => void }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    clientName: '', clientPhone: '', communityName: '', installAddress: '',
    productName: '', totalAmount: '', paidAmount: '', warrantyYears: '5',
    scheduledInstallDate: '', remarks: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.clientName || !form.clientPhone || !form.installAddress) {
      Taro.showToast({ title: '请填写必填项', icon: 'none' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/orders', {
        ...form,
        totalAmount: parseFloat(form.totalAmount) || 0,
        paidAmount: parseFloat(form.paidAmount) || 0,
        warrantyYears: parseInt(form.warrantyYears) || 5,
        storeId: user?.storeId,
        status: 'PENDING',
      });
      Taro.showToast({ title: '创建成功', icon: 'success' });
      setTimeout(onDone, 1000);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '创建失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  return (
    <View className='om-form-page'>
      <Text className='om-form-title'>录入线下订单</Text>
      <View className='om-form'>
        {[
          { label: '客户姓名 *', key: 'clientName', placeholder: '请输入客户姓名' },
          { label: '客户电话 *', key: 'clientPhone', placeholder: '请输入客户电话' },
          { label: '产品名称', key: 'productName', placeholder: '例如：S100 内开窗' },
          { label: '小区名称', key: 'communityName', placeholder: '请输入小区名称' },
          { label: '施工地址 *', key: 'installAddress', placeholder: '请输入详细施工地址' },
        ].map((f) => (
          <View key={f.key} className='om-field'>
            <Text className='om-label'>{f.label}</Text>
            <View className='om-input-wrap'>
              <input className='om-input' placeholder={f.placeholder} value={(form as any)[f.key]} onInput={(e) => update(f.key, e.detail.value)} />
            </View>
          </View>
        ))}
        <View className='om-row'>
          <View className='om-field om-half'>
            <Text className='om-label'>订单金额</Text>
            <View className='om-input-wrap'><input className='om-input' type='digit' placeholder='0' value={form.totalAmount} onInput={(e) => update('totalAmount', e.detail.value)} /></View>
          </View>
          <View className='om-field om-half'>
            <Text className='om-label'>已付金额</Text>
            <View className='om-input-wrap'><input className='om-input' type='digit' placeholder='0' value={form.paidAmount} onInput={(e) => update('paidAmount', e.detail.value)} /></View>
          </View>
        </View>
        <View className='om-row'>
          <View className='om-field om-half'>
            <Text className='om-label'>质保年限</Text>
            <View className='om-input-wrap'><input className='om-input' type='number' placeholder='5' value={form.warrantyYears} onInput={(e) => update('warrantyYears', e.detail.value)} /></View>
          </View>
          <View className='om-field om-half'>
            <Text className='om-label'>预计安装日期</Text>
            <View className='om-input-wrap'><input className='om-input' placeholder='2026-06-01' value={form.scheduledInstallDate} onInput={(e) => update('scheduledInstallDate', e.detail.value)} /></View>
          </View>
        </View>
        <View className='om-field'>
          <Text className='om-label'>备注</Text>
          <View className='om-input-wrap'><textarea className='om-textarea' placeholder='备注说明' value={form.remarks} onInput={(e) => update('remarks', e.detail.value)} /></View>
        </View>
        <View className={`btn-primary om-submit ${loading ? 'opacity-50' : ''}`} onClick={handleSubmit}>
          <Text>{loading ? '提交中...' : '创建订单'}</Text>
        </View>
      </View>
    </View>
  );
}

// 订单详情
function OrderDetailView({ order: initialOrder }: { order: any }) {
  const { user } = useAuth();
  const [order, setOrder] = useState(initialOrder);
  const [installers, setInstallers] = useState<any[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [selectedInstaller, setSelectedInstaller] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    // 加载门店安装工列表
    if (user?.storeId) {
      api.get(`/stores/${user.storeId}`)
        .then((res: any) => {
          const list = (res.users || []).filter((u: any) => u.role === 'INSTALLER');
          setInstallers(list);
        })
        .catch(() => {});
    }
  }, [user?.storeId]);

  /** 分配安装工并开工 */
  const handleAssign = async () => {
    if (!selectedInstaller) {
      Taro.showToast({ title: '请选择安装工', icon: 'none' });
      return;
    }
    setActionLoading(true);
    try {
      const updated = await api.put(`/orders/${order.id}`, {
        installerId: selectedInstaller,
        status: 'INSTALLING',
      });
      setOrder(updated);
      setShowAssign(false);
      Taro.showToast({ title: '已分配并开工', icon: 'success' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  /** 无需分配，直接开工 */
  const handleStartInstall = async () => {
    setActionLoading(true);
    try {
      const updated = await api.put(`/orders/${order.id}`, { status: 'INSTALLING' });
      setOrder(updated);
      Taro.showToast({ title: '已开工', icon: 'success' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally {
      setActionLoading(false);
    }
  };
  const handleComplete = async () => {
    setActionLoading(true);
    try {
      const updated = await api.put(`/orders/${order.id}`, { status: 'COMPLETED' });
      setOrder(updated);
      Taro.showToast({ title: '已完工', icon: 'success' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const isOwnerOrManager = user?.role === 'STORE_OWNER' || user?.role === 'STORE_MANAGER';

  return (
    <View className='om-detail-page'>
      <View className='om-detail-header'>
        <Text className='om-detail-no'>{order.orderNo}</Text>
        <Text className='tag tag-brand'>{orderStatusMap[order.status]?.label || order.status}</Text>
      </View>

      {/* 操作区 */}
      {isOwnerOrManager && (
        <View className='om-actions-card'>
          {order.status === 'PENDING' && (
            <>
              {!showAssign ? (
                <View className='btn-primary om-action-btn' onClick={() => setShowAssign(true)}>
                  <Text>分配安装工</Text>
                </View>
              ) : (
                <View className='om-assign-panel'>
                  <Text className='om-section-title'>选择安装工</Text>
                  {installers.length === 0 ? (
                    <Text className='om-no-installer'>暂无安装工，请先通过员工认证添加</Text>
                  ) : (
                    <View className='om-installer-list'>
                      {installers.map((ins: any) => (
                        <View
                          key={ins.id}
                          className={`om-installer-item ${selectedInstaller === ins.id ? 'om-installer-active' : ''}`}
                          onClick={() => setSelectedInstaller(ins.id)}
                        >
                          <Text className='om-installer-name'>{ins.name}</Text>
                          <Text className='om-installer-phone'>{ins.phone || ''}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                  <View className='om-assign-actions'>
                    <View className='btn-ghost' onClick={() => { setShowAssign(false); setSelectedInstaller(''); }}>
                      <Text>取消</Text>
                    </View>
                    <View className={`btn-primary om-assign-confirm ${actionLoading ? 'opacity-50' : ''}`} onClick={handleAssign}>
                      <Text>{actionLoading ? '处理中...' : '确认分配并开工'}</Text>
                    </View>
                  </View>
                </View>
              )}
            </>
          )}
          {order.status === 'PENDING' && order.installer && (
            <View className={`btn-primary om-action-btn ${actionLoading ? 'opacity-50' : ''}`} onClick={handleStartInstall}>
              <Text>直接开工</Text>
            </View>
          )}
          {order.status === 'INSTALLING' && (
            <View className={`btn-primary om-action-btn ${actionLoading ? 'opacity-50' : ''}`} onClick={handleComplete}>
              <Text>{actionLoading ? '处理中...' : '标记完工'}</Text>
            </View>
          )}
        </View>
      )}

      <View className='om-detail-card'>
        <Text className='om-section-title'>基本信息</Text>
        {[
          { label: '产品', value: order.productName || '-' },
          { label: '客户', value: `${order.client?.name || order.clientName || '-'} ${order.client?.phone || order.clientPhone || ''}` },
          { label: '门店', value: order.store?.name || '-' },
          { label: '安装工', value: order.installer?.name || '未分配' },
          { label: '小区', value: order.communityName || '-' },
          { label: '地址', value: order.installAddress || '-' },
          { label: '金额', value: `¥${order.totalAmount?.toLocaleString() || 0}` },
          { label: '已付', value: `¥${order.paidAmount?.toLocaleString() || 0}` },
          { label: '质保', value: `${order.warrantyYears}年` },
        ].map((item) => (
          <View key={item.label} className='om-detail-row'>
            <Text className='om-detail-label'>{item.label}</Text>
            <Text className='om-detail-value'>{item.value}</Text>
          </View>
        ))}
      </View>

      {order.constructionLogs?.length > 0 && (
        <View className='om-logs-card'>
          <Text className='om-section-title'>施工日志 ({order.constructionLogs.length})</Text>
          {order.constructionLogs.map((log: any) => (
            <View key={log.id} className='om-log-item'>
              <View className='om-log-top'>
                <Text className='tag tag-brand'>{log.stage}</Text>
                <Text className='om-log-date'>{new Date(log.createdAt).toLocaleDateString('zh-CN')}</Text>
              </View>
              <Text className='om-log-text'>{log.content}</Text>
            </View>
          ))}
        </View>
      )}
      <View className='safe-bottom' />
    </View>
  );
}
