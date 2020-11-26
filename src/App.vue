<template>
  <v-app>
    <v-navigation-drawer app>
      <!-- <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            数据库列表
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item> -->

      <v-list nav>
        <v-skeleton-loader v-show="!isShowDBList" type="text@3"></v-skeleton-loader>
        <p class="text--secondary" v-show="isShowDBList && dbs.length === 0">
          暂无数据库
        </p>
        <v-hover v-for="(db, i) in dbs" :key="db.id">
          <template #default="{ hover }">
            <v-list-item link @click="onDBClick(db)" :class="{ 'elevation-1': $route.params.dbId == db.id || hover }">
              <v-list-item-content>
                <v-list-item-title>
                  <v-icon
                    large
                    class="mr-2 text--grey"
                    :class="{ 'text--primary': $route.params.dbId == db.id || hover }"
                    >mdi-database</v-icon
                  >
                  <span class="mr-2 grey--text" :class="{ 'text--darken-4': $route.params.dbId == db.id || hover }">{{
                    db.name
                  }}</span>
                </v-list-item-title>
                <!-- <v-progress-linear
                  v-show="db.status === 'running'"
                  color="primary"
                  buffer-value="0"
                  stream
                  reverse
                ></v-progress-linear> -->
                <v-progress-linear
                  rounded
                  indeterminate
                  v-show="db.status === 'running'"
                  color="primary"
                ></v-progress-linear>
              </v-list-item-content>
              <v-btn
                icon
                v-show="db.status !== 'running' && hover"
                @click.stop="del(db, i)"
                :loading="isLoadingOfDelDB && curOperationDBId === db.id"
              >
                <v-icon color="pink">mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
          </template>
        </v-hover>
        <v-btn block text @click="showCreateDBDialog" height="40" elevation="0" class="mt-6">
          <v-icon class="mr-2">mdi-database-plus</v-icon>
          <span>创建数据库</span>
        </v-btn>

        <v-btn block text @click="goAPIGuidePage" height="40" elevation="0" class="mt-2">
          <v-icon class="mr-2">mdi-book-open-variant</v-icon>
          <span>API 指南</span>
        </v-btn>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-hover #default="{ hover }">
        <div class="d-flex align-center">
          <v-img
            alt="JSON-SERVER-UI logo"
            class="shrink mr-2"
            :class="hover ? 'rotate_360' : ''"
            contain
            src="../src/assets/logo.svg"
            transition="scale-transition"
            width="40"
          />
          <!-- <div class="d-flex flex-column justify-center">
          <v-toolbar-title>JSON-SERVER-UI</v-toolbar-title>
          <v-subheader class="d-inline pa-0" style="height: unset;">这是一个次奥🐓简单的 json-server 图形化管理界面！🙂</v-subheader>
        </div> -->
          <v-toolbar-title>JSON-SERVER-UI</v-toolbar-title>
        </div>
      </v-hover>
      <v-subheader>这是一个次奥🐓简单的 JSON-SERVER 图形化管理界面！🙂</v-subheader>

      <v-spacer></v-spacer>

      <v-btn href="https://github.com/typicode/json-server" target="_blank" text>
        <span class="mr-2">json-server</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>

      <v-btn href="https://github.com/typicode/lowdb" target="_blank" text>
        <span class="mr-2">lowdb</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>

      <v-btn href="https://github.com/mdmaodun/json-server-ui" target="_blank" text>
        <v-icon>mdi-github</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer padless>
      <v-col class="text-center" cols="12"> © {{ new Date().getFullYear() }} — <strong>JSON-SERVER-UI</strong> </v-col>
    </v-footer>
    <v-dialog v-model="createDBDialog.visible" max-width="500px">
      <v-card>
        <v-card-title>
          创建数据库
        </v-card-title>

        <v-card-text>
          <v-text-field
            ref="dbNameFieldRef"
            label="名称"
            autofocus
            clearable
            v-model.trim="createDBDialog.form.data.name"
            :rules="[
              (v) => (!!v && v.trim() !== '') || '英雄，这个必须要填哦~',
              (v) => !dbs.some((db) => db.name === v) || '英雄，这个数据库已经存在了哦~',
            ]"
            @keyup.enter="onSubmitOfCreateDBDialog"
            :loading="isLoadingOfCreateDB"
            :disabled="isLoadingOfCreateDB"
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text color="primary" @click="onSubmitOfCreateDBDialog" :loading="isLoadingOfCreateDB">
            提交（ENTER）
          </v-btn>

          <v-btn text color="grey" @click="hideOfCreateDBDialog">
            关闭（ESC）
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <confirm-dialog ref="confirmDialog"></confirm-dialog>
  </v-app>
