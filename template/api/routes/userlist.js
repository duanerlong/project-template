/* eslint-disable no-console */
import {
  existsSync,
  mkdirSync,
  copyFileSync,
  unlinkSync,
  rmdirSync,
  writeFileSync,
} from 'fs'
import { Router } from 'express'
import multer from 'multer'
import moment from 'moment'
import { Member } from '../models/member'
import { MemberSettings } from '../models/member-settings'
import { generateFilename, generateUserUid } from '../common/utils'
import { Message } from '../models/message'
import { VisitorRecord } from '../models/visitor-record'
import { Device } from '../models/device'
import { Sequence } from '../models/sequence'
import { Signaling } from '../models/signaling'
import { Settings } from '../models/settings'
import { OperationLog } from '../models/operation-log'

const systemSettings = async () => {
  const settings = new Settings()
  const { results } = await settings.all()
  const systemSettings = results.reduce((previousValue, currentValue) => {
    previousValue[currentValue.key] = currentValue.value
    return previousValue
  }, {})
  return systemSettings
}

const userimgpath = `${process.cwd()}/static/userimg/`
if (!existsSync(userimgpath)) {
  try {
    mkdirSync(userimgpath)
  } catch (error) {
    console.error(error)
  }
}

const router = Router()
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userimgpath)
  },
  filename: (req, file, cb) => {
    const fileName = `${generateFilename('userimg')}.${file.mimetype.replace(
      'image/',
      ''
    )}`
    cb(null, fileName)
  },
})

router.get('/user/:uid', async (req, res, next) => {
  const model = new Member()
  const { results } = await model.find(req.params.uid)

  let member = {}
  if (results.length > 0) {
    member = results[0]
  }

  res.json({ result: true, member })
})

router.post(
  '/useradd',
  multer({
    storage,
  }).single('file'),
  async (req, res, next) => {
    const uid = generateUserUid()

    const model = new Member()
    const member = JSON.parse(req.body.member)
    const birthday = member.birthday
    const sex = member.sex
    model.uid = uid
    model.name = member.name
    model.birthday = birthday
    model.sex = sex
    model.state = member.state
    model.deviceserialno = member.deviceserialno
    if (req.file) {
      model.photo = `userimg/${req.file.filename}`
    } else if (member.photo) {
      const imagePath = `${process.cwd()}/static/${member.photo}`
      if (existsSync(imagePath)) {
        const userPhotoName = `${generateFilename('userimg')}.jpg`
        model.photo = `userimg/${userPhotoName}`
        copyFileSync(
          imagePath,
          `${process.cwd()}/static/userimg/${userPhotoName}`
        )
      }
    }
    model.item1 = member.item1
    model.item2 = member.item2
    model.item3 = member.item3
    model.item4 = member.item4
    model.item5 = member.item5
    model.item6 = member.item6
    model.item7 = member.item7
    model.item8 = member.item8
    model.item9 = member.item9
    model.item10 = member.item10

    if (model.photo) {
      const person = {
        Type: 1,
        CertificateType: 'IC',
        Code: uid,
        Name: uid,
        Sex: sex.toLowerCase(),
        Birthday: birthday,
      }

      const systemConfig = await systemSettings()

      const sequence = new Sequence()

      const params = [
        {
          Person: {
            ...person,
            URL: [
              `http://${systemConfig.host}:${systemConfig.port}/${model.photo}`,
            ],
          },
        },
      ]

      const deviceModel = new Device()
      const { results } = await deviceModel.all()
      for (let index = 0; index < results.length; index++) {
        const device = results[index]

        const serialno = device.serialno
        const signaling = new Signaling()
        const id = await sequence.nextval(serialno)
        signaling.serialno = serialno
        signaling.id = id
        signaling.method = 'SavePersonsCommand'
        signaling.params = JSON.stringify({ params })
        await signaling.insert()
      }
    }

    if (member.id) {
      const visitorRecord = new VisitorRecord()
      visitorRecord.uid = uid
      await visitorRecord.updateById(member.id)
    }

    await model.insert()

    res.json({ result: true })
  }
)

