import { serve } from '@hono/node-server'
import app from './server'

const port = 5000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})