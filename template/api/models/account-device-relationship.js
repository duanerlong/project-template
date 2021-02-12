import { Entry } from './entry'
import { Account } from './account'
import { Device } from './device'

export class AccountDeviceRelationship extends Entry {
  // eslint-disable-next-line camelcase
  account_uid
  serialno

  async getDevicesByAccount(uid) {
    const sql = `SELECT * FROM ${this.tableName} WHERE account_uid = ?;`
    return await this.query(sql, [uid])
  }

  async deleteDevicesByAccount(uid) {
    const sql = `DELETE FROM ${this.tableName} WHERE account_uid = ?;`
    return await this.query(sql, [uid])
  }

  async deleteAccountsByDevice(serialno) {
    const sql = `DELETE FROM ${this.tableName} WHERE serialno = ?;`
    return await this.query(sql, [serialno])
  }

  async getAccountsByDevice(serialno) {
    const account = new Account()
    const device = new Device()
    const sql = `
      SELECT 
        ${this.tableName}.uid, 
        ${this.tableName}.serialno, 
        ${device.tableName}.devicelabel,
        ${account.tableName}.email,
        ${account.tableName}.name,
        ${account.tableName}.type 
      FROM ${this.tableName} 
      INNER JOIN ${account.tableName} 
      ON ${account.tableName}.uid = ${this.tableName}.account_uid
      INNER JOIN ${device.tableName} 
      ON ${device.tableName}.serialno = ${this.tableName}.serialno
      AND ${device.tableName}.deleted = false
      WHERE ${this.tableName}.serialno = ?;`
    return await this.query(sql, [serialno])
  }

  async insertBatch(values) {
    const sql = `INSERT ${this.tableName} (uid, account_uid, serialno) VALUES ?;`
    return await this.query(sql, [values])
  }

  get tableName() {
    return 'account_device_relationship'
  }
}
