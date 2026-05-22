import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
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

  if (!product) {
    return <View className='loading'><Text className='loading-text'>加载中...</Text></View>;
  }

  let features: string[] = [];
  try { features = JSON.parse(product.features || '[]'); } catch {}

  return (
    <View className='pd-page'>
      <View className='pd-hero'>
        <View className='pd-hero-placeholder'>
          <Icon name='window' size={96} color='#b0c4d8' />
        </View>
      </View>
      <View className='pd-body'>
        <Text className='pd-name'>{product.name}</Text>
        <Text className='tag tag-brand pd-cat'>{product.category}</Text>

        <View className='pd-section'>
          <Text className='pd-section-title'>核心卖点</Text>
          <View className='pd-features'>
            {features.map((f: string, i: number) => (
              <View key={i} className='pd-feature-item'>
                <Icon name='star' size={28} color='#122b4d' />
                <Text> {f}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='pd-section'>
          <Text className='pd-section-title'>产品检测报告</Text>
          <View className='pd-report'>
            {[
              { label: '抗风压性能', value: '9级' },
              { label: '水密性能', value: '6级' },
              { label: '气密性能', value: '8级' },
              { label: '隔音性能', value: '40dB' },
            ].map((r) => (
              <View key={r.label} className='pd-report-row'>
                <Text className='pd-report-label'>{r.label}</Text>
                <Text className='pd-report-value'>{r.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='pd-actions'>
          <View className='btn-primary pd-btn' onClick={() => Taro.navigateTo({ url: '/subpackages/client/reservation/index' })}>
            <Text>预约量尺</Text>
          </View>
          <View className='btn-outline pd-btn' onClick={() => Taro.switchTab({ url: '/pages/about/index' })}>
            <Text>查找门店</Text>
          </View>
        </View>
      </View>
      <View className='safe-bottom' />
    </View>
  );
}
