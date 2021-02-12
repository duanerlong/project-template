/* eslint-disable no-console */
import { Router } from 'express'
import { Signaling } from '../models/signaling'
import { commandFactory } from '../commands/command-factory'
import { Device } from '../models/device'
import { emitter } from '../../modules/io'
import { Member } from '../models/member'
import { Settings } from '../models/settings'

const systemSettings = async () => {
  const settings = new Settings()
  const { results } = await settings.all()
  const systemSettings = results.reduce((previousValue, currentValue) => {
    previousValue[currentValue.key] = currentValue.value
    return previousValue
  }, {})
  return systemSettings
}

const router = Router()

router.get('/queues', async (req, res, next) => {
  const model = new Signaling()
  const { results } = await model.all()

  res.json({ result: true, queues: results })
})

router.post('/queues/cancel/:uid', async (req, res, next) => {
  const model = new Signaling()
  model.uid = req.params.uid
  model.status = 3
  await model.update()

  res.json({ result: true })
})

/* GET signaling listing. */
router.get('/signaling', async (req, res, next) => {
  console.log('ActiveStreamHC Get signaling', new Date().toLocaleString())
  // TODO Is it necessary to check the SerialNo
  const serialno = req.query.SerialNo
  const device = new Device()
  const deviceResult = await device.getDeviceBySerialno(serialno)
  if (deviceResult.results.length > 0) {
    device.uid = deviceResult.results[0].uid
    device.activated = true
    await device.update()
  }
  const model = new Signaling()
  const { results } = await model.getSignalingBySerialno(serialno)
  const commands = results
  if (commands.length > 0) {
    console.log(commands[0])
    let command
    const method = commands[0].method
    if (method === 'synuser') {
      command = {
        cmd: {
          id: commands[0].id,
          method: 'personManager.getPersons',
          params: {
            Condition: { Type: 1, Offset: 0, Limit: 1000 },
          },
        },
      }
    } else {
      command = await commandFactory({
        commandTypeName: commands[0].method,
        params: { id: commands[0].id, ...JSON.parse(commands[0].params) },
      })
    }
    const updateSignaling = new Signaling()
    updateSignaling.uid = commands[0].uid
    updateSignaling.status = 1
    await updateSignaling.update()
    res.json(command.cmd)
  } else {
    res.send()
  }
})

/* POST signaling listing. */
router.post('/signaling', (req, res) => {
  console.log('ActiveStreamHC Post signaling', new Date().toLocaleString())
  // TODO Is it necessary to check the SerialNo
  const serialno = req.query.SerialNo
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', async () => {
    const signalingResult = JSON.parse(body)
    const id = signalingResult.id
    const status = signalingResult.result ? 2 : -1
    console.log(signalingResult)
    const model = new Signaling()
    const { results } = await model.getSignalingBySerialnoAndId(serialno, id)
    emitter.emit('activestreamhcsignaling', {
      machineobj: { serialno },
      dbResults: results,
      signalingResult,
    })
    if (results[0].method === 'synuser') {
      const params = JSON.parse(results[0].params)
      const step = params.step
      switch (step) {
        case '1':
          if (signalingResult.params.Persons.length < 1000) {
            params.Persons = [
              ...params.Persons,
              ...signalingResult.params.Persons,
            ]
            params.step = '2'
            const updateSignaling = new Signaling()
            updateSignaling.uid = results[0].uid
            updateSignaling.params = JSON.stringify(params)
            await updateSignaling.update()
            const codes = params.Persons.map((item) => {
              return {
                Code: item.Code,
              }
            })
            // 更新 step -> 2
            res.send({
              id,
              method: 'personnelData.removePersons',
              params: codes,
            })
          } else {
            params.Persons = [
              ...params.Persons,
              ...signalingResult.params.Persons,
            ]
            const updateSignaling = new Signaling()
            updateSignaling.uid = results[0].uid
            updateSignaling.params = JSON.stringify(params)
            await updateSignaling.update()
            // 更新 step -> 1
            res.send({
              id,
              method: 'personManager.getPersons',
              params: {
                Condition: {
                  Type: 1,
                  Offset: params.Persons.length,
                  Limit: 1000,
                },
              },
            })
          }
          break
        case '2': {
          const member = new Member()
          const memberResults = await member.all({})
          if (
            memberResults.results.length > 0 &&
            memberResults.results[1].length > 0
          ) {
            const systemConfig = await systemSettings()
            const params = memberResults.results[1].map((item) => {
              return {
                Person: {
                  Type: 1,
                  CertificateType: 'IC',
                  Code: item.uid,
                  Name: item.uid,
                  Sex: item.sex.toLowerCase(),
                  URL: [
                    `http://${systemConfig.host}:${systemConfig.port}/${item.photo}`,
                  ],
                },
              }
            })
            params.step = '3'
            const updateSignaling = new Signaling()
            updateSignaling.uid = results[0].uid
            updateSignaling.params = JSON.stringify(params)
            await updateSignaling.update()
            res.send({
              id,
              method: 'personnelData.savePersons',
              params,
            })
          } else {
            await model.updateStatusBySerialnoAndId(status, serialno, id)
            res.send()
          }
          break
        }
        case '3':
          await model.updateStatusBySerialnoAndId(status, serialno, id)
          res.send()
          break

        default:
          await model.updateStatusBySerialnoAndId(status, serialno, id)
          res.send()
          break
      }
    } else {
      await model.updateStatusBySerialnoAndId(status, serialno, id)
      res.send()
    }
  })
})

export default router
