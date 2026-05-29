import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

const mainModules = [
  {
    icon: 'building-2',
    title: '门店账号管理',
    desc: '查看和管理所有门店账号',
    key: 'stores',
    color: '#122b4d',
  },
  {
    icon: 'clipboard-check',
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
    if (!requireBusinessLogin()) return;

    Promise.all([
      api.get('/stores').catch(() => []),
      api.get('/stores/applications/list?status=PENDING').catch(() => []),
      api.get('/cases?published=true').catch(() => []),
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

  if (!user || !requireBusinessLogin()) return null;

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

  return (
    <ScrollView className='admin-page' scrollY>
      {/* 头部 */}
      <View className='admin-header'>
        <View className='admin-header-bg' />
        <View className='admin-header-content'>
          <Text className='admin-title'>系统管理后台</Text>
          <View className='admin-badge'>
            <Icon name='shield-check' size={24} color='#ffffff' />
            <Text className='admin-badge-text'>超级管理员</Text>
          </View>
        </View>
      </View>

      {/* 数据看板 */}
      {activeTab === 'dashboard' && (
        <>
          {/* 统计卡片 */}
          <View className='admin-stats-grid'>
            <View className='admin-stat-card'>
              <Text className='admin-stat-num'>{stats.stores}</Text>
              <Text className='admin-stat-label'>门店总数</Text>
            </View>
            <View className='admin-stat-card admin-stat-highlight'>
              <Text className='admin-stat-num'>+{stats.todayNew}</Text>
              <Text className='admin-stat-label'>今日新增</Text>
            </View>
            <View className='admin-stat-card admin-stat-warn'>
              <Text className='admin-stat-num'>{stats.pendingApps}</Text>
              <Text className='admin-stat-label'>待审核</Text>
            </View>
            <View className='admin-stat-card admin-stat-info'>
              <Text className='admin-stat-num'>{stats.activeCases}</Text>
              <Text className='admin-stat-label'>活跃案例</Text>
            </View>
          </View>

          {/* 三大功能入口 */}
          <View className='admin-modules-section'>
            <Text className='admin-section-title'>功能模块</Text>
            <View className='admin-module-list'>
              {mainModules.map((mod) => (
                <View
                  key={mod.key}
                  className='admin-module-card'
                  onClick={() => setActiveTab(mod.key)}
                >
                  <View className='admin-module-icon-wrap' style={{ background: `${mod.color}12` }}>
                    <Icon name={mod.icon as any} size={40} color={mod.color} />
                  </View>
                  <View className='admin-module-body'>
                    <Text className='admin-module-title'>{mod.title}</Text>
                    <Text className='admin-module-desc'>{mod.desc}</Text>
                  </View>
                  <Icon name='chevron-right' size={28} color='#d1d5db' />
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
            <Icon name='arrow-left' size={32} color='#374151' onClick={() => setActiveTab('dashboard')} />
            <Text className='admin-subpage-title'>门店账号管理</Text>
            <View style={{ width: 32 }} />
          </View>

          <View className='admin-list'>
            {stores.map((item: any) => (
              <View key={item.id} className='admin-store-card'>
                <View className='admin-store-top'>
                  <Text className='admin-store-name'>{item.name}</Text>
                  <View className={`admin-store-type ${item.type === 'DIRECT' ? 'type-direct' : 'type-partner'}`}>
                    <Text className='type-text'>{item.type === 'DIRECT' ? '直营' : '加盟'}</Text>
                  </View>
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
              <View className='admin-empty'><Icon name='inbox' size={64} color='#d1d5db' /><Text className='admin-empty-text'>暂无门店数据</Text></View>
            )}
          </View>
        </View>
      )}

      {/* 门店开通审核 */}
      {activeTab === 'applications' && (
        <View className='admin-subpage'>
          <View className='admin-subpage-header'>
            <Icon name='arrow-left' size={32} color='#374151' onClick={() => setActiveTab('dashboard')} />
            <Text className='admin-subpage-title'>门店开通审核</Text>
            <View style={{ width: 32 }} />
          </View>

          <View className='admin-list'>
            {applications.map((item: any) => (
              <View key={item.id} className='admin-app-card'>
                <View className='app-card-top'>
                  <Text className='app-company-name'>{item.companyName}</Text>
                  <View className='app-pending-tag'>
                    <Text className='pending-tag-text'>待审核</Text>
                  </View>
                </View>
                <View className='app-card-body'>
                  <View className='app-info-row'>
                    <Text className='app-info-label'>申请人</Text>
                    <Text className='app-info-value'>{item.contactName}</Text>
                  </View>
                  <View className='app-info-row'>
                    <Text className='app-info-label'>联系电话</Text>
                    <Text className='app-info-value'>{item.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>
                  </View>
                  <View className='app-info-row'>
                    <Text className='app-info-label'>申请时间</Text>
                    <Text className='app-info-value'>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</Text>
                  </View>
                  {item.address && (
                    <View className='app-info-row'>
                      <Text className='app-info-label'>地址</Text>
                      <Text className='app-info-value app-info-addr'>{item.address}</Text>
                    </View>
                  )}
                </View>
                <View className='app-actions'>
                  <View className='app-btn app-btn-reject' onClick={() => handleReject(item.id)}>
                    <Text className='app-btn-reject-text'>驳回</Text>
                  </View>
                  <View className='app-btn app-btn-approve' onClick={() => handleApprove(item.id)}>
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
            <Icon name='arrow-left' size={32} color='#374151' onClick={() => setActiveTab('dashboard')} />
            <Text className='admin-subpage-title'>全国案例管理</Text>
            <View style={{ width: 32 }} />
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
                    <Icon name='building-2' size={22} color='#9ca3af' />
                    <Text className='admin-case-meta'>{item.storeName || '未知门店'}</Text>
                  </View>
                  <View className='admin-case-meta-row'>
                    <Icon name='map-pin' size={22} color='#9ca3af' />
                    <Text className='admin-case-meta'>{item.city || '-'}</Text>
                  </View>
                  <View className='admin-case-footer'>
                    <Text className={`admin-case-publish-status ${item.isPublished ? 'published' : ''}`}>
                      {item.isPublished ? '已发布' : '草稿'}
                    </Text>
                    <Text className='admin-case-views'>👁 {item.views || 0}</Text>
                  </View>
                </View>
              </View>
            ))}
            {cases.length === 0 && (
              <View className='admin-empty'><Icon name='inbox' size={64} color='#d1d5db' /><Text className='admin-empty-text'>暂无案例数据</Text></View>
            )}
          </View>
        </View>
      )}

      <View className='safe-bottom' />
    </ScrollView>
  );
}
