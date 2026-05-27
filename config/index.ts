import { defineConfig, type UserConfigExport } from '@tarojs/cli';

export default defineConfig<'webpack5'>(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport = {
    projectName: 'sojoy-taro-app',
    date: '2026-5-20',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 2.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {},
    copy: {
      patterns: [
        { from: 'static/**/*', to: 'dist/static' },
      ],
      options: {},
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: { enable: false },
    mini: {
      compileMode: 'page',
      condition: {
        miniprogram: {
          list: [
            { name: '首页', pathName: 'pages/index/index', query: '' },
            { name: '产品中心', pathName: 'pages/products/index', query: '' },
            { name: '案例服务', pathName: 'pages/cases/index', query: '' },
            { name: '公司简介', pathName: 'pages/about/index', query: '' },
            { name: '我的', pathName: 'pages/profile/index', query: '' },
            { name: '预约量尺', pathName: 'subpackages/client/reservation/index', query: '' },
            { name: '订单详情', pathName: 'subpackages/client/order-detail/index', query: 'list=1' },
            { name: '登录注册', pathName: 'subpackages/client/login/index', query: '' },
            { name: '案例详情', pathName: 'subpackages/client/case-detail/index', query: 'id=1' },
            { name: '产品详情', pathName: 'subpackages/client/product-detail/index', query: 'id=1' },
            { name: '门店详情', pathName: 'subpackages/client/store-detail/index', query: 'id=1' },
            { name: '工地详情', pathName: 'subpackages/client/site-detail/index', query: 'id=1' },
            { name: '门店入驻申请', pathName: 'subpackages/client/store-apply/index', query: '' },
            { name: '员工认证申请', pathName: 'subpackages/client/staff-apply/index', query: '' },
            { name: '门店工作台', pathName: 'subpackages/business/workbench/index', query: '' },
            { name: '订单管理', pathName: 'subpackages/business/orders/index', query: '' },
            { name: '录入订单', pathName: 'subpackages/business/order-manage/index', query: '' },
            { name: '管理员后台', pathName: 'subpackages/business/admin/index', query: '' },
            { name: '管理员登录', pathName: 'subpackages/business/admin-login/index', query: '' },
          ],
        },
      },
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: { limit: 1024 },
        },
        cssModules: {
          enable: false,
          config: { namingPattern: 'module', generateScopedName: '[name]__[local]___[hash:base64:5]' },
        },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: { filename: 'js/[name].[hash:8].js', chunkFilename: 'js/[name].[chunkhash:8].js' },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css',
      },
      postcss: {
        autoprefixer: { enable: true, config: {} },
        cssModules: {
          enable: false,
          config: { namingPattern: 'module', generateScopedName: '[name]__[local]___[hash:base64:5]' },
        },
      },
      devServer: {
        port: 5173,
        proxy: {
          '/api': {
            target: 'http://localhost:3000',
            changeOrigin: true,
          },
        },
      },
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false,
        },
      },
    },
  };
  return baseConfig;
});
