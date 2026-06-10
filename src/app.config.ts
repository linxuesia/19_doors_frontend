export default defineAppConfig({
  pages: [
    'pages/index/index',         // 首页
    'pages/products/index',      // 产品中心
    'pages/cases/index',         // 案例·服务
    'pages/about/index',         // 公司简介
    'pages/profile/index',       // 个人中心
    'pages/stores/index',        // 门店列表
  ],
  subPackages: [
    {
      root: 'subpackages/client',
      pages: [
        'reservation/index',      // 预约量尺
        'order-detail/index',     // 订单详情
        'login/index',            // 登录/注册
        'case-detail/index',      // 案例详情
        'product-detail/index',   // 产品详情
        'store-detail/index',     // 门店详情
        'site-detail/index',      // 工地详情
        'store-apply/index',      // 门店入驻申请
        'warranty/index',         // 质保卡
        'my-orders/index',        // 我的订单列表
        'site-map/index',         // 全国工地地图全屏
        'inspection/index',       // 安装验收单
        'privacy/index',         // 隐私政策
      ],
    },
    {
      root: 'subpackages/business',
      pages: [
        'workbench/index',        // 工作台
        'orders/index',           // 订单列表
        'order-manage/index',     // 订单管理/录入
        'reservations/index',     // 预约管理
        'store-manage/index',     // 门店设置
        'clients/index',          // 客户档案
        'client-detail/index',    // 客户详情
        'admin/index',            // 管理员后台
        'admin-login/index',      // 管理员登录（扫码）
        'installer-login/index',  // 安装工登录
        'installer-orders/index', // 安装工-我的工单
        'installer-order-detail/index', // 安装工-工单详情
        'installer-profile/index', // 工人个人中心
        'staff-manage/index',     // 人员管理（老板）
        'case-manage/index',      // 案例库管理
        'case-edit/index',        // 案例编辑/新增
        'inspections/index',      // 客户验收反馈
      ],
    },
  ],
  permission: {
    'scope.userFuzzyLocation': {
      desc: '用于展示您附近的安装案例及工地位置',
    },
  },
  requiredPrivateInfos: ['getFuzzyLocation', 'chooseLocation'],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#122b4d',
    navigationBarTitleText: 'SOJOY 19分贝',
    navigationBarTextStyle: 'white',
  },
  tabBar: {
    custom: true,
    color: '#999999',
    selectedColor: '#122b4d',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/index/index', text: '首页' },
      { pagePath: 'pages/products/index', text: '产品' },
      { pagePath: 'pages/cases/index', text: '案例·服务' },
      { pagePath: 'pages/about/index', text: '公司简介' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
  __usePrivacyCheck__: true,
});
