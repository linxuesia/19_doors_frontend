import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

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
];

export default function Admin() {
  const { user, requireBusinessLogin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ stores: 0, todayNew: 0, pendingApps: 0, activeCases: 0 });
  const [stores, setStores] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);

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

  // 案例管理 - 删除案例
  const handleDeleteCase = async (caseItem: any) => {
    try {
      await Taro.showModal({
        title: '确认删除',
        content: `确定要删除案例"${caseItem.title}"吗？此操作不可恢复。`,
        confirmColor: '#ef4444'
      });

      await api.delete(`/cases/${caseItem.id}`);
      Taro.showToast({ title: '已删除', icon: 'success' });
      setCases(cases.filter((c) => c.id !== caseItem.id));
    } catch (err) {
      if (err?.errMsg !== 'showModal:fail cancel') {
        Taro.showToast({ title: '删除失败', icon: 'none' });
      }
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
                  onClick={() => setActiveTab(mod.key)}
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
                    <Text className='app-company-name'>{item.storeName || item.companyName || '未命名门店'}</Text>
                    <View className={`app-role-tag ${(item.role || '').includes('STORE_OWNER') ? 'tag-owner' : 'tag-manager'}`}>
                      {(item.role || '').includes('STORE_OWNER') ? (
                        <>
                          <Icon name='building' size={20} color='#1e40af' />
                          <Text className={`role-tag-text text-owner`}>门店老板</Text>
                        </>
                      ) : (
                        <>
                          <Icon name='user' size={20} color='#6b21a8' />
                          <Text className={`role-tag-text text-manager`}>门店店长</Text>
                        </>
                      )}
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

                  {/* 店长：显示选择的门店 */}
                  {(item.role || '').includes('STORE_MANAGER') && item.storeId && (
                    <View className='app-info-row'>
                      <Text className='app-info-label'>申请加入</Text>
                      <Text className='app-info-value app-store-name'>{item.targetStoreName || `门店ID: ${item.storeId}`}</Text>
                    </View>
                  )}

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
                    <Text className='admin-case-meta'>{item.city || '-'}</Text>
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

      <View className='safe-bottom' />
    </ScrollView>
  );
}
