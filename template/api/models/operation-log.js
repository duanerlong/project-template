import { Entry } from './entry'

export class OperationLog extends Entry {
  type
  content

  get tableName() {
    return 'operation_log'
  }
}
