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
        'staff-apply/index',      // 员工认证申请
        'warranty/index',         // 质保卡
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
        'admin/index',            // 管理员后台
        'admin-login/index',      // 管理员登录（扫码）
      ],
    },
  ],
  permission: {
    'scope.userLocation': {
      desc: '用于展示您附近的工地及门店位置、选择施工地址',
    },
  },
  requiredPrivateInfos: ['getLocation', 'chooseLocation'],
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
});
