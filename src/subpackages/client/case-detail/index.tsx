import { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Swiper, SwiperItem } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

export default function CaseDetail() {
  const router = useRouter();
  const id = router.params.id;
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/cases/${id}`)
        .then((res: any) => setDetail(res))
        .catch(() => setDetail(null));
    }
  }, [id]);

  // 解析图片数组，兼容 coverImage 回退
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

  if (!detail) {
    return <View className='cs-loading'><Text>加载中...</Text></View>;
  }

  const hasImages = images.length > 0;

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
      <View className='cs-body'>
        <Text className='cs-title'>{detail.title}</Text>
        <View className='cs-meta'>
          <View className='cs-meta-item'>
            <Icon name='map-pin' size={28} color='#6b7280' />
            <Text>{detail.communityName || '-'}</Text>
          </View>
          <Text className='cs-meta-item'>{detail.houseArea}平</Text>
          <Text className='cs-meta-item'>{detail.houseType || '住宅'}</Text>
        </View>
        <View className='cs-views'>
          <Icon name='eye' size={28} color='#9ca3af' />
          <Text>{detail.views} 次浏览</Text>
        </View>

        {/* 案例详情 */}
        <View className='cs-section'>
          <Text className='cs-section-title'>案例详情</Text>
          <Text className='cs-desc'>{detail.description || '暂无描述'}</Text>
        </View>

        {/* 相关产品 */}
        {associatedProducts.length > 0 && (
          <View className='cs-section'>
            <Text className='cs-section-title'>相关产品</Text>
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
                  <Icon name='arrow-right-s' size={32} color='#b0c4d8' />
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View className='safe-bottom' />

      {/* 固定底部预约按钮 */}
      <View className='cs-bottom-bar'>
        <View
          className='btn-primary cs-reserve-btn'
          onClick={() => Taro.navigateTo({ url: '/subpackages/client/reservation/index' })}
        >
          <Text>我也要预约</Text>
        </View>
      </View>
    </View>
  );
}
