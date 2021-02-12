<template>
  <v-row align="center" justify="center">
    <v-col cols="12">
      <v-card min-height="490">
        <v-card-title class="text-h6">
          デバイス詳細
        </v-card-title>
        <v-card-text class="py-3">
          <v-form ref="form">
            <v-row>
              <v-col class="mr-12">
                <v-text-field
                  v-model="device.devicelabel"
                  :rules="devicelabelRules"
                  label="デバイス名"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="device.devicename"
                  :rules="devicenameRules"
                  label="本体表示名"
                  required
                ></v-text-field>

                <!-- <v-text-field
                  v-model="temperature"
                  :rules="temperatureRules"
                  label="アラート温度設定"
                  required
                > -->
                <!-- <template v-slot:append-outer>
                    <v-btn class="mx-2" @click="lowerTemperature">↓</v-btn>
                    <v-btn class="mx-2" @click="increaseTemperature">↑</v-btn>
                  </template> -->
                <!-- </v-text-field> -->

                <v-text-field
                  v-model="device.host"
                  class="mb-12"
                  label="IPアドレス"
                  readonly
                ></v-text-field>
                <v-spacer />
              </v-col>
              <v-col>
                <v-card class="mx-auto" width="462" height="254">
                  <v-img
                    v-if="backgroundimgpath"
                    width="462"
                    height="254"
                    :src="backgroundimgpath"
                  />
                </v-card>

                <v-file-input
                  v-model="file"
                  accept="image/*"
                  show-size
                  label="デバイス背景設定"
                  hint="(※5MB以内jpg写真)"
                  persistent-hint
                  class="file-upload"
                  @change="onImagePicked"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pb-6">
          <v-btn color="secondary" min-width="80" @click="moveToAdmin"
            >権限管理</v-btn
          >
          <v-spacer />
          <v-btn
            color="grey"
            class="white--text"
            min-width="80"
            small
            @click="onBack"
            >戻る</v-btn
          >
          <v-btn color="secondary" min-width="80" small @click="save"
            >保存</v-btn
          >
        </v-card-actions>
      </v-card>
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

export default {
  layout: 'admin',
  async asyncData({ params, $axios }) {
    const res = await $axios
      .get(`/activestreamhc/devices/${params.uid}`)
      .catch((err) => {
        console.log(err)
      })
    let device = {}
    if (res) {
      device = res.data.device
    }
    return { device }
  },
  data() {
    return {
      uploadImageUrl: '',
      file: null,
      devicelabelRules: [(v) => !!v || 'デバイス名は必須です'],
      devicenameRules: [(v) => !!v || '本体表示名は必須です'],
      temperatureRules: [(v) => !!v || 'アラート温度設定は必須です'],
    }
  },
  computed: {
    backgroundimgpath() {
      return (
        this.uploadImageUrl ||
        (this.device.backgroundimgpath
          ? `/${this.device.backgroundimgpath}`
          : '')
      )
    },
    // temperature: {
    //   get() {
    //     if (this.device.temperature) {
    //       return Number(this.device.temperature) + 0.1
    //     }
    //     return ''
    //   },
    //   set(val) {
    //     if (val) {
    //       this.device.temperature = Number(val) - 0.1
    //     }
    //   },
    // },
  },
  methods: {
    // increaseTemperature() {
    //   this.temperature = (Number(this.temperature) + 0.1).toFixed(1)
    // },
    // lowerTemperature() {
    //   this.temperature = (Number(this.temperature) - 0.1).toFixed(1)
    // },
    onBack() {
      this.$router.push('/admin/device')
    },
    moveToAdmin() {
      this.$router.push({
        name: 'admin-device-account',
        query: {
          serialno: this.device.serialno,
        },
      })
    },
    async save() {
      if (this.$refs.form.validate()) {
        const formData = new FormData()
        if (this.file) {
          formData.append('file', this.file, this.file.name)
        }
        // additional data
        formData.append('serialno', this.device.serialno)
        formData.append('temperature', this.device.temperature)
        formData.append('devicename', this.device.devicename)
        formData.append('devicelabel', this.device.devicelabel)
        await this.$axios
          .post(`/activestreamhc/devices/update/${this.device.uid}`, formData)
          .catch((err) => {
            console.log(err)
          })
        this.onBack()
      }
    },
    onImagePicked(file) {
      if (file !== undefined && file !== null) {
        if (file.name.lastIndexOf('.') <= 0) {
          return
        }
        const fr = new FileReader()
        fr.readAsDataURL(file)
        fr.addEventListener('load', () => {
          this.uploadImageUrl = fr.result
        })
      } else {
        this.uploadImageUrl = ''
      }
    },
  },
}
</script>
