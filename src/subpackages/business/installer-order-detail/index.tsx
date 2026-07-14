import { useState, useEffect } from 'react';
import { View, Text, Image, Input, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import api from '../../../utils/api';
import Icon from '../../../components/Icon';
import { CONSTRUCTION_STAGES, getStageLabel } from '../../../constants/construction-stages';
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
  const isMeasured = isMeasurement && data?.status === 'MEASURED';
  // 解析已提交的量尺照片（JSON 字符串）
  const submittedPhotos: any[] = (() => {
    if (!isMeasured || !data?.photos) return [];
    try { return typeof data.photos === 'string' ? JSON.parse(data.photos) : data.photos; } catch { return []; }
  })();

  // 施工订单模式 - 简单图片列表
  const [images, setImages] = useState<string[]>([]);
  const [stageIndex, setStageIndex] = useState<number>(0);
  const selectedStage = CONSTRUCTION_STAGES[stageIndex]?.key || '';

  // 量尺模式 - 图片+文字配对
  const [records, setRecords] = useState<ImageRecord[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // 施工订单模式 - 量尺参考（只读）
  const [measureRef, setMeasureRef] = useState<any[]>([]);       // 量尺照片+说明列表
  const [measureExpanded, setMeasureExpanded] = useState(false);  // 折叠状态
  const [measureLoading, setMeasureLoading] = useState(false);

  // 施工订单模式 - 历史进度折叠
  const [logExpanded, setLogExpanded] = useState(false);
  const constructionLogs: any[] = !isMeasurement ? (data?.constructionLogs || []) : [];

  useEffect(() => {
    if (!id) return;
    const apiUrl = isMeasurement ? `/measurements/${id}` : `/orders/${id}`;
    api.get(apiUrl)
      .then((res: any) => setData(res))
      .catch(() => Taro.showToast({ title: '加载失败', icon: 'none' }));
  }, [id, isMeasurement]);

  // 施工订单模式：加载关联的量尺记录作为参考（用 data.measurementId，避免重复请求订单详情）
  useEffect(() => {
    if (isMeasurement || !id || !data) return;
    const mId = data.measurementId;
    if (!mId) { setMeasureRef([]); return; }
    setMeasureLoading(true);
    api.get(`/measurements/${mId}`)
      .then((mData: any) => {
        const photos = mData?.photos || [];
        setMeasureRef(Array.isArray(photos) && photos.length > 0 ? photos : []);
      })
      .catch(() => setMeasureRef([]))
      .finally(() => setMeasureLoading(false));
  }, [id, isMeasurement, data?.measurementId]);

  // ====== 量尺模式：拍照/选图 ======
  const handleTakePhoto = () => {
    if (records.length >= MAX_RECORDS) {
      Taro.showToast({ title: `最多${MAX_RECORDS}张`, icon: 'none' });
      return;
    }
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
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

  /** navigateBack 安全 fallback */
  const goBack = () => {
    const from = router.params.from;
    const pages = Taro.getCurrentPages();
    if (pages.length > 1) {
      Taro.navigateBack();
    } else if (from === 'business') {
      Taro.redirectTo({ url: '/subpackages/business/orders/index' });
    } else {
      Taro.redirectTo({ url: '/subpackages/business/installer-orders/index' });
    }
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

    const res = await Taro.showModal({
      title: '提交量尺记录',
      content: '提交后将标记为已完成量尺，确认提交？',
    });
    if (!res.confirm) return;

    setSubmitting(true);
    try {
      const { uploadImages } = await import('../../../utils/cloud');
      const uploadResults = await Promise.all(
        records.map((r) => uploadImages([r.image], 'measurement-photos')),
      );

      const payload = uploadResults.map((result, idx) => ({
        imageUrl: result[0]?.fileID || '',
        description: records[idx].description,
      }));

      await api.put(`/measurements/${id}`, { status: 'MEASURED', photos: JSON.stringify(payload) });
      Taro.showToast({ title: '量尺记录已提交', icon: 'success' });
      setTimeout(() => goBack(), 1500);
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
    const res = await Taro.showModal({
      title: '提交进度',
      content: `确认提交「${CONSTRUCTION_STAGES[stageIndex]?.label}」的施工进度？`,
    });
    if (!res.confirm) return;

    setLoading(true);
    try {
      const { uploadImages } = await import('../../../utils/cloud');
      const results = await uploadImages(images, 'construction-progress');
      await api.post(`/orders/${id}/progress`, {
        images: results.map((r) => r.fileID),
        stage: selectedStage,
        content: CONSTRUCTION_STAGES[stageIndex]?.label || '',
      });
      Taro.showToast({ title: '进度已更新', icon: 'success' });
      setTimeout(() => { setImages([]); setStageIndex(0); goBack(); }, 1500);
    } catch {
      Taro.showToast({ title: '提交失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyInspection = async () => {
    const res = await Taro.showModal({
      title: '申请验收',
      content: '提交验收申请后需等待管理员审核，确认申请？',
    });
    if (!res.confirm) return;

    setLoading(true);
    try {
      await api.put(`/orders/${id}`, { status: 'REVIEWING' });
      Taro.showToast({ title: '验收申请已提交', icon: 'success' });
      setTimeout(() => goBack(), 1500);
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
              {data.client?.phone || data.phone || data.clientPhone}
            </Text>
          </View>
          {data.scheduledInstallDate && (
            <View className='iod-info-row'>
              <Text className='iod-info-label'>时间</Text>
              <Text className='iod-info-value'>{data.scheduledInstallDate}</Text>
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
        {isMeasurement && !isMeasured && (
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
                      <Icon name='delete' size={28} color='#ef4444' />
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

        {/* ========== 量尺已完成：只读展示已提交的照片 ========== */}
        {isMeasurement && isMeasured && (
          <View className='iod-card iod-measure-card'>
            <View className='iod-card-header-row'>
              <Text className='iod-card-title'>量尺记录</Text>
              <View className='iod-measured-badge'><Text className='iod-measured-badge-text'>已完成</Text></View>
            </View>

            {submittedPhotos.length > 0 ? (
              <View className='iod-records'>
                {submittedPhotos.map((photo: any, idx: number) => (
                  <View key={idx} className='iod-record-item'>
                    <View
                      className='iod-record-img-wrap'
                      onClick={() => Taro.previewImage({
                        current: photo.imageUrl,
                        urls: submittedPhotos.map((p: any) => p.imageUrl).filter(Boolean),
                      })}
                    >
                      <Image className='iod-record-img' src={photo.imageUrl} mode='aspectFill' />
                      <View className='iod-record-index'>
                        <Text className='iod-index-text'>{idx + 1}</Text>
                      </View>
                    </View>
                    <View className='iod-record-desc-wrap iod-record-desc-readonly'>
                      <Icon name='file-text' size={20} color='#8b5cf6' />
                      <Text className='iod-desc-text'>{photo.description || '无说明'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className='iod-ref-empty'>
                <Icon name='image' size={48} color='#d1d5db' />
                <Text className='iod-ref-empty-text'>暂无照片记录</Text>
              </View>
            )}
          </View>
        )}

        {/* ========== 量尺参考（施工订单模式）========== */}
        {!isMeasurement && (
          <View className='iod-card iod-ref-card'>
            <View className='iod-ref-header' onClick={() => setMeasureExpanded(!measureExpanded)}>
              <View className='iod-ref-header-left'>
                <View className='iod-ref-icon-wrap'>
                  <Icon name='ruler' size={26} color='#8b5cf6' />
                </View>
                <Text className='iod-ref-title'>量尺参考</Text>
                {measureRef.length > 0 && (
                  <View className='iod-ref-count'>
                    <Text>{measureRef.length}张</Text>
                  </View>
                )}
              </View>
              <View className={`iod-ref-arrow ${measureExpanded ? 'iod-ref-arrow-up' : ''}`}>
                <Icon name='arrow-down' size={28} color='#9ca3af' />
              </View>
            </View>

            {measureExpanded && measureRef.length > 0 && (
              <View className='iod-ref-body'>
                {measureRef.map((photo: any, idx: number) => (
                  <View key={idx} className='iod-ref-item'>
                    <View
                      className='iod-ref-img-wrap'
                      onClick={() =>
                        Taro.previewImage({
                          current: photo.imageUrl,
                          urls: measureRef.map((p: any) => p.imageUrl).filter(Boolean),
                        })
                      }
                    >
                      <Image className='iod-ref-img' src={photo.imageUrl} mode='aspectFill' />
                      <View className='iod-ref-img-index'>
                        <Text className='iod-ref-index-text'>{idx + 1}</Text>
                      </View>
                    </View>
                    <View className='iod-ref-desc'>
                      <Icon name='file-text' size={20} color='#8b5cf6' />
                      <Text className='iod-ref-desc-text'>{photo.description || '无说明'}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {measureExpanded && measureRef.length === 0 && !measureLoading && (
              <View className='iod-ref-empty'>
                <Icon name='image' size={48} color='#d1d5db' />
                <Text className='iod-ref-empty-text'>暂无量尺记录</Text>
              </View>
            )}

            {measureLoading && (
              <View className='iod-ref-loading'>
                <Text className='iod-ref-loading-text'>加载中...</Text>
              </View>
            )}
          </View>
        )}

        {/* ========== 历史进度（施工订单模式）========== */}
        {!isMeasurement && constructionLogs.length > 0 && (
          <View className='iod-card iod-ref-card'>
            <View className='iod-ref-header' onClick={() => setLogExpanded(!logExpanded)}>
              <View className='iod-ref-header-left'>
                <View className='iod-ref-icon-wrap' style='background: linear-gradient(135deg, #dbeafe, #bfdbfe)'>
                  <Icon name='image' size={26} color='#2563eb' />
                </View>
                <Text className='iod-ref-title'>施工日志</Text>
                <View className='iod-ref-count' style='background: linear-gradient(135deg, #3b82f6, #60a5fa)'>
                  <Text>{constructionLogs.length}条</Text>
                </View>
              </View>
              <View className={`iod-ref-arrow ${logExpanded ? 'iod-ref-arrow-up' : ''}`}>
                <Icon name='arrow-down' size={28} color='#9ca3af' />
              </View>
            </View>

            {logExpanded && (
              <View className='iod-ref-body'>
                {constructionLogs.map((log: any) => (
                  <View key={log.id} className='iod-ref-item'>
                    <View className='iod-ref-desc' style='border-bottom: 1px solid #f3f4f6; margin-bottom: 0'>
                      <Text className='tag tag-brand' style='font-size:22rpx;padding:4rpx 14rpx;border-radius:8rpx;background:#eff6ff;color:#2563eb'>{getStageLabel(log.stage) || '进度'}</Text>
                      <Text style='font-size:22rpx;color:#9ca3af;margin-left:auto'>{new Date(log.createdAt).toLocaleDateString('zh-CN')}</Text>
                    </View>
                    {log.content && <View style='padding:12rpx 18rpx 0'><Text style='font-size:25rpx;color:#4b5563;line-height:1.5'>{log.content}</Text></View>}
                    {log.images?.length > 0 && (
                      <View style='display:flex;flex-wrap:wrap;gap:12rpx;padding:16rpx 18rpx'>
                        {log.images.map((img: string, idx: number) => (
                          <View key={idx} style='width:180rpx;height:180rpx;border-radius:12rpx;overflow:hidden' onClick={() => Taro.previewImage({ current: img, urls: log.images })}>
                            <Image style='width:100%;height:100%' src={img} mode='aspectFill' />
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ========== 施工订单模式：阶段选择 + 图片上传 ========== */}
        {!isMeasurement && (
          <View className='iod-card'>
            <Text className='iod-card-title'>进度更新与图片</Text>

            {/* 阶段选择 */}
            <Picker
              mode='selector'
              range={CONSTRUCTION_STAGES.map(s => s.label)}
              value={stageIndex}
              onChange={(e) => setStageIndex(e.detail.value)}
            >
              <View className='iod-stage-picker'>
                <Text className='iod-stage-value iod-stage-selected'>
                  {CONSTRUCTION_STAGES[stageIndex]?.label}
                </Text>
                <Text className='iod-stage-arrow'>▼</Text>
              </View>
            </Picker>

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

      {/* 底部操作栏（已完成不显示） */}
      {!(isMeasurement && isMeasured) && (
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
              {data?.status === 'INSTALLING' && (
                <View
                  className={`iod-action-btn iod-btn-secondary ${loading ? 'iod-disabled' : ''}`}
                  onClick={!loading ? handleApplyInspection : undefined}
                >
                  <Text className='iod-btn-text'>申请验收</Text>
                </View>
              )}
            </>
          )}
        </View>
      )}
    </View>
  );
}
