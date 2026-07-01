import { useState, useEffect } from 'react';
import { View, Text, Input, Textarea, ScrollView, Image, Picker, Switch } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import { uploadFile } from '../../../utils/cloud';
import Icon from '../../../components/Icon';
import './index.scss';

const CATEGORIES = ['平开窗', '推拉门', '阳光房'];

// 适用空间选项（多选）
const spaceOptions = [
  { value: 'LIVING', label: '客厅' },
  { value: 'BEDROOM', label: '卧室' },
  { value: 'KITCHEN', label: '厨房' },
  { value: 'BALCONY', label: '阳台' },
  { value: 'STUDY', label: '书房' },
];

// 色彩选项（多选）
const colorOptions = [
  { value: 'WHITE', label: '白色系' },
  { value: 'GRAY', label: '灰色系' },
  { value: 'BEIGE', label: '米色系' },
  { value: 'BROWN', label: '棕色系' },
  { value: 'BLACK', label: '黑色系' },
  { value: 'WOOD', label: '原木色' },
  { value: 'GOLD', label: '香槟金' },
  { value: 'SLIVER', label: '银灰色' },
];

interface ProductForm {
  id?: string;
  name: string;
  category: string;
  series: string;
  spaces: string[];
  colors: string[];
  features: string;
  images: string[];       // banner 轮播图
  coverImage: string;
  detailImage: string;
  inspectionReportUrl: string;
  isActive: boolean;
}

const emptyForm: ProductForm = {
  name: '', category: '平开窗', series: '',
  spaces: spaceOptions.map(o => o.value),   // 默认全选
  colors: colorOptions.map(o => o.value),    // 默认全选
  features: '', images: [], coverImage: '', detailImage: '', inspectionReportUrl: '',
  isActive: true,
};

