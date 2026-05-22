import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import Icon from '../../../components/Icon';
import type { IconName } from '../../../components/Icon';
import './index.scss';

export default function SiteDetail() {
  const router = useRouter();
  const { id } = router.params;

  return (
    <ScrollView className='site-detail-page' scrollY>
      {/* 工地头部信息 */}
      <View className='site-header'>
        <Text className='site-name'>芯汇花园5-1902</Text>
        <View className='site-status-row'>
          <Text className='tag tag-amber'>下单备料</Text>
          <Text className='site-distance'>830.9km</Text>
        </View>
      </View>

      {/* 基本信息 */}
      <View className='site-section'>
        <Text className='site-section-title'>基本信息</Text>
        <View className='info-card'>
          <View className='info-item'>
            <View className='info-label-row'>
              <Icon name='map-pin' size={32} color='#6b7280' />
              <Text className='info-label'>地址</Text>
            </View>
            <Text className='info-value'>苏州市相城区</Text>
          </View>
          <View className='info-item'>
            <View className='info-label-row'>
              <Icon name='building' size={32} color='#6b7280' />
              <Text className='info-label'>门店</Text>
            </View>
            <Text className='info-value'>上海19分贝门窗直营店</Text>
          </View>
          <View className='info-item'>
            <View className='info-label-row'>
              <Icon name='user' size={32} color='#6b7280' />
              <Text className='info-label'>客户</Text>
            </View>
            <Text className='info-value'>张先生 138****1234</Text>
          </View>
          <View className='info-item'>
            <View className='info-label-row'>
              <Icon name='calendar' size={32} color='#6b7280' />
              <Text className='info-label'>下单时间</Text>
            </View>
            <Text className='info-value'>2026-05-18</Text>
          </View>
        </View>
      </View>

      {/* 施工动态 */}
      <View className='site-section'>
        <Text className='site-section-title'>施工动态</Text>
        <View className='dynamic-list'>
          <View className='dynamic-item'>
            <View className='dynamic-avatar'>
              <Icon name='user' size={40} color='#122b4d' />
            </View>
            <View className='dynamic-content'>
              <View className='dynamic-header'>
                <Text className='dynamic-author'>李振扬</Text>
                <Text className='dynamic-time'>2026-05-20 14:30</Text>
              </View>
              <Text className='dynamic-text'>
                保温层切割开槽，下口窗台板全部打满，发泡硅胶。四周在刷了雨虹透明防水。
              </Text>
            </View>
          </View>

          <View className='dynamic-item'>
            <View className='dynamic-avatar'>
              <Icon name='user' size={40} color='#122b4d' />
            </View>
            <View className='dynamic-content'>
              <View className='dynamic-header'>
                <Text className='dynamic-author'>李振扬</Text>
                <Text className='dynamic-time'>2026-05-19 10:15</Text>
              </View>
              <Text className='dynamic-text'>
                窗框安装完成，开始进行玻璃安装准备工作。所有材料已到位，预计明日完工。
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
