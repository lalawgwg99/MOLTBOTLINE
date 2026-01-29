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

    const userMessage = event.message.text;
    console.log(`Received message: ${userMessage}`);

    // Generate AI Response
    const aiResponse = await generateAIResponse(userMessage);

    // Send Reply
    // Strategy: If response is short, send text. If long/structured, could use Flex.
    // For now, let's stick to standard text for reliability, or use Flex if enabled.

    const echo: TextMessage = {
        type: 'text',
        text: aiResponse
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
