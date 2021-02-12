<template>
  <v-row align="center" justify="center">
    <v-col cols="12" sm="8" md="4">
      <v-card class="pa-9">
        <div class="d-flex" style="justify-content: center;">
          <deviceicon />
        </div>
        <v-card-title style="justify-content: center;">
          Active Stream HC管理システム
        </v-card-title>
        <v-card-text>
          <v-form ref="form" class="pb-8">
            <v-text-field
              v-model="email"
              label="メールアドレス"
              type="text"
              outlined
              :rules="emailRules"
              :error="error"
              required
            ></v-text-field>

            <v-text-field
              v-model="password"
              label="パスワード"
              type="password"
              outlined
              :rules="passwordRules"
              :error="error"
              required
              @keyup.enter="login"
            ></v-text-field>
            <v-btn color="info" block large @click="login">ログイン</v-btn>
          </v-form>
        </v-card-text>
        <copyright />
        <v-snackbar v-model="snackbar" :color="snackbarColor" top multi-line>
          {{ snackbarMessage }}

          <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="snackbar = false">
              閉じる
            </v-btn>
          </template>
        </v-snackbar>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import copyright from '@/components/copyright'
import deviceicon from '@/components/device-icon'
export default {
  layout: 'blank',
  middleware({ store, redirect }) {
    if (store.getters['auth/authed']) {
      const authUser = store.getters['auth/authUser']
      switch (authUser.type) {
        case 0:
        case 3:
          redirect('/')
          break
        case 1:
        case 2:
          redirect('/admin')
          break
        default:
          break
      }
    }
  },
  components: {
    copyright,
    deviceicon,
  },
  data() {
    return {
      error: false,
      snackbar: false,
      snackbarColor: '',
      snackbarMessage: '',
      email: '',
      emailRules: [
        (v) => !!v || 'メールアドレスを入力してください。',
        // (v) => /.+@.+/.test(v) || 'Email address must be valid',
      ],
      password: '',
      passwordRules: [(v) => !!v || 'パスワードを入力してください。'],
    }
  },
  methods: {
    async login() {
      try {
        if (this.$refs.form.validate()) {
          const result = await this.$store.dispatch('auth/login', {
            id: this.email,
            password: this.password,
          })
          if (result.message) {
            this.error = true
            this.snackbarMessage = result.message
            this.snackbarColor = 'error'
            this.snackbar = true
            return
          }
          let url = '/devices'
          await this.$store.dispatch('devices/get', {})
          const devices = this.$store.getters['devices/devices']
          if (devices.length > 0) {
            url = `/?uid=${devices[0].uid}`
          }
          switch (result.type) {
            case 0:
            case 3:
              this.$router.push(url)
              break
            case 1:
            case 2:
              this.$router.push('/admin')
              break
            default:
              break
          }
        }
      } catch (e) {}
    },
  },
}
</script>
