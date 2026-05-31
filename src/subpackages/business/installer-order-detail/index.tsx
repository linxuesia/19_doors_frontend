import { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import api from '../../../utils/api';
import './index.scss';

const MAX_IMAGES = 9;

export default function InstallerOrderDetail() {
  const router = useRouter();
  const orderId = router.params.id;
  const [order, setOrder] = useState<any>(null);
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (orderId) {
      api.get(`/orders/${orderId}`)
        .then((res: any) => setOrder(res))
        .catch(() => Taro.showToast({ title: '加载工单失败', icon: 'none' }));
    }
  }, [orderId]);

  const handleChooseImage = () => {
    if (images.length >= MAX_IMAGES) {
      Taro.showToast({ title: `最多上传${MAX_IMAGES}张图片`, icon: 'none' });
      return;
    }
    Taro.chooseImage({
      count: MAX_IMAGES - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        setImages([...images, ...res.tempFilePaths]);
      },
    });
  };

  const handleTakePhoto = () => {
    if (images.length >= MAX_IMAGES) {
      Taro.showToast({ title: `最多上传${MAX_IMAGES}张图片`, icon: 'none' });
      return;
    }
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        setImages([...images, ...res.tempFilePaths]);
      },
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handlePreviewImage = (index: number) => {
    Taro.previewImage({
      current: images[index],
      urls: images,
    });
  };

  const handleSubmitProgress = async () => {
    if (images.length === 0) {
      Taro.showToast({ title: '请至少上传一张图片', icon: 'none' });
      return;
    }
    setLoading(true);
    try {
      const { uploadImages } = await import('../../../utils/cloud');
      const results = await uploadImages(images, 'construction-progress');
      await api.post(`/orders/${orderId}/progress`, {
        images: results.map(r => r.cloudUrl),
      });
      Taro.showToast({ title: '进度已更新', icon: 'success' });
      setTimeout(() => {
        setImages([]);
        Taro.navigateBack();
      }, 1500);
    } catch {
      Taro.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyInspection = async () => {
    setLoading(true);
    try {
      await api.put(`/orders/${orderId}`, { status: 'PENDING_INSPECTION' });
      Taro.showToast({ title: '验收申请已提交', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch {
      Taro.showToast({ title: '申请失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return <View className='iod-loading'><Text>加载中...</Text></View>;
  }

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 7) return phone || '';
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  };

  return (
    <View className='iod-page'>
      <View className='iod-content'>
        <View className='iod-card'>
          <Text className='iod-card-title'>工单信息</Text>
          <View className='iod-info-row'>
            <Text className='iod-info-label'>地址</Text>
            <Text className='iod-info-value'>{order.installAddress || '-'}</Text>
          </View>
          <View className='iod-info-row'>
            <Text className='iod-info-label'>客户</Text>
            <Text className='iod-info-value'>
              {order.client?.name || order.clientName || '-'} {maskPhone(order.client?.phone || order.clientPhone)}
            </Text>
          </View>
          <View className='iod-info-row'>
            <Text className='iod-info-label'>时间</Text>
            <Text className='iod-info-value'>{order.scheduledInstallDate ? `${order.scheduledInstallDate} 09:00` : '-'}</Text>
          </View>
        </View>

        <View className='iod-card'>
          <Text className='iod-card-title'>进度更新与图片</Text>
          <View className='iod-upload-grid'>
            {images.map((img, idx) => (
              <View key={idx} className='iod-image-item'>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image
                  className='iod-image'
                  src={img}
                  mode='aspectFill'
                  onClick={() => handlePreviewImage(idx)}
                />
                <View className='iod-image-remove' onClick={() => handleRemoveImage(idx)}>
                  <Text className='iod-remove-icon'>✕</Text>
                </View>
              </View>
            ))}
            {images.length < MAX_IMAGES && (
              <View className='iod-add-btn' onClick={handleChooseImage}>
                <Text className='iod-add-icon'>+</Text>
                <Text className='iod-add-text'>添加图片</Text>
              </View>
            )}
          </View>
          <View className='iod-photo-btn' onClick={handleTakePhoto}>
            <Text className='iod-photo-btn-text'>📷 拍照上传</Text>
          </View>
        </View>
      </View>

      <View className='iod-bottom-bar'>
        <View
          className={`iod-action-btn iod-btn-primary ${loading ? 'iod-disabled' : ''}`}
          onClick={handleSubmitProgress}
        >
          <Text className='iod-btn-text'>进度更新与图片</Text>
        </View>
        <View
          className={`iod-action-btn iod-btn-secondary ${loading ? 'iod-disabled' : ''}`}
          onClick={handleApplyInspection}
        >
          <Text className='iod-btn-text'>申请验收</Text>
        </View>
      </View>
    </View>
  );
}
