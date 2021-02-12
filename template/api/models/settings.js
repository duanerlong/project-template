import { Entry } from './entry'

export class Settings extends Entry {
  key
  value

  async all() {
    const sql = `SELECT * FROM ${this.tableName};`
    return await this.query(sql, null)
  }

  get tableName() {
    return 'settings'
  }
}
