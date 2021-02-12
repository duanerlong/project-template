<template>
  <v-app>
    <appbackground
      :src="'/monitor_background.jpg'"
      :srcset="'/monitor_background@2x.jpg 2x'"
    />
    <v-main>
      <v-container fill-height fluid>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import appbackground from '@/components/app-background'
export default {
  middleware: ['auth'],
  components: {
    appbackground,
  },
}
</script>
