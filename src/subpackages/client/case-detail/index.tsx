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

  // ====== 开发调试：Mock 数据开关（设为 true 启用） ======
  const USE_MOCK_DATA = false;
  // =====================================================

  useEffect(() => {
    if (id) {
      // 如果启用 Mock 模式，直接使用模拟数据
      if (USE_MOCK_DATA) {
        console.log('[CaseDetail] 🎭 使用 Mock 数据模式');

        // 模拟案例详情（包含 type: 'LOCAL' 和 storeId）
        const mockDetail = {
          id: id,
          title: '上海市松江区涞亭南路S88',
          communityName: '上海',
          houseType: '住宅',
          description: '全屋采用极简主义窄边系统窗，型材边缘仅如笔触般纤细。',
          type: 'LOCAL',          // 关键：本地案例
          storeId: 'S001',         // 关键：有门店ID
          coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80',
        };
        setDetail(mockDetail);

        // 模拟施工进度数据
        const mockConstructionSteps: ConstructionStep[] = [
          { id: 's1', name: '施工准备与防护', status: 'completed' },
          { id: 's2', name: '洞口复核与基层处理', status: 'completed' },
          { id: 's3', name: '窗框定位与固定', status: 'completed' },
          { id: 's4', name: '发泡与防水密封', status: 'in_progress' },
          { id: 's5', name: '中空玻璃安装', status: 'pending' },
          { id: 's6', name: '完工保护与验收', status: 'pending' },
          { id: 's7', name: '质保服务', status: 'pending' },
        ];
        setConstructionSteps(mockConstructionSteps);
        console.log('[CaseDetail] 📋 Mock 施工进度:', mockConstructionSteps.length, '条');

        // 模拟工地动态数据（完全按照你的截图格式）
        const mockSiteUpdates: SiteUpdate[] = [
          {
            id: 'u11',
            caseId: id,
            stepId: 's11',
            stepName: '现场勘测',
            author: '李师傅',
            content: '现场勘测完成，窗户尺寸已精准测量。客厅面宽6.3米，窗洞高度2.4米，确认采用S100系列全景落地窗方案',
            images: [
              'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1581092335871-4c7c80f83b8e?auto=format&fit=crop&w=400&q=80',
            ],
            videos: null,
            createdAt: '2026-05-29T13:10:03.690Z',
          },
          {
            id: 'u12',
            caseId: id,
            stepId: 's12',
            stepName: '旧窗拆除',
            author: '王工头',
            content: '施工辅材全系德国伍尔特\n安全防护措施已准备\n门窗主材配置核对',
            images: [
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1503387762-592fa551a946?auto=format&fit=crop&w=400&q=80',
              'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
            ],
            videos: null,
            createdAt: '2026-05-28T15:30:00.000Z',
          },
          {
            id: 'u13',
            caseId: id,
            stepId: 's13',
            stepName: '窗框安装',
            author: '张店长',
            content: '窗框安装进行中，已安装完成60%，预计明天全部完工',
            images: [
              'https://images.unsplash.com/photo-1504307651254-35680f3560fd?auto=format&fit=crop&w=400&q=80',
            ],
            videos: null,
            createdAt: '2026-05-30T09:20:00.000Z',
          },
          {
            id: 'u14',
            caseId: id,
            stepId: 's14',
            stepName: '玻璃安装',
            author: '李师傅',
            content: '中空钢化玻璃已到货，开始安装...',
            images: [],
            videos: null,
            createdAt: '2026-05-31T10:00:00.000Z',
          },
        ];
        setSiteUpdates(mockSiteUpdates);
        console.log('[CaseDetail] 🖼️ Mock 工地动态:', mockSiteUpdates.length, '条');
        console.log('[CaseDetail] 第一条:', JSON.stringify(mockSiteUpdates[0], null, 2));
        return;
      }

      // 真实接口调用
      api.get(`/cases/${id}`)
        .then(async (res: any) => {
          setDetail(res);

          // 详细输出案例信息用于调试
          console.log('[CaseDetail] ========== 案例详情开始加载 ==========');
          console.log('[CaseDetail] 完整响应:', JSON.stringify(res, null, 2));
          console.log('[CaseDetail] 关键字段:', {
            type: res.type,
            typeTypeof: typeof res.type,
            storeId: res.storeId,
            storeIdTypeof: typeof res.storeId,
            storeIdIsEmpty: res.storeId === '' || res.storeId === null || res.storeId === undefined,
          });

          // 判断是否为本地案例
          const isLocal = res.type === 'LOCAL' || !!res.storeId;
          console.log('[CaseDetail] isLocalCase 判断结果:', isLocal);
          console.log('[CaseDetail]   - type === "LOCAL":', res.type === 'LOCAL');
          console.log('[CaseDetail]   - !!storeId:', !!res.storeId, '(值:', res.storeId, ')');

          // 只有本地案例才加载工地动态
          if (isLocal) {
            console.log('[CaseDetail] ✅ 是本地案例，开始加载工地动态...');

            // 并行加载施工进度和工地动态
            const loadConstructionSteps = api.get(`/cases/${id}/construction-steps`)
              .then((stepsRes: any) => {
                console.log('[CaseDetail] ✅ 施工进度接口返回:', stepsRes);
                setConstructionSteps(Array.isArray(stepsRes) ? stepsRes : []);
              })
              .catch((e) => {
                console.warn('[CaseDetail] ⚠️ 施工进度接口失败:', e);
                setConstructionSteps([]);
              });

            const loadSiteUpdates = api.get(`/cases/${id}/site-updates`)
              .then((updatesRes: any) => {
                console.log('[CaseDetail] ✅ 工地动态接口返回:', updatesRes);
                console.log('[CaseDetail] 工地动态数量:', Array.isArray(updatesRes) ? updatesRes.length : 0);
                if (Array.isArray(updatesRes) && updatesRes.length > 0) {
                  console.log('[CaseDetail] 第一条数据示例:', JSON.stringify(updatesRes[0], null, 2));
                }
                setSiteUpdates(Array.isArray(updatesRes) ? updatesRes : []);
              })
              .catch((e) => {
                console.error('[CaseDetail] ❌ 工地动态接口失败:', e);
                setSiteUpdates([]);
              });

            await Promise.allSettled([loadConstructionSteps, loadSiteUpdates]);
          } else {
            console.log('[CaseDetail] ❌ 不是本地案例，跳过工地动态加载');
          }

          console.log('[CaseDetail] ========== 加载完成 ==========');
        })
        .catch((e) => {
          console.error('[CaseDetail] ❌ 加载案例详情失败:', e);
          setDetail(null);
        });
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

  // 判断是否为本地案例（业务逻辑：只有本地案例显示施工进度和工地动态）
  const isLocalCase = detail?.type === 'LOCAL' || !!detail?.storeId;

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

        {/* ====== 本地案例专属内容（业务逻辑：仅本地案例显示） ====== */}
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
