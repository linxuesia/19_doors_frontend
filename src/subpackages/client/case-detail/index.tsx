import { useState, useEffect, useMemo, useRef } from 'react';
import { View, Text, Image, Swiper, SwiperItem, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter, useShareAppMessage } from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import { CONSTRUCTION_STAGES } from '../../../constants/construction-stages';
import './index.scss';

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

/** 从扫码 scene 还原 UUID（去横线 → 加回横线） */
function sceneToUuid(scene: string): string {
  const s = decodeURIComponent(scene);
  // 32 位 hex → 加上横线变标准 UUID
  if (/^[0-9a-f]{32}$/i.test(s)) {
    return `${s.slice(0,8)}-${s.slice(8,12)}-${s.slice(12,16)}-${s.slice(16,20)}-${s.slice(20)}`;
  }
  return s;
}

export default function CaseDetail() {
  const router = useRouter();
  const scene = router.params.scene;
  const id = router.params.id || (scene ? sceneToUuid(scene) : undefined);
  const [detail, setDetail] = useState<any>(null);
  const [siteUpdates, setSiteUpdates] = useState<SiteUpdate[]>([]);

  // 使用统一施工阶段常量，根据工地动态判断各阶段状态
  const constructionSteps = useMemo(() => {
    return CONSTRUCTION_STAGES.map((stage, index) => {
      const hasUpdates = siteUpdates.some(
        (u) => u.stepName === stage.label || u.stepId?.includes(stage.key)
      );
      // 找到第一个未完成的阶段标记为 in_progress
      const prevAllCompleted = CONSTRUCTION_STAGES.slice(0, index).every((s) =>
        siteUpdates.some((u) => u.stepName === s.label || u.stepId?.includes(s.key))
      );
      let status: 'pending' | 'in_progress' | 'completed' = 'pending';
      if (hasUpdates) status = 'completed';
      else if (prevAllCompleted && !hasUpdates) status = 'in_progress';
      return { id: stage.key, name: stage.label, status };
    });
  }, [siteUpdates]);

  useEffect(() => {
    if (!id) return;

    api.get(`/cases/${id}`)
      .then((res: any) => {
        setDetail(res);

        api.get(`/cases/${id}/site-updates`)
          .then((updates: any) => setSiteUpdates(Array.isArray(updates) ? updates : []))
          .catch(() => setSiteUpdates([]));
      })
      .catch(() => setDetail(null));
  }, [id]);

  // 分享配置（用 ref 避免闭包捕获旧值）
  const detailRef = useRef<any>(null);
  detailRef.current = detail;

  useShareAppMessage(() => ({
    title: detailRef.current?.title || '案例详情 - 19分贝系统门窗',
    path: `/subpackages/client/case-detail/index?id=${id}`,
    imageUrl: detailRef.current?.coverImage || '',
  }));

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

  // 按施工阶段分组工地动态
  const updatesByStep = useMemo(() => {
    const grouped: Record<string, SiteUpdate[]> = {};
    siteUpdates.forEach((update) => {
      const key = update.stepId || update.id || 'default';
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(update);
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
            {siteUpdates.length > 0 && (
              <View className='cs-section-card'>
                <View className='cs-section-header'>
                  <Icon name='image' size={30} color='#122b4d' />
                  <Text className='cs-section-title'>工地动态</Text>
                  <Text className='cs-update-count'>{siteUpdates.length}条更新</Text>
                </View>

                {Object.entries(updatesByStep).map(([stepId, updates]) => {
                  const step = constructionSteps.find((s) => s.id === stepId);
                  const stepName = step?.name || updates[0]?.stepName || '施工阶段';

                  return (
                    <View key={stepId} className='cs-update-group'>
                      {/* 阶段标签 */}
                      <View className='cs-update-step-tag'>{stepName}</View>

                      {updates.map((update) => (
                        <View key={update.id} className='cs-update-item'>
                          {/* 发布者和时间 */}
                          <View className='cs-update-header'>
                            <Text className='cs-update-author'>{update.author || '管理员'}</Text>
                            {update.createdAt && (
                              <Text className='cs-update-time'>
                                {new Date(update.createdAt).toLocaleDateString('zh-CN', {
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </Text>
                            )}
                          </View>

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
      </ScrollView>

      <View className='safe-bottom' />

      {/* 固定底部操作栏 */}
      <View className='cs-bottom-bar'>
        <Button className='cs-share-btn' openType='share'>
          <Icon name='chat' size={32} color='#122b4d' />
          <Text className='cs-share-text'>分享</Text>
        </Button>
        <View className='btn-primary cs-reserve-btn' onClick={handleReserve}>
          <Icon name='calendar' size={32} color='#ffffff' />
          <Text className='cs-reserve-text'>立即预约</Text>
        </View>
      </View>
    </View>
  );
}
