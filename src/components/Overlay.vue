<template>
  <v-overlay :value="overlay">
    <v-container style="height: 400px;">
      <v-row class="fill-height" align-content="center" justify="center">
        <v-col class="subtitle-1 text-center primary--text" cols="12">
          {{ text }}
        </v-col>
        <v-col cols="6" style="min-width: 300px;">
          <v-progress-linear color="primary" indeterminate rounded height="6"></v-progress-linear>
        </v-col>
      </v-row>
    </v-container>
  </v-overlay>
</template>

<script>
export default {
  name: 'Overlay',
  props: {
    overlay: {
      type: Boolean,
      default: false,
    },
    text: {
      type: String,
      default: '',
    },
  },
};
</script>
