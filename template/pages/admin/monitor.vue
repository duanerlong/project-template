<template>
  <client-only>
    <div class="d-flex flex-grow-1" style="height: 100%;">
      <div
        class="d-flex flex-column flex-grow-1"
        style="max-width: calc(100vw - 300px); overflow: auto;"
      >
        <div class="d-flex">
          <div
            v-for="(device, index) in devices"
            :key="index"
            class="ma-3 device_wrap"
          >
            <visitor-info :currentDevice="device" @pushing="onPushing" />
          </div>
        </div>
        <div style="overflow: auto;" ref="bbb">
          <div class="d-flex flex-wrap">
            <div v-for="(item, index) in list1" :key="index">
              <v-card
                width="200"
                :color="
                  item.temperature > item.warning_temperature
                    ? 'error'
                    : 'success'
                "
                class="ma-3"
              >
                <v-list-item>
                  <v-list-item-avatar color="grey"
                    ><v-img :src="item.temppic"></v-img
                  ></v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="headline white--text">{{
                      item.personname
                    }}</v-list-item-title>
                    <v-list-item-subtitle class="white--text">{{
                      item.temperature
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-card-text>
                  <div class="white--text text-center">
                    {{ item.lastdate }}
                  </div>
                  <div class="white--text text-center">
                    {{ item.lasttime }}
                  </div>
                  <div class="white--text text-center">
                    {{ item.devicelabel }}
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex flex-column height_wrap">
        <v-btn
          class="my-12 mx-auto"
          fab
          x-large
          color="error"
          to="/admin/device"
        >
          <v-icon dark>fas fa-power-off</v-icon>
        </v-btn>
        <div
          class="pa-4 ma-4 red--text text-center"
          style="background-color: black;"
        >
          高温者
        </div>
        <div class="flex-grow-1" style="overflow: auto;" ref="aaa">
          <div class="d-flex flex-column align-center">
            <div v-for="(item, index) in list2" :key="index">
              <v-card width="200" color="error" class="ma-3">
                <v-list-item>
                  <v-list-item-avatar color="grey"
                    ><v-img :src="item.temppic"></v-img
                  ></v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title class="headline white--text">{{
                      item.personname
                    }}</v-list-item-title>
                    <v-list-item-subtitle class="white--text">{{
                      item.temperature
                    }}</v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>

                <v-card-text>
                  <div class="white--text text-center">
                    {{ item.lastdate }}
                  </div>
                  <div class="white--text text-center">
                    {{ item.lasttime }}
                  </div>
                  <div class="white--text text-center">
                    {{ item.devicelabel }}
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </div>
        </div>
      </div>
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
    </div>
  </client-only>
</template>
<style lang="scss" scoped>
.device_wrap {
  min-width: 600px;
  height: 100%;
  margin-bottom: 16px;
  zoom: 0.5;
}
.height_wrap {
  min-width: 300px;
  width: 300px;
  background-color: lightgrey;
  margin-top: -12px;
  margin-bottom: -12px;
}
</style>
<script>
import moment from 'moment'
import { mapGetters } from 'vuex'
import visitorInfo from '@/components/visitor-info'
export default {
  layout: 'admin-monitor',
  components: {
    visitorInfo,
  },
  async asyncData({ $axios }) {
    const res = await $axios.get('/activestreamhc/devices').catch((err) => {
      console.log(err)
    })
    let data = []
    if (res) {
      data = res.data
    }
    return {
      devices: data,
    }
  },
  data() {
    return {
      snackbar: false,
      snackbarColor: '',
      snackbarMessage: '',
      list: [],
    }
  },
  computed: {
    ...mapGetters({
      currentDevice: 'devices/currentDevice',
      authUser: 'auth/authUser',
    }),
    list1() {
      return this.list
    },
    list2() {
      return this.list.filter((item) => {
        return item.temperature > item.warning_temperature
      })
    },
  },
  methods: {
    onPushing(socketobj) {
      console.log(socketobj)
      const userInfo = socketobj.dbresults[0] || {}
      console.log(userInfo)
      const item = {
        temppic: `/${socketobj.machineobj.picture}`,
        temperature: socketobj.machineobj.temperature,
        personname: userInfo.name || '----',
        lastdate: moment().format('YYYY年MM月DD日(ddd)'),
        lasttime: moment().format('HH:mm:ss'),
        devicelabel: socketobj.device.devicelabel,
        warning_temperature: socketobj.device.temperature,
      }
      this.list.splice(0, 0, item)
      this.$refs.aaa.scrollTo({ left: 0, top: 0 })
      this.$refs.bbb.scrollTo({ left: 0, top: 0 })
    },
  },
}
</script>
