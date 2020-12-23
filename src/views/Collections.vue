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

          <v-tooltip bottom>
            <template #activator="{ on, attrs, value }">
              <v-btn
                icon
                v-bind="attrs"
                v-on="on"
                @click="showBatchImportDialog"
                :class="value ? 'text--primary' : 'text-secondary'"
              >
                <v-icon>mdi-database-import</v-icon>
              </v-btn>
            </template>
            <span>增量导入集合</span>
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
        <p class="font-italic pt-4 pl-1" v-show="db.status === 'running'">
          <span class="font-weight-bold black--text">提示：</span>
          <a href="#/" class="text-decoration-none">更多 API</a>
          调试可以使用
          <span class="font-weight-bold">Postman</span> 或者
          <span class="font-weight-bold">REST Client</span>
          哦~
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
                        class="text-lowercase justify-start text-truncate"
                        :href="`http://localhost:${db.port}/${v.name}`"
                        target="_blank"
                      >
                        <v-icon small class="mr-1">mdi-code-json</v-icon>
                        <span class="body-2">/{{ v.name }}</span>
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
                        class="text-lowercase justify-start text-truncate"
                        :href="`http://localhost:${db.port}/${v.name}/1`"
                        target="_blank"
                      >
                        <v-icon small class="mr-1">mdi-code-json</v-icon>
                        <span class="body-2">/{{ v.name }}/1</span>
                      </v-btn>
                    </template>
                    <span>获取 id 为 1 的数据</span>
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
                        class="text-lowercase justify-start text-truncate"
                        :href="`http://localhost:${db.port}/${v.name}?_page=1&_limit=20`"
                        target="_blank"
                      >
                        <v-icon small class="mr-1">mdi-code-json</v-icon>
                        <span class="body-2">/{{ v.name }}?_page=1&_limit=20</span>
                      </v-btn>
                    </template>
                    <span>分页查询</span>
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
                        class="text-lowercase justify-start text-truncate"
                        :href="`http://localhost:${db.port}/${v.name}?_sort=id&_order=desc`"
                        target="_blank"
                      >
                        <v-icon small class="mr-1">mdi-code-json</v-icon>
                        <span class="body-2">/{{ v.name }}?_sort=id&_order=desc</span>
                      </v-btn>
                    </template>
                    <span>排序</span>
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
              (v) => (v && /s$/.test(v.trim())) || '英雄，需要以小写 `s` 结尾哟~',
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

    <v-dialog v-model="batchImportDialog.visible" fullscreen hide-overlay transition="dialog-bottom-transition">
      <v-card>
        <v-toolbar dark color="primary">
          <v-btn icon dark @click="hideBatchImportDialog">
            <v-icon>mdi-close</v-icon>
          </v-btn>
          <v-toolbar-title>增量导入</v-toolbar-title>
          <v-subheader>已有的保留</v-subheader>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <!-- <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn v-on="on" v-bind="attrs" dark text @click="formatJSONStrOfBatchImport">
                  <v-icon>mdi-code-json</v-icon>
                </v-btn>
              </template>
              <span>格式化</span>
            </v-tooltip> -->
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn v-on="on" v-bind="attrs" dark text @click="batchImport" :loading="batchImportDialog.isLoading">
                  <v-icon>mdi-database-import</v-icon>
                </v-btn>
              </template>
              <span>导入</span>
            </v-tooltip>
            <v-divider vertical inset class="mx-6"></v-divider>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <div v-on="on" v-bind="attrs">
                  <v-checkbox
                    class="mt-5 mr-6"
                    v-model="batchImportDialog.useMock"
                    label="useMock"
                    @click="onClickOfUseMock"
                  ></v-checkbox>
                </div>
              </template>
              <span>使用 Mock.js 语法</span>
            </v-tooltip>
            <v-tooltip bottom>
              <template #activator="{ on, attrs }">
                <v-btn v-on="on" v-bind="attrs" href="http://mockjs.com" target="_blank" text>
                  <span class="mr-2">Mock.js</span>
                  <v-icon>mdi-open-in-new</v-icon>
                </v-btn>
              </template>
              <span>Mock.js 官网</span>
            </v-tooltip>
          </v-toolbar-items>
        </v-toolbar>

        <v-container fluid>
          <v-row>
            <v-col>
              <v-textarea
                ref="jsonStrOfBatchImportRef"
                autofocus
                counter
                outlined
                :readonly="batchImportDialog.isLoading"
                auto-grow
                @blur="formatJSONStrOfBatchImport"
                v-model.trim="batchImportDialog.form.data.jsonStr"
                placeholder='{ "users": [ { "id": 1, "name": "张三", ... }, {...}, ... ], "tasks": [...], ... }'
                :label="
                  batchImportDialog.useMock
                    ? '请在下方填入 Mock.js 模板语法（失去焦点自动格式化，并生成预览数据）'
                    : '请在下方填入 JSON 格式的数据（失去焦点自动格式化）'
                "
                :rules="batchImportDialog.form.rules"
              >
              </v-textarea>
              <pre style="background-color: #f6f8fa;" v-show="batchImportDialog.useMock">

    已扩展 Mock.Random 占位符：

    1. @phone()，手机号码
    2. @tel()，固定电话号码（国内）
    3. @date.now()，当前毫秒数
              </pre>
            </v-col>
            <v-col v-show="batchImportDialog.useMock" style="max-height: calc(100vh - 90px); overflow-y: auto;">
              <v-textarea
                auto-grow
                no-resize
                readonly
                outlined
                counter
                :value="jsonStrOfMock"
                label="Mock 数据预览"
              ></v-textarea>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
      <overlay :overlay="batchImportDialog.isLoading" text="正在导入中..."></overlay>
    </v-dialog>
  </div>
