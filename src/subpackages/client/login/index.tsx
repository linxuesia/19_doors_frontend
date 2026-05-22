import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import './index.scss';

export default function Login() {
  const { user, phoneLogin, adminLogin } = useAuth();

  const [mode, setMode] = useState<'wechat' | 'admin'>('wechat');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 已登录则跳转
  if (user) {
    Taro.switchTab({ url: '/pages/profile/index' });
    return null;
  }

  /** 微信手机号一键登录 */
  const handleGetPhoneNumber = async (e: any) => {
    const phoneCode = e.detail?.code;
    if (!phoneCode) return; // 模拟器无回调，用户走手动输入
    setError('');
    setLoading(true);
    try {
      const loginRes = await Taro.login();
      await phoneLogin({ phoneCode, wxCode: loginRes.code });
      Taro.switchTab({ url: '/pages/profile/index' });
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  /** 手动输入手机号登录 */
  const handlePhoneSubmit = async () => {
    if (!phone || phone.length < 11) {
      setError('请输入正确的手机号');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const loginRes = await Taro.login();
      await phoneLogin({ phone, wxCode: loginRes.code });
      Taro.switchTab({ url: '/pages/profile/index' });
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  /** 超管账号密码登录 */
  const handleAdminLogin = async () => {
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

  // 超管登录界面
  if (mode === 'admin') {
    return (
      <View className='login-page'>
        <View className='login-card'>
          <View className='login-logo'>
            <Icon name='window' size={72} color='#122b4d' />
          </View>
          <Text className='login-title'>19分贝门窗</Text>
          <Text className='login-subtitle'>管理员登录</Text>

          <View className='login-form'>
            <Input className='login-input' placeholder='账号' value={username} onInput={(e) => setUsername(e.detail.value)} />
            <Input className='login-input' type='password' placeholder='密码' value={password} onInput={(e) => setPassword(e.detail.value)} />

            {error && <Text className='login-error'>{error}</Text>}

            <View className={`btn-primary login-submit ${loading ? 'opacity-50' : ''}`} onClick={handleAdminLogin}>
              <Text>{loading ? '登录中...' : '登录'}</Text>
            </View>
          </View>

          <View className='login-switch' onClick={() => { setMode('wechat'); setError(''); }}>
            <Text className='login-switch-text'>返回手机号登录</Text>
          </View>
        </View>
      </View>
    );
  }

  // 手机号登录主界面
  return (
    <View className='login-page'>
      <View className='login-card'>
        <View className='login-logo'>
          <Icon name='window' size={72} color='#122b4d' />
        </View>
        <Text className='login-title'>19分贝门窗</Text>
        <Text className='login-subtitle'>手机号登录</Text>

        <View className='login-form'>
          {error && <Text className='login-error'>{error}</Text>}

          {/* 微信授权手机号（真机一键登录） */}
          <Button
            className={`btn-primary login-submit login-wechat-btn ${loading ? 'opacity-50' : ''}`}
            openType='getPhoneNumber'
            onGetPhoneNumber={handleGetPhoneNumber}
            disabled={loading}
          >
            <Icon name='chat' size={36} color='#ffffff' />
            <Text className='login-btn-text'>微信授权一键登录</Text>
          </Button>

          {/* 手动输入手机号（模拟器/未授权兜底） */}
          <View className='login-divider'>
            <View className='login-divider-line' />
            <Text className='login-divider-text'>或手动输入</Text>
            <View className='login-divider-line' />
          </View>
          <Input
            className='login-input'
            type='number'
            placeholder='请输入手机号'
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
            maxlength={11}
          />
          <View className={`btn-outline login-submit ${loading ? 'opacity-50' : ''}`} onClick={handlePhoneSubmit}>
            <Text>{loading ? '登录中...' : '手机号登录'}</Text>
          </View>
        </View>

        <View className='login-switch' onClick={() => { setMode('admin'); setError(''); }}>
          <Text className='login-switch-text'>管理员登录</Text>
        </View>
      </View>
    </View>
  );
}
