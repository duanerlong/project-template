import { Command } from './command'

export class DeviceNameCommand extends Command {
  template = [
    { Address: 'ようこそ', MachineName: 'Cam1' },
    { Address: 'BeiJing', MachineName: 'Cam1' },
  ]

  constructor({ id = 0, devicename } = {}) {
    super()
    this.template[0].Address = devicename || this.template[0].Address
    this.cmd = {
      id,
      method: 'configCentre.setConfig',
      params: {
        name: 'MachineGlobal',
        content: this.template,
      },
    }
  }
}
