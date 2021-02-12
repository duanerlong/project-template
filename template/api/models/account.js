import { Entry } from './entry'

export class Account extends Entry {
  email
  password
  type
  lastMessage
  devices

  resetPassword(newPassword) {}

  async getAccountByEmailAndPassword(values) {
    const sql = `SELECT * FROM ${this.tableName} WHERE email = ? AND password = ?;`
    return await this.query(sql, values)
  }

  async all() {
    const sql = `SELECT * FROM ${this.tableName};`
    return await this.query(sql, null)
  }

  get tableName() {
    return 'account'
  }
}
