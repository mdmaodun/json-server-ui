<template>
  <div class="collections">
    <v-card elevation="0" :loading="isLoading">
      <v-card-title>
        <h2>{{ db.name }}</h2>

        <v-toolbar elevation="0" class="ml-10">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" @click="showAddCollectionDialog">
                <v-icon>mdi-plus</v-icon>
              </v-btn>
            </template>
            <span>添加集合</span>
          </v-tooltip>

          <v-divider vertical inset class="mx-4"></v-divider>

          <v-col cols="1">
            <v-text-field
              ref="portTextFieldRef"
              :disabled="db.status === 'running'"
              label="端口:"
              class="mt-5"
              v-model="db.port"
              :rules="[
                (v) => {
                  if (v === '') return true;
                  if (!/^\d+$/.test(v)) {
                    return '只能是数字';
                  }
                  v = parseInt(v);
                  if (v < 3000 || v > 65535) {
                    return '3000 ~ 65535';
                  }
                  return true;
                },
              ]"
            ></v-text-field>
          </v-col>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
                @click="runServer"
                v-show="db.status === 'stopped'"
                :loading="isLoadingOfServer"
              >
                <v-icon>mdi-rocket-launch-outline</v-icon>
              </v-btn>
            </template>
            <span>启动服务</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
                @click="stopServer"
                v-show="db.status === 'running'"
                :loading="isLoadingOfServer"
              >
                <v-icon>mdi-stop</v-icon>
              </v-btn>
            </template>
            <span>停止服务</span>
          </v-tooltip>
        </v-toolbar>
      </v-card-title>
      <v-card-text>
        <p class="text--secondary" v-show="!isLoading && collections.length === 0">
          暂无集合
        </p>
        <v-list dense>
          <v-list-item-group>
            <v-row>
              <v-col v-for="(v, i) in collections" :key="v.id" cols="3">
                <v-hover>
                  <template #default="{ hover }">
                    <v-list-item>
                      <v-list-item-content>
                        <v-list-item-title>{{ v.name }}</v-list-item-title>
                        <v-list-item-subtitle>{{ v.description }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-icon v-show="hover" @click.stop="del(v, i)">
                        <v-icon>mdi-delete</v-icon>
                      </v-list-item-icon>
                    </v-list-item>
                  </template>
                </v-hover>
              </v-col>
              <!-- <v-col cols="3">
                <v-btn block @click="showAddCollectionDialog" height="40" elevation="0" class="justify-start">
                  <v-icon>mdi-plus</v-icon>
                  <span>添加集合</span>
                </v-btn>
              </v-col> -->
            </v-row>
          </v-list-item-group>
        </v-list>
      </v-card-text>
    </v-card>

    <v-dialog v-model="addCollectionDialog.visible" max-width="500px">
      <v-card>
        <v-card-title>
          添加集合
        </v-card-title>

        <v-card-text>
          <v-text-field
            ref="collectionNameFieldRef"
            label="名称"
            autofocus
            clearable
            v-model="addCollectionDialog.form.data.name"
            :rules="[rules.required, (v) => !collections.some((c) => c.name === v) || '英雄，这个集合已经存在了哦~']"
            @keyup.enter="onSubmitOfCollectionDialog"
            :loading="isLoadingOfAddCollection"
            :disabled="isLoadingOfAddCollection"
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text color="primary" @click="onSubmitOfCollectionDialog" :loading="isLoadingOfAddCollection">
            提交（ENTER）
          </v-btn>
          <v-btn text color="grey" @click="hideOfAddCollectionDialog">
            关闭（ESC）
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.visible" centered timeout="3000">
      {{ snackbar.text }}
      <template #action="{ attrs }">
        <v-btn color="pink" icon v-bind="attrs" @click="snackbar.visible = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: 'Collections',
  props: {
    dbId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      isLoadingOfServer: false,
      snackbar: {
        visible: false,
        text: '',
      },
      isLoading: true,
      isLoadingOfAddCollection: false,
      rules: {
        required: (v) => !!v || '英雄，这个必须要填哦~',
      },
      addCollectionDialog: {
        visible: false,
        form: {
          data: {
            name: '',
          },
        },
      },
      db: {},
      collections: [],
    };
  },
  watch: {
    dbId: {
      immediate: true,
      handler() {
        this.isLoading = true;
        this.$request({
          method: 'GET',
          url: `/dbs/${this.dbId}`,
        })
          .then((res) => {
            this.db = res.data;
            return this.$request({
              method: 'GET',
              url: `/collections?dbId=${this.dbId}`,
            });
          })
          .then((res) => {
            this.collections = res.data;
          })
          .then(() => {
            this.isLoading = false;
          })
          .catch(() => {
            this.$router.push('/');
          });
      },
    },
  },
  methods: {
    showSnackbar({ text }) {
      this.snackbar.text = text;
      this.snackbar.visible = true;
    },
    stopServer() {
      this.isLoadingOfServer = true;
      this.$request({
        method: 'POST',
        url: '/stopServer',
        data: {
          dbId: this.dbId,
        },
      })
        .then(() => new Promise((resolve) => setTimeout(resolve, 300)))
        .then(() => {
          this.db.status = 'stopped';
        })
        .finally(() => {
          this.showSnackbar({ text: '已停止' });
          this.isLoadingOfServer = false;
        });
    },
    runServer() {
      if (this.collections.length === 0) {
        this.showSnackbar({ text: '英雄，你还没有创建集合哦~' });
        return;
      }
      if (!this.db.port) {
        this.showSnackbar({ text: '英雄，请先设置一个端口号吧！要未占用的哟~😁' });
        return;
      }
      if (!this.$refs.portTextFieldRef.validate(true)) {
        return;
      }
      this.isLoadingOfServer = true;
      this.$request({
        method: 'POST',
        url: '/runServer',
        data: {
          dbId: this.dbId,
          port: this.db.port,
        },
      })
        .then(() => new Promise((resolve) => setTimeout(resolve, 300)))
        .then(() => {
          this.db.status = 'running';
          this.showSnackbar({ text: '已启动' });
        })
        .catch((err) => {
          this.showSnackbar({ text: '英雄！这个端口被占用了哦！😮换个试试~' });
        })
        .finally(() => {
          this.isLoadingOfServer = false;
        });
    },
    del(collection, i) {
      if (this.isLoading) return;
      this.isLoading = true;
      this.$request({
        method: 'DELETE',
        url: `/collections/${collection.id}`,
      })
        .then(() => {
          return new Promise((resolve) => setTimeout(resolve, 300));
        })
        .then(() => {
          this.collections.splice(i, 1);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    onSubmitOfCollectionDialog() {
      if (this.$refs.collectionNameFieldRef.validate(true)) {
        this.isLoadingOfAddCollection = true;
        this.$request({
          method: 'POST',
          url: '/collections',
          data: { ...this.addCollectionDialog.form.data, dbId: parseInt(this.dbId) },
        })
          .then((res) => {
            this.collections.push(res.data);
            this.addCollectionDialog.form.data.name = '';
            this.$refs.collectionNameFieldRef.reset();
            return new Promise((resolve) => setTimeout(resolve, 300));
          })
          .finally(() => {
            this.isLoadingOfAddCollection = false;
          });
      }
    },
    showAddCollectionDialog() {
      this.addCollectionDialog.visible = true;
    },
    hideOfAddCollectionDialog() {
      this.addCollectionDialog.visible = false;
    },
  },
};
</script>
