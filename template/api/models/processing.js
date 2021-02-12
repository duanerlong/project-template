import { Entry } from './entry'

export class Processing extends Entry {
  name

  async getByName(name) {
    const sql = `SELECT * FROM ${this.tableName} WHERE name = ?;`
    return await this.query(sql, [name])
  }

  get tableName() {
    return 'processing'
  }
}
