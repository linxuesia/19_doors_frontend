export default {
  env: {
    NODE_ENV: '"production"',
  },
  defineConstants: {},
  mini: {
    // Taro 4 默认已启用压缩，避免重复配置导致过度优化
    // webpackChain(chain) {
    //   chain.optimization.minimize(true);
    // },
  },
  h5: {
    publicPath: '/',
  },
};
