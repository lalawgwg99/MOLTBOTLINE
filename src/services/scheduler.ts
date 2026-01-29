import cron from 'node-cron';
import { PriceWatcher } from './priceWatcher';
import { Client, TextMessage } from '@line/bot-sdk';
import dotenv from 'dotenv';
dotenv.config();

// Initialize LINE Client for Push Messages
const client = new Client({
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET || '',
});

// Hardcoded User ID for demo (Real world: Store user IDs in DB)
// For now, the user needs to provide their User ID in .env or we log it from webhook
const TARGET_USER_ID = process.env.YOUR_USER_ID || '';

export const Scheduler = {
    start: () => {
        console.log('[Scheduler] Heartbeat started. Tick-tock...');

        // Task 1: Check Prices every hour (0 * * * *)
        // For Demo: Check every minute (* * * * *)
        cron.schedule('* * * * *', async () => {
            console.log('[Scheduler] 🕗 Running Hourly Price Check...');
            const drops = await PriceWatcher.checkPrices();

            if (drops.length > 0 && TARGET_USER_ID) {
                // Send Push Notification
                const messages: string[] = drops.map(d =>
                    `📉 降價通知！\n----------\n商品：${d.target.name}\n價格：${d.oldPrice} ➔ ${d.newPrice}\n降幅：$${d.drop}\n連結：${d.target.url}`
                );

                // LINE Push (Batching logic needed for >5 messages, simplifying here)
                for (const msg of messages) {
                    await client.pushMessage(TARGET_USER_ID, { type: 'text', text: msg });
                }
            } else if (drops.length > 0) {
                console.log('[Scheduler] Price drops detected but no USER_ID configured.');
            }
        });
    }
};
