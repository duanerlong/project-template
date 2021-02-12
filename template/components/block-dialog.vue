<template>
  <v-dialog v-model="showTmp" persistent width="563">
    <v-card class="d-flex flex-column" height="358">
      <v-card-title></v-card-title>
      <v-spacer />
      <v-icon x-large class="mb-3">far fa-hourglass</v-icon>
      <v-card-text class="text-h6 text-center py-3">
        {{ message }}
      </v-card-text>
      <v-spacer />
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      required: true,
      default: false,
    },
    message: {
      type: String,
      required: false,
      default: `同じLan環境に設置しているデバイスを検知しています。
        今しばらくお待ちください。`,
    },
  },
  computed: {
    showTmp: {
      get() {
        return this.show
      },
      set(value) {
        this.$emit('update:show', value)
      },
    },
  },
}
</script>
