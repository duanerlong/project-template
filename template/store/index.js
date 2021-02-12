export const state = () => ({
  counter: 0,
})
export const mutations = {
  increment(state) {
    state.counter++
  },
}
export const actions = {
  // nuxtServerInit is called by Nuxt.js before server-rendering every page
  nuxtServerInit({ commit }, { req }) {
    if (req.session && req.session.authUser) {
      commit('auth/SET_USER', req.session.authUser)
    }
  },
}
