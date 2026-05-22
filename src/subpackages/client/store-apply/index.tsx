import { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

export default function StoreApply() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!companyName || !contactName || !phone) {
      setError('请填写公司名称、联系人及手机号');
      return;
    }
    setLoading(true);
    try {
      await api.post('/store-applications', {
        companyName,
        contactName,
        phone,
        address,
      });
      Taro.showToast({ title: '申请已提交，等待审核', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch (e: any) {
      setError(e.message || '提交失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='apply-page'>
      <View className='apply-header'>
        <Icon name='building' size={56} color='#122b4d' />
        <Text className='apply-title'>门店入驻申请</Text>
        <Text className='apply-subtitle'>填写门店信息，提交后等待管理员审核</Text>
      </View>

      <View className='apply-form'>
        <View className='apply-field'>
          <Text className='apply-label'>公司名称</Text>
          <Input className='apply-input' placeholder='请输入公司/门店名称' value={companyName} onInput={(e) => setCompanyName(e.detail.value)} />
        </View>
        <View className='apply-field'>
          <Text className='apply-label'>联系人</Text>
          <Input className='apply-input' placeholder='请输入联系人姓名' value={contactName} onInput={(e) => setContactName(e.detail.value)} />
        </View>
        <View className='apply-field'>
          <Text className='apply-label'>手机号</Text>
          <Input className='apply-input' type='number' placeholder='请输入手机号' value={phone} onInput={(e) => setPhone(e.detail.value)} maxlength={11} />
        </View>
        <View className='apply-field'>
          <Text className='apply-label'>门店地址</Text>
          <Input className='apply-input' placeholder='请输入门店地址（选填）' value={address} onInput={(e) => setAddress(e.detail.value)} />
        </View>

        {error && <Text className='apply-error'>{error}</Text>}

        <Button className='btn-primary apply-submit' onClick={handleSubmit} disabled={loading}>
          <Text>{loading ? '提交中...' : '提交申请'}</Text>
        </Button>
      </View>
    </View>
  );
}
