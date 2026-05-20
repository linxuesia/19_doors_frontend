import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import api from '../../utils/api';
import './index.scss';

const categories = ['全部', '平开窗', '推拉门', '阳光房'];

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [activeCat, setActiveCat] = useState('全部');

  useEffect(() => {
    const cat = activeCat === '全部' ? '' : activeCat;
    api.get(`/products${cat ? `?category=${cat}` : ''}`)
      .then((res: any) => setProducts(res || []))
      .catch(() => setProducts([]));
  }, [activeCat]);

  return (
    <ScrollView className='products-page' scrollY>
      <View className='page-padding'>
        <Text className='page-title'>产品中心</Text>

        {/* 分类标签 */}
        <ScrollView className='cat-scroll' scrollX showScrollbar={false}>
          <View className='cat-list'>
            {categories.map((cat) => (
              <View
                key={cat}
                className={`cat-item ${activeCat === cat ? 'cat-active' : ''}`}
                onClick={() => setActiveCat(cat)}
              >
                <Text className={`cat-text ${activeCat === cat ? 'cat-text-active' : ''}`}>
                  {cat}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 产品网格 */}
        <View className='product-grid'>
          {products.map((item: any) => {
            let features: string[] = [];
            try { features = JSON.parse(item.features || '[]'); } catch {}
            return (
              <View
                key={item.id}
                className='product-grid-card'
                onClick={() =>
                  Taro.navigateTo({ url: `/subpackages/client/product-detail/index?id=${item.id}` })
                }
              >
                <View className='product-grid-img'>
                  <Text className='product-grid-icon'>🪟</Text>
                </View>
                <View className='product-grid-info'>
                  <Text className='product-grid-name'>{item.name}</Text>
                  <Text className='product-grid-cat'>{item.category}</Text>
                  <View className='product-grid-tags'>
                    {features.slice(0, 3).map((f, i) => (
                      <Text key={i} className='tag tag-brand'>{f}</Text>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
          {products.length === 0 && (
            <View className='empty-state'>
              <Text className='empty-text'>暂无产品</Text>
            </View>
          )}
        </View>
      </View>
      <View className='safe-bottom' />
    </ScrollView>
  );
}
