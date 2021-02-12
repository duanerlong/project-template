import { Entry } from './entry'

export class MemberSettings extends Entry {
  field
  label
  required

  async all() {
    const sql = `SELECT * FROM ${this.tableName};`
    return await this.query(sql, null)
  }

  get tableName() {
    return 'user_settings'
  }
}
