import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Image, Swiper, SwiperItem, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

export default function ProductDetail() {
  const router = useRouter();
  const id = router.params.id;
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`)
        .then((res: any) => setProduct(res))
        .catch(() => setProduct(null));
    }
  }, [id]);

  // 解析 Banner 轮播图片
  const bannerImages = useMemo(() => {
    if (!product) return [];
    try { return JSON.parse(product.images || '[]'); } catch { return []; }
  }, [product]);

  // 解析功能特性（JSON数组）
  const featuresList = useMemo(() => {
    if (!product) return [];
    try { return JSON.parse(product.features || '[]'); } catch { return []; }
  }, [product]);


  if (!product) {
    return (
      <View className='pd-loading'>
        <Text className='pd-loading-text'>加载中...</Text>
      </View>
    );
  }

  const hasBannerImages = bannerImages.length > 0;
  const hasDetailImage = !!product.detailImage;

  return (
    <ScrollView className='pd-page' scrollY>
      {/* Banner 图片 - 使用 images 字段 */}
      <View className='pd-banner'>
        {hasBannerImages ? (
          <Swiper className='pd-swiper' indicatorDots indicatorColor='rgba(255,255,255,0.5)' indicatorActiveColor='#122b4d' circular>
            {bannerImages.map((img: string, i: number) => (
              <SwiperItem key={i}>
                <Image className='pd-swiper-img' src={img} mode='aspectFill' />
              </SwiperItem>
            ))}
          </Swiper>
        ) : (
          <View className='pd-hero-placeholder'>
            <Icon name='window' size={96} color='#b0c4d8' />
          </View>
        )}
      </View>

      {/* 产品信息区域 */}
      <View className='pd-info-section'>
        {/* 产品标题 */}
        <Text className='pd-title'>{product.name}</Text>

        {/* 产品参数 - 始终显示3个属性 */}
        <View className='pd-specs-section'>
          <Text className='pd-section-title'>产品参数</Text>
          <View className='pd-specs-list'>
            <View className='pd-spec-item'>
              <Text className='pd-spec-label'>色彩</Text>
              <Text className='pd-spec-value'>{product.color || '-'}</Text>
            </View>
            <View className='pd-spec-item'>
              <Text className='pd-spec-label'>可适用空间</Text>
              <Text className='pd-spec-value'>{product.space || '-'}</Text>
            </View>
            <View className='pd-spec-item'>
              <Text className='pd-spec-label'>功能特性</Text>
              <Text className='pd-spec-value'>{featuresList.length > 0 ? featuresList.join('；') : '-'}</Text>
            </View>
          </View>
        </View>

        {/* 产品详情图 */}
        {hasDetailImage && (
          <View className='pd-detail-section'>
            <Text className='pd-section-title'>产品详情</Text>
            <Image
              className='pd-detail-img'
              src={product.detailImage}
              mode='widthFix'
              lazyLoad
            />
          </View>
        )}

        {/* 相关案例 */}
        <View className='pd-cases-section'>
          <Text className='pd-section-title'>相关案例</Text>
        </View>
      </View>

      {/* 底部操作栏 */}
      <View className='pd-bottom-bar'>
        <Button className='pd-contact-btn' openType='contact'>
          <Icon name='chat' size={36} color='#122b4d' />
          <Text className='pd-contact-text'>咨询</Text>
        </Button>
        <View
          className='btn-primary pd-reserve-btn'
          onClick={() => Taro.navigateTo({ url: '/subpackages/client/reservation/index' })}
        >
          <Icon name='calendar' size={32} color='#ffffff' />
          <Text>立即预约</Text>
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
