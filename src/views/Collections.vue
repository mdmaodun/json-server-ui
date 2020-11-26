<template>
  <div class="collections">
    <v-card elevation="0" :loading="isLoading">
      <v-card-title>
        <v-icon large color="black" class="mr-2">mdi-database</v-icon>

        <h2>{{ db.name }}</h2>

        <v-toolbar elevation="0" class="ml-10">
          <v-tooltip bottom>
            <template #activator="{ on, attrs, value }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
                @click="showAddCollectionDialog"
                :class="value ? 'text--primary' : 'text-secondary'"
              >
                <v-icon>mdi-table-plus</v-icon>
              </v-btn>
            </template>
            <span>添加集合</span>
          </v-tooltip>

          <v-divider vertical inset class="mx-4"></v-divider>

          <v-icon :color="db.status === 'running' ? 'primary' : ''">mdi-server</v-icon>
          <v-col cols="2">
            <v-text-field
              label="端口: "
              ref="portTextFieldRef"
              :disabled="db.status === 'running'"
              :loading="db.status === 'running'"
              class="mt-5"
              clearable
              @keyup.enter="runServer"
              :messages="db.status === 'running' ? '正在运行...' : ''"
              v-model="db.port"
              :rules="[
                (v) => {
                  if (!v) return true;
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
            <template #activator="{ on, attrs, value }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
                @click="runServer"
                v-show="db.status === 'stopped'"
                :loading="isLoadingOfServer"
                :class="value ? 'text--primary' : 'text-secondary'"
              >
                <v-icon>mdi-rocket-launch-outline</v-icon>
              </v-btn>
            </template>
            <span>启动服务</span>
          </v-tooltip>

          <v-tooltip bottom>
            <template #activator="{ on, attrs, value }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
                @click="stopServer"
                v-show="db.status === 'running'"
                :loading="isLoadingOfServer"
                :class="value ? 'text--primary' : 'text-secondary'"
              >
                <v-icon>mdi-stop-circle-outline</v-icon>
              </v-btn>
            </template>
            <span>停止服务</span>
          </v-tooltip>

          <v-divider v-show="db.status === 'running'" vertical inset class="mx-4"></v-divider>

          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn
                v-on="on"
                v-bind="attrs"
                v-show="db.status === 'running'"
                text
                color="teal"
                class="text-lowercase"
                :href="`http://localhost:${db.port}/db`"
                target="_blank"
              >
                <v-icon small class="mr-1">mdi-code-json</v-icon>
                <span>http://localhost:{{ db.port }}/db</span>
              </v-btn>
            </template>
            <span>获取所有 DB 数据</span>
          </v-tooltip>
        </v-toolbar>
      </v-card-title>
      <v-card-text>
        <p class="text--secondary" v-show="!isLoading && collections.length === 0">
          暂无集合
        </p>
        <v-row>
          <v-col v-for="(v, i) in collections" :key="v.id" cols="3" class="float-left">
            <v-hover>
              <template #default="{ hover }">
                <v-card :loading="curOperateId === v.id && isLoading" :elevation="hover ? '5' : '1'">
                  <v-toolbar elevation="1">
                    <v-toolbar-title>
                      <v-icon class="mr-2" :color="hover ? 'grey darken-4' : ''">mdi-table</v-icon>
                      <span :class="hover ? 'text-primary' : 'text--secondary'">{{ v.name }}</span>
                    </v-toolbar-title>

                    <v-spacer></v-spacer>

                    <v-btn v-show="hover" icon @click.stop="del(v, i)" :loading="curOperateId === v.id && isLoading">
                      <v-icon color="pink">mdi-delete</v-icon>
                    </v-btn>
                  </v-toolbar>

                  <v-subheader>
                    <span>{{ v.description || '暂无描述' }}</span>
                  </v-subheader>

                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        v-on="on"
                        v-bind="attrs"
                        v-show="db.status === 'running'"
                        text
                        block
                        color="teal"
                        class="text-lowercase justify-start"
                        :href="`http://localhost:${db.port}/${v.name}`"
                        target="_blank"
                      >
                        <v-icon small class="mr-1">mdi-code-json</v-icon>
                        <span class="body-2">http://localhost:{{ db.port }}/{{ v.name }}</span>
                      </v-btn>
                    </template>
                    <span>获取列表数据</span>
                  </v-tooltip>
                  <v-tooltip bottom>
                    <template #activator="{ on, attrs }">
                      <v-btn
                        v-on="on"
                        v-bind="attrs"
                        v-show="db.status === 'running'"
                        text
                        block
                        color="teal"
                        class="text-lowercase justify-start"
                        :href="`http://localhost:${db.port}/${v.name}/1`"
                        target="_blank"
                      >
                        <v-icon small class="mr-1">mdi-code-json</v-icon>
                        <span class="body-2">http://localhost:{{ db.port }}/{{ v.name }}/1</span>
                      </v-btn>
                    </template>
                    <span>获取 id 为 1 的数据</span>
                  </v-tooltip>
                </v-card>
              </template>
            </v-hover>
          </v-col>
        </v-row>
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
            v-model.trim="addCollectionDialog.form.data.name"
            :rules="[
              (v) => (v && v.trim().length > 0) || '英雄，这个必须要填哟~',
              (v) => (v && /^[a-zA-Z_]/.test(v.trim())) || '英雄，需要用 字母 或 下划线 开头哟~',
              (v) => (v && v.trim().length >= 2) || '英雄，最少 两个 字符哟~',
              (v) => (v && /^[a-zA-Z_]\w+$/.test(v.trim())) || '英雄，只能由字母、数字、下划线组成哟~',
              (v) => (v && /s$/.test(v.trim()) || '英雄，需要以小写 `s` 结尾哟~' ),
              (v) => (v && !collections.some((c) => c.name === v.trim())) || '英雄，这个集合已经存在了哟~',
            ]"
            @keyup.enter="onSubmitOfCollectionDialog"
            :loading="isLoadingOfAddCollection"
            :disabled="isLoadingOfAddCollection"
          ></v-text-field>

          <v-text-field
            label="描述"
            v-model.trim="addCollectionDialog.form.data.description"
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

    <v-snackbar v-model="snackbar.visible" top right :timeout="snackbar.timeout" shaped :color="snackbar.color">
      <v-icon v-show="snackbar.icon" class="mr-1 pb-1">{{ snackbar.icon }}</v-icon>
      <span class="">{{ snackbar.text }}</span>
      <!-- <template #action="{ attrs }">
        <v-btn icon v-bind="attrs" @click="snackbar.visible = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template> -->
    </v-snackbar>

    <confirm-dialog ref="confirmDialog"></confirm-dialog>
  </div>
