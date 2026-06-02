import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Icon from './Icon';
import './ThankYouModal.scss';

interface ThankYouModalProps {
  visible: boolean;
  onClose: () => void;
  orderInfo?: {
    orderId?: string;
    orderNo: string;
    address: string;
    productName: string;
  };
}

export default function ThankYouModal({ visible, onClose, orderInfo }: ThankYouModalProps) {
  if (!visible) return null;

  const handleMaskClick = () => {
    onClose();
  };

  const handleCloseClick = () => {
    onClose();
  };

  const handleInspection = () => {
    const orderId = orderInfo?.orderId;
    if (orderId) {
      Taro.navigateTo({ url: `/subpackages/client/inspection/index?orderId=${orderId}` });
    }
  };

  return (
    <View className="thank-you-modal" onClick={handleMaskClick}>
      <View className="modal-container" onClick={(e) => e.stopPropagation()}>
        <View className="header-section">
          <View className="icon-wrapper">
            <Icon name="award" size={48} color="#ffffff" />
          </View>
          <Text className="main-title">感谢您的信任</Text>
          <Text className="sub-title">19 DECIBEL DOORS & WINDOWS</Text>
        </View>

        <View className="content-section">
          <Text className="thank-text">
            尊敬的用户，您的订单已圆满完工。
          </Text>
          <Text className="thank-text">
            19分贝始终坚持"一扇好门窗，品味大不同"。感谢您选择我们为您打造更宁静、更舒适的家。您的满意是我们不断追求卓越的动力！
          </Text>
        </View>

        <View className="footer-section">
          {orderInfo?.orderId && (
            <View className="inspection-button" onClick={handleInspection}>
              <Icon name="clipboard" size={32} color="#122b4d" />
              <Text className="inspection-button-text">填写验收单</Text>
            </View>
          )}
          <View className="close-button" onClick={handleCloseClick}>
            <Text className="close-button-text">关闭</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
