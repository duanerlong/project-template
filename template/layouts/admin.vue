<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      dark
      color="primary"
      src="/admin_menu_background@2x.png"
      :clipped="clipped"
      fixed
      app
    >
      <v-list class="white--text">
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-avatar>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item @click.stop="logout">
          <v-list-item-avatar>
            <v-icon>fa-sign-in-alt</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-text="'ログアウト'" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      color="primary"
      class="white--text"
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon class="white--text" @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
      <v-spacer />
      <span>v {{ version }}</span>
    </v-app-bar>
    <v-main>
      <v-container class="pt-16">
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import packageJson from '@/package.json'
export default {
  middleware: ['auth'],
  data() {
    let drawer = true
    switch (this.$vuetify.breakpoint.name) {
      case 'xs':
      case 'sm':
      case 'md':
        drawer = false
        break
      case 'lg':
      case 'xl':
    }
    return {
      clipped: true,
      drawer,
      fixed: false,
      items: [
        // {
        //   icon: 'fa-tachometer-alt',
        //   title: 'ダッシュボード',
        //   to: '/admin',
        // },
        {
          icon: 'fa-mobile-alt',
          title: 'デバイス管理',
          to: '/admin/device',
        },
        {
          icon: 'fa-users',
          title: '顔登録者管理',
          to: '/admin/user',
        },
        {
          icon: 'fa-portrait',
          title: '登録種別管理',
          to: '/admin/category',
        },
        {
          icon: 'fa-list',
          title: 'ログ管理',
          to: '/admin/log',
        },
        {
          icon: 'fa-user-cog',
          title: '管理アカウント',
          to: '/admin/account',
        },
        {
          icon: 'fa-terminal',
          title: '指令一覧',
          to: '/admin/orderlist',
        },
        {
          icon: 'fa-cog',
          title: 'システム管理',
          to: '/admin/settings',
        },
      ],
      title: 'ActiveStreamHC管理システム',
      version: packageJson.version,
    }
  },
  methods: {
    async logout() {
      await this.$store.dispatch('auth/logout')
      this.$router.push('/login')
    },
  },
}
</script>
