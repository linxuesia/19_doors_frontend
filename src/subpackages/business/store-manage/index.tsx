import { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import { uploadFile } from '../../../utils/cloud';
import Icon from '../../../components/Icon';
import './index.scss';

export default function StoreManage() {
  const { user, requireBusinessLogin, refreshUser } = useAuth();
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
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');

  // 资质列表
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [qualiLoading, setQualiLoading] = useState(false);
  // 新增资质表单
  const [newQualiTitle, setNewQualiTitle] = useState('');
  const [newQualiPreview, setNewQualiPreview] = useState('');
  const [newQualiImage, setNewQualiImage] = useState('');
  const [qualiUploading, setQualiUploading] = useState(false);
  const [addingQuali, setAddingQuali] = useState(false);

  const isOwner = (user?.role || '').includes('STORE_OWNER');

  useEffect(() => {
    if (!requireBusinessLogin()) return;
    if (!user?.storeId) return;

    setLoading(true);
    api.get(`/stores/${user.storeId}`)
      .then((res: any) => {
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

    // 加载资质列表
    setQualiLoading(true);
    api.get(`/stores/${user.storeId}/qualifications`)
      .then((res: any) => setQualifications(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setQualiLoading(false));
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

  const handleChooseCover = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const filePath = res.tempFilePaths[0];
        setCoverPreview(filePath);
        setCoverUploading(true);
        try {
          const ext = filePath.split('.').pop() || 'jpg';
          const cloudPath = `store-cover/${user!.storeId}_${Date.now()}.${ext}`;
          const { cloudUrl } = await uploadFile(filePath, cloudPath);
          setForm(prev => ({ ...prev, coverImage: cloudUrl }));
          Taro.showToast({ title: '封面上传成功', icon: 'success' });
        } catch {
          Taro.showToast({ title: '封面上传失败', icon: 'none' });
        } finally {
          setCoverUploading(false);
        }
      },
    });
  };

  // 新增资质 - 选择图片
  const handleChooseNewQualiImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const filePath = res.tempFilePaths[0];
        setNewQualiPreview(filePath);
        setQualiUploading(true);
        try {
          const ext = filePath.split('.').pop() || 'jpg';
          const cloudPath = `store-quali/${user!.storeId}_${Date.now()}.${ext}`;
          const { cloudUrl } = await uploadFile(filePath, cloudPath);
          setNewQualiImage(cloudUrl);
        } catch {
          Taro.showToast({ title: '图片上传失败', icon: 'none' });
        } finally {
          setQualiUploading(false);
        }
      },
    });
  };

  // 新增资质 - 提交
  const handleAddQualification = async () => {
    if (!newQualiTitle.trim()) {
      Taro.showToast({ title: '请输入资质标题', icon: 'none' });
      return;
    }
    if (!newQualiImage) {
      Taro.showToast({ title: '请上传资质图片', icon: 'none' });
      return;
    }
    setAddingQuali(true);
    try {
      const res = await api.post(`/stores/${user!.storeId}/qualifications`, {
        title: newQualiTitle.trim(),
        image: newQualiImage,
      });
      setQualifications(prev => [...prev, res]);
      setNewQualiTitle('');
      setNewQualiImage('');
      setNewQualiPreview('');
      Taro.showToast({ title: '添加成功', icon: 'success' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '添加失败', icon: 'none' });
    } finally {
      setAddingQuali(false);
    }
  };

  // 删除资质
  const handleDeleteQualification = async (id: string) => {
    const res = await Taro.showModal({ title: '确认删除', content: '确定删除该资质吗？' });
    if (!res.confirm) return;
    try {
      await api.del(`/stores/qualifications/${id}`);
      setQualifications(prev => prev.filter(q => q.id !== id));
      Taro.showToast({ title: '已删除', icon: 'success' });
    } catch (e: any) {
      Taro.showToast({ title: e.message || '删除失败', icon: 'none' });
    }
  };

  if (!user || !requireBusinessLogin()) {
    return <View className='sm-loading' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>加载中...</Text></View>;
  }

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
        {/* 门店封面图 */}
        {isOwner && (
        <View className='sm-field'>
          <Text className='sm-label'>门店封面图</Text>
          <View className='sm-cover-upload' onClick={coverUploading ? undefined : handleChooseCover}>
            {(coverPreview || form.coverImage) ? (
              <View className='sm-cover-preview-wrap'>
                <Image
                  className='sm-cover-image'
                  src={coverPreview || form.coverImage}
                  mode='aspectFill'
                />
                {coverUploading ? (
                  <View className='sm-cover-uploading-mask'>
                    <Text className='sm-cover-uploading-text'>上传中...</Text>
                  </View>
                ) : (
                  <View className='sm-cover-change-btn'>
                    <Icon name='camera' size={24} color='#ffffff' />
                    <Text className='sm-cover-change-text'>更换封面</Text>
                  </View>
                )}
              </View>
            ) : (
              <View className='sm-cover-placeholder'>
                {coverUploading ? (
                  <Text className='sm-cover-uploading-text'>上传中...</Text>
                ) : (
                  <>
                    <Icon name='camera' size={48} color='#b0c4d8' />
                    <Text className='sm-cover-placeholder-text'>点击上传封面图</Text>
                    <Text className='sm-cover-placeholder-hint'>建议尺寸 750×400</Text>
                  </>
                )}
              </View>
            )}
          </View>
        </View>
        )}

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

        {/* 门店资质 */}
        {isOwner && (
        <View className='sm-field'>
          <Text className='sm-label'>门店资质</Text>

          {/* 已有资质列表 */}
          {qualiLoading ? (
            <Text className='sm-quali-loading'>加载中...</Text>
          ) : qualifications.length > 0 ? (
            qualifications.map((q) => (
              <View key={q.id} className='sm-quali-card'>
                <View className='sm-quali-card-header'>
                  <Text className='sm-quali-card-title'>{q.title}</Text>
                  <View className='sm-quali-delete' onClick={() => handleDeleteQualification(q.id)}>
                    <Icon name='delete' size={20} color='#ef4444' />
                  </View>
                </View>
                {q.image ? (
                  <Image
                    className='sm-quali-card-img'
                    src={q.image}
                    mode='aspectFill'
                    onClick={() => Taro.previewImage({ current: q.image, urls: [q.image] })}
                  />
                ) : (
                  <View className='sm-quali-card-noimg'>
                    <Text className='sm-quali-card-noimg-text'>暂无图片</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text className='sm-quali-empty'>暂无资质，请添加</Text>
          )}

          {/* 新增资质表单 */}
          <View className='sm-quali-add'>
            <Text className='sm-quali-add-title'>添加资质</Text>
            <Input
              className='sm-input'
              placeholder='资质标题，如"营业执照"、"检测报告"'
              value={newQualiTitle}
              onInput={(e) => setNewQualiTitle(e.detail.value)}
              maxlength={20}
            />
            <View className='sm-quali-upload' onClick={qualiUploading ? undefined : handleChooseNewQualiImage}>
              {(newQualiPreview || newQualiImage) ? (
                <View className='sm-quali-preview-wrap'>
                  <Image
                    className='sm-quali-image'
                    src={newQualiPreview || newQualiImage}
                    mode='aspectFill'
                    onClick={(e) => {
                      e.stopPropagation();
                      Taro.previewImage({ current: newQualiPreview || newQualiImage, urls: [newQualiPreview || newQualiImage] });
                    }}
                  />
                  {qualiUploading && (
                    <View className='sm-cover-uploading-mask'>
                      <Text className='sm-cover-uploading-text'>上传中...</Text>
                    </View>
                  )}
                </View>
              ) : (
                <View className='sm-quali-placeholder'>
                  {qualiUploading ? (
                    <Text className='sm-cover-uploading-text'>上传中...</Text>
                  ) : (
                    <>
                      <Icon name='file-text' size={44} color='#b0c4d8' />
                      <Text className='sm-cover-placeholder-text'>点击上传资质图片</Text>
                    </>
                  )}
                </View>
              )}
            </View>
            <View
              className={`btn-primary sm-quali-add-btn ${addingQuali ? 'opacity-50' : ''}`}
              onClick={addingQuali ? undefined : handleAddQualification}
            >
              <Text>{addingQuali ? '添加中...' : '确认添加'}</Text>
            </View>
          </View>
        </View>
        )}

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
