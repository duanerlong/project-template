<template>
  <v-container fluid class="d-flex flex-column" style="height: 100%;">
    <v-row style="flex: unset;">
      <v-col>
        <div
          class="text-center pt-2 font-weight-bold"
          style="background-color: white; border-radius: 5px;"
        >
          {{ deviceLabel }}
        </div>
      </v-col>
    </v-row>
    <!-- <v-item-group v-model="selectedIndex">
      <v-row v-if="showLampSwitch && !lampInfoLoading" style="flex: unset;">
        <v-col>
          <v-item v-slot:default="{ active, toggle }">
            <v-btn
              x-large
              block
              :color="active ? 'info' : ''"
              @click="toggleLamp(false, toggle)"
              ><v-icon class="mr-2">far fa-lightbulb</v-icon>画面ON
            </v-btn>
          </v-item>
        </v-col>
        <v-col>
          <v-item v-slot:default="{ active, toggle }">
            <v-btn
              x-large
              block
              :color="active ? 'info' : ''"
              @click="toggleLamp(true, toggle)"
              ><v-icon class="mr-2">fas fa-lightbulb</v-icon>画面OFF
            </v-btn>
          </v-item>
        </v-col>
      </v-row>
    </v-item-group> -->
    <v-row>
      <v-col md="5" xl="7">
        <v-card v-show="temppic" class="ma-auto pa-1" style="max-width: 20vw;">
          <v-img :src="temppic" />
        </v-card>
      </v-col>
      <v-col class="d-flex flex-column">
        <div class="d-flex flex-column" style="flex: 1 1 auto;">
          <div
            class="text-center display-2 font-weight-bold w-100 white--text py-5 bg-tempok"
            :class="[ishightemp ? 'bg-temperr' : 'bg-tempok']"
          >
            {{ temperature }} °C
          </div>
          <div class="py-4"></div>
          <div
            class="py-4"
            :class="[ishightemp ? 'bg-temperr' : 'bg-tempok']"
            style="flex: 1 1 auto;"
          >
            <div class="py-4 white--text display-2 text-center">
              {{ personname }}
            </div>
            <div
              class="my-2 mx-5"
              style="height: 2px; background-color: white;"
            ></div>
            <div class="pt-4 white--text text-center">
              {{ lastdate }}
            </div>
            <div class="white--text text-center">
              {{ lasttime }}
            </div>
            <div class="pb-4 white--text text-center">
              (最終検知日)
            </div>
            <div
              v-if="temperature === 0"
              class="pb-4 red--text text-center display-2"
            >
              検温し直してください。
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
    <v-row style="flex: unset;">
      <v-col class="d-flex">
        <div
          class="white--text py-6 px-12 display-2"
          style="
            background-color: #00acc1b0;
            min-height: 10vh;
            max-height: 30vh;
            flex: 1 1 auto;
          "
        >
          <div
            v-for="(message, index) in messages"
            :key="index"
            class="text-h5"
          >
            {{ message.content }}
          </div>
        </div>
      </v-col>
    </v-row>
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
  </v-container>
</template>

<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import socket from '@/plugins/socket.io.js'

