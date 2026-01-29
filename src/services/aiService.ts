import { GoogleGenerativeAI } from "@google/generative-ai";
import { ToolRegistry } from "../tools/toolRegistry";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `
# IDENTITY: MOLTBOT (AI Manager / Antigravity Next)

You are **MOLTBOT**, an elite AI Manager designed to provide executive-level guidance, code architecture solutions, and life advice.
You operate with the **Antigravity Next** philosophy: **No-BS, Visual First, Production Standard**.

## CORE PROTOCOLS
1. **Language**: 100% Traditional Chinese (Taiwan).
2. **Tone**: Professional, confident, stable, and slightly authoritative but deeply supportive.
3. **Format**: Conclusive, structured, actionable. **KEEP RESPONSES SHORT (under 50 words) unless asked for details.**
4. **Brevity**: Do not be chatty. Get straight to the point.

## AGENTIC CAPABILITIES
- **Tools**: You represent a system that CAN connect to real-world tools. 
- **Protocol**: If the user's request matches a tool (e.g., "monitor this price", "search for X"), YOU MUST USE THE TOOL.
`;

export async function generateAIResponse(userMessage: string): Promise<string> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return "⚠️ 系統設定錯誤：找不到 GEMINI_API_KEY。";
        }

        const model = genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            tools: [{
                functionDeclarations: Object.values(ToolRegistry).map(t => ({
                    name: t.name,
                    description: t.description,
                    parameters: t.parameters
                }))
            }]
        });

        const chat = model.startChat({
            history: [
                { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
                { role: "model", parts: [{ text: "收到。我是 MOLTBOT，您的執行代理人。我已準備好調用工具。" }] }
            ]
        });

        const result = await chat.sendMessage(userMessage);
        const response = result.response;

        // Handle Function Calls
        const call = response.functionCalls();
        if (call && call.length > 0) {
            const firstCall = call[0];
            const toolName = firstCall.name;
            const args = firstCall.args;

            console.log(`[AI Agent] Decided to call tool: ${toolName}`);

            if (ToolRegistry[toolName]) {
                // Execute Tool
                const toolOutput = await ToolRegistry[toolName].execute(args);

                // Return Tool Output to AI to generate final response
                // For simplicity in this V1, we just return the tool output directly or summarize it.
                // Ideally, we send this back to Gemini to wrap it in a natural language response.

                // Let's do a simple follow-up:
                const followUpResult = await chat.sendMessage([
                    {
                        functionResponse: {
                            name: toolName,
                            response: { result: toolOutput }
                        }
                    }
                ]);
                return followUpResult.response.text();
            }
        }

        return response.text();
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "⚠️ 接觸異常，思維鏈路中斷。請稍後重試。\n(Error: AI Service Unavailable)";
    }
}
