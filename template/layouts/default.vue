<template>
  <v-app>
    <appbackground :src="backgroundimgpath" :srcset="srcset" />
    <v-main>
      <v-container fill-height fluid>
        <v-row style="height: 100%;">
          <v-col cols="3" class="d-flex flex-column">
            <div
              class="d-flex flex-column justify-space-around"
              style="flex: 1 1 auto;"
            >
              <div>
                <!-- 時計 -->
                <div class="pa-3 d-flex justify-center">
                  <clock
                    size="16vw"
                    color="#FFFFFF"
                    bg="#484848a6"
                    border="7px solid"
                  ></clock>
                </div>
                <!-- 電子時間 -->
                <numberclock></numberclock>
              </div>
              <!-- カレンダー -->
              <todaycalendar></todaycalendar>
            </div>
          </v-col>
          <v-col cols="7" xl="8">
            <nuxt />
          </v-col>
          <v-col cols="2" xl="1">
            <rightmenu></rightmenu>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapGetters } from 'vuex'
import rightmenu from '@/components/rightmenu'
import appbackground from '@/components/app-background'
import clock from '@/components/vue-clock'
import numberclock from '@/components/numberclock'
import todaycalendar from '@/components/todaycalendar'

export default {
  middleware: ['auth', 'currentDevice'],
  components: {
    rightmenu,
    appbackground,
    numberclock,
    clock,
    todaycalendar,
  },
  data() {
    return {
      fixed: false,
    }
  },
  computed: {
    ...mapGetters({
      currentDevice: 'devices/currentDevice',
    }),
    backgroundimgpath() {
      const currentDevice = this.currentDevice || {}
      const imgPath = currentDevice.backgroundimgpath
        ? `/${currentDevice.backgroundimgpath}`
        : '/monitor_background.jpg'
      return imgPath
    },
    srcset() {
      const currentDevice = this.currentDevice || {}
      const imgPath = currentDevice.backgroundimgpath
        ? ``
        : '/monitor_background@2x.jpg 2x'
      return imgPath
    },
  },
}
</script>
