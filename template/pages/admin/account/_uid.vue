<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <account-detail
        :account="account"
        :file.sync="file"
        :infoSaving="infoSaving"
        :typeSaving="typeSaving"
        @typeChange="onTypeChange"
        @back="onBack"
        @saveInfo="onSaveInfo"
        @saveType="onSaveType"
      />
      <v-snackbar v-model="snackbar" :color="snackbarColor" top multi-line>
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

<style scoped>
.file-upload >>> .v-messages {
  text-align: right !important;
  color: black !important;
}
</style>

<script>
import FormData from 'form-data'
import accountDetail from '@/components/account-detail'

export default {
  layout: 'admin',
  components: {
    accountDetail,
  },
  async asyncData({ params, $axios }) {
    const res = await $axios
      .get(`/activestreamhc/account/${params.uid}`)
      .catch((err) => {
        console.log(err)
      })

    let account = {}
    if (res) {
      account = res.data.account
    }
    let type = account.type
    switch (params.type) {
      case 0:
      case 1:
      case 2:
      case 3:
        type = params.type
        break
      default:
        break
    }
    account.type = type
    account.devices = params.devices || account.devices
    return { account }
  },
  data() {
    return {
      file: null,
      snackbar: false,
      snackbarColor: '',
      snackbarMessage: '',
      infoSaving: false,
      typeSaving: false,
    }
  },
  methods: {
    moveToAdmin() {
      this.$router.push('/admin/device/account')
    },
    onBack() {
      this.$router.push('/admin/account')
    },
    onTypeChange() {
      this.$router.push({
        name: 'admin-account-device',
        query: {
          type: this.account.type,
          uid: this.account.uid,
        },
        params: {
          devices: this.account.devices,
        },
      })
    },
    async onSaveInfo() {
      this.infoSaving = true
      const formData = new FormData()
      if (this.file) {
        formData.append('file', this.file, this.file.name)
      }
      formData.append('account', JSON.stringify(this.account))
      await this.$axios
        .post(`/activestreamhc/accountupdateinfo/${this.account.uid}`, formData)
        .catch((err) => {
          console.log(err)
        })
      this.infoSaving = false
      this.snackbarMessage = 'アカウント詳細を更新しました。'
      this.snackbarColor = 'success'
      this.snackbar = true
    },
    async onSaveType() {
      const type = this.account.type
      const devices = this.account.devices
      if (type !== 1 && devices.length === 0) {
        this.snackbarMessage = 'デバイスを設定してください。'
        this.snackbarColor = 'error'
        this.snackbar = true
        return
      }
      this.typeSaving = true
      await this.$axios
        .post(`/activestreamhc/accountupdatetype/${this.account.uid}`, {
          type,
          devices,
        })
        .catch((err) => {
          console.log(err)
        })
      this.typeSaving = false
      this.snackbarMessage = '権限設定を更新しました。'
      this.snackbarColor = 'success'
      this.snackbar = true
    },
  },
}
</script>
