<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <client-only>
        <v-data-table
          :headers="headers"
          :items="devices"
          item-key="uid"
          class="elevation-1"
          :footer-props="{
            itemsPerPageText: '表示件数',
            itemsPerPageOptions: [10, 50, 100, -1],
          }"
        >
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>デバイス一覧</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="primary" class="ma-2" @click="openMonitor()"
                >モニタリング</v-btn
              >
              <v-btn
                v-if="isCloud === 'false'"
                color="secondary"
                class="ma-2"
                :loading="processing"
                :disabled="processing"
                @click="scan()"
                >デバイス検知</v-btn
              >
              <v-dialog
                v-if="isCloud === 'false'"
                v-model="dialog"
                persistent
                width="563"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    color="success"
                    class="ma-2"
                    v-bind="attrs"
                    v-on="on"
                    :loading="processing"
                    :disabled="processing"
                    >デバイス手動追加</v-btn
                  >
                </template>
                <v-card class="d-flex flex-column" height="358">
                  <v-card-title>
                    <span class="headline"
                      >デバイスIPを手動で入力してください</span
                    >
                  </v-card-title>
                  <v-spacer></v-spacer>
                  <v-card-text>
                    <v-container>
                      <v-form ref="form">
                        <v-text-field
                          v-model="target"
                          :rules="targetRules"
                          placeholder="192.168.1.64"
                          hint="(※検温機右上に表示するIPアドレスをご入力ください。)"
                          persistent-hint
                        ></v-text-field>
                      </v-form>
                    </v-container>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn dark color="grey lighten-1" @click="close()"
                      >戻る</v-btn
                    >
                    <v-btn dark color="secondary" @click="scan('IP')"
                      >接続</v-btn
                    >
                  </v-card-actions>
                  <v-spacer></v-spacer>
                </v-card>
              </v-dialog>
            </v-toolbar>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-btn
              color="black"
              class="ma-2 white--text"
              min-width="80"
              small
              @click="openMonitorByDevice(item.uid)"
              >モニタリング</v-btn
            >
            <v-btn
              color="primary"
              class="ma-2"
              min-width="80"
              small
              @click="moveToLog(item)"
              >ログ一覧</v-btn
            >
            <v-btn
              color="secondary"
              class="ma-2"
              min-width="80"
              small
              :loading="detailLoading[item.uid]"
              @click="moveToDetail(item)"
              >詳細設定</v-btn
            >
            <v-btn
              color="error"
              class="ma-2"
              min-width="80"
              small
              @click="deleteDevice(item)"
              >削除</v-btn
            >
          </template>
          <template v-slot:no-data>
            <span>該当データが存在しません</span>
          </template>
          <template v-slot:footer>
            <div style="position: relative;">
              <div style="position: absolute; bottom: -55px;">
                <v-btn
                  v-if="devices.length > 0"
                  color="error"
                  class="ma-2"
                  @click="openAlertDialog()"
                  >アラート温度</v-btn
                >
                <span class="ma-2">{{ temperature }}</span>
              </div>
            </div>
          </template>
        </v-data-table>
        <blockDialog
          :show.sync="showBlockDialog"
          :message="message"
        ></blockDialog>

        <v-dialog v-model="alertDialog" persistent width="400"
          ><v-card>
            <v-card-title>アラート温度設定</v-card-title>
            <v-card-text class="text-h6 text-center py-3">
              <v-text-field
                v-model="temperature"
                :rules="temperatureRules"
                label="アラート温度"
                required
              >
                <template v-slot:append-outer>
                  <v-btn class="mx-2" @click="lowerTemperature">↓</v-btn>
                  <v-btn class="mx-2" @click="increaseTemperature">↑</v-btn>
                </template>
              </v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer />
              <v-btn
                color="grey"
                class="white--text"
                min-width="80"
                @click="alertDialog = false"
                >取消</v-btn
              >
              <v-btn color="secondary" class="my-3" @click="savetemperature()"
                >設定</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </client-only>
      <v-img
        v-if="urlQRCode"
        width="150"
        height="150"
        class="my-3 mx-auto"
        :src="urlQRCode"
        contain
      />

      <v-snackbar
        v-model="snackbar"
        :color="snackbarColor"
        top
        timeout="3000"
        multi-line
      >
        {{ snackbarMessage }}

        <template v-slot:action="{ attrs }">
          <v-btn text v-bind="attrs" @click="snackbar = false">
            閉じる
          </v-btn>
        </template>
      </v-snackbar>
      <confirmDialog ref="dlg" @confirm="confirmDeletion"></confirmDialog>
    </v-col>
  </v-row>
