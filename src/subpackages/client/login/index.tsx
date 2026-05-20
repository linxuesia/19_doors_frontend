import { useState } from 'react';
import { View, Text, Input, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../hooks/useAuth';
import './index.scss';

const roleOptions = [
  { value: 'CLIENT', label: '我是客户' },
  { value: 'STORE_OWNER', label: '我是老板（入驻门店）' },
  { value: 'STORE_MANAGER', label: '我是店长' },
  { value: 'INSTALLER', label: '我是安装工' },
];

export default function Login() {
  const { user, login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('CLIENT');
  const [roleIdx, setRoleIdx] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    Taro.switchTab({ url: '/pages/profile/index' });
    return null;
  }

  const handleSubmit = async () => {
    setError('');
    if (!phone || !password) { setError('请输入手机号和密码'); return; }
    if (phone.length !== 11) { setError('请输入正确的11位手机号'); return; }
    setLoading(true);
    try {
      if (isRegister) {
        await register(phone, password, name || undefined, role);
      } else {
        await login(phone, password);
      }
      Taro.navigateBack();
    } catch (e: any) {
      setError(e.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };

  const fillTest = (p: string) => { setPhone(p); setPassword('123456'); setIsRegister(false); };

  return (
    <View className='login-page'>
      <View className='login-card'>
        <View className='login-logo'>
          <Text className='login-logo-text'>🪟</Text>
        </View>
        <Text className='login-title'>19分贝门窗</Text>
        <Text className='login-subtitle'>{isRegister ? '创建账号，开启品质门窗之旅' : '欢迎登录'}</Text>

        <View className='login-form'>
          <Input
            className='login-input'
            type='number'
            placeholder='请输入手机号码'
            value={phone}
            onInput={(e) => setPhone(e.detail.value)}
            maxlength={11}
          />
          <Input
            className='login-input'
            type='password'
            placeholder='请输入密码'
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
          {isRegister && (
            <>
              <Input
                className='login-input'
                placeholder='您的姓名（选填）'
                value={name}
                onInput={(e) => setName(e.detail.value)}
              />
              <Picker
                mode='selector'
                range={roleOptions.map((r) => r.label)}
                value={roleIdx}
                onChange={(e) => {
                  setRoleIdx(Number(e.detail.value));
                  setRole(roleOptions[Number(e.detail.value)].value);
                }}
              >
                <View className='login-picker'>
                  <Text>{roleOptions[roleIdx].label}</Text>
                  <Text className='login-picker-arrow'>▼</Text>
                </View>
              </Picker>
            </>
          )}

          {error && <Text className='login-error'>{error}</Text>}

          <View className={`btn-primary login-submit ${loading ? 'opacity-50' : ''}`} onClick={handleSubmit}>
            <Text>{loading ? '处理中...' : isRegister ? '注册' : '登录'}</Text>
          </View>
        </View>

        <View className='login-switch' onClick={() => { setIsRegister(!isRegister); setError(''); }}>
          <Text className='login-switch-text'>
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </Text>
        </View>
      </View>

      {/* 测试账号 */}
      <View className='login-test'>
        <Text className='login-test-title'>测试账号（点击快速填充，密码均为 123456）</Text>
        <View className='login-test-grid'>
          {[
            { label: '管理员', phone: '13800000000' },
            { label: '老板(松江)', phone: '13800000001' },
            { label: '老板(北京)', phone: '13800000002' },
            { label: '店长', phone: '13900000001' },
            { label: '工人(松江)', phone: '13900000002' },
            { label: '客户', phone: '13600000001' },
          ].map((acc) => (
            <View key={acc.phone} className='login-test-item' onClick={() => fillTest(acc.phone)}>
              <Text className='login-test-label'>{acc.label}</Text>
              <Text className='login-test-phone'>{acc.phone.slice(-4)}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
