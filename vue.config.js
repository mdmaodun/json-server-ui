module.exports = {
  devServer: {
    port: 5000,
    before() {
      require('./server/index.js')();
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        pathRewrite: {
          '^/api': '',
        },
      },
    },
  },
  transpileDependencies: ['vuetify'],
};
