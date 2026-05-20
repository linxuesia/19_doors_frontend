import { useState } from 'react';
import { View, Text, Input, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../utils/api';
import './index.scss';

export default function Reservation() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    contactName: user?.name || '',
    phone: user?.phone || '',
    communityName: '',
    address: '',
    houseArea: '',
    expectedDate: '',
    remarks: '',
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
        houseArea: form.houseArea ? parseFloat(form.houseArea) : null,
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
      <View className='res-success'>
        <Text className='res-success-icon'>✅</Text>
        <Text className='res-success-title'>预约提交成功！</Text>
        <Text className='res-success-desc'>我们将尽快安排专业人员与您联系，确认上门量尺时间</Text>
        <View className='btn-primary' onClick={() => Taro.switchTab({ url: '/pages/index/index' })}>
          <Text>返回首页</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='res-page'>
      <View className='res-form'>
        <Text className='res-title'>预约量尺</Text>
        <Text className='res-desc'>填写以下信息，我们将安排专业人员上门免费量尺</Text>

        <View className='res-field'>
          <Text className='res-label'>您的姓名 *</Text>
          <Input className='res-input' placeholder='请输入您的姓名' value={form.contactName} onInput={(e) => setForm({ ...form, contactName: e.detail.value })} />
        </View>
        <View className='res-field'>
          <Text className='res-label'>手机号码 *</Text>
          <Input className='res-input' type='number' placeholder='请输入手机号码' value={form.phone} onInput={(e) => setForm({ ...form, phone: e.detail.value })} maxlength={11} />
        </View>
        <View className='res-field'>
          <Text className='res-label'>小区名称</Text>
          <Input className='res-input' placeholder='例如：芯汇花园' value={form.communityName} onInput={(e) => setForm({ ...form, communityName: e.detail.value })} />
        </View>
        <View className='res-field'>
          <Text className='res-label'>详细地址 *</Text>
          <Input className='res-input' placeholder='省市区+门牌号' value={form.address} onInput={(e) => setForm({ ...form, address: e.detail.value })} />
        </View>
        <View className='res-row'>
          <View className='res-field res-half'>
            <Text className='res-label'>房屋面积（平）</Text>
            <Input className='res-input' type='digit' placeholder='可选' value={form.houseArea} onInput={(e) => setForm({ ...form, houseArea: e.detail.value })} />
          </View>
          <View className='res-field res-half'>
            <Text className='res-label'>期望量尺日期</Text>
            <Input className='res-input' type='text' placeholder='如：2026-06-20' value={form.expectedDate} onInput={(e) => setForm({ ...form, expectedDate: e.detail.value })} />
          </View>
        </View>
        <View className='res-field'>
          <Text className='res-label'>备注留言</Text>
          <Textarea className='res-textarea' placeholder='可输入其他补充信息' value={form.remarks} onInput={(e) => setForm({ ...form, remarks: e.detail.value })} />
        </View>

        <View className={`btn-primary res-submit ${loading ? 'opacity-50' : ''}`} onClick={handleSubmit}>
          <Text>{loading ? '提交中...' : '提交预约'}</Text>
        </View>
      </View>
      <View className='safe-bottom' />
    </View>
  );
}