export default {
  components: {},
  props: {
    currentDevice: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      temppic: '',
      temperature: '--.-',
      personname: '----',
      lastdate: '----年--月--日(-)',
      lasttime: '--:--:--',
      ishightemp: false,
      soketRoomId: '',
      messages: [],
      client: socket(),
      selectedIndex: 0,
      lampInfoLoading: true,
      voice: '0',
      snackbar: false,
      snackbarColor: '',
      snackbarMessage: '',
    }
  },
  computed: {
    ...mapGetters({
      authUser: 'auth/authUser',
    }),
    deviceLabel() {
      const device = this.currentDevice || {}
      return device.devicelabel || device.serialno
    },
    showLampSwitch() {
      const user = this.authUser || {}
      return user.type === 1 || user.type === 2 || user.type === 3
    },
  },
  async created() {
    this.client.open()
    this.soketRoomId = this.currentDevice.serialno
    this.client.emit('join', this.soketRoomId)
    const self = this
    // await this.$axios
    //   .post(`/activestreamhc/devices/lampinfo/${this.currentDevice.uid}`)
    //   .catch((err) => {
    //     console.log(err)
    //   })
    this.client.on('activestreamhcsignaling', (socketobj) => {
      console.log(socketobj)
      const dbResults = socketobj.dbResults
      const signalingResult = socketobj.signalingResult
      self.lampInfoLoading = false
      if (
        dbResults &&
        dbResults.length > 0 &&
        dbResults[0].method === 'LampInfoCommand' &&
        signalingResult &&
        signalingResult.result
      ) {
        self.selectedIndex =
          signalingResult.params[0].params.content[0].Brightness > 0 &&
          signalingResult.params[1].params.content[0].Brightness > 0
            ? 0
            : 1
      }
    })
    const res = await this.$axios
      .get('/activestreamhc/systeminfo')
      .catch((err) => {
        console.log(err)
      })
    if (res) {
      this.voice = res.data.voice || '0'
    }
    this.client.on('activestreamhcpushing', async (socketobj) => {
      self.temppic = `/${socketobj.machineobj.picture}`
      const userInfo = socketobj.dbresults[0]
      if (userInfo) {
        if (this.showLampSwitch || userInfo.uid === '0000') {
          self.personname = userInfo.name
        } else {
          self.personname = '登録者'
        }
        console.log(userInfo)
        const { data } = await this.$axios
          .get(`/activestreamhc/message/${userInfo.uid}`, {
            params: {
              serialno: this.soketRoomId,
            },
          })
          .catch((err) => {
            console.log(err)
          })
        this.messages = data
      }
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
      self.lastdate = moment().format('YYYY年MM月DD日(ddd)')
      self.lasttime = moment().format('HH:mm:ss')
      self.temperature = socketobj.machineobj.temperature
      if (self.temperature > socketobj.device.temperature) {
        self.ishightemp = true
        if (this.voice === '0' || this.voice === '1') {
          self.speechword(self.temperature + '度です。高熱注意、高熱注意')
        }
      } else {
        self.ishightemp = false
        const msg =
          self.temperature === 0
            ? '検温し直してください。'
            : self.temperature + '度です。'
        console.log(msg)
        if (this.voice === '0') {
          self.speechword(msg)
        }
      }
      this.$emit('pushing', socketobj)
    })
    this._timer = setInterval(() => {
      if (!this.client.connected) {
        this.client.open()
        this.soketRoomId = this.currentDevice.serialno
        this.client.emit('join', this.soketRoomId)
      }
    }, 1000)
  },
  destroyed() {
    this.client.emit('leave', this.soketRoomId)
    this.soketRoomId = ''
    this.client.removeAllListeners()
    this.client.close()
    if (this._timer) clearInterval(this._timer)
  },
  methods: {
    speechword: (msg) => {
      if (process.client) {
        if (process.client && 'speechSynthesis' in window) {
          const uttr = new SpeechSynthesisUtterance()
          uttr.text = msg
          uttr.lang = 'ja-JP'
          document.body.click()
          speechSynthesis.speak(uttr)
        } else {
          console.log('このブラウザは音声合成に対応していません。😭')
        }
      }
    },
    async toggleLamp(toggle, callback) {
      if (!!this.selectedIndex !== toggle) {
        const { data } = await this.$axios
          .post(
            `/activestreamhc/devices/togglelamp/${this.currentDevice.uid}`,
            {
              toggle,
            }
          )
          .catch((err) => {
            console.log(err)
          })
        if (data.error) {
          this.snackbar = true
          this.snackbarColor = 'error'
          this.snackbarMessage = data.message
        } else {
          callback()
        }
      }
    },
  },
}
</script>
