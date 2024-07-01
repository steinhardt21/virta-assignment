import { serve } from '@hono/node-server'
import app from './server'

const port = 5000
console.log(`Server is running now`)

serve({
  fetch: app.fetch,
  port
})