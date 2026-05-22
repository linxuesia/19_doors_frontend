import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../components/Icon';
import api from '../../utils/api';
import './index.scss';

export default function Cases() {
  const [cases, setCases] = useState<any[]>([]);

  useEffect(() => {
    api.get('/cases?published=true')
      .then((res: any) => setCases(res || []))
      .catch(() => setCases([]));
  }, []);

  return (
    <ScrollView className='cases-page' scrollY>
      <View className='page-padding'>
        <Text className='page-title'>全国案例库</Text>
        <View className='case-grid'>
          {cases.map((item: any) => (
            <View
              key={item.id}
              className='case-grid-card'
              onClick={() =>
                Taro.navigateTo({ url: `/subpackages/client/case-detail/index?id=${item.id}` })
              }
            >
              <View className='case-grid-img'>
                <Icon name='image' size={64} color='#b0c4d8' />
              </View>
              <View className='case-grid-info'>
                <Text className='case-grid-title'>{item.title}</Text>
                <Text className='case-grid-desc'>{item.houseArea}平 · {item.houseType}</Text>
                <View className='case-grid-row'>
                  <Icon name='map-pin' size={28} color='#9ca3af' />
                  <Text className='case-grid-addr'> {item.communityName}</Text>
                </View>
                <View className='case-grid-meta'>
                  <View className='case-grid-meta-item'>
                    <Icon name='eye' size={28} color='#9ca3af' />
                    <Text className='case-grid-views'> {item.views}</Text>
                  </View>
                  {item.store && <Text className='case-grid-store'>{item.store.name}</Text>}
                </View>
              </View>
            </View>
          ))}
          {cases.length === 0 && (
            <View className='empty-state'>
              <Text className='empty-text'>暂无案例</Text>
            </View>
          )}
        </View>
      </View>
      <View className='safe-bottom' />
    </ScrollView>
  );
}
