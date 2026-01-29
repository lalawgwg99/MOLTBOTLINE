import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { messageHandler } from './handlers/messageHandler'
import { Scheduler } from './services/scheduler'

const app = new Hono()

// Start Background Services (Heartbeat)
Scheduler.start();

// Health Check
app.get('/', (c) => {
    return c.text('MOLTBOT is running! 🚀 (Monitoring Active)')
})

// LINE Webhook
app.post('/callback', async (c) => {
    const body = await c.req.json()
    const events = body.events
    await Promise.all(events.map(async (event: any) => {
        await messageHandler(event)
    }))
    return c.text('OK')
})

const port = 3000
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
