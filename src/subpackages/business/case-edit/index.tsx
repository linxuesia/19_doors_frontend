import { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, ScrollView, Image, Picker } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import Icon from '../../../components/Icon';
import './index.scss';

const styleOptions = [
  { value: 'MODERN', label: '现代简约' },
  { value: 'MINIMALIST', label: '极简原木' },
  { value: 'FRENCH', label: '法式奶油' },
  { value: 'NORDIC', label: '北欧风' },
  { value: 'NEW_CHINESE', label: '新中式' },
  { value: 'LIGHT_LUXURY', label: '轻奢风' },
  { value: 'JAPANESE', label: '日式' },
  { value: 'AMERICAN', label: '美式' },
];

const spaceTypeOptions = [
  { value: 'RESIDENTIAL', label: '家居空间' },
  { value: 'COMMERCIAL', label: '商业空间' },
  { value: 'ENGINEERING', label: '品质工程' },
];

export default function CaseEdit() {
  const router = useRouter();
  const caseId = router.params.id;
  const isCreate = router.params.mode === 'create';
  const { user, requireBusinessLogin } = useAuth();

  const [form, setForm] = useState({
    title: '',
    coverImage: '',
    style: '',
    spaceType: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [coverUploading, setCoverUploading] = useState(false);

  useEffect(() => {
    if (!requireBusinessLogin()) return;
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
      setForm({
        title: res.title || '',
        coverImage: res.coverImage || '',
        style: res.style || '',
        spaceType: res.spaceType || '',
        description: res.description || '',
      });
    } catch {
      Taro.showToast({ title: '加载案例失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleChooseCover = async () => {
    try {
      const res = await Taro.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
        sizeType: ['compressed'],
      });
      if (res.tempFiles && res.tempFiles[0]) {
        setCoverUploading(true);
        const { uploadImages } = await import('../../../utils/cloud');
        const results = await uploadImages([res.tempFiles[0].tempFilePath], 'case-covers');
        setForm((prev) => ({ ...prev, coverImage: results[0]?.fileID || '' }));
        setCoverUploading(false);
      }
    } catch {
      // 用户取消选择
    } finally {
      setCoverUploading(false);
    }
  };

  const handleRemoveCover = () => {
    setForm((prev) => ({ ...prev, coverImage: '' }));
  };

  const handleSave = async (publish = false) => {
    if (!form.title.trim()) {
      Taro.showToast({ title: '请输入案例标题', icon: 'none' });
      return;
    }
    if (!form.coverImage) {
      Taro.showToast({ title: '请上传封面图片', icon: 'none' });
      return;
    }

    setSaving(true);
    try {
      const data = { ...form };
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
      {/* 封面图 */}
      <View className='ce-section'>
        <Text className='ce-section-title'>封面图片</Text>
        <Text className='ce-section-hint'>第一张图将作为案例封面展示</Text>

        {form.coverImage ? (
          <View className='ce-cover-preview'>
            <Image className='ce-cover-image' src={form.coverImage} mode='aspectFill' />
            <View className='ce-cover-remove' onClick={handleRemoveCover}>
              <Icon name='close' size={24} color='#ffffff' />
            </View>
          </View>
        ) : (
          <View className={`ce-cover-upload ${coverUploading ? 'ce-uploading' : ''}`} onClick={!coverUploading ? handleChooseCover : undefined}>
            {coverUploading ? (
              <>
                <Icon name='loader' size={48} color='#122b4d' />
                <Text className='ce-upload-text'>上传中...</Text>
              </>
            ) : (
              <>
                <Icon name='image' size={48} color='#9ca3af' />
                <Text className='ce-upload-text'>点击上传封面</Text>
              </>
            )}
          </View>
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
          <Text className='ce-form-label'>装修风格</Text>
          <View className='ce-picker-row'>
            <Picker mode='selector' range={styleOptions.map((o) => o.label)} value={styleOptions.findIndex((o) => o.value === form.style)} onChange={(e) => setForm((prev) => ({ ...prev, style: styleOptions[e.detail.value].value }))}>
              <View className='ce-picker-value'>
                <Text>{styleOptions.find((o) => o.value === form.style)?.label || '请选择风格'}</Text>
                <Icon name='arrow-right-s' size={28} color='#9ca3af' />
              </View>
            </Picker>
          </View>
        </View>

        <View className='ce-form-item'>
          <Text className='ce-form-label'>空间类型</Text>
          <View className='ce-picker-row'>
            <Picker mode='selector' range={spaceTypeOptions.map((o) => o.label)} value={spaceTypeOptions.findIndex((o) => o.value === form.spaceType)} onChange={(e) => setForm((prev) => ({ ...prev, spaceType: spaceTypeOptions[e.detail.value].value }))}>
              <View className='ce-picker-value'>
                <Text>{spaceTypeOptions.find((o) => o.value === form.spaceType)?.label || '请选择空间类型'}</Text>
                <Icon name='arrow-right-s' size={28} color='#9ca3af' />
              </View>
            </Picker>
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
