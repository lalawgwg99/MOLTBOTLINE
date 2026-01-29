# MOLTBOT v1.0 (Agentic LINE Bot)

This project is a high-performance LINE Bot powered by **Google Gemini Pro**, designed with an "Agentic" architecture inspired by Moltbot and KDDI's AI Manager.

## 🚀 Features

- **Agentic Core**: Not just a chatbot. It's designed to act as a manager/assistant.
- **Traditional Chinese (Taiwan)**: Native system prompt optimization.
- **Production Ready**: Built with Hono + Node.js + TypeScript.

## 🛠️ Setup

1. **Configure Environment Variables**:
    - Copy `.env.example` to `.env`.
    - Fill in `CHANNEL_ACCESS_TOKEN` and `CHANNEL_SECRET` from [LINE Developers Console](https://developers.line.biz/).
    - Fill in `GEMINI_API_KEY` from [Google AI Studio](https://makersuite.google.com/app/apikey).

2. **Install Dependencies** (if not done):

    ```bash
    npm install
    ```

## ▶️ Running

- **Development Mode**:

    ```bash
    npm run dev
    ```

    (Note: You need to set `dev` script in `package.json` to `tsx watch src/index.ts` if not present, otherwise use `npx tsx watch src/index.ts`)

- **Expose to LINE**:
  - Use `ngrok`: `ngrok http 3000`
  - Copy the HTTPS URL (e.g., `https://xxxx.ngrok-free.app`)
  - Set Webhook URL in LINE Console: `https://xxxx.ngrok-free.app/callback`

## 🧠 Customization

- Edit `src/services/aiService.ts` to tweak the **System Prompt** or adjust the "Persona".
