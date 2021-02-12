import { Entry } from './entry'

export class Migration extends Entry {
  name

  async getByName(name) {
    const sql = `SELECT * FROM ${this.tableName} WHERE ${this.tableName}.name = ?;`
    return await this.query(sql, [name])
  }

  get tableName() {
    return 'migration'
  }
}
