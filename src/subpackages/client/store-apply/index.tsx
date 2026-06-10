import { useState } from 'react';
import { View, Text, Input, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import { uploadFile } from '../../../utils/cloud';

interface ImageItem {
  fileID: string;
  cloudUrl: string;
}
import './index.scss';

export default function StoreApply() {
  const [storeName, setStoreName] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [licenseImages, setLicenseImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

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
    if (!storeName) {
      Taro.showToast({ title: '请填写门店名称', icon: 'none' });
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
        role: 'STORE_OWNER',
        storeName,
        contactName,
        phone,
        licenseImages: licenseImages.map((img) => img.fileID),
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

  return (
    <View className='sa-page'>
      <View className='sa-form'>
        {/* 页面标题 */}
        <View className='sa-title-section'>
          <Icon name='building' size={56} color='#122b4d' />
          <Text className='sa-main-title'>门店入驻申请</Text>
          <Text className='sa-main-desc'>提交申请后，管理员将在1-3个工作日内审核</Text>
        </View>

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

        <View className='sa-field'>
          <Text className='sa-label'>您的姓名</Text>
          <Input className='sa-input' placeholder='真实姓名' value={contactName} onInput={(e) => setContactName(e.detail.value)} />
        </View>

        <View className='sa-field'>
          <Text className='sa-label'>联系电话</Text>
          <Input className='sa-input' type='number' placeholder='11位手机号码' value={phone} onInput={(e) => setPhone(e.detail.value)} maxlength={11} />
        </View>

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

        <Button className={`btn-primary sa-submit ${loading ? 'opacity-50' : ''}`} onClick={handleSubmit}>
          <Text>{loading ? '提交中...' : '提交申请'}</Text>
        </Button>
      </View>
    </View>
  );
}
