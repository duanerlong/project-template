export default {
  async login({ commit }, { id, password }) {
    const { data } = await this.$axios
      .post('/activestreamhc/login', {
        id,
        password,
      })
      .catch((err) => {
        return err.response
      })
    console.log(data)
    if (!data.message) {
      commit('SET_USER', data)
    }
    return data
  },

  async logout({ commit }) {
    await this.$axios.post('/activestreamhc/logout').catch((err) => {
      console.log(err)
    })
    commit('SET_USER', null)
  },
}
