<template>
  <v-dialog v-model="visible" max-width="400" :persistent="isLoading">
    <v-card>
      <v-card-title class="headline">
        {{ title }}
      </v-card-title>

      <v-card-text>
        {{ text }}
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="pink" text @click="onConfirm" :loading="isLoading">
          确定(Confirm）
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn text @click="onCancel" class="text--secondary">
          取消（Cancel）
        </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ConfirmDialog',

  data: () => ({
    visible: false,
    title: '',
    text: '',
    cb: null,
    isLoading: false,
  }),

  methods: {
    show({ title, text, cb }) {
      this.title = title;
      this.text = text;
      this.cb = cb;
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    loading() {
      this.isLoading = true;
    },
    unloading() {
      this.isLoading = false;
    },
    onConfirm() {
      if (this.isLoading) return;
      if (this.cb) {
        this.cb();
      } else {
        this.hide();
      }
    },
    onCancel() {
      if (this.isLoading) return;
      this.hide();
    },
  },
};
</script>
