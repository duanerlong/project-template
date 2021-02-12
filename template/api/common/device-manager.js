import os from 'os'
import axios from 'axios'
import { generateUid } from './utils'

export class DeviceManager {
  static addresses() {
    const addresses = []
    const ifaces = os.networkInterfaces() || {}
    Object.keys(ifaces).forEach((ifname) => {
      let alias = 0
      ;(ifaces[ifname] || []).forEach((iface) => {
        if (iface.family !== 'IPv4' || iface.internal !== false) {
          // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
          return
        }

        if (alias >= 1) {
          // this single interface has multiple ipv4 addresses
          addresses.push(iface.address)
        } else {
          // this interface has only one ipv4 adress
          addresses.push(iface.address)
        }
        ++alias
      })
    })
    return addresses
  }

  static discover(addresses = []) {
    return new Promise((resolve, reject) => {
      try {
        const targets = addresses.map((host) => {
          return new Promise((resolve, reject) => {
            const source = axios.CancelToken.source()
            setTimeout(() => {
              source.cancel()
            }, 1500)
            axios
              .create({
                baseURL: `http://${host}/`,
                timeout: 1500,
              })
              .post(`/api/common/discover`, null, { cancelToken: source.token })
              .then((res) => {
                resolve({ deviceInfo: res.data, host })
              })
              .catch(() => {
                resolve({ host })
              })
          })
        })
        Promise.all(targets).then((values) => {
          const devices = values
            .filter((item) => {
              return item.deviceInfo && item.deviceInfo.Activated
            })
            .map((item) => {
              return [
                generateUid(),
                item.deviceInfo.SerialNumber,
                item.deviceInfo.SerialNumber,
                item.deviceInfo.DeviceClass,
                item.deviceInfo.DeviceType,
                item.deviceInfo.Version,
                item.deviceInfo.Activated,
                item.host,
              ]
            })
          resolve(devices)
        })
      } catch (error) {
        reject(error)
      }
    })
  }
}
