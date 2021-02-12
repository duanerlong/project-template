<template>
  <div class="todaycalendar">
    <div class="py-2 d-flex flex-column">
      <div
        class="d-flex flex-row w-100 px-2 pt-2 rounded justify-content-center"
        style="background-color: #484848a6;"
      >
        <div
          style="width: 14%;"
          class="deep-orange--text text-center border py-2"
        >
          日
        </div>
        <div style="width: 14%;" class="white--text text-center border py-2">
          月
        </div>
        <div style="width: 14%;" class="white--text text-center border py-2">
          火
        </div>
        <div style="width: 14%;" class="white--text text-center border py-2">
          水
        </div>
        <div style="width: 14%;" class="white--text text-center border py-2">
          木
        </div>
        <div style="width: 14%;" class="white--text text-center border py-2">
          金
        </div>
        <div
          style="width: 14%;"
          class="deep-orange--text text-center border py-2"
        >
          土
        </div>
      </div>
      <div
        class="d-flex flex-row flex-wrap w-100 px-2 pb-2 rounded justify-content-center"
        style="background-color: #484848a6;"
      >
        <div
          v-for="(item, index) in todaycalendar"
          :key="index"
          style="width: 14%;"
          class="text-center border py-2"
          :class="item.class"
        >
          {{ item.text }}
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.todaycalendar {
  min-width: 280px !important;
}
.border {
  border: 1px solid #dee2e6 !important;
}
</style>

<script>
import moment from 'moment'
import JapaneseHolidays from 'japanese-holidays'

export default {
  data() {
    return {
      todayday: 0,
      todaycalendar: [],
    }
  },
  created() {
    const self = this
    setInterval(function () {
      self.starttodaycalendarkfnc()
    }, 1000)
  },
  methods: {
    getLastDay(year, month) {
      return new Date(year, month, 0).getDate()
    },
    paddingDay(day) {
      return (Array(2).join('0') + day).slice(-2)
    },
    isSatorSun(year, month, day) {
      const tempweekday = moment(
        year + '-' + month + '-' + this.paddingDay(day)
      ).weekday()
      if (tempweekday === 0 || tempweekday === 6) {
        return true
      }
      return false
    },
    starttodaycalendarkfnc() {
      const nowtodayday = moment().format('DD')
      // 日が変わらないと処理を中止する
      if (nowtodayday === this.todayday) {
        return
      }
      this.todayday = nowtodayday
      this.todaycalendar = []
      const year = moment().format('YYYY')
      const month = moment().format('MM')
      const firthday = moment(
        year + '-' + month + '-' + this.paddingDay(1)
      ).weekday()
      const lastday = this.getLastDay(year, month)
      // 空白のセルを作成
      for (let index = 0; index < firthday; index++) {
        this.todaycalendar.push({ class: 'white--text', text: '' })
      }
      // カレンダーの数字を作成
      for (let index = 1; index <= lastday; index++) {
        const tempobj = { class: 'white--text', text: index }
        if (
          this.isSatorSun(year, month, index) ||
          JapaneseHolidays.isHoliday(new Date(year + '-' + month + '-' + index))
        ) {
          tempobj.class = 'deep-orange--text'
        }
        if (index === Number(this.todayday)) {
          tempobj.class = tempobj.class + ' primary rounded'
        }
        this.todaycalendar.push(tempobj)
      }
      // 最後の空白のセルを作成
      const endcell = 7 - (this.todaycalendar.length % 7)
      for (let index = 0; index < endcell; index++) {
        this.todaycalendar.push({ class: 'white--text', text: '' })
      }
    },
  },
}
</script>
