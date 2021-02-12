/* eslint-disable no-console */
import fs from 'fs'
import moment from 'moment'
import 'moment-timezone'
import { Sequence } from '../models/sequence'
import { rpc, rpcEx } from './utils'

export class DeviceAgent {
  sessionId = '79ad47aaf18214af01c7c341d11b83e7'
  RPC_PATH = '/api/cgi-bin/rpc'
  COMMON_PATH = '/api/common'
  USER = 'admin'
  PASSWORD = 'admin123'
  Activated
  DeviceClass
  DeviceType
  SerialNumber
  Version
  Host

  constructor(config) {
    if (!config || !config.host) {
      throw new Error('端末が存在しません')
    }
    this.Activated = config.activated
    this.DeviceClass = config.deviceclass
    this.DeviceType = config.devicetype
    this.SerialNumber = config.serialno
    this.Version = config.version
    this.Host = config.host
    this.USER = config.username || this.USER
    this.PASSWORD = config.password || this.PASSWORD
  }

  /**
   * 端末と通信する時、コマンド実行IDを発行する
   */
  async getPacketId() {
    const sequence = new Sequence()
    return await sequence.nextval(this.SerialNumber)
  }

  optionsFactory(sessionId, jsonString) {
    return {
      host: this.Host,
      port: 80,
      path: this.RPC_PATH,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `SessionID=${sessionId}`,
        'Content-Length': Buffer.byteLength(jsonString),
      },
    }
  }

  async keepAliveFunc() {
    const options = {
      host: this.Host,
      port: 80,
      path: `${this.COMMON_PATH}/keepalive?session=${this.sessionId}&active=true`,
      method: 'POST',
    }
    await rpc(options, '', '', 'null')
  }

  /**
   * 標準的なコマンド実行メソッド
   * @param options HTTPリクエストオプション
   * @param jsonString 通信情報
   */
  async CmdGeneral(options, jsonString) {
    let result
    try {
      result =
        JSON.parse(await rpc(options, jsonString, this.USER, this.PASSWORD)) ||
        {}
      this.sessionId = result.session || this.sessionId
    } catch (error) {
      console.error(error)
    }
    return result
  }

  async getConfig(name) {
    if (!name) {
      return {}
    }
    const id = await this.getPacketId()
    const requestJson = {
      id,
      method: 'configCentre.getConfig',
      params: {
        name,
      },
    }
    const jsonString = JSON.stringify(requestJson)
    return await this.CmdGeneral(
      this.optionsFactory(this.sessionId, jsonString),
      jsonString
    )
  }

  async setConfig(name, content) {
    if (!name) {
      return {}
    }
    const id = await this.getPacketId()
    const requestJson = {
      id,
      method: 'configCentre.setConfig',
      params: {
        name,
        content,
      },
    }
    const jsonString = JSON.stringify(requestJson)
    return await this.CmdGeneral(
      this.optionsFactory(this.sessionId, jsonString),
      jsonString
    )
  }

  async getName() {
    return await this.getConfig('MachineGlobal')
  }

  async setName(name) {
    const localesSettings = await this.getName()
    const content = [...localesSettings.params.content]
    content[0].Address = name || content[0].Address
    return await this.setConfig('MachineGlobal', content)
  }

  async getScreenConfig() {
    return await this.getConfig('Screen')
  }

  async offScreen() {
    const jsonData = await this.getScreenConfig()
    if (!jsonData) {
      return {}
    }
    const content = jsonData.params.content
    content[0].Brightness = 0
    return await this.setConfig('Screen', content)
  }

  async openScreen() {
    const jsonData = await this.getScreenConfig()
    if (!jsonData) {
      return {}
    }
    const content = jsonData.params.content
    content[0].Brightness = 80
    return await this.setConfig('Screen', content)
  }

  async getConstantLampConfig() {
    return await this.getConfig('SOCConstantLamp')
  }

  async offConstantLamp() {
    const jsonData = await this.getConstantLampConfig()
    if (!jsonData) {
      return {}
    }
    const content = jsonData.params.content
    content[0].Brightness = 0
    return await this.setConfig('SOCConstantLamp', content)
  }

  async openConstantLamp() {
    const jsonData = await this.getConstantLampConfig()
    if (!jsonData) {
      return {}
    }
    const content = jsonData.params.content
    content[0].Brightness = 30
    return await this.setConfig('SOCConstantLamp', content)
  }

  async toggleLamp(toggle) {
    if (toggle) {
      await this.offConstantLamp()
      await this.offScreen()
    } else {
      await this.openConstantLamp()
      await this.openScreen()
    }
  }

  async getTemperature() {
    return await this.getConfig('TempDetectConfig')
  }

  async setTemperature(temperature) {
    const jsonData = await this.getTemperature()
    if (!jsonData) {
      return {}
    }
    const content = jsonData.params.content
    content.ValueRange[1] = Number(temperature) || content.ValueRange[1]
    return await this.setConfig('TempDetectConfig', content)
  }

  async createFaceInfoUpdate() {
    const id = await this.getPacketId()
    const requestJson = {
      id,
      method: 'faceInfoUpdate.create',
    }
    const jsonString = JSON.stringify(requestJson)
    return await this.CmdGeneral(
      this.optionsFactory(this.sessionId, jsonString),
      jsonString
    )
  }

  async destroyFaceInfoUpdate() {
    const id = await this.getPacketId()
    const requestJson = {
      id,
      method: 'faceInfoUpdate.destroy',
    }
    const jsonString = JSON.stringify(requestJson)
    return await this.CmdGeneral(
      this.optionsFactory(this.sessionId, jsonString),
      jsonString
    )
  }

  async deleteFace(person) {
    let intervalId
    try {
      if (!(await this.createFaceInfoUpdate())) {
        return false
      }
      setTimeout(() => {
        intervalId = setInterval(() => {
          this.keepAliveFunc()
        }, 20000)
      }, 10000)
      const id = await this.getPacketId()
      const requestJson = {
        id,
        method: 'faceInfoUpdate.deleteFace',
        params: {
          CertificateType: person.CertificateType,
          ID: person.Code,
        },
      }
      const jsonString = JSON.stringify(requestJson)
      return await this.CmdGeneral(
        this.optionsFactory(this.sessionId, jsonString),
        jsonString
      )
    } catch (error) {
      console.log(error)
    } finally {
      await this.destroyFaceInfoUpdate()
      clearInterval(intervalId)
    }
  }

  async addFaceFaceInfoUpdate(person, photoPath) {
    let intervalId
    try {
      if (!(await this.createFaceInfoUpdate())) {
        return false
      }
      setTimeout(() => {
        intervalId = setInterval(() => {
          this.keepAliveFunc()
        }, 20000)
      }, 10000)
      const id = await this.getPacketId()
      const requestJson = {
        id,
        method: 'faceInfoUpdate.addFace',
        params: {
          GroupID: 1,
          PersonInfo: { ...person },
          ImageInfo: {
            Amount: 1,
            Lengths: [fs.statSync(photoPath).size],
          },
        },
      }
      const jsonString = JSON.stringify(requestJson)
      const body = await rpcEx(
        this.optionsFactory(this.sessionId, jsonString),
        photoPath,
        requestJson
      )
      console.log(JSON.stringify(requestJson), body)
      const result = JSON.parse(body)
      return result.result
    } catch (error) {
      console.log(error)
    } finally {
      await this.destroyFaceInfoUpdate()
      clearInterval(intervalId)
    }
  }

  async insertPersonPersonManager(person) {
    const id = await this.getPacketId()
    const requestJson = {
      id,
      method: 'personManager.insertPerson',
      params: {
        Person: { ...person },
      },
    }
    const jsonString = JSON.stringify(requestJson)
    return await this.CmdGeneral(
      this.optionsFactory(this.sessionId, jsonString),
      jsonString
    )
  }

  async getPersons() {
    console.log(this.sessionId)
    const id = await this.getPacketId()
    const requestJson = {
      id,
      method: 'personManager.getPersons',
      params: {
        Condition: {
          Type: 1,
          Limit: 100,
          Offset: 0,
        },
      },
    }
    const jsonString = JSON.stringify(requestJson)
    return await this.CmdGeneral(
      this.optionsFactory(this.sessionId, jsonString),
      jsonString
    )
  }

  async addPerson(person, photoPath) {
    if (!(await this.insertPersonPersonManager(person))) {
      return false
    }

    if (
      !(await this.addFaceFaceInfoUpdate(
        {
          CertificateType: person.CertificateType,
          ID: person.Code,
        },
        photoPath
      ))
    ) {
      this.deletePerson(person)
      return false
    }
    return true
  }

  async deletePerson(person) {
    const Codes = [
      {
        Code: person.Code,
      },
    ]
    const id = await this.getPacketId()
    const requestJson = {
      id,
      method: 'personManager.removePersons',
      params: {
        Codes,
      },
    }
    const jsonString = JSON.stringify(requestJson)
    await this.CmdGeneral(
      this.optionsFactory(this.sessionId, jsonString),
      jsonString
    )

    await this.deleteFace(person)
  }

  async getHTTPReverse() {
    return await this.getConfig('HTTPReverse')
  }

  async setHTTPReverse(signalingUrl, pushingUrl) {
    const jsonData = await this.getHTTPReverse()
    if (!jsonData) {
      return {}
    }
    const content = jsonData.params.content
    content[0].Enable = true
    content[0].MessageURL = signalingUrl
    content[0].PushPictureURL = pushingUrl
    return await this.setConfig('HTTPReverse', content)
  }

  async getTime() {
    const id = await this.getPacketId()
    const requestJson = {
      id,
      method: 'global.getTime',
    }
    const jsonString = JSON.stringify(requestJson)
    return await this.CmdGeneral(
      this.optionsFactory(this.sessionId, jsonString),
      jsonString
    )
  }

  async setTimeSetting() {
    const time = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss')
    const timezone = moment().tz('Asia/Tokyo').format('Z')
    const localesSettings = await this.getConfig('Locales')
    const content = {
      ...localesSettings.params.content,
      TimeZone: `GMT${timezone}`,
    }
    const setLocalesResult = await this.setConfig('Locales', content)
    const id = await this.getPacketId()
    const requestJson = {
      id,
      method: 'global.setTime',
      params: {
        time,
      },
    }
    const jsonString = JSON.stringify(requestJson)
    const setTimeResult = await this.CmdGeneral(
      this.optionsFactory(this.sessionId, jsonString),
      jsonString
    )
    return setLocalesResult.result && setTimeResult.result
  }
}
