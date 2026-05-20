import { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import api from '../../utils/api';
import './index.scss';

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      api.get('/products').catch(() => []),
      api.get('/cases?published=true').catch(() => []),
      api.get('/stores').catch(() => []),
    ]).then(([p, c, s]) => {
      setProducts((p as any)?.slice?.(0, 4) || []);
      setCases((c as any)?.slice?.(0, 3) || []);
      setStores((s as any)?.slice?.(0, 3) || []);
    });
  }, []);

  const navigate = (url: string) => Taro.navigateTo({ url });

  return (
    <ScrollView className='home-page' scrollY>
      {/* 品牌横幅 */}
      <View className='hero-banner'>
        <View className='hero-bg' />
        <View className='hero-content'>
          <Text className='hero-title'>19分贝门窗</Text>
          <Text className='hero-subtitle'>高端系统门窗整体解决方案</Text>
          <Text className='hero-tagline'>一扇好门窗，品味大不同</Text>
          <View className='hero-buttons'>
            <View className='btn-primary' onClick={() => navigate('/subpackages/client/reservation/index')}>
              <Text>预约量尺</Text>
            </View>
            <View className='btn-outline-white' onClick={() => Taro.switchTab({ url: '/pages/products/index' })}>
              <Text>选产品</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 快捷入口 */}
      <View className='quick-entries'>
        {[
          { icon: '🪟', label: '产品中心', url: '/pages/products/index', tab: true },
          { icon: '📸', label: '全国案例', url: '/pages/cases/index', tab: true },
          { icon: '📍', label: '体验中心', url: '/pages/stores/index', tab: true },
          { icon: '📋', label: '预约量尺', url: '/subpackages/client/reservation/index' },
        ].map((item) => (
          <View
            key={item.label}
            className='entry-item'
            onClick={() => item.tab ? Taro.switchTab({ url: item.url }) : navigate(item.url)}
          >
            <Text className='entry-icon'>{item.icon}</Text>
            <Text className='entry-label'>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* 新品推荐 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>新品推荐</Text>
          <Text className='section-more' onClick={() => Taro.switchTab({ url: '/pages/products/index' })}>
            查看全部 &gt;
          </Text>
        </View>
        <ScrollView className='product-scroll' scrollX showScrollbar={false}>
          {products.map((item: any) => {
            let features: string[] = [];
            try { features = JSON.parse(item.features || '[]'); } catch {}
            return (
              <View
                key={item.id}
                className='product-card'
                onClick={() => navigate(`/subpackages/client/product-detail/index?id=${item.id}`)}
              >
                <View className='product-img'>
                  <Text className='product-img-text'>🪟</Text>
                </View>
                <View className='product-info'>
                  <Text className='product-name'>{item.name}</Text>
                  <Text className='product-cat'>{item.category}</Text>
                  <View className='product-tags'>
                    {features.slice(0, 2).map((f, i) => (
                      <Text key={i} className='tag tag-brand'>{f}</Text>
                    ))}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* 全国案例 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>全国案例</Text>
          <Text className='section-more' onClick={() => Taro.switchTab({ url: '/pages/cases/index' })}>
            查看全部 &gt;
          </Text>
        </View>
        {cases.map((item: any) => (
          <View
            key={item.id}
            className='case-card'
            onClick={() => navigate(`/subpackages/client/case-detail/index?id=${item.id}`)}
          >
            <View className='case-img'>
              <Text className='case-img-text'>📸</Text>
            </View>
            <View className='case-info'>
              <Text className='case-title'>{item.title}</Text>
              <Text className='case-desc'>
                {item.communityName} · {item.houseArea}平 · {item.houseType}
              </Text>
              <View className='case-meta'>
                <Text className='case-views'>👁 {item.views}</Text>
                {item.store && <Text className='case-store'>🏪 {item.store.name}</Text>}
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* 体验中心 */}
      <View className='section'>
        <View className='section-header'>
          <Text className='section-title'>体验中心</Text>
          <Text className='section-more' onClick={() => Taro.switchTab({ url: '/pages/stores/index' })}>
            查看全部 &gt;
          </Text>
        </View>
        {stores.map((item: any) => (
          <View
            key={item.id}
            className='store-mini-card'
            onClick={() => navigate(`/subpackages/client/store-detail/index?id=${item.id}`)}
          >
            <View className='store-mini-info'>
              <View className='flex items-center'>
                <Text className='store-mini-name'>{item.name}</Text>
                <Text className={`tag ${item.type === 'DIRECT' ? 'tag-brand' : 'tag-amber'} ml-2`}>
                  {item.type === 'DIRECT' ? '直营' : '加盟'}
                </Text>
              </View>
              <Text className='store-mini-addr'>📍 {item.address}</Text>
              <Text className='store-mini-hours'>🕐 {item.businessHours}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* 品牌简介 */}
      <View className='section'>
        <Text className='section-title mb-3'>品牌简介</Text>
        <View className='brand-intro'>
          <Text className='brand-text'>
            19分贝门窗，公司总部位于北京，拥有独立的研发中心与先进的生产基地。
          </Text>
          <Text className='brand-text'>
            生产基地坐落于山东中欧节能门窗产业园，深耕门窗行业多年，集产品研发、制造、营销于一体，致力于为全球用户提供高端系统门窗整体解决方案。
          </Text>
          <Text className='brand-text'>
            我们以"一扇好门窗，品味大不同"为核心理念，不仅提供卓越的产品，更提供完善的全生命周期服务体系。
          </Text>
          <View className='brand-tags'>
            {['国家检测中心认证', '最高等级特级认证', '终身质保', '品质工程'].map((t) => (
              <Text key={t} className='tag tag-brand brand-tag'>{t}</Text>
            ))}
          </View>
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
