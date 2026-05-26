import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import './index.scss';

export default function Login() {
  const { user, phoneLogin } = useAuth();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    Taro.switchTab({ url: '/pages/profile/index' });
    return null;
  }

  /** 微信手机号一键登录 */
  const handleGetPhoneNumber = async (e: any) => {
    const phoneCode = e.detail?.code;
    if (!phoneCode) return;
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

          {/* 手动输入手机号 */}
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
          <Button
            className={`btn-outline login-submit ${loading ? 'opacity-50' : ''}`}
            onClick={handlePhoneSubmit}
            disabled={loading}
          >
            {loading ? '登录中...' : '手机号登录'}
          </Button>
        </View>
      </View>
    </View>
  );
}
