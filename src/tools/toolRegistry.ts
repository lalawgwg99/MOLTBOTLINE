import { PriceWatcher } from '../services/priceWatcher';

export interface Tool {
    name: string;
    description: string;
    parameters: any;
    execute: (args: any) => Promise<string>;
}

export const ToolRegistry: Record<string, Tool> = {
    'search_price_history': {
        name: 'search_price_history',
        description: 'Track the price of a product URL. Use this when the user wants to monitor a price drop.',
        parameters: {
            type: 'OBJECT',
            properties: {
                productName: { type: 'STRING', description: 'Name of the product' },
                url: { type: 'STRING', description: 'The URL to monitor' },
                priceSelector: { type: 'STRING', description: 'CSS selector for the price (optional)' }
            },
            required: ['productName', 'url']
        },
        execute: async (args: any) => {
            // Default selector if not provided
            const selector = args.priceSelector || 'body';
            PriceWatcher.addTarget(args.productName, args.url, selector);
            return `✅ 已設好價格監測：${args.productName}\n我會每小時檢查一次，有降價就通知您。`;
        }
    },
    'web_search': {
        name: 'web_search',
        description: 'Search the internet for real-time information. Use this for news, stock prices, or general knowledge queries.',
        parameters: {
            type: 'OBJECT',
            properties: {
                query: { type: 'STRING', description: 'The search query' }
            },
            required: ['query']
        },
        execute: async (args: any) => {
            // Emulating Web Search for demo purposes since we don't have a Google Search API Key configured yet.
            // In a real production version, this would call Google Custom Search API or SerpApi.
            console.log(`[WebSearch] Searching for: ${args.query}`);
            return `🔍 [模擬搜尋結果] 關於 "${args.query}" 的資訊：\n\n1. 相關新聞 A...\n2. 相關數據 B...\n\n(此為模擬回應，請在 .env 設定 SERP_API_KEY 以啟用真實搜尋)`;
        }
    },
    'write_note': {
        name: 'write_note',
        description: 'Save a text note or file to the local system. Use this to remember things, save summaries, or create logs.',
        parameters: {
            type: 'OBJECT',
            properties: {
                filename: { type: 'STRING', description: 'Name of the file (e.g., memo.txt)' },
                content: { type: 'STRING', description: 'The content to write' }
            },
            required: ['filename', 'content']
        },
        execute: async (args: any) => {
            // Safe write to a 'data' folder
            const fs = await import('fs/promises');
            const path = await import('path');
            const dataDir = path.join(process.cwd(), 'data');

            try {
                await fs.mkdir(dataDir, { recursive: true });
                await fs.writeFile(path.join(dataDir, args.filename), args.content);
                return `✅ 已為您將內容寫入本機檔案：\n📂 location: /data/${args.filename}`;
            } catch (err: any) {
                return `❌ 寫入失敗: ${err.message}`;
            }
        }
    },
    'read_note': {
        name: 'read_note',
        description: 'Read a content of a file from the local system.',
        parameters: {
            type: 'OBJECT',
            properties: {
                filename: { type: 'STRING', description: 'Name of the file to read' }
            },
            required: ['filename']
        },
        execute: async (args: any) => {
            const fs = await import('fs/promises');
            const path = await import('path');
            const filePath = path.join(process.cwd(), 'data', args.filename);
            try {
                const content = await fs.readFile(filePath, 'utf-8');
                return `📄 檔案內容 (${args.filename}):\n\n${content}`;
            } catch (err) {
                return `❌ 讀取失敗 (檔案可能不存在)`;
            }
        }
    }
};
