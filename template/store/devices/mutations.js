export default {
  SET_DEVICES(state, devices) {
    state.list = devices
  },
  SET_CURRENT_DEVICES(state, device) {
    state.currentDevice = device
  },
}
