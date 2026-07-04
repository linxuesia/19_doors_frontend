import { useState, useEffect } from 'react';
import { View, Text, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import Icon from '../../../components/Icon';
import './index.scss';

const QR_SCENES = [1011, 1012, 1013, 1047, 1048, 1049];

export default function InstallerLogin() {
  const { user, phoneLogin, refreshUser } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 门店选择
  const [showStorePicker, setShowStorePicker] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [storeLoading, setStoreLoading] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    const options = Taro.getLaunchOptionsSync();
    const scene = options.scene;
    if (QR_SCENES.includes(scene) || process.env.NODE_ENV === 'development') {
      setAllowed(true);
    }
    setChecked(true);
  }, []);

  // 已登录的安装工程师直接跳转工单列表
  useEffect(() => {
    if (user && user.storeId) {
      Taro.redirectTo({ url: '/subpackages/business/installer-orders/index' });
    }
  }, [user]);

  if (!checked) {
    return <View className='installer-login-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>加载中...</Text></View>;
  }

  if (user && user.storeId) {
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
          <Text className='denied-text'>请使用安装工程师专属二维码扫码进入本页面</Text>
        </View>
      </View>
    );
  }

  const handleLogin = async () => {
    setError('');
    const phoneTrimmed = phone.trim();
    if (!phoneTrimmed) {
      setError('请输入手机号');
      return;
    }
    if (!/^1\d{10}$/.test(phoneTrimmed)) {
      setError('请输入正确的手机号');
      return;
    }
    setLoading(true);
    try {
      Taro.showLoading({ title: '登录中...' });
      const loginRes = await Taro.login();
      if (!loginRes.code) throw new Error('微信登录失败');
      const loggedInUser = await phoneLogin({ phone: phoneTrimmed, wxCode: loginRes.code });
      Taro.hideLoading();

      if (loggedInUser.storeId) {
        // 已有归属门店，直接进入
        Taro.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          Taro.redirectTo({ url: '/subpackages/business/installer-orders/index' });
        }, 800);
      } else {
        // 无归属门店，展示门店列表供选择
        setLoading(false);
        fetchStores();
      }
    } catch (e: any) {
      setError(e.message || '登录失败，请重试');
      Taro.hideLoading();
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    setStoreLoading(true);
    try {
      const res: any = await api.get('/stores', { pageSize: '100' });
      const list = (res?.list || []).filter((s: any) => s.status === 'OPEN');
      setStores(list);
      setShowStorePicker(true);
    } catch {
      Taro.showToast({ title: '获取门店列表失败', icon: 'none' });
    } finally {
      setStoreLoading(false);
    }
  };

  const handleJoinStore = async (storeId: string) => {
    setJoiningId(storeId);
    try {
      await api.post('/auth/join-store', { storeId });
      await refreshUser();
      Taro.showToast({ title: '加入成功', icon: 'success' });
      setTimeout(() => {
        Taro.redirectTo({ url: '/subpackages/business/installer-orders/index' });
      }, 800);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '加入失败', icon: 'none' });
    } finally {
      setJoiningId(null);
    }
  };

  // 门店选择界面
  if (showStorePicker) {
    return (
      <View className='installer-login-page'>
        <View className='login-header'>
          <View className='brand-logo'>
            <Icon name='window' size={72} color='#ffffff' />
          </View>
          <Text className='brand-name'>19分贝</Text>
          <Text className='brand-subtitle'>选择您所属的门店</Text>
        </View>

        <View className='store-picker-card'>
          <Text className='store-picker-title'>请选择门店</Text>
          <Text className='store-picker-desc'>选择后将自动注册为该门店的安装工程师</Text>

          {storeLoading ? (
            <View className='store-picker-loading'>
              <Text className='store-picker-loading-text'>加载门店列表中...</Text>
            </View>
          ) : stores.length === 0 ? (
            <View className='store-picker-empty'>
              <Icon name='building' size={64} color='#d1d5db' />
              <Text className='store-picker-empty-text'>暂无可加入的门店</Text>
            </View>
          ) : (
            <ScrollView className='store-picker-list' scrollY>
              {stores.map((store: any) => (
                <View
                  key={store.id}
                  className={`store-picker-item ${joiningId === store.id ? 'store-picker-item-disabled' : ''}`}
                  onClick={() => joiningId ? null : handleJoinStore(store.id)}
                >
                  <View className='store-picker-item-left'>
                    <View className='store-picker-avatar'>
                      <Icon name='building' size={36} color='#122b4d' />
                    </View>
                    <View className='store-picker-info'>
                      <Text className='store-picker-name'>{store.name}</Text>
                      <Text className='store-picker-addr'>{store.address || '暂无地址'}</Text>
                    </View>
                  </View>
                  <View className='store-picker-arrow'>
                    {joiningId === store.id ? (
                      <Text className='store-picker-joining'>加入中...</Text>
                    ) : (
                      <Icon name='arrow-right' size={28} color='#9ca3af' />
                    )}
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className='installer-login-page'>
      <View className='login-header'>
        <View className='brand-logo'>
          <Icon name='window' size={72} color='#ffffff' />
        </View>
        <Text className='brand-name'>19分贝</Text>
        <Text className='brand-subtitle'>安装工程师专属服务平台</Text>
      </View>

      <View className='login-card'>
        <Text className='login-card-title'>欢迎登录</Text>

        <View className='login-form'>
          <View className='input-wrapper'>
            <View className='input-icon'>
              <Icon name='phone' size={36} color='#64748b' />
            </View>
            <Input
              className='login-input'
              type='number'
              maxlength={11}
              placeholder='请输入手机号'
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
            />
          </View>

          {error && <Text className='login-error'>{error}</Text>}

          <Text className='login-hint'>请输入您在本系统的注册手机号</Text>

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
