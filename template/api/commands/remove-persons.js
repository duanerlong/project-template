import { Command } from './command'

export class RemovePersonsCommand extends Command {
  constructor({ id = 0, params } = {}) {
    super()
    this.cmd = {
      id,
      method: 'personnelData.removePersons',
      params,
    }
  }
}
