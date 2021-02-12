import { existsSync, readdirSync, readFileSync } from 'fs'
import { Entry } from '../models/entry'
import { Migration } from '../models/migration'

/**
 * routesフォルダーにあるファイル（index.js除く）をrouteとしてエクスポートする
 */
async function exportRoutes() {
  const routes = readdirSync(`${__dirname}`).filter((file) =>
    new RegExp('^((?!index).)+.js$').test(file)
  )
  const modules = {}
  for (let index = 0; index < routes.length; index++) {
    const route = routes[index]
    modules[route.replace('.js', '')] = (await import(`./${route}`)).default
  }
  setTimeout(() => {
    const sqlDirPath = process.cwd() + '/migration'
    if (existsSync(sqlDirPath)) {
      const sqlFiles = readdirSync(sqlDirPath)
      const entry = new Entry()
      sqlFiles.forEach(async (sqlFile) => {
        console.log(sqlFile)
        const sqlFilepath = `${sqlDirPath}/${sqlFile}`
        if (existsSync(sqlFilepath)) {
          const migration = new Migration()
          const queryResult = await migration.getByName(sqlFile).catch(() => {
            console.log('create migration')
          })
          if (!queryResult || queryResult.results.length === 0) {
            const sql = readFileSync(sqlFilepath, 'utf8')
            await entry.query(sql)
            const insertMigration = new Migration()
            insertMigration.name = sqlFile
            await insertMigration.insert()
          }
        }
      })
    }
  }, 0)
  return modules
}

export default exportRoutes()
