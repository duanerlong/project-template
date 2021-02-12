<template>
  <v-dialog v-model="isDisplay" persistent width="600px">
    <v-card class="d-flex flex-column text-center" min-height="358">
      <v-card-title></v-card-title>
      <v-spacer></v-spacer>
      <v-card-text>
        <div text-center>
          <v-icon :color="color" size="80">{{ icon }}</v-icon>
        </div>
        <div class="pt-4 text-h6" style="white-space: break-spaces;">
          {{ message }}
          <slot></slot>
        </div>
      </v-card-text>
      <v-spacer></v-spacer>
      <v-card-actions class="pb-12">
        <v-spacer></v-spacer>
        <v-btn dark color="grey lighten-1" min-width="100px" @click="cancel"
          >取消</v-btn
        >
        <v-btn :color="color" min-width="100px" @click="confirm"
          >実行する</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    // item: [],
    message: {
      type: String,
      required: false,
      default: '本当に削除しますか？',
    },
    color: {
      type: String,
      required: false,
      default: 'error',
    },
    icon: {
      type: String,
      required: false,
      default: 'fa-exclamation-triangle',
    },
  },
  data: () => ({
    isDisplay: false,
  }),
  methods: {
    cancel() {
      this.isDisplay = false
    },
    confirm() {
      this.isDisplay = false
      this.$emit('confirm')
    },
  },
}
</script>
