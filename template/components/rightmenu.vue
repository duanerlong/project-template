<template>
  <div class="py-5 pr-0 mr-0 meun-wrapper">
    <v-item-group v-model="selectedIndex" mandatory style="height: 100%;">
      <div class="meun d-flex flex-column justify-center">
        <v-item v-slot: v-if="isSuperAdmin">
          <v-btn
            class="menu-item"
            :class="selectedIndex === 0 ? 'white--text' : 'grey--text'"
            :color="selectedIndex === 0 ? '#FF9800' : 'white'"
            to="/devices"
            fab
            large
          >
            <v-icon x-large>fa-home</v-icon>
          </v-btn>
        </v-item>
        <v-item v-slot:>
          <v-btn
            class="menu-item"
            :class="selectedIndex === 1 ? 'white--text' : 'grey--text'"
            :color="selectedIndex === 1 ? '#FF9800' : 'white'"
            :to="`/${path}`"
            fab
            large
          >
            <v-icon x-large>fa-video</v-icon>
          </v-btn>
        </v-item>
        <v-item v-slot: v-if="isAdmin">
          <v-btn
            class="menu-item"
            :class="selectedIndex === 2 ? 'white--text' : 'grey--text'"
            :color="selectedIndex === 2 ? '#FF9800' : 'white'"
            :to="`/list${path}`"
            fab
            large
          >
            <v-icon x-large>fa-list</v-icon>
          </v-btn>
        </v-item>
        <v-spacer />
        <v-btn class="menu-item grey--text" fab large @click="logout">
          <v-icon x-large>fa-sign-in-alt</v-icon>
        </v-btn>
      </div>
    </v-item-group>
  </div>
</template>

<style lang="scss" scoped>
.meun-wrapper {
  // width: 11rem;
  height: 100%;
  margin: auto;
}
.meun {
  align-items: center;
  height: 100%;
  .menu-item {
    padding: 4rem !important;
    font-size: 8rem !important;
    &:not(:first-child) {
      margin-top: 1.5rem;
    }
    &:last-child {
      margin-top: 5rem;
    }
    i {
      width: 100%;
      height: 100%;
    }
  }
}
</style>

<script>
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters({
      currentDevice: 'devices/currentDevice',
      authUser: 'auth/authUser',
    }),
    path() {
      const currentDevice = this.currentDevice || {}
      if (currentDevice.uid) {
        return `?uid=${currentDevice.uid}`
      }
      return ''
    },
    selectedIndex() {
      switch (this.$route.name) {
        case 'devices':
          return 0
        case 'index':
          return 1
        case 'list':
          return 2
        default:
          return 0
      }
    },
    isSuperAdmin() {
      const user = this.authUser || {}
      return user.type === 1 || user.type === 2
    },
    isAdmin() {
      const user = this.authUser || {}
      return user.type === 1 || user.type === 2 || user.type === 3
    },
  },
  methods: {
    async logout() {
      await this.$store.dispatch('auth/logout')
      this.$router.push('/login')
    },
  },
}
</script>
