export default {
  env: {
    NODE_ENV: '"production"',
  },
  defineConstants: {},
  mini: {
    webpackChain(chain) {
      chain.optimization.minimize(true);
    },
  },
  h5: {
    publicPath: '/',
  },
};
