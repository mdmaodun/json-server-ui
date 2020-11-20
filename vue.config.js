module.exports = {
  devServer: {
    port: 8000,
    before() {
      require('./server/index.js')();
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
  transpileDependencies: ['vuetify'],
};
