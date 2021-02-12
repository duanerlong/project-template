<template>
  <div>
    <div class="py-4 pl-3">
      <div>
        <table class="table table-striped table-dark" style="margin-bottom: 0;">
          <thead>
            <tr>
              <th width="160" class="text-center"></th>
              <th width="150" class="text-center">登録者名</th>
              <th width="100" class="text-center">性別</th>
              <th width="100" class="text-center">マスク</th>
              <th width="130" class="text-center">体温</th>
              <th width="130" class="text-center">登録種別</th>
              <th width="150" class="text-center">登録日</th>
            </tr>
          </thead>
        </table>
      </div>
      <div style="height: 80vh; overflow: auto;">
        <table class="table table-striped table-dark">
          <thead style="display: none;">
            <tr>
              <th width="160" class="text-center"></th>
              <th width="150" class="text-center">登録者名</th>
              <th width="100" class="text-center">性別</th>
              <th width="100" class="text-center">マスク</th>
              <th width="130" class="text-center">体温</th>
              <th width="130" class="text-center">登録種別</th>
              <th width="150" class="text-center">登録日</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in datalist"
              :key="index"
              :class="[
                Number(item.temperature) > Number(item.warning_temperature)
                  ? 'bg-danger'
                  : '',
              ]"
            >
              <td class="align-middle text-center">
                <img
                  :src="'/' + item.photo"
                  class="img-thumbnail"
                  style="width: 150px; height: 200px; object-fit: cover;"
                />
              </td>
              <td width="*" class="align-middle text-center px-3 h3">
                {{ item.name }}
              </td>
              <td class="align-middle text-center px-3 h3">
                {{ item.sex | formatSex }}
              </td>
              <td class="align-middle text-center px-3 h3">
                {{ item.ismask }}
              </td>
              <td class="align-middle text-center px-3 h3">
                {{ item.temperature }}°C
              </td>
              <td class="align-middle text-center px-3 h3">
                {{ item.statelabel }}
              </td>
              <td class="align-middle text-center px-3 h3">
                <small>{{ lastdate(item.lastdate) }}</small>
                <br />{{ lasttime(item.lastdate) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.justify-content-between {
  justify-content: space-between !important;
}
.border-bottom {
  border-bottom: 1px solid #dee2e6 !important;
}
.border {
  border: 1px solid #dee2e6 !important;
}
.py-4 {
  padding-bottom: 1.5rem !important;
  padding-top: 1.5rem !important;
}
.h1 {
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 2.5rem;
  line-height: 1.2;
}
.ml-4 {
  margin-left: 1.5rem !important;
}
.mx-2 {
  padding-right: 1.5rem !important;
  margin-left: 0.5rem !important;
}
.mr-2 {
  margin-right: 0.5rem !important;
}
.pt-3 {
  padding-top: 1rem !important;
}
.pb-3 {
  padding-bottom: 1rem !important;
}
.pl-3 {
  padding-left: 1rem !important;
}
.px-4 {
  padding-right: 1.5rem !important;
  padding-left: 1.5rem !important;
}
.align-items-center {
  -ms-flex-align: center !important;
  align-items: center !important;
}
.align-items-end {
  -ms-flex-align: end !important;
  align-items: flex-end !important;
}
.bg-white {
  background-color: #fff !important;
  color: #212529;
}
.text-white {
  color: #fff !important;
}
.display-3 {
  font-size: 4.5rem;
  font-weight: 300;
  line-height: 1.2;
}
.bg-primary {
  background-color: #007bff !important;
}
.table-dark {
  color: #fff !important;
  background-color: #343a40;
}
.table {
  width: 100%;
  margin-bottom: 1rem;
  color: #212529;
}
table {
  border-collapse: collapse;
}
.table thead th {
  vertical-align: bottom;
  border-bottom: 2px solid #dee2e6;
  padding: 0.75rem;
  border-top: 1px solid #dee2e6;
  border-color: #454d55;
}
.text-center {
  text-align: center !important;
}
.bg-danger {
  background-color: #dc3545 !important;
}
</style>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'

export default {
  data() {
    return {
      dialog: false,
      nowpage: 1,
      endpage: 10,
      rows: 10,
      allrow: '-',
      datalist: [
        // {
        //     picture:'https://d3j69vjgw7ziu3.cloudfront.net/articles/images/000/032/853/medium/271b74d8-5c8f-4281-af22-6aaab092e196.jpg?1586241485',
        //     lastdate:1588058876474,
        //     name:'未登録者',
        //     ismask:'あり',
        //     temperature:36.6,
        // },
      ],
      wherecreatedate: 'all',
      wherename: 'all',
      currentUser: {},
    }
  },
  computed: mapGetters({
    currentDevice: 'devices/currentDevice',
  }),
  created() {
    // var getobj = getUrlVars()
    const getobj = {
      hasOwnProperty(key) {},
    }
    this.nowpage = Object.prototype.hasOwnProperty.call(getobj, 'page')
      ? getobj.page
      : 1
    this.wherecreatedate = Object.prototype.hasOwnProperty.call(
      getobj,
      'wherecreatedate'
    )
      ? getobj.wherecreatedate
      : 'all'
    this.wherename = Object.prototype.hasOwnProperty.call(getobj, 'wherename')
      ? getobj.wherename
      : 'all'

    const self = this

    this.$axios
      .post('/activestreamhc/loglist', {
        page: self.nowpage,
        rows: self.rows,
        wherecreatedate: self.wherecreatedate,
        wherename: self.wherename,
        serialno: self.currentDevice.serialno,
      })
      .then(function (response) {
        self.endpage = Math.floor(response.data[0][0].allrow / self.rows) + 1
        self.datalist = response.data[1]
        self.allrow = response.data[0][0].allrow
      })
      .catch((err) => {
        console.log(err)
      })
  },
  methods: {
    lastdate(timestamp) {
      moment.locale('ja', {
        weekdays: [
          '日曜日',
          '月曜日',
          '火曜日',
          '水曜日',
          '木曜日',
          '金曜日',
          '土曜日',
        ],
        weekdaysShort: ['日', '月', '火', '水', '木', '金', '土'],
      })
      return moment(timestamp).format('YYYY年MM月DD日(ddd)')
    },
    lasttime(timestamp) {
      return moment(timestamp).format('HH:mm:ss')
    },
  },
}
</script>
