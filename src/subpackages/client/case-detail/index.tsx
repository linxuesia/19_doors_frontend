import { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Swiper, SwiperItem, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

interface ConstructionStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed';
}

interface SiteUpdate {
  id: string;
  stepId: string;
  stepName: string;
  content: string;
  author: string;
  images?: string[];
  videos?: string[];
  createdAt: string;
}

export default function CaseDetail() {
  const router = useRouter();
  const id = router.params.id;
  const [detail, setDetail] = useState<any>(null);
  const [constructionSteps, setConstructionSteps] = useState<ConstructionStep[]>([]);
  const [siteUpdates, setSiteUpdates] = useState<SiteUpdate[]>([]);

  useEffect(() => {
    if (id) {
      api.get(`/cases/${id}`)
        .then(async (res: any) => {
          setDetail(res);

          // 如果是本地案例，加载工地动态数据
          if (res.type === 'LOCAL' || res.storeId) {
            try {
              const stepsRes: any = await api.get(`/cases/${id}/construction-steps`);
              setConstructionSteps(stepsRes || []);

              const updatesRes: any = await api.get(`/cases/${id}/site-updates`);
              setSiteUpdates(updatesRes || []);
            } catch (e) {
              console.error('[CaseDetail] 加载工地动态失败:', e);
            }
          }
        })
        .catch(() => setDetail(null));
    }
  }, [id]);

  const images = useMemo(() => {
    if (!detail) return [];
    try {
      const imgs = JSON.parse(detail.images || '[]');
      if (imgs.length > 0) return imgs;
    } catch {}
    if (detail.coverImage) return [detail.coverImage];
    return [];
  }, [detail]);

  const associatedProducts = detail?.associatedProducts || [];

  // 判断是否为本地案例
  const isLocalCase = detail?.type === 'LOCAL' || !!detail?.storeId;

  // 按施工阶段分组工地动态
  const updatesByStep = useMemo(() => {
    const grouped: Record<string, SiteUpdate[]> = {};
    siteUpdates.forEach((update) => {
      if (!grouped[update.stepId]) {
        grouped[update.stepId] = [];
      }
      grouped[update.stepId].push(update);
    });
    return grouped;
  }, [siteUpdates]);

  if (!detail) {
    return <View className='cs-loading'><Text>加载中...</Text></View>;
  }

  const hasImages = images.length > 0;

  const handleReserve = () => {
    Taro.navigateTo({ url: `/subpackages/client/reservation/index?caseId=${id}` });
  };

  return (
    <View className='cs-page'>
      {/* 图片轮播 */}
      <View className='cs-swiper-wrap'>
        {hasImages ? (
          <Swiper
            className='cs-swiper'
            indicatorDots
            indicatorColor='rgba(255,255,255,0.5)'
            indicatorActiveColor='#122b4d'
            circular
          >
            {images.map((img: string, i: number) => (
              <SwiperItem key={i}>
                <Image className='cs-swiper-img' src={img} mode='aspectFill' />
              </SwiperItem>
            ))}
          </Swiper>
        ) : (
          <View className='cs-hero-placeholder'>
            <Icon name='image' size={80} color='#b0c4d8' />
          </View>
        )}
      </View>

      {/* 内容区 */}
      <ScrollView className='cs-body' scrollY>
        {/* 标题卡片 */}
        <View className='cs-title-card'>
          <Text className='cs-title'>{detail.title}</Text>
          <View className='cs-meta'>
            <View className='cs-meta-item'>
              <Icon name='map-pin' size={26} color='#6b7280' />
              <Text>{detail.communityName || '-'}</Text>
            </View>
            <View className='cs-meta-item'>
              <Icon name='home' size={26} color='#6b7280' />
              <Text>{detail.houseType || '住宅'}</Text>
            </View>
            {isLocalCase && (
              <View className='cs-badge cs-badge-local'>本地案例</View>
            )}
          </View>
        </View>

        {/* 案例详情 */}
        <View className='cs-section-card'>
          <View className='cs-section-header'>
            <View className='cs-section-indicator' />
            <Text className='cs-section-title'>案例详情</Text>
          </View>
          <Text className='cs-desc'>{detail.description || '暂无描述'}</Text>
        </View>

        {/* 相关产品 */}
        {associatedProducts.length > 0 && (
          <View className='cs-section-card'>
            <View className='cs-section-header'>
              <View className='cs-section-indicator' />
              <Text className='cs-section-title'>选用产品</Text>
            </View>
            <View className='cs-products'>
              {associatedProducts.map((p: any) => (
                <View
                  key={p.id}
                  className='cs-product-item'
                  onClick={() =>
                    Taro.navigateTo({ url: `/subpackages/client/product-detail/index?id=${p.id}` })
                  }
                >
                  <View className='cs-product-img'>
                    {p.coverImage ? (
                      <Image className='cs-product-image' src={p.coverImage} mode='aspectFill' />
                    ) : (
                      <Icon name='window' size={48} color='#b0c4d8' />
                    )}
                  </View>
                  <View className='cs-product-info'>
                    <Text className='cs-product-name'>{p.name}</Text>
                    <Text className='cs-product-series'>{p.series}</Text>
                  </View>
                  <Icon name='arrow-right' size={32} color='#b0c4d8' />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ====== 本地案例专属内容 ====== */}
        {isLocalCase && (
          <>
            {/* 施工进度 */}
            {constructionSteps.length > 0 && (
              <View className='cs-section-card'>
                <View className='cs-section-header'>
                  <Icon name='clipboard' size={30} color='#122b4d' />
                  <Text className='cs-section-title'>施工进度</Text>
                  <Icon name='arrow-down' size={24} color='#9ca3af' style={{ marginLeft: 'auto' }} />
                </View>
                <View className='cs-progress-steps'>
                  {constructionSteps.map((step, index) => (
                    <View key={step.id} className={`cs-step-item ${step.status}`}>
                      <View className='cs-step-icon-wrap'>
                        {step.status === 'completed' ? (
                          <View className='cs-step-icon cs-step-completed'>
                            <Icon name='check' size={24} color='#ffffff' />
                          </View>
                        ) : step.status === 'in_progress' ? (
                          <View className='cs-step-icon cs-step-active'>
                            <Text className='cs-step-index'>{index + 1}</Text>
                          </View>
                        ) : (
                          <View className='cs-step-icon cs-step-pending'>
                            <Text className='cs-step-index'>{index + 1}</Text>
                          </View>
                        )}
                      </View>
                      <Text className={`cs-step-name ${step.status}`}>{step.name}</Text>
                      {index < constructionSteps.length - 1 && (
                        <View className={`cs-step-line ${step.status === 'completed' ? 'cs-line-completed' : ''}`} />
                      )}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* 工地动态 */}
            {Object.keys(updatesByStep).length > 0 && (
              <View className='cs-section-card'>
                <View className='cs-section-header'>
                  <Icon name='image' size={30} color='#122b4d' />
                  <Text className='cs-section-title'>工地动态</Text>
                </View>

                {Object.entries(updatesByStep).map(([stepId, updates]) => {
                  const step = constructionSteps.find((s) => s.id === stepId);
                  return (
                    <View key={stepId} className='cs-update-group'>
                      {/* 阶段标签 */}
                      <View className='cs-update-step-tag'>{step?.name || '施工阶段'}</View>

                      {updates.map((update) => (
                        <View key={update.id} className='cs-update-item'>
                          {/* 发布者信息 */}
                          <Text className='cs-update-author'>{update.author}</Text>

                          {/* 动态内容 */}
                          {update.content && (
                            <Text className='cs-update-content'>{update.content}</Text>
                          )}

                          {/* 图片/视频展示 */}
                          {(update.images?.length > 0 || update.videos?.length > 0) && (
                            <View className='cs-media-grid'>
                              {update.images?.map((imgUrl, imgIdx) => (
                                <View
                                  key={imgIdx}
                                  className='cs-media-item'
                                  onClick={() =>
                                    Taro.previewImage({
                                      current: imgUrl,
                                      urls: update.images!,
                                    })
                                  }
                                >
                                  <Image className='cs-media-image' src={imgUrl} mode='aspectFill' />
                                </View>
                              ))}
                              {update.videos?.map((videoUrl, vidIdx) => (
                                <View key={vidIdx} className='cs-media-item cs-media-video'>
                                  <Image
                                    className='cs-video-thumb'
                                    src={videoUrl}
                                    mode='aspectFill'
                                  />
                                  <View className='cs-video-play'>
                                    <Icon name='play-circle' size={40} color='#ffffff' />
                                  </View>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

      <View className='safe-bottom' />

      {/* 固定底部预约按钮 */}
      <View className='cs-bottom-bar'>
        <View className='btn-primary cs-reserve-btn' onClick={handleReserve}>
          <Icon name='calendar' size={32} color='#ffffff' />
          <Text className='cs-reserve-text'>立即预约</Text>
        </View>
      </View>
    </View>
  );
}
