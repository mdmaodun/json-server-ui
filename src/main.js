import Vue from 'vue';
import './plugins/promise-extensions';
import './plugins/axios';
import router from './router';
import vuetify from './plugins/vuetify';
import App from './App.vue';

Vue.config.productionTip = false;

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount('#app');
