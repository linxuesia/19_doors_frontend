import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../components/Icon';
import api from '../../utils/api';
import './index.scss';

export default function About() {
  return (
    <ScrollView className='about-page' scrollY>
      {/* 品牌Banner */}
      <View className='hero-section'>
        <View className='hero-bg' />
        <Text className='hero-title'>SOJOY 19分贝</Text>
        <Text className='hero-subtitle'>高端系统门窗整体解决方案提供商</Text>
      </View>

      {/* 品牌简介 */}
      <View className='about-section'>
        <View className='section-header'>
          <Text className='section-title'>品牌简介</Text>
          <View className='section-line' />
        </View>
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
              <Text key={tag} className='brand-tag'>{tag}</Text>
            ))}
          </View>
        </View>
      </View>

      {/* 核心优势 */}
      <View className='about-section'>
        <View className='section-header'>
          <Text className='section-title'>核心优势</Text>
          <View className='section-line' />
        </View>
        <View className='advantage-grid'>
          {[
            { icon: 'shield-check', title: '隔音性能', desc: '达19分贝标准', color: '#122b4d' },
            { icon: 'wind', title: '抗风压', desc: '特级认证等级', color: '#1b3e6c' },
            { icon: 'thermometer', title: '保温隔热', desc: '节能环保材料', color: '#2b5a8e' },
            { icon: 'award', title: '品质保证', desc: '终身质保服务', color: '#122b4d' },
          ].map((item) => (
            <View key={item.title} className='advantage-card'>
              <View className='advantage-icon-wrap' style={{ background: `${item.color}15` }}>
                <Icon name={item.icon as any} size={40} color={item.color} />
              </View>
              <Text className='advantage-title'>{item.title}</Text>
              <Text className='advantage-desc'>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 门店查询 */}
      <View className='about-section'>
        <View className='section-header'>
          <Text className='section-title'>门店查询</Text>
          <View className='section-line' />
        </View>
        <View className='store-list'>
          <View className='store-card'>
            <View className='store-header'>
              <View className='store-info-row'>
                <Text className='store-name'>上海松江直营店</Text>
                <Text className='store-badge'>直营</Text>
              </View>
              <Icon name='phone' size={32} color='#122b4d' onClick={() => Taro.makePhoneCall({ phoneNumber: '13800138000' })} />
            </View>
            <Text className='store-address'>上海市松江区涞亭南路S88号SOJOY体验中心</Text>
            <View className='store-tags'>
              <Text className='store-tag'>展厅面积 800㎡</Text>
              <Text className='store-tag'>营业时间 9:00-18:00</Text>
            </View>
          </View>

          <View className='store-card'>
            <View className='store-header'>
              <View className='store-info-row'>
                <Text className='store-name'>北京朝阳体验馆</Text>
                <Text className='store-badge'>直营</Text>
              </View>
              <Icon name='phone' size={32} color='#122b4d' onClick={() => Taro.makePhoneCall({ phoneNumber: '01012345678' })} />
            </View>
            <Text className='store-address'>北京市朝阳区建国路88号SOHO现代城</Text>
            <View className='store-tags'>
              <Text className='store-tag'>展厅面积 600㎡</Text>
              <Text className='store-tag'>营业时间 9:00-18:00</Text>
            </View>
          </View>

          <View className='store-card'>
            <View className='store-header'>
              <View className='store-info-row'>
                <Text className='store-name'>苏州园区店</Text>
                <Text className='store-badge store-badge-partner'>合作</Text>
              </View>
              <Icon name='phone' size={32} color='#122b4d' onClick={() => Taro.makePhoneCall({ phoneNumber: '05128888888' })} />
            </View>
            <Text className='store-address'>苏州工业园区星湖街218号</Text>
            <View className='store-tags'>
              <Text className='store-tag'>展厅面积 500㎡</Text>
              <Text className='store-tag'>营业时间 9:00-18:00</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 产品检测报告 */}
      <View className='about-section'>
        <View className='section-header'>
          <Text className='section-title'>产品检测报告</Text>
          <View className='section-line' />
        </View>
        <ScrollView className='qualification-scroll' scrollX showScrollbar={false}>
          {[
            { id: 'r1', title: '门窗隔音检测报告', desc: '国家检测中心认证 · 隔音性能达19分贝', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=400&q=80' },
            { id: 'r2', title: '抗风压性能报告', desc: '最高等级特级认证 · 抗风压性能优异', image: 'https://images.unsplash.com/photo-1581092335871-4c7c80f83b8e?auto=format&fit=crop&w=400&q=80' },
            { id: 'r3', title: '保温性能检测报告', desc: '节能保温 · 符合国家建筑节能标准', image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80' },
          ].map((item) => (
            <View
              key={item.id}
              className='qualification-card'
              onClick={() => Taro.previewImage({ current: item.image, urls: [item.image] })}
            >
              <Image className='qualification-img' src={item.image} mode='aspectFill' />
              <Text className='qualification-title'>{item.title}</Text>
              <Text className='qualification-store'>{item.desc}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 联系我们 */}
      <View className='about-section'>
        <View className='section-header'>
          <Text className='section-title'>联系我们</Text>
          <View className='section-line' />
        </View>
        <View className='contact-card'>
          <View className='contact-item'>
            <View className='contact-icon-wrap'>
              <Icon name='phone' size={32} color='#ffffff' />
            </View>
            <View className='contact-info'>
              <Text className='contact-label'>客服热线</Text>
              <Text className='contact-value'>400-888-1919</Text>
            </View>
          </View>
          <View className='contact-item'>
            <View className='contact-icon-wrap contact-icon-email'>
              <Icon name='mail' size={32} color='#ffffff' />
            </View>
            <View className='contact-info'>
              <Text className='contact-label'>官方邮箱</Text>
              <Text className='contact-value'>service@sojoy.com</Text>
            </View>
          </View>
          <View className='contact-item'>
            <View className='contact-icon-wrap contact-icon-address'>
              <Icon name='map-pin' size={32} color='#ffffff' />
            </View>
            <View className='contact-info'>
              <Text className='contact-label'>公司地址</Text>
              <Text className='contact-value'>北京市海淀区蓟门桥</Text>
            </View>
          </View>
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
