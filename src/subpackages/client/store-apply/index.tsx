import { useState, useEffect } from 'react';
import { View, Text, Input, Image, Button, Picker } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import { uploadFile } from '../../../utils/cloud';

interface ImageItem {
  fileID: string;
  cloudUrl: string;
}
import './index.scss';

const roles = [
  {
    key: 'STORE_OWNER',
    title: '门店老板',
    desc: '拥有最高管理权限',
    icon: 'user',
  },
  {
    key: 'STORE_MANAGER',
    title: '门店店长',
    desc: '负责门店日常运营',
    icon: 'clipboard',
  },
];

interface StoreItem {
  id: number;
  name: string;
}

export default function StoreApply() {
  const [role, setRole] = useState('STORE_OWNER');
  const [storeName, setStoreName] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<number>(0);
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseImages, setLicenseImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [storeList, setStoreList] = useState<StoreItem[]>([]);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const res: any = await api.get('/stores');
      const list = (Array.isArray(res) ? res : []).map((s: any) => ({ id: s.id, name: s.name }));
      setStoreList(list);
    } catch (e) {
      // ignore
    }
  };

  const handleUpload = () => {
    Taro.chooseImage({
      count: 3 - licenseImages.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        setUploading(true);
        const newImages: ImageItem[] = [];
        for (let i = 0; i < res.tempFilePaths.length; i++) {
          try {
            const ext = res.tempFilePaths[i].split('.').pop() || 'jpg';
            const cloudPath = `store-apply/${Date.now()}_${i}.${ext}`;
            const result = await uploadFile(res.tempFilePaths[i], cloudPath);
            newImages.push(result);
          } catch {
            Taro.showToast({ title: '图片上传失败', icon: 'none' });
          }
        }
        setLicenseImages([...licenseImages, ...newImages]);
        setUploading(false);
      },
      fail: () => setUploading(false),
    });
  };

  const removeImage = (index: number) => {
    setLicenseImages(licenseImages.filter((_, i) => i !== index));
  };

  const handleChooseLocation = () => {
    Taro.chooseLocation({
      success: (res: any) => {
        setAddress(res.address || res.name || '');
        setLatitude(res.latitude);
        setLongitude(res.longitude);
      },
      fail: () => {
        Taro.showToast({ title: '定位失败，请重试', icon: 'none' });
      },
    });
  };

  const handleSubmit = async () => {
    if (role === 'STORE_OWNER' && !storeName) {
      Taro.showToast({ title: '请填写门店名称', icon: 'none' });
      return;
    }
    if (role === 'STORE_MANAGER' && !selectedStoreId) {
      Taro.showToast({ title: '请选择门店', icon: 'none' });
      return;
    }
    if (!contactName || !phone) {
      Taro.showToast({ title: '请填写必填项', icon: 'none' });
      return;
    }
    if (!/^1\d{10}$/.test(phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    setLoading(true);
    try {
      await api.post('/store-applications', {
        role,
        ...(role === 'STORE_OWNER'
          ? { storeName }
          : { storeId: selectedStoreId }),
        contactName,
        phone,
        licenseImages: licenseImages.map((img) => img.cloudUrl),
        address,
        latitude,
        longitude,
      });
      Taro.showToast({ title: '申请已提交，等待审核', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '提交失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const onStoreChange = (e: any) => {
    const idx = e.detail.value as number;
    setSelectedStoreId(storeList[idx]?.id || 0);
  };

  return (
    <View className='sa-page'>
      <View className='sa-form'>
        {/* 角色选择 */}
        <View className='sa-role-row'>
          {roles.map((r) => (
            <View
              key={r.key}
              className={`sa-role-card ${role === r.key ? 'sa-role-active' : ''}`}
              onClick={() => { setRole(r.key); setSelectedStoreId(0); }}
            >
              <Icon name={r.icon as any} size={48} color={role === r.key ? '#122b4d' : '#9ca3af'} />
              <Text className={`sa-role-title ${role === r.key ? 'sa-role-title-active' : ''}`}>{r.title}</Text>
              <Text className='sa-role-desc'>{r.desc}</Text>
            </View>
          ))}
        </View>

        {/* 老板：门店名称输入 */}
        {role === 'STORE_OWNER' && (
        <>
        <View className='sa-field'>
          <Text className='sa-label'>门店名称</Text>
          <Input className='sa-input' placeholder='例如：上海19分贝门窗直营店' value={storeName} onInput={(e) => setStoreName(e.detail.value)} />
        </View>
        <View className='sa-field'>
          <Text className='sa-label'>门店位置</Text>
          <View className='sa-location-row' onClick={handleChooseLocation}>
            <Icon name='map-pin' size={32} color='#122b4d' />
            <Text className={address ? 'sa-location-text' : 'sa-location-placeholder'}>
              {address || '点击选择门店地址'}
            </Text>
            <Icon name='arrow-right' size={28} color='#d1d5db' />
          </View>
        </View>
        </>
        )}

        {/* 店长：门店选择 */}
        {role === 'STORE_MANAGER' && (
        <View className='sa-field'>
          <Text className='sa-label'>选择门店</Text>
          <Picker mode='selector' range={storeList.map(s => s.name)} value={storeList.findIndex(s => s.id === selectedStoreId)} onChange={onStoreChange}>
            <View className='sa-picker'>
              <Text className={selectedStoreId ? '' : 'sa-picker-placeholder'}>
                {storeList.find(s => s.id === selectedStoreId)?.name || '请选择要加入的门店'}
              </Text>
              <Icon name='arrow-down' size={28} color='#9ca3af' />
            </View>
          </Picker>
        </View>
        )}

        <View className='sa-field'>
          <Text className='sa-label'>您的姓名</Text>
          <Input className='sa-input' placeholder='真实姓名' value={contactName} onInput={(e) => setContactName(e.detail.value)} />
        </View>
        <View className='sa-field'>
          <Text className='sa-label'>联系电话</Text>
          <Input className='sa-input' type='number' placeholder='11位手机号码' value={phone} onInput={(e) => setPhone(e.detail.value)} maxlength={11} />
        </View>
        {role === 'STORE_OWNER' && (
        <View className='sa-field'>
          <Text className='sa-label'>门店资质材料（营业执照等图片）</Text>
          <View className='sa-upload-area' onClick={uploading ? undefined : handleUpload}>
            {licenseImages.length > 0 ? (
              <View className='sa-image-list'>
                {licenseImages.map((img, i) => (
                  <View key={i} className='sa-image-item'>
                    <Image className='sa-image-preview' src={img.cloudUrl} mode='aspectFill' />
                    <View className='sa-image-delete' onClick={(e) => { e.stopPropagation(); removeImage(i); }}>
                      <Icon name='close' size={20} color='#ffffff' />
                    </View>
                  </View>
                ))}
                {licenseImages.length < 3 && (
                  <View className='sa-add-btn'>
                    {uploading ? (
                      <Text className='sa-upload-text'>上传中...</Text>
                    ) : (
                      <Icon name='add' size={40} color='#c0c4cc' />
                    )}
                  </View>
                )}
              </View>
            ) : (
              <View className='sa-upload-placeholder'>
                {uploading ? (
                  <Text className='sa-upload-text'>上传中...</Text>
                ) : (
                  <>
                    <Icon name='camera' size={56} color='#c0c4cc' />
                    <Text className='sa-upload-text'>点击上传图片</Text>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
        )}

        <Button className={`btn-primary sa-submit ${loading ? 'opacity-50' : ''}`} onClick={handleSubmit}>
          <Text>{loading ? '提交中...' : '提交申请'}</Text>
        </Button>
      </View>
    </View>
  );
}
