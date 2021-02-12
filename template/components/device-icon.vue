<template>
  <div class="device-icon" :style="styleObject">
    <v-img
      :height="imgHeight"
      src="/device-icon.png"
      srcset="/device-icon@2x.png 2x"
      contain
    />
  </div>
</template>

<style lang="scss" scoped>
.device-icon {
  display: flex;
  align-items: center;
  border-radius: 50%;
  margin: 1px;
  background: var(--white) 0% 0% no-repeat padding-box;
  background: #fff 0% 0% no-repeat padding-box;
  box-shadow: 0 3px 6px #00000029;
  opacity: 1;
}
</style>

<script>
export default {
  props: {
    width: {
      type: String,
      default: '',
    },
  },
  computed: {
    imgHeight() {
      return (Number(this.width) || 160) - 30
    },
    styleObject() {
      return {
        height: `${this.width || 160}px`,
        width: `${this.width || 160}px`,
      }
    },
  },
}
</script>
