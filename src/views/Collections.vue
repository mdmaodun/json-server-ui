<template>
  <div class="collections">
    <v-card elevation="0" :loading="isLoading">
      <v-card-title>
        <v-icon color="black" class="mr-2">mdi-database</v-icon>

        <h2>{{ db.name }}</h2>

        <v-toolbar elevation="0" class="ml-10">
          <v-tooltip bottom>
            <template #activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on" @click="showAddCollectionDialog">
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
                <v-icon>mdi-stop-circle-outline</v-icon>
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
        <v-row>
          <v-col v-for="(v, i) in collections" :key="v.id" cols="3" class="float-left">
            <v-card :loading="curOperateId === v.id && isLoading" elevation="1">
              <v-toolbar elevation="1">
                <v-toolbar-title>
                  <v-icon class="mr-2">mdi-table</v-icon>
                  <span>{{ v.name }}</span>
                </v-toolbar-title>

                <v-spacer></v-spacer>

                <v-btn icon @click.stop="del(v, i)" :loading="curOperateId === v.id && isLoading">
                  <v-icon color="pink">mdi-delete</v-icon>
                </v-btn>
              </v-toolbar>

              <v-subheader>
                <span>{{ v.description || '暂无描述' }}</span>
              </v-subheader>
            </v-card>
          </v-col>
        </v-row>

        <v-card class="mt-4">
          <v-toolbar elevation="0">
            <v-toolbar-title>API 指南</v-toolbar-title>
            <v-subheader
              >占位符：{resource} - 集合名, {childResource} - 关联子集合名, {parentResource} - 关联父集合名, {dbName} -
              数据库名</v-subheader
            >
          </v-toolbar>
          <v-expansion-panels accordion>
            <v-expansion-panel>
              <v-expansion-panel-header>
                常规
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <pre style="background-color: #f6f8fa;">

    GET    /{resource}
    GET    /{resource}/:id
    POST   /{resource}
    PUT    /{resource}/:id
    PATCH  /{resource}/:id
    DELETE /{resource}/:id
                </pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                过滤（Filter）
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <pre style="background-color: #f6f8fa;">

    GET /{resource}?key1=value1&key2=value2
    GET /{resource}?id=1&id=2
    GET /{resource}?key.childKey=value
                </pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                分页（Paginate）
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <pre style="background-color: #f6f8fa;">

    GET /{resource}?_page=5&_limit=10
    GET /{resource}?_page=5
                </pre>
                <p class="font-italic mt-2">
                  默认返回 10 条
                </p>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                排序（Sort）
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <pre style="background-color: #f6f8fa;">

    GET /{resource}?_sort=key&_order=asc
    GET /{resource}/:id/{childResource}?_sort=key&_order=asc
    GET /{resource}?_sort=key1,key2&_order=desc,asc
                </pre>
                <p class="font-italic mt-2">
                  asc - 升序（默认）, desc - 降序
                </p>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                切片（Slice）
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <pre style="background-color: #f6f8fa;">

    GET /{resource}?_start=20&_end=30
    GET /{resource}/:id/{childResource}?_start=20&_end=30
    GET /{resource}/:id/{childResource}?_start=20&_limit=10
                </pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                操作符（Operators）
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <pre style="background-color: #f6f8fa;">

    GET /{resource}?key_gte=10&key_lte=20
    GET /{resource}?id_ne=1
    GET /{resource}?key_like=value （支持正则表达式）
                </pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                全文搜索（Full-text search）
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <pre style="background-color: #f6f8fa;">

    GET /{resource}?q=value
                </pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                关联查询（Relationships）
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <pre style="background-color: #f6f8fa;">

    GET /{resource}?_embed={childResource}
    GET /{resource}/1?_embed={childResource}
    GET /{resource}?_expand={parentResource}
    GET /{resource}/1?_expand={parentResource}
                </pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                所有数据（All Data）
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <pre style="background-color: #f6f8fa;">
    
    GET /{resource}/db
                </pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
            <v-expansion-panel>
              <v-expansion-panel-header>
                路由映射（Routes Map）
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <span class="d-block my-2"
                  >在
                  <span style="background-color: #f6f8fa;">/dbs/{dbName}/routes-map.json</span>
                  文件中配置，以下为参考：</span
                >
                <pre style="background-color: #f6f8fa;">

    {
      "/users/lastname/:lastname": "/users?name_like=^:lastname",
      "/users/minage/:minage": "/users?age_gte=:minage",
      "/users/lastname/:name/minage/:age": "/users?name_like=^:name&age_gte=:age",

      "/api/*": "/$1",
      "/:resource/:id/show": "/:resource/:id",
      "/posts/:category": "/posts?category=:category",
      "/articles\\?id=:id": "/posts/:id"
    }
                </pre>
                <span class="d-block my-2">现在，你就可以这样访问：</span>
                <pre style="background-color: #f6f8fa;">
    
    # 获取姓张的所有用户
    /users/lastname/张 # → /users?name_like=^张

    # 获取大于等于18岁的所有用户
    /users/minage/18 # → /users?age_gte=18

    # 获取姓张并且大于等于18岁的所有用户
    /users/lastname/张/minage/18 # → /users?name_like=^张&age_gte=18

    /api/posts # → /posts
    /api/posts/1  # → /posts/1
    /posts/1/show # → /posts/1
    /posts/javascript # → /posts?category=javascript
    /articles?id=1 # → /posts/1
                </pre>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </v-expansion-panels>
        </v-card>
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
              (v) => (v && v.trim().length > 0) || '英雄，这个必须要填哦~',
              (v) => (v && /^[a-zA-Z_]/.test(v.trim())) || '英雄，请用字母或下划线开头哦~',
              (v) => (v && v.trim().length >= 2) || '英雄，最少两个字符哦~',
              (v) => (v && /^[a-zA-Z_]\w+$/.test(v.trim())) || '英雄，只能由字母、数字、下划线组成哦~',
              (v) => (v && !collections.some((c) => c.name === v.trim())) || '英雄，这个集合已经存在了哦~',
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

    <v-snackbar v-model="snackbar.visible" top timeout="2000">
      {{ snackbar.text }}
      <template #action="{ attrs }">
        <v-btn icon v-bind="attrs" @click="snackbar.visible = false">
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
      curOperateId: 0,
      isLoadingOfServer: false,
      snackbar: {
        visible: false,
        text: '',
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
      if (this.isLoadingOfServer) return;
      if (this.collections.length === 0) {
        this.showSnackbar({ text: '英雄, 你还没有创建集合哦~' });
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
          this.showSnackbar({ text: '英雄! 这个端口被占用了哦! 😮 换个试试~' });
        })
        .finally(() => {
          this.isLoadingOfServer = false;
        });
    },
    del(collection, i) {
      if (this.isLoading) return;
      this.curOperateId = collection.id;
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
          this.curOperateId = 0;
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
          .then((res) => new Promise((resolve) => setTimeout(() => resolve(res), 300)))
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
