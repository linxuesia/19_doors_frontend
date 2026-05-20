import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import api from '../../utils/api';
import './index.scss';

const cities = ['上海', '北京', '苏州', '杭州'];

export default function Stores() {
  const [stores, setStores] = useState<any[]>([]);
  const [activeCity, setActiveCity] = useState('上海');

  useEffect(() => {
    api.get('/stores')
      .then((res: any) => setStores(res || []))
      .catch(() => setStores([]));
  }, []);

  return (
    <ScrollView className='stores-page' scrollY>
      <View className='page-padding'>
        <Text className='page-title'>体验中心</Text>

        {/* 城市筛选 */}
        <ScrollView className='city-scroll' scrollX showScrollbar={false}>
          <View className='city-list'>
            {cities.map((city) => (
              <View
                key={city}
                className={`city-item ${activeCity === city ? 'city-active' : ''}`}
                onClick={() => setActiveCity(city)}
              >
                <Text className={`city-text ${activeCity === city ? 'city-text-active' : ''}`}>
                  {city}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {/* 门店列表 */}
        {stores.map((item: any) => (
          <View
            key={item.id}
            className='store-full-card'
            onClick={() =>
              Taro.navigateTo({ url: `/subpackages/client/store-detail/index?id=${item.id}` })
            }
          >
            <View className='store-full-img'>
              <Text className='store-full-icon'>🏪</Text>
            </View>
            <View className='store-full-info'>
              <View className='store-full-header'>
                <Text className='store-full-name'>{item.name}</Text>
                <Text className={`tag ${item.type === 'DIRECT' ? 'tag-brand' : 'tag-amber'}`}>
                  {item.type === 'DIRECT' ? '直营店' : '加盟店'}
                </Text>
              </View>
              <Text className='store-full-addr'>📍 {item.address}</Text>
              <Text className='store-full-hours'>🕐 {item.businessHours}</Text>
              {item.phone && <Text className='store-full-phone'>📞 {item.phone}</Text>}
              <Text className='store-full-desc'>{item.description}</Text>
            </View>
          </View>
        ))}
        {stores.length === 0 && (
          <View className='empty-state'>
            <Text className='empty-text'>暂无门店</Text>
          </View>
        )}
      </View>
      <View className='safe-bottom' />
    </ScrollView>
  );
}
