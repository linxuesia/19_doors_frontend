import { View, Text, ScrollView } from '@tarojs/components';
import './index.scss';

export default function Privacy() {
  return (
    <ScrollView className='privacy-page' scrollY>
      <View className='privacy-content'>
        <View className='privacy-card'>
          <Text className='privacy-title'>隐私政策</Text>
          <Text className='privacy-date'>更新日期：2026年6月3日</Text>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>引言</Text>
            <Text className='privacy-text'>
              SOJOY 19分贝门窗（以下简称"我们"）深知个人信息对您的重要性，我们将按照法律法规要求，采取严格的安全保护措施，尽力保护您的个人信息安全。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>一、我们收集的信息</Text>
            <Text className='privacy-text'>
              在您使用我们的服务时，我们可能会收集以下类型的个人信息：
            </Text>
            <Text className='privacy-text'>
              1. <Text className='privacy-highlight'>手机号码</Text>：用于账号注册、订单联系和身份验证。您通过微信授权手机号一键登录时获取。
            </Text>
            <Text className='privacy-text'>
              2. <Text className='privacy-highlight'>微信头像与昵称</Text>：仅用于个人中心展示，您可以自主选择是否填写。
            </Text>
            <Text className='privacy-text'>
              3. <Text className='privacy-highlight'>位置信息</Text>：用于门店查询、预约量尺地址选择和施工地址定位。我们仅在您主动使用相关功能时获取。
            </Text>
            <Text className='privacy-text'>
              4. <Text className='privacy-highlight'>订单信息</Text>：包括产品选择、安装地址、施工进度等，用于完成订单服务。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>二、信息的使用目的</Text>
            <Text className='privacy-text'>
              我们收集您的信息仅用于以下目的：
            </Text>
            <Text className='privacy-text'>
              • 为您提供门窗产品的预约量尺、订单管理、安装施工等服务；
            </Text>
            <Text className='privacy-text'>
              • 向您推送订单状态更新和施工进度通知；
            </Text>
            <Text className='privacy-text'>
              • 为您生成和查询产品质保卡；
            </Text>
            <Text className='privacy-text'>
              • 改进我们的产品和服务质量，收集您的安装验收反馈。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>三、信息的存储与保护</Text>
            <Text className='privacy-text'>
              您的个人信息存储在中国境内的安全服务器上。我们采用数据加密、访问控制、安全审计等技术手段保护您的信息安全。未经您的明确授权，我们不会将您的个人信息提供给任何第三方，法律法规另有规定的除外。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>四、您的权利</Text>
            <Text className='privacy-text'>
              您有权随时查询、更正或删除您的个人信息。您可以通过小程序内的个人中心管理您的信息，或联系客服要求删除您的账户及关联数据。我们将在收到请求后15个工作日内处理。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>五、第三方服务</Text>
            <Text className='privacy-text'>
              我们的服务基于微信小程序平台运行，您使用本小程序时需同时遵守微信平台的隐私政策。我们使用微信支付、微信云开发等微信生态服务，相关数据处理受微信隐私保护协议约束。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>六、联系与反馈</Text>
            <Text className='privacy-text'>
              如您对本隐私政策有任何疑问或建议，请通过以下方式联系我们：
            </Text>
            <Text className='privacy-text privacy-highlight'>
              全国服务热线：400-888-1919
            </Text>
          </View>
        </View>

        <View className='safe-bottom' />
      </View>
    </ScrollView>
  );
}
