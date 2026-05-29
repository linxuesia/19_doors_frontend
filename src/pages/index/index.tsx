import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, Map, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../components/Icon';

import api from '../../utils/api';
import './index.scss';

// 长沙周边模拟案例坐标（API 无数据时的缺省展示）
const defaultMarkers = [
  { id: 1, longitude: 112.9388, latitude: 28.2282, name: '芯汇花园5-1902' },
  { id: 2, longitude: 112.9200, latitude: 28.2150, name: '泊岸时光印19幢' },
  { id: 3, longitude: 112.9500, latitude: 28.2400, name: '金平路555弄' },
  { id: 4, longitude: 112.9100, latitude: 28.2000, name: '梅溪湖壹号' },
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<any>(null);
  const [storeId] = useState('S001');
  const [storeInfo, setStoreInfo] = useState<any>(null);

  // 统一数据源：优先 API 数据，无数据时使用缺省点位
  const siteDataSource = sites.length > 0 ? sites : defaultMarkers;

  const markers = siteDataSource.map((site: any, i: number) => ({
    id: i + 1,
    longitude: site.longitude,
    latitude: site.latitude,
    title: site.name || site.title || '',
    iconPath: '',
    width: 32,
    height: 32,
    callout: {
      content: site.name || site.title || '',
      color: '#122b4d',
      fontSize: 13,
      borderRadius: 8,
      padding: 8,
      display: 'ALWAYS',
    },
  }));

  const handleMarkerTap = (e: any) => {
    const id = e.detail?.markerId || e.markerId;
    const site = siteDataSource[(id as number) - 1];
    if (site) setSelectedMarker(site);
  };

  useEffect(() => {
    // 获取默认门店信息
    api.get(`/stores/${storeId}`).then((store: any) => setStoreInfo(store)).catch(() => {});
    // 获取产品、门店案例、工地
    Promise.all([
      api.get('/products').catch(() => []),
      api.get(`/cases/store/${storeId}`).catch(() => []),
      api.get('/sites').catch(() => []),
    ]).then(([p, c, s]) => {
      setProducts((p as any)?.slice?.(0, 4) || []);
      setCases((c as any)?.slice?.(0, 6) || []);
      setSites((s as any)?.slice?.(0, 6) || []);
    });
  }, [storeId]);

  const navigate = (url: string) => Taro.navigateTo({ url });

  return (
    <ScrollView className='home-page' scrollY>
      {/* Banner */}
      <View className='hero-banner'>
        <View className='hero-banner-bg' />
        <Image
          className='hero-image'
          src='cloud://prod-d7g81p837f1219e28.7072-prod-d7g81p837f1219e28-1436604435/common/banner.jpeg'
          mode='widthFix'
        />
        <Button className='customer-service' openType='contact'>
          <Text className='cs-text'>客服</Text>
        </Button>
      </View>

      {/* 门店信息卡片 */}
      <View className='manager-card'>
        <Image
          className='manager-avatar'
          src={storeInfo?.coverImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'}
        />
        <View className='manager-info'>
          <Text className='manager-name'>{storeInfo?.owner?.name || '门店负责人'}</Text>
          <Text className='manager-store'>{storeInfo?.name || '加载中...'}</Text>
        </View>
        <View className='manager-actions'>
          <View className='action-icon' onClick={() => storeInfo?.owner?.phone && Taro.makePhoneCall({ phoneNumber: storeInfo.owner.phone })}>
            <Icon name='phone' size={36} color='#122b4d' />
          </View>
          <View className='action-icon' onClick={() => storeInfo?.address && Taro.openLocation({ latitude: storeInfo.latitude || 0, longitude: storeInfo.longitude || 0, name: storeInfo.name, address: storeInfo.address })}>
            <Icon name='map-pin' size={36} color='#122b4d' />
          </View>
          <View className='action-icon' onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}>
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
          {products.length > 0 ? products.map((item) => (
            <View
              key={item.id}
              className='product-card'
              onClick={() => navigate(`/subpackages/client/product-detail/index?id=${item.id}`)}
            >
              <Image className='product-img' src={item.coverImage} mode='aspectFill' />
              <View className='product-footer'>
                <View className='product-dot' />
                <Text className='product-name'>{item.name}</Text>
              </View>
            </View>
          )) : (
            <View className='product-empty'>
              <Text className='empty-text'>暂无新品</Text>
            </View>
          )}
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
            longitude={storeInfo?.longitude || 121.4737}
            latitude={storeInfo?.latitude || 31.2304}
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
                <Text className='marker-title'>{selectedMarker.name || selectedMarker.title}</Text>
                {selectedMarker.status && (
                  <Text className='marker-status'>{selectedMarker.status}</Text>
                )}
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
          {siteDataSource.length > 0 ? siteDataSource.map((item: any) => (
            <View
              key={item.id}
              className='site-grid-item'
              onClick={() => navigate(`/subpackages/client/site-detail/index?id=${item.id}`)}
            >
              {item.coverImage || item.image ? (
                <Image className='site-grid-img' src={item.coverImage || item.image} mode='aspectFill' />
              ) : (
                <View className='site-grid-placeholder'>
                  <Text className='brand-logo'>SOJOY <Text className='brand-highlight'>19分贝</Text></Text>
                  <Text className='brand-slogan'>系统窗臻 选19分贝</Text>
                </View>
              )}
              <View className='site-grid-info'>
                <Text className='site-grid-location'>{item.name || item.title}</Text>
              </View>
            </View>
          )) : (
            <View className='site-empty'>
              <Icon name='map-pin' size={48} color='#d1d5db' />
              <Text className='empty-text'>暂无工地信息</Text>
            </View>
          )}
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
            <View
              key={item.id}
              className='qualification-card'
              onClick={() => Taro.previewImage({ current: item.image, urls: [item.image] })}
            >
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
        {cases.length > 0 ? cases.map((item: any) => (
          <View
            key={item.id}
            className='case-card'
            onClick={() => navigate(`/subpackages/client/case-detail/index?id=${item.id}`)}
          >
            <View className='case-city-tag'>
              <Text className='city-tag-text'>{item.store?.name || item.communityName || ''}</Text>
            </View>
            <Image
              className='case-img'
              src={item.coverImage || item.imageUrl || ''}
              mode='aspectFill'
            />
            <View className='case-footer'>
              <Text className='case-title'>{item.title}</Text>
            </View>
          </View>
        )) : (
          <View className='site-empty'>
            <Icon name='image' size={48} color='#d1d5db' />
            <Text className='empty-text'>暂无案例</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />

      {/* 客服悬浮按钮 */}
      <Button className='float-cs-btn' openType='contact'>
        <Icon name='chat' size={36} color='#ffffff' />
      </Button>
    </ScrollView>
  );
}
