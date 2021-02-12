<template>
  <div class="pt-1 pb-3">
    <div
      class="numberclock d-flex flex-column rounded"
      style="background-color: #484848a6;"
    >
      <div
        class="numberclock-timer text-center pt-2 display-3 white--text font-weight-bold"
      >
        {{ numberclocktimer }}
      </div>
      <div style="height: 2px; background-color: white;" class="mx-5"></div>
      <div class="numberclock-date text-center py-2 h6 white--text">
        {{ numberclockdate }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.numberclock {
  min-width: 280px !important;
}
</style>

<script>
import moment from 'moment'

export default {
  data() {
    return {
      numberclocktimer: 'loading...',
      numberclockdate: '',
    }
  },
  created() {
    // const self = this
    setInterval(() => {
      this.startnumberclockfnc()
    }, 1000)
  },
  methods: {
    startnumberclockfnc() {
      this.numberclocktimer = moment().format('HH:mm:ss')
      this.numberclockdate = moment().format('YYYY年MM月DD日')
    },
  },
}
</script>
