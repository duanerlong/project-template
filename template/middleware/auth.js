export default ({ route, store, redirect, error }) => {
  if (!store.getters['auth/authed']) {
    redirect('/login')
  } else {
    const authUser = store.getters['auth/authUser']
    switch (authUser.type) {
      case 0:
      case 3:
        if (new RegExp('^admin*').test(route.name)) {
          redirect('/')
        }
        break
      case 1:
      case 2:
        break
      default:
        break
    }
  }
}