</template>

<script>
import blockDialog from '@/components/block-dialog'
import confirmDialog from '@/components/confirm-dialog'
export default {
  layout: 'admin',
  components: {
    blockDialog,
    confirmDialog,
  },
  async asyncData({ $axios }) {
    const devicesRes = await $axios
      .get('/activestreamhc/devices')
      .catch((err) => {
        console.log(err)
      })

    let data = []
    if (devicesRes) {
      data = devicesRes.data
    }
    const monitorLoading = data.reduce((previousValue, currentValue) => {
      previousValue[currentValue.uid] = false
      return previousValue
    }, {})
    const detailLoading = data.reduce((previousValue, currentValue) => {
      previousValue[currentValue.uid] = false
      return previousValue
    }, {})
    const res = await $axios.get('/activestreamhc/systeminfo').catch((err) => {
      console.log(err)
    })
    let urlQRCode = null
    let isCloud = 'false'
    if (res) {
      urlQRCode = res.data.urlQRCode
      isCloud = res.data.isCloud
    }
    console.log(isCloud)
    let alertTemperature = null
    if (data.length > 0) {
      alertTemperature = data[0].temperature
    }
    return {
      devices: data,
      urlQRCode,
      monitorLoading,
      detailLoading,
      alertTemperature,
      isCloud,
    }
  },
  data() {
    return {
      dialog: false,
      showBlockDialog: false,
      alertDialog: false,
      target: null,
      message: null,
      intervalNumber: null,
      processing: false,
      snackbar: false,
      snackbarColor: '',
      snackbarMessage: '',
      targetRules: [(v) => !!v || 'IPは必須です'],
      headers: [
        {
          text: 'デバイス名',
          align: 'start',
          sortable: false,
          value: 'devicelabel',
        },
        { text: 'SerialNo', align: 'center', value: 'serialno' },
        { text: '本日検知件数', align: 'center', value: 'daily' },
        { text: '総検知件数', align: 'center', value: 'total' },
        { text: '本日高熱者件数', align: 'center', value: 'cnt' },
        { text: '', align: 'right', value: 'actions', sortable: false },
      ],
      deletedItem: {},
      temperatureRules: [(v) => !!v || 'アラート温度設定は必須です'],
    }
  },
  computed: {
    temperature: {
      get() {
        if (this.alertTemperature) {
          return Number(this.alertTemperature) + 0.1
        }
        return ''
      },
      set(val) {
        if (val) {
          this.alertTemperature = Number(val) - 0.1
        }
      },
    },
  },
  watch: {
    async showBlockDialog(val) {
      if (!val) return
      this.processing = true
      this.message = this.target
        ? `デバイスをと接続しています。
今しばらくお待ちください。`
        : `同じLan環境に設置しているデバイスを検知しています。
        今しばらくお待ちください。`
      setTimeout(async () => {
        this.showBlockDialog = false
        this.snackbar = true
        this.snackbarColor = 'success'
        this.snackbarMessage =
          '処理時間がかかりますので、バックグラウンド実行に切り替えます。'
        await this.checkProcess()
      }, 10000)
      await this.$axios.post(`/activestreamhc/devices/discover`, {
        target: this.target,
      })
    },
  },
  async created() {
    await this.checkProcess()
  },
  destroyed() {
    this.clearCheckProcess()
  },
  methods: {
    async checkProcess() {
      const { data } = await this.$axios
        .get(`/activestreamhc/device/discover`)
        .catch((err) => {
          console.log(err)
        })
      this.processing = data.processing
      if (this.processing) {
        this.intervalNumber = setInterval(async () => {
          const { data } = await this.$axios
            .get(`/activestreamhc/device/discover`)
            .catch((err) => {
              console.log(err)
            })
          this.processing = data.processing
          if (!this.processing) {
            this.clearCheckProcess()
            const { data } = await this.$axios
              .get('/activestreamhc/devices')
              .catch((err) => {
                console.log(err)
              })
            this.devices = data
          }
        }, 5000)
      } else {
        this.snackbar = false
        const { data } = await this.$axios
          .get('/activestreamhc/devices')
          .catch((err) => {
            console.log(err)
          })
        this.devices = data
      }
    },
    clearCheckProcess() {
      if (this.intervalNumber) clearInterval(this.intervalNumber)
    },
    async setCurrentDevice(currentDevice) {
      await this.$store.dispatch('devices/currentDevice', {
        currentDevice,
      })
    },

    openMonitorByDevice(uid) {
      const routeData = this.$router.resolve({
        name: 'index',
        query: { uid },
      })
      window.open(routeData.href, '_blank')
    },

    openMonitor() {
      const routeData = this.$router.resolve({
        name: 'admin-monitor',
      })
      window.open(routeData.href, '_blank')
    },

    moveToLog(currentDevice) {
      this.$router.push({
        name: 'admin-log',
        params: {
          serialno: currentDevice.serialno,
        },
      })
    },

    scan(type) {
      if (type === 'IP') {
        if (this.$refs.form.validate()) {
          this.showBlockDialog = true
          this.dialog = false
        }
      } else {
        this.target = null
        this.message = null
        this.showBlockDialog = true
      }
    },

    close() {
      this.dialog = false
      this.$refs.form.reset()
    },

    async moveToDetail(currentDevice) {
      this.detailLoading[currentDevice.uid] = true
      const res = await this.$axios
        .get(`/activestreamhc/devices/${currentDevice.uid}`)
        .catch((err) => {
          console.log(err)
        })
      const device = res.data.device

      this.detailLoading[currentDevice.uid] = false
      if (device.activated) {
        await this.setCurrentDevice(currentDevice)
        this.$router.push(`/admin/device/${currentDevice.uid}`)
      } else {
        this.snackbar = true
        this.snackbarColor = 'error'
        this.snackbarMessage =
          'デバイスがオフラインの状態ですので、しばらくたってから、もう一回試してください。'
      }
    },
    deleteDevice(device) {
      this.$refs.dlg.isDisplay = true
      this.deletedItem = device
    },
    async confirmDeletion() {
      const res = await this.$axios
        .delete(`/activestreamhc/devices/${this.deletedItem.uid}`)
        .catch((err) => {
          console.log(err)
        })
      if (res && res.data && res.data.result) {
        this.snackbar = true
        this.snackbarColor = 'success'
        this.snackbarMessage = 'デバイスを削除しました。'
        const { data } = await this.$axios
          .get('/activestreamhc/devices')
          .catch((err) => {
            console.log(err)
          })
        this.devices = data
      }
    },
    openAlertDialog() {
      this.alertDialog = true
    },
    increaseTemperature() {
      this.temperature = (Number(this.temperature) + 0.1).toFixed(1)
    },
    lowerTemperature() {
      this.temperature = (Number(this.temperature) - 0.1).toFixed(1)
    },
    async savetemperature() {
      const res = await this.$axios
        .post('/activestreamhc/devices/temperature', {
          temperature: this.alertTemperature,
        })
        .catch((err) => {
          console.log(err)
        })
      console.log(res)
      this.alertDialog = false
    },
  },
}
</script>
