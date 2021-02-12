import express from 'express'

// Create express instance
const app = express()

// APIの認証チェック
app.use((req, res, next) => {
  const authUser = req.session.authUser
  if (
    req.path !== '/signaling' &&
    req.path !== '/pushing' &&
    req.path !== '/login' &&
    !authUser
  ) {
    res.status(401).json({ message: 'Bad credentials' })
  } else {
    next()
  }
})

async function bindingRoute() {
  const routes = await (await import('./routes')).default
  for (const key in routes) {
    if (Object.prototype.hasOwnProperty.call(routes, key)) {
      const route = routes[key]
      app.use(route)
    }
  }
}

// Import API Routes
bindingRoute()

// Export the server middleware
export const path = '/activestreamhc'
export const handler = app
