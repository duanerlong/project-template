import http from 'http'
import socketIO from 'socket.io'

const events = require('events')
export const emitter = new events.EventEmitter()

export default function () {
  this.nuxt.hook('render:before', (renderer) => {
    const server = http.createServer(this.nuxt.renderer.app)
    const io = socketIO(server)
    emitter.on('activestreamhcpushing', (data) => {
      io.to(data.machineobj.serialno).emit('activestreamhcpushing', data)
    })
    emitter.on('activestreamhcsignaling', (data) => {
      io.to(data.machineobj.serialno).emit('activestreamhcsignaling', data)
    })

    // overwrite nuxt.server.listen()
    this.nuxt.server.listen = (port, host) =>
      new Promise((resolve) =>
        server.listen(port || 3000, host || '0.0.0.0', resolve)
      )
    // close this server on 'close' event
    this.nuxt.hook('close', () => new Promise(server.close))

    // Add socket.io events
    io.on('connection', (socket) => {
      socket.on('join', (data) => {
        socket.join(data)
      })
      socket.on('leave', (data) => {
        socket.leave(data)
      })
      socket.on('disconnect', () => {})
    })
  })
}