</template>

<script>
import ConfirmDialog from '../components/ConfirmDialog';
export default {
  name: 'Collections',

  components: {
    ConfirmDialog,
  },

  props: {
    dbId: {
      type: Number,
      required: true,
    },
  },

  data: () => ({
    curOperateId: 0,
    isLoadingOfServer: false,
    snackbar: {
      visible: false,
      timeout: 2000,
      text: '',
      color: '',
    },
    isLoading: true,
    isLoadingOfAddCollection: false,
    addCollectionDialog: {
      visible: false,
      form: {
        data: {
          name: '',
          description: '',
        },
      },
    },
    db: {},
    collections: [],
  }),

  computed: {
    confirmDialog() {
      return this.$refs.confirmDialog;
    },
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
    onChangeOfSnackbar() {
      if (!this.snackbar.visible) {
        setTimeout(() => {
          this.snackbar.color = '';
          this.snackbar.icon = '';
        }, 100);
      }
    },
    showSnackbar({ text = '', color = '', icon = '' }) {
      this.snackbar.text = text;
      this.snackbar.color = color;
      this.snackbar.icon = icon;
      this.snackbar.visible = true;
    },
    stopServer() {
      if (this.isLoadingOfServer) return;
      this.isLoadingOfServer = true;
      Promise.delayResolve(500)
        .then(() => {
          return this.$request({
            method: 'POST',
            url: '/stopServer',
            data: {
              dbId: this.dbId,
            },
          });
        })
        .then(() => Promise.delayResolve(500))
        .then(() => {
          this.db.status = 'stopped';
          this.$store.commit('patchDB', { id: this.db.id, status: 'stopped' });
        })
        .finally(() => {
          this.showSnackbar({ text: '已停止', icon: 'mdi-stop' });
          this.isLoadingOfServer = false;
        });
    },
    runServer() {
      if (this.isLoadingOfServer) return;
      if (this.collections.length === 0) {
        this.showSnackbar({ text: '英雄, 你还没有创建集合哟~' });
        return;
      }
      if (!this.db.port) {
        this.showSnackbar({ text: '英雄, 先设置一个端口号哈~ 😁' });
        return;
      }
      if (!this.$refs.portTextFieldRef.validate(true)) {
        return;
      }
      this.isLoadingOfServer = true;

      Promise.delayResolve(500)
        .then(() => {
          return this.$request({
            method: 'POST',
            url: '/runServer',
            data: {
              dbId: this.dbId,
              port: this.db.port,
            },
          });
        })
        .then(() => Promise.delayResolve(500))
        .then(() => {
          this.db.status = 'running';
          this.$store.commit('patchDB', { id: this.db.id, port: this.db.port, status: 'running' });
          this.showSnackbar({ text: '启动成功', color: 'green', icon: 'mdi-fire' });
        })
        .catch((err) => {
          this.showSnackbar({ text: '英雄! 这个端口被占用了哟! 😮 换个试试~' });
        })
        .finally(() => {
          this.isLoadingOfServer = false;
        });
    },
    del(collection, i) {
      if (this.isLoading) return;
      this.confirmDialog.show({
        title: '你确定要删除吗？',
        text: `删除 "${collection.name}" 集合后数据不可恢复哟！`,
        cb: () => {
          this.confirmDialog.visible = false;
          this.curOperateId = collection.id;
          this.isLoading = true;

          Promise.delayResolve(300)
            .then(() => {
              return this.$request({
                method: 'DELETE',
                url: `/collections/${collection.id}`,
              });
            })
            .then(() => {
              this.collections.splice(i, 1);
            })
            .finally(() => {
              this.curOperateId = 0;
              this.isLoading = false;
            });
        },
      });
    },
    onSubmitOfCollectionDialog() {
      if (this.isLoadingOfAddCollection) return;
      if (this.$refs.collectionNameFieldRef.validate(true)) {
        this.isLoadingOfAddCollection = true;
        Promise.delayResolve(300)
          .then(() => {
            return this.$request({
              method: 'POST',
              url: '/collections',
              data: { ...this.addCollectionDialog.form.data, dbId: parseInt(this.dbId) },
            });
          })
          .then((res) => {
            this.collections.push(res.data);
            // this.addCollectionDialog.form.data.name = '';
            this.$refs.collectionNameFieldRef.reset();
            this.addCollectionDialog.form.data.description = '';
            setTimeout(() => {
              this.$refs.collectionNameFieldRef.$refs.input.focus();
            }, 0);
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
