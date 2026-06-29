import { useState, useEffect } from 'react';
import { View, Text, Input, Button, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import Icon from '../../../components/Icon';
import './index.scss';

const isDevtools = (() => {
  try {
    return Taro.getAccountInfoSync?.()?.miniProgram?.envVersion === 'develop';
  } catch { return false; }
})();

type Step = 'phone' | 'profile';

export default function Login() {
  const { user, phoneLogin } = useAuth();
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');        // 手动输入
  const [detectedPhone, setDetectedPhone] = useState(''); // check-phone 返回的手机号
  const [wxCode, setWxCode] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);

  // 已登录用户自动跳转个人中心
  useEffect(() => {
    if (user) {
      Taro.switchTab({ url: '/pages/profile/index' });
    }
  }, [user]);

  // 检查微信隐私授权状态
  useEffect(() => {
    try {
      // @ts-ignore - 微信基础库 2.32.3+ 支持
      if (typeof Taro.getPrivacySetting === 'function') {
        // @ts-ignore
        Taro.getPrivacySetting({
          success: (res: any) => {
            if (res.needAuthorization) {
              console.log('[Login] 需要隐私授权');
            }
          },
          fail: () => {},
        });
      }
    } catch {}
  }, []);

  if (user) {
    return (
      <View className='login-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'>
        <Text style='color:#9ca3af;font-size:14px'>已登录，跳转中...</Text>
      </View>
    );
  }

  /** 第一步：获取手机号后检查新老用户 */
  const checkPhoneAndProceed = async (params: { phone?: string; phoneCode?: string }) => {
    if (!privacyChecked) {
      setError('请阅读并同意隐私政策');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // 获取 wxCode
      let code = '';
      try {
        const loginRes = await Taro.login();
        code = loginRes.code;
      } catch {}

      // 检查手机号是否已注册
      const result: any = await api.post('/auth/check-phone', params);
      const p = result.phone;

      if (result.exists) {
        // 老用户：直接登录
        await phoneLogin({ phone: p, wxCode: code });
        Taro.switchTab({ url: '/pages/profile/index' });
      } else {
        // 新用户：进入第二步填写昵称头像
        setDetectedPhone(p);
        setWxCode(code);
        setIsNewUser(true);
        setStep('profile');
      }
    } catch (err: any) {
      setError(err.message || '检查失败');
    } finally {
      setLoading(false);
    }
  };

  /** 微信手机号一键登录 - 第一步 */
  const handleGetPhoneNumber = async (e: any) => {
    const phoneCode = e.detail?.code;
    if (!phoneCode) return;
    await checkPhoneAndProceed({ phoneCode });
  };

  /** 手动输入手机号 - 第一步 */
  const handlePhoneCheck = async () => {
    if (!phone || phone.length < 11) {
      setError('请输入正确的手机号');
      return;
    }
    await checkPhoneAndProceed({ phone });
  };

  /** 第二步：新用户提交昵称头像注册 */
  const handleProfileSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await phoneLogin({
        phone: detectedPhone,
        wxCode,
        ...(avatarUrl && { avatarUrl }),
        ...(nickname.trim() && { nickname: nickname.trim() }),
      });
      Taro.switchTab({ url: '/pages/profile/index' });
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  // 微信头像选择
  const handleChooseAvatar = (e: any) => {
    const url = e.detail?.avatarUrl;
    if (url) setAvatarUrl(url);
  };

  // 昵称输入
  const handleNicknameInput = (e: any) => {
    const value = e.detail?.value;
    if (value) setNickname(value);
  };

  /** 第一步：获取手机号 */
  const renderPhoneStep = () => (
    <View className='login-form'>
      {/* 隐私协议勾选 */}
      <View className='privacy-consent' onClick={() => setPrivacyChecked(!privacyChecked)}>
        <View className={`privacy-checkbox ${privacyChecked ? 'checked' : ''}`}>
          {privacyChecked && <Icon name='check' size={20} color='#ffffff' />}
        </View>
        <Text className='privacy-consent-text'>
          我已阅读并同意
          <Text
            className='privacy-link'
            onClick={(e) => {
              e.stopPropagation();
              Taro.navigateTo({ url: '/subpackages/client/privacy/index' });
            }}
          >
            《隐私政策》
          </Text>
        </Text>
      </View>

      {error && <Text className='login-error'>{error}</Text>}

      {/* 微信授权手机号（真机一键登录） */}
      <Button
        className={`btn-primary login-submit login-wechat-btn ${loading ? 'opacity-50' : ''}`}
        openType='getPhoneNumber'
        onGetPhoneNumber={handleGetPhoneNumber}
        disabled={loading}
      >
        <Icon name='chat' size={36} color='#ffffff' />
        <Text className='login-btn-text'>手机号一键登录</Text>
      </Button>

      {/* 手动输入手机号（仅DevTools可见） */}
      {isDevtools && (
        <>
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
            onClick={handlePhoneCheck}
            disabled={loading}
          >
            {loading ? '检查中...' : '手机号登录'}
          </Button>
        </>
      )}
    </View>
  );

  /** 第二步：新用户填写昵称头像 */
  const renderProfileStep = () => (
    <View className='login-form'>
      {/* 头像选择 */}
      <View className='login-profile-section'>
        <Button
          className='login-avatar-btn'
          openType='chooseAvatar'
          onChooseAvatar={handleChooseAvatar}
        >
          {avatarUrl ? (
            <Image className='login-avatar-image' src={avatarUrl} mode='aspectFill' />
          ) : (
            <View className='login-avatar-placeholder'>
              <Icon name='user' size={48} color='#9ca3af' />
              <Text className='login-avatar-text'>点击设置头像</Text>
            </View>
          )}
        </Button>

        {/* 昵称输入 */}
        <View className='login-nickname-field'>
          <Text className='login-label'>昵称</Text>
          <Input
            className='login-nickname-input'
            type='nickname'
            placeholder='请输入昵称'
            value={nickname}
            onInput={handleNicknameInput}
            maxlength={20}
          />
        </View>
      </View>

      {error && <Text className='login-error'>{error}</Text>}

      <Button
        className={`btn-primary login-submit ${loading ? 'opacity-50' : ''}`}
        onClick={handleProfileSubmit}
        disabled={loading}
      >
        {loading ? '注册中...' : '完成注册'}
      </Button>

      <View className='login-switch' onClick={() => { setStep('phone'); setIsNewUser(false); }}>
        <Text className='login-switch-text'>返回上一步</Text>
      </View>
    </View>
  );

  return (
    <View className='login-page'>
      <View className='login-card'>
        <View className='login-logo'>
          <Icon name='window' size={72} color='#122b4d' />
        </View>
        <Text className='login-title'>19分贝门窗</Text>
        <Text className='login-subtitle'>
          {step === 'phone' ? '登录后可补充个人信息' : `手机号 ${detectedPhone} 未注册，请完善信息`}
        </Text>

        {step === 'phone' ? renderPhoneStep() : renderProfileStep()}
      </View>
    </View>
  );
}
