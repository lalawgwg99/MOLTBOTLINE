import { Client, WebhookEvent } from '@line/bot-sdk';
import { generateAIResponse } from '../services/aiService';
import { createSmartReply, createErrorFlex } from '../utils/flexMessages';
import dotenv from 'dotenv';
dotenv.config();

const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET || '',
};

const client = new Client(config);

export async function messageHandler(event: WebhookEvent) {
    if (event.type !== 'message' || event.message.type !== 'text') {
        return Promise.resolve(null);
    }

    const userMessage = event.message.text.trim();
    const isGroup = event.source.type === 'group' || event.source.type === 'room';

    // Group Chat Logic: Only reply if mentioned or triggered
    const triggerPrefixes = ['mol', 'Moltbot', '呼叫', 'bot', '@', 'GM'];
    const isTriggered = triggerPrefixes.some(p => userMessage.toLowerCase().startsWith(p.toLowerCase()));

    if (isGroup && !isTriggered) {
        return Promise.resolve(null);
    }

    console.log(`Received message: ${userMessage} (Group: ${isGroup})`);

    try {
        // Generate AI Response
        const aiResponse = await generateAIResponse(userMessage, event.source.userId);

        // 使用智慧中介層：自動判斷用 Text 或 Flex Message
        const reply = createSmartReply(aiResponse || '⚠️ (無回應)');

        return client.replyMessage(event.replyToken, reply);
    } catch (err) {
        console.error("Error in messageHandler:", err);
        // 發生錯誤時用美化的錯誤訊息
        const errorReply = createErrorFlex('處理請求時發生問題，請稍後再試。');
        return client.replyMessage(event.replyToken, errorReply);
    }
}

