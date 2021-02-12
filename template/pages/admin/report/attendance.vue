<template>
  <div id="printContent">
    <attendance-content
      v-for="(attendance, index) in attendances"
      :key="index"
      :data="attendance"
    />
  </div>
</template>

<script>
import attendanceContent from '@/components/attendance-content'

export default {
  layout: 'report',
  components: {
    attendanceContent,
  },
  async asyncData({ query, $axios }) {
    const res = await $axios
      .get(`/activestreamhc/report/${query.uid}`)
      .catch((err) => {
        console.log(err)
      })
    let attendances = []
    if (res && res.data) {
      const list = res.data
      attendances = Object.values(
        list.reduce((pre, cur, curIndex, arr) => {
          if (pre[cur.uid]) {
            pre[cur.uid].list.push(cur)
          } else {
            const user = cur
            const date = user.date
            pre[cur.uid] = {
              user,
              date,
              list: [cur],
            }
          }
          return pre
        }, {})
      )
    }
    return {
      attendances,
    }
  },
}
</script>
