import moment from 'moment'
import { Entry } from './entry'
import { Member } from './member'
import { Device } from './device'
import { MemberType } from './member-type'

export class VisitorRecord extends Entry {
  id
  uid
  searchscore
  picture
  ismask
  lastdate
  temperature
  temperaturealarm
  temperaturecorrection
  temperaturecorrectionfrquency
  temperaturecorrectioninterval
  temperaturemode
  temperatureresult
  objectage
  objectsex
  safetyhelmet
  machinename
  serialno
  timezone
  utc

  async getLogsByConditions(conditions) {
    const page = Number(conditions.page || 1)
    const rows = Number(conditions.rows || 10)
    const pagerow = (page - 1) * rows
    const countSQLValues = []
    const listSQLValues = []

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

    let serialno = conditions.serialno || 'all'
    let temperature = conditions.temperature || 'all'
    let mask = conditions.mask || 'all'
    let sex = conditions.sex || 'all'
    let state = conditions.state || 'all'
    let useruid = conditions.useruid || 'all'

    const userInfo = new Member()
    const userType = new MemberType()
    const device = new Device()

    let limit = ''
    if (rows !== -1) {
      limit = `LIMIT ${pagerow},${rows}`
    }

    // デバイス
    if (serialno === 'all') {
      serialno = '1=1'
    } else {
      serialno = `${this.tableName}.serialno = '${serialno}'`
    }

    // 体温
    switch (temperature) {
      case 'normal':
        temperature = `IFNULL(${device.tableName}.temperature, 37.3) >= ${this.tableName}.temperature`
        break
      case 'high':
        temperature = `IFNULL(${device.tableName}.temperature, 37.3) < ${this.tableName}.temperature`
        break
      default:
        temperature = '1=1'
        break
    }

    // マスク
    switch (mask) {
      case 'all':
        mask = '1=1'
        break
      default:
        countSQLValues.push(mask)
        listSQLValues.push(mask)
        mask = `${this.tableName}.ismask = ?`
        break
    }

    // 性別
    switch (sex) {
      case 'all':
        sex = '1=1'
        break
      default:
        countSQLValues.push(sex)
        listSQLValues.push(sex)
        sex = `IFNULL(${userInfo.tableName}.sex, ${this.tableName}.objectsex) = ?`
        break
    }

    // 登録種別
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

    // 登録者
    switch (useruid) {
      case 'all':
        useruid = '1=1'
        break
      default:
        countSQLValues.push(useruid)
        listSQLValues.push(useruid)
        useruid = `${this.tableName}.uid = ?`
        break
    }

    const querySql = `
    SELECT 
          ${userInfo.tableName}.name AS name,
          ${this.tableName}.serialno AS serialno,
          CASE ${device.tableName}.deleted
              WHEN true THEN CONCAT(${device.tableName}.devicelabel ,  '(削除済み)' )
              ELSE ${device.tableName}.devicelabel
          END AS devicelabel,
          IFNULL(${userInfo.tableName}.sex, ${this.tableName}.objectsex) AS sex,
          ${this.tableName}.ismask AS ismask,
          ${this.tableName}.temperature AS temperature,
          ${device.tableName}.temperature AS warning_temperature,
          ${this.tableName}.created_at AS created_at,
          ${this.tableName}.picture AS photo,
          ${this.tableName}.uid AS uid,
          ${this.tableName}.id,
          ${this.tableName}.lastdate,
          IFNULL(${userType.tableName}.code, '0') AS state, 
          IFNULL(${userType.tableName}.name, '未登録') AS statelabel,
          ${userInfo.tableName}.item1,
          ${userInfo.tableName}.item2,
          ${userInfo.tableName}.item3,
          ${userInfo.tableName}.item4,
          ${userInfo.tableName}.item5,
          ${userInfo.tableName}.item6,
          ${userInfo.tableName}.item7,
          ${userInfo.tableName}.item8,
          ${userInfo.tableName}.item9,
          ${userInfo.tableName}.item10
        FROM ${this.tableName} 
        INNER JOIN ${device.tableName} 
          ON ${this.tableName}.serialno = ${device.tableName}.serialno 
        LEFT JOIN ${userInfo.tableName} 
          ON ${this.tableName}.uid = ${userInfo.tableName}.uid 
        LEFT JOIN ${userType.tableName} 
          ON ${userType.tableName}.code = ${userInfo.tableName}.state 
        WHERE 1=1 
          AND ${wherecreatedatefrom} 
          AND ${wherecreatedateto} 
          AND ${serialno}
          AND ${temperature} 
          AND ${mask} 
          AND ${sex} 
          AND ${useruid} 
        ORDER BY ${this.tableName}.created_at DESC 
    `

    const sql = `
        SELECT 
          COUNT(id) AS allrow 
        FROM (${querySql}) AS T
        WHERE 1=1 
          AND ${state};
        SELECT 
          *
        FROM (${querySql}) AS T
        WHERE 1=1 
          AND ${state}
        ORDER BY T.created_at DESC 
        ${limit};`

    return await this.query(sql, [...countSQLValues, ...listSQLValues])
  }

