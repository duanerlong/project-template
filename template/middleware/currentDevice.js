export default async ({ route, $axios, store, redirect, error }) => {
  console.log(route.name)
  if (route.name !== 'devices') {
    const uid = route.query.uid
    if (uid) {
      const res = await $axios
        .get(`/activestreamhc/devices/${uid}`)
        .catch((err) => {
          console.log(err)
        })
      const currentDevice = res.data.device
      store.dispatch('devices/currentDevice', {
        currentDevice,
      })
    }
    const currentDevice = store.getters['devices/currentDevice'] || {}
    if (currentDevice.serialno) {
      return
    }
    const authUser = store.getters['auth/authUser']
    switch (authUser.type) {
      case 0:
      case 3:
        redirect('/devices')
        break
      case 1:
      case 2:
        redirect('/admin')
        break
      default:
        break
    }
    // error({
    //   message: 'You are not connected',
    //   statusCode: 403,
    // })
  }
}
