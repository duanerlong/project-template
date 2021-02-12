import { Router } from 'express'
import { Account } from '../models/account'

const router = Router()

// Add POST - /api/login
router.post('/login', async (req, res) => {
  const values = [req.body.id, req.body.password]
  const model = new Account()
  const { results } = await model.getAccountByEmailAndPassword(values)

  if (results.length > 0) {
    const account = results[0]
    const authUser = {
      type: account.type,
      email: account.email,
    }
    req.session.authUser = account
    res.json(authUser)
  } else {
    res
      .status(401)
      .json({ message: 'メールアドレスまたはパスワードが間違っている。' })
  }
})

// Add POST - /api/logout
router.post('/logout', (req, res) => {
  delete req.session.authUser
  res.json({ ok: true })
})

export default router
