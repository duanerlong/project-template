import { Router } from 'express'
import { Message } from '../models/message'
import { generateUid } from '../common/utils'

const router = Router()

router.get('/messages/:uid', async (req, res) => {
  const model = new Message()
  const { results } = await model.all(req.params.uid)
  res.json(results)
})

router.delete('/message', async (req, res) => {
  const model = new Message()
  model.uid = req.body.uid
  await model.delete()
  res.json({ result: true })
})

router.get('/message/:uid', async (req, res) => {
  const authUser = req.session.authUser
  const serialno = req.query.serialno
  const model = new Message()
  const { results } = await model.getMessagesByUser(
    req.params.uid,
    authUser.type,
    serialno
  )
  res.json(results)
})

router.post('/message', async (req, res) => {
  const destinations = req.body.destinations || []
  const devices = req.body.devices || []
  const message = req.body.message || ''
  // eslint-disable-next-line camelcase
  const user_uid = req.body.user_uid || ''
  const values = []
  if (
    destinations.length > 0 &&
    devices.length > 0 &&
    message !== '' &&
    // eslint-disable-next-line camelcase
    user_uid !== ''
  ) {
    for (let i = 0; i < devices.length; i++) {
      const serialno = devices[i]
      for (let j = 0; j < destinations.length; j++) {
        const type = destinations[j]
        // eslint-disable-next-line camelcase
        values.push([generateUid(), user_uid, serialno, type, message])
      }
    }
    const model = new Message()
    await model.insertBatch(values)
  }

  res.json({ result: true })
})

export default router
