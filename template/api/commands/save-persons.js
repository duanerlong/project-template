import { Command } from './command'

export class SavePersonsCommand extends Command {
  constructor({ id = 0, params } = {}) {
    super()
    this.cmd = {
      id,
      method: 'personnelData.savePersons',
      params,
    }
  }
}
