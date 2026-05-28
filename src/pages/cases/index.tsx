import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../components/Icon';
import api from '../../utils/api';
import './index.scss';

export default function Cases() {
  const [cases, setCases] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'national' | 'local'>('national');
  const [loading, setLoading] = useState(false);

  const fetchCases = useCallback(async (mode: 'national' | 'local') => {
    setLoading(true);
    try {
      let url = '/cases?published=true';
      if (mode === 'local') {
        try {
          const loc = await Taro.getLocation({ type: 'gcj02' });
          url += `&lat=${loc.latitude}&lng=${loc.longitude}`;
        } catch {
          // 定位失败继续请求，仅不传坐标
          Taro.showToast({ title: '定位失败，展示全部案例', icon: 'none' });
        }
      }
      const res: any = await api.get(url);
      setCases(res || []);
    } catch {
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases('national');
  }, [fetchCases]);

  const switchMode = (mode: 'national' | 'local') => {
    setViewMode(mode);
    fetchCases(mode);
  };

  return (
    <ScrollView className='cases-page' scrollY>
      {/* 顶部标题区 */}
      <View className='cases-header'>
        <Text className='cases-title'>案例服务</Text>
        <Text className='cases-subtitle'>精选实景案例 · 见证品质交付</Text>
      </View>

      {/* 全国/本地切换 */}
      <View className='view-toggle'>
        <View
          className={`toggle-btn ${viewMode === 'national' ? 'toggle-active' : ''}`}
          onClick={() => switchMode('national')}
        >
          <Text className={`toggle-text ${viewMode === 'national' ? 'toggle-text-active' : ''}`}>全国案例</Text>
        </View>
        <View
          className={`toggle-btn ${viewMode === 'local' ? 'toggle-active' : ''}`}
          onClick={() => switchMode('local')}
        >
          <Text className={`toggle-text ${viewMode === 'local' ? 'toggle-text-active' : ''}`}>附近工地</Text>
        </View>
      </View>

      {/* 加载中 */}
      {loading && (
        <View className='loading-hint'>
          <Text className='loading-text'>加载中...</Text>
        </View>
      )}

      {/* 案例列表 */}
      {!loading && (
        <View className='case-list'>
          {cases.map((item: any) => (
            <View
              key={item.id}
              className='case-card'
              onClick={() =>
                Taro.navigateTo({ url: `/subpackages/client/case-detail/index?id=${item.id}` })
              }
            >
              <View className='case-card-img'>
                {item.coverImage || item.imageUrl ? (
                  <Image
                    className='case-card-image'
                    src={item.coverImage || item.imageUrl}
                    mode='aspectFill'
                  />
                ) : (
                  <View className='case-card-placeholder'>
                    <Icon name='image' size={64} color='#b0c4d8' />
                  </View>
                )}
                {viewMode === 'local' && item.distance != null ? (
                  <View className='case-distance-tag'>
                    <Icon name='map-pin' size={20} color='#ffffff' />
                    <Text className='distance-tag-text'>距您 {item.distance}km</Text>
                  </View>
                ) : (
                  <View className='case-city-tag'>
                    <Text className='city-tag-text'>{item.store?.name || '上海'}</Text>
                  </View>
                )}
              </View>
              <View className='case-card-body'>
                <Text className='case-card-title'>{item.title}</Text>
                <View className='case-card-meta'>
                  <View className='meta-item'>
                    <Icon name='home' size={24} color='#9ca3af' />
                    <Text className='meta-text'>{item.houseArea}平 · {item.houseType || '住宅'}</Text>
                  </View>
                  <View className='meta-item'>
                    <Icon name='map-pin' size={24} color='#9ca3af' />
                    <Text className='meta-text'>{item.communityName || '上海市松江区'}</Text>
                  </View>
                </View>
                <View className='case-card-footer'>
                  <View className='case-product-tag'>
                    <Text className='product-tag-text'>{item.productSeries || 'S100系列'}</Text>
                  </View>
                  <View className='case-views'>
                    <Icon name='eye' size={24} color='#9ca3af' />
                    <Text className='views-text'>{item.views || 0}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
          {cases.length === 0 && (
            <View className='empty-state'>
              <Icon name='inbox' size={80} color='#d1d5db' />
              <Text className='empty-text'>暂无相关案例</Text>
            </View>
          )}
        </View>
      )}

      <View className='safe-bottom' />
    </ScrollView>
  );
}
