import { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import './index.scss';

export default function StoreManage() {
  const { user, requireBusinessLogin, refreshUser } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    businessHours: '09:00 - 18:00',
    description: '',
    coverImage: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const isOwner = user?.role === 'STORE_OWNER';

  useEffect(() => {
    if (!requireBusinessLogin()) return;
    if (!user?.storeId) return;

    setLoading(true);
    api.get(`/stores/${user.storeId}`)
      .then((res: any) => {
        setStore(res);
        setForm({
          name: res.name || '',
          phone: res.phone || '',
          address: res.address || '',
          businessHours: res.businessHours || '09:00 - 18:00',
          description: res.description || '',
          coverImage: res.coverImage || '',
        });
      })
      .catch(() => Taro.showToast({ title: '加载门店信息失败', icon: 'none' }))
      .finally(() => setLoading(false));
  }, [user?.storeId]);

  const handleSave = async () => {
    if (!form.name) {
      Taro.showToast({ title: '门店名称不能为空', icon: 'none' });
      return;
    }
    setSaving(true);
    try {
      await api.put(`/stores/${user!.storeId}`, form);
      await refreshUser();
      Taro.showToast({ title: '保存成功', icon: 'success' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '保存失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  if (!user || !requireBusinessLogin()) return null;

  if (loading) {
    return (
      <View className='sm-loading'>
        <Text className='sm-loading-text'>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView className='sm-page' scrollY>
      <View className='sm-header'>
        <Text className='sm-title'>门店设置</Text>
        <Text className='sm-subtitle'>{isOwner ? '编辑门店信息' : '查看门店信息'}</Text>
      </View>

      <View className='sm-form'>
        <View className='sm-field'>
          <Text className='sm-label'>门店名称 *</Text>
          <Input
            className='sm-input'
            placeholder='请输入门店名称'
            value={form.name}
            onInput={(e) => update('name', e.detail.value)}
            disabled={!isOwner}
          />
        </View>

        <View className='sm-field'>
          <Text className='sm-label'>联系电话</Text>
          <Input
            className='sm-input'
            type='number'
            placeholder='请输入门店电话'
            value={form.phone}
            onInput={(e) => update('phone', e.detail.value)}
            maxlength={11}
            disabled={!isOwner}
          />
        </View>

        <View className='sm-field'>
          <Text className='sm-label'>门店地址</Text>
          <Input
            className='sm-input'
            placeholder='请输入门店地址'
            value={form.address}
            onInput={(e) => update('address', e.detail.value)}
            disabled={!isOwner}
          />
        </View>

        <View className='sm-field'>
          <Text className='sm-label'>营业时间</Text>
          <Input
            className='sm-input'
            placeholder='例如：09:00 - 18:00'
            value={form.businessHours}
            onInput={(e) => update('businessHours', e.detail.value)}
            disabled={!isOwner}
          />
        </View>

        <View className='sm-field'>
          <Text className='sm-label'>门店简介</Text>
          <Textarea
            className='sm-textarea'
            placeholder='请输入门店简介（选填）'
            value={form.description}
            onInput={(e) => update('description', e.detail.value)}
            disabled={!isOwner}
            maxlength={200}
            autoHeight
          />
          <Text className='sm-count'>{form.description.length}/200</Text>
        </View>

        {isOwner && (
          <View className={`btn-primary sm-submit ${saving ? 'opacity-50' : ''}`} onClick={handleSave}>
            <Text>{saving ? '保存中...' : '保存设置'}</Text>
          </View>
        )}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
