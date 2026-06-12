import { View, Text, ScrollView } from '@tarojs/components';
import './index.scss';

export default function Privacy() {
  return (
    <ScrollView className='privacy-page' scrollY>
      <View className='privacy-content'>
        <View className='privacy-card'>
          <Text className='privacy-title'>隐私政策</Text>
          <Text className='privacy-date'>更新日期：2026年6月10日</Text>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>引言</Text>
            <Text className='privacy-text'>
              SOJOY 19分贝门窗（以下简称"我们"）深知个人信息对您的重要性，我们将按照法律法规要求，采取严格的安全保护措施，尽力保护您的个人信息安全。本隐私政策旨在向您说明我们如何收集、使用、存储和保护您的个人信息，以及您所享有的权利。
            </Text>
            <Text className='privacy-text'>
              请您在使用我们的服务前，仔细阅读并充分理解本隐私政策。您点击同意即表示您已充分理解并接受本政策的全部内容。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>一、我们收集的信息</Text>
            <Text className='privacy-text'>
              在您使用我们的服务时，根据不同的业务场景，我们可能会收集以下类型的个人信息：
            </Text>
            <Text className='privacy-text'>
              1. <Text className='privacy-highlight'>手机号码</Text>：用于账号注册登录、订单联系、预约量尺和身份验证。在客户端登录时通过微信手机号授权获取，在安装工登录和管理员登录时由用户主动填写。
            </Text>
            <Text className='privacy-text'>
              2. <Text className='privacy-highlight'>微信头像与昵称</Text>：仅用于个人中心页面展示，您在注册时可自主选择填写。
            </Text>
            <Text className='privacy-text'>
              3. <Text className='privacy-highlight'>位置信息（模糊位置）</Text>：用于展示您附近的安装案例和工地位置。我们通过微信提供的模糊地理位置接口获取大致位置，不会获取您的精确坐标。仅在您查看"附近工地"或使用工地地图时触发。
            </Text>
            <Text className='privacy-text'>
              4. <Text className='privacy-highlight'>位置信息（地址选择）</Text>：用于门店入驻时的门店地址填写、订单管理时的安装地址填写。您通过微信地图选点功能主动选择地址。
            </Text>
            <Text className='privacy-text'>
              5. <Text className='privacy-highlight'>姓名/联系人姓名</Text>：用于预约量尺时确认联系人身份、门店入驻时登记联系人、订单录入时记录客户姓名。
            </Text>
            <Text className='privacy-text'>
              6. <Text className='privacy-highlight'>照片/图片</Text>：用于以下业务场景——门店入驻时上传营业执照、订单管理时上传设计图纸、安装工量尺记录和施工进度拍照、门店封面和资质图片上传、全国案例封面图片上传。上述图片均通过您的相册选择或现场拍摄获取。
            </Text>
            <Text className='privacy-text'>
              7. <Text className='privacy-highlight'>视频</Text>：仅限系统管理员在后台上传产品说明视频，用于公司简介页展示。不涉及普通用户的视频信息。
            </Text>
            <Text className='privacy-text'>
              8. <Text className='privacy-highlight'>订单信息</Text>：包括所选产品、安装地址、施工进度、订单金额、验收评价等，用于完成从预约量尺到安装验收的完整服务流程。
            </Text>
            <Text className='privacy-text'>
              9. <Text className='privacy-highlight'>管理员账号信息</Text>：系统管理员使用用户名和密码登录后台管理系统，用于门店管理、订单处理、案例审核等运营功能。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>二、信息的使用目的</Text>
            <Text className='privacy-text'>
              我们收集和使用您的个人信息，仅限于实现以下业务功能：
            </Text>
            <Text className='privacy-text'>
              • 用户注册与登录：使用手机号码、微信头像和昵称完成账户创建和身份认证；
            </Text>
            <Text className='privacy-text'>
              • 预约量尺服务：收集联系人姓名、联系电话和安装地址，安排上门量尺；
            </Text>
            <Text className='privacy-text'>
              • 订单管理与追踪：记录订单信息、上传设计图纸、更新安装施工进度、查询产品质保卡；
            </Text>
            <Text className='privacy-text'>
              • 门店入驻与查询：收集门店信息及营业执照用于入驻审核，展示附近门店位置；
            </Text>
            <Text className='privacy-text'>
              • 案例展示：上传和展示全国安装案例，使用位置信息推荐附近案例；
            </Text>
            <Text className='privacy-text'>
              • 安装验收：收集安装完成后的验收评分和反馈意见，改进服务质量；
            </Text>
            <Text className='privacy-text'>
              • 后台运营管理：管理员通过账号密码登录，进行门店审核、订单处理、视频管理等运营操作。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>三、信息的存储与保护</Text>
            <Text className='privacy-text'>
              您的个人信息存储在中国境内的安全云服务器上。我们采用数据加密传输（HTTPS）、数据库访问控制、云存储权限管理等技术手段保护您的信息安全。图片和视频文件存储于微信云开发环境，受微信平台安全体系保护。未经您的明确授权，我们不会将您的个人信息提供给任何第三方，法律法规另有规定的除外。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>四、您的权利</Text>
            <Text className='privacy-text'>
              根据相关法律法规，您享有以下权利：
            </Text>
            <Text className='privacy-text'>
              • 查阅权：您可以在小程序个人中心查看您的账户信息、订单记录和质保卡；
            </Text>
            <Text className='privacy-text'>
              • 更正权：您可以随时修改您的头像、昵称等个人信息；
            </Text>
            <Text className='privacy-text'>
              • 删除权：您可以通过联系客服要求删除您的账户及关联的所有数据，我们将在收到请求后15个工作日内处理；
            </Text>
            <Text className='privacy-text'>
              • 撤回同意：您可以在微信小程序的设置中撤回已授权的信息收集权限。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>五、第三方服务</Text>
            <Text className='privacy-text'>
              我们的服务基于微信小程序平台运行，使用微信提供的登录授权、地图选点、云存储、云开发等基础服务。您使用本小程序时需同时遵守微信平台的隐私政策。相关数据处理受微信隐私保护协议约束，我们不会将您的数据共享给上述约定之外的第三方。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>六、未成年人保护</Text>
            <Text className='privacy-text'>
              我们的服务主要面向成年人。如果您是未满14周岁的未成年人，请在监护人陪同下使用本服务，并由监护人代为提供必要信息。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>七、政策更新</Text>
            <Text className='privacy-text'>
              我们可能会根据业务发展或法律法规变化适时更新本隐私政策。更新后的政策将在小程序内公示，并于发布之日生效。
            </Text>
          </View>

          <View className='privacy-section'>
            <Text className='privacy-section-title'>八、联系与反馈</Text>
            <Text className='privacy-text'>
              如您对本隐私政策有任何疑问、意见或投诉，请通过以下方式联系我们：
            </Text>
            <Text className='privacy-text privacy-highlight'>
              公司名称：北京十九分贝门窗有限公司
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
