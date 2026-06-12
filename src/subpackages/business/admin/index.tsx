import { useState, useEffect, Component } from 'react';
import { View, Text, ScrollView, Image, Input, Canvas, Video } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import { productionStatusMap, productionStatusOrder } from '../../../constants/status';
import './index.scss';

// 错误边界 - 捕获渲染异常避免白屏
class ErrorBoundary extends Component<{ children: React.ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  componentDidCatch(error: Error, info: any) {
    console.error('[Admin] render error:', error, info);
    this.setState({ error });
  }
  render() {
    if (this.state.error) {
      return <View style='padding:100rpx 40rpx;display:flex;flex-direction:column;align-items:center;gap:24rpx'>
        <Text style='font-size:32rpx;color:#ef4444;font-weight:700'>页面加载异常</Text>
        <Text style='font-size:24rpx;color:#6b7280;word-break:break-all;text-align:center'>{this.state.error.message}</Text>
      </View>;
    }
    return this.props.children as any;
  }
}

const mainModules = [
  {
    icon: 'building',
    title: '门店账号管理',
    desc: '查看和管理所有门店账号',
    key: 'stores',
    color: '#122b4d',
  },
  {
    icon: 'clipboard',
    title: '门店开通审核',
    desc: '处理门店入驻申请审批',
    key: 'applications',
    color: '#1b3e6c',
  },
  {
    icon: 'image',
    title: '全国案例管理',
    desc: '管理所有门店发布的案例',
    key: 'cases',
    color: '#2b5a8e',
  },
  {
    icon: 'package',
    title: '生产进度管理',
    desc: '按手机号查订单，更新生产状态',
    key: 'production',
    color: '#7c3aed',
  },
  {
    icon: 'play-circle',
    title: '首页展示视频管理',
    desc: '上传与管理产品说明视频',
    key: 'videos',
    color: '#059669',
  },
  {
    icon: 'package',
    title: '产品管理',
    desc: '管理产品目录与检测报告',
    key: 'products',
    color: '#0ea5e9',
  },
];

