import { View, Text } from '@tarojs/components';
import Icon from '../../components/Icon';
import './index.scss';

export default function About() {
  return (
    <View className='about-page'>
      {/* 品牌Banner */}
      <View className='hero-section'>
        <Text className='hero-title'>SOJOY 19分贝</Text>
        <Text className='hero-subtitle'>高端系统门窗整体解决方案提供商</Text>
      </View>

      {/* 品牌简介 */}
      <View className='about-section'>
        <Text className='about-section-title'>品牌简介</Text>
        <View className='content-card'>
          <Text className='content-text'>
            SOJOY 19分贝门窗，公司总部位于北京海淀区蓟门桥，拥有独立的研发中心与先进的生产基地。
          </Text>
          <Text className='content-text'>
            生产基地坐落于山东临朐中欧节能门窗产业园D区，深耕门窗行业多年，集产品研发、设计、制造、营销于一体，致力于为全球用户提供高端系统门窗整体解决方案。
          </Text>
          <Text className='content-text'>
            我们以"一扇好门窗，品味大不同"为核心理念，不仅提供卓越的产品，更提供完善的全生命周期服务体系。
          </Text>
          <View className='brand-tags'>
            {['国家检测中心认证', '最高等级特级认证', '终身质保', '品质工程'].map((tag) => (
              <Text key={tag} className='tag tag-brand'>{tag}</Text>
            ))}
          </View>
        </View>
      </View>

      {/* 门店查询 */}
      <View className='about-section'>
        <Text className='about-section-title'>门店查询</Text>
        <View className='store-list'>
          <View className='store-card'>
            <View className='store-header'>
              <Text className='store-name'>上海松江直营店</Text>
              <Text className='tag tag-brand'>直营</Text>
            </View>
            <Text className='store-address'>上海市松江区涞亭南路S88</Text>
            <View className='store-meta'>
              <Text className='store-phone'>电话: 021-xxxx-xxxx</Text>
            </View>
          </View>

          <View className='store-card'>
            <View className='store-header'>
              <Text className='store-name'>北京朝阳体验馆</Text>
              <Text className='tag tag-brand'>直营</Text>
            </View>
            <Text className='store-address'>北京市朝阳区建国路88号</Text>
            <View className='store-meta'>
              <Text className='store-phone'>电话: 010-xxxx-xxxx</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 产品检测报告 */}
      <View className='about-section'>
        <Text className='about-section-title'>产品检测报告</Text>
        <View className='report-list'>
          <View className='report-card'>
            <View className='report-icon'>
              <Icon name='clipboard' size={48} color='#122b4d' />
            </View>
            <View className='report-info'>
              <Text className='report-title'>门窗隔音检测报告</Text>
              <Text className='report-desc'>国家检测中心认证 · 隔音性能达19分贝</Text>
            </View>
          </View>

          <View className='report-card'>
            <View className='report-icon'>
              <Icon name='shield-check' size={48} color='#122b4d' />
            </View>
            <View className='report-info'>
              <Text className='report-title'>抗风压性能报告</Text>
              <Text className='report-desc'>最高等级特级认证 · 抗风压性能优异</Text>
            </View>
          </View>
        </View>
      </View>

      <View className='safe-bottom' />
    </View>
  );
}
