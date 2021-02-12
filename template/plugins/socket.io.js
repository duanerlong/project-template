import io from 'socket.io-client'
// const socket = io(process.env.WS_URL, {
//   autoConnect: false,
// })
const socket = () => io()

export default socket
