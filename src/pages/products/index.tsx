import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../components/Icon';
import api from '../../utils/api';
import './index.scss';

const seriesList = ['全部', 'S100系列', 'S97系列', '全景落地窗', '推拉门', '平开门'];
const spaceList = ['全部空间', '客厅', '卧室', '阳台', '厨房', '书房'];
const styleList = ['全部风格', '现代简约', '轻奢', '新中式', '北欧'];

export default function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [activeSeries, setActiveSeries] = useState('全部');
  const [activeSpace, setActiveSpace] = useState('全部空间');
  const [activeStyle, setActiveStyle] = useState('全部风格');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    api.get('/products')
      .then((res: any) => setProducts(res || []))
      .catch(() => setProducts([]));
  }, []);

  const filteredProducts = products.filter((item: any) => {
    if (activeSeries !== '全部' && item.series !== activeSeries) return false;
    if (searchKeyword && !item.name?.includes(searchKeyword)) return false;
    return true;
  });

  return (
    <ScrollView className='products-page' scrollY>
      {/* 搜索栏 */}
      <View className='search-bar'>
        <View className='search-input-wrap'>
          <Icon name='search' size={32} color='#9ca3af' />
          <Text
            className='search-input'
            onClick={() => Taro.navigateTo({ url: '/subpackages/client/search/index?type=product' })}
          >搜索产品名称或型号</Text>
        </View>
      </View>

      {/* 系列筛选 */}
      <View className='filter-section'>
        <View className='filter-label'>
          <Text className='filter-label-text'>产品系列</Text>
          <Icon name='chevron-down' size={24} color='#6b7280' />
        </View>
        <ScrollView className='filter-scroll' scrollX showScrollbar={false}>
          <View className='filter-tags'>
            {seriesList.map((s) => (
              <View
                key={s}
                className={`filter-tag ${activeSeries === s ? 'filter-tag-active' : ''}`}
                onClick={() => setActiveSeries(s)}
              >
                <Text className={`filter-tag-text ${activeSeries === s ? 'filter-tag-text-active' : ''}`}>{s}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 空间筛选 */}
      <View className='filter-section'>
        <View className='filter-label'>
          <Text className='filter-label-text'>适用空间</Text>
        </View>
        <ScrollView className='filter-scroll' scrollX showScrollbar={false}>
          <View className='filter-tags'>
            {spaceList.map((s) => (
              <View
                key={s}
                className={`filter-tag ${activeSpace === s ? 'filter-tag-active' : ''}`}
                onClick={() => setActiveSpace(s)}
              >
                <Text className={`filter-tag-text ${activeSpace === s ? 'filter-tag-text-active' : ''}`}>{s}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 风格筛选 */}
      <View className='filter-section'>
        <View className='filter-label'>
          <Text className='filter-label-text'>设计风格</Text>
        </View>
        <ScrollView className='filter-scroll' scrollX showScrollbar={false}>
          <View className='filter-tags'>
            {styleList.map((s) => (
              <View
                key={s}
                className={`filter-tag ${activeStyle === s ? 'filter-tag-active' : ''}`}
                onClick={() => setActiveStyle(s)}
              >
                <Text className={`filter-tag-text ${activeStyle === s ? 'filter-tag-text-active' : ''}`}>{s}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 产品网格 */}
      <View className='product-grid'>
        {filteredProducts.map((item: any) => {
          let features: string[] = [];
          try { features = JSON.parse(item.features || '[]'); } catch {}
          return (
            <View
              key={item.id}
              className='product-card'
              onClick={() =>
                Taro.navigateTo({ url: `/subpackages/client/product-detail/index?id=${item.id}` })
              }
            >
              <View className='product-card-img'>
                {item.imageUrl ? (
                  <Image className='product-card-image' src={item.imageUrl} mode='aspectFill' />
                ) : (
                  <View className='product-card-placeholder'>
                    <Icon name='window' size={72} color='#b0c4d8' />
                  </View>
                )}
              </View>
              <View className='product-card-body'>
                <Text className='product-card-name'>{item.name || item.title}</Text>
                <Text className='product-card-series'>{item.series || item.category}</Text>
                <View className='product-card-tags'>
                  {features.slice(0, 3).map((f, i) => (
                    <Text key={i} className='feature-tag'>{f}</Text>
                  ))}
                </View>
              </View>
            </View>
          );
        })}
        {filteredProducts.length === 0 && (
          <View className='empty-state'>
            <Icon name='inbox' size={80} color='#d1d5db' />
            <Text className='empty-text'>暂无相关产品</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
