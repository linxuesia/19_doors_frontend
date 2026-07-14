import { useState, useEffect } from 'react';
import { View, Text, Picker, Input, Textarea, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import { orderStatusMap } from '../../../constants/status';
import { getStageLabel } from '../../../constants/construction-stages';
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

// 质保选项
const WARRANTY_OPTIONS = ['1', '2', '3', '5', '10', '15', '终身'];

// 创建订单表单
function CreateOrderForm({ onDone }: { onDone: () => void }) {
  const router = useRouter();
  const { user } = useAuth();
  // URL 参数需要手动 decode，Taro router.params 不会自动解码中文
  const decode = (v: string | undefined) => v ? decodeURIComponent(v) : '';
  const [form, setForm] = useState({
    clientName: decode(router.params.clientName), clientPhone: decode(router.params.clientPhone),
    communityName: decode(router.params.communityName), installAddress: decode(router.params.installAddress),
    productId: '', productName: '', productSeries: '',
    totalAmount: '', paidAmount: '', warrantyYears: '5',
    scheduledInstallDate: '', remarks: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
  });
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productIndex, setProductIndex] = useState(-1);
  const [warrantyIndex, setWarrantyIndex] = useState(3); // 默认'5'
  const [blueprintFiles, setBlueprintFiles] = useState<string[]>([]); // tmp file paths for preview
  const [blueprintUrls, setBlueprintUrls] = useState<string[]>([]);   // cloudUrl 用于 API 提交和显示
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/products?pageSize=200').then((res: any) => {
      const list = res?.list || (Array.isArray(res) ? res : []);
      setProducts(list);
    }).catch(() => {});
  }, []);

  const handleSelectProduct = (e: any) => {
    const idx = e.detail.value as number;
    const p = products[idx];
    if (p) {
      setProductIndex(idx);
      setForm({
        ...form,
        productId: p.id,
        productName: p.name,
        productSeries: p.series || '',
      });
    }
  };

  const handleSelectWarranty = (e: any) => {
    const idx = e.detail.value as number;
    setWarrantyIndex(idx);
    setForm({ ...form, warrantyYears: WARRANTY_OPTIONS[idx] });
  };

  const handleChooseBlueprint = () => {
    Taro.chooseImage({
      count: 6 - blueprintFiles.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newFiles = res.tempFilePaths;
        setBlueprintFiles([...blueprintFiles, ...newFiles]);
        // 开始上传到云存储
        uploadBlueprints(newFiles);
      },
    });
  };

  const uploadBlueprints = async (files: string[]) => {
    setUploading(true);
    try {
      const { uploadImages: uploadToCloud } = await import('../../../utils/cloud');
      const results = await uploadToCloud(files, 'order-blueprints');
      setBlueprintUrls([...blueprintUrls, ...results.map(r => r.fileID)]);
    } catch {
      Taro.showToast({ title: '图纸上传失败', icon: 'none' });
    } finally {
      setUploading(false);
    }
  };

  const removeBlueprint = (index: number) => {
    const newFiles = blueprintFiles.filter((_, i) => i !== index);
    const newIds = blueprintUrls.filter((_, i) => i !== index);
    setBlueprintFiles(newFiles);
    setBlueprintUrls(newIds);
  };

  const handleSubmit = async () => {
    if (!form.productName) {
      Taro.showToast({ title: '请选择产品', icon: 'none' });
      return;
    }
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
        warrantyYears: form.warrantyYears === '终身' ? 99 : (parseInt(form.warrantyYears) || 5),
        blueprintUrl: blueprintUrls.length > 0 ? JSON.stringify(blueprintUrls) : undefined,
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

  const chooseLocation = () => {
    Taro.chooseLocation({
      success: (res) => {
        setForm({
          ...form,
          communityName: res.name || form.communityName,
          installAddress: res.address || res.name || '',
          latitude: res.latitude,
          longitude: res.longitude,
        });
      },
      fail: () => {
        Taro.showToast({ title: '选择地址失败', icon: 'none' });
      },
    });
  };

  return (
    <View className='omf-page'>
      <ScrollView className='omf-scroll' scrollY enhanced showScrollbar={false}>
      <View className='omf-form'>
        {/* 卡片1：订单信息 */}
        <View className='omf-card'>
          <View className='omf-field'>
            <Text className='omf-label'>
              选择产品 <Text className='omf-required'>*</Text>
            </Text>
            <Picker mode='selector' range={products.map((p: any) => p.name)} value={productIndex} onChange={handleSelectProduct}>
              <View className='omf-picker'>
                <Text className={form.productName ? 'omf-picker-text' : 'omf-picker-text omf-picker-placeholder'}>
                  {form.productName || '请选择产品名称，如：S100内开窗'}
                </Text>
              </View>
            </Picker>
          </View>

          <View className='omf-field'>
            <Text className='omf-label'>
              上传图纸 <Text className='omf-required'>*</Text>
            </Text>
            <View className='omf-blueprint-grid'>
              {blueprintFiles.map((file, idx) => (
                <View key={idx} className='omf-blueprint-item'>
                  <View className='omf-blueprint-img-wrap'>
                    {/* eslint-disable-next-line jsx-a11y/alt-text */}
                    <Image className='omf-blueprint-img' src={file} mode='aspectFill' />
                  </View>
                  <View className='omf-blueprint-remove' onClick={() => removeBlueprint(idx)}>
                    <Text className='omf-blueprint-remove-icon'>✕</Text>
                  </View>
                </View>
              ))}
              {blueprintFiles.length < 6 && (
                <View className='omf-blueprint-add' onClick={handleChooseBlueprint}>
                  <Text className='omf-blueprint-add-icon'>+</Text>
                  <Text className='omf-blueprint-add-text'>添加图片</Text>
                </View>
              )}
            </View>
          </View>

          <View className='omf-row'>
            <View className='omf-field omf-half'>
              <Text className='omf-label'>
                订单金额(元) <Text className='omf-required'>*</Text>
              </Text>
              <View className='omf-input-wrap'>
                <Input className='omf-input' type='digit' placeholder='请输入订单金额' value={form.totalAmount} onInput={(e) => update('totalAmount', e.detail.value)} />
              </View>
            </View>
            <View className='omf-field omf-half'>
              <Text className='omf-label'>已付金额</Text>
              <View className='omf-input-wrap'>
                <Input className='omf-input' type='digit' placeholder='0' value={form.paidAmount} onInput={(e) => update('paidAmount', e.detail.value)} />
              </View>
            </View>
          </View>
        </View>

        {/* 卡片2：客户基本资料 */}
        <View className='omf-card'>
          <Text className='omf-section-title'>客户基本资料</Text>
          <View className='omf-field'>
            <Text className='omf-label'>
              客户姓名 <Text className='omf-required'>*</Text>
            </Text>
            <View className='omf-input-wrap'>
              <Input className='omf-input' placeholder='请输入客户姓名' value={form.clientName} onInput={(e) => update('clientName', e.detail.value)} />
            </View>
          </View>
          <View className='omf-field'>
            <Text className='omf-label'>
              联系电话 <Text className='omf-required'>*</Text>
            </Text>
            <View className='omf-input-wrap'>
              <Input className='omf-input' type='number' placeholder='请输入手机号码' value={form.clientPhone} onInput={(e) => update('clientPhone', e.detail.value)} />
            </View>
          </View>
          <View className='omf-field'>
            <Text className='omf-label'>小区名称</Text>
            <View className='omf-input-wrap'>
              <Input className='omf-input' placeholder='请输入小区名称' value={form.communityName} onInput={(e) => update('communityName', e.detail.value)} />
            </View>
          </View>
          <View className='omf-field'>
            <Text className='omf-label'>
              施工地址 <Text className='omf-required'>*</Text>
            </Text>
            <View className='omf-textarea-wrap'>
              <Textarea className='omf-textarea' placeholder='请输入详细施工地址（省市区+详细地址）' value={form.installAddress} onInput={(e) => update('installAddress', e.detail.value)} />
            </View>
            <View className='omf-location-btn' onClick={chooseLocation}>
              <Icon name='map-pin' size={28} color='#122b4d' />
              <Text className='omf-location-btn-text'>从地图选择地址</Text>
            </View>
          </View>
          <View className='omf-field'>
            <Text className='omf-label'>预计安装日期</Text>
            <Picker mode='date' value={form.scheduledInstallDate} onChange={(e) => update('scheduledInstallDate', e.detail.value)}>
              <View className='omf-picker'>
                <Text className={form.scheduledInstallDate ? 'omf-picker-text' : 'omf-picker-placeholder'}>
                  {form.scheduledInstallDate || '请选择日期'}
                </Text>
                <Icon name='calendar' size={28} color='#9ca3af' />
              </View>
            </Picker>
          </View>
        </View>

        {/* 卡片3：质保与备注 */}
        <View className='omf-card'>
          <View className='omf-field'>
            <Text className='omf-label'>
              质保时长 <Text className='omf-required'>*</Text>
            </Text>
            <Picker mode='selector' range={WARRANTY_OPTIONS.map(o => o === '终身' ? o : `${o}年质保`)} value={warrantyIndex} onChange={handleSelectWarranty}>
              <View className='omf-picker'>
                <Text className='omf-picker-text'>
                  {WARRANTY_OPTIONS[warrantyIndex] === '终身' ? '终身质保' : `${WARRANTY_OPTIONS[warrantyIndex]}年质保`}
                </Text>
                <Text className='omf-picker-arrow'>›</Text>
              </View>
            </Picker>
          </View>
          <View className='omf-field'>
            <Text className='omf-label'>备注说明</Text>
            <View className='omf-textarea-wrap'>
              <Textarea className='omf-textarea' placeholder='可输入其他补充信息...' value={form.remarks} onInput={(e) => update('remarks', e.detail.value)} />
            </View>
          </View>
        </View>
      </View>
      </ScrollView>

      {/* 固定底部提交栏 */}
      <View className='omf-bottom-bar'>
        <View className={`omf-submit-btn ${loading ? 'omf-submit-disabled' : ''}`} onClick={handleSubmit}>
          <Text className='omf-submit-text'>{loading ? '提交中...' : '提交保存'}</Text>
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
    // 加载门店安装工程师列表
    if (user?.storeId) {
      api.get(`/stores/${user.storeId}`)
        .then((res: any) => {
          const list = (res.users || []).filter((u: any) => (u.role || '').includes('INSTALLER'));
          setInstallers(list);
        })
        .catch(() => {});
    }
  }, [user?.storeId]);

  /** 分配安装工程师并开工 */
  const handleAssign = async () => {
    if (!selectedInstaller) {
      Taro.showToast({ title: '请选择安装工程师', icon: 'none' });
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
    const res = await Taro.showModal({ title: '确认完工', content: '确定该订单已施工完成？' });
    if (!res.confirm) return;
    setActionLoading(true);
    try {
      const updated = await api.put(`/orders/${order.id}`, { status: 'COMPLETED' });
      setOrder(updated);
      Taro.showToast({ title: '已完工', icon: 'success' });
      if (updated?.caseId) {
        setTimeout(() => Taro.redirectTo({ url: `/subpackages/business/case-edit/index?id=${updated.caseId}` }), 800);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '操作失败', icon: 'none' });
    } finally {
      setActionLoading(false);
    }
  };

  const isOwnerOrManager = (user?.role || '').includes('STORE_OWNER') || (user?.role || '').includes('STORE_MANAGER');
  
  // 判断是否有可操作的按钮（只有待分配/施工中状态有操作）
  const hasActions = order.status === 'PENDING' || order.status === 'INSTALLING';

  return (
    <View className='om-detail-page'>
      <View className='om-detail-header'>
        <Text className='om-detail-no'>{order.orderNo}</Text>
        <Text className='tag tag-brand'>{orderStatusMap[order.status]?.label || order.status}</Text>
      </View>

      {/* 操作区 - 只有有权限且有可操作状态时才显示 */}
      {isOwnerOrManager && hasActions && (
        <View className='om-actions-card'>
          {order.status === 'PENDING' && (
            <>
              {!showAssign ? (
                <View className='btn-primary om-action-btn' onClick={() => setShowAssign(true)}>
                  <Text>分配安装工程师</Text>
                </View>
              ) : (
                <View className='om-assign-panel'>
                  <Text className='om-section-title'>选择安装工程师</Text>
                  {installers.length === 0 ? (
                    <Text className='om-no-installer'>暂无安装工程师，请先通过员工认证添加</Text>
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
          { label: '安装工程师', value: order.installer?.name || '未分配' },
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
                <Text className='tag tag-brand'>{getStageLabel(log.stage)}</Text>
                <Text className='om-log-date'>{new Date(log.createdAt).toLocaleDateString('zh-CN')}</Text>
              </View>
              <Text className='om-log-text'>{log.content}</Text>
              {log.images?.length > 0 && (
                <View className='om-log-images'>
                  {log.images.map((img: string, idx: number) => (
                    <View key={idx} className='om-log-img-wrap' onClick={() => Taro.previewImage({ current: img, urls: log.images })}>
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <Image className='om-log-img' src={img} mode='aspectFill' />
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
      <View className='safe-bottom' />
    </View>
  );
}
