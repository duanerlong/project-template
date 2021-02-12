export default function ({ $axios }) {
  $axios.onRequest((config) => {
    config.baseURL = window.location.origin
  })
}
