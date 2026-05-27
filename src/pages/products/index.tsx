import { useState } from 'react';
import { View, Text, ScrollView, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../components/Icon';
import './index.scss';

const mockProducts = [
  { id: 1, name: 'S100内开窗纱一体', series: 'S100', coverImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=modern%20aluminum%20window%20in%20luxury%20living%20room%20with%20city%20view%20daylight&image_size=landscape_4_3', features: ['纱网一体', '隔音隔热'] },
  { id: 2, name: 'S97内开窗纱一体', series: 'S97', coverImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=modern%20aluminum%20casement%20window%20in%20home%20office%20with%20bookshelf&image_size=landscape_4_3', features: ['静音设计', '安全防护'] },
  { id: 3, name: 'S88断桥平开窗', series: 'S88', coverImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=minimalist%20aluminum%20window%20with%20curved%20design%20in%20modern%20apartment&image_size=landscape_4_3', features: ['断桥隔热', '节能保温'] },
  { id: 4, name: 'S110推拉门', series: 'S110', coverImage: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=large%20sliding%20glass%20door%20in%20modern%20living%20room%20with%20panoramic%20view&image_size=landscape_4_3', features: ['超大视野', '推拉顺畅'] },
];

export default function Products() {
  const [activeSpaces, setActiveSpaces] = useState<string[]>([]);
  const [activeStyles, setActiveStyles] = useState<string[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);

  const spaces = ['客厅', '厨房', '卫生间', '卧室'];
  const styles = ['现代简约', '奶油风', '中古风'];
  const colors = ['宝马灰', '珐琅白', '金属咖', '星空黑', '黑晶石'];

  const toggleFilter = (value: string, active: string[], setter: (v: string[]) => void) => {
    if (active.includes(value)) {
      setter(active.filter((v) => v !== value));
    } else {
      setter([...active, value]);
    }
  };

  return (
    <ScrollView className='products-page' scrollY>
      {/* 系列标签 */}
      <View className='series-tag'>
        <Text className='series-label'>系列:</Text>
        <Text className='series-value'>平开窗</Text>
      </View>

      {/* 空间筛选 */}
      <View className='filter-section'>
        <Text className='filter-label'>空间:</Text>
        <ScrollView className='filter-scroll' scrollX showScrollbar={false}>
          <View className='filter-options'>
            {spaces.map((s) => (
              <View
                key={s}
                className={`filter-option ${activeSpaces.includes(s) ? 'filter-option-active' : ''}`}
                onClick={() => toggleFilter(s, activeSpaces, setActiveSpaces)}
              >
                <Text className='filter-option-text'>{s}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 风格筛选 */}
      <View className='filter-section'>
        <Text className='filter-label'>风格:</Text>
        <ScrollView className='filter-scroll' scrollX showScrollbar={false}>
          <View className='filter-options'>
            {styles.map((s) => (
              <View
                key={s}
                className={`filter-option ${activeStyles.includes(s) ? 'filter-option-active' : ''}`}
                onClick={() => toggleFilter(s, activeStyles, setActiveStyles)}
              >
                <Text className='filter-option-text'>{s}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 色彩筛选 */}
      <View className='filter-section'>
        <Text className='filter-label'>色彩:</Text>
        <ScrollView className='filter-scroll' scrollX showScrollbar={false}>
          <View className='filter-options'>
            {colors.map((c) => (
              <View
                key={c}
                className={`filter-option ${activeColors.includes(c) ? 'filter-option-active' : ''}`}
                onClick={() => toggleFilter(c, activeColors, setActiveColors)}
              >
                <Text className='filter-option-text'>{c}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* 产品网格 */}
      <View className='product-grid'>
        {mockProducts.map((item: any) => (
          <View
            key={item.id}
            className='product-card'
            onClick={() =>
              Taro.navigateTo({ url: `/subpackages/client/product-detail/index?id=${item.id}` })
            }
          >
            <View className='product-card-img'>
              {item.coverImage ? (
                <Image className='product-card-image' src={item.coverImage} mode='aspectFill' />
              ) : (
                <View className='product-card-placeholder'>
                  <Icon name='window' size={72} color='#b0c4d8' />
                </View>
              )}
            </View>
            <View className='product-card-body'>
              <Text className='product-card-name'>{item.name}</Text>
              <Text className='product-card-series'>{item.series}</Text>
              {item.features?.length > 0 && (
                <View className='product-card-tags'>
                  {item.features.slice(0, 3).map((f: string, i: number) => (
                    <Text key={i} className='feature-tag'>{f}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}