# MOLTBOT v1.0 (Agentic LINE Bot)

此專案是一款由 **Google Gemini Pro** 驅動的高效能 LINE 機器人，採用愛 Moltbot 及 KDDI AI Manager 啟發的「代理」架構設計。

## 🚀 特色

- **Agentic Core**: 不只是聊天機器人，它被設計成可以管理或助理的角色。
- **繁體中文 (台灣)**: 原生系統提示優化。
- **製作精良**: 使用 Hono + Node.js + TypeScript 製作。
- **God Mode**: 支援 Auto-Dev，可自我編寫程式碼並 Push 到 GitHub。

## 🛠️ 設定

### 1. 設定環境變數

- 複製 `.env.example` 到 `.env`
- 填寫從 [LINE 開發者控制台](https://developers.line.biz/) 取得的 `CHANNEL_ACCESS_TOKEN` `CHANNEL_SECRET`
- 用 [Google AI Studio](https://makersuite.google.com/app/apikey) 補上 `GEMINI_API_KEY`

### 2. 安裝依賴套件 (如果沒安裝)

```bash
npm install
```

## ▶️ 跑步

### • 開發模式

```bash
npm run dev
```

(注意：如果不存在，請將腳本設為使用 dev package.jsontsx watch src/index.tsnpx tsx watch src/index.ts)

### • 向LINE展示

- 用途：`ngrok` `ngrok http 3000`
- 複製 HTTPS 網址 (例如：`https://xxxx.ngrok-free.app`)
- 在 LINE 主控台設定 Webhook URL : `https://xxxx.ngrok-free.app/callback`

---

## ☁️ 雲端啟動 (GitHub Codespaces)

無需電腦，手機即可開發：

1. 點擊 **"Code"** -> **"Codespaces"** -> **"Create codespace on main"**。
2. 等待終端機開啟後，輸入：

   ```bash
   npm install
   npm start
   ```

3. **⚠️ 關鍵步驟 (沒做不會通)**：
   - 點擊下方面板的 **"PORTS"** (連接埠)。
   - 對著 `3000`按右鍵 -> **"Port Visibility"** -> 改為 **"Public"** (公開)。
   - 複製 **"Local Address"** 網址，填入 LINE Webhook URL。
   - (記得網址後面要加 `/callback`)。

## 🧠 客製化

- 編輯 `src/services/aiService.ts` 以調整系統提示或調整「Persona」

---

## 🗣️ 如何使用 (User Guide)

本機器人聽得懂人話，不用死背指令。直接對它說：

### 1. 價格監控
>
> "幫我監控 PChome 這台相機，低於 2 萬通知我 [網址]"

### 2. 萬能查詢
>
> "查一下現在台積電股價多少"

### 3. 筆記助理
>
> "幫我把這件事記下來：明天要開會"

### 4. God Mode (自動寫扣)
>
> "幫我寫一個新的 Tool 用來抓空氣品質，寫完 Push 上去"
