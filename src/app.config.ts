export default defineAppConfig({
  pages: [
    'pages/index/index',         // 首页
    'pages/products/index',      // 产品中心
    'pages/cases/index',         // 案例库
    'pages/stores/index',        // 门店列表
    'pages/profile/index',       // 个人中心
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
      ],
    },
    {
      root: 'subpackages/business',
      pages: [
        'workbench/index',        // 工作台
        'orders/index',           // 订单列表
        'order-manage/index',     // 订单管理/录入
        'admin/index',            // 管理员后台
      ],
    },
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#122b4d',
    navigationBarTitleText: '19分贝门窗',
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
      { pagePath: 'pages/cases/index', text: '案例' },
      { pagePath: 'pages/stores/index', text: '门店' },
      { pagePath: 'pages/profile/index', text: '我的' },
    ],
  },
});
