import { commandFactory } from '../api/commands/command-factory'

describe('テストコマンドファクトリ関数', () => {
  test('パラメータが受信されない場合', async (done) => {
    const Command = await commandFactory()
    expect(Command).toBeUndefined()
    done()
  })
  test('受信されたパラメータにキーがない場合', async (done) => {
    const Command = await commandFactory({})
    expect(Command).toBeUndefined()
    done()
  })
  test('DeviceNameCommand', async (done) => {
    const Command = await commandFactory({
      commandTypeName: 'DeviceNameCommand',
    })
    expect(Command.cmd).toBeDefined()
    done()
  })
  test('LampCommand', async (done) => {
    const Command = await commandFactory({
      commandTypeName: 'LampCommand',
    })
    expect(Command.cmd).toBeDefined()
    done()
  })
  test('SyncTimeCommand', async (done) => {
    const Command = await commandFactory({
      commandTypeName: 'SyncTimeCommand',
    })
    expect(Command.cmd).toBeDefined()
    done()
  })
  test('TemperatureCommand', async (done) => {
    const Command = await commandFactory({
      commandTypeName: 'TemperatureCommand',
    })
    expect(Command.cmd).toBeDefined()
    done()
  })
})
