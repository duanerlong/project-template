import { Entry } from './entry'
import { Device } from './device'

export class Signaling extends Entry {
  serialno
  id
  method
  params
  status

  async all() {
    const device = new Device()
    const sql = `SELECT 
        ${this.tableName}.uid,
        ${this.tableName}.serialno, 
        ${this.tableName}.id, 
        ${this.tableName}.method,
        ${this.tableName}.params,
        ${this.tableName}.status,
        ${this.tableName}.created_at,
        CASE ${device.tableName}.deleted
            WHEN true THEN CONCAT(${device.tableName}.devicelabel ,  '(削除済み)' )
            ELSE ${device.tableName}.devicelabel
        END AS devicelabel
      FROM ${this.tableName} 
      INNER JOIN ${device.tableName} 
      ON ${device.tableName}.serialno = ${this.tableName}.serialno
      ORDER BY ${this.tableName}.created_at DESC LIMIT 50;`
    return await this.query(sql, null)
  }

  async deleteAll() {
    const sql = `DELETE from ${this.tableName};`
    return await this.query(sql, null)
  }

  async getSignalingBySerialno(serialno) {
    const sql = `SELECT * FROM queues WHERE serialno = ? AND (status = 0 OR status = -1) ORDER BY id LIMIT 1;`
    return await this.query(sql, [serialno])
  }

  async getSignalingBySerialnoAndMethod(serialno, method) {
    const sql = `SELECT * FROM queues WHERE serialno = ? AND method = ? AND (status = 0 OR status = -1) ORDER BY id LIMIT 1;`
    return await this.query(sql, [serialno, method])
  }

  async getSignalingBySerialnoAndId(serialno, id) {
    const sql = `SELECT * FROM queues WHERE serialno = ? AND id = ?;`
    return await this.query(sql, [serialno, id])
  }

  async updateStatusBySerialnoAndId(status, serialno, id) {
    const sql = `UPDATE queues set status = ? WHERE serialno = ? AND id = ?;`
    return await this.query(sql, [status, serialno, id])
  }

  get tableName() {
    return 'queues'
  }
}
