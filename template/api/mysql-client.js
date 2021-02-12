/* eslint-disable no-console */
import { createPool } from 'mysql'
import { mysql as config } from './config'

export const pool = createPool(config)

export const connection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        reject(err)
      } else {
        resolve(connection)
      }
    })
  })
}

export const beginTransaction = (connection) => {
  return new Promise((resolve, reject) => {
    connection.beginTransaction((err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export const query = (connection, options, values) => {
  return new Promise((resolve, reject) => {
    connection.query(options, values, (err, results, fields) => {
      if (err) {
        reject(err)
      } else {
        resolve({ results, fields })
      }
    })
  })
}

export const commit = (connection) => {
  return new Promise((resolve, reject) => {
    connection.commit((err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export const rollback = (connection) => {
  return new Promise((resolve, reject) => {
    connection.rollback((err) => {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

export const release = (connection) => {
  connection.release()
}

export const execute = async (sql, values) => {
  let con, result
  // console.log('---------------------', sql)
  try {
    con = await connection()
    result = await query(con, sql, values)
  } catch (error) {
    console.error(error)
  } finally {
    release(con)
  }
  return result
}
