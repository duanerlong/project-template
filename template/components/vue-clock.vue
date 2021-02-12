<template>
  <div class="clock" :style="clockStyle">
    <div class="clock-circle"></div>
    <div class="clock-hour" :style="{ transform: hourRotate }"></div>
    <div class="clock-minute" :style="{ transform: minuteRotate }"></div>
    <div class="clock-second" :style="{ transform: secondRotate }"></div>
    <b v-for="h in timeList" :key="h" class="hour">
      <span>
        <i :style="{ transform: transform }">{{ h }}</i>
      </span>
    </b>
  </div>
</template>

<script>
export default {
  props: ['time', 'color', 'border', 'bg', 'size'],
  data() {
    return {
      timeList: [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      transform: 'scale(1)',
      hourRotate: 'rotatez(0deg)',
      minuteRotate: 'rotatez(0deg)',
      secondRotate: 'rotatez(0deg)',
    }
  },
  computed: {
    clockStyle() {
      return {
        height: this.size,
        width: this.size,
        color: this.color,
        border: this.border,
        background: this.bg,
      }
    },
  },
  watch: {
    time() {
      this.show()
    },
  },
  mounted() {
    let scale = this.$el.clientWidth / 120
    scale = scale > 3 ? 3 : scale
    this.transform = `scale(${scale})`
    this.show()
  },
  destroyed() {
    if (this._timer) clearInterval(this._timer)
  },
  methods: {
    show() {
      this.showTime()
      if (this._timer) clearInterval(this._timer)
      if (!this.time) {
        this._timer = setInterval(() => {
          this.showTime()
        }, 1000)
      }
    },
    showTime() {
      let times
      if (this.time) {
        times = this.time.split(':')
      } else {
        const now = new Date()
        times = [now.getHours(), now.getMinutes(), now.getSeconds()]
      }
      let hour = +times[0]
      hour = hour > 11 ? hour - 12 : hour
      const minute = +times[1]
      const second = +times[2] || 0
      const hourAngle = hour * 30 + ((minute * 6) / 360) * 30
      const minuteAngle = minute * 6
      const secondAngle = second * 6
      this.hourRotate = `rotatez(${hourAngle}deg)`
      this.minuteRotate = `rotatez(${minuteAngle}deg)`
      this.secondRotate = `rotatez(${secondAngle}deg)`
    },
  },
}
</script>

<style lang="scss" scoped>
$angle: 30deg;
.clock {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  width: 150px;
  min-width: 150px !important;
  height: 150px;
  min-height: 150px !important;
  border: 2px solid;
  border-radius: 100%;
  text-align: center;
  font-size: 14px;
  margin: auto;
  .hour {
    position: absolute;
    top: 0;
    left: 50%;
    display: block;
    width: 20px;
    height: 50%;
    margin-left: -10px;
    padding-top: 4%;
    font-weight: 400;
    transform-origin: bottom;
    user-select: none;
    box-sizing: border-box;
    > span {
      display: block;
      > i {
        display: block;
        font-style: normal;
      }
    }
  }
  @for $i from 2 through 12 {
    .hour:nth-of-type(#{$i}) {
      transform: rotateZ(#{$angle * ($i - 1)});
      > span {
        transform: rotateZ(#{-$angle * ($i - 1)});
      }
    }
  }
  .clock-circle {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 16px;
    height: 16px;
    transform: translate(-50%, -50%);
    border: 2px solid #666;
    border-radius: 100%;
    background-color: #fff;
    z-index: 1;
    box-sizing: border-box;
    &::before {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      display: block;
      content: '';
      width: 4px;
      height: 4px;
      border-radius: 100%;
      background-color: #666;
    }
  }
  .clock-hour,
  .clock-minute,
  .clock-second {
    position: absolute;
    top: 15%;
    left: 50%;
    display: block;
    width: 2px;
    height: 35%;
    margin-left: -1px;
    border-radius: 5px;
    transform-origin: bottom;
    background-color: #666;
  }
  .clock-hour {
    top: 30%;
    width: 4px;
    height: 20%;
    margin-left: -2px;
  }
  .clock-second {
    width: 1px;
  }
}
.clock.is-small {
  width: 80px;
  height: 80px;
  border-width: 1px;
  font-size: 12px;
  .clock-circle {
    width: 10px;
    height: 10px;
    border-width: 1px;
    &::before {
      width: 2px;
      height: 2px;
    }
  }
}
</style>
