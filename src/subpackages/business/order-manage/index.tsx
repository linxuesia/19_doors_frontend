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
function OrderDetailView({ order }: { order: any }) {
  return (
    <View className='om-detail-page'>
      <View className='om-detail-header'>
        <Text className='om-detail-no'>{order.orderNo}</Text>
        <Text className='tag tag-brand'>{orderStatusMap[order.status]?.label || order.status}</Text>
      </View>

      <View className='om-detail-card'>
        <Text className='om-section-title'>基本信息</Text>
        {[
          { label: '产品', value: order.productName || '-' },
          { label: '客户', value: `${order.client?.name || '-'} ${order.client?.phone || ''}` },
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
