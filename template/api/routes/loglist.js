/* eslint-disable no-console */
import {
  existsSync,
  mkdirSync,
  writeFileSync,
  appendFileSync,
  readdirSync,
  lstatSync,
  unlinkSync,
} from 'fs'
import { Router } from 'express'
import { Parser as Json2csvParser } from 'json2csv'
import { Member } from '../models/member'
import { VisitorRecord } from '../models/visitor-record'
import { Signaling } from '../models/signaling'
import { OperationLog } from '../models/operation-log'

const router = Router()
router.post('/logcsv', async (req, res, next) => {
  const inputData = req.body
  const visitorRecord = new VisitorRecord()
  const { results } = await visitorRecord.getLogsByConditions(inputData)
  const logData = results[1]
  if (logData.length > 0) {
    const json2csvParser = new Json2csvParser({ header: true })
    const csv = json2csvParser.parse(results[1])
    const filepath = process.cwd() + '/static/csv/'
    if (!existsSync(filepath)) {
      mkdirSync(filepath)
    }
    const lastdate = Date.now()
    const csvFileName = String(lastdate) + '.csv'
    writeFileSync(`${filepath}${csvFileName}`, '\uFEFF')
    appendFileSync(`${filepath}${csvFileName}`, csv)
    res.send({ filePath: `csv/${csvFileName}` })
  } else {
    res.send({})
  }
})

router.post('/loglist', async (req, res, next) => {
  const inputData = req.body
  const visitorRecord = new VisitorRecord()
  const { results } = await visitorRecord.getLogsByConditions(inputData)
  res.send(results)
})

router.get('/logs/attendance-of-monthly', async (req, res, next) => {
  const targetDate = req.query.date || new Date().toLocaleDateString()
  const visitorRecord = new VisitorRecord()
  const { results } = await visitorRecord.attendanceOfMonthly(targetDate)
  res.send(results)
})

router.delete('/logs', async (req, res) => {
  const filepath = `${process.cwd()}/static/img/`
  deleteFolderRecursive(filepath)

  const visitorRecord = new VisitorRecord()
  const queues = new Signaling()
  try {
    await visitorRecord.deleteAll()
    await queues.deleteAll()
    res.send({ result: true })
  } catch (error) {
    res.send({ error: '削除失敗しました。' })
  }
})

router.put('/logs/modify-uid', async (req, res) => {
  const inputData = req.body
  const uid = inputData.uid
  const member = new Member()
  const memberResults = await member.find(uid)
  const visitorRecord = new VisitorRecord()
  const visitorRecordResults = await visitorRecord.findById(inputData.item.id)
  if (
    memberResults.results.length > 0 &&
    visitorRecordResults.results.length > 0
  ) {
    console.log(visitorRecordResults.results[0])
    visitorRecord.uid = uid
    await visitorRecord.updateById(inputData.item.id)
    const newVisitorRecordResults = await visitorRecord.findById(
      inputData.item.id
    )
    const operationLog = new OperationLog()
    operationLog.type = 'modify-uid'
    operationLog.content = JSON.stringify({
      original: visitorRecordResults.results[0],
      modified: newVisitorRecordResults.results[0],
    })
    await operationLog.insert()
  }
  res.send({ result: true })
})

const deleteFolderRecursive = (path) => {
  if (existsSync(path)) {
    readdirSync(path).forEach((file, index) => {
      const curPath = path + '/' + file
      if (lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath)
      } else {
        // delete file
        unlinkSync(curPath)
      }
    })
  }
}

export default router
