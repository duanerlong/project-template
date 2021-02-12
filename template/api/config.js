let host = 'localhost'
if (process.env.DEV_DOCKER === 'docker') {
  host = 'mysql'
} else {
  host =
    process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
      ? 'localhost'
      : 'mysql'
}
module.exports = {
  mysql: {
    host,
    user: 'root',
    password: 'activestreamhc',
    database: 'activestreamhc',
    dateStrings: true,
    multipleStatements: true,
  },
}
