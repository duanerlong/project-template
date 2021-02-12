import { Command } from './command'

export class LampInfoCommand extends Command {
  constructor({ id = 0 } = {}) {
    super()
    this.cmd = {
      id,
      method: 'specific.multicall',
      params: [
        {
          id: 0,
          method: 'configCentre.getConfig',
          params: {
            name: 'SOCConstantLamp',
          },
        },
        {
          id: 0,
          method: 'configCentre.getConfig',
          params: {
            name: 'Screen',
          },
        },
      ],
    }
  }
}
