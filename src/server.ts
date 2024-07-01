import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { prettyJSON } from 'hono/pretty-json'
import { logger } from 'hono/logger'


import { stationsApp, companiesApp, searchApp } from './router'

const app = new Hono()

// Middleware
app.use("*", logger())
   .use("*", prettyJSON())
   .use("/api/*", cors())

// Routes
app.route('/api/stations', stationsApp)
   .route('/api/companies', companiesApp)
   .route('/api/search', searchApp)

// Custom Not Found Message
app.notFound((c) => c.json({ message: "Not Found" }, 404));


export default app