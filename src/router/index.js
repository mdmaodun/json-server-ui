import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import(/* webpackChunkName: "Welcome" */ '../views/Welcome.vue'),
  },
  {
    path: '/collections/:dbId',
    name: 'Collections',
    props: (route) => ({ dbId: parseInt(route.params.dbId) }),
    component: () => import(/* webpackChunkName: "Collections" */ '../views/Collections.vue'),
  },
];

const router = new VueRouter({
  routes,
});

export default router;
