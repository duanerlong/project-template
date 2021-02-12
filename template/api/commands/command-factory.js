import { readdirSync } from 'fs'

export async function commandFactory({ commandTypeName, params } = {}) {
  if (!commandTypeName) {
    return
  }
  // TODO キャッシュするか、後ほど検討します
  const commands = readdirSync(`${__dirname}`).filter((file) =>
    new RegExp('^((?!command-factory).)+.js$').test(file)
  )
  let modules = {}
  for (let index = 0; index < commands.length; index++) {
    const command = commands[index]
    const module = await import(`./${command}`)
    modules = { ...modules, ...module }
  }
  if (!modules[commandTypeName]) {
    return
  }
  return new modules[commandTypeName](params)
}