</template>

<script>
import { mapState } from 'vuex';
import ConfirmDialog from './components/ConfirmDialog';

export default {
  name: 'App',

  components: {
    ConfirmDialog,
  },

  data: () => ({
    curOperationDBId: 0,
    isLoadingOfDelDB: false,
    isLoadingOfCreateDB: false,
    isShowDBList: false,
    // dbs: [],
    createDBDialog: {
      visible: false,
      form: {
        data: {
          name: '',
        },
      },
    },
  }),

  computed: {
    ...mapState(['dbs']),
    confirmDialog() {
      return this.$refs.confirmDialog;
    },
  },

  created() {
    this.$request({
      method: 'GET',
      url: '/dbs',
    }).then((res) => {
      // this.dbs = res.data;
      this.$store.commit('setDBs', res.data);
      this.$nextTick(() => {
        this.isShowDBList = true;
      });
    });
  },

  methods: {
    goAPIGuidePage() {
      if (this.$route.path !== '/') {
        this.$router.push('/');
      }
    },
    onDBClick(db) {
      if (this.$route.params.dbId != db.id) {
        this.$router.push(`/collections/${db.id}`);
      }
    },
    del(db, i) {
      if (this.isLoadingOfDelDB) return;
      this.confirmDialog.show({
        title: '你确定要删除吗？',
        text: `删除 "${db.name}" 库后数据不可恢复哦！`,
        cb: () => {
          this.confirmDialog.loading();
          this.curOperationDBId = db.id;
          this.isLoadingOfDelDB = true;
          this.$request({
            method: 'DELETE',
            url: `/dbs/${db.id}`,
          })
            .then(() => Promise.delayResolve(300))
            .then(() => {
              this.confirmDialog.hide();
              // this.dbs.splice(i, 1);
              this.$store.commit('delDB', db.id);
              if (db.id == this.$route.params.dbId) {
                if (this.dbs.length === 0) {
                  this.$router.push('/');
                } else {
                  this.$router.push(`/collections/${this.dbs[0].id}`);
                }
              }
            })
            .finally(() => {
              this.isLoadingOfDelDB = false;
              this.curOperationDBId = 0;
              this.confirmDialog.unloading();
            });
        },
      });
    },
    showCreateDBDialog() {
      // this.isLoadingOfCreateDB = false;
      this.createDBDialog.visible = true;
    },
    hideOfCreateDBDialog() {
      this.createDBDialog.visible = false;
    },
    onSubmitOfCreateDBDialog() {
      if (this.isLoadingOfCreateDB) return;
      if (this.$refs.dbNameFieldRef.validate(true)) {
        this.isLoadingOfCreateDB = true;

        Promise.delayResolve(300)
          .then(() => {
            return this.$request({
              method: 'POST',
              url: '/dbs',
              data: this.createDBDialog.form.data,
            });
          })
          .then((res) => {
            // this.dbs.push(res.data);
            this.$store.commit('addDB', res.data);
            // this.createDBDialog.form.data.name = '';
            this.hideOfCreateDBDialog();
            setTimeout(() => {
              this.$refs.dbNameFieldRef.reset();
            }, 0);
            // if (this.dbs.length === 1 || !this.$route.path.startsWith('/collections/')) {
            this.$router.push(`/collections/${res.data.id}`);
            // }
          })
          .finally(() => {
            this.isLoadingOfCreateDB = false;
          });
      }
    },
  },
};
</script>

<style scoped>
.rotate_360 {
  transition: transform 1s;
  transform: rotate(360deg);
}

@keyframes rotate_y {
  0% {
    transform: rotateY(0);
  }
  100% {
    transform: rotateY(360deg);
  }
}

.rotate_y_infinite {
  animation: rotate_y 2s linear infinite;
}
</style>
