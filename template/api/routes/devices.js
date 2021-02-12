/* eslint-disable no-console */
import { existsSync, mkdirSync } from 'fs'
import { Router } from 'express'
import multer from 'multer'
import moment from 'moment'
import { generateFilename } from '../common/utils'
import { Device } from '../models/device'
import { Signaling } from '../models/signaling'
import { Sequence } from '../models/sequence'
import { AccountDeviceRelationship } from '../models/account-device-relationship'
import { DeviceManager } from '../common/device-manager'
import { DeviceAgent } from '../common/device-agent'
import { Settings } from '../models/settings'
import { Processing } from '../models/processing'
import { path } from '..'

const systemSettings = async () => {
  const settings = new Settings()
  const { results } = await settings.all()
  const systemSettings = results.reduce((previousValue, currentValue) => {
    previousValue[currentValue.key] = currentValue.value
    return previousValue
  }, {})
  return systemSettings
}

const backgroundpath = `${process.cwd()}/static/background/`
if (!existsSync(backgroundpath)) {
  try {
    mkdirSync(backgroundpath)
  } catch (error) {
    console.error(error)
  }
}

const router = Router()
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, backgroundpath)
  },
  filename: (req, file, cb) => {
    const fileName = `${generateFilename('background')}.${file.mimetype.replace(
      'image/',
      ''
    )}`
    cb(null, fileName)
  },
})

/* GET devices listing. */
router.get('/devices', async (req, res, next) => {
  const model = new Device()
  const { results } = await model.all()
  res.json(results)
})

router.get('/userdevices', async (req, res, next) => {
  const authUser = req.session.authUser
  const model = new Device()
  const { results } = await model.getDevicesByAccount(authUser)
  res.json(results)
})

router.get('/devices/:uid', async (req, res, next) => {
  const model = new Device()
  const { results } = await model.find(req.params.uid)

  let device = {}
  if (results.length > 0) {
    device = results[0]
    const diff = moment().diff(moment(device.updated_at), 's')
    // 「30」は端末に設定したsignalingのタイマー
    if (diff > 30) {
      device.activated = 0
    } else {
      device.activated = 1
    }
  }

  res.json({ result: true, device })
})

router.delete('/devices/:uid', async (req, res, next) => {
  const uid = req.params.uid
  const device = new Device()
  device.uid = uid
  device.host = '0.0.0.0'
  device.deleted = true
  await device.update()

  res.json({ result: true })
})

router.get('/device/accounts/:serialno', async (req, res, next) => {
  console.log(req.params.serialno)
  const model = new AccountDeviceRelationship()
  const { results } = await model.getAccountsByDevice(req.params.serialno)
  res.json({ result: true, accounts: results })
})

router.delete('/device/accounts/delete', async (req, res, next) => {
  const uid = req.body.uid
  const model = new AccountDeviceRelationship()
  model.uid = uid
  await model.delete()
  res.json({ result: true })
})

router.post(
  '/devices/update/:uid',
  multer({
    storage,
  }).single('file'),
  async (req, res, next) => {
    const devicename = req.body.devicename
    const model = new Device()
    const { results } = await model.find(req.params.uid)

    if (results.length > 0) {
      const device = results[0]
      const sequence = new Sequence()
      const serialno = device.serialno

      if (device.devicelabel !== req.body.devicelabel) {
        model.devicelabel = req.body.devicelabel
      }
      if (!!devicename && device.devicename !== devicename) {
        model.devicename = devicename
        const signaling = new Signaling()
        const id = await sequence.nextval(serialno)
        signaling.serialno = serialno
        signaling.id = id
        signaling.method = 'DeviceNameCommand'
        signaling.params = JSON.stringify({ devicename })
        await signaling.insert()
      }
      model.uid = req.params.uid
      if (req.file) {
        model.backgroundimgpath = `background/${req.file.filename}`
      }
      model.temperature = req.body.temperature
      await model.update()
    }

    res.json({ result: true })
  }
)

router.post('/devices/temperature', async (req, res, next) => {
  const temperature = req.body.temperature
  const model = new Device()
  const { results } = await model.all('both')
  results.forEach(async (device) => {
    const updateDevice = new Device()
    updateDevice.uid = device.uid
    updateDevice.temperature = temperature
    await updateDevice.update()
    const sequence = new Sequence()
    const serialno = device.serialno
    const signaling = new Signaling()
    const id = await sequence.nextval(serialno)
    signaling.serialno = serialno
    signaling.id = id
    signaling.method = 'TemperatureCommand'
    signaling.params = JSON.stringify({ temperature })
    await signaling.insert()
  })
  res.json({ result: true })
})

