<template>
  <v-app>
    <v-navigation-drawer app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            数据库列表
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list dense nav>
        <v-skeleton-loader v-show="!isShowDBList" type="article"></v-skeleton-loader>
        <v-hover v-for="(db, i) in dbs" :key="db.id">
          <template #default="{ hover }">
            <v-list-item link @click="onDBClick(db)">
              <v-list-item-content>
                <v-list-item-title>{{ db.name }}</v-list-item-title>
              </v-list-item-content>
              <v-list-item-icon v-show="hover" @click.stop="del(db, i)">
                <v-icon>mdi-delete</v-icon>
              </v-list-item-icon>
            </v-list-item>
          </template>
        </v-hover>
      </v-list>

      <v-list-item>
        <v-list-item-content>
          <v-btn @click="showCreateDBDialog" elevation="0"> <v-icon>mdi-plus</v-icon>创建数据库</v-btn>
        </v-list-item-content>
      </v-list-item>
    </v-navigation-drawer>

    <v-app-bar app>
      <div class="d-flex align-center">
        <v-img
          alt="JSONDBAPI Logo"
          class="shrink mr-2"
          contain
          src="../src/assets/logo.svg"
          transition="scale-transition"
          width="40"
        />
        <v-toolbar-title>JSONDBAPI</v-toolbar-title>
      </div>

      <v-spacer></v-spacer>

      <v-btn href="https://gitee.com/mdmaodun" target="_blank" text>
        <span class="mr-2">Latest Release</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>

    <v-footer padless>
      <v-col class="text-center" cols="12"> {{ new Date().getFullYear() }} — <strong>JSONDBAPI</strong> </v-col>
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
            clearable
            v-model="createDBDialog.form.data.name"
            :rules="[rules.required, (v) => !dbs.some((db) => db.name === v) || '英雄，这个数据库已经存在了哦~']"
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text color="primary" @click="onSubmitOfCreateDBDialog">
            提交
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
      isShowDBList: false,
      rules: {
        required: (v) => !!v || '英雄，这个必须要填哦~',
      },
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
      this.$request({
        method: 'DELETE',
        url: `/dbs/${db.id}`,
      }).then(() => {
        this.dbs.splice(i, 1);
        if (db.id == this.$route.params.dbId) {
          this.$router.push('/');
        }
      });
    },
    showCreateDBDialog() {
      this.createDBDialog.visible = true;
    },
    onSubmitOfCreateDBDialog() {
      if (this.$refs.dbNameFieldRef.validate(true)) {
        this.$request({
          method: 'POST',
          url: '/dbs',
          data: this.createDBDialog.form.data,
        }).then((res) => {
          this.dbs.push(res.data);
          this.createDBDialog.form.data.name = '';
          this.createDBDialog.visible = false;
          this.$refs.dbNameFieldRef.reset();
        });
      }
    },
  },
};
</script>
