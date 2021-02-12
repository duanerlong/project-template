import moment from 'moment'
import 'moment-timezone'
import { Command } from './command'

export class SyncTimeCommand extends Command {
  template = {
    Locales: {
      DST: {
        DSTEnd: { Day: 0, Hour: 0, Month: 1, Week: 1 },
        DSTStart: { Day: 0, Hour: 0, Month: 1, Week: 1 },
        Enable: false,
        Offset: 60,
      },
      TimeZone: 'GMT+09:00',
    },
  }

  constructor({ id = 0 } = {}) {
    super()
    const time = moment().tz('Asia/Tokyo').format('YYYY-MM-DD HH:mm:ss')
    this.cmd = {
      id,
      method: 'specific.multicall',
      params: [
        {
          id: 0,
          method: 'configCentre.setConfig',
          params: {
            name: 'Locales',
            content: this.template.Locales,
          },
        },
        {
          id: 0,
          method: 'global.setTime',
          params: { time },
        },
      ],
    }
  }
}
