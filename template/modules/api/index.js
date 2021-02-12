const bodyParser = require('body-parser')
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)
const config = require('../../api/config')

module.exports = function (moduleOptions) {
  // Add middleware only with `nuxt dev` or `nuxt start`
  if (this.options.dev || this.options._start) {
    // body-parser middleware
    this.addServerMiddleware(bodyParser.json())
    // session middleware
    this.addServerMiddleware(
      session({
        secret: 'super-secret-key',
        store: new MySQLStore({
          ...config.mysql,
          database: 'activestreamhc_session',
        }),
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 },
      })
    )
    // Api middleware
    this.addServerMiddleware('@/api/index.js')
  }
}
