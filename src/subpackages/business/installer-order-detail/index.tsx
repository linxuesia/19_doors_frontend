import { useState, useEffect } from 'react';
import { View, Text, Image, Input } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import api from '../../../utils/api';
import Icon from '../../../components/Icon';
import './index.scss';

const MAX_RECORDS = 9;

interface ImageRecord {
  id: string;
  image: string;
  description: string;
}

/** 生成唯一ID */
const uid = () => `r${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export default function InstallerOrderDetail() {
  const router = useRouter();
  const id = router.params.id;
  const taskType = (router.params.type || 'order') as 'order' | 'measurement';
  const isMeasurement = taskType === 'measurement';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 施工订单模式 - 简单图片列表
  const [images, setImages] = useState<string[]>([]);

  // 量尺模式 - 图片+文字配对
  const [records, setRecords] = useState<ImageRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const apiUrl = isMeasurement ? `/measurements/${id}` : `/orders/${id}`;
    api.get(apiUrl)
      .then((res: any) => setData(res))
      .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }));
  }, [id, isMeasurement]);

  // ====== 量尺模式：拍照/选图 ======
  const handleTakePhoto = () => {
    if (records.length >= MAX_RECORDS) {
      Taro.showToast({ title: `最多${MAX_RECORDS}张`, icon: 'none' });
      return;
    }
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      sizeType: ['compressed'],
      success: (res) => {
        if (res.tempFiles?.[0]) {
          const newRecord: ImageRecord = {
            id: uid(),
            image: res.tempFiles[0].tempFilePath,
            description: '',
          };
          setRecords((prev) => [...prev, newRecord]);
          // 自动聚焦到新记录的输入框
          setTimeout(() => setEditingId(newRecord.id), 300);
        }
      },
    });
  };

  const handleChooseImage = () => {
    if (records.length >= MAX_RECORDS) {
      Taro.showToast({ title: `最多${MAX_RECORDS}张`, icon: 'none' });
      return;
    }
    Taro.chooseMedia({
      count: MAX_RECORDS - records.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const newRecords: ImageRecord[] = (res.tempFiles || []).map((f) => ({
          id: uid(),
          image: f.tempFilePath,
          description: '',
        }));
        setRecords((prev) => [...prev, ...newRecords]);
        if (newRecords.length === 1) {
          setTimeout(() => setEditingId(newRecords[0].id), 300);
        }
      },
    });
  };

  /** 更新某条记录的描述 */
  const updateDescription = (recordId: string, desc: string) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === recordId ? { ...r, description: desc } : r)),
    );
  };

  /** 删除一条记录 */
  const removeRecord = (recordId: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== recordId));
    if (editingId === recordId) setEditingId(null);
  };

  /** 预览大图 */
  const previewImage = (imgUrl: string) => {
    Taro.previewImage({
      current: imgUrl,
      urls: records.map((r) => r.image),
    });
  };

  // ====== 量尺模式：提交 ======
  const handleSubmitMeasure = async () => {
    if (records.length === 0) {
      Taro.showToast({ title: '请至少拍摄一张照片', icon: 'none' });
      return;
    }

    // 检查是否所有记录都有描述
    const emptyDesc = records.find((r) => !r.description.trim());
    if (emptyDesc) {
      setEditingId(emptyDesc.id);
      Taro.showToast({ title: '请补充照片说明', icon: 'none' });
      return;
    }

    setSubmitting(true);
    try {
      const { uploadImages } = await import('../../../utils/cloud');
      const uploadResults = await Promise.all(
        records.map((r) => uploadImages([r.image], 'measurement-photos')),
      );

      const payload = uploadResults.map((result, idx) => ({
        imageUrl: result[0]?.cloudUrl || '',
        description: records[idx].description,
      }));

      await api.post(`/measurements/${id}/complete`, { photos: payload });
      Taro.showToast({ title: '量尺记录已提交', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch (e: any) {
      Taro.showToast({ title: e.message || '提交失败', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  // ====== 施工订单模式（原有逻辑）======
  const handleChooseImageOld = () => {
    if (images.length >= MAX_RECORDS) {
      Taro.showToast({ title: `最多上传${MAX_RECORDS}张`, icon: 'none' });
      return;
    }
    Taro.chooseImage({
      count: MAX_RECORDS - images.length,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => setImages([...images, ...res.tempFilePaths]),
    });
  };

  const handleRemoveImageOld = (idx: number) => {
    setImages(images.filter((_, i) => i !== idx));
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
      await api.post(`/orders/${id}/progress`, { images: results.map((r) => r.cloudUrl) });
      Taro.showToast({ title: '进度已更新', icon: 'success' });
      setTimeout(() => { setImages([]); Taro.navigateBack(); }, 1500);
    } catch {
      Taro.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyInspection = async () => {
    setLoading(true);
    try {
      await api.put(`/orders/${id}`, { status: 'PENDING_INSPECTION' });
      Taro.showToast({ title: '验收申请已提交', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch {
      Taro.showToast({ title: '申请失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  // ====== 渲染 ======
  if (!data) {
    return <View className='iod-loading'><Text>加载中...</Text></View>;
  }

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 7) return phone || '';
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  };

  return (
    <View className={`iod-page ${isMeasurement ? 'iod-page-measure' : ''}`}>
      <View className='iod-content'>
        {/* 任务信息 */}
        <View className='iod-card'>
          <Text className='iod-card-title'>{isMeasurement ? '量尺任务信息' : '工单信息'}</Text>
          <View className='iod-info-row'>
            <Text className='iod-info-label'>地址</Text>
            <Text className='iod-info-value'>{data.installAddress || data.address || data.communityName || '-'}</Text>
          </View>
          <View className='iod-info-row'>
            <Text className='iod-info-label'>客户</Text>
            <Text className='iod-info-value'>
              {data.client?.name || data.contactName || data.clientName || '-'}{' '}
              {maskPhone(data.client?.phone || data.phone || data.clientPhone)}
            </Text>
          </View>
          {data.scheduledInstallDate && (
            <View className='iod-info-row'>
              <Text className='iod-info-label'>时间</Text>
              <Text className='iod-info-value'>{data.scheduledInstallDate} 09:00</Text>
            </View>
          )}
          {isMeasurement && data.houseArea && (
            <View className='iod-info-row'>
              <Text className='iod-info-label'>面积</Text>
              <Text className='iod-info-value'>{data.houseArea}㎡</Text>
            </View>
          )}
        </View>

        {/* ========== 量尺模式：图片+文字配对 ========== */}
        {isMeasurement && (
          <View className='iod-card iod-measure-card'>
            <View className='iod-card-header-row'>
              <Text className='iod-card-title'>量尺记录</Text>
              <Text className='iod-record-count'>{records.length}/{MAX_RECORDS}</Text>
            </View>
            <Text className='iod-measure-hint'>拍摄现场照片并填写说明，方便后续制作方案</Text>

            {/* 记录列表 */}
            <View className='iod-records'>
              {records.map((record, idx) => (
                <View key={record.id} className='iod-record-item'>
                  {/* 图片区域 */}
                  <View className='iod-record-img-wrap' onClick={() => previewImage(record.image)}>
                    <Image className='iod-record-img' src={record.image} mode='aspectFill' />
                    <View className='iod-record-index'>
                      <Text className='iod-index-text'>{idx + 1}</Text>
                    </View>
                  </View>

                  {/* 说明区域 */}
                  <View className='iod-record-desc-wrap'>
                    {editingId === record.id ? (
                      <Input
                        className='iod-desc-input iod-desc-input-focus'
                        placeholder='例如：窗户整体尺寸、墙体情况...'
                        value={record.description}
                        onInput={(e) => updateDescription(record.id, e.detail.value)}
                        onBlur={() => setEditingId(null)}
                        confirmType='done'
                        maxlength={50}
                        autoFocus
                      />
                    ) : (
                      <View
                        className={`iod-desc-display ${!record.description.trim() ? 'iod-desc-empty' : ''}`}
                        onClick={() => setEditingId(record.id)}
                      >
                        <Icon name='edit' size={24} color={record.description.trim() ? '#9ca3af' : '#d1d5db'} />
                        <Text className={`iod-desc-text ${!record.description.trim() ? 'iod-desc-placeholder' : ''}`}>
                          {record.description.trim() || '点击添加说明...'}
                        </Text>
                      </View>
                    )}

                    {/* 删除按钮 */}
                    <View className='iod-record-delete' onClick={() => removeRecord(record.id)}>
                      <Icon name='delete-bin' size={28} color='#ef4444' />
                    </View>
                  </View>
                </View>
              ))}

              {/* 添加按钮 */}
              {records.length < MAX_RECORDS && (
                <View className='iod-add-record' onClick={handleChooseImage}>
                  <View className='iod-add-record-icon'>
                    <Icon name='camera' size={40} color='#9ca3af' />
                  </View>
                  <Text className='iod-add-record-text'>添加量尺照片</Text>
                </View>
              )}
            </View>

            {/* 快捷提示标签 */}
            {records.length > 0 && editingId && (
              <View className='iod-quick-tags'>
                <Text className='iod-quick-label'>快捷填写：</Text>
                {['窗户整体尺寸', '墙体结构情况', '现场环境', '特殊位置标注'].map((tag) => (
                  <View
                    key={tag}
                    className='iod-quick-tag'
                    onClick={() => {
                      if (editingId) updateDescription(editingId, tag);
                    }}
                  >
                    <Text className='iod-quick-tag-text'>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ========== 施工订单模式：简单图片上传 ========== */}
        {!isMeasurement && (
          <View className='iod-card'>
            <Text className='iod-card-title'>进度更新与图片</Text>
            <View className='iod-upload-grid'>
              {images.map((img, idx) => (
                <View key={idx} className='iod-image-item'>
                  <Image className='iod-image' src={img} mode='aspectFill' onClick={() => Taro.previewImage({ current: img, urls: images })} />
                  <View className='iod-image-remove' onClick={() => handleRemoveImageOld(idx)}>
                    <Text className='iod-remove-icon'>x</Text>
                  </View>
                </View>
              ))}
              {images.length < MAX_RECORDS && (
                <View className='iod-add-btn' onClick={handleChooseImageOld}>
                  <Text className='iod-add-icon'>+</Text>
                  <Text className='iod-add-text'>添加图片</Text>
                </View>
              )}
            </View>
            <View className='iod-photo-btn' onClick={handleTakePhoto}>
              <Icon name='camera' size={28} color='#122b4d' />
              <Text className='iod-photo-btn-text'>拍照上传</Text>
            </View>
          </View>
        )}
      </View>

      {/* 底部操作栏 */}
      <View className='iod-bottom-bar'>
        {isMeasurement ? (
          <>
            <View
              className={`iod-action-btn iod-btn-camera ${submitting ? 'iod-disabled' : ''}`}
              onClick={!submitting ? handleTakePhoto : undefined}
            >
              <Icon name='camera' size={30} color='#ffffff' />
              <Text className='iod-btn-text'>拍照记录</Text>
            </View>
            <View
              className={`iod-action-btn iod-btn-primary ${submitting ? 'iod-disabled' : ''}`}
              onClick={!submitting ? handleSubmitMeasure : undefined}
            >
              <Icon name='check' size={30} color='#ffffff' />
              <Text className='iod-btn-text'>提交量尺完成</Text>
            </View>
          </>
        ) : (
          <>
            <View
              className={`iod-action-btn iod-btn-primary ${loading ? 'iod-disabled' : ''}`}
              onClick={!loading ? handleSubmitProgress : undefined}
            >
              <Text className='iod-btn-text'>进度更新与图片</Text>
            </View>
            <View
              className={`iod-action-btn iod-btn-secondary ${loading ? 'iod-disabled' : ''}`}
              onClick={!loading ? handleApplyInspection : undefined}
            >
              <Text className='iod-btn-text'>申请验收</Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
