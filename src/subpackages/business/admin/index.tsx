import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

export default function Admin() {
  const [stores, setStores] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    Promise.all([
      api.get('/stores').catch(() => []),
      api.get('/stores/applications/list').catch(() => []),
    ]).then(([s, a]) => {
      setStores((s as any) || []);
      setApplications((a as any) || []);
    });
  }, []);

  return (
    <View className='admin-page'>
      <View className='admin-header'>
        <View className='admin-header-bg' />
        <Text className='admin-title'>系统管理后台</Text>
      </View>

      <View className='admin-tabs'>
        {[
          { key: 'applications', label: '门店审批' },
          { key: 'stores', label: '全局门店' },
        ].map((t) => (
          <View
            key={t.key}
            className={`admin-tab ${activeTab === t.key ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            <Text className={`admin-tab-text ${activeTab === t.key ? 'admin-tab-text-active' : ''}`}>
              {t.label}
            </Text>
          </View>
        ))}
      </View>

      {activeTab === 'applications' && (
        <View className='admin-list'>
          {applications.map((item: any) => (
            <View key={item.id} className='admin-card'>
              <View className='admin-card-top'>
                <Text className='admin-card-name'>{item.companyName}</Text>
                <Text className={`tag ${item.status === 'PENDING' ? 'tag-amber' : item.status === 'APPROVED' ? 'tag-green' : 'tag-gray'}`}>
                  {item.status === 'PENDING' ? '待审核' : item.status === 'APPROVED' ? '已通过' : '已驳回'}
                </Text>
              </View>
              <Text className='admin-card-info'>联系人：{item.contactName}</Text>
              <Text className='admin-card-info'>电话：{item.phone}</Text>
            </View>
          ))}
          {applications.length === 0 && <View className='admin-empty'><Text className='admin-empty-text'>暂无申请</Text></View>}
        </View>
      )}

      {activeTab === 'stores' && (
        <View className='admin-list'>
          {stores.map((item: any) => (
            <View key={item.id} className='admin-card'>
              <View className='admin-card-top'>
                <Text className='admin-card-name'>{item.name}</Text>
                <Text className={`tag ${item.type === 'DIRECT' ? 'tag-brand' : 'tag-amber'}`}>
                  {item.type === 'DIRECT' ? '直营' : '加盟'}
                </Text>
              </View>
              <Text className='admin-card-info'>负责人：{item.owner?.name || '-'}</Text>
              <View className='admin-card-row'>
                <Icon name='map-pin' size={28} color='#6b7280' />
                <Text className='admin-card-info'> {item.address}</Text>
              </View>
              <Text className='admin-card-info'>状态：{item.status === 'OPEN' ? '营业中' : item.status}</Text>
            </View>
          ))}
        </View>
      )}
      <View className='safe-bottom' />
    </View>
  );
}
