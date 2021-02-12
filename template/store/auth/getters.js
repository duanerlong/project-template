export default {
  authed(state) {
    return !!state.authUser
  },
  authUser(state) {
    return state.authUser
  },
}
