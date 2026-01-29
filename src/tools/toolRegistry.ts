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
            // Check for API Key
            const apiKey = process.env.SERP_API_KEY;
            if (!apiKey) {
                return "⚠️ 請先在 .env 設定 SERP_API_KEY 才能啟用真實搜尋。\n(目前僅回傳模擬結果)";
            }

            try {
                console.log(`[WebSearch] Searching SerpApi for: ${args.query}`);

                // Dynamic import for fetch if needed (Node 18+ has native fetch)
                const url = `https://serpapi.com/search.json?q=${encodeURIComponent(args.query)}&api_key=${apiKey}&engine=google&gl=tw&hl=zh-tw`;

                const response = await fetch(url);
                const data = await response.json();

                if (data.error) {
                    return `❌ Search API Error: ${data.error}`;
                }

                // Parse Organic Results
                const results = data.organic_results?.slice(0, 3).map((r: any, i: number) => {
                    return `${i + 1}. [${r.title}](${r.link})\n   ${r.snippet}`;
                }).join('\n\n') || "沒有找到相關結果。";

                return `🔍 搜尋結果 (${args.query})：\n\n${results}`;

            } catch (error: any) {
                console.error("SerpApi Error:", error);
                return `❌ 網路搜尋失敗: ${error.message}`;
            }
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
                // Return content so AI can show it to user
                return `✅ 已為您將內容寫入本機檔案：/data/${args.filename}\n\n內容如下：\n${args.content}`;
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
    },
    'run_shell': {
        name: 'run_shell',
        description: 'Execute a shell command. CAUTION: This gives full control. Use for installing packages, running tests, or file operations.',
        parameters: {
            type: 'OBJECT',
            properties: {
                command: { type: 'STRING', description: 'The shell command to run (e.g., npm install lodash)' }
            },
            required: ['command']
        },
        execute: async (args: any) => {
            const { exec } = await import('child_process');
            const util = await import('util');
            const execAsync = util.promisify(exec);

            try {
                console.log(`[Shell] Executing: ${args.command}`);
                const { stdout, stderr } = await execAsync(args.command, { cwd: process.cwd() });
                return `💻 指令執行成功:\n${stdout}\n(Stderr: ${stderr})`;
            } catch (err: any) {
                return `❌ 指令失敗:\n${err.message}`;
            }
        }
    },
    'git_push_remote': {
        name: 'git_push_remote',
        description: 'Push the current project code to a remote GitHub repository. Commits all changes first.',
        parameters: {
            type: 'OBJECT',
            properties: {
                remoteUrl: { type: 'STRING', description: 'The GitHub repository URL (e.g., https://github.com/user/repo.git)' },
                message: { type: 'STRING', description: 'Commit message' }
            },
            required: ['remoteUrl', 'message']
        },
        execute: async (args: any) => {
            const { exec } = await import('child_process');
            const util = await import('util');
            const execAsync = util.promisify(exec);

            try {
                // 1. Add remote if not exists (or set-url)
                try {
                    await execAsync(`git remote add origin ${args.remoteUrl}`);
                } catch (e) {
                    await execAsync(`git remote set-url origin ${args.remoteUrl}`);
                }

                // 2. Add, Commit, Push
                await execAsync('git add .');
                await execAsync(`git commit -m "${args.message}"`);
                await execAsync('git branch -M main');
                await execAsync('git push -u origin main');

                return `🚀 成功推送到 GitHub!\nRepo: ${args.remoteUrl}`;
            } catch (err: any) {
                return `❌ 推送失敗 (請確認您的電腦已有 GitHub 權限/SSH Key):\n${err.message}`;
            }
        }
    },
    'search_notes': {
        name: 'search_notes',
        description: 'Search through all saved files/notes for specific keywords. Use this to RECALL information or answer questions based on past memories.',
        parameters: {
            type: 'OBJECT',
            properties: {
                keyword: { type: 'STRING', description: 'Keyword to search for (e.g., "會員", "開會", "APIs")' }
            },
            required: ['keyword']
        },
        execute: async (args: any) => {
            const fs = await import('fs/promises');
            const path = await import('path');
            const dataDir = path.join(process.cwd(), 'data');

            try {
                // 1. Check if directory exists
                try {
                    await fs.access(dataDir);
                } catch {
                    return "📭 記憶庫是空的 (沒有任何筆記)";
                }

                // 2. Read all files
                const files = await fs.readdir(dataDir);
                const results: string[] = [];

                for (const file of files) {
                    const content = await fs.readFile(path.join(dataDir, file), 'utf-8');
                    if (content.toLowerCase().includes(args.keyword.toLowerCase())) {
                        results.push(`📄 [${file}]:\n${content.substring(0, 200)}... (略)`); // Preview
                    }
                }

                if (results.length === 0) {
                    return `❌ 找不到關於 "${args.keyword}" 的記憶。\n(Memory is clean)`;
                }

                return `🔍 找到 ${results.length} 筆相關記憶：\n\n${results.join('\n\n')}\n\n(若要查看完整內容，請用 read_note)`;
            } catch (err: any) {
                return `❌ 搜尋失敗: ${err.message}`;
            }
        }
    }
};
