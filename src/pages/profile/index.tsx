import { View, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth, roleLabels } from '../../contexts/AuthContext';
import Icon from '../../components/Icon';
import CustomTabBar from '../../custom-tab-bar';
import './index.scss';

import type { IconName } from '../../components/Icon';

export default function Profile() {
  const { user, logout } = useAuth();
  const isClient = user?.role === 'CLIENT';

  const menuItems: { icon: IconName; label: string; desc: string; url: string }[] = [
    ...(user && !isClient ? [{
      icon: 'chart' as IconName,
      label: '工作台',
      desc: user?.role === 'STORE_OWNER' ? '门店数据看板与管理' :
            user?.role === 'STORE_MANAGER' ? '门店日常运营工具' :
            user?.role === 'INSTALLER' ? '工单承接与施工管理' : '系统全局管理后台',
      url: '/subpackages/business/workbench/index',
    }] : []),
    {
      icon: 'clipboard' as IconName,
      label: isClient ? '我的订单' : '订单管理',
      desc: '查看订单进度与详情',
      url: isClient ? '/subpackages/client/order-detail/index?list=1' : '/subpackages/business/orders/index',
    },
    { icon: 'calendar' as IconName, label: '预约记录', desc: '查看量尺预约历史', url: '' },
    { icon: 'shield-check' as IconName, label: '质保凭证', desc: '查看19分贝质保凭证', url: '' },
    { icon: 'settings' as IconName, label: '设置', desc: '个人资料与账号安全', url: '' },
    { icon: 'chat' as IconName, label: '联系客服', desc: '在线客服与问题反馈', url: '' },
  ];

  const handleMenuClick = (item: typeof menuItems[0]) => {
    if (!user) {
      Taro.navigateTo({ url: '/subpackages/client/login/index' });
      return;
    }
    if (item.url) {
      Taro.navigateTo({ url: item.url });
    }
  };

  return (
    <ScrollView className='profile-page' scrollY>
      {/* 用户头部 */}
      <View className='profile-header'>
        <View className='profile-header-bg' />
        {user ? (
          <View className='profile-user'>
            <View className='profile-avatar'>
              <Icon name='user' size={48} color='#ffffff' />
            </View>
            <View className='profile-user-info'>
              <Text className='profile-name'>{user.name}</Text>
              <Text className='profile-role'>
                {roleLabels[user.role] || user.role}
                <Text className='profile-phone-sep'> | </Text>
                <Text>{user.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</Text>
              </Text>
            </View>
          </View>
        ) : (
          <View className='profile-login-btn' onClick={() => Taro.navigateTo({ url: '/subpackages/client/login/index' })}>
            <View className='profile-avatar'>
              <Icon name='user' size={48} color='#ffffff' />
            </View>
            <View className='profile-user-info'>
              <Text className='profile-name'>登录 / 注册</Text>
              <Text className='profile-role'>点击登录查看您的订单</Text>
            </View>
          </View>
        )}
      </View>

      {/* 菜单 */}
      <View className='profile-menu'>
        {menuItems.map((item) => (
          <View key={item.label} className='menu-item' onClick={() => handleMenuClick(item)}>
            <Icon name={item.icon} size={40} color='#122b4d' />
            <View className='menu-content'>
              <Text className='menu-label'>{item.label}</Text>
              <Text className='menu-desc'>{item.desc}</Text>
            </View>
            <Icon name='arrow-right' size={32} color='#d1d5db' />
          </View>
        ))}
      </View>

      {/* 退出 */}
      {user && (
        <View className='logout-btn' onClick={() => { logout(); Taro.switchTab({ url: '/pages/index/index' }); }}>
          <Text className='logout-text'>退出登录</Text>
        </View>
      )}

      <View className='safe-bottom' />
      <CustomTabBar />
    </ScrollView>
  );
}
