import { useState } from 'react';
import { View, Text, Input, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth, roleLabels } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import './index.scss';

const DEV = process.env.NODE_ENV === 'development';

const roleOptions = [
  { value: 'CLIENT', label: '我是客户' },
  { value: 'STORE_OWNER', label: '我是老板（入驻门店）' },
  { value: 'STORE_MANAGER', label: '我是店长' },
  { value: 'INSTALLER', label: '我是安装工' },
];

export default function Login() {
  const { user, wechatLogin, adminLogin } = useAuth();

  // 模式：wechat（默认）| admin（超管密码登录）
  const [mode, setMode] = useState<'wechat' | 'admin'>('wechat');
  const [role, setRole] = useState('CLIENT');
  const [roleIdx, setRoleIdx] = useState(0);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    Taro.switchTab({ url: '/pages/profile/index' });
    return null;
  }

  const handleWechatLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await wechatLogin(role);
      Taro.navigateBack();
    } catch (e: any) {
      setError(e.message || '微信登录失败');
    } finally {
      setLoading(false);
    }
  };

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

  // 超管密码登录界面
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
            <Text className='login-switch-text'>微信登录</Text>
          </View>
        </View>
      </View>
    );
  }

  // 微信登录界面（默认）
  return (
    <View className='login-page'>
      <View className='login-card'>
        <View className='login-logo'>
          <Icon name='window' size={72} color='#122b4d' />
        </View>
        <Text className='login-title'>19分贝门窗</Text>
        <Text className='login-subtitle'>微信授权登录</Text>

        <View className='login-form'>
          <Text className='login-role-label'>选择您的身份</Text>
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
              <Icon name='arrow-down' size={24} color='#9ca3af' />
            </View>
          </Picker>
          <Text className='login-role-hint'>首次登录将自动注册，后续登录直接进入</Text>

          {error && <Text className='login-error'>{error}</Text>}

          <View className={`btn-primary login-submit ${loading ? 'opacity-50' : ''}`} onClick={handleWechatLogin}>
            <Text>{loading ? '登录中...' : '微信一键登录'}</Text>
          </View>
        </View>

        <View className='login-switch' onClick={() => { setMode('admin'); setError(''); }}>
          <Text className='login-switch-text'>管理员登录</Text>
        </View>
      </View>

      {/* 测试账号仅开发环境可见 */}
      {DEV && (
        <View className='login-test'>
          <Text className='login-test-title'>测试账号（开发环境，点击快速填充角色）</Text>
          <View className='login-test-grid'>
            {[
              { label: '客户', role: 'CLIENT' as const },
              { label: '老板', role: 'STORE_OWNER' as const },
              { label: '店长', role: 'STORE_MANAGER' as const },
              { label: '安装工', role: 'INSTALLER' as const },
            ].map((acc) => (
              <View key={acc.role} className='login-test-item' onClick={() => {
                const idx = roleOptions.findIndex(r => r.value === acc.role);
                setRoleIdx(idx); setRole(acc.role);
              }}>
                <Text className='login-test-label'>{acc.label}</Text>
                <Text className='login-test-phone'>{acc.role}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}
