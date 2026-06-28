import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

export default function StoreDetail() {
  const router = useRouter();
  const id = router.params.id;
  const [store, setStore] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/stores/${id}`)
        .then((res: any) => setStore(res))
        .catch(() => setStore(null));
    }
  }, [id]);

  if (!store) {
    return <View className='loading'><Text className='loading-text'>加载中...</Text></View>;
  }

  const roleName = (role: string) => {
    const map: Record<string, string> = { STORE_OWNER: '老板', STORE_MANAGER: '店长', INSTALLER: '安装工程师' };
    return map[role] || role;
  };

  return (
    <View className='sd-page'>
      <View className='sd-hero'>
        <View className='sd-hero-placeholder'>
          <Icon name='building' size={96} color='#b0c4d8' />
        </View>
      </View>
      <View className='sd-body'>
        <View className='sd-header'>
          <Text className='sd-name'>{store.name}</Text>
        </View>
        <Text className='sd-desc'>{store.description}</Text>

        <View className='sd-info-card'>
          <View className='sd-info-row'>
            <Icon name='map-pin' size={28} color='#6b7280' />
            <Text>{store.address}</Text>
          </View>
          <View className='sd-info-row'>
            <Icon name='time' size={28} color='#9ca3af' />
            <Text>{store.businessHours}</Text>
          </View>
          {store.phone && (
            <View className='sd-info-row'>
              <Icon name='phone' size={28} color='#9ca3af' />
              <Text>{store.phone}</Text>
            </View>
          )}
          <View className='sd-info-row'>
            <Icon name='user' size={28} color='#6b7280' />
            <Text>负责人：{store.owner?.name || '-'}</Text>
          </View>
        </View>

        {store.users?.length > 0 && (
          <View className='sd-section'>
            <Text className='sd-section-title'>服务团队</Text>
            <View className='sd-team'>
              {store.users?.filter((u: any) => !(u.role || '').includes('STORE_OWNER')).map((u: any) => (
                <View key={u.id} className='sd-team-row'>
                  <View className='sd-team-left'>
                    <Text className='sd-team-name'>{u.name}</Text>
                    <Text className='sd-team-phone'>{u.phone}</Text>
                  </View>
                  <Text className='tag tag-brand'>{roleName(u.role)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {store.showcaseCases?.length > 0 && (
          <View className='sd-section'>
            <Text className='sd-section-title'>门店案例</Text>
            <View className='sd-cases'>
              {store.showcaseCases.map((c: any) => (
                <View
                  key={c.id}
                  className='sd-case-card'
                  onClick={() => Taro.navigateTo({ url: `/subpackages/client/case-detail/index?id=${c.id}` })}
                >
                  <View className='sd-case-img'>
                    <Icon name='image' size={48} color='#b0c4d8' />
                  </View>
                  <Text className='sd-case-title'>{c.title}</Text>
                  <View className='sd-case-views'>
                    <Icon name='eye' size={24} color='#9ca3af' />
                    <Text> {c.views}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        <View className='btn-primary sd-reserve-btn' onClick={() => Taro.navigateTo({ url: '/subpackages/client/reservation/index' })}>
          <Text>预约量尺</Text>
        </View>
      </View>
      <View className='safe-bottom' />
    </View>
  );
}