export default function ProductManage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<ProductForm>({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(''); // 正在上传的字段名

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/products', { pageSize: '50' });
      setProducts(res?.list || []);
    } catch {
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p: any) => {
    const features = parseJsonArray(p.features).join('，');
    const images = parseJsonArray(p.images);
    setForm({
      id: p.id, name: p.name || '', category: p.category || '平开窗',
      series: p.series || '',
      spaces: p.space ? p.space.split(',').filter(Boolean) : spaceOptions.map(o => o.value),
      colors: p.color ? p.color.split(',').filter(Boolean) : colorOptions.map(o => o.value),
      features, images,
      coverImage: p.coverImage || '', detailImage: p.detailImage || '',
      inspectionReportUrl: p.inspectionReportUrl || '', isActive: p.isActive !== false,
    });
    setEditing(true);
  };

  const handleNew = () => {
    setForm({ ...emptyForm, id: undefined });
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { Taro.showToast({ title: '请输入产品名称', icon: 'none' }); return; }
    setSaving(true);
    try {
      const data: any = {
        name: form.name.trim(),
        category: form.category,
        series: form.series.trim(),
        space: form.spaces.join(','),
        color: form.colors.join(','),
        features: JSON.stringify(form.features.split(/[,，]/).map(s => s.trim()).filter(Boolean)),
        images: JSON.stringify(form.images),
        coverImage: form.coverImage,
        detailImage: form.detailImage,
        inspectionReportUrl: form.inspectionReportUrl,
        isActive: form.isActive,
      };

      if (form.id) {
        await api.put(`/products/${form.id}`, data);
        Taro.showToast({ title: '已更新', icon: 'success' });
      } else {
        await api.post('/products', data);
        Taro.showToast({ title: '已创建', icon: 'success' });
      }
      setEditing(false);
      loadProducts();
    } catch (e: any) {
      Taro.showToast({ title: e.message || '保存失败', icon: 'none' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (p: any) => {
    try {
      await api.post(`/products/${p.id}/toggle`);
      Taro.showToast({ title: p.isActive ? '已下架' : '已上架', icon: 'success' });
      loadProducts();
    } catch {
      Taro.showToast({ title: '操作失败', icon: 'none' });
    }
  };

  const update = (key: string, value: any) => setForm({ ...form, [key]: value });

  // 上传图片
  const handleUploadImage = async (field: string) => {
    try {
      const res = await Taro.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album'] });
      setUploading(field);
      const filePath = res.tempFilePaths[0];
      const ext = filePath.split('.').pop() || 'jpg';
      const cloudPath = `products/${field}_${Date.now()}.${ext}`;
      const { fileID } = await uploadFile(filePath, cloudPath);
      setForm(prev => ({ ...prev, [field]: fileID }));
      Taro.showToast({ title: '上传成功', icon: 'success' });
    } catch (e: any) {
      if (e?.errMsg?.includes('cancel')) return;
      Taro.showToast({ title: '上传失败', icon: 'none' });
    } finally {
      setUploading('');
    }
  };

  // 上传 PDF
  const handleUploadPdf = async () => {
    try {
      const res = await Taro.chooseMessageFile({ count: 1, type: 'file', extension: ['pdf'] });
      setUploading('inspectionReportUrl');
      const filePath = res.tempFiles[0].path;
      const cloudPath = `product-report/${Date.now()}.pdf`;
      const { fileID } = await uploadFile(filePath, cloudPath);
      setForm(prev => ({ ...prev, inspectionReportUrl: fileID }));
      Taro.showToast({ title: 'PDF上传成功', icon: 'success' });
    } catch (e: any) {
      if (e?.errMsg?.includes('cancel')) return;
      Taro.showToast({ title: '上传失败', icon: 'none' });
    } finally {
      setUploading('');
    }
  };

  // 编辑表单
  if (editing) {
    return (
      <ScrollView className='pm-page' scrollY>
        <View className='pm-header'>
          <View className='pm-back-btn' onClick={handleCancel}>
            <Text className='back-arrow'>←</Text>
          </View>
          <Text className='pm-title'>{form.id ? '编辑产品' : '新增产品'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View className='pm-form'>
          <View className='pm-field'>
            <Text className='pm-label'>产品名称 *</Text>
            <Input className='pm-input' placeholder='如：S100内开窗纱一体' value={form.name} onInput={e => update('name', e.detail.value)} />
          </View>

          <View className='pm-field'>
            <Text className='pm-label'>分类</Text>
            <Picker mode='selector' range={CATEGORIES} value={CATEGORIES.indexOf(form.category)} onChange={e => update('category', CATEGORIES[Number(e.detail.value)])}>
              <View className='pm-picker'><Text>{form.category}</Text><Icon name='arrow-right' size={24} color='#9ca3af' /></View>
            </Picker>
          </View>

          <View className='pm-field'>
            <Text className='pm-label'>系列</Text>
            <Input className='pm-input' placeholder='如：S100' value={form.series} onInput={e => update('series', e.detail.value)} />
          </View>

          <View className='pm-field'>
            <Text className='pm-label'>适用空间</Text>
            <View className='pm-checkbox-group'>
              {spaceOptions.map((opt) => (
                <View
                  key={opt.value}
                  className={`pm-checkbox ${form.spaces.includes(opt.value) ? 'pm-checkbox-active' : ''}`}
                  onClick={() => setForm(prev => ({
                    ...prev,
                    spaces: prev.spaces.includes(opt.value)
                      ? prev.spaces.filter(v => v !== opt.value)
                      : [...prev.spaces, opt.value],
                  }))}
                >
                  <Text className={`pm-checkbox-icon ${form.spaces.includes(opt.value) ? 'checked' : ''}`}>
                    {form.spaces.includes(opt.value) ? '✓' : ''}
                  </Text>
                  <Text className='pm-checkbox-label'>{opt.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className='pm-field'>
            <Text className='pm-label'>色彩</Text>
            <View className='pm-checkbox-group'>
              {colorOptions.map((opt) => (
                <View
                  key={opt.value}
                  className={`pm-checkbox ${form.colors.includes(opt.value) ? 'pm-checkbox-active' : ''}`}
                  onClick={() => setForm(prev => ({
                    ...prev,
                    colors: prev.colors.includes(opt.value)
                      ? prev.colors.filter(v => v !== opt.value)
                      : [...prev.colors, opt.value],
                  }))}
                >
                  <Text className={`pm-checkbox-icon ${form.colors.includes(opt.value) ? 'checked' : ''}`}>
                    {form.colors.includes(opt.value) ? '✓' : ''}
                  </Text>
                  <Text className='pm-checkbox-label'>{opt.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className='pm-field'>
            <Text className='pm-label'>功能特性（逗号分隔）</Text>
            <Textarea className='pm-textarea' placeholder='如：抗风压9级，水密性6级，气密性8级' value={form.features} onInput={e => update('features', e.detail.value)} autoHeight maxlength={500} />
          </View>

          {/* 封面图 */}
          <View className='pm-field'>
            <Text className='pm-label'>封面图</Text>
            <View className='pm-upload-wrap' onClick={() => handleUploadImage('coverImage')}>
              {form.coverImage ? (
                <Image className='pm-upload-img' src={form.coverImage} mode='aspectFill' />
              ) : (
                <View className='pm-upload-placeholder'>
                  <Icon name='image' size={48} color='#b0c4d8' />
                  <Text className='pm-upload-hint'>点击上传</Text>
                </View>
              )}
              {uploading === 'coverImage' && <View className='pm-uploading-mask'><Text>上传中...</Text></View>}
            </View>
          </View>

          {/* Banner轮播图（多图） */}
          <View className='pm-field'>
            <Text className='pm-label'>Banner轮播图</Text>
            <View className='pm-images-grid'>
              {form.images.map((img, i) => (
                <View key={i} className='pm-image-item'>
                  <Image className='pm-image-thumb' src={img} mode='aspectFill' />
                  <View className='pm-image-remove' onClick={() => {
                    setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
                  }}>
                    <Icon name='close' size={20} color='#ffffff' />
                  </View>
                </View>
              ))}
              {form.images.length < 6 && (
                <View className='pm-image-add' onClick={async () => {
                  try {
                    const res = await Taro.chooseImage({ count: 1, sizeType: ['compressed'], sourceType: ['album'] });
                    setUploading('images');
                    const filePath = res.tempFilePaths[0];
                    const ext = filePath.split('.').pop() || 'jpg';
                    const cloudPath = `products/images_${Date.now()}.${ext}`;
                    const { fileID } = await uploadFile(filePath, cloudPath);
                    setForm(prev => ({ ...prev, images: [...prev.images, fileID] }));
                    setUploading('');
                    Taro.showToast({ title: '上传成功', icon: 'success' });
                  } catch (e: any) {
                    setUploading('');
                    if (e?.errMsg?.includes('cancel')) return;
                    Taro.showToast({ title: '上传失败', icon: 'none' });
                  }
                }}>
                  <Icon name='add' size={40} color='#b0c4d8' />
                  <Text className='pm-image-add-text'>添加</Text>
                </View>
              )}
            </View>
            {uploading === 'images' && <Text className='pm-upload-hint'>上传中...</Text>}
          </View>

          {/* 详情长图 */}
          <View className='pm-field'>
            <Text className='pm-label'>产品详情长图</Text>
            <View className='pm-upload-wrap' onClick={() => handleUploadImage('detailImage')}>
              {form.detailImage ? (
                <Image className='pm-upload-img' src={form.detailImage} mode='aspectFill' />
              ) : (
                <View className='pm-upload-placeholder'>
                  <Icon name='image' size={48} color='#b0c4d8' />
                  <Text className='pm-upload-hint'>点击上传</Text>
                </View>
              )}
              {uploading === 'detailImage' && <View className='pm-uploading-mask'><Text>上传中...</Text></View>}
            </View>
          </View>

          {/* 检测报告 PDF */}
          <View className='pm-field'>
            <Text className='pm-label'>检测报告 PDF</Text>
            <View className='pm-upload-wrap pm-pdf-upload' onClick={handleUploadPdf}>
              {form.inspectionReportUrl ? (
                <View className='pm-pdf-info'>
                  <Icon name='file-text' size={44} color='#2563eb' />
                  <Text className='pm-pdf-name'>{form.inspectionReportUrl.split('/').pop()}</Text>
                </View>
              ) : (
                <View className='pm-upload-placeholder'>
                  <Icon name='file-text' size={48} color='#b0c4d8' />
                  <Text className='pm-upload-hint'>点击上传 PDF</Text>
                </View>
              )}
              {uploading === 'inspectionReportUrl' && <View className='pm-uploading-mask'><Text>上传中...</Text></View>}
            </View>
          </View>

          {/* 启用状态 */}
          <View className='pm-field pm-field-switch'>
            <Text className='pm-label'>启用状态</Text>
            <Switch checked={form.isActive} color='#122b4d' onChange={e => update('isActive', e.detail.value)} />
          </View>

          <View className={`pm-submit ${saving ? 'opacity-50' : ''}`} onClick={handleSave}>
            <Text>{saving ? '保存中...' : form.id ? '保存修改' : '创建产品'}</Text>
          </View>
        </View>
        <View className='safe-bottom' />
      </ScrollView>
    );
  }

  // 列表视图
  return (
    <ScrollView className='pm-page' scrollY>
      <View className='pm-header'>
        <Text className='pm-title'>产品管理</Text>
        <View className='pm-add-btn' onClick={handleNew}>
          <Icon name='add' size={32} color='#ffffff' />
          <Text className='pm-add-text'>新增</Text>
        </View>
      </View>

      {loading ? (
        <View className='pm-empty'><Text style='color:#9ca3af'>加载中...</Text></View>
      ) : (
        <View className='pm-list'>
          {products.map(p => (
            <View key={p.id} className='pm-card' onClick={() => handleEdit(p)}>
              <View className='pm-card-img-wrap'>
                {p.coverImage ? (
                  <Image className='pm-card-img' src={p.coverImage} mode='aspectFill' />
                ) : (
                  <View className='pm-card-noimg'><Icon name='package' size={40} color='#b0c4d8' /></View>
                )}
              </View>
              <View className='pm-card-body'>
                <View className='pm-card-top'>
                  <Text className='pm-card-name'>{p.name}</Text>
                  <View className={`pm-status-tag ${p.isActive ? 'pm-status-on' : 'pm-status-off'}`}>
                    <Text className='pm-status-text'>{p.isActive ? '上架' : '下架'}</Text>
                  </View>
                </View>
                <View className='pm-card-meta'>
                  <Text className='pm-card-series'>{p.series || '-'}</Text>
                  <Text className='pm-card-cat'>{p.category}</Text>
                </View>
                <View className='pm-card-actions'>
                  <View className='pm-action-edit' onClick={(e) => { e.stopPropagation(); handleEdit(p); }}>
                    <Icon name='edit' size={24} color='#122b4d' />
                    <Text className='pm-action-text'>编辑</Text>
                  </View>
                  <View className='pm-action-toggle' onClick={(e) => { e.stopPropagation(); handleToggleActive(p); }}>
                    <Icon name={p.isActive ? 'close' : 'check'} size={24} color={p.isActive ? '#ef4444' : '#10b981'} />
                    <Text className='pm-action-text' style={{ color: p.isActive ? '#ef4444' : '#10b981' }}>
                      {p.isActive ? '下架' : '上架'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
          {products.length === 0 && (
            <View className='pm-empty'>
              <Icon name='package' size={64} color='#d1d5db' />
              <Text className='pm-empty-text'>暂无产品</Text>
              <View className='pm-empty-btn' onClick={handleNew}>
                <Text className='pm-empty-btn-text'>添加第一个产品</Text>
              </View>
            </View>
          )}
        </View>
      )}
      <View className='safe-bottom' />
    </ScrollView>
  );
}

/** 安全解析 JSON 数组 */
function parseJsonArray(raw: string): string[] {
  try { const arr = JSON.parse(raw); return Array.isArray(arr) ? arr : []; } catch { return []; }
}
