import { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import { useAuth } from '../../../contexts/AuthContext';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

interface InspectionItem {
  id: string;
  orderId: string;
  ratings: string;
  avgScore: number;
  remark?: string;
  createdAt: string;
  order: {
    id: string;
    orderNo: string;
    productName?: string;
    installAddress?: string;
    communityName?: string;
  };
}

const questionLabels: Record<string, string> = {
  q1: '安全作业',
  q2: '产品外观',
  q3: '3C认证',
  q4: '安装辅材',
  q5: '防坠绳',
  q6: '窗框水平',
  q7: '发泡剂',
  q8: '密封胶',
  q9: '开关顺畅',
  q10: '现场清理',
};

export default function Inspections() {
  const { user, requireBusinessLogin } = useAuth();
  const [list, setList] = useState<InspectionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!requireBusinessLogin(undefined, 'STORE_OWNER,STORE_MANAGER')) return;
    if (!user?.storeId) return;

    setLoading(true);
    api.get('/inspections', { storeId: user.storeId })
      .then((res: any) => setList(Array.isArray(res) ? res : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.storeId]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon key={i} name='star' size={28} color={i <= rating ? '#f59e0b' : '#d1d5db'} />
      );
    }
    return stars;
  };

  const getAddress = (item: InspectionItem) => {
    return item.order.installAddress || item.order.communityName || '-';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || !requireBusinessLogin(undefined, 'STORE_OWNER,STORE_MANAGER')) {
    return <View className='insp-page' style='display:flex;justify-content:center;align-items:center;min-height:100vh'><Text style='color:#9ca3af;font-size:14px'>加载中...</Text></View>;
  }

  return (
    <ScrollView className='insp-page' scrollY>
      <View className='insp-header'>
        <Text className='insp-title'>客户验收反馈</Text>
        <Text className='insp-subtitle'>共 {list.length} 条验收记录</Text>
      </View>

      {loading ? (
        <View className='insp-loading'>
          <Text className='insp-loading-text'>加载中...</Text>
        </View>
      ) : list.length === 0 ? (
        <View className='insp-empty'>
          <Icon name='clipboard-list' size={96} color='#d1d5db' />
          <Text className='insp-empty-text'>暂无验收记录</Text>
          <Text className='insp-empty-sub'>客户确认完工并提交反馈后将在这里显示</Text>
        </View>
      ) : (
        <View className='insp-list'>
          {list.map((item) => {
            const isExpanded = expandedId === item.id;
            let ratings: Record<string, number> = {};
            try { ratings = JSON.parse(item.ratings || '{}'); } catch {}

            return (
              <View key={item.id} className='insp-card'>
                <View className='insp-card-top' onClick={() => toggleExpand(item.id)}>
                  <View className='insp-card-left'>
                    <Text className='insp-order-no'>{item.order.orderNo}</Text>
                    <Text className='insp-product'>{item.order.productName || '-'}</Text>
                  </View>
                  <View className='insp-card-right'>
                    <View className='insp-score-row'>
                      <Text className='insp-score-num'>{item.avgScore.toFixed(1)}</Text>
                      <Text className='insp-score-div'>/5</Text>
                    </View>
                    <Text className={`insp-expand-icon ${isExpanded ? 'expanded' : ''}`}>
                      <Icon name='arrow-down' size={20} color='#9ca3af' />
                    </Text>
                  </View>
                </View>

                <View className='insp-card-meta'>
                  <Icon name='map-pin' size={22} color='#9ca3af' />
                  <Text className='insp-addr'>{getAddress(item)}</Text>
                  <Text className='insp-date'>{formatDate(item.createdAt)}</Text>
                </View>

                {isExpanded && (
                  <View className='insp-card-detail'>
                    {/* 各项评分 */}
                    <View className='insp-ratings'>
                      {Object.entries(ratings).map(([key, val]) => (
                        <View key={key} className='insp-rating-item'>
                          <Text className='insp-rating-label'>{questionLabels[key] || key}</Text>
                          <View className='insp-rating-stars'>
                            {renderStars(val)}
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* 备注 */}
                    {item.remark && (
                      <View className='insp-remark'>
                        <Text className='insp-remark-label'>客户反馈：</Text>
                        <Text className='insp-remark-content'>{item.remark}</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      <View className='safe-bottom' />
    </ScrollView>
  );
}
