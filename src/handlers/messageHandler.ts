import { Client, WebhookEvent, TextMessage } from '@line/bot-sdk';
import { generateAIResponse } from '../services/aiService';
// import { createTextFlexMessage } from '../utils/flexMessages';
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
    // Trigger keywords: @BotName, mol, 呼叫, GM, @GM
    const triggerPrefixes = ['mol', 'Moltbot', '呼叫', 'bot', '@', 'GM'];
    const isTriggered = triggerPrefixes.some(p => userMessage.toLowerCase().startsWith(p.toLowerCase()));

    if (isGroup && !isTriggered) {
        // Ignore non-trigger messages in groups
        return Promise.resolve(null);
    }

    console.log(`Received message: ${userMessage} (Group: ${isGroup})`);

    // Generate AI Response
    const aiResponse = await generateAIResponse(userMessage);

    // Send Reply
    // Strategy: If response is short, send text. If long/structured, could use Flex.
    // For now, let's stick to standard text for reliability, or use Flex if enabled.

    const echo: TextMessage = {
        type: 'text',
        text: aiResponse || "⚠️ (無回應)" // Fallback to prevent 400 error
    };

    // Optionally use Flex
    // const flexEcho = createTextFlexMessage(aiResponse);

    // Note: For real-world use, catch errors (invalid token etc)
    try {
        return client.replyMessage(event.replyToken, echo);
    } catch (err) {
        console.error("Error sending reply:", err);
    }
}
