import moment from 'moment'
import 'moment-timezone'
import { generateUid } from '../common/utils'
import { execute } from '../mysql-client'

export class Entry {
  uid
  createdAt
  updatedAt

  async insert() {
    this.uid = this.uid || generateUid()
    const value = JSON.parse(JSON.stringify(this))
    const sql = `INSERT INTO ${this.tableName} set ?`
    const { results, fields } = await execute(sql, value)
    return { results, fields }
  }

  async update() {
    if (!this.uid) throw new Error('uid')
    const value = JSON.parse(JSON.stringify(this))
    value.updated_at = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss')
    const sql = `UPDATE ${this.tableName} set ? WHERE uid = ?`
    const { results, fields } = await execute(sql, [value, this.uid])
    return { results, fields }
  }

  async delete() {
    if (!this.uid) throw new Error('uid')
    const sql = `DELETE FROM ${this.tableName} WHERE uid = ?`
    const { results, fields } = await execute(sql, this.uid)
    return { results, fields }
  }

  async find(uid) {
    const sql = `SELECT * FROM ${this.tableName} WHERE uid = ?`
    const { results, fields } = await execute(sql, uid)
    return { results, fields }
  }

  async query(sql, values) {
    const { results, fields } = await execute(sql, values)
    return { results, fields }
  }

  toString() {
    return JSON.stringify(this)
  }

  toJson() {
    return JSON.parse(this.toString())
  }

  get tableName() {
    return ''
  }
}