  async findById(id) {
    const sql = `SELECT * FROM ${this.tableName} WHERE id = ?`
    return await this.query(sql, [id])
  }

  async updateById(id) {
    const value = JSON.parse(JSON.stringify(this))
    value.updated_at = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss')
    const sql = `UPDATE ${this.tableName} set ? WHERE id = ?`
    return await this.query(sql, [value, id])
  }

  async updateUidByUid(uid) {
    const value = JSON.parse(JSON.stringify(this))
    value.updated_at = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss')
    const sql = `UPDATE ${this.tableName} set ? WHERE uid = ?`
    return await this.query(sql, [value, uid])
  }

  async deleteAll() {
    const sql = `DELETE from ${this.tableName};`
    return await this.query(sql, null)
  }

  async deleteBySerialno(serialno) {
    const sql = `DELETE from ${this.tableName} WHERE serialno = ?;`
    return await this.query(sql, [serialno])
  }

  async attendanceOfMonthly(targetDate) {
    const a = `
    SET SESSION group_concat_max_len = 100000;
    SELECT
      GROUP_CONCAT(DISTINCT
          CONCAT(
            'max(case when t2.date = ''',
            t2.date,
            ''' then t2.name end) as ''', 
            t2.date, '''')
        ) as 'sql'
    from (
    select t0.date as date,t1.name as name from
    (
    select DATE_FORMAT(DATE_ADD(DATE_ADD(?,INTERVAL - DAY(?) + 1 DAY), INTERVAL xc DAY),'%Y/%m/%d') as date
    from (
    select @xi:=@xi+1 as xc from 
    (select 1 union select 2 union select 3 union select 4 union select 5 union select 6) xc1,
    (select 1 union select 2 union select 3 union select 4 union select 5 union select 6) xc2,
    (select @xi:=-1) xc0
    ) xcxc 
    where xc <  DATEDIFF(DATE_ADD(DATE_ADD(?,INTERVAL - DAY(?) + 1 DAY),INTERVAL 1 MONTH),DATE_ADD(?,INTERVAL - DAY(?) + 1 DAY))) t0
    left join 
    (
    select  ifnull(user_info.name, '0000') as name,DATE_FORMAT(activestreamhc_log.created_at, '%Y/%m/%d') as created_at from activestreamhc_log left join user_info on activestreamhc_log.uid = user_info.uid group by user_info.name,DATE_FORMAT(activestreamhc_log.created_at, '%Y/%m/%d') order by user_info.name,DATE_FORMAT(activestreamhc_log.created_at, '%Y/%m/%d')
    ) as t1 on t0.date = t1.created_at order by t1.name, t0.date) t2
    ;
    `
    const { results } = await this.query(a, [
      targetDate,
      targetDate,
      targetDate,
      targetDate,
      targetDate,
      targetDate,
    ])
    const sql = `
    SELECT
    t2.name as name, ${results[1][0].sql}
    from (
    select t0.date as date,t1.name as name from
    (
    select DATE_FORMAT(DATE_ADD(DATE_ADD(?,INTERVAL - DAY(?) + 1 DAY), INTERVAL xc DAY),'%Y/%m/%d') as date
    from (
    select @xi:=@xi+1 as xc from 
    (select 1 union select 2 union select 3 union select 4 union select 5 union select 6) xc1,
    (select 1 union select 2 union select 3 union select 4 union select 5 union select 6) xc2,
    (select @xi:=-1) xc0
    ) xcxc 
    where xc <  DATEDIFF(DATE_ADD(DATE_ADD(?,INTERVAL - DAY(?) + 1 DAY),INTERVAL 1 MONTH),DATE_ADD(?,INTERVAL - DAY(?) + 1 DAY))) t0
    left join 
    (
    select  ifnull(user_info.name, '0000') as name,DATE_FORMAT(activestreamhc_log.created_at, '%Y/%m/%d') as created_at from activestreamhc_log left join user_info on activestreamhc_log.uid = user_info.uid group by user_info.name,DATE_FORMAT(activestreamhc_log.created_at, '%Y/%m/%d') order by user_info.name,DATE_FORMAT(activestreamhc_log.created_at, '%Y/%m/%d')
    ) as t1 on t0.date = t1.created_at order by t1.name, t0.date) t2 where t2.name is not null group by t2.name
    ;
    `

    return await this.query(sql, [
      targetDate,
      targetDate,
      targetDate,
      targetDate,
      targetDate,
      targetDate,
    ])
  }

  get tableName() {
    return 'activestreamhc_log'
  }
}
