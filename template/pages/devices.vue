<template>
  <v-item-group v-model="selectedIndex">
    <v-container>
      <v-row>
        <v-col v-for="(device, index) in devices" :key="index" cols="6">
          <v-item v-slot:default="{ active, toggle }">
            <v-card
              :color="
                currentDevice && currentDevice.serialno === device.serialno
                  ? 'primary'
                  : '#E8E8E8'
              "
              class="d-flex align-center"
              @click="
                toggle()
                setCurrentDevice(device)
              "
            >
              <v-card-text class="text--primary">
                <div class="d-flex" style="align-items: center;">
                  <deviceicon width="110" />
                  <div style="flex: 1 1 auto; text-align: center;">
                    {{ device.devicelabel || device.serialno }}
                  </div>
                </div>
              </v-card-text>
              <v-scroll-y-transition>
                <div
                  v-if="active"
                  class="display-3 flex-grow-1 text-center"
                ></div>
              </v-scroll-y-transition>
            </v-card>
          </v-item>
        </v-col>
      </v-row>
      <v-snackbar
        v-model="snackbar"
        :color="snackbarColor"
        top
        timeout="-1"
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
  </v-item-group>
</template>

<script>
import { mapGetters } from 'vuex'
import deviceicon from '@/components/device-icon'
export default {
  components: {
    deviceicon,
  },
  async asyncData({ store }) {
    await store.dispatch('devices/get', {})
    const devices = store.getters['devices/devices']
    return { devices }
  },
  data() {
    return {
      selectedIndex: null,
      snackbar: false,
      snackbarColor: '',
      snackbarMessage: '',
    }
  },
  computed: {
    ...mapGetters({
      currentDevice: 'devices/currentDevice',
    }),
  },
  created() {
    this.snackbar = this.devices.length === 0
    if (this.snackbar) {
      this.snackbarColor = 'error'
      this.snackbarMessage =
        'アクセスできるデバイスが存在しません。管理者へ連絡してください。'
    }
  },
  methods: {
    async setCurrentDevice(currentDevice) {
      const res = await this.$axios
        .get(`/activestreamhc/devices/${currentDevice.uid}`)
        .catch((err) => {
          console.log(err)
        })
      const device = res.data.device
      if (device.activated) {
        this.$router.push({
          name: 'index',
          query: { uid: currentDevice.uid },
        })
      } else {
        this.selectedIndex = null
        this.snackbar = true
        this.snackbarColor = 'error'
        this.snackbarMessage =
          'デバイスがオフラインの状態ですので、しばらくたってから、もう一回試してください。'
      }
    },
  },
}
</script>