function Admin() {
  const { user, requireBusinessLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ stores: 0, todayNew: 0, pendingApps: 0, activeCases: 0 });
  const [stores, setStores] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);

  // 生产进度
  const [prodPhone, setProdPhone] = useState('');
  const [prodOrders, setProdOrders] = useState<any[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [prodSearched, setProdSearched] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // 首页展示视频管理
  const [videos, setVideos] = useState<any[]>([]);
  const [videoUploading, setVideoUploading] = useState(false);

  // 案例二维码
  const [qrcodeModal, setQrcodeModal] = useState<any>(null);
  const [qrcodeBase64, setQrcodeBase64] = useState('');
  const [qrcodeLoading, setQrcodeLoading] = useState(false);
  const [qrcodeSaving, setQrcodeSaving] = useState(false);

  useEffect(() => {
    if (!requireBusinessLogin('/subpackages/business/admin-login/index')) return;

    Promise.all([
      api.get('/stores?pageSize=100').then((r: any) => r?.list || r).catch(() => []),
      api.get('/stores/applications/list?status=PENDING').catch(() => []),
      api.get('/cases?published=true&pageSize=1').then((r: any) => r?.list || r).catch(() => []),
    ]).then(([s, a, c]) => {
      const storeList = (s as any) || [];
      const appList = (a as any) || [];
      const caseList = (c as any) || [];
      setStores(storeList);
      setApplications(appList);
      setCases(caseList);
      setStats({
        stores: storeList.length,
        todayNew: storeList.filter((st: any) => {
          const d = new Date(st.createdAt);
          return d.toDateString() === new Date().toDateString();
        }).length,
        pendingApps: appList.length,
        activeCases: caseList.length,
      });
    });
  }, []);

  if (!user || !requireBusinessLogin('/subpackages/business/admin-login/index')) {
    return <View className='admin-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>加载中...</Text></View>;
  }

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/stores/applications/${id}/review`, { status: 'APPROVED' });
      Taro.showToast({ title: '已通过', icon: 'success' });
      setApplications(applications.filter((a) => a.id !== id));
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const handleReject = async (id: string) => {
    try {
      await api.put(`/stores/applications/${id}/review`, { status: 'REJECTED' });
      Taro.showToast({ title: '已驳回', icon: 'success' });
      setApplications(applications.filter((a) => a.id !== id));
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  // 案例管理 - 发布/下架切换
  const handleToggleCasePublish = async (caseItem: any) => {
    try {
      const newStatus = !caseItem.isPublished;
      await api.put(`/cases/${caseItem.id}`, { isPublished: newStatus });
      Taro.showToast({
        title: newStatus ? '已发布' : '已下架',
        icon: 'success'
      });
      setCases(cases.map((c) =>
        c.id === caseItem.id ? { ...c, isPublished: newStatus } : c
      ));
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  // 生产进度 - 按手机号搜索订单
  const handleSearchOrders = async () => {
    if (!prodPhone || prodPhone.length < 11) {
      Taro.showToast({ title: '请输入完整手机号', icon: 'none' });
      return;
    }
    setProdLoading(true);
    setProdSearched(true);
    try {
      const res: any = await api.get('/orders', { clientPhone: prodPhone, pageSize: '50' });
      setProdOrders(res?.list || []);
    } catch {
      setProdOrders([]);
    } finally {
      setProdLoading(false);
    }
  };

  // 生产进度 - 更新状态（点击当前状态进入下一步）
  const handleUpdateProductionStatus = async (order: any) => {
    const currentIdx = productionStatusOrder.indexOf(order.productionStatus || 'ORDERED');
    const nextIdx = currentIdx + 1;
    if (nextIdx >= productionStatusOrder.length) {
      Taro.showToast({ title: '已是最终状态', icon: 'none' });
      return;
    }
    const nextStatus = productionStatusOrder[nextIdx];
    const nextLabel = productionStatusMap[nextStatus]?.label || nextStatus;

    const res = await Taro.showModal({
      title: '更新生产进度',
      content: `将订单 ${order.orderNo} 从「${productionStatusMap[order.productionStatus || 'ORDERED']?.label}」更新为「${nextLabel}」？`,
      confirmText: '确认更新',
    });
    if (!res.confirm) return;

    setUpdatingId(order.id);
    try {
      await api.put(`/orders/${order.id}/production-status`, { productionStatus: nextStatus });
      Taro.showToast({ title: '已更新', icon: 'success' });
      // 刷新列表
      await handleSearchOrders();
    } catch {
      Taro.showToast({ title: '更新失败', icon: 'none' });
    } finally {
      setUpdatingId(null);
    }
  };

  // 案例管理 - 删除案例
  const handleDeleteCase = async (caseItem: any) => {
    try {
      const res = await Taro.showModal({
        title: '确认删除',
        content: `确定要删除案例"${caseItem.title}"吗？此操作不可恢复。`,
        confirmColor: '#ef4444'
      });
      if (!res.confirm) return;

      await api.del(`/cases/${caseItem.id}`);
      Taro.showToast({ title: '已删除', icon: 'success' });
      setCases(cases.filter((c) => c.id !== caseItem.id));
    } catch (err) {
      if (err?.errMsg !== 'showModal:fail cancel') {
        Taro.showToast({ title: '删除失败', icon: 'none' });
      }
    }
  };

  // 加载视频列表
  const loadVideos = async () => {
    try {
      const res: any = await api.get('/demo-videos');
      setVideos(Array.isArray(res) ? res : []);
    } catch {
      setVideos([]);
    }
  };

  // 上传视频
  const handleUploadVideo = async () => {
    try {
      const res = await Taro.chooseMedia({
        count: 1,
        mediaType: ['video'],
        sourceType: ['album'],
        maxDuration: 180,
      });
      const tempFilePath = res.tempFiles[0].tempFilePath;
      setVideoUploading(true);
      Taro.showLoading({ title: '上传中...' });

      const cloudPath = `demo-videos/${Date.now()}.mp4`;
      const { uploadFile } = await import('../../../utils/cloud');
      const result = await uploadFile(tempFilePath, cloudPath);
      Taro.hideLoading();

      Taro.showLoading({ title: '保存中...' });
      await api.post('/demo-videos', { videoUrl: result.fileID });
      Taro.hideLoading();
      Taro.showToast({ title: '上传成功', icon: 'success' });
      loadVideos();
    } catch (err: any) {
      Taro.hideLoading();
      if (err?.errMsg?.includes('cancel')) return;
      Taro.showToast({ title: '上传失败', icon: 'none' });
    } finally {
      setVideoUploading(false);
    }
  };

  // 删除视频
  const handleDeleteVideo = async (video: any) => {
    try {
      const res = await Taro.showModal({
        title: '确认删除',
        content: '确定要删除该视频吗？',
        confirmColor: '#ef4444',
      });
      if (!res.confirm) return;
      await api.delete(`/demo-videos/${video.id}`);
      Taro.showToast({ title: '已删除', icon: 'success' });
      loadVideos();
    } catch (err: any) {
      if (err?.errMsg?.includes('cancel')) return;
      Taro.showToast({ title: '删除失败', icon: 'none' });
    }
  };

  // 进入案例管理 tab 时加载全部案例
  useEffect(() => {
    if (activeTab === 'cases') {
      api.get('/cases?all=true&pageSize=200')
        .then((r: any) => setCases(r?.list || r))
        .catch(() => {});
    }
  }, [activeTab]);

  // 进入视频管理 tab 时加载
  useEffect(() => {
    if (activeTab === 'videos') loadVideos();
  }, [activeTab]);

  // 案例二维码 - 生成
  const handleGenerateQrcode = async (caseItem: any) => {
    setQrcodeModal({ caseId: caseItem.id, caseName: caseItem.title });
    setQrcodeBase64('');
    setQrcodeLoading(true);
    try {
      const res: any = await api.get(`/cases/${caseItem.id}/qrcode`, { base64: 'true' });
      if (res?.base64) {
        setQrcodeBase64(res.base64);
      } else {
        Taro.showToast({ title: '生成失败', icon: 'none' });
        setQrcodeModal(null);
      }
    } catch {
      Taro.showToast({ title: '生成失败', icon: 'none' });
      setQrcodeModal(null);
    } finally {
      setQrcodeLoading(false);
    }
  };

  // 案例二维码 - 保存到相册
  const handleSaveToAlbum = async () => {
    if (!qrcodeModal || !qrcodeBase64 || qrcodeSaving) return;
    setQrcodeSaving(true);
    Taro.showLoading({ title: '生成图片...' });
    try {
      const query = Taro.createSelectorQuery();
      const canvasNode: any = await new Promise((resolve, reject) => {
        query.select('#qrcode-canvas')
          .fields({ node: true, size: true })
          .exec((res: any) => {
            if (res?.[0]?.node) resolve(res[0].node);
            else reject(new Error('Canvas not found'));
          });
      });

      const dpr = Taro.getSystemInfoSync().pixelRatio || 2;
      const width = 430;
      const height = 520;
      canvasNode.width = width * dpr;
      canvasNode.height = height * dpr;
      const ctx = canvasNode.getContext('2d');
      ctx.scale(dpr, dpr);

      // 白色背景
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // 加载并绘制二维码
      const img = canvasNode.createImage();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = `data:image/png;base64,${qrcodeBase64}`;
      });

      const qrPadding = 20;
      const qrSize = width - qrPadding * 2;
      ctx.drawImage(img, qrPadding, qrPadding, qrSize, qrSize);

      // 绘制案例名称
      const textY = qrPadding + qrSize + 44;
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // 手动换行（微信 Canvas 2D 不支持 measureText 换行）
      const name = qrcodeModal.caseName || '';
      const maxChars = 18;
      if (name.length <= maxChars) {
        ctx.fillText(name, width / 2, textY);
      } else {
        const line1 = name.substring(0, maxChars);
        const line2 = name.substring(maxChars, maxChars * 2);
        ctx.fillText(line1, width / 2, textY);
        ctx.fillText(line2, width / 2, textY + 24);
      }

      // 导出到临时文件
      const tempRes: any = await new Promise((resolve, reject) => {
        Taro.canvasToTempFilePath({
          canvas: canvasNode,
          success: resolve,
          fail: reject,
        });
      });

      Taro.hideLoading();

      // 保存到相册
      await new Promise<void>((resolve, reject) => {
        Taro.saveImageToPhotosAlbum({
          filePath: tempRes.tempFilePath,
          success: () => resolve(),
          fail: (err: any) => {
            if (err?.errMsg?.includes('auth deny')) {
              Taro.showModal({
                title: '需要授权',
                content: '请允许保存图片到相册',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    Taro.openSetting();
                  }
                },
              });
              reject(err);
            } else {
              reject(err);
            }
          },
        });
      });

      Taro.showToast({ title: '已保存到相册', icon: 'success' });
      setQrcodeModal(null);
    } catch (err: any) {
      Taro.hideLoading();
      if (!err?.errMsg?.includes('auth deny')) {
        Taro.showToast({ title: '保存失败', icon: 'none' });
      }
    } finally {
      setQrcodeSaving(false);
    }
  };

  return (
    <ScrollView className='admin-page' scrollY>
      {/* 头部 - 专业设计 */}
      <View className='admin-header'>
        {/* 背景层 */}
        <View className='admin-header-bg' />

        {/* 装饰几何图形 */}
        <View className='admin-header-decor'>
          <View className='decor-circle decor-circle-1' />
          <View className='decor-circle decor-circle-2' />
          <View className='decor-line decor-line-1' />
        </View>

        {/* 内容区 */}
        <View className='admin-header-content'>

          {/* 第一行：品牌 + 徽章 */}
          <View className='ah-row-top'>
            <Text className='ah-brand'>SOJOY <Text className='ah-brand-sep'>|</Text> 管理中心</Text>
            <View className='admin-badge'>
              <Icon name='shield-check' size={20} color='#ffffff' />
              <Text className='admin-badge-text'>超级管理员</Text>
            </View>
          </View>

          {/* 第二行：副标题 */}
          <View className='ah-row-sub'>
            <Icon name='window' size={18} color='rgba(255,255,255,0.5)' />
            <Text className='ah-subtitle'>19分贝系统门窗 · 总部数据大盘</Text>
          </View>

          {/* 第三行：统计数据条（内嵌） */}
          {activeTab === 'dashboard' && (
            <View className='admin-stats-bar'>
              <View className='as-item'>
                <Text className='as-num'>{stats.stores}</Text>
                <Text className='as-label'>门店</Text>
              </View>
              <View className='as-divider' />
              <View className='as-item as-item-accent'>
                <Text className='as-num'>+{stats.todayNew}</Text>
                <Text className='as-label'>今日新增</Text>
              </View>
              <View className='as-divider' />
              <View className='as-item as-item-warn'>
                <Text className='as-num'>{stats.pendingApps}</Text>
                <Text className='as-label'>待审核</Text>
              </View>
              <View className='as-divider' />
              <View className='as-item'>
                <Text className='as-num'>{stats.activeCases}</Text>
                <Text className='as-label'>案例</Text>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* 数据看板内容区 */}
      {activeTab === 'dashboard' && (
        <>
          {/* 三大功能入口 */}
          <View className='admin-modules-section'>
            <View className='admin-section-header'>
              <Text className='admin-section-title'>功能模块</Text>
              <Text className='admin-section-desc'>点击进入管理</Text>
            </View>
            <View className='admin-module-list'>
              {mainModules.map((mod, index) => (
                <View
                  key={mod.key}
                  className='admin-module-card'
                  onClick={() => mod.key === 'products' ? Taro.navigateTo({ url: '/subpackages/business/product-manage/index' }) : setActiveTab(mod.key)}
                >
                  <View className='admin-module-icon-wrap' style={{ background: `linear-gradient(135deg, ${mod.color}15 0%, ${mod.color}08 100%)` }}>
                    <Icon name={mod.icon as any} size={40} color={mod.color} />
                  </View>
                  <View className='admin-module-body'>
                    <Text className='admin-module-title'>{mod.title}</Text>
                    <Text className='admin-module-desc'>{mod.desc}</Text>
                  </View>
                  <View className='module-arrow'>
                    <Icon name='arrow-right' size={26} color='#c4ccd8' />
                  </View>
                  {index === 1 && stats.pendingApps > 0 && (
                    <View className='module-badge'>
                      <Text className='module-badge-text'>{stats.pendingApps}条待审</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </View>
        </>
      )}

      {/* 门店账号管理 */}
      {activeTab === 'stores' && (
        <View className='admin-subpage'>
          <View className='admin-subpage-header'>
            <View className='admin-back-btn' onClick={() => setActiveTab('dashboard')}>
              <Text className='back-arrow'>←</Text>
            </View>
            <Text className='admin-subpage-title'>门店账号管理</Text>
            <View style={{ width: 40 }} />
          </View>

          <View className='admin-list'>
            {stores.map((item: any) => (
              <View key={item.id} className='admin-store-card'>
                <View className='admin-store-top'>
                  <Text className='admin-store-name'>{item.name}</Text>
                </View>
                <View className='admin-store-row'>
                  <Icon name='user' size={24} color='#9ca3af' />
                  <Text className='admin-store-info'>负责人：{item.owner?.name || '-'}</Text>
                </View>
                <View className='admin-store-row'>
                  <Icon name='phone' size={24} color='#9ca3af' />
                  <Text className='admin-store-info'>电话：{item.owner?.phone || item.phone || '-'}</Text>
                </View>
                <View className='admin-store-row'>
                  <Icon name='map-pin' size={24} color='#9ca3af' />
                  <Text className='admin-store-info'>{item.address || '-'}</Text>
                </View>
                <View className='admin-store-status-row'>
                  <Text className={`admin-store-status ${item.status === 'OPEN' ? 'status-open' : ''}`}>
                    {item.status === 'OPEN' ? '营业中' : '未开业'}
                  </Text>
                </View>
              </View>
            ))}
            {stores.length === 0 && (
              <View className='admin-empty'><Icon name='file-text' size={64} color='#d1d5db' /><Text className='admin-empty-text'>暂无门店数据</Text></View>
            )}
          </View>
        </View>
      )}

      {/* 门店开通审核 */}
      {activeTab === 'applications' && (
        <View className='admin-subpage'>
          <View className='admin-subpage-header'>
            <View className='admin-back-btn' onClick={() => setActiveTab('dashboard')}>
              <Text className='back-arrow'>←</Text>
            </View>
            <Text className='admin-subpage-title'>门店开通审核</Text>
            <View style={{ width: 40 }} />
          </View>

          <View className='admin-list'>
            {applications.map((item: any) => (
              <View key={item.id} className='admin-app-card'>
                {/* 顶部：门店名称 + 状态 + 角色 */}
                <View className='app-card-top'>
                  <View className='app-header-left'>
                    <Text className='app-company-name'>{item.companyName || '未命名门店'}</Text>
                    <View className={`app-role-tag tag-owner`}>
                      <Icon name='building' size={20} color='#1e40af' />
                      <Text className={`role-tag-text text-owner`}>门店老板</Text>
                    </View>
                  </View>
                  <View className='app-pending-tag'>
                    <Text className='pending-tag-text'>待审核</Text>
                  </View>
                </View>

                {/* 资质图片展示 */}
                {item.licenseImages && item.licenseImages.length > 0 && (
                  <View className='app-images-section'>
                    <View className='app-section-label-row'>
                      <Icon name='file-text' size={24} color='#374151' />
                      <Text className='app-section-label'>资质材料</Text>
                    </View>
                    <ScrollView className='app-images-scroll' scrollX showScrollbar={false}>
                      <View className='app-images-list'>
                        {item.licenseImages.map((img: string, idx: number) => (
                          <Image
                            key={idx}
                            className='app-license-img'
                            src={img}
                            mode='aspectFill'
                            onClick={() => Taro.previewImage({ current: img, urls: item.licenseImages })}
                          />
                        ))}
                      </View>
                    </ScrollView>
                  </View>
                )}

                {/* 详细信息 */}
                <View className='app-card-body'>
                  <View className='app-info-row'>
                    <Text className='app-info-label'>申请人</Text>
                    <Text className='app-info-value'>{item.contactName || '-'}</Text>
                  </View>
                  <View className='app-info-row'>
                    <Text className='app-info-label'>联系电话</Text>
                    <View className='app-phone-row'>
                      <Text className='app-info-value'>{item.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') || '-'}</Text>
                      {item.phone && (
                        <View className='app-phone-call' onClick={() => {
                          Taro.showModal({ title: '拨打电话', content: item.phone, confirmText: '拨打', success: (r) => { if (r.confirm) Taro.makePhoneCall({ phoneNumber: item.phone }); } });
                        }}>
                          <Icon name='phone' size={24} color='#122b4d' />
                        </View>
                      )}
                    </View>
                  </View>

                  {item.address && (
                    <View className='app-info-row'>
                      <Text className='app-info-label'>门店地址</Text>
                      <Text className='app-info-value app-info-addr'>{item.address}</Text>
                    </View>
                  )}

                  <View className='app-info-row'>
                    <Text className='app-info-label'>申请时间</Text>
                    <Text className='app-info-value'>{item.createdAt ? new Date(item.createdAt).toLocaleString('zh-CN') : '-'}</Text>
                  </View>
                </View>

                {/* 操作按钮 */}
                <View className='app-actions'>
                  <View className='app-btn app-btn-reject' onClick={() => handleReject(item.id)}>
                    <Icon name='close' size={28} color='#6b7280' />
                    <Text className='app-btn-reject-text'>驳回</Text>
                  </View>
                  <View className='app-btn app-btn-approve' onClick={() => handleApprove(item.id)}>
                    <Icon name='check' size={28} color='#ffffff' />
                    <Text className='app-btn-approve-text'>通过</Text>
                  </View>
                </View>
              </View>
            ))}
            {applications.length === 0 && (
              <View className='admin-empty'><Icon name='check-circle' size={64} color='#4ade80' /><Text className='admin-empty-text'>暂无待审核申请</Text></View>
            )}
          </View>
        </View>
      )}

      {/* 全国案例管理 */}
      {activeTab === 'cases' && (
        <View className='admin-subpage'>
          <View className='admin-subpage-header'>
            <View className='admin-back-btn' onClick={() => setActiveTab('dashboard')}>
              <Text className='back-arrow'>←</Text>
            </View>
            <Text className='admin-subpage-title'>全国案例管理</Text>
            <View style={{ width: 40 }} />
          </View>

          <View className='admin-list'>
            {cases.map((item: any) => (
              <View key={item.id} className='admin-case-card'>
                <View className='admin-case-img-wrap'>
                  {item.coverImage || item.imageUrl ? (
                    <Image className='admin-case-img' src={item.coverImage || item.imageUrl} mode='aspectFill' />
                  ) : (
                    <View className='admin-case-placeholder'><Icon name='image' size={48} color='#b0c4d8' /></View>
                  )}
                </View>
                <View className='admin-case-body'>
                  <Text className='admin-case-title'>{item.title}</Text>
                  <View className='admin-case-meta-row'>
                    <Icon name='building' size={22} color='#9ca3af' />
                    <Text className='admin-case-meta'>{item.storeName || '未知门店'}</Text>
                  </View>
                  <View className='admin-case-meta-row'>
                    <Icon name='map-pin' size={22} color='#9ca3af' />
                    <Text className='admin-case-meta'>{item.communityName || item.store?.name || '-'}</Text>
                  </View>
                  <View className='admin-case-footer'>
                    <View className={`admin-case-status-group`}>
                      <Text className={`admin-case-publish-status ${item.isPublished ? 'published' : ''}`}>
                        {item.isPublished ? '已发布' : '草稿'}
                      </Text>
                      <View className='admin-case-views'>
                        <Icon name='eye' size={22} color='#9ca3af' />
                        <Text>{item.views || 0}</Text>
                      </View>
                    </View>
                  </View>

                  {/* 管理员操作按钮 */}
                  <View className='admin-case-actions'>
                    <View
                      className={`admin-action-btn ${item.isPublished ? 'btn-unpublish' : 'btn-publish'}`}
                      onClick={() => handleToggleCasePublish(item)}
                    >
                      <Icon name={item.isPublished ? 'close' : 'check'} size={24} color="#ffffff" />
                      <Text>{item.isPublished ? '下架' : '发布'}</Text>
                    </View>
                    <View
                      className='admin-action-btn btn-qrcode'
                      onClick={() => handleGenerateQrcode(item)}
                    >
                      <Icon name='qr-code' size={24} color="#ffffff" />
                      <Text>二维码</Text>
                    </View>
                    <View
                      className='admin-action-btn btn-delete'
                      onClick={() => handleDeleteCase(item)}
                    >
                      <Icon name='delete' size={24} color="#ffffff" />
                      <Text>删除</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
            {cases.length === 0 && (
              <View className='admin-empty'><Icon name='file-text' size={64} color='#d1d5db' /><Text className='admin-empty-text'>暂无案例数据</Text></View>
            )}
          </View>
        </View>
      )}

      {/* 生产进度管理 */}
      {activeTab === 'production' && (
        <View className='admin-subpage'>
          <View className='admin-subpage-header'>
            <View className='admin-back-btn' onClick={() => setActiveTab('dashboard')}>
              <Text className='back-arrow'>←</Text>
            </View>
            <Text className='admin-subpage-title'>生产进度管理</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* 搜索栏 */}
          <View className='prod-search-bar'>
            <View className='prod-search-input-wrap'>
              <Icon name='search' size={28} color='#9ca3af' />
              <Input
                className='prod-search-input'
                type='number'
                placeholder='输入客户手机号搜索订单'
                value={prodPhone}
                onInput={(e) => setProdPhone(e.detail.value)}
                maxlength={11}
                onConfirm={handleSearchOrders}
              />
            </View>
            <View className='prod-search-btn' onClick={handleSearchOrders}>
              <Text className='prod-search-btn-text'>搜索</Text>
            </View>
          </View>

          {/* 结果列表 */}
          <View className='admin-list' style='margin-top:24rpx'>
            {prodLoading ? (
              <View className='admin-empty'><Text className='admin-empty-text'>搜索中...</Text></View>
            ) : prodOrders.length > 0 ? (
              prodOrders.map((order: any) => {
                const ps = order.productionStatus || 'ORDERED';
                const psInfo = productionStatusMap[ps] || { label: ps, color: '#6b7280' };
                const currentIdx = productionStatusOrder.indexOf(ps);
                const isLast = currentIdx >= productionStatusOrder.length - 1;

                return (
                  <View key={order.id} className='prod-card'>
                    {/* 订单基本信息 */}
                    <View className='prod-card-top'>
                      <View className='prod-card-left'>
                        <Text className='prod-order-no'>{order.orderNo}</Text>
                        <Text className='prod-product-name'>{order.productName || '-'}</Text>
                      </View>
                      <View
                        className={`prod-status-tag ${isLast ? 'prod-status-done' : ''}`}
                        style={{ background: psInfo.color + '18', borderColor: psInfo.color + '40' }}
                      >
                        <Text style={{ color: psInfo.color, fontSize: '24rpx', fontWeight: 500 }}>{psInfo.label}</Text>
                      </View>
                    </View>

                    {/* 客户和地址 */}
                    <View className='prod-card-info'>
                      <View className='prod-info-row'>
                        <Icon name='user' size={24} color='#9ca3af' />
                        <Text className='prod-info-text'>{order.client?.name || order.clientName || '-'}</Text>
                        <Text className='prod-info-phone'>{order.client?.phone || order.clientPhone || '-'}</Text>
                      </View>
                      <View className='prod-info-row'>
                        <Icon name='map-pin' size={24} color='#9ca3af' />
                        <Text className='prod-info-text'>{order.installAddress || order.communityName || '-'}</Text>
                      </View>
                    </View>

                    {/* 进度条 */}
                    <View className='prod-progress-bar'>
                      {productionStatusOrder.map((key, idx) => {
                        const info = productionStatusMap[key];
                        const isActive = idx <= currentIdx;
                        return (
                          <View key={key} className='prod-progress-step'>
                            <View
                              className={`prod-step-dot ${isActive ? 'prod-step-active' : ''}`}
                              style={isActive ? { background: info?.color, borderColor: info?.color } : {}}
                            />
                            {idx < productionStatusOrder.length - 1 && (
                              <View
                                className={`prod-step-line ${idx < currentIdx ? 'prod-step-line-active' : ''}`}
                                style={idx < currentIdx ? { background: productionStatusMap[productionStatusOrder[idx + 1]]?.color } : {}}
                              />
                            )}
                            <Text
                              className={`prod-step-label ${isActive ? 'prod-step-label-active' : ''}`}
                              style={isActive ? { color: info?.color } : {}}
                            >
                              {info?.label}
                            </Text>
                          </View>
                        );
                      })}
                    </View>

                    {/* 操作按钮 */}
                    {!isLast && (
                      <View className='prod-card-action'>
                        <View
                          className={`prod-update-btn ${updatingId === order.id ? 'prod-updating' : ''}`}
                          onClick={() => updatingId ? null : handleUpdateProductionStatus(order)}
                        >
                          <Icon name='arrow-right' size={24} color='#ffffff' />
                          <Text className='prod-update-text'>
                            {updatingId === order.id ? '更新中...' : `更新为「${productionStatusMap[productionStatusOrder[currentIdx + 1]]?.label}」`}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })
            ) : prodSearched ? (
              <View className='admin-empty'>
                <Icon name='search' size={64} color='#d1d5db' />
                <Text className='admin-empty-text'>未找到该手机号的订单</Text>
              </View>
            ) : (
              <View className='admin-empty'>
                <Icon name='package' size={64} color='#d1d5db' />
                <Text className='admin-empty-text'>输入手机号开始搜索</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 首页展示视频管理 */}
      {activeTab === 'videos' && (
        <View className='admin-subpage'>
          <View className='admin-subpage-header'>
            <View className='admin-back-btn' onClick={() => setActiveTab('dashboard')}>
              <Text className='back-arrow'>←</Text>
            </View>
            <Text className='admin-subpage-title'>首页展示视频管理</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* 上传按钮 */}
          <View className='admin-video-upload-section'>
            <View className='admin-video-upload-btn' onClick={handleUploadVideo}>
              <Icon name='add' size={36} color='#ffffff' />
              <Text className='admin-video-upload-text'>
                {videoUploading ? '上传中...' : '上传视频'}
              </Text>
            </View>
            <Text className='admin-video-hint'>选择视频文件上传，最大 3 分钟</Text>
          </View>

          {/* 视频列表 */}
          <View className='admin-video-list'>
            {videos.map((item: any) => (
              <View key={item.id} className='admin-video-item'>
                <Video
                  className='admin-video-player'
                  src={item.videoUrl}
                  controls
                  autoplay={false}
                  objectFit='contain'
                />
                <View className='admin-video-del' onClick={() => handleDeleteVideo(item)}>
                  <Icon name='delete' size={28} color='#ef4444' />
                  <Text className='admin-video-del-text'>删除</Text>
                </View>
              </View>
            ))}
            {videos.length === 0 && (
              <View className='admin-empty'>
                <Icon name='play-circle' size={64} color='#d1d5db' />
                <Text className='admin-empty-text'>暂无视频</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View className='safe-bottom' />

      {/* 隐藏的 Canvas - 用于合成二维码+文字 */}
      <Canvas
        id='qrcode-canvas'
        type='2d'
        className='qrcode-canvas-hidden'
      />

      {/* 二维码弹窗 */}
      {qrcodeModal && (
        <View className='qrcode-modal-mask' onClick={() => !qrcodeLoading && !qrcodeSaving && setQrcodeModal(null)}>
          <View className='qrcode-modal' onClick={(e) => e.stopPropagation()}>
            <View className='qrcode-modal-header'>
              <Text className='qrcode-modal-title'>案例小程序码</Text>
              <View className='qrcode-modal-close' onClick={() => !qrcodeSaving && setQrcodeModal(null)}>
                <Icon name='close' size={28} color='#6b7280' />
              </View>
            </View>

            <View className='qrcode-modal-body'>
              {qrcodeLoading ? (
                <View className='qrcode-modal-loading'>
                  <Text>生成中...</Text>
                </View>
              ) : qrcodeBase64 ? (
                <>
                  <Image
                    className='qrcode-modal-img'
                    src={`data:image/png;base64,${qrcodeBase64}`}
                    mode='widthFix'
                  />
                  <Text className='qrcode-modal-name'>{qrcodeModal.caseName}</Text>
                </>
              ) : null}
            </View>

            {qrcodeBase64 && (
              <View className='qrcode-modal-footer'>
                <View
                  className={`qrcode-save-btn ${qrcodeSaving ? 'qrcode-saving' : ''}`}
                  onClick={handleSaveToAlbum}
                >
                  <Icon name='image' size={28} color='#ffffff' />
                  <Text className='qrcode-save-text'>
                    {qrcodeSaving ? '保存中...' : '保存到相册'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

export default function AdminWithErrorBoundary() {
  return <ErrorBoundary><Admin /></ErrorBoundary>;
}
