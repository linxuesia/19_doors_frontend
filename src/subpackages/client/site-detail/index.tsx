import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

interface ConstructionStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
  sortOrder: number;
}

interface SiteUpdate {
  id: string;
  stepId: string;
  stepName: string;
  content?: string;
  author: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
}

interface SiteDetail {
  id: string;
  name: string;
  communityName?: string;
  coverImage?: string;
  images?: string[];
  description?: string;
  houseArea?: number;
  houseType?: string;
  storeName?: string;
  storeAddress?: string;
  createdAt: string;
  constructionSteps: ConstructionStep[];
  siteUpdates: SiteUpdate[];
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
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch { return dateStr; }
  };

  const heroImage = site.coverImage || site.images?.[0] || '';

  // 按施工阶段分组工地动态
  const updatesByStep = site.siteUpdates.reduce((acc: Record<string, SiteUpdate[]>, u) => {
    const key = u.stepId || 'default';
    if (!acc[key]) acc[key] = [];
    acc[key].push(u);
    return acc;
  }, {});

  return (
    <ScrollView className='site-detail-page' scrollY>
      {/* 头部 */}
      <View className='site-header'>
        {heroImage ? (
          <Image className='site-hero-img' src={heroImage} mode='aspectFill' />
        ) : null}
        <View className='site-header-info'>
          <Text className='site-name'>{site.name}</Text>
          {site.communityName && (
            <View className='site-header-meta'>
              <Icon name='map-pin' size={24} color='rgba(255,255,255,0.85)' />
              <Text className='site-header-location'>{site.communityName}</Text>
              {site.houseType && <Text className='site-header-type'>{site.houseType}</Text>}
            </View>
          )}
        </View>
      </View>

      {/* 基本信息 */}
      <View className='site-section'>
        <Text className='site-section-title'>基本信息</Text>
        <View className='info-card'>
          {site.storeAddress && (
            <View className='info-item'>
              <View className='info-label-row'>
                <Icon name='map-pin' size={32} color='#6b7280' />
                <Text className='info-label'>地址</Text>
              </View>
              <Text className='info-value'>{site.storeAddress}</Text>
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
          {site.houseArea && (
            <View className='info-item'>
              <View className='info-label-row'>
                <Icon name='home' size={32} color='#6b7280' />
                <Text className='info-label'>面积</Text>
              </View>
              <Text className='info-value'>{site.houseArea}m²</Text>
            </View>
          )}
          {site.createdAt && (
            <View className='info-item'>
              <View className='info-label-row'>
                <Icon name='calendar' size={32} color='#6b7280' />
                <Text className='info-label'>创建时间</Text>
              </View>
              <Text className='info-value'>{formatDate(site.createdAt)}</Text>
            </View>
          )}
        </View>
      </View>

      {/* 施工进度 */}
      {site.constructionSteps.length > 0 && (
        <View className='site-section'>
          <Text className='site-section-title'>施工进度</Text>
          <View className='progress-timeline'>
            {site.constructionSteps.map((step, index) => (
              <View key={step.id} className='progress-item'>
                <View className='progress-indicator'>
                  {step.status === 'completed' ? (
                    <View className='progress-dot progress-dot-done'>
                      <Icon name='check' size={20} color='#ffffff' />
                    </View>
                  ) : step.status === 'in_progress' ? (
                    <View className='progress-dot progress-dot-active' />
                  ) : (
                    <View className='progress-dot progress-dot-pending' />
                  )}
                  {index < site.constructionSteps.length - 1 && (
                    <View className={`progress-line ${step.status === 'completed' ? 'progress-line-done' : ''}`} />
                  )}
                </View>
                <View className='progress-content'>
                  <Text className={`progress-name ${step.status}`}>{step.name}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 工地动态 */}
      {site.siteUpdates.length > 0 && (
        <View className='site-section'>
          <Text className='site-section-title'>工地动态</Text>
          <View className='dynamic-list'>
            {Object.entries(updatesByStep).map(([stepId, updates]) => {
              const step = site.constructionSteps.find(s => s.id === stepId);
              const stepName = step?.name || updates[0]?.stepName || '施工阶段';

              return (
                <View key={stepId} className='update-group'>
                  <View className='update-step-tag'>{stepName}</View>
                  {updates.map(update => (
                    <View key={update.id} className='dynamic-item'>
                      <View className='dynamic-avatar'>
                        <Icon name='user' size={40} color='#122b4d' />
                      </View>
                      <View className='dynamic-content'>
                        <View className='dynamic-header'>
                          <Text className='dynamic-author'>{update.author}</Text>
                          <Text className='dynamic-time'>{formatDateTime(update.createdAt)}</Text>
                        </View>
                        {update.content && (
                          <Text className='dynamic-text'>{update.content}</Text>
                        )}
                        {update.images && update.images.length > 0 && (
                          <View className='dynamic-images'>
                            {update.images.map((imgUrl, idx) => (
                              <Image
                                key={idx}
                                className='dynamic-image'
                                src={imgUrl}
                                mode='aspectFill'
                                onClick={() => Taro.previewImage({ current: imgUrl, urls: update.images! })}
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View className='safe-bottom' />
    </ScrollView>
  );
}
