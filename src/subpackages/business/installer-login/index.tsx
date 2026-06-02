import { useState, useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import './index.scss';

const QR_SCENES = [1011, 1012, 1013, 1047, 1048, 1049];

export default function InstallerLogin() {
  const { user } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [account, setAccount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const options = Taro.getLaunchOptionsSync();
    const scene = options.scene;
    if (QR_SCENES.includes(scene) || process.env.NODE_ENV === 'development') {
      setAllowed(true);
    }
    setChecked(true);
  }, []);

  if (!checked) {
    return <View className='installer-login-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>加载中...</Text></View>;
  }

  // 已登录的安装工直接跳转工单列表
  useEffect(() => {
    if (user && (user.role || '').includes('INSTALLER')) {
      Taro.redirectTo({ url: '/subpackages/business/installer-orders/index' });
    }
  }, []);

  if (user && (user.role || '').includes('INSTALLER')) {
    return <View className='installer-login-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>已登录，跳转中...</Text></View>;
  }

  if (!allowed) {
    return (
      <View className='installer-login-page'>
        <View className='access-denied'>
          <View className='denied-icon'>
            <Icon name='lock' size={80} color='#94a3b8' />
          </View>
          <Text className='denied-title'>访问受限</Text>
          <Text className='denied-text'>请使用安装工专属二维码扫码进入本页面</Text>
        </View>
      </View>
    );
  }

  const handleLogin = async () => {
    setError('');
    if (!account.trim()) {
      setError('请输入管理员账号');
      return;
    }
    setLoading(true);
    try {
      Taro.showLoading({ title: '登录中...' });
      await new Promise(resolve => setTimeout(resolve, 1500));
      Taro.hideLoading();
      Taro.showToast({ title: '登录成功', icon: 'success' });
      setTimeout(() => {
        Taro.redirectTo({ url: '/subpackages/business/installer-orders/index' });
      }, 1500);
    } catch (e: any) {
      setError(e.message || '登录失败，请重试');
      Taro.hideLoading();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='installer-login-page'>
      <View className='login-header'>
        <View className='brand-logo'>
          <Icon name='window' size={72} color='#ffffff' />
        </View>
        <Text className='brand-name'>19分贝</Text>
        <Text className='brand-subtitle'>安装工专属服务平台</Text>
      </View>

      <View className='login-card'>
        <Text className='login-card-title'>欢迎登录</Text>

        <View className='login-form'>
          <View className='input-wrapper'>
            <View className='input-icon'>
              <Icon name='user' size={36} color='#64748b' />
            </View>
            <Input
              className='login-input'
              placeholder='请输入管理员账号'
              value={account}
              onInput={(e) => setAccount(e.detail.value)}
            />
          </View>

          {error && <Text className='login-error'>{error}</Text>}

          <Text className='login-hint'>本页面仅限扫码或通过内部链接访问</Text>

          <View
            className={`login-submit ${loading ? 'opacity-50' : ''}`}
            onClick={handleLogin}
          >
            <Text>{loading ? '登录中...' : '欢迎登录'}</Text>
          </View>
        </View>
      </View>

      <View className='footer-info'>
        <Text className='footer-text'>
          © 2024 19分贝 · 专业门窗安装服务
        </Text>
      </View>
    </View>
  );
}
