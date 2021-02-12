import http from 'http'
import crypto from 'crypto'
import fs from 'fs'
import FormData from 'form-data'
import { v1, v5 } from 'uuid'
import { Parser as Json2csvParser } from 'json2csv'

export function generateUid() {
  return v1()
}

export function generateUserUid() {
  return generateUid().split('-').slice(0, 2).join('')
}

export function generateFilename(key) {
  return v5(`${key}-${Date.now()}-${Math.round(Math.random() * 1e9)}`, v5.URL)
}

export function json2Csv(json) {
  const json2csvParser = new Json2csvParser({ header: true })
  const csv = json2csvParser.parse(json)
  return csv
}

export function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (error) => {
      if (error) reject(error)
      resolve() // TODO
    })
  })
}

export const noop = () => {}

export const getDigestAuthenticateHeader = (authInfo, user, password, path) => {
  if (!authInfo) return ''
  const realm = getWWWAuthenticateByName(authInfo, 'Digest realm')
  const qop = getWWWAuthenticateByName(authInfo, 'qop')
  const nonce = getWWWAuthenticateByName(authInfo, 'nonce')
  const opaque = getWWWAuthenticateByName(authInfo, 'opaque')
  const ha1 = md5(`${user}:${realm}:${password}`)
  const ha2 = md5(`POST:${path}`)
  const cnonce = 'ksjdfljwofsldj4687skjd'
  const nc = 1
  const digestResponse = md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
  return `Digest username="${user}", realm="${realm}", nonce="${nonce}", uri="${path}", qop="${qop}", cnonce="${cnonce}", response="${digestResponse}", opaque="${opaque}", nc=${nc}`
}

export const md5 = (data) => {
  return crypto.createHash('md5').update(data).digest('hex')
}

export const getWWWAuthenticateByName = (authInfo, name) => {
  const regExp = new RegExp(`${name}="([^"]*)"`)
  const result = authInfo.match(regExp) || []
  return result[1]
}

/**
 * 標準的な端末通信処理
 * @param options HTTPリクエストオプション
 * @param jsonString 通信情報
 * @param user ユーザー名
 * @param password パスワード
 */
export const rpc = (options, jsonString, user, password) => {
  return new Promise((resolve, reject) => {
    const request = http
      .request(options, async (res) => {
        const headers = res.headers
        if (res.statusCode === 401) {
          request && request.abort()
          const authInfo = headers['www-authenticate'] || ''
          const newCookie = headers['set-cookie'] || []
          const sessionId = newCookie[0].split('=')[1]
          const authenticateHeader = getDigestAuthenticateHeader(
            authInfo,
            user,
            password,
            options.path
          )
          options.headers = {
            ...options.headers,
            Cookie: `SessionID=${sessionId}`,
            Authorization: authenticateHeader,
          }
          const result = await rpc(options, jsonString, user, password)
          resolve(result)
        } else {
          let body = ''
          res.on('data', (chunk) => {
            body += chunk
          })
          res.on('end', () => {
            resolve(body)
          })
        }
      })
      .on('error', (err) => {
        reject(err)
      })
      .on('timeout', () => {
        reject(new Error('timeout'))
        request.abort()
      })
    request.write(jsonString)
    request.end()
  })
}

/**
 * 画像ファイルなどがある場合使う通信メソッドです
 * @param options HTTPリクエストオプション
 * @param photoPath 画像ファイルのパス
 * @param requestJson 通信情報
 */
export const rpcEx = (options, photoPath, requestJson) => {
  const jsonString = JSON.stringify(requestJson)
  const readStream = fs.createReadStream(photoPath)
  const form = new FormData()
  form.append('json', jsonString, { contentType: 'application/json' })
  form.append('data', readStream, { contentType: 'image/jpeg' })
  return new Promise((resolve, reject) => {
    const formHeaders = form.getHeaders()
    form.getLength((err, length) => {
      if (err) {
        reject(err)
        return
      }
      options.headers = {
        ...options.headers,
        ...formHeaders,
        'Content-Length': length,
      }
      const request = http
        .request(options, (res) => {
          let body = ''
          res.on('data', (chunk) => {
            body += chunk
          })
          res.on('end', () => {
            resolve(body)
          })
        })
        .on('error', (err) => {
          reject(err)
        })
        .on('timeout', () => {
          reject(new Error('timeout'))
          request.abort()
        })
      form.pipe(request)
    })
  })
}
