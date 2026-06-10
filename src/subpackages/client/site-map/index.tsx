import { useState, useEffect, useCallback } from 'react';
import { View, Text, Map, CoverView, CoverImage } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from '../../../components/Icon';
import api from '../../../utils/api';
import './index.scss';

interface SiteMarker {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  status: string;
  customerName?: string;
  address?: string;
  communityName?: string;
}

interface MarkerData {
  id: number;
  latitude: number;
  longitude: number;
  title: string;
  iconPath: string;
  width: number;
  height: number;
  callout?: {
    display: 'ALWAYS';
    content: string;
    padding: number;
    borderRadius: number;
    bgColor: string;
    color: string;
    fontSize: number;
  };
  customCallout?: {
    display: 'ALWAYS';
    anchorY: number;
    anchorX: number;
  };
}

const statusConfig: Record<string, { label: string; className: string }> = {
  INSTALLING: { label: '施工中', className: 'status-installing' },
  COMPLETED: { label: '已完工', className: 'status-completed' },
  PENDING: { label: '待施工', className: 'status-pending' },
};

const getStatusInfo = (status: string) => {
  return statusConfig[status] || { label: status || '未知', className: 'status-default' };
};

export default function SiteMap() {
  const [sites, setSites] = useState<SiteMarker[]>([]);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState<SiteMarker | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mapCenter, setMapCenter] = useState({ latitude: 39.9042, longitude: 116.4074 });
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cases', { pageSize: '1000' });
      const list = Array.isArray(res) ? res : (res?.list || []);
      const siteList: SiteMarker[] = list
        .filter((item: any) => item.latitude && item.longitude)
        .map((item: any) => ({
          id: item.id,
          title: item.title || item.name || '未命名工地',
          latitude: parseFloat(item.latitude),
          longitude: parseFloat(item.longitude),
          status: item.status || 'PENDING',
          customerName: item.customerName || item.clientName,
          address: item.address || item.installAddress,
          communityName: item.communityName,
        }));
      
      setSites(siteList);
      
      if (siteList.length > 0) {
        const markerList: MarkerData[] = siteList.map((site, index) => ({
          id: index + 1,
          latitude: site.latitude,
          longitude: site.longitude,
          title: site.title,
          iconPath: '/assets/marker-site.png',
          width: 32,
          height: 32,
          customCallout: {
            display: 'ALWAYS',
            anchorX: 0,
            anchorY: 0,
          },
        }));
        setMarkers(markerList);
        
        setMapCenter({
          latitude: siteList[0].latitude,
          longitude: siteList[0].longitude,
        });
      }
    } catch (error) {
      console.error('获取工地数据失败:', error);
      Taro.showToast({ title: '获取工地数据失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerTap = useCallback((e: any) => {
    const markerId = e.markerId;
    const site = sites[markerId - 1];
    if (site) {
      setSelectedSite(site);
      setShowModal(true);
    }
  }, [sites]);

  const handleLocateUser = useCallback(async () => {
    try {
      Taro.showLoading({ title: '定位中...' });
      const locationRes = await Taro.getFuzzyLocation({
        type: 'wgs84',
      });
      
      setUserLocation({
        latitude: locationRes.latitude,
        longitude: locationRes.longitude,
      });
      
      setMapCenter({
        latitude: locationRes.latitude,
        longitude: locationRes.longitude,
      });
      
      Taro.hideLoading();
      Taro.showToast({ title: '定位成功', icon: 'success' });
    } catch (error) {
      Taro.hideLoading();
      console.error('定位失败:', error);
      Taro.showModal({
        title: '定位失败',
        content: '无法获取您的位置，请检查位置权限设置',
        showCancel: false,
      });
    }
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setSelectedSite(null);
  }, []);

  const handleViewDetail = useCallback(() => {
    if (!selectedSite) return;
    setShowModal(false);
    Taro.navigateTo({
      url: `/subpackages/client/case-detail/index?id=${selectedSite.id}`,
    });
  }, [selectedSite]);

  const handleSwitchToList = useCallback(() => {
    Taro.navigateBack();
  }, []);

  const handleCalloutTap = useCallback((e: any) => {
    const markerId = e.markerId;
    const site = sites[markerId - 1];
    if (site) {
      setSelectedSite(site);
      setShowModal(true);
    }
  }, [sites]);

  if (loading) {
    return (
      <View className='site-map-page'>
        <View className='sm-navbar'>
          <View className='sm-navbar-left'>
            <View className='sm-back-btn' onClick={() => Taro.navigateBack()}>
              <Icon name='arrow-left' size={28} color='#ffffff' />
            </View>
            <Text className='sm-navbar-title'>全国工地地图</Text>
          </View>
        </View>
        <View className='sm-loading'>
          <Icon name='time' size={64} color='#122b4d' />
          <Text className='sm-loading-text'>加载工地数据...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='site-map-page'>
      {/* 导航栏 */}
      <CoverView className='sm-navbar'>
        <CoverView className='sm-navbar-left'>
          <CoverView className='sm-back-btn' onClick={() => Taro.navigateBack()}>
            <Icon name='arrow-left' size={28} color='#ffffff' />
          </CoverView>
          <Text className='sm-navbar-title'>全国工地地图</Text>
        </CoverView>
      </CoverView>

      {/* 地图 */}
      <Map
        className='sm-map'
        latitude={mapCenter.latitude}
        longitude={mapCenter.longitude}
        scale={12}
        markers={markers}
        onMarkerTap={handleMarkerTap}
        onCalloutTap={handleCalloutTap}
        showLocation
        enableZoom
        enableScroll
        enableRotate={false}
        enable3D
      >
        {/* 自定义 Callout */}
        {sites.map((site, index) => (
          <CoverView
            key={site.id}
            markerId={index + 1}
            className='sm-callout'
            customStyle={{
              position: 'relative',
              transform: 'translate(-50%, -120%)',
            }}
          >
            <Text className='sm-callout-name'>{site.title}</Text>
            <CoverView className={`sm-callout-status ${getStatusInfo(site.status).className}`}>
              <Text>{getStatusInfo(site.status).label}</Text>
            </CoverView>
            <Text className='sm-callout-address'>{site.address || site.communityName || ''}</Text>
          </CoverView>
        ))}
      </Map>

      {/* 定位按钮 */}
      {!loading && (
        <CoverView className='sm-location-btn' onClick={handleLocateUser}>
          <Icon name='map-pin' size={44} color='#122b4d' />
        </CoverView>
      )}

      {/* 底部操作栏 */}
      <CoverView className='sm-bottom-bar'>
        <CoverView className='sm-list-btn' onClick={handleSwitchToList}>
          <Icon name='clipboard-list' size={32} color='#ffffff' />
          <Text className='sm-list-btn-text'>列表模式</Text>
        </CoverView>
      </CoverView>

      {/* 空数据提示 */}
      {!loading && sites.length === 0 && (
        <View className='sm-empty'>
          <Icon name='map-pin' size={96} color='#d1d5db' />
          <Text className='sm-empty-text'>暂无工地数据</Text>
          <Text className='sm-empty-subtext'>当前没有可显示的工地位置信息</Text>
        </View>
      )}

      {/* 详情弹窗 */}
      {showModal && selectedSite && (
        <View className='sm-modal-mask' onClick={handleCloseModal}>
          <View className='sm-modal-content' onClick={(e) => e.stopPropagation()}>
            <View className='sm-modal-handle' />
            
            <View className='sm-modal-header'>
              <Text className='sm-modal-title'>{selectedSite.title}</Text>
              <CoverView className={`sm-modal-status-badge ${getStatusInfo(selectedSite.status).className}`}>
                <Text>{getStatusInfo(selectedSite.status).label}</Text>
              </CoverView>
            </View>

            <View className='sm-modal-info'>
              {selectedSite.customerName && (
                <View className='sm-info-item'>
                  <Text className='sm-info-label'>客户名称</Text>
                  <Text className='sm-info-value'>{selectedSite.customerName}</Text>
                </View>
              )}
              
              {(selectedSite.address || selectedSite.communityName) && (
                <View className='sm-info-item'>
                  <Text className='sm-info-label'>地址</Text>
                  <Text className='sm-info-value'>
                    {selectedSite.address || selectedSite.communityName}
                  </Text>
                </View>
              )}
              
              <View className='sm-info-item'>
                <Text className='sm-info-label'>状态</Text>
                <Text className='sm-info-value'>{getStatusInfo(selectedSite.status).label}</Text>
              </View>
              
              <View className='sm-info-item'>
                <Text className='sm-info-label'>坐标</Text>
                <Text className='sm-info-value'>
                  {selectedSite.latitude.toFixed(6)}, {selectedSite.longitude.toFixed(6)}
                </Text>
              </View>
            </View>

            <View className='sm-modal-actions'>
              <CoverView className='sm-modal-btn sm-modal-btn-close' onClick={handleCloseModal}>
                <Text>关闭</Text>
              </CoverView>
              <CoverView className='sm-modal-btn sm-modal-btn-detail' onClick={handleViewDetail}>
                <Text>查看详情</Text>
              </CoverView>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
