<template>
  <div class="collections">
    <v-card elevation="0" :loading="isLoading">
      <v-card-title>
        <span>{{ db.name }}</span>
        <v-card-actions>
          <v-btn @click="addCollection" elevation="0">
            <v-icon>mdi-plus</v-icon>
            添加集合
          </v-btn>
        </v-card-actions>
      </v-card-title>
      <v-card-text>
        <p class="text--secondary" v-show="!isLoading && collections.length === 0">
          暂无数据
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
            clearable
            v-model="addCollectionDialog.form.data.name"
            :rules="[rules.required, (v) => !collections.some((c) => c.name === v) || '英雄，这个集合已经存在了哦~']"
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text color="primary" @click="onSubmitOfCollectionDialog">
            提交
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'Collections',
  props: {
    dbId: String,
  },
  data() {
    return {
      isLoading: true,
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
            this.$nextTick(() => {
              this.isLoading = false;
            });
          })
          .catch(() => {
            this.$router.push('/');
          });
      },
    },
  },
  methods: {
    del(collection, i) {
      this.$request({
        method: 'DELETE',
        url: `/collections/${collection.id}`,
      }).then(() => {
        this.collections.splice(i, 1);
      });
    },
    onSubmitOfCollectionDialog() {
      if (this.$refs.collectionNameFieldRef.validate(true)) {
        this.$request({
          method: 'POST',
          url: '/collections',
          data: { ...this.addCollectionDialog.form.data, dbId: this.dbId },
        }).then((res) => {
          this.collections.push(res.data);
          this.addCollectionDialog.form.data.name = '';
          this.addCollectionDialog.visible = false;
          this.$refs.collectionNameFieldRef.reset();
        });
      }
    },
    addCollection() {
      this.addCollectionDialog.visible = true;
    },
  },
};
</script>