router.post('/devices/lampinfo/:uid', async (req, res, next) => {
  const model = new Device()
  const { results } = await model.find(req.params.uid)
  if (results.length > 0) {
    const device = results[0]
    const serialno = device.serialno
    const method = 'LampInfoCommand'
    const signaling = new Signaling()
    const queryResult = await signaling.getSignalingBySerialnoAndMethod(
      serialno,
      method
    )
    if (queryResult.results.length === 0) {
      const sequence = new Sequence()
      const id = await sequence.nextval(serialno)
      signaling.serialno = serialno
      signaling.id = id
      signaling.method = method
      signaling.params = JSON.stringify({})
      await signaling.insert()
    }
  }
  res.json({ result: true })
})

router.post('/devices/togglelamp/:uid', async (req, res, next) => {
  const toggle = req.body.toggle
  const model = new Device()
  let result = { result: true }
  const { results } = await model.find(req.params.uid)
  if (results.length > 0) {
    const device = results[0]
    const serialno = device.serialno
    const method = 'LampCommand'
    const signaling = new Signaling()
    const queryResult = await signaling.getSignalingBySerialnoAndMethod(
      serialno,
      method
    )
    if (queryResult.results.length === 0) {
      const sequence = new Sequence()
      const id = await sequence.nextval(serialno)
      signaling.serialno = serialno
      signaling.id = id
      signaling.method = 'LampCommand'
      signaling.params = JSON.stringify({ toggle })
      await signaling.insert()
    } else {
      result = {
        error: true,
        message:
          '同じ操作が繰り返しています、しばらく経ってから再度をお試しください。',
      }
    }
  }
  res.json(result)
})

router.get('/device/discover', async (req, res, next) => {
  const processing = new Processing()
  const processName = 'discover'
  const processResult = await processing.getByName(processName)
  res.json({ result: true, processing: processResult.results.length > 0 })
})

router.post('/devices/discover', async (req, res, next) => {
  const target = req.body.target
  console.log(target)
  const processing = new Processing()
  const processName = 'discover'
  const processResult = await processing.getByName(processName)
  if (processResult.results.length > 0) {
    res.json({ result: true })
    return
  }
  processing.name = processName
  await processing.insert()
  setTimeout(async () => {
    console.log('start', new Date())
    const systemConfig = await systemSettings()
    const ipList = []
    if (target) {
      ipList.push(target)
    } else {
      const array = systemConfig.host.split('.')
      for (let index = 1; index <= 255; index++) {
        const host = `${array[0]}.${array[1]}.${array[2]}.${index}`
        ipList.push(host)
      }
    }
    let model = new Device()
    const { results } = await model.all('both')
    const ignoreDevices = results.map((item) => item.serialno)
    const ignoreDevicesMap = results.reduce((preVal, currVal) => {
      preVal[currVal.serialno] = currVal
      return preVal
    }, {})
    const devices = await DeviceManager.discover(ipList)
    const hostMap = devices.reduce((pre, curr) => {
      pre[curr[2]] = curr[7]
      return pre
    }, {})
    const insertDevices = devices.filter((item) => {
      return !ignoreDevices.includes(item[2])
    })
    if (insertDevices.length > 0) {
      model = new Device()
      await model.insertBatch(insertDevices)
    }
    const updateDevices = devices.filter((item) => {
      return ignoreDevices.includes(item[2])
    })
    for (let index = 0; index < updateDevices.length; index++) {
      const element = updateDevices[index]
      const updateDevice = new Device()
      updateDevice.uid = ignoreDevicesMap[element[2]].uid
      updateDevice.host = element[7]
      updateDevice.activated = true
      updateDevice.deleted = false
      await updateDevice.update()
    }
    const devicesResult = await model.all()
    for (let index = 0; index < devicesResult.results.length; index++) {
      const device = devicesResult.results[index]
      const deviceHost = hostMap[device.serialno] || device.host
      const tryDevices = await DeviceManager.discover([deviceHost])
      if (tryDevices.length > 0) {
        const deviceAgent = new DeviceAgent({ ...device, host: deviceHost })
        await deviceAgent.setHTTPReverse(
          `http://${systemConfig.host}:${systemConfig.port}${path}/signaling`,
          `http://${systemConfig.host}:${systemConfig.port}${path}/pushing`
        )
        await deviceAgent.setTimeSetting()
        const devicename = device.devicename || 'ようこそ'
        const temperature = device.temperature || 37.4
        await deviceAgent.setName(devicename)
        await deviceAgent.setTemperature(temperature)
        model = new Device()
        model.uid = device.uid
        model.devicename = devicename
        model.temperature = temperature
        model.deleted = false
        model.activated = true
        await model.update()
      } else {
        model = new Device()
        model.uid = device.uid
        model.activated = false
      }
      model.host = deviceHost
      await model.update()
    }
    console.log('end', new Date())

    await processing.delete()
  }, 0)
  res.json({ result: true })
})

export default router
