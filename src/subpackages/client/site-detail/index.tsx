import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

interface ConstructionLog {
  id: string;
  stage: string;
  content?: string;
  images?: string[];
  author: string;
  createdAt: string;
}

interface SiteDetail {
  id: string;
  name: string;
  status: string;
  address?: string;
  storeName?: string;
  clientName?: string;
  clientPhone?: string;
  productName?: string;
  productSeries?: string;
  createdAt: string;
  constructionLogs: ConstructionLog[];
}

export default function SiteDetail() {
  const router = useRouter();
  const { id } = router.params;
  const [site, setSite] = useState<SiteDetail | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get(`/sites/${id}`)
      .then((res: any) => setSite(res))
      .catch(() => setSite(null));
  }, [id]);

  if (!site) {
    return <View className='site-detail-page'><View className='cs-loading'><Text>加载中...</Text></View></View>;
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch { return dateStr; }
  };

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch { return dateStr; }
  };

  const statusColorMap: Record<string, string> = {
    '下单备料': 'tag-amber',
    '施工中': 'tag-blue',
    '验收中': 'tag-blue',
    '已完工': 'tag-green',
  };

  return (
    <ScrollView className='site-detail-page' scrollY>
      {/* 工地头部信息 */}
      <View className='site-header'>
        <Text className='site-name'>{site.name}</Text>
        <View className='site-status-row'>
          <Text className={`tag ${statusColorMap[site.status] || 'tag-amber'}`}>{site.status}</Text>
        </View>
      </View>

      {/* 基本信息 */}
      <View className='site-section'>
        <Text className='site-section-title'>基本信息</Text>
        <View className='info-card'>
          {site.address && (
            <View className='info-item'>
              <View className='info-label-row'>
                <Icon name='map-pin' size={32} color='#6b7280' />
                <Text className='info-label'>地址</Text>
              </View>
              <Text className='info-value'>{site.address}</Text>
            </View>
          )}
          {site.storeName && (
            <View className='info-item'>
              <View className='info-label-row'>
                <Icon name='building' size={32} color='#6b7280' />
                <Text className='info-label'>门店</Text>
              </View>
              <Text className='info-value'>{site.storeName}</Text>
            </View>
          )}
          {site.clientName && (
            <View className='info-item'>
              <View className='info-label-row'>
                <Icon name='user' size={32} color='#6b7280' />
                <Text className='info-label'>客户</Text>
              </View>
              <Text className='info-value'>{site.clientName} {site.clientPhone || ''}</Text>
            </View>
          )}
          {(site.productName || site.productSeries) && (
            <View className='info-item'>
              <View className='info-label-row'>
                <Icon name='window' size={32} color='#6b7280' />
                <Text className='info-label'>产品</Text>
              </View>
              <Text className='info-value'>{site.productName}{site.productSeries ? ` (${site.productSeries})` : ''}</Text>
            </View>
          )}
          {site.createdAt && (
            <View className='info-item'>
              <View className='info-label-row'>
                <Icon name='calendar' size={32} color='#6b7280' />
                <Text className='info-label'>下单时间</Text>
              </View>
              <Text className='info-value'>{formatDate(site.createdAt)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 施工动态 */}
      {site.constructionLogs.length > 0 && (
        <View className='site-section'>
          <Text className='site-section-title'>施工动态</Text>
          <View className='dynamic-list'>
            {site.constructionLogs.map((log) => (
              <View key={log.id} className='dynamic-item'>
                <View className='dynamic-avatar'>
                  <Icon name='user' size={40} color='#122b4d' />
                </View>
                <View className='dynamic-content'>
                  <View className='dynamic-header'>
                    <Text className='dynamic-author'>{log.author}</Text>
                    <Text className='dynamic-time'>{formatDateTime(log.createdAt)}</Text>
                  </View>
                  {log.stage && (
                    <View className='dynamic-stage-tag'>
                      <Text className='stage-tag-text'>{log.stage}</Text>
                    </View>
                  )}
                  {log.content && (
                    <Text className='dynamic-text'>{log.content}</Text>
                  )}
                  {log.images && log.images.length > 0 && (
                    <View className='dynamic-images'>
                      {log.images.map((imgUrl, idx) => (
                        <Image
                          key={idx}
                          className='dynamic-image'
                          src={imgUrl}
                          mode='aspectFill'
                          onClick={() => Taro.previewImage({ current: imgUrl, urls: log.images! })}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      <View className='safe-bottom' />
    </ScrollView>
  );
}
