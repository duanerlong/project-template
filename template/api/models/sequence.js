import { Entry } from './entry'

export class Sequence extends Entry {
  serialno
  id

  async nextval(serialno) {
    const check = await this.query(
      `SELECT COUNT(*) AS cnt FROM sequence WHERE serialno = ?`,
      [serialno]
    )
    if (check.results[0].cnt === 0) {
      const sequence = new Sequence()
      sequence.serialno = serialno
      await sequence.insert()
    }
    const sql = `
      UPDATE ${this.tableName} SET id = LAST_INSERT_ID(id + 1) WHERE serialno = ?;
      SELECT LAST_INSERT_ID() AS id;
      `
    const { results } = await this.query(sql, [serialno])
    let packetId = results[1][0].id
    // コマンド実行IDの最大値は「0x7fffffff」です
    if (packetId > 2147483647) {
      packetId = 1
      await this.query(
        `UPDATE ${this.tableName} SET id = ${packetId} WHERE serialno = ?;`,
        [serialno]
      )
    }
    return packetId
  }

  async deleteBySerialno(serialno) {
    const sql = `DELETE from ${this.tableName} WHERE serialno = ?;`
    return await this.query(sql, [serialno])
  }

  get tableName() {
    return 'sequence'
  }
}
