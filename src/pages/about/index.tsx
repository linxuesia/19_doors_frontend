import { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Video } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../components/Icon';
import api from '../../utils/api';
import './index.scss';

const REPORT_BASE_URL = 'cloud://prod-d7g81p837f1219e28.7072-prod-d7g81p837f1219e28-1436604435/product-report';

export default function About() {
  const [brandStores, setBrandStores] = useState<any[]>([]);
  const [showAllStores, setShowAllStores] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [demoVideos, setDemoVideos] = useState<any[]>([]);
  const [videoUrls, setVideoUrls] = useState<Record<string, string>>({});
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/stores?pageSize=100&status=OPEN')
      .then((res: any) => {
        const list = res?.list || (Array.isArray(res) ? res : []);
        setBrandStores(list);
      })
      .catch(() => setBrandStores([]));
  }, []);

  useEffect(() => {
    api.get('/products?pageSize=100')
      .then((res: any) => {
        const list = res?.list || (Array.isArray(res) ? res : []);
        setProducts(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/demo-videos')
      .then(async (res: any) => {
        const list = Array.isArray(res) ? res : [];
        setDemoVideos(list);
        if (list.length > 0 && Taro.cloud) {
          const cloudVideos = list.filter((v: any) => v.videoUrl?.startsWith('cloud://'));
          if (cloudVideos.length > 0) {
            try {
              const fileIDs = cloudVideos.map((v: any) => v.videoUrl);
              const { fileList } = await Taro.cloud.getTempFileURL({ fileList: fileIDs });
              const urlMap: Record<string, string> = {};
              fileList.forEach((f: any, i: number) => {
                urlMap[cloudVideos[i].id] = f.tempFileURL || fileIDs[i];
              });
              setVideoUrls(urlMap);
            } catch {}
          }
        }
      })
      .catch(() => setDemoVideos([]));
  }, []);

  /** 打开产品检测报告PDF */
  const handleOpenReport = async (product: any) => {
    setDownloadingId(product.id);
    Taro.showLoading({ title: '加载报告中...' });

    try {
      let tempUrl: string;

      // 优先使用 inspectionReportUrl 字段
      if (product.inspectionReportUrl) {
        if (product.inspectionReportUrl.startsWith('cloud://')) {
          const { fileList } = await Taro.cloud.getTempFileURL({ fileList: [product.inspectionReportUrl] });
          if (!fileList?.[0]?.tempFileURL) throw new Error('文件不存在');
          tempUrl = fileList[0].tempFileURL;
        } else {
          tempUrl = product.inspectionReportUrl;
        }
      } else {
        // 兼容旧逻辑：按命名约定拼接 cloud:// 路径
        const fileID = `${REPORT_BASE_URL}/${product.name}检测报告.pdf`;
        const { fileList } = await Taro.cloud.getTempFileURL({ fileList: [fileID] });
        if (!fileList?.[0]?.tempFileURL) throw new Error('文件不存在');
        tempUrl = fileList[0].tempFileURL;
      }

      const downloadRes = await Taro.downloadFile({ url: tempUrl });
      if (downloadRes.statusCode !== 200) throw new Error('下载失败');

      await Taro.openDocument({
        filePath: downloadRes.tempFilePath,
        fileType: 'pdf',
        showMenu: true,
      });
      Taro.hideLoading();
    } catch (e: any) {
      console.error('打开检测报告失败:', e);
      Taro.hideLoading();
      const msg = e.message?.includes('不存在') ? '该产品报告暂未上线' : '加载失败，请重试';
      Taro.showToast({ title: msg, icon: 'none' });
    } finally {
      setDownloadingId(null);
    }
  };

  const displayStores = showAllStores ? brandStores : brandStores.slice(0, 10);

  return (
    <ScrollView className='about-page' scrollY>
      {/* 顶部Banner区域 */}
      <View className='hero-banner'>
        <Image
          className='hero-bg-image'
          src='cloud://prod-d7g81p837f1219e28.7072-prod-d7g81p837f1219e28-1436604435/common/banner.jpeg'
          mode='aspectFill'
        />
        <View className='hero-overlay' />
        <View className='hero-content'>
          <Text className='hero-brand'>SOJOY</Text>
          <Text className='hero-slogan'>19分贝高端系统门窗</Text>
        </View>
      </View>

      {/* 品牌简介卡片 */}
      <View className='intro-card-wrapper'>
        <View className='intro-card'>
          <View className='intro-header'>
            <View className='intro-bar' />
            <Text className='intro-title'>品牌简介</Text>
          </View>
          <View className='intro-body'>
            <Text className='intro-text'>
              SOJOY 19分贝门窗，以"一扇好门窗，品味大不同"为核心理念，致力于为全球用户提供高端系统门窗整体解决方案。我们深耕门窗行业多年，集产品研发、设计、制造、营销于一体，凭借卓越的隔音、抗风压、保温隔热性能，成为行业标杆品牌。
            </Text>
            <Text className='intro-text'>
              公司总部位于北京海淀区蓟门桥，拥有独立的研发中心与先进的生产基地。生产基地坐落于山东临朐中欧节能门窗产业园D区，引进德国先进生产设备与工艺，严格遵循国际质量管理体系，确保每一扇门窗都达到卓越品质。
            </Text>
          </View>
        </View>
      </View>

      {/* 门店查询卡片 */}
      <View className='section-block'>
        <View className='section-header'>
          <View className='section-bar' />
          <Text className='section-title'>门店查询</Text>
        </View>
        <View className='store-list'>
          {displayStores.map((store: any) => (
            <View key={store.id} className='store-card'>
              <View className='store-top'>
                <View className='store-info'>
                  <Text className='store-name'>{store.name}</Text>
                  <View className='store-meta'>
                    <Icon name='map-pin' size={24} color='#6b7280' />
                    <Text className='store-address'>{store.address}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>

        {brandStores.length > 10 && (
          <View
            className={`show-all-btn ${showAllStores ? 'expanded' : ''}`}
            onClick={() => setShowAllStores(!showAllStores)}
          >
            <Text className='show-all-text'>{showAllStores ? '收起' : `查看全部 (${brandStores.length})`}</Text>
            <Text className='show-all-icon'>{showAllStores ? '↑' : '↓'}</Text>
          </View>
        )}
        {brandStores.length === 0 && (
          <View className='store-empty'>
            <Icon name='map-pin' size={48} color='#d1d5db' />
            <Text className='store-empty-text'>暂无门店信息</Text>
          </View>
        )}
      </View>

      {/* 产品检测报告 */}
      <View className='report-section'>
        <View className='report-header'>
          <View className='report-header-top'>
            <View className='report-badge'>
              <Icon name='shield-check' size={28} color='#ffffff' />
              <Text className='report-badge-text'>权威认证</Text>
            </View>
            <Text className='report-header-title'>产品检测报告</Text>
          </View>
          <Text className='report-header-desc'>每款产品均通过国家权威机构检测认证，品质值得信赖</Text>
        </View>

        {products.length > 0 ? (
          <View className='report-grid'>
            {products.map((product) => {
              // 优先封面图，其次 images 数组首张
              const coverImage = product.coverImage || (() => { try { const imgs = JSON.parse(product.images || '[]'); return imgs[0]; } catch { return ''; } })();
              return (
                <View
                  key={product.id}
                  className={`report-card ${downloadingId === product.id ? 'report-card-loading' : ''}`}
                  onClick={() => handleOpenReport(product)}
                >
                  <View className='report-card-cover'>
                    {coverImage ? (
                      <Image className='report-cover-img' src={coverImage} mode='aspectFill' />
                    ) : (
                      <View className='report-cover-placeholder'>
                        <Icon name='window' size={56} color='#b0c4d8' />
                      </View>
                    )}
                    <View className='report-overlay'>
                      <View className='report-pdf-icon'>
                        <Icon name='file-text' size={32} color='#ffffff' />
                      </View>
                    </View>
                    {downloadingId === product.id && (
                      <View className='report-loading-mask'>
                        <Text className='report-mask-text'>加载中...</Text>
                      </View>
                    )}
                  </View>
                  <View className='report-card-body'>
                    <Text className='report-card-name'>{product.name}</Text>
                    <View className='report-card-footer'>
                      <View className='report-tag'>
                        <Icon name='check-circle' size={22} color='#059669' />
                        <Text className='report-tag-text'>检测报告</Text>
                      </View>
                      <Text className='report-view-btn'>查看 PDF</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          <View className='report-empty'>
            <View className='report-empty-icon'>
              <Icon name='file-text' size={72} color='#d1d5db' />
            </View>
            <Text className='report-empty-title'>暂无检测报告</Text>
            <Text className='report-empty-desc'>产品数据加载中，请稍后再试</Text>
          </View>
        )}
      </View>

      {/* 产品说明视频 */}
      {demoVideos.length > 0 && (
        <View className='section-block'>
          <View className='section-header'>
            <View className='section-bar' />
            <Text className='section-title'>产品说明视频</Text>
          </View>

          <View className='video-grid'>
            {demoVideos.map((video) => {
              const url = videoUrls[video.id];
              if (!url) return null;
              return (
                <View key={video.id} className='video-card'>
                  <Video
                    className='video-player'
                    src={url}
                    objectFit='cover'
                    muted
                    controls
                  />
                  <Text className='video-title'>{video.title}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      <View className='safe-bottom' />
    </ScrollView>
  );
}
