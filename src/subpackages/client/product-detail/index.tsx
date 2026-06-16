import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Image, Swiper, SwiperItem, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

// 适用空间选项（与产品管理保持一致）
const spaceOptions = [
  { value: 'LIVING', label: '客厅' },
  { value: 'BEDROOM', label: '卧室' },
  { value: 'KITCHEN', label: '厨房' },
  { value: 'BALCONY', label: '阳台' },
  { value: 'STUDY', label: '书房' },
];

// 色彩选项（与产品管理保持一致）
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

export default function ProductDetail() {
  const router = useRouter();
  const id = router.params.id;
  const [product, setProduct] = useState<any>(null);
  const [openingReport, setOpeningReport] = useState(false);

  // 解析后端逗号分隔字符串为数组，空则默认全选
  const selectedSpaces = useMemo(() => {
    if (!product) return spaceOptions.map(o => o.value);
    const raw = product.space || '';
    const arr = raw.split(',').filter(Boolean);
    return arr.length > 0 ? arr : spaceOptions.map(o => o.value);
  }, [product]);

  const selectedColors = useMemo(() => {
    if (!product) return colorOptions.map(o => o.value);
    const raw = product.color || '';
    const arr = raw.split(',').filter(Boolean);
    return arr.length > 0 ? arr : colorOptions.map(o => o.value);
  }, [product]);

  /** 打开质量检测报告 PDF */
  const handleOpenReport = async () => {
    if (!product?.inspectionReportUrl) return;
    setOpeningReport(true);
    Taro.showLoading({ title: '加载报告中...' });
    try {
      let tempUrl: string;
      if (product.inspectionReportUrl.startsWith('cloud://')) {
        const { fileList } = await Taro.cloud.getTempFileURL({ fileList: [product.inspectionReportUrl] });
        if (!fileList?.[0]?.tempFileURL) throw new Error('文件不存在');
        tempUrl = fileList[0].tempFileURL;
      } else {
        tempUrl = product.inspectionReportUrl;
      }
      const downloadRes = await Taro.downloadFile({ url: tempUrl });
      if (downloadRes.statusCode !== 200) throw new Error('下载失败');
      await Taro.openDocument({ filePath: downloadRes.tempFilePath, fileType: 'pdf', showMenu: true });
      Taro.hideLoading();
    } catch (e: any) {
      console.error('打开检测报告失败:', e);
      Taro.hideLoading();
      Taro.showToast({ title: '报告加载失败，请重试', icon: 'none' });
    } finally {
      setOpeningReport(false);
    }
  };

  useEffect(() => {
    if (id) {
      api.get(`/products/${id}`)
        .then((res: any) => setProduct(res))
        .catch(() => setProduct(null));
    }
  }, [id]);

  // 解析 Banner 轮播图片
  const bannerImages = useMemo(() => {
    if (!product) return [];
    try { return JSON.parse(product.images || '[]'); } catch { return []; }
  }, [product]);

  // 解析功能特性（JSON数组）
  const featuresList = useMemo(() => {
    if (!product) return [];
    try { return JSON.parse(product.features || '[]'); } catch { return []; }
  }, [product]);


  if (!product) {
    return (
      <View className='pd-loading'>
        <Text className='pd-loading-text'>加载中...</Text>
      </View>
    );
  }

  const hasBannerImages = bannerImages.length > 0;
  const hasDetailImage = !!product.detailImage;

  return (
    <ScrollView className='pd-page' scrollY>
      {/* Banner 图片 - 使用 images 字段 */}
      <View className='pd-banner'>
        {hasBannerImages ? (
          <Swiper className='pd-swiper' indicatorDots indicatorColor='rgba(255,255,255,0.5)' indicatorActiveColor='#122b4d' circular>
            {bannerImages.map((img: string, i: number) => (
              <SwiperItem key={i}>
                <Image className='pd-swiper-img' src={img} mode='aspectFill' />
              </SwiperItem>
            ))}
          </Swiper>
        ) : (
          <View className='pd-hero-placeholder'>
            <Icon name='window' size={96} color='#b0c4d8' />
          </View>
        )}
      </View>

      {/* 产品信息区域 */}
      <View className='pd-info-section'>
        {/* 产品标题 */}
        <Text className='pd-title'>{product.name}</Text>

        {/* 产品参数 - 始终显示3个属性 */}
        <View className='pd-specs-section'>
          <Text className='pd-section-title'>产品参数</Text>
          <View className='pd-specs-list'>
            <View className='pd-spec-item'>
              <Text className='pd-spec-label'>色彩</Text>
              <View className='pd-checkbox-group'>
                {colorOptions.map((opt) => (
                  <View key={opt.value} className={`pd-checkbox ${selectedColors.includes(opt.value) ? 'pd-checkbox-active' : ''}`}>
                    <Text className={`pd-checkbox-icon ${selectedColors.includes(opt.value) ? 'checked' : ''}`}>
                      {selectedColors.includes(opt.value) ? '✓' : ''}
                    </Text>
                    <Text className='pd-checkbox-label'>{opt.label}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View className='pd-spec-item'>
              <Text className='pd-spec-label'>可适用空间</Text>
              <View className='pd-checkbox-group'>
                {spaceOptions.map((opt) => (
                  <View key={opt.value} className={`pd-checkbox ${selectedSpaces.includes(opt.value) ? 'pd-checkbox-active' : ''}`}>
                    <Text className={`pd-checkbox-icon ${selectedSpaces.includes(opt.value) ? 'checked' : ''}`}>
                      {selectedSpaces.includes(opt.value) ? '✓' : ''}
                    </Text>
                    <Text className='pd-checkbox-label'>{opt.label}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View className='pd-spec-item'>
              <Text className='pd-spec-label'>功能特性</Text>
              <Text className='pd-spec-value'>{featuresList.length > 0 ? featuresList.join('；') : '-'}</Text>
            </View>
          </View>
        </View>

        {/* 产品详情图 */}
        {hasDetailImage && (
          <View className='pd-detail-section'>
            <Text className='pd-section-title'>产品详情</Text>
            <Image
              className='pd-detail-img'
              src={product.detailImage}
              mode='widthFix'
              lazyLoad
            />
          </View>
        )}

        {/* 质量检测报告 */}
        {product.inspectionReportUrl && (
          <View className='pd-report-section'>
            <View className='pd-report-btn' onClick={openingReport ? undefined : handleOpenReport}>
              <Icon name='shield-check' size={36} color='#122b4d' />
              <View className='pd-report-text'>
                <Text className='pd-report-title'>质量检测报告</Text>
                <Text className='pd-report-desc'>国家权威机构认证</Text>
              </View>
              <Icon name='arrow-right' size={28} color='#9ca3af' />
            </View>
          </View>
        )}

        {/* 相关案例 */}
        <View className='pd-cases-section'>
          <Text className='pd-section-title'>相关案例</Text>
        </View>
      </View>

      {/* 底部操作栏 */}
      <View className='pd-bottom-bar'>
        <Button className='pd-contact-btn' openType='contact'>
          <Icon name='chat' size={36} color='#122b4d' />
          <Text className='pd-contact-text'>咨询</Text>
        </Button>
        <View
          className='btn-primary pd-reserve-btn'
          onClick={() => Taro.navigateTo({ url: '/subpackages/client/reservation/index' })}
        >
          <Icon name='calendar' size={32} color='#ffffff' />
          <Text>立即预约</Text>
        </View>
      </View>

      <View className='safe-bottom' />
    </ScrollView>
  );
}
