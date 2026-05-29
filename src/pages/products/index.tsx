import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../components/Icon';
import api from '../../utils/api';
import './index.scss';

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSpaces, setActiveSpaces] = useState<string[]>([]);
  const [activeStyles, setActiveStyles] = useState<string[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);

  const spaces = ['客厅', '厨房', '卫生间', '卧室'];
  const styles = ['现代简约', '奶油风', '中古风'];
  const colors = ['宝马灰', '珐琅白', '金属咖', '星空黑', '黑晶石'];

  useEffect(() => {
    api.get('/products').then((res: any) => {
      const list = Array.isArray(res) ? res : [];
      setProducts(list);
    }).catch(() => {
      Taro.showToast({ title: '加载产品失败', icon: 'none' });
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const toggleFilter = (value: string, active: string[], setter: (v: string[]) => void) => {
    if (active.includes(value)) {
      setter(active.filter((v) => v !== value));
    } else {
      setter([...active, value]);
    }
  };

  // 按筛选条件过滤产品
  const filteredProducts = products.filter((p: any) => {
    if (activeSpaces.length > 0 && p.space) {
      const productSpaces = typeof p.space === 'string' ? p.space.split(',') : [];
      if (!activeSpaces.some((s) => productSpaces.includes(s))) return false;
    }
    if (activeStyles.length > 0 && p.style) {
      if (!activeStyles.includes(p.style)) return false;
    }
    if (activeColors.length > 0 && p.color) {
      if (!activeColors.includes(p.color)) return false;
    }
    return true;
  });

  return (
    <ScrollView className='products-page' scrollY>
      {/* 系列标签 */}
      <View className='series-tag'>
        <Text className='series-label'>系列:</Text>
        <Text className='series-value'>平开窗</Text>
      </View>

      {/* 空间筛选 */}
      <View className='filter-section'>
        <Text className='filter-label'>空间:</Text>
        <ScrollView className='filter-scroll' scrollX showScrollbar={false}>
          <View className='filter-options'>
            {spaces.map((s) => (
              <View
                key={s}
                className={`filter-option ${activeSpaces.includes(s) ? 'filter-option-active' : ''}`}
                onClick={() => toggleFilter(s, activeSpaces, setActiveSpaces)}
              >
                <Text className='filter-option-text'>{s}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 风格筛选 */}
      <View className='filter-section'>
        <Text className='filter-label'>风格:</Text>
        <ScrollView className='filter-scroll' scrollX showScrollbar={false}>
          <View className='filter-options'>
            {styles.map((s) => (
              <View
                key={s}
                className={`filter-option ${activeStyles.includes(s) ? 'filter-option-active' : ''}`}
                onClick={() => toggleFilter(s, activeStyles, setActiveStyles)}
              >
                <Text className='filter-option-text'>{s}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 色彩筛选 */}
      <View className='filter-section'>
        <Text className='filter-label'>色彩:</Text>
        <ScrollView className='filter-scroll' scrollX showScrollbar={false}>
          <View className='filter-options'>
            {colors.map((c) => (
              <View
                key={c}
                className={`filter-option ${activeColors.includes(c) ? 'filter-option-active' : ''}`}
                onClick={() => toggleFilter(c, activeColors, setActiveColors)}
              >
                <Text className='filter-option-text'>{c}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 产品网格 */}
      <View className='product-grid'>
        {loading ? (
          <View className='product-loading'>
            <Text className='loading-text'>加载中...</Text>
          </View>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((item: any) => (
            <View
              key={item.id}
              className='product-card'
              onClick={() =>
                Taro.navigateTo({ url: `/subpackages/client/product-detail/index?id=${item.id}` })
              }
            >
              <View className='product-card-img'>
                {item.coverImage ? (
                  <Image className='product-card-image' src={item.coverImage} mode='aspectFill' />
                ) : (
                  <View className='product-card-placeholder'>
                    <Icon name='window' size={72} color='#b0c4d8' />
                  </View>
                )}
              </View>
              <View className='product-card-body'>
                <Text className='product-card-name'>{item.name}</Text>
                <Text className='product-card-series'>{item.series}</Text>
                {item.features && (
                  <View className='product-card-tags'>
                    {(typeof item.features === 'string' ? JSON.parse(item.features) : item.features).slice(0, 3).map((f: string, i: number) => (
                      <Text key={i} className='feature-tag'>{f}</Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View className='product-empty'>
            <Icon name='window' size={64} color='#d1d5db' />
            <Text className='empty-text'>暂无产品</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
