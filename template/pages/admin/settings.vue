<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-card min-height="490" class="pa-5">
        <v-card-title class="text-h6">
          システム管理
        </v-card-title>
        <v-card-text class="py-3">
          <div class="voice mt-6">
            <div class="d-flex align-center">
              <div>体温音声読み上げ設定：</div>
              <v-spacer></v-spacer>
            </div>
            <v-radio-group v-model="voice" row>
              <v-radio
                v-for="(option, index) in voiceOptions"
                :key="index"
                class="mx-8"
                :label="option.label"
                :value="option.value"
                @click="onSelected(option.value)"
              >
                <template v-slot:label>
                  <div @click="onSelected(option.value)">
                    {{ option.label }}
                  </div>
                </template>
              </v-radio>
            </v-radio-group>
          </div>
          <v-divider class="my-3"></v-divider>
          <div class="upgrade mt-6">
            <div class="d-flex align-center">
              <div>Ver {{ version }}</div>
              <v-spacer></v-spacer>
              <v-btn
                class="ma-2"
                :loading="checking"
                :disabled="checking || updating"
                color="secondary"
                @click="versionCheck()"
              >
                最新版チェック
              </v-btn>
            </div>
            <div class="d-flex align-center" style="min-height: 52px;">
              <div>{{ message }}</div>
              <v-spacer></v-spacer>
              <v-btn
                v-if="hasNewVersion"
                transition="fade-transition"
                :loading="updating"
                :disabled="updating"
                class="ma-2"
                color="secondary"
                @click="upgrade()"
              >
                更新
              </v-btn>
            </div>
          </div>
          <v-divider class="my-3"></v-divider>
          <div>
            <div>
              ログデータを削除する、
              <v-chip class="ma-2 red--text">
                delete
              </v-chip>
              を入力して、削除ボタンを押してから、削除します。
            </div>
            <div>
              (※削除する前に、先にCSVを出力することをお勧めします)
              <v-btn small text color="secondary" :to="'/admin/log'">
                (CSV出力はこちらへ)
              </v-btn>
            </div>
            <v-row align="center" justify="center">
              <v-col>
                <v-text-field
                  v-model="deleteLogsConfirm"
                  placeholder="delete"
                  outlined
                  error
                ></v-text-field>
              </v-col>
            </v-row>
            <div class="d-flex align-center">
              <v-spacer></v-spacer>
              <v-btn
                class="ma-2"
                color="error"
                :loading="deleting"
                :disabled="deleting"
                @click="deleteLogs()"
              >
                削除
              </v-btn>
            </div>
          </div>
          <v-divider class="my-3"></v-divider>
          <div v-if="isCloud === 'false'" class="address">
            <div>IP {{ host }}</div>
            <v-radio-group v-model="hostConfig.type">
              <v-radio label="自動" value="0"></v-radio>
              <v-radio label="手動" value="1"></v-radio>
            </v-radio-group>
            <v-row align="center" justify="center">
              <v-col>
                <v-text-field
                  v-model="newHost"
                  label="IP"
                  placeholder="192.168.1.2"
                  outlined
                  :disabled="disabledHostInfo"
                ></v-text-field>
              </v-col>
              <v-col>
                <v-text-field
                  v-model="newGateway"
                  label="gateway"
                  placeholder="192.168.1.1"
                  outlined
                  :disabled="disabledHostInfo"
                ></v-text-field>
              </v-col>
            </v-row>
            <div class="d-flex align-center">
              <v-spacer></v-spacer>
              <v-btn
                class="ma-2"
                color="secondary"
                :loading="saving"
                :disabled="saving"
                @click="applyHost()"
              >
                保存
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
      <confirmDialog
        ref="hostDlg"
        color="error"
        :message="'IPを反映してもよろしいでしょうか?'"
        @confirm="onHostConfirm"
      ></confirmDialog>
      <confirmDialog
        ref="upgradeDlg"
        color="error"
        :message="'システムを新しいバージョンにアップグレードしても\nよろしいでしょうか?'"
        @confirm="onUpgradeConfirm"
      ></confirmDialog>
      <confirmDialog
        ref="deleteLogsDlg"
        color="error"
        :message="'すべてのログデータを削除しても\nよろしいでしょうか?'"
        @confirm="onDeleteLogsConfirm"
      >
        <div>
          <div>(※削除する前に、先にCSVを出力することをお勧めします)</div>
          <v-btn small text color="secondary" :to="'/admin/log'">
            (CSV出力はこちらへ)
          </v-btn>
        </div>
      </confirmDialog>
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
    </v-col>
  </v-row>
</template>

