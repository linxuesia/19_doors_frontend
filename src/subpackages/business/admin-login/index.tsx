import { useState, useEffect } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import './index.scss';

// 扫码进入的场景值
const QR_SCENES = [1011, 1012, 1013, 1047, 1048, 1049];

export default function AdminLogin() {
  const { user, adminLogin } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const options = Taro.getLaunchOptionsSync();
    const scene = options.scene;
    // 扫码进入或开发工具中允许访问
    if (QR_SCENES.includes(scene) || process.env.NODE_ENV === 'development') {
      setAllowed(true);
    }
    setChecked(true);
  }, []);

  if (user) {
    Taro.switchTab({ url: '/pages/profile/index' });
    return null;
  }

  if (!checked) return null;

  if (!allowed) {
    return (
      <View className='admin-login-page'>
        <View className='admin-login-card'>
          <View className='admin-logo'>
            <Icon name='lock' size={72} color='#9ca3af' />
          </View>
          <Text className='admin-login-title'>管理员登录</Text>
          <Text className='admin-login-hint'>请使用管理员专属二维码扫码进入</Text>
        </View>
      </View>
    );
  }

  const handleLogin = async () => {
    setError('');
    if (!username || !password) { setError('请输入账号和密码'); return; }
    setLoading(true);
    try {
      await adminLogin(username, password);
      Taro.switchTab({ url: '/pages/profile/index' });
    } catch (e: any) {
      setError(e.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='admin-login-page'>
      <View className='admin-login-card'>
        <View className='admin-logo'>
          <Icon name='settings' size={72} color='#122b4d' />
        </View>
        <Text className='admin-login-title'>管理员登录</Text>

        <View className='login-form'>
          <Input className='login-input' placeholder='账号' value={username} onInput={(e) => setUsername(e.detail.value)} />
          <Input className='login-input' type='password' placeholder='密码' value={password} onInput={(e) => setPassword(e.detail.value)} />

          {error && <Text className='login-error'>{error}</Text>}

          <View className={`btn-primary login-submit ${loading ? 'opacity-50' : ''}`} onClick={handleLogin}>
            <Text>{loading ? '登录中...' : '登录'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
