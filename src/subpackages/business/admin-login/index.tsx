import { useState, useEffect } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import './index.scss';

export default function AdminLogin() {
  const { user, adminLogin } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && (user.role || '').includes('ADMIN')) {
      Taro.redirectTo({ url: '/subpackages/business/admin/index' });
    }
  }, []);

  if (user && (user.role || '').includes('ADMIN')) {
    return <View className='admin-login-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>已登录，跳转中...</Text></View>;
  }

  const handleSubmit = async () => {
    if (!username.trim()) { setError('请输入用户名'); return; }
    if (!password.trim()) { setError('请输入密码'); return; }
    setError('');
    setLoading(true);
    try {
      await adminLogin(username.trim(), password);
      Taro.redirectTo({ url: '/subpackages/business/admin/index' });
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='admin-login-page'>
      <View className='admin-login-card'>
        <Text className='admin-login-title'>19分贝门窗</Text>
        <Text className='admin-login-subtitle'>管理员登录</Text>

        <View className='admin-login-form'>
          {error && <Text className='admin-login-error'>{error}</Text>}

          <View className='admin-login-field'>
            <Text className='admin-login-label'>用户名</Text>
            <Input
              className='admin-login-input'
              placeholder='请输入管理员用户名'
              value={username}
              onInput={(e) => setUsername(e.detail.value)}
            />
          </View>

          <View className='admin-login-field'>
            <Text className='admin-login-label'>密码</Text>
            <Input
              className='admin-login-input'
              password
              placeholder='请输入密码'
              value={password}
              onInput={(e) => setPassword(e.detail.value)}
              onConfirm={handleSubmit}
            />
          </View>

          <Button
            className={`admin-login-submit ${loading ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </Button>
        </View>
      </View>
    </View>
  );
}
