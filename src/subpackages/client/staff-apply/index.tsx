import { useState } from 'react';
import { View, Text, Picker, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

const roleOptions = [
  { value: 'STORE_MANAGER', label: '店长' },
  { value: 'INSTALLER', label: '安装工' },
];

export default function StaffApply() {
  const [applyRole, setApplyRole] = useState('STORE_MANAGER');
  const [roleIdx, setRoleIdx] = useState(0);
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');
    if (!storeName) {
      setError('请输入所属门店名称');
      return;
    }
    setLoading(true);
    try {
      await api.post('/staff-applications', {
        applyRole,
        storeName,
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
        <Icon name='user' size={56} color='#122b4d' />
        <Text className='apply-title'>员工认证</Text>
        <Text className='apply-subtitle'>申请成为门店店长或安装工，审核通过后生效</Text>
      </View>

      <View className='apply-form'>
        <View className='apply-field'>
          <Text className='apply-label'>申请角色</Text>
          <Picker
            mode='selector'
            range={roleOptions.map(r => r.label)}
            value={roleIdx}
            onChange={(e) => {
              setRoleIdx(Number(e.detail.value));
              setApplyRole(roleOptions[Number(e.detail.value)].value);
            }}
          >
            <View className='apply-picker'>
              <Text>{roleOptions[roleIdx].label}</Text>
              <Icon name='arrow-down' size={24} color='#9ca3af' />
            </View>
          </Picker>
        </View>
        <View className='apply-field'>
          <Text className='apply-label'>所属门店</Text>
          <Input className='apply-input' placeholder='请输入门店名称' value={storeName} onInput={(e) => setStoreName(e.detail.value)} />
        </View>

        {error && <Text className='apply-error'>{error}</Text>}

        <Button className='btn-primary apply-submit' onClick={handleSubmit} disabled={loading}>
          <Text>{loading ? '提交中...' : '提交申请'}</Text>
        </Button>
      </View>
    </View>
  );
}
