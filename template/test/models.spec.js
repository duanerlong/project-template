import { Account } from '../api/models/account'
// import { pool } from '@/api/mysql-client'

describe('テストDBモデル', () => {
  //   test('パラメータが受信されない場合', async (done) => {
  //     const Command = await commandFactory()
  //     expect(Command).toBeUndefined()
  //     done()
  //   })
  test('Account find', async (done) => {
    const model = new Account()
    await model.find('1696c7a0-c048-11ea-a6a6-87ade068a966')
    expect(model).toBeDefined()
    // pool.end()
    done()
  })
  test('Account query', async (done) => {
    const model = new Account()
    const sql = `SELECT * FROM ${model.tableName} LIMIT 1,10`
    await model.query(sql)
    expect(model).toBeDefined()
    // pool.end()
    done()
  })
  test('Account INSERT', async (done) => {
    const model = new Account()
    model.type = 1
    model.email = 'aaaa'
    model.password = 'aaaa'
    await model.insert()
    expect(model).toBeDefined()
    // pool.end()
    done()
  })
  test('Account UPDATE', async (done) => {
    const model = new Account()
    model.uid = '0fedf7e0-c028-11ea-903f-6fd74a21fc5b'
    model.type = 1
    model.email = 'bbbb'
    model.password = 'bbbbb'
    await model.update()
    expect(model).toBeDefined()
    // pool.end()
    done()
  })
  test('Account DELETE', async (done) => {
    const model = new Account()
    model.uid = '0fedf7e0-c028-11ea-903f-6fd74a21fc5b'
    await model.delete()
    expect(model).toBeDefined()
    // pool.end()
    done()
  })
})