<script>
import packageJson from '@/package.json'
import confirmDialog from '@/components/confirm-dialog'
export default {
  layout: 'admin',
  components: {
    confirmDialog,
  },
  async asyncData({ $axios }) {
    const res = await $axios.get('/activestreamhc/systeminfo').catch((err) => {
      console.log(err)
    })
    let data = {}
    let isCloud = 'false'
    if (res) {
      data = res.data
      isCloud = res.data.isCloud
    }
    const hostConfig = JSON.parse(
      data.hostConfig || JSON.stringify({ type: '0', info: {} })
    )
    return { host: data.host, hostConfig, voice: data.voice || '0', isCloud }
  },
  data() {
    return {
      saving: false,
      checking: false,
      updating: false,
      version: packageJson.version,
      lastestVersion: null,
      deleting: false,
      deleteLogsConfirm: '',
      snackbar: false,
      snackbarColor: '',
      snackbarMessage: '',
      voiceOptions: [
        {
          label: '正常、高温も音声読み上げ',
          value: '0',
        },
        {
          label: '高温者のみ音声読み上げ',
          value: '1',
        },
        {
          label: '音声読み上げなし',
          value: '2',
        },
      ],
    }
  },
  computed: {
    message() {
      if (!this.lastestVersion) return ''
      if (this.hasNewVersion) {
        return `新しバージョン${this.lastestVersion}があります`
      } else {
        return '現在のバージョンは最新です。'
      }
    },
    hasNewVersion() {
      const oldVer = this.version.split('.')
      oldVer.length = 3
      const newVer = (this.lastestVersion || '').split('.')
      oldVer.length = 3
      if (parseInt(oldVer[0]) < parseInt(newVer[0])) {
        return true
      }
      if (
        parseInt(oldVer[0]) <= parseInt(newVer[0]) &&
        parseInt(oldVer[1]) < parseInt(newVer[1])
      ) {
        return true
      }
      if (
        parseInt(oldVer[0]) <= parseInt(newVer[0]) &&
        parseInt(oldVer[1]) <= parseInt(newVer[1]) &&
        parseInt(oldVer[2]) < parseInt(newVer[2])
      ) {
        return true
      }
      return false
    },
    disabledHostInfo() {
      return this.hostConfig.type === '0'
    },
    newHost: {
      get() {
        return this.hostConfig.type === '0' ? '' : this.hostConfig.info.host
      },
      set(val) {
        this.hostConfig.info = { ...this.hostConfig.info, host: val }
      },
    },
    newGateway: {
      get() {
        return this.hostConfig.type === '0' ? '' : this.hostConfig.info.gateway
      },
      set(val) {
        this.hostConfig.info = { ...this.hostConfig.info, gateway: val }
      },
    },
  },
  methods: {
    async versionCheck() {
      this.lastestVersion = null
      this.checking = true
      const { data } = await this.$axios
        .get('/activestreamhc/version')
        .catch((err) => {
          console.log(err)
        })
      setTimeout(() => {
        this.checking = false
        if (data.error) {
          this.snackbar = true
          this.snackbarColor = 'error'
          this.snackbarMessage = data.message
        } else {
          this.lastestVersion = data.version
        }
      }, 1000)
    },

    applyHost() {
      this.$refs.hostDlg.isDisplay = true
    },
    async onHostConfirm() {
      this.saving = true
      const { data } = await this.$axios
        .post('/activestreamhc/updatehost', {
          ...this.hostConfig,
          info: {
            host: this.newHost,
            gateway: this.newGateway,
          },
        })
        .catch((err) => {
          console.log(err)
        })
      if (data.result) {
        setTimeout(async () => {
          const res = await this.$axios
            .get('/activestreamhc/systeminfo')
            .catch((err) => {
              console.log(err)
            })
          const systemConfig = res.data
          const url = `http://${systemConfig.host}:${systemConfig.port}/admin/settings`
          location = url
        }, 60000)
      }
    },
    upgrade() {
      this.$refs.upgradeDlg.isDisplay = true
    },
    async onUpgradeConfirm() {
      this.updating = true
      const { data } = await this.$axios
        .post('/activestreamhc/upgrade')
        .catch((err) => {
          console.log(err)
        })
      if (data.result) {
        setTimeout(() => {
          location.reload()
        }, 60000)
      }
    },
    deleteLogs() {
      if (this.deleteLogsConfirm !== 'delete') {
        this.snackbar = true
        this.snackbarColor = 'error'
        this.snackbarMessage =
          'テキストボックスにdeleteを入力して、もう一度試してください。'
      } else {
        this.$refs.deleteLogsDlg.isDisplay = true
      }
    },
    async onDeleteLogsConfirm() {
      this.deleting = true
      const res = await this.$axios
        .delete('/activestreamhc/logs')
        .catch((err) => {
          console.log(err)
        })
      console.log(res)
      if (res && res.data && res.data.result) {
        this.snackbar = true
        this.snackbarColor = 'success'
        this.snackbarMessage = 'ログデータを削除しました。'
      }
      this.deleteLogsConfirm = ''
      this.deleting = false
    },
    async onSelected(voice) {
      if (voice !== this.voice) {
        this.voice = voice
        console.log(typeof voice)
        const res = await this.$axios
          .post('/activestreamhc/voice', {
            voice,
          })
          .catch((err) => {
            console.log(err)
          })

        if (res && res.data && res.data.result) {
          this.snackbar = true
          this.snackbarColor = 'success'
          this.snackbarMessage = '体温音声読み上げ設定を更新しました。'
        }
      }
    },
  },
}
</script>
