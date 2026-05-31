import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../components/Icon';
import api from '../../utils/api';
import './index.scss';

const defaultStores = [
  {
    id: 's1',
    name: '北京海淀体验中心',
    address: '北京市海淀区蓟门桥西海国际中心',
    type: '直营店',
    area: '800㎡',
    businessHours: '09:00-18:00',
    phone: '400-888-1919',
    latitude: 39.9624,
    longitude: 116.3489,
  },
  {
    id: 's2',
    name: '山东临朐生产基地展厅',
    address: '山东省潍坊市临朐县中欧节能门窗产业园D区',
    type: '体验中心',
    area: '1200㎡',
    businessHours: '08:30-17:30',
    phone: '0536-1234567',
    latitude: 36.5125,
    longitude: 118.5386,
  },
];

const reportList = [
  {
    id: 'r1',
    title: '门窗隔音性能检测报告',
    desc: '国家建筑工程质量监督检验中心认证 · 隔音性能达19分贝标准',
    image: 'cloud://prod-d7g81p837f1219e28.7072-prod-d7g81p837f1219e28-1436604435/common/banner.jpeg',
  },
  {
    id: 'r2',
    title: '抗风压性能检测报告',
    desc: '中国建筑科学研究院认证 · 最高等级特级认证',
    image: 'cloud://prod-d7g81p837f1219e28.7072-prod-d7g81p837f1219e28-1436604435/common/banner.jpeg',
  },
  {
    id: 'r3',
    title: '保温隔热性能报告',
    desc: '国家节能产品认证中心 · 符合国家建筑节能标准',
    image: 'cloud://prod-d7g81p837f1219e28.7072-prod-d7g81p837f1219e28-1436604435/common/banner.jpeg',
  },
  {
    id: 'r4',
    title: '水密气密性能报告',
    desc: '国家门窗质量监督检验中心 · 优异的水密气密性能',
    image: 'cloud://prod-d7g81p837f1219e28.7072-prod-d7g81p837f1219e28-1436604435/common/banner.jpeg',
  },
];

export default function About() {
  const [brandStores, setBrandStores] = useState<any[]>([]);

  useEffect(() => {
    api.get('/brand-stores?pageSize=100')
      .then((res: any) => {
        const list = res?.list || (Array.isArray(res) ? res : []);
        setBrandStores(list.length > 0 ? list : defaultStores);
      })
      .catch(() => setBrandStores(defaultStores));
  }, []);

  const storeList = brandStores.length > 0 ? brandStores : defaultStores;

  const handleNavigate = (store: any) => {
    if (store.latitude && store.longitude) {
      Taro.openLocation({
        latitude: store.latitude,
        longitude: store.longitude,
        name: store.name,
        address: store.address,
      });
    }
  };

  return (
    <ScrollView className='about-page' scrollY>
      {/* 顶部Banner区域 */}
      <View className='hero-banner'>
        <Image
          className='hero-bg-image'
          src='cloud://prod-d7g81p837f1219e28.7072-prod-d7g81p837f1219e28-1436604435/common/banner.jpeg'
          mode='aspectFill'
        />
        <View className='hero-overlay' />
        <View className='hero-content'>
          <Text className='hero-brand'>SOJOY</Text>
          <Text className='hero-slogan'>19分贝高端系统门窗</Text>
        </View>
      </View>

      {/* 品牌简介卡片 */}
      <View className='intro-card-wrapper'>
        <View className='intro-card'>
          <View className='intro-header'>
            <View className='intro-bar' />
            <Text className='intro-title'>品牌简介</Text>
          </View>
          <View className='intro-body'>
            <Text className='intro-text'>
              SOJOY 19分贝门窗，以"一扇好门窗，品味大不同"为核心理念，致力于为全球用户提供高端系统门窗整体解决方案。我们深耕门窗行业多年，集产品研发、设计、制造、营销于一体，凭借卓越的隔音、抗风压、保温隔热性能，成为行业标杆品牌。
            </Text>
            <Text className='intro-text'>
              公司总部位于北京海淀区蓟门桥，拥有独立的研发中心与先进的生产基地。生产基地坐落于山东临朐中欧节能门窗产业园D区，引进德国先进生产设备与工艺，严格遵循国际质量管理体系，确保每一扇门窗都达到卓越品质。
            </Text>
          </View>
        </View>
      </View>

      {/* 门店查询卡片 */}
      <View className='section-block'>
        <View className='section-header'>
          <View className='section-bar' />
          <Text className='section-title'>门店查询</Text>
        </View>
        <View className='store-list'>
          {storeList.map((store: any) => (
            <View key={store.id} className='store-card'>
              <View className='store-top'>
                <View className='store-info'>
                  <Text className='store-name'>{store.name}</Text>
                  <View className='store-meta'>
                    <Icon name='map-pin' size={24} color='#6b7280' />
                    <Text className='store-address'>{store.address}</Text>
                  </View>
                </View>
                <View className={`store-tag ${store.type === '直营店' ? 'tag-primary' : 'tag-secondary'}`}>
                  <Text className='tag-text'>{store.type}</Text>
                </View>
              </View>
              <View className='store-bottom'>
                <View className='store-details'>
                  {store.area && (
                    <Text className='store-detail-item'>展厅面积 {store.area}</Text>
                  )}
                  {store.businessHours && (
                    <Text className='store-detail-item'>营业时间 {store.businessHours}</Text>
                  )}
                </View>
                <View className='nav-btn' onClick={() => handleNavigate(store)}>
                  <Icon name='map-pin' size={26} color='#122b4d' />
                  <Text className='nav-btn-text'>导航前往</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 产品检测报告卡片 */}
      <View className='section-block'>
        <View className='section-header'>
          <View className='section-bar' />
          <Text className='section-title'>产品检测报告</Text>
        </View>
        <View className='report-grid'>
          {reportList.map((report) => (
            <View
              key={report.id}
              className='report-card'
              onClick={() => Taro.previewImage({ current: report.image, urls: [report.image] })}
            >
              <Image className='report-img' src={report.image} mode='aspectFill' />
              <View className='report-info'>
                <Text className='report-title'>{report.title}</Text>
                <Text className='report-desc'>{report.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
