<template>
  <v-app>
    <v-app-bar app>
      <div class="d-flex align-center">
        <v-img
          alt="JSONDBAPI Logo"
          class="shrink mr-2"
          contain
          src="../src/assets/logo2.png"
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
        <v-row>
          <v-col cols="auto">
            <v-navigation-drawer>
              <v-list-item>
                <v-list-item-content class="py-0">
                  <v-list-item-title class="title">
                    DB List
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ dbs.length > 0 ? 'Your database list' : "You don't have a database yet" }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-btn color="primary" fab dark small absolute center right @click="showCreateDBDialog">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </v-list-item>

              <v-list dense nav>
                <v-list-item v-for="db in dbs" :key="db.id" link>
                  <v-list-item-content>
                    <v-list-item-title>{{ db.name }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-navigation-drawer>
          </v-col>
          <v-col>
            <router-view></router-view>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    <v-footer padless>
      <v-col class="text-center" cols="12"> {{ new Date().getFullYear() }} — <strong>JSONDBAPI</strong> </v-col>
    </v-footer>
    <v-dialog v-model="createDBDialog.visible" max-width="500px">
      <v-card>
        <v-card-title>
          Create DB
        </v-card-title>

        <v-card-text>
          <v-text-field
            ref="nameFieldRef"
            label="Name"
            v-model="createDBDialog.form.data.name"
            :rules="[rules.required, (v) => !dbs.some((db) => db.name === v) || 'The name already exist.']"
            @keyup.enter="onSubmitOfCreateDBDialog"
          ></v-text-field>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>

          <v-btn text color="primary" @click="onSubmitOfCreateDBDialog">
            Submit
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
      rules: {
        required: (v) => !!v || 'Required.',
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
    });
  },
  methods: {
    showCreateDBDialog() {
      this.createDBDialog.visible = true;
    },
    onSubmitOfCreateDBDialog() {
      if (this.$refs.nameFieldRef.validate(true)) {
        this.$request({
          method: 'POST',
          url: '/dbs',
          data: this.createDBDialog.form.data,
        }).then((res) => {
          this.dbs.push(res.data);
          this.createDBDialog.form.data.name = '';
          this.createDBDialog.visible = false;
          this.$refs.nameFieldRef.reset();
        });
      }
    },
  },
};
</script>
