import { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

export default function CaseDetail() {
  const router = useRouter();
  const id = router.params.id;
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    if (id) {
      api.get(`/cases/${id}`)
        .then((res: any) => setDetail(res))
        .catch(() => setDetail(null));
    }
  }, [id]);

  if (!detail) {
    return <View className='loading'><Text>加载中...</Text></View>;
  }

  return (
    <View className='cd-page'>
      <View className='cd-hero'>
        <View className='cd-hero-placeholder'>
          <Icon name='image' size={80} color='#b0c4d8' />
        </View>
      </View>

      <View className='cd-body'>
        <Text className='cd-title'>{detail.title}</Text>
        <View className='cd-meta'>
          <View className='cd-meta-item'>
            <Icon name='map-pin' size={28} color='#6b7280' />
            <Text> {detail.communityName}</Text>
          </View>
          <Text className='cd-meta-item'>{detail.houseArea}平</Text>
          <Text className='cd-meta-item'>{detail.houseType}</Text>
        </View>
        <View className='cd-views'>
          <Icon name='eye' size={28} color='#9ca3af' />
          <Text> {detail.views} 次浏览</Text>
        </View>

        <View className='cd-section'>
          <Text className='cd-section-title'>案例详情</Text>
          <Text className='cd-desc'>{detail.description || '暂无描述'}</Text>
        </View>

        <View className='cd-section'>
          <Text className='cd-section-title'>服务团队</Text>
          <View className='cd-team'>
            <View className='cd-team-item'>
              <Icon name='building' size={36} color='#122b4d' />
              <Text className='cd-team-label'>门店</Text>
              <Text className='cd-team-name'>{detail.store?.name || '-'}</Text>
            </View>
            <View className='cd-team-item'>
              <Icon name='palette' size={36} color='#122b4d' />
              <Text className='cd-team-label'>设计师</Text>
              <Text className='cd-team-name'>{detail.designer?.name || '-'}</Text>
            </View>
            <View className='cd-team-item'>
              <Icon name='tools' size={36} color='#122b4d' />
              <Text className='cd-team-label'>施工队长</Text>
              <Text className='cd-team-name'>{detail.installer?.name || '-'}</Text>
            </View>
          </View>
        </View>

        <View className='cd-actions'>
          <View className='btn-primary cd-btn' onClick={() => Taro.navigateTo({ url: '/subpackages/client/reservation/index' })}>
            <Text>我也要预约</Text>
          </View>
          {detail.store && (
            <View className='btn-outline cd-btn' onClick={() => Taro.navigateTo({ url: `/subpackages/client/store-detail/index?id=${detail.store.id}` })}>
              <Text>查看门店</Text>
            </View>
          )}
        </View>
      </View>
      <View className='safe-bottom' />
    </View>
  );
}
