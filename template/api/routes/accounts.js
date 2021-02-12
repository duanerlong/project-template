/* eslint-disable no-console */
import { existsSync, mkdirSync, unlinkSync } from 'fs'
import { Router } from 'express'
import multer from 'multer'
import moment from 'moment'
import { Account } from '../models/account'
import { generateUid, generateFilename } from '../common/utils'
import { AccountDeviceRelationship } from '../models/account-device-relationship'

const accountimgpath = `${process.cwd()}/static/accountimg/`
if (!existsSync(accountimgpath)) {
  try {
    mkdirSync(accountimgpath)
  } catch (error) {
    console.error(error)
  }
}

const router = Router()
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, accountimgpath)
  },
  filename: (req, file, cb) => {
    const fileName = `${generateFilename('userimg')}.${file.mimetype.replace(
      'image/',
      ''
    )}`
    cb(null, fileName)
  },
})

/* GET account listing. */
router.get('/accounts', async (req, res, next) => {
  const model = new Account()
  const { results } = await model.all()

  res.json(results)
})

router.get('/account/:uid', async (req, res, next) => {
  const model = new Account()
  const { results } = await model.find(req.params.uid)

  let account = {}
  if (results.length > 0) {
    account = results[0]
    const accountDeviceRelationship = new AccountDeviceRelationship()
    const queryResults = await accountDeviceRelationship.getDevicesByAccount(
      account.uid
    )
    account.devices = queryResults.results.map((item) => item.serialno)
  }

  res.json({ result: true, account })
})

router.post('/accountadd', async (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  const model = new Account()
  model.email = email
  model.password = password
  await model.insert()
  res.json({ result: true })
})

router.post(
  '/accountupdateinfo/:uid',
  multer({
    storage,
  }).single('file'),
  async (req, res, next) => {
    const model = new Account()
    const account = JSON.parse(req.body.account)
    model.uid = req.params.uid
    model.email = account.email
    model.password = account.password
    model.name = account.name
    if (req.file) {
      model.photo = `accountimg/${req.file.filename}`
    }
    await model.update()
    res.json({ result: true })
  }
)

router.post('/accountupdatetype/:uid', async (req, res, next) => {
  const uid = req.params.uid
  const type = req.body.type
  let devices = req.body.devices
  if (typeof devices === 'string') {
    devices = [devices]
  }
  const values = devices.map((item) => {
    return [generateUid(), uid, item]
  })
  const accountDeviceRelationship = new AccountDeviceRelationship()
  await accountDeviceRelationship.deleteDevicesByAccount(uid)
  if (values.length > 0) {
    await accountDeviceRelationship.insertBatch(values)
  }

  const account = new Account()
  account.uid = uid
  account.type = type
  await account.update()
  res.json({ result: true })
})

/* Upadte account. */
router.put('/accounts/update', async (req, res, next) => {
  const uid = req.body.uid
  const email = req.body.email
  const password = req.body.password
  const updatedAt = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss')

  const model = new Account()
  model.uid = uid
  model.email = email
  model.password = password
  model.updated_at = updatedAt
  const { results } = await model.update()
  res.json(results)
})

/* Delete account. */
router.delete('/accounts/delete', async (req, res, next) => {
  const uid = req.body.uid
  const model = new Account()
  const { results } = await model.find(uid)
  if (results.length > 0) {
    const account = results[0]
    if (account.photo) {
      const imagePath = `${process.cwd()}/static/${account.photo}`
      if (existsSync(imagePath)) {
        unlinkSync(imagePath)
      }
    }
    model.uid = uid
    await model.delete()
    const accountDeviceRelationship = new AccountDeviceRelationship()
    await accountDeviceRelationship.deleteDevicesByAccount(uid)
  }
  res.json({ result: true })
})

export default router
