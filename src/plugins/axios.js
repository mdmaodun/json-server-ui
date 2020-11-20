import axios from 'axios';
import Vue from 'vue';

const request = axios.create({
  baseURL: '/api',
});

Vue.prototype.$request = request;