router.post(
  '/useradd/batch',
  multer().array('files'),
  async (req, res, next) => {
    console.log(new Date().getTime())
    const members = JSON.parse(req.body.members)
    members.map((item) => {
      item.length = 14
      item.splice(0, 0, req.body.state)
      item.splice(0, 0, generateUserUid())
      return item
    })
    const tmpPath = `${process.cwd()}/static/userimg/${new Date().getTime()}`
    if (!existsSync(tmpPath)) {
      try {
        mkdirSync(tmpPath)
      } catch (error) {
        console.error(error)
      }
    }
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i]
      const fileName = file.originalname
      if (
        new RegExp('.jpg$').test(fileName.toLowerCase()) &&
        new RegExp('^(?![.])').test(fileName.toLowerCase())
      ) {
        writeFileSync(`${tmpPath}/${fileName}`, file.buffer)
      }
    }
    const birthdayIndex = 6
    const photoIndex = 5
    const sexIndex = 4
    const sexMap = {
      男: 'Male',
      女: 'Female',
    }
    for (let index = 0; index < members.length; index++) {
      const fields = members[index]
      const imagePath = `${tmpPath}/${fields[photoIndex]}`
      if (existsSync(imagePath)) {
        const userPhotoName = `${generateFilename('userimg')}.jpg`
        fields[photoIndex] = `userimg/${userPhotoName}`
        copyFileSync(
          imagePath,
          `${process.cwd()}/static/userimg/${userPhotoName}`
        )
        unlinkSync(imagePath)
      } else {
        fields[photoIndex] = null
      }
      fields[sexIndex] = sexMap[fields[sexIndex]]
      const birthdayStr = (fields[birthdayIndex] || '').replace(/\//g, '-')
      if (moment(birthdayStr).isValid()) {
        fields[birthdayIndex] = birthdayStr
      } else {
        fields[birthdayIndex] = null
      }
    }
    if (existsSync(tmpPath)) {
      rmdirSync(tmpPath)
    }
    if (members.length > 0) {
      const systemConfig = await systemSettings()
      const sequence = new Sequence()
      const params = members.map((item) => {
        return {
          Person: {
            Type: 1,
            CertificateType: 'IC',
            Code: item[0],
            Name: item[0],
            Sex: item[4].toLowerCase(),
            URL: [
              `http://${systemConfig.host}:${systemConfig.port}/${item[photoIndex]}`,
            ],
          },
        }
      })

      const deviceModel = new Device()
      const { results } = await deviceModel.all()
      for (let index = 0; index < results.length; index++) {
        const device = results[index]

        const serialno = device.serialno
        const signaling = new Signaling()
        const id = await sequence.nextval(serialno)
        signaling.serialno = serialno
        signaling.id = id
        signaling.method = 'SavePersonsCommand'
        signaling.params = JSON.stringify({ params })
        await signaling.insert()
      }
      const member = new Member()
      await member.insertBatch(members)
    }

    res.json({
      result: true,
    })
  }
)

router.post('/synuser', async (req, res, next) => {
  const sequence = new Sequence()
  const deviceModel = new Device()
  const deviceResults = await deviceModel.all()
  for (let index = 0; index < deviceResults.results.length; index++) {
    const device = deviceResults.results[index]

    const serialno = device.serialno
    const signaling = new Signaling()
    const id = await sequence.nextval(serialno)
    signaling.serialno = serialno
    signaling.id = id
    signaling.method = 'synuser'
    // 1 get Persons
    // 2 delete Persons
    // 3 save Persons
    signaling.params = JSON.stringify({ Persons: [], step: '1' })
    await signaling.insert()
  }
  res.json({ result: true })
})

router.post(
  '/userupdate/:uid',
  multer({
    storage,
  }).single('file'),
  async (req, res, next) => {
    const uid = req.params.uid
    const member = JSON.parse(req.body.member)
    const birthday = member.birthday
    const sex = member.sex
    const model = new Member()
    model.uid = uid
    model.name = member.name
    model.birthday = member.birthday
    model.state = member.state
    model.sex = member.sex
    model.item1 = member.item1
    model.item2 = member.item2
    model.item3 = member.item3
    model.item4 = member.item4
    model.item5 = member.item5
    model.item6 = member.item6
    model.item7 = member.item7
    model.item8 = member.item8
    model.item9 = member.item9
    model.item10 = member.item10

    if (req.file) {
      model.photo = `userimg/${req.file.filename}`
    }

    if (member.photo) {
      const person = {
        Type: 1,
        CertificateType: 'IC',
        Code: uid,
        Name: uid,
        Sex: sex.toLowerCase(),
        Birthday: birthday,
      }

      const systemConfig = await systemSettings()

      const sequence = new Sequence()

      const params = [
        {
          Person: {
            ...person,
            URL: [
              `http://${systemConfig.host}:${systemConfig.port}/${model.photo}`,
            ],
          },
        },
      ]

      const deviceModel = new Device()
      const { results } = await deviceModel.all()
      for (let index = 0; index < results.length; index++) {
        const device = results[index]

        const serialno = device.serialno
        const signaling = new Signaling()
        const id = await sequence.nextval(serialno)
        signaling.serialno = serialno
        signaling.id = id
        signaling.method = 'SavePersonsCommand'
        signaling.params = JSON.stringify({ params })
        await signaling.insert()
      }
    }

    await model.update()

    res.json({ result: true })
  }
)

