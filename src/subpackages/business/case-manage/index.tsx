import { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../utils/api';
import Icon from '../../../components/Icon';
import './index.scss';

interface CaseItem {
  id: string;
  title: string;
  coverImage?: string;
  style?: string;
  spaceType?: string;
  viewCount: number;
  published: boolean;
}

interface Stats {
  publishedCount: number;
  draftCount: number;
  totalViews: number;
}

export default function CaseManage() {
  const { user } = useAuth();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [stats, setStats] = useState<Stats>({ publishedCount: 0, draftCount: 0, totalViews: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCases = useCallback(async () => {
    if (!user?.storeId) return;

    setLoading(true);
    try {
      const res: any = await api.get(`/cases?storeId=${user.storeId}&all=true&pageSize=500`);
      const list = res?.list || (Array.isArray(res) ? res : []);
      setCases(list);

      const published = list.filter((c: CaseItem) => c.published).length;
      const drafts = list.filter((c: CaseItem) => !c.published).length;
      const views = list.reduce((sum: number, c: CaseItem) => sum + (c.viewCount || 0), 0);

      setStats({
        publishedCount: published,
        draftCount: drafts,
        totalViews: views,
      });
    } catch (error) {
      console.error('获取案例列表失败:', error);
      Taro.showToast({ title: '获取案例列表失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  }, [user?.storeId]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleEdit = (caseId: string) => {
    Taro.navigateTo({ url: `/subpackages/business/case-manage/index?id=${caseId}` });
  };

  const handleTogglePublish = async (caseItem: CaseItem) => {
    const action = caseItem.published ? '下架' : '发布';
    const newStatus = !caseItem.published;

    try {
      await Taro.showModal({
        title: '确认操作',
        content: `确定要${action}该案例吗？`,
        confirmColor: '#122b4d',
      });

      await api.put(`/cases/${caseItem.id}`, { published: newStatus });
      Taro.showToast({ title: `${action}成功`, icon: 'success' });
      fetchCases();
    } catch (error: any) {
      if (error.errMsg?.includes('cancel')) return;
      Taro.showToast({ title: error.message || `${action}失败`, icon: 'none' });
    }
  };

  const handleDelete = async (caseItem: CaseItem) => {
    try {
      await Taro.showModal({
        title: '确认删除',
        content: `确定要删除案例"${caseItem.title}"吗？删除后不可恢复。`,
        confirmColor: '#ef4444',
        confirmText: '删除',
      });

      await api.delete(`/cases/${caseItem.id}`);
      Taro.showToast({ title: '删除成功', icon: 'success' });
      fetchCases();
    } catch (error: any) {
      if (error.errMsg?.includes('cancel')) return;
      Taro.showToast({ title: error.message || '删除失败', icon: 'none' });
    }
  };

  const handleAddCase = () => {
    Taro.navigateTo({ url: '/subpackages/business/case-manage/index?mode=create' });
  };

  const getStyleLabel = (style?: string) => {
    const map: Record<string, string> = {
      MODERN: '现代简约',
      MINIMALIST: '极简原木',
      FRENCH: '法式奶油',
      NORDIC: '北欧风',
      NEW_CHINESE: '新中式',
      LIGHT_LUXURY: '轻奢风',
      JAPANESE: '日式',
      AMERICAN: '美式',
    };
    return map[style || ''] || style || '未分类';
  };

  const getSpaceTypeLabel = (spaceType?: string) => {
    const map: Record<string, string> = {
      RESIDENTIAL: '家居空间',
      COMMERCIAL: '商业空间',
      ENGINEERING: '品质工程',
    };
    return map[spaceType || ''] || spaceType || '未分类';
  };

  return (
    <View className='cm-page'>
      {/* 统计横幅 */}
      <View className='cm-stats-banner'>
        <View className='cm-stat-card'>
          <Text className='cm-stat-number'>{stats.publishedCount}</Text>
          <Text className='cm-stat-label'>已发布</Text>
        </View>
        <View className='cm-stat-card'>
          <Text className='cm-stat-number'>{stats.draftCount}</Text>
          <Text className='cm-stat-label'>草稿</Text>
        </View>
        <View className='cm-stat-card'>
          <Text className='cm-stat-number'>{stats.totalViews >= 10000 ? `${(stats.totalViews / 10000).toFixed(1)}w` : stats.totalViews}</Text>
          <Text className='cm-stat-label'>总浏览量</Text>
        </View>
      </View>

      {/* 案例列表 */}
      {loading ? (
        <View className='cm-loading'>
          <Text className='cm-loading-text'>加载中...</Text>
        </View>
      ) : cases.length === 0 ? (
        <View className='cm-empty'>
          <Icon name='image' size={80} color='#d1d5db' />
          <Text className='cm-empty-text'>暂无案例，点击右下角按钮添加</Text>
        </View>
      ) : (
        <ScrollView className='cm-list' scrollY>
          {cases.map((item) => (
            <View key={item.id} className='cm-card'>
              {/* 封面图 */}
              <View className='cm-card-cover'>
                {item.coverImage ? (
                  <Image className='cm-card-image' src={item.coverImage} mode='aspectFill' />
                ) : (
                  <View className='cm-card-placeholder'>
                    <Icon name='image' size={64} color='#b0c4d8' />
                  </View>
                )}
              </View>

              {/* 内容区 */}
              <View className='cm-card-content'>
                {/* 标题行 */}
                <View className='cm-card-header'>
                  <Text className='cm-card-title'>{item.title || '未命名案例'}</Text>
                  <View className={`cm-status-tag ${item.published ? 'cm-status-published' : 'cm-status-draft'}`}>
                    <Text>{item.published ? '已发布' : '草稿'}</Text>
                  </View>
                </View>

                {/* 标签组 */}
                <View className='cm-tags'>
                  {item.style && (
                    <View className='cm-tag'>
                      <Text>{getStyleLabel(item.style)}</Text>
                    </View>
                  )}
                  {item.spaceType && (
                    <View className='cm-tag'>
                      <Text>{getSpaceTypeLabel(item.spaceType)}</Text>
                    </View>
                  )}
                </View>

                {/* 浏览量 */}
                <View className='cm-meta-row'>
                  <Icon name='eye' size={24} color='#9ca3af' />
                  <Text className='cm-view-count'>{item.viewCount || 0} 次浏览</Text>
                </View>

                {/* 操作按钮 */}
                <View className='cm-actions'>
                  <Text className='cm-action-btn cm-action-edit' onClick={() => handleEdit(item.id)}>编辑</Text>
                  <Text
                    className={`cm-action-btn ${item.published ? 'cm-action-unpublish' : 'cm-action-publish'}`}
                    onClick={() => handleTogglePublish(item)}
                  >
                    {item.published ? '下架' : '发布'}
                  </Text>
                  <Text className='cm-action-btn cm-action-delete' onClick={() => handleDelete(item)}>删除</Text>
                </View>
              </View>
            </View>
          ))}
          <View style={{ height: '40rpx' }} />
        </ScrollView>
      )}

      {/* 悬浮新增按钮 */}
      <View className='cm-fab' onClick={handleAddCase}>
        <Text className='cm-fab-icon'>+</Text>
      </View>
    </View>
  );
}
