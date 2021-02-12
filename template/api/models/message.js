import { Entry } from './entry'
import { Device } from './device'

export class Message extends Entry {
  // eslint-disable-next-line camelcase
  user_uid
  serialno
  type
  content

  async all(uid) {
    const device = new Device()
    const sql = `
      SELECT 
        ${this.tableName}.uid AS uid,
        ${this.tableName}.user_uid AS user_uid,
        ${this.tableName}.serialno AS serialno,
        ${this.tableName}.type AS type,
        ${this.tableName}.content AS content,
        ${this.tableName}.created_at,
        CASE ${device.tableName}.deleted
            WHEN true THEN CONCAT(${device.tableName}.devicelabel ,  '(削除済み)' )
            ELSE ${device.tableName}.devicelabel
        END AS devicelabel
      FROM 
        ${this.tableName} 
      LEFT JOIN 
        ${device.tableName} 
      ON 
        ${device.tableName}.serialno = ${this.tableName}.serialno 
      WHERE ${this.tableName}.user_uid = ?;`
    return await this.query(sql, [uid])
  }

  async insertBatch(values) {
    const sql = `INSERT ${this.tableName} (uid, user_uid, serialno, type, content) VALUES ?;`
    return await this.query(sql, [values])
  }

  async getMessagesByUser(uid, type, serialno) {
    const sql = `SELECT * FROM ${this.tableName} WHERE user_uid = ? AND type = ? AND serialno = ? ORDER BY ${this.tableName}.created_at DESC  LIMIT 1;`
    return await this.query(sql, [uid, type, serialno])
  }

  async deleteMessagesByUser(uid) {
    const sql = `DELETE FROM ${this.tableName} WHERE user_uid = ?;`
    return await this.query(sql, [uid])
  }

  get tableName() {
    return 'message'
  }
}
