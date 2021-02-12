import { Entry } from './entry'
import { MemberType } from './member-type'

export class Member extends Entry {
  lastMessage

  async insertBatch(values) {
    const sql = `INSERT ${this.tableName} (
      uid,
      state,
      item1, 
      name, 
      sex, 
      photo,
      birthday,
      item2,
      item3,
      item4,
      item5,
      item6,
      item7,
      item8,
      item9,
      item10) VALUES ?;`
    return await this.query(sql, [values])
  }

  async all(conditions) {
    const page = Number(conditions.page || 1)
    const rows = Number(conditions.rows || 10)
    const pagerow = (page - 1) * rows
    const countSQLValues = []
    const listSQLValues = []

    let limit = ''
    if (rows !== -1) {
      limit = `LIMIT ${pagerow},${rows}`
    }
    const sortBy = conditions.sortBy || []
    const sortDesc = conditions.sortDesc || []
    let sort = ''
    if (sortBy.length === 0) {
      sort = 'T.created_at'
    } else {
      sort = sortDesc[0] ? `T.${sortBy[0]} DESC` : `T.${sortBy[0]}`
    }

    let wherecreatedatefrom = '1=1'
    const fromDate = conditions.fromDate
    if (fromDate) {
      wherecreatedatefrom = `date_format(${this.tableName}.created_at, '%Y-%m-%d') >= ?`
      countSQLValues.push(fromDate)
      listSQLValues.push(fromDate)
    }
    let wherecreatedateto = '1=1'
    const toDate = conditions.toDate
    if (toDate) {
      wherecreatedateto = `date_format(${this.tableName}.created_at, '%Y-%m-%d') <= ? `
      countSQLValues.push(toDate)
      listSQLValues.push(toDate)
    }

    let wherename = '1=1'
    const name = conditions.name
    if (name) {
      wherename = `${this.tableName}.name LIKE ?`
      countSQLValues.push(`%${name}%`)
      listSQLValues.push(`%${name}%`)
    }

    let whereitem1 = '1=1'
    const item1 = conditions.item1
    if (item1) {
      whereitem1 = `${this.tableName}.item1 LIKE ?`
      countSQLValues.push(`%${item1}%`)
      listSQLValues.push(`%${item1}%`)
    }

    // 性別
    let sex = conditions.sex || 'all'
    switch (sex) {
      case 'all':
        sex = '1=1'
        break
      default:
        countSQLValues.push(sex)
        listSQLValues.push(sex)
        sex = `${this.tableName}.sex = ?`
        break
    }

    // 登録種別
    let state = conditions.state || 'all'
    switch (state) {
      case 'all':
        state = '1=1'
        break
      default:
        countSQLValues.push(state)
        listSQLValues.push(state)
        state = `T.state = ?`
        break
    }

    const userType = new MemberType()
    const querySql = `
    SELECT 
        ${this.tableName}.uid,
        ${this.tableName}.certificatetype,
        ${this.tableName}.birthday,
        ${this.tableName}.name,
        ${this.tableName}.sex,
        ${this.tableName}.country,
        ${this.tableName}.province,
        ${this.tableName}.city,
        ${this.tableName}.deviceserialno,
        ${this.tableName}.photo,
        ${this.tableName}.item1,
        ${this.tableName}.item2,
        ${this.tableName}.item3,
        ${this.tableName}.item4,
        ${this.tableName}.item5,
        ${this.tableName}.item6,
        ${this.tableName}.item7,
        ${this.tableName}.item8,
        ${this.tableName}.item9,
        ${this.tableName}.item10,
        ${this.tableName}.created_at,
        ${this.tableName}.updated_at,
        IFNULL(${userType.tableName}.code, '0') AS state, 
        IFNULL(${userType.tableName}.name, '未登録') AS statelabel
      FROM ${this.tableName} 
      LEFT JOIN ${userType.tableName} 
      ON ${userType.tableName}.code = ${this.tableName}.state 
      WHERE ${this.tableName}.uid<>'0000' 
        AND ${wherecreatedatefrom} 
        AND ${wherecreatedateto} 
        AND ${wherename} 
        AND ${whereitem1} 
        AND ${sex} 
      ORDER BY ${this.tableName}.uid
    `

    const sql = `
      SELECT 
        COUNT(uid) AS allrow 
      FROM (${querySql}) AS T
      WHERE 1=1 
        AND ${state};
      SELECT 
        *
      FROM (${querySql}) AS T
      WHERE 1=1 
          AND ${state}
      ORDER BY ${sort}
      ${limit};`
    return await this.query(sql, [...countSQLValues, ...listSQLValues])
  }

  async getByUidList(uidList) {
    const sql = `SELECT * FROM ${this.tableName} WHERE uid IN (?)`
    return await this.query(sql, [uidList])
  }

  get tableName() {
    return 'user_info'
  }
}
