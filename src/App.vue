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
            <v-list-item link @click="onDBClick(db)">
              <v-list-item-content>
                <v-list-item-title>
                  <v-icon class="mr-2">mdi-database</v-icon>
                  <span>{{ db.name }}</span>
                </v-list-item-title>
              </v-list-item-content>
              <v-btn
                icon
                v-show="hover"
                @click.stop="del(db, i)"
                :loading="isLoadingOfDelDB && curOperationDBId === db.id"
              >
                <v-icon color="pink">mdi-delete</v-icon>
              </v-btn>
            </v-list-item>
          </template>
        </v-hover>
        <v-btn block @click="showCreateDBDialog" height="40" elevation="0" class="mt-6">
          <v-icon class="mr-2">mdi-database-plus</v-icon>
          <span>创建数据库</span>
        </v-btn>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <div class="d-flex align-center">
        <v-img
          alt="json-server-ui logo"
          class="shrink mr-2"
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
        <v-subheader>这是一个次奥🐓简单的 json-server 图形化管理界面！🙂</v-subheader>
      </div>

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
      <v-col class="text-center" cols="12"> © {{ new Date().getFullYear() }} — <strong>json-server-ui</strong> </v-col>
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
  </v-app>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      curOperationDBId: 0,
      isLoadingOfDelDB: false,
      isLoadingOfCreateDB: false,
      isShowDBList: false,
      dbs: [],
      createDBDialog: {
        visible: false,
        form: {
          data: {
            name: '',
          },
        },
      },
    };
  },

  created() {
    this.$request({
      method: 'GET',
      url: '/dbs',
    }).then((res) => {
      this.dbs = res.data;
      this.$nextTick(() => {
        this.isShowDBList = true;
      });
    });
  },
  methods: {
    onDBClick(db) {
      if (this.$route.params.dbId != db.id) {
        this.$router.push(`/collections/${db.id}`);
      }
    },
    del(db, i) {
      if (this.isLoadingOfDelDB) return;
      this.curOperationDBId = db.id;
      this.isLoadingOfDelDB = true;
      this.$request({
        method: 'DELETE',
        url: `/dbs/${db.id}`,
      })
        .then(() => Promise.delayResolve(300))
        .then(() => {
          this.dbs.splice(i, 1);
          if (db.id == this.$route.params.dbId) {
            this.$router.push('/');
          }
        })
        .finally(() => {
          this.isLoadingOfDelDB = false;
          this.curOperationDBId = 0;
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
      if (this.$refs.dbNameFieldRef.validate(true)) {
        this.isLoadingOfCreateDB = true;
        this.$request({
          method: 'POST',
          url: '/dbs',
          data: this.createDBDialog.form.data,
        })
          .then((res) => Promise.delayResolve(300, res))
          .then((res) => {
            this.dbs.push(res.data);
            // this.createDBDialog.form.data.name = '';
            this.hideOfCreateDBDialog();
            setTimeout(() => {
              this.$refs.dbNameFieldRef.reset();
            }, 0);
          })
          .finally(() => {
            this.isLoadingOfCreateDB = false;
          });
      }
    },
  },
};
</script>
