<template>
  <div class="p-0">
    <img :src="src" :srcset="srcset" class="w-100 fixed-top" />
  </div>
</template>

<style lang="scss" scoped>
img {
  height: 100vh;
  width: 100vw;
  z-index: -1 !important;
  object-fit: cover;
  // opacity: 50%;
}
</style>

<script>
export default {
  props: {
    src: {
      type: String,
      default: '',
    },
    srcset: {
      type: String,
      default: '',
    },
  },
}
</script>
