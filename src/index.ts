import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { messageHandler } from './handlers/messageHandler'
import { telegramBot } from './handlers/telegramHandler'
import { Scheduler } from './services/scheduler'

const app = new Hono()

// Start Background Services
Scheduler.start();

// Start Telegram Bot (Polling Mode)
if (process.env.TELEGRAM_BOT_TOKEN) {
    telegramBot.launch()
        .then(() => console.log('🤖 Telegram Bot started!'))
        .catch((err) => console.error('Telegram Bot failed to start:', err));

    // Graceful shutdown
    process.once('SIGINT', () => telegramBot.stop('SIGINT'));
    process.once('SIGTERM', () => telegramBot.stop('SIGTERM'));
} else {
    console.log('⚠️ TELEGRAM_BOT_TOKEN not set, Telegram Bot disabled');
}

// Health Check
app.get('/', (c) => {
    return c.text('MOLTBOT is running! 🚀 (LINE + Telegram)')
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

const port = Number(process.env.PORT) || 3000
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})

