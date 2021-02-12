export default {
  async get({ commit }) {
    const res = await this.$axios
      .get('/activestreamhc/userdevices')
      .catch((err) => {
        console.log(err)
      })
    let data = []
    if (res) {
      data = res.data
    }
    commit('SET_DEVICES', data)
    commit('SET_CURRENT_DEVICES', null)
  },
  currentDevice({ commit }, { currentDevice }) {
    commit('SET_CURRENT_DEVICES', currentDevice)
  },
}
