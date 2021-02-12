/* eslint-disable no-console */
import { existsSync, mkdirSync, writeFile } from 'fs'
import { Router } from 'express'
import multer from 'multer'
import { emitter } from '../../modules/io'
import { VisitorRecord } from '../models/visitor-record'
import { Member } from '../models/member'
import { Device } from '../models/device'

const upload = multer()
const router = Router()

/* POST pushing listing. */
router.post('/pushing', upload.array(), async (req, res, next) => {
  console.log('ActiveStreamHC Post pushing', new Date().toLocaleString())
  // console.log(req.query)
  // console.log(typeof req.body.json);
  // const jsonobj = JSON.parse(req.body.json);
  // console.log(jsonobj.Events[0].RecognizeResults[0].PersonInfo)
  // console.log(req);
  // console.log(req.body.json);
  // console.log(req.body.picture);

  // 写真を保存
  const picture = req.body.picture
  const base64Data = picture.replace(/^data:image\/png;base64,/, '')
  const binaryData = Buffer.from(base64Data, 'base64')

  const lastdate = Date.now()
  const picturename = String(lastdate) + '.jpg'
  const filepath = process.cwd() + '/static/img/'

  if (!existsSync(filepath)) {
    try {
      mkdirSync(filepath)
    } catch (error) {
      console.error(error)
    }
  }

  writeFile(filepath + picturename, binaryData, 'binary', (err) => {
    // console.log(err); // writes out file without error, but it's not a valid image
    if (err) {
      console.error(err)
    }
  })

  // Mysqlに保存
  const bodyjson = JSON.parse(req.body.json)
  // console.log('bodyjson:',req.body.json)

  // if (_config.pushPath && _config.pushPath != '') {
  //   axios
  //     .post(_config.pushPath, bodyjson)
  //     .then((res) => {
  //       console.log('res:', res)
  //     })
  //     .catch((err) => {
  //       console.log('err:', err)
  //     })
  // }

  const dataobj = {
    uid:
      bodyjson.Events[0].RecognizeResults[0].PersonInfo.Name !== ''
        ? bodyjson.Events[0].RecognizeResults[0].PersonInfo.ID
        : '0000',
    searchscore: bodyjson.Events[0].RecognizeResults[0].SearchScore,
    picture: 'img/' + picturename,
    ismask:
      bodyjson.Events[0].RecognizeResults[0].Mouthocc === 1 ? 'あり' : 'なし',
    lastdate,
    temperature: bodyjson.Events[0].Object.Temperature,
    temperaturealarm: bodyjson.Events[0].Object.TemperatureAlarm,
    temperaturecorrection: bodyjson.Events[0].Object.TemperatureCorrection,
    temperaturecorrectionfrquency:
      bodyjson.Events[0].Object.TemperatureCorrectionFrquency,
    temperaturecorrectioninterval:
      bodyjson.Events[0].Object.TemperatureCorrectionInterval,
    temperaturemode: bodyjson.Events[0].Object.TemperatureMode,
    temperatureresult: bodyjson.Events[0].Object.TemperatureResult,
    objectage: bodyjson.Events[0].Object.Age,
    objectsex: bodyjson.Events[0].Object.Sex,
    safetyhelmet: bodyjson.Events[0].Object.SafetyHelmet,
    machinename: bodyjson.Events[0].CommInfo.MachineName,
    serialno: bodyjson.Events[0].CommInfo.SerialNo,
    timezone: bodyjson.Events[0].TimeZone,
    utc: bodyjson.Events[0].UTC,
  }

  // if (dataobj.temperature && dataobj.temperature > 0) {
  const visitorRecord = new VisitorRecord()
  Object.keys(dataobj).forEach((key) => {
    visitorRecord[key] = dataobj[key]
  })
  await visitorRecord.insert()
  // }
  const userInfo = new Member()
  const { results } = await userInfo.find(dataobj.uid)
  const deviceModel = new Device()
  const deviceResult = await deviceModel.getDeviceBySerialno(dataobj.serialno)
  let device = {}
  if (deviceResult.results.length > 0) {
    device = deviceResult.results[0]
  }

  emitter.emit('activestreamhcpushing', {
    machineobj: dataobj,
    dbresults: results,
    device,
  })
  res.send()
})

export default router
