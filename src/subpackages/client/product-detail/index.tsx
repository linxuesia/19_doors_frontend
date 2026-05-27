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

  // 解析 JSON 字段
  const images = useMemo(() => {
    if (!product) return [];
    try { return JSON.parse(product.images || '[]'); } catch { return []; }
  }, [product]);

  const features = useMemo(() => {
    if (!product) return [];
    try { return JSON.parse(product.features || '[]'); } catch { return []; }
  }, [product]);

  const specs: Record<string, string> = useMemo(() => {
    if (!product) return {};
    try { return JSON.parse(product.specs || '{}'); } catch { return {}; }
  }, [product]);

  if (!product) {
    return (
      <View className='pd-loading'>
        <Text className='pd-loading-text'>加载中...</Text>
      </View>
    );
  }

  const hasImages = images.length > 0;
  const specEntries = Object.entries(specs);

  return (
    <ScrollView className='pd-page' scrollY>
      {/* 图片轮播 */}
      <View className='pd-swiper-wrap'>
        {hasImages ? (
          <Swiper className='pd-swiper' indicatorDots indicatorColor='rgba(255,255,255,0.5)' indicatorActiveColor='#122b4d' circular>
            {images.map((img: string, i: number) => (
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

      {/* 产品信息 */}
      <View className='pd-info'>
        <Text className='pd-name'>{product.name}</Text>
        <View className='pd-meta'>
          <Text className='tag tag-brand'>{product.category}</Text>
          {product.series && <Text className='pd-series'>{product.series}</Text>}
        </View>

        {/* 核心卖点 */}
        {features.length > 0 && (
          <View className='pd-section'>
            <Text className='pd-section-title'>核心卖点</Text>
            <View className='pd-features'>
              {features.map((f: string, i: number) => (
                <View key={i} className='pd-feature-item'>
                  <Icon name='check-circle' size={32} color='#122b4d' />
                  <Text className='pd-feature-text'>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 技术规格 */}
        {specEntries.length > 0 && (
          <View className='pd-section'>
            <Text className='pd-section-title'>技术规格</Text>
            <View className='pd-specs'>
              {specEntries.map(([key, value]) => (
                <View key={key} className='pd-spec-row'>
                  <Text className='pd-spec-label'>{key}</Text>
                  <Text className='pd-spec-value'>{value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
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
          <Text>免费预约量尺</Text>
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
