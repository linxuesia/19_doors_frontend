import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Map, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../components/Icon';

import api from '../../utils/api';
import './index.scss';

// 上海周边模拟工地坐标
const defaultMarkers = [
  { id: 1, longitude: 121.4737, latitude: 31.2304, title: '芯汇花园5-1902', status: '下单备料' },
  { id: 2, longitude: 121.4200, latitude: 31.2150, title: '泊岸时光印19幢', status: '已完工' },
  { id: 3, longitude: 121.5100, latitude: 31.2500, title: '金平路555弄', status: '施工中' },
  { id: 4, longitude: 121.3800, latitude: 31.2000, title: '苏州展厅', status: '已完工' },
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any>(defaultMarkers[0]);

  const markers = (sites.length > 0 ? sites : defaultMarkers).map((site: any, i: number) => ({
    id: site.id || i + 1,
    longitude: site.longitude || defaultMarkers[i]?.longitude || 121.4737,
    latitude: site.latitude || defaultMarkers[i]?.latitude || 31.2304,
    title: site.title || site.name || '',
    iconPath: '',
    width: 32,
    height: 32,
    callout: {
      content: site.title || site.name || '',
      color: '#122b4d',
      fontSize: 13,
      borderRadius: 8,
      padding: 8,
      display: 'ALWAYS',
    },
  }));

  const handleMarkerTap = (e: any) => {
    const id = e.detail?.markerId || e.markerId;
    const site = (sites.length > 0 ? sites : defaultMarkers).find(
      (s: any, i: number) => (s.id || i + 1) === id
    );
    if (site) setSelectedMarker(site);
  };

  useEffect(() => {
    Promise.all([
      api.get('/products').catch(() => []),
      api.get('/cases?published=true').catch(() => []),
      api.get('/sites').catch(() => []),
    ]).then(([p, c, s]) => {
      setProducts((p as any)?.slice?.(0, 4) || []);
      setCases((c as any)?.slice?.(0, 6) || []);
      setSites((s as any)?.slice?.(0, 6) || []);
    });
  }, []);

  const navigate = (url: string) => Taro.navigateTo({ url });

  return (
    <ScrollView className='home-page' scrollY>
      {/* Banner */}
      <View className='hero-banner'>
        <View className='hero-banner-bg' />
        <Image
          className='hero-image'
          src='https://cdn.juesedao.cn/mdy/120bdd3bf36f49e49ef335d346e91ec4'
          mode='widthFix'
        />
        <Button className='customer-service' openType='contact'>
          <Text className='cs-text'>客服</Text>
        </Button>
      </View>

      {/* 负责人信息卡片 */}
      <View className='manager-card'>
        <Image
          className='manager-avatar'
          src='https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
        />
        <View className='manager-info'>
          <Text className='manager-name'>李振扬</Text>
          <Text className='manager-store'>上海19分贝门窗直营店</Text>
        </View>
        <View className='manager-actions'>
          <View className='action-icon' onClick={() => Taro.makePhoneCall({ phoneNumber: '13800138000' })}>
            <Icon name='phone' size={36} color='#122b4d' />
          </View>
          <View className='action-icon' onClick={() => {}}>
            <Icon name='map-pin' size={36} color='#122b4d' />
          </View>
          <View className='action-icon' onClick={() => {}}>
            <Icon name='qr-code' size={36} color='#122b4d' />
          </View>
        </View>
      </View>

      {/* 新品推荐 */}
      <View className='index-section'>
        <View className='index-section-badge'>
          <Text className='badge-text'>新品推荐</Text>
          <Text className='badge-en'>NEW ARRIVAL</Text>
        </View>
        <ScrollView className='product-scroll' scrollX showScrollbar={false}>
          {[
            { id: 'p1', name: '1', image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?auto=format&fit=crop&w=800&q=80' },
            { id: 'p2', name: 'S100', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80' },
            { id: 'p3', name: 'S97', image: 'https://images.unsplash.com/photo-1600566753080-00e5bc57bb55?auto=format&fit=crop&w=800&q=80' },
            { id: 'p4', name: '全景落地窗', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80' },
          ].map((item) => (
            <View
              key={item.id}
              className='product-card'
              onClick={() => navigate(`/subpackages/client/product-detail/index?id=${item.id}`)}
            >
              <Image className='product-img' src={item.image} mode='aspectFill' />
              <View className='product-footer'>
                <View className='product-dot' />
                <Text className='product-name'>{item.name}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View className='pagination-dots'>
          <View className='dot dot-active' />
          <View className='dot' />
        </View>
      </View>

      {/* 全国工地地图 */}
      <View className='index-section'>
        <View className='index-section-badge'>
          <Text className='badge-text'>全国工地地图</Text>
          <Text className='badge-en'>NATIONAL SITE MAP</Text>
        </View>
        <View className='map-container'>
          <Map
            className='index-map'
            longitude={121.4737}
            latitude={31.2304}
            scale={12}
            markers={markers}
            showLocation
            onMarkerTap={handleMarkerTap}
          />
          {selectedMarker && (
            <View className='site-marker'>
              <View className='marker-dot' />
              <View className='marker-info'>
                <Text className='marker-label'>附近的工地</Text>
                <Text className='marker-title'>{selectedMarker.title || selectedMarker.name}</Text>
                <Text className='marker-status'>{selectedMarker.status || '施工中'}</Text>
              </View>
            </View>
          )}
          <View className='view-all-btn' onClick={() => Taro.switchTab({ url: '/pages/cases/index' })}>
            <Text className='view-all-text'>查看全部</Text>
          </View>
        </View>
      </View>

      {/* 工地列表 */}
      <View className='index-section'>
        <View className='site-grid'>
          {[
            { id: 's1', title: '芯汇花园5-1902', location: '苏州市', image: '' },
            { id: 's2', title: '泊岸时光印19幢', location: '苏州市', image: '' },
            { id: 's3', title: '苏州展厅', location: '苏州市', image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?auto=format&fit=crop&w=800&q=80' },
            { id: 's4', title: '金平路555弄', location: '上海市', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80' },
          ].map((item) => (
            <View
              key={item.id}
              className='site-grid-item'
              onClick={() => navigate(`/subpackages/client/site-detail/index?id=${item.id}`)}
            >
              {item.image ? (
                <Image className='site-grid-img' src={item.image} mode='aspectFill' />
              ) : (
                <View className='site-grid-placeholder'>
                  <Text className='brand-logo'>SOJOY <Text className='brand-highlight'>19分贝</Text></Text>
                  <Text className='brand-slogan'>系统窗臻 选19分贝</Text>
                </View>
              )}
              <View className='site-grid-info'>
                <Text className='site-grid-location'>{item.location} | {item.title}</Text>
              </View>
            </View>
          ))}
        </View>
        <View className='view-more-btn' onClick={() => Taro.switchTab({ url: '/pages/cases/index?tab=site' })}>
          <Text className='view-more-text'>查看更多</Text>
        </View>
      </View>

      {/* 门店资质 */}
      <View className='index-section'>
        <View className='index-section-badge'>
          <Text className='badge-text'>门店资质</Text>
          <Text className='badge-en'>STORE QUALIFICATION</Text>
        </View>
        <ScrollView className='qualification-scroll' scrollX showScrollbar={false}>
          {[
            { id: 'q1', title: '行业发展标杆', store: '上海19分贝门窗直营店', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80' },
            { id: 'q2', title: '大商资质', store: '上海19分贝门窗直营店', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80' },
          ].map((item) => (
            <View key={item.id} className='qualification-card'>
              <Image className='qualification-img' src={item.image} mode='aspectFill' />
              <Text className='qualification-title'>{item.title}</Text>
              <Text className='qualification-store'>{item.store}</Text>
            </View>
          ))}
        </ScrollView>
        <View className='pagination-dots'>
          <View className='dot dot-active' />
          <View className='dot' />
          <View className='dot' />
        </View>
      </View>

      {/* 实景案例 */}
      <View className='index-section'>
        <View className='index-section-badge'>
          <Text className='badge-text'>实景案例</Text>
          <Text className='badge-en'>REAL CASES</Text>
        </View>
        {[
          { id: 'c1', title: '上海市松江区涞亭南路S78', city: '上海', image: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80' },
          { id: 'c2', title: '上海市松江区涞亭南路S88', city: '上海', image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80' },
          { id: 'c3', title: '上海市松江区涞亭南路S89', city: '上海', image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd64bd40?auto=format&fit=crop&w=800&q=80' },
        ].map((item) => (
          <View
            key={item.id}
            className='case-card'
            onClick={() => navigate(`/subpackages/client/case-detail/index?id=${item.id}`)}
          >
            <View className='case-city-tag'>
              <Text className='city-tag-text'>{item.city}</Text>
            </View>
            <Image className='case-img' src={item.image} mode='aspectFill' />
            <View className='case-footer'>
              <Text className='case-title'>{item.title}</Text>
            </View>
          </View>
        ))}
      </View>

      <View className='safe-bottom' />

      {/* 客服悬浮按钮 */}
      <Button className='float-cs-btn' openType='contact'>
        <Text className='float-cs-text'>客服</Text>
      </Button>
    </ScrollView>
  );
}
