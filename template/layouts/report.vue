<template>
  <v-app>
    <v-main>
      <v-container class="fill-height justify-center" fluid style="padding: 0;">
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  middleware: ['auth'],
}
</script>
