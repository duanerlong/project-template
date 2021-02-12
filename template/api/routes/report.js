import { Router } from 'express'
import { Report } from '../models/report'

const router = Router()

router.post('/report', async (req, res) => {
  const params = req.body.params
  const model = new Report()
  model.params = JSON.stringify(params)
  await model.insert()
  res.json({ ok: true, uid: model.uid })
})

router.get('/report/:uid', async (req, res) => {
  const model = new Report()
  const { results } = await model.find(req.params.uid)
  const params = JSON.parse(results[0].params)
  const queryResult = await model.attendanceOfMonthly(params)
  res.json(queryResult.results)
})

export default router
