import { Telegraf, Context } from 'telegraf';
import { generateAIResponse } from '../services/aiService';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || '');

// 格式化 AI 回覆為 Telegram Markdown
function formatForTelegram(text: string): string {
    // Telegram MarkdownV2 需要轉義特殊字元
    return text
        .replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1')
        .replace(/\\\*\\\*(.+?)\\\*\\\*/g, '*$1*')  // Bold
        .replace(/\\`\\`\\`(\w*)\n([\s\S]*?)\\`\\`\\`/g, '```$1\n$2```'); // Code blocks
}

// /start 指令
bot.start((ctx) => {
    ctx.reply(
        '🤖 *MOLTBOT* 已上線！\n\n' +
        '直接傳訊息給我，我會用 AI 回答你。\n\n' +
        '📌 *指令*\n' +
        '/help \\- 顯示幫助\n' +
        '/status \\- 檢查狀態',
        { parse_mode: 'MarkdownV2' }
    );
});

// /help 指令
bot.help((ctx) => {
    ctx.reply(
        '📚 *MOLTBOT 使用指南*\n\n' +
        '直接輸入任何問題，AI 會回答你。\n\n' +
        '*範例：*\n' +
        '• 「幫我查台積電股價」\n' +
        '• 「寫一段 Python 排序程式」\n' +
        '• 「翻譯這段英文」',
        { parse_mode: 'MarkdownV2' }
    );
});

// /status 指令
bot.command('status', (ctx) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);

    ctx.reply(
        `🟢 *MOLTBOT Status*\n\n` +
        `⏱ Uptime: ${hours}h ${minutes}m\n` +
        `🤖 AI: Gemini Pro\n` +
        `📡 Platform: Telegram`,
        { parse_mode: 'Markdown' }
    );
});

// 處理一般訊息
bot.on('text', async (ctx) => {
    const userMessage = ctx.message.text;
    const userId = ctx.from.id.toString();

    console.log(`[Telegram] Received: ${userMessage} from ${userId}`);

    // 顯示 "正在輸入" 狀態
    await ctx.sendChatAction('typing');

    try {
        const aiResponse = await generateAIResponse(userMessage, userId);

        if (!aiResponse) {
            await ctx.reply('⚠️ 無法取得回應，請稍後再試。');
            return;
        }

        // Telegram 訊息長度限制 4096 字元
        if (aiResponse.length > 4000) {
            // 分段發送
            const chunks = aiResponse.match(/[\s\S]{1,4000}/g) || [];
            for (const chunk of chunks) {
                await ctx.reply(chunk);
            }
        } else {
            // 嘗試用 Markdown，失敗則用純文字
            try {
                await ctx.reply(aiResponse, { parse_mode: 'Markdown' });
            } catch {
                await ctx.reply(aiResponse);
            }
        }
    } catch (error) {
        console.error('[Telegram] Error:', error);
        await ctx.reply('❌ 處理請求時發生錯誤。');
    }
});

// 錯誤處理
bot.catch((err, ctx) => {
    console.error(`[Telegram] Error for ${ctx.updateType}:`, err);
});

export { bot as telegramBot };
