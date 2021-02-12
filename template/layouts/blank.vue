<template>
  <v-app>
    <appbackground
      src="/login_background.png"
      srcset="/login_background@2x.png 2x"
    />
    <v-main>
      <v-container class="fill-height" fluid>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import appbackground from '@/components/app-background'

export default {
  components: {
    appbackground,
  },
}
</script>