router.post('/userdelete/:uid', async (req, res, next) => {
  const model = new Member()
  const uid = req.params.uid
  const { results } = await model.find(uid)
  let member = {}
  if (results.length > 0) {
    member = results[0]
    if (member.photo) {
      const imagePath = `${process.cwd()}/static/${member.photo}`
      if (existsSync(imagePath)) {
        unlinkSync(imagePath)
      }
    }
    model.uid = uid
    await model.delete()
    const message = new Message()
    await message.deleteMessagesByUser(uid)

    const visitorRecord = new VisitorRecord()
    visitorRecord.uid = '0000'
    await visitorRecord.updateUidByUid(uid)

    const person = {
      Code: uid,
    }
    const sequence = new Sequence()

    const params = [person]

    const deviceModel = new Device()
    const deviceResult = await deviceModel.all()
    for (let index = 0; index < deviceResult.results.length; index++) {
      const device = deviceResult.results[index]

      const serialno = device.serialno
      const signaling = new Signaling()
      const id = await sequence.nextval(serialno)
      signaling.serialno = serialno
      signaling.id = id
      signaling.method = 'RemovePersonsCommand'
      signaling.params = JSON.stringify({ params })
      await signaling.insert()
    }
  }

  res.json({ result: true })
})

router.post('/userbatchdelete', async (req, res, next) => {
  const model = new Member()
  const uidList = req.body.uidList
  const { results } = await model.getByUidList(uidList)
  const params = []
  for (let index = 0; index < results.length; index++) {
    const member = results[index]
    const uid = member.uid
    if (member.photo) {
      const imagePath = `${process.cwd()}/static/${member.photo}`
      if (existsSync(imagePath)) {
        unlinkSync(imagePath)
      }
    }
    const memberDelete = new Member()
    memberDelete.uid = uid
    await memberDelete.delete()
    const message = new Message()
    await message.deleteMessagesByUser(uid)

    const visitorRecord = new VisitorRecord()
    visitorRecord.uid = '0000'
    await visitorRecord.updateUidByUid(uid)

    const person = {
      Code: uid,
    }

    params.push(person)
  }

  if (params.length > 0) {
    const deviceModel = new Device()
    const deviceResult = await deviceModel.all()
    for (let index = 0; index < deviceResult.results.length; index++) {
      const device = deviceResult.results[index]

      const serialno = device.serialno
      const signaling = new Signaling()

      const sequence = new Sequence()
      const id = await sequence.nextval(serialno)
      signaling.serialno = serialno
      signaling.id = id
      signaling.method = 'RemovePersonsCommand'
      signaling.params = JSON.stringify({ params })
      await signaling.insert()
    }
  }

  res.json({ result: true })
})

router.get('/usersettings', async (req, res, next) => {
  const model = new MemberSettings()
  const { results } = await model.all()

  res.json({ result: true, settings: results })
})

router.post('/usersettings', async (req, res, next) => {
  console.log(req.body)
  const settings = req.body.settings || []
  for (let index = 0; index < settings.length; index++) {
    const element = settings[index]
    const model = new MemberSettings()
    model.uid = element.uid
    model.label = element.label
    model.required = element.required
    await model.update()
  }

  res.json({ result: true })
})

router.post('/userlist', async (req, res, next) => {
  const inputData = req.body
  const member = new Member()
  const { results } = await member.all(inputData)
  res.json(results)
})

router.put('/userupdatephoto', async (req, res, next) => {
  const inputData = req.body
  const uid = inputData.uid
  const member = new Member()
  const memberResults = await member.find(uid)
  if (memberResults.results.length > 0) {
    member.uid = uid
    const imagePath = `${process.cwd()}/static/${inputData.item.photo}`
    if (existsSync(imagePath)) {
      const userPhotoName = `${generateFilename('userimg')}.jpg`
      member.photo = `userimg/${userPhotoName}`
      copyFileSync(
        imagePath,
        `${process.cwd()}/static/userimg/${userPhotoName}`
      )
      await member.update()
      const person = {
        Type: 1,
        CertificateType: 'IC',
        Code: uid,
        Name: uid,
        Sex: memberResults.results[0].sex.toLowerCase(),
        Birthday: memberResults.results[0].birthday,
      }

      const systemConfig = await systemSettings()

      const sequence = new Sequence()

      const params = [
        {
          Person: {
            ...person,
            URL: [
              `http://${systemConfig.host}:${systemConfig.port}/${member.photo}`,
            ],
          },
        },
      ]

      const deviceModel = new Device()
      const { results } = await deviceModel.all()
      for (let index = 0; index < results.length; index++) {
        const device = results[index]

        const serialno = device.serialno
        const signaling = new Signaling()
        const id = await sequence.nextval(serialno)
        signaling.serialno = serialno
        signaling.id = id
        signaling.method = 'SavePersonsCommand'
        signaling.params = JSON.stringify({ params })
        await signaling.insert()
      }

      const newMemberResults = await member.find(uid)
      const operationLog = new OperationLog()
      operationLog.type = 'userupdatephoto'
      operationLog.content = JSON.stringify({
        original: memberResults.results[0],
        modified: newMemberResults.results[0],
      })
      await operationLog.insert()
    }
  }
  res.json({ result: true })
})

export default router