</template>

<script>
import { isPlainObject, isArray } from 'lodash';
import ConfirmDialog from '../components/ConfirmDialog';
import Overlay from '../components/Overlay';
import { mock, Random } from 'mockjs';

Random.extend({
  'date.now': () => Date.now(),
  phone: () => mock(/^1[35678]\d{9}$/),
  tel: () => mock(/^0\d{2,3}-[1-9]\d{6,7}$/),
});

export default {
  name: 'Collections',

  components: {
    ConfirmDialog,
    Overlay,
  },

  props: {
    dbId: {
      type: Number,
      required: true,
    },
  },

  data() {
    return {
      batchImportDialog: {
        useMock: false,
        visible: false,
        isLoading: false,
        form: {
          data: {
            jsonStr: '',
            jsonObjOfMock: null,
          },
          rules: [
            (v) => (v && v.trim() !== '') || '必填哟~',
            (v) => {
              try {
                const vTrimed = v.trim();
                // if (/^\[$/.test(v)) return '只能是对象~';
                if (!/^\{/.test(vTrimed)) return '请以 `{` 开头';
                if (!/\}$/.test(vTrimed)) return '格式错啦~';
                const jsonObj = eval('false || ' + vTrimed); // JSON.parse(v);
                const entries = Object.entries(jsonObj);
                if (entries.length === 0) return '最少包含一个键值对~';
                for (let [k, v] of entries) {
                  if (k.trim() === '') return '不能有包含 空字符串 的键名';
                  if (/\s/.test(k)) return `不能有包含 空字符串 的键名 -> \`${k}\``;
                  if (v === null) return '第一层的值不能为 `null`';
                  if (!isPlainObject(v) && !isArray(v)) return '第一层的值只能是 数组 或 对象';
                  if (isArray(v)) {
                    if (this.batchImportDialog.useMock) {
                      const [propName] = k.split('|');
                      k = propName;
                    }
                    if (k.length < 2) return `数组类型的数据 -> \`${k}\`, 键名长度必须大于 \`2个\` 字符`;
                    if (!k.endsWith('s')) return `数组类型的数据 -> \`${k}\`, 键名必须以 小写 \`s\` 结尾`;
                  }
                }
                return true;
              } catch (err) {
                return '格式错啦~';
              }
            },
          ],
        },
      },
      curOperateId: 0,
      isLoadingOfServer: false,
      snackbar: {
        visible: false,
        timeout: 2000,
        text: '',
        color: '',
      },
      isLoading: false,
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

  computed: {
    confirmDialog() {
      return this.$refs.confirmDialog;
    },
    jsonStrOfMock() {
      if (this.batchImportDialog.form.data.jsonObjOfMock) {
        return JSON.stringify(this.batchImportDialog.form.data.jsonObjOfMock, null, 2);
      }
      return '';
    },
  },

  watch: {
    dbId: {
      immediate: true,
      handler() {
        this.loadDB()
          .then(() => {
            return this.loadCollections();
          })
          .catch(() => {
            this.$router.push('/');
          });
      },
    },
  },

  methods: {
    onClickOfUseMock() {
      if (this.batchImportDialog.useMock) {
        this.formatJSONStrOfBatchImport();
      }
    },
    loadDB() {
      if (this.isLoading) return Promise.reject('isloading');
      this.isLoading = true;
      return this.$request({
        method: 'GET',
        url: `/dbs/${this.dbId}`,
      })
        .then((res) => {
          this.db = res.data;
        })
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    loadCollections() {
      if (this.isLoading) return Promise.reject('isloading');
      this.isLoading = true;
      return this.$request({
        method: 'GET',
        url: `/collections?dbId=${this.dbId}`,
      })
        .then((res) => {
          this.collections = res.data;
        })
        .catch((err) => {
          throw err;
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    batchImport() {
      if (this.batchImportDialog.isLoading) return;

      if (!this.$refs.jsonStrOfBatchImportRef.validate(true)) return;

      this.batchImportDialog.isLoading = true;

      Promise.delayResolve(500)
        .then(() => {
          let jsonObj = null;
          if (this.batchImportDialog.useMock) {
            jsonObj = this.batchImportDialog.form.data.jsonObjOfMock;
          } else {
            jsonObj = eval('false || ' + this.batchImportDialog.form.data.jsonStr);
          }
          return this.$request({
            method: 'POST',
            url: '/batchImport',
            data: {
              dbId: this.dbId,
              jsonObj, // : JSON.parse(this.batchImportDialog.form.data.jsonStr),
            },
          });
        })
        .then(() => Promise.delayResolve(1500))
        .then(() => {
          return this.loadCollections();
        })
        .then(() => {
          this.hideBatchImportDialog();
          this.showSnackbar({ text: '导入成功', color: 'green', icon: 'mdi-check-bold' });
          this.batchImportDialog.form.data.jsonObjOfMock = null;
          this.$refs.jsonStrOfBatchImportRef.reset();
        })
        .catch((err) => {
          this.showSnackbar({ text: `系统异常，请稍后重试`, color: 'pink', icon: 'mdi-emoticon-cry-outline' });
          throw err;
        })
        .finally(() => {
          this.batchImportDialog.isLoading = false;
        });
    },
    formatJSONStrOfBatchImport() {
      if (!this.$refs.jsonStrOfBatchImportRef.validate(true)) return;
      try {
        const jsonObj = eval('false || ' + this.batchImportDialog.form.data.jsonStr); // JSON.parse(this.batchImportDialog.form.data.jsonStr);

        this.batchImportDialog.form.data.jsonStr = JSON.stringify(
          jsonObj,
          (k, v) => {
            if (k) {
              if (v instanceof Function) {
                return `__remove_double_quote_mark__${v
                  .toString()
                  .replace(/\n/g, '__/n__')
                  .replace(/\t/g, '__/t__')}__remove_double_quote_mark__`;
              }
              if (v instanceof RegExp) {
                return `__remove_double_quote_mark__${v
                  .toString()
                  .replace(/\\/g, '__/__')}__remove_double_quote_mark__`;
              }
            }
            return v;
          },
          2
        )
          .replace(/\"?__remove_double_quote_mark__\"?/g, '')
          .replace(/__\/__/g, '\\')
          .replace(/__\/n__/g, '\n')
          .replace(/__\/t__/g, '\t');

        if (this.batchImportDialog.useMock) {
          this.batchImportDialog.form.data.jsonObjOfMock = mock(jsonObj);
        }
      } catch (err) {}
    },
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
        .then(() => Promise.delayResolve(1500))
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
        .then(() => Promise.delayResolve(1500))
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
    showBatchImportDialog() {
      this.batchImportDialog.visible = true;
    },
    hideBatchImportDialog() {
      this.batchImportDialog.visible = false;
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
