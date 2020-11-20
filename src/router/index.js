import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import(/* webpackChunkName: "Welcome" */ '../views/Welcome.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
