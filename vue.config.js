module.exports = {
  devServer: {
    port: 6660,
    before() {
      require('./server/index.js')();
    },
    proxy: {
      '/api': {
        target: 'http://localhost:6661',
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
  transpileDependencies: ['vuetify'],
};
