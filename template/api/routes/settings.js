import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { Router } from 'express'
import QRCode from 'qrcode'
import axios from 'axios'
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

const generateQRCode = (value) => {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(value, (err, url) => {
      if (err) {
        reject(err)
      } else {
        resolve(url)
      }
    })
  })
}

const router = Router()

router.get('/systeminfo', async (req, res) => {
  const systemConfig = await systemSettings()
  const url = `http://${systemConfig.host}:${systemConfig.port}/`
  const urlQRCode = await generateQRCode(url)

  res.json({ ...systemConfig, urlQRCode })
})

router.get('/version', async (req, res) => {
  const { data } = await axios.get(
    'https://activestreamhc.github.io/activestreamhc-nn/data.json'
  )
  const tag = process.env.TAG.replace(':', '')
  let version = ''
  if (tag && tag !== '') {
    version = data[tag]
  } else {
    version = data.version
  }
  let result = {}
  if (version) {
    result = { version }
  } else {
    result = {
      error: true,
      message:
        '自動更新システム設定の問題を発生しました。システム管理者に連絡してください。',
    }
  }

  res.json(result)
})

router.post('/upgrade', (req, res, next) => {
  const filepath = process.cwd() + '/tmp'
  if (!existsSync(filepath)) {
    try {
      mkdirSync(filepath)
    } catch (error) {
      console.error(error)
    }
  }
  writeFileSync(`${filepath}/upgrade`, '')
  res.json({ result: true })
})

router.post('/updatehost', async (req, res, next) => {
  const filepath = process.cwd() + '/tmp'
  if (!existsSync(filepath)) {
    try {
      mkdirSync(filepath)
    } catch (error) {
      console.error(error)
    }
  }
  const hostConfig = req.body
  const host = hostConfig.info.host || ''
  const gateway = hostConfig.info.gateway || ''
  const settings = new Settings()
  const { results } = await settings.all()
  const hostConfigKey = 'hostConfig'
  const hostConfigInfo = results.filter((item) => {
    return item.key === hostConfigKey
  })
  if (hostConfigInfo.length > 0) {
    const updateSettings = new Settings()
    updateSettings.uid = hostConfigInfo[0].uid
    updateSettings.value = JSON.stringify(hostConfig)
    updateSettings.update()
  } else {
    const insertSettings = new Settings()
    insertSettings.key = hostConfigKey
    insertSettings.value = JSON.stringify(hostConfig)
    insertSettings.insert()
  }

  writeFileSync(`${filepath}/update_host`, `${host},${gateway}`)
  res.json({ result: true })
})

router.post('/voice', async (req, res, next) => {
  const voice = req.body.voice || '0'
  const settings = new Settings()
  const { results } = await settings.all()
  const voiceConfigKey = 'voice'
  const voiceConfigInfo = results.filter((item) => {
    return item.key === voiceConfigKey
  })
  if (voiceConfigInfo.length > 0) {
    const updateSettings = new Settings()
    updateSettings.uid = voiceConfigInfo[0].uid
    updateSettings.value = voice
    updateSettings.update()
  } else {
    const insertSettings = new Settings()
    insertSettings.key = voiceConfigKey
    insertSettings.value = voice
    insertSettings.insert()
  }
  res.json({ result: true })
})

export default router
