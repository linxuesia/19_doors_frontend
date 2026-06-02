import { useState } from 'react';
import { View, Text, ScrollView, Textarea } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

const questions = [
  { id: 'q1', title: '安装人员是否佩戴安全带、设置楼下警戒线？', category: '安全作业' },
  { id: 'q2', title: '安装前产品外观是否完好（无划痕、涂层均匀）？', category: '产品验收' },
  { id: 'q3', title: '玻璃是否有 3C 认证标记，表面是否洁净无瑕疵？', category: '产品验收' },
  { id: 'q4', title: '安装辅材（螺丝、发泡剂、密封胶）品牌是否符合约定？', category: '安装辅材' },
  { id: 'q5', title: '外开窗是否配备了防坠绳？', category: '安装辅材' },
  { id: 'q6', title: '窗框安装是否水平垂直，不突出窗框？', category: '安装验收' },
  { id: 'q7', title: '发泡剂填充是否饱满、连续、无漏洞？', category: '安装验收' },
  { id: 'q8', title: '外墙密封胶是否饱满光滑、连续无断层？', category: '安装验收' },
  { id: 'q9', title: '窗扇开关是否顺畅、无卡顿，四周搭接均匀？', category: '安装验收' },
  { id: 'q10', title: '安装后现场是否清理干净，垃圾已装袋处理？', category: '整体验收' },
];

export default function Inspection() {
  const router = useRouter();
  const { orderId } = router.params;
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleRate = (questionId: string, star: number) => {
    setRatings((prev) => ({ ...prev, [questionId]: star }));
  };

  const answeredCount = Object.keys(ratings).length;
  const totalScore = Object.values(ratings).reduce((sum, v) => sum + v, 0);
  const avgScore = answeredCount > 0 ? (totalScore / answeredCount).toFixed(1) : '0';
  const allAnswered = answeredCount === questions.length;

  const handleSubmit = async () => {
    if (!allAnswered) {
      Taro.showToast({ title: '请完成全部评分', icon: 'none' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/inspections', {
        orderId,
        ratings: JSON.stringify(ratings),
        avgScore: parseFloat(avgScore),
        remark: remark || undefined,
      });
      Taro.showToast({ title: '感谢您的反馈！', icon: 'success' });
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch {
      Taro.showToast({ title: '提交失败，请重试', icon: 'none' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView className='insp-page' scrollY>
      {/* 头部 */}
      <View className='insp-header'>
        <Text className='insp-header-title'>安装验收单</Text>
        <Text className='insp-header-sub'>
          订单 {orderId ? orderId.slice(-8).toUpperCase() : ''} · 请对以下项目逐一评分
        </Text>
      </View>

      {/* 评分题目 */}
      <View className='insp-list'>
        {questions.map((q, index) => (
          <View key={q.id} className='insp-item'>
            <View className='insp-item-header'>
              <View className='insp-item-num'>
                <Text className='insp-item-num-text'>{index + 1}</Text>
              </View>
              <Text className='insp-item-title'>{q.title}</Text>
            </View>
            <View className='insp-stars'>
              {[1, 2, 3, 4, 5].map((star) => (
                <View key={star} className='insp-star' onClick={() => handleRate(q.id, star)}>
                  <Icon
                    name='star'
                    size={44}
                    color={star <= (ratings[q.id] || 0) ? '#f59e0b' : '#d1d5db'}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      {/* 备注 */}
      <View className='insp-remark'>
        <Text className='insp-remark-title'>其他建议或反馈（选填）</Text>
        <Textarea
          className='insp-textarea'
          placeholder='如有其他意见或建议，请在此填写...'
          value={remark}
          onInput={(e) => setRemark(e.detail.value)}
        />
      </View>

      {/* 提交栏 */}
      <View className='insp-submit-bar'>
        <View className='insp-submit-score'>
          <Text className='insp-submit-score-num'>{avgScore}</Text>
          <Text> / 5 分</Text>
        </View>
        <View
          className={`insp-submit-btn ${(!allAnswered || submitting) ? 'insp-submit-disabled' : ''}`}
          onClick={handleSubmit}
        >
          <Text>{submitting ? '提交中...' : `提交验收 (${answeredCount}/${questions.length})`}</Text>
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
