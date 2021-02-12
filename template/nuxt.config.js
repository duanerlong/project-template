import colors from 'vuetify/es5/util/colors'

export default {
  /*
   ** Nuxt rendering mode
   ** See https://nuxtjs.org/api/configuration-mode
   */
  mode: 'universal',
  /*
   ** Nuxt target
   ** See https://nuxtjs.org/api/configuration-target
   */
  target: 'server',
  /*
   ** Headers of the page
   ** See https://nuxtjs.org/api/configuration-head
   */
  head: {
    // titleTemplate: '%s - ' + process.env.npm_package_name,
    // title: process.env.npm_package_name || '',
    titleTemplate: '%s - ' + 'Active Stream HC',
    title: 'Active Stream HC',
    htmlAttrs: {
      lang: 'ja',
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        hid: 'description',
        name: 'description',
        content: process.env.npm_package_description || '',
      },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
  },
  /*
   ** Global CSS
   */
  css: ['@/assets/style.css'],
  /*
   ** Plugins to load before mounting the App
   ** https://nuxtjs.org/guide/plugins
   */
  plugins: [
    { src: '@/plugins/axios.client.js' },
    { src: '@/plugins/filter.js' },
    { src: '@/plugins/vue-chartjs.client.js' },
  ],
  /*
   ** Auto import components
   ** See https://nuxtjs.org/api/configuration-components
   */
  components: true,
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    '@nuxtjs/eslint-module',
    // Doc: https://github.com/nuxt-community/stylelint-module
    '@nuxtjs/stylelint-module',
    '@nuxtjs/vuetify',
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa',
    '@/modules/api',
    '@/modules/io',
  ],
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: process.env.API_URL,
    browserBaseURL: process.env.API_URL_BROWSER,
  },
  /*
   ** vuetify module configuration
   ** https://github.com/nuxt-community/vuetify-module
   */
  vuetify: {
    customVariables: [
      '@/assets/variables.scss',
      '@fortawesome/fontawesome-free/css/all.css',
    ],
    treeShake: true,
    icons: {
      iconfont: 'fa', // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4' || 'faSvg'
      values: {
        menu: 'fas fa-bars',
      },
    },
    defaultAssets: false,
    theme: {
      // dark: true,
      themes: {
        light: {
          primary: colors.deepPurple.accent4,
          accent: colors.cyan,
          secondary: colors.blue.darken4,
          info: '#007bff',
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent4,
        },
        dark: {
          primary: colors.deepPurple.accent4,
          accent: colors.cyan,
          secondary: colors.blue.darken4,
          info: '#007bff',
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent4,
        },
      },
    },
  },
  /*
   ** Build configuration
   ** See https://nuxtjs.org/api/configuration-build/
   */
  build: {},
  telemetry: false,
  serverMiddleware: [],
  env: {},
  pwa: {
    manifest: {
      name: 'Active Stream HC',
      short_name: 'AS HC',
      lang: 'ja',
      display: 'fullscreen',
    },
  },
}
