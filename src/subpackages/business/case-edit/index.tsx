import { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, ScrollView, Image, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import Icon from '../../../components/Icon';
import './index.scss';

const spaceTypeOptions = [
  { value: 'RESIDENTIAL', label: '家居空间' },
  { value: 'COMMERCIAL', label: '商业空间' },
  { value: 'ENGINEERING', label: '品质工程' },
];

const colorOptions = [
  { value: 'WHITE', label: '白色系' },
  { value: 'GRAY', label: '灰色系' },
  { value: 'BEIGE', label: '米色系' },
  { value: 'BROWN', label: '棕色系' },
  { value: 'BLACK', label: '黑色系' },
  { value: 'WOOD', label: '原木色' },
  { value: 'GREEN', label: '绿色系' },
  { value: 'BLUE', label: '蓝色系' },
];

export default function CaseEdit() {
  const router = useRouter();
  const caseId = router.params.id;
  const isCreate = router.params.mode === 'create';
  const { user, requireBusinessLogin } = useAuth();

  const [form, setForm] = useState({
    title: '',
    coverImage: '',
    images: [] as string[],
    spaceTypes: spaceTypeOptions.map(o => o.value),  // 默认全选
    colors: colorOptions.map(o => o.value),            // 默认全选
    description: '',
    latitude: undefined as number | undefined,
    longitude: undefined as number | undefined,
    communityName: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);
  const [imagesExpanded, setImagesExpanded] = useState(false);

  useEffect(() => {
    if (!requireBusinessLogin(undefined, 'ADMIN,STORE_OWNER,STORE_MANAGER')) return;
    if (isCreate) {
      Taro.setNavigationBarTitle({ title: '新增案例' });
      return;
    }
    if (caseId) {
      loadCase(caseId);
    }
  }, [caseId, isCreate]);

  const loadCase = async (id: string) => {
    setLoading(true);
    try {
      const res: any = await api.get(`/cases/${id}`);
      let imagesArr: string[] = [];
      if (res.images) {
        try { imagesArr = JSON.parse(res.images); } catch {}
      }
      setForm({
        title: res.title || '',
        coverImage: res.coverImage || '',
        images: imagesArr,
        spaceTypes: res.spaceType ? res.spaceType.split(',').filter(Boolean) : spaceTypeOptions.map(o => o.value),
        colors: res.color ? res.color.split(',').filter(Boolean) : colorOptions.map(o => o.value),
        description: res.description || '',
        latitude: res.latitude ?? undefined,
        longitude: res.longitude ?? undefined,
        communityName: res.communityName || '',
      });
    } catch {
      Taro.showToast({ title: '加载案例失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleChooseImages = async () => {
    try {
      const res = await Taro.chooseMedia({
        count: 9 - form.images.length,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        sizeType: ['compressed'],
      });
      if (res.tempFiles?.length) {
        setCoverUploading(true);
        const { uploadImages } = await import('../../../utils/cloud');
        const tempPaths = res.tempFiles.map(f => f.tempFilePath);
        const results = await uploadImages(tempPaths, 'case-covers');
        const urls = results.map(r => r.fileID).filter(Boolean);
        setForm((prev) => {
          const newImages = [...prev.images, ...urls];
          return {
            ...prev,
            images: newImages,
            coverImage: prev.coverImage || newImages[0] || '',
          };
        });
      }
    } catch {
      // 用户取消选择
    } finally {
      setCoverUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setForm((prev) => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        coverImage: prev.coverImage === prev.images[index] ? (newImages[0] || '') : prev.coverImage,
      };
    });
  };

  const handleChooseLocation = async () => {
    try {
      const res = await Taro.chooseLocation({ latitude: form.latitude, longitude: form.longitude } as any);
      if (res.latitude && res.longitude) {
        setForm((prev) => ({ ...prev, latitude: res.latitude, longitude: res.longitude, communityName: res.name || res.address || prev.communityName }));
      }
    } catch {
      // 用户取消选择
    }
  };

  const handleSave = async (publish = false) => {
    if (!form.title.trim()) {
      Taro.showToast({ title: '请输入案例标题', icon: 'none' });
      return;
    }
    if (form.images.length === 0) {
      Taro.showToast({ title: '请上传案例图片', icon: 'none' });
      return;
    }

    setSaving(true);
    try {
      const data: any = { ...form };
      // 空间类型和色彩数组拼接成逗号分隔字符串
      data.spaceType = form.spaceTypes.join(',');
      data.color = form.colors.join(',');
      data.images = form.images.length > 0 ? JSON.stringify(form.images) : undefined;
      data.coverImage = form.coverImage || undefined;
      data.latitude = form.latitude ?? null;
      data.longitude = form.longitude ?? null;
      data.communityName = form.communityName || undefined;
      delete data.spaceTypes;
      delete data.colors;
      if (publish) data.published = true;

      if (isCreate) {
        await api.post('/cases', data);
        Taro.showToast({ title: publish ? '发布成功' : '保存成功', icon: 'success' });
        setTimeout(() => Taro.navigateBack(), 1500);
      } else {
        await api.put(`/cases/${caseId}`, data);
        Taro.showToast({ title: publish ? '发布成功' : '保存成功', icon: 'success' });
        setTimeout(() => Taro.navigateBack(), 1500);
      }
    } catch (e: any) {
      Taro.showToast({ title: e.message || '保存失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className='ce-page'>
        <View className='ce-loading'><Text>加载中...</Text></View>
      </View>
    );
  }

  return (
    <ScrollView className='ce-page' scrollY>
      {/* 案例图片 */}
      <View className='ce-section'>
        <Text className='ce-section-title'>案例图片</Text>
        <Text className='ce-section-hint'>第一张默认作为封面，最多9张</Text>

        <View className='ce-images-grid'>
          {form.images.map((img, idx) => (
            <View key={idx} className='ce-img-item'>
              <View className='ce-img-wrap' onClick={() => Taro.previewImage({ current: img, urls: form.images })}>
                <Image className='ce-img' src={img} mode='aspectFill' />
                {idx === 0 && <View className='ce-img-cover-tag'><Text className='ce-img-cover-tag-text'>封面</Text></View>}
              </View>
              <View className='ce-img-remove' onClick={() => handleRemoveImage(idx)}>
                <Text className='ce-img-remove-icon'>x</Text>
              </View>
            </View>
          ))}
          {form.images.length < 9 && (
            <View className={`ce-img-add ${coverUploading ? 'ce-uploading' : ''}`} onClick={!coverUploading ? handleChooseImages : undefined}>
              {coverUploading ? (
                <>
                  <Icon name='loader' size={48} color='#122b4d' />
                  <Text className='ce-upload-text'>上传中...</Text>
                </>
              ) : (
                <>
                  <Text className='ce-img-add-icon'>+</Text>
                  <Text className='ce-upload-text'>添加图片</Text>
                </>
              )}
            </View>
          )}
        </View>
      </View>

      {/* 案例定位 */}
      <View className='ce-section'>
        <Text className='ce-section-title'>案例定位</Text>
        <Text className='ce-section-hint'>标注案例所在位置，用于首页地图展示</Text>
        <View className='ce-location-row' onClick={handleChooseLocation}>
          <Icon name='map-pin' size={36} color='#122b4d' />
          <View className='ce-location-info'>
            {form.latitude != null && form.longitude != null ? (
              <>
                <Text className='ce-location-addr'>{form.communityName || `${form.latitude.toFixed(6)}, ${form.longitude.toFixed(6)}`}</Text>
                <Text className='ce-location-coord'>{form.latitude.toFixed(6)}, {form.longitude.toFixed(6)}</Text>
              </>
            ) : (
              <Text className='ce-location-placeholder'>点击选择案例位置</Text>
            )}
          </View>
          <Icon name='arrow-right' size={28} color='#9ca3af' />
        </View>
        {form.latitude != null && (
          <Text className='ce-location-clear' onClick={() => setForm((prev) => ({ ...prev, latitude: undefined, longitude: undefined }))}>清除定位</Text>
        )}
      </View>

      {/* 基本信息 */}
      <View className='ce-section'>
        <Text className='ce-section-title'>基本信息</Text>

        <View className='ce-form-item'>
          <Text className='ce-form-label'>案例标题 *</Text>
          <Input
            className='ce-form-input'
            placeholder='请输入案例标题'
            value={form.title}
            onInput={(e) => setForm((prev) => ({ ...prev, title: e.detail.value }))}
            maxlength={50}
          />
        </View>

        <View className='ce-form-item'>
          <Text className='ce-form-label'>适用空间</Text>
          <View className='ce-checkbox-group'>
            {spaceTypeOptions.map((opt) => (
              <View
                key={opt.value}
                className={`ce-checkbox ${form.spaceTypes.includes(opt.value) ? 'ce-checkbox-active' : ''}`}
                onClick={() => setForm((prev) => ({
                  ...prev,
                  spaceTypes: prev.spaceTypes.includes(opt.value)
                    ? prev.spaceTypes.filter(v => v !== opt.value)
                    : [...prev.spaceTypes, opt.value],
                }))}
              >
                <Text className={`ce-checkbox-icon ${form.spaceTypes.includes(opt.value) ? 'checked' : ''}`}>
                  {form.spaceTypes.includes(opt.value) ? '✓' : ''}
                </Text>
                <Text className='ce-checkbox-label'>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='ce-form-item'>
          <Text className='ce-form-label'>色彩风格</Text>
          <View className='ce-checkbox-group'>
            {colorOptions.map((opt) => (
              <View
                key={opt.value}
                className={`ce-checkbox ${form.colors.includes(opt.value) ? 'ce-checkbox-active' : ''}`}
                onClick={() => setForm((prev) => ({
                  ...prev,
                  colors: prev.colors.includes(opt.value)
                    ? prev.colors.filter(v => v !== opt.value)
                    : [...prev.colors, opt.value],
                }))}
              >
                <Text className={`ce-checkbox-icon ${form.colors.includes(opt.value) ? 'checked' : ''}`}>
                  {form.colors.includes(opt.value) ? '✓' : ''}
                </Text>
                <Text className='ce-checkbox-label'>{opt.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='ce-form-item'>
          <Text className='ce-form-label'>案例描述</Text>
          <Textarea
            className='ce-form-textarea'
            placeholder='请输入案例描述（选填）'
            value={form.description}
            onInput={(e) => setForm((prev) => ({ ...prev, description: e.detail.value }))}
            maxlength={500}
            autoHeight
          />
        </View>
      </View>

      {/* 操作按钮 */}
      <View className='ce-actions'>
        <View className='ce-btn ce-btn-draft' onClick={() => handleSave(false)}>
          <Text className='ce-btn-text'>保存草稿</Text>
        </View>
        <View className='ce-btn ce-btn-publish' onClick={() => handleSave(true)}>
          <Text className='ce-btn-text'>发布案例</Text>
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
