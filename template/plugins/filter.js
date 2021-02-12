import Vue from 'vue'
import moment from 'moment'
import JapaneseHolidays from 'japanese-holidays'

const GENDER_MAP = {
  Male: '男',
  Female: '女',
}
const TYPE_LABELS = {
  0: '検温者',
  1: '総合管理者（最高権限）',
  2: '現場管理者',
  3: '受付管理者',
}
const COMMAND_NAMES = {
  DeviceNameCommand: '本体表示名変更',
  LampCommand: '画面ON/OFF',
  LampInfoCommand: '画面状態取得',
  SyncTimeCommand: '時間同期',
  TemperatureCommand: '温度設定',
  SavePersonsCommand: '登録者追加',
  RemovePersonsCommand: '登録者削除',
}
Vue.filter('formatSex', (value) => {
  return GENDER_MAP[value] || '未知'
})
Vue.filter('formatDate', (value, format) => {
  if (!value) return ''
  moment.locale('ja')
  return moment(value).format(format || 'YYYY/MM/DD(ddd) HH:mm:ss')
})
Vue.filter('isHoliday', (value) => {
  if (!value) return ''
  moment.locale('ja')
  const date = moment(value)
  const tempweekday = date.weekday()
  return tempweekday === 0 ||
    tempweekday === 6 ||
    JapaneseHolidays.isHoliday(new Date(date.format('YYYY-MM-DD')))
    ? 'deep-orange--text'
    : ''
})
Vue.filter('formatType', (value) => {
  return TYPE_LABELS[value] || '未知'
})
Vue.filter('statusName', (value) => {
  switch (value) {
    case 0:
      return '未実行'
    case 1:
      return '実行中'
    case 2:
      return '実行完了'
    case 3:
      return 'キャンセル'
    case -1:
      return '実行失敗'
    default:
      return ''
  }
})
Vue.filter('methodName', (value) => {
  return COMMAND_NAMES[value] || ''
})
