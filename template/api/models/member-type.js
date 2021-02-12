import { Entry } from './entry'
import { Member } from './member'

export class MemberType extends Entry {
  code
  name

  async all() {
    const userInfo = new Member()
    const sql = `
      SELECT 
        IFNULL(t1.cnt, 0) AS cnt,
        CONVERT(t0.code, CHAR) AS code,
        t0.name AS name,
        t0.uid AS uid
      FROM (
          SELECT 0 AS code, '未登録' AS name, NULL AS uid 
          UNION 
          SELECT code, name, uid FROM ${this.tableName}
        ) AS t0
      LEFT JOIN 
        (SELECT 
          COUNT(state) AS cnt,
          IFNULL(${this.tableName}.code, '0') AS code, 
          ${this.tableName}.uid AS uid 
        FROM ${userInfo.tableName} 
        LEFT JOIN ${this.tableName} 
        ON ${this.tableName}.code = ${userInfo.tableName}.state 
        WHERE ${userInfo.tableName}.uid <> '0000' 
        GROUP BY 
          ${this.tableName}.code,
          ${this.tableName}.name,
          ${this.tableName}.uid
        ) AS t1
      ON t0.code = t1.code
      ORDER BY code;`
    return await this.query(sql, null)
  }

  get tableName() {
    return 'user_states'
  }
}
