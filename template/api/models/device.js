import { Entry } from './entry'
import { AccountDeviceRelationship } from './account-device-relationship'

export class Device extends Entry {
  serialno
  deviceclass
  devicetype
  version
  activated
  host
  username
  password
  devicelabel
  devicename
  temperature
  backgroundimgpath
  deleted
  accounts

  setDeviceName(devicename) {}

  setTemperature(temperature) {}

  syncTime() {}

  async getDeviceBySerialno(serialno) {
    const sql = `SELECT uid, serialno, devicelabel, devicename, temperature, backgroundimgpath, host FROM ${this.tableName} WHERE serialno = ?;`
    return await this.query(sql, [serialno])
  }

  async updateTemperatureOfAll(temperature) {
    const sql = `UPDATE ${this.tableName} set ${this.tableName}.temperature = ?`
    return await this.query(sql, [temperature])
  }

  async insertBatch(values) {
    const sql = `INSERT ${this.tableName} (uid, devicelabel, serialno, deviceclass, devicetype, version, activated, host) VALUES ?;`
    return await this.query(sql, [values])
  }

  async all(deleted = false) {
    let whereStr = ''
    const values = []
    if (deleted === 'both') {
      whereStr = '1=1'
    } else {
      whereStr = `${this.tableName}.deleted = ?`
      values.push(deleted)
    }
    const sql = `SELECT 
      ${this.tableName}.uid, 
      ${this.tableName}.serialno, 
      ${this.tableName}.devicelabel, 
      ${this.tableName}.devicename, 
      ${this.tableName}.temperature, 
      ${this.tableName}.backgroundimgpath, 
      ${this.tableName}.host,
      ${this.tableName}.username,
      ${this.tableName}.password,
      ${this.tableName}.activated,
      activestreamhc_log_count_by_serialno.cnt AS total, 
      activestreamhc_log_count_today_by_serialno.cnt AS daily, 
      activestreamhc_log_count_today_high_temperature_by_serialno.cnt AS cnt
      FROM ${this.tableName} 
      LEFT JOIN activestreamhc_log_count_by_serialno
      ON activestreamhc_log_count_by_serialno.serialno = ${this.tableName}.serialno

      LEFT JOIN activestreamhc_log_count_today_by_serialno
      ON activestreamhc_log_count_today_by_serialno.serialno = ${this.tableName}.serialno

      LEFT JOIN activestreamhc_log_count_today_high_temperature_by_serialno
      ON activestreamhc_log_count_today_high_temperature_by_serialno.serialno = ${this.tableName}.serialno
      WHERE ${whereStr}
      ;`
    return await this.query(sql, values)
  }

  async getDevicesByAccount(account) {
    const accountDeviceRelationship = new AccountDeviceRelationship()
    let sql = ''
    let values = []
    if (account.type === 1) {
      sql = `SELECT 
      ${this.tableName}.uid, 
      ${this.tableName}.serialno, 
      ${this.tableName}.devicelabel, 
      ${this.tableName}.devicename, 
      ${this.tableName}.temperature, 
      ${this.tableName}.backgroundimgpath,
      ${this.tableName}.host,
      ${this.tableName}.activated
      FROM ${this.tableName} 
      WHERE ${this.tableName}.deleted = false
      ;`
    } else {
      sql = `SELECT 
      ${this.tableName}.uid, 
      ${this.tableName}.serialno, 
      ${this.tableName}.devicelabel, 
      ${this.tableName}.devicename, 
      ${this.tableName}.temperature, 
      ${this.tableName}.backgroundimgpath,
      ${this.tableName}.host,
      ${this.tableName}.activated,
      ${this.tableName}.deleted
      FROM ${this.tableName} 
      INNER JOIN ${accountDeviceRelationship.tableName}
      ON ${accountDeviceRelationship.tableName}.serialno = ${this.tableName}.serialno
      WHERE ${accountDeviceRelationship.tableName}.account_uid = ?
      AND ${this.tableName}.deleted = false
      ;`
      values = [account.uid]
    }
    return await this.query(sql, values)
  }

  get tableName() {
    return 'devices'
  }
}
