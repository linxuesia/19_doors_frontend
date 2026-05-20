import { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

export default function Reservation() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    contactName: user?.name || '',
    phone: user?.phone || '',
    address: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.contactName || !form.phone || !form.address) {
      Taro.showToast({ title: '请填写姓名、电话和地址', icon: 'none' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/measurements', {
        ...form,
        clientId: user?.id,
      });
      setSubmitted(true);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '提交失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <View className='res-page'>
        <View className='res-success'>
          <Icon name='check-circle' size={96} color='#00c758' className='res-success-icon' />
          <Text className='res-success-title'>预约提交成功</Text>
          <Text className='res-success-desc'>我们将尽快安排专业人员与您联系，确认上门量尺时间</Text>
          <View className='btn-primary' onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>
            <Text>返回首页</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className='res-page'>
      {/* 品牌头图 */}
      <View className='res-hero'>
        <View className='res-hero-bg' />
        <View className='res-hero-content'>
          <Text className='res-hero-title'>门窗焕新季</Text>
          <Text className='res-hero-subtitle'>专业量尺 · 免费上门 · 定制方案</Text>
        </View>
      </View>

      {/* 预约表单 */}
      <View className='res-form-card'>
        <Text className='res-form-title'>预约免费量尺</Text>

        <View className='res-field'>
          <Icon name='user' size={36} color='#9ca3af' className='res-field-icon' />
          <Input
            className='res-input'
            placeholder='请输入您的姓名'
            value={form.contactName}
            onInput={(e) => setForm({ ...form, contactName: e.detail.value })}
          />
        </View>

        <View className='res-field'>
          <Icon name='phone' size={36} color='#9ca3af' className='res-field-icon' />
          <Input
            className='res-input'
            type='number'
            placeholder='请输入手机号码'
            value={form.phone}
            onInput={(e) => setForm({ ...form, phone: e.detail.value })}
            maxlength={11}
          />
        </View>

        <View className='res-field'>
          <Icon name='map-pin' size={36} color='#9ca3af' className='res-field-icon' />
          <Input
            className='res-input'
            placeholder='请选择所在地区'
            value={form.address}
            onInput={(e) => setForm({ ...form, address: e.detail.value })}
          />
        </View>

        <View className={`btn-primary res-submit ${loading ? 'res-submit-loading' : ''}`} onClick={handleSubmit}>
          <Text>{loading ? '提交中...' : '立即预约'}</Text>
        </View>
      </View>

      {/* 服务特性 */}
      <View className='res-features'>
        <View className='res-feature-item'>
          <Icon name='home' size={44} color='#122b4d' />
          <Text className='res-feature-label'>免费上门</Text>
        </View>
        <View className='res-feature-item'>
          <Icon name='ruler' size={44} color='#122b4d' />
          <Text className='res-feature-label'>专业测量</Text>
        </View>
        <View className='res-feature-item'>
          <Icon name='design' size={44} color='#122b4d' />
          <Text className='res-feature-label'>方案定制</Text>
        </View>
        <View className='res-feature-item'>
          <Icon name='quality' size={44} color='#122b4d' />
          <Text className='res-feature-label'>品质保障</Text>
        </View>
      </View>

      <View className='safe-bottom' />
    </View>
  );
}
