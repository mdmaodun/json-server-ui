import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    dbs: [],
    overlay: false,
  },
  mutations: {
    showOverlay(state) {
      state.overlay = true;
    },
    hideOverlay(state) {
      state.overlay = false;
    },
    setDBs(state, dbs) {
      state.dbs = dbs;
    },
    addDB(state, db) {
      state.dbs.push(db);
    },
    delDB(state, id) {
      state.dbs = state.dbs.filter((v) => v.id !== id);
    },
    patchDB(state, db) {
      Object.assign(
        state.dbs.find((v) => v.id === db.id),
        db
      );
    },
  },
});

export default store;
