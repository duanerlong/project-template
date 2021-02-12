import { Router } from 'express'
import { MemberType } from '../models/member-type'

const router = Router()

router.get('/categories', async (req, res, next) => {
  const model = new MemberType()
  const { results } = await model.all()

  res.json(results)
})

router.post('/categoryadd', async (req, res, next) => {
  const model = new MemberType()
  model.name = req.body.name
  await model.insert()
  res.json({ result: true })
})

router.post('/categoryupdate/:uid', async (req, res, next) => {
  const model = new MemberType()
  model.uid = req.params.uid
  model.name = req.body.name
  await model.update()
  res.json({ result: true })
})

router.post('/categorydelete/:uid', async (req, res, next) => {
  const model = new MemberType()
  model.uid = req.params.uid
  await model.delete()
  res.json({ result: true })
})

export default router
