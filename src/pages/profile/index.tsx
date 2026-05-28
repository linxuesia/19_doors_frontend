import { View, Text, ScrollView, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/Icon';
import './index.scss';

export default function Profile() {
  const { user } = useAuth();

  return (
    <ScrollView className='profile-page' scrollY>
      {/* 用户信息卡片 */}
      <View className='user-card'>
        <View className='user-card-main' onClick={() => user ? null : Taro.navigateTo({ url: '/subpackages/client/login/index' })}>
          {user?.avatar ? (
            <Image className='user-avatar-img' src={user.avatar} mode='aspectFill' />
          ) : (
            <View className='user-avatar-placeholder'>
              <Icon name='user' size={48} color='#9ca3af' />
            </View>
          )}
          <View className='user-info'>
            <Text className='user-name'>{user?.name || '登录 / 注册'}</Text>
            <Text className='user-store'>
              {user ? `所属门店: ${user.storeName || '上海19分贝门窗直营店'}` : '点击登录查看更多信息'}
            </Text>
          </View>
        </View>
      </View>

      {/* 门店入驻（仅登录且未绑定门店时可见） */}
      {user && !user.storeId && (
      <View className='store-entry-card'>
        <View className='store-entry-left'>
          <Text className='store-entry-title'>门店入驻</Text>
          <Text className='store-entry-desc'>开启您的专属线上门店</Text>
        </View>
        <View
          className='store-entry-btn'
          onClick={() => Taro.navigateTo({ url: '/subpackages/client/store-apply/index' })}
        >
          <Text className='store-entry-btn-text'>立即入驻</Text>
        </View>
      </View>
      )}

      {/* 常用服务 */}
      <View className='service-section'>
        <Text className='service-title'>常用服务</Text>
        <View className='service-grid'>
          <View className='service-item' onClick={() => Taro.switchTab({ url: '/pages/products/index' })}>
            <Icon name='home' size={44} color='#4b5563' />
            <Text className='service-label'>我的新家</Text>
          </View>
          <View className='service-item' onClick={() => {}}>
            <Icon name='file-text' size={44} color='#4b5563' />
            <Text className='service-label'>质保卡</Text>
          </View>
          <View className='service-item' onClick={() => Taro.navigateTo({ url: '/subpackages/client/order-detail/index?list=1' })}>
            <Icon name='time' size={44} color='#4b5563' />
            <Text className='service-label'>我的订单</Text>
          </View>
          <Button className='service-item service-btn' openType='contact'>
            <Icon name='phone' size={44} color='#4b5563' />
            <Text className='service-label'>联系客服</Text>
          </Button>
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
