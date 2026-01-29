import { FlexMessage, FlexBubble, FlexBox, FlexComponent, TextMessage } from '@line/bot-sdk';

// 判斷是否需要用 Flex Message
export function shouldUseFlex(text: string): boolean {
    // 長文字、有結構化內容、有列表時使用 Flex
    const hasHeaders = /^\*\*|^##|^###/m.test(text);
    const hasList = /^[-•●]\s|^\d+\./m.test(text);
    const isLong = text.length > 300;
    const hasCodeBlock = /```/.test(text);

    return hasHeaders || hasList || isLong || hasCodeBlock;
}

// 智慧回覆：自動選擇最適合的格式
export function createSmartReply(text: string): TextMessage | FlexMessage {
    if (!shouldUseFlex(text)) {
        return { type: 'text', text: text || '⚠️ (無回應)' };
    }
    return createFlexMessage(text);
}

// 解析 Markdown 並轉換成 Flex 元件
function parseToFlexComponents(text: string): FlexComponent[] {
    const lines = text.split('\n');
    const components: FlexComponent[] = [];
    let currentSection: string[] = [];

    const flushSection = () => {
        if (currentSection.length > 0) {
            components.push({
                type: 'text',
                text: currentSection.join('\n'),
                wrap: true,
                color: '#E0E0E0',
                size: 'sm',
                lineSpacing: '4px'
            });
            currentSection = [];
        }
    };

    for (const line of lines) {
        // Headers
        if (line.startsWith('## ') || line.startsWith('**')) {
            flushSection();
            const headerText = line.replace(/^##\s*/, '').replace(/\*\*/g, '');
            components.push({
                type: 'text',
                text: headerText,
                weight: 'bold',
                color: '#4EC9B0',
                size: 'lg',
                margin: 'lg'
            });
        }
        // Sub-headers
        else if (line.startsWith('### ')) {
            flushSection();
            components.push({
                type: 'text',
                text: line.replace('### ', ''),
                weight: 'bold',
                color: '#9CDCFE',
                size: 'md',
                margin: 'md'
            });
        }
        // List items
        else if (/^[-•●]\s/.test(line) || /^\d+\.\s/.test(line)) {
            flushSection();
            components.push({
                type: 'box',
                layout: 'horizontal',
                margin: 'sm',
                contents: [
                    {
                        type: 'text',
                        text: '•',
                        color: '#4EC9B0',
                        size: 'sm',
                        flex: 0
                    },
                    {
                        type: 'text',
                        text: line.replace(/^[-•●]\s*/, '').replace(/^\d+\.\s*/, ''),
                        wrap: true,
                        color: '#E0E0E0',
                        size: 'sm',
                        margin: 'sm',
                        flex: 1
                    }
                ]
            } as FlexBox);
        }
        // Code blocks
        else if (line.startsWith('```')) {
            flushSection();
            // Skip code fence markers
        }
        // Separator
        else if (line.startsWith('---')) {
            flushSection();
            components.push({
                type: 'separator',
                color: '#333333',
                margin: 'lg'
            });
        }
        // Regular text
        else if (line.trim()) {
            currentSection.push(line);
        }
    }

    flushSection();
    return components;
}

// 主要 Flex Message 生成函數
export function createFlexMessage(text: string): FlexMessage {
    const components = parseToFlexComponents(text);

    // 提取標題（第一個粗體或 header）
    const titleMatch = text.match(/^\*\*(.+?)\*\*|^##\s*(.+)/m);
    const title = titleMatch ? (titleMatch[1] || titleMatch[2]) : 'MOLTBOT';

    const bubble: FlexBubble = {
        type: 'bubble',
        size: 'giga',
        styles: {
            header: { backgroundColor: '#0D1117' },
            body: { backgroundColor: '#161B22' },
            footer: { backgroundColor: '#0D1117' }
        },
        header: {
            type: 'box',
            layout: 'horizontal',
            paddingAll: '15px',
            contents: [
                {
                    type: 'box',
                    layout: 'vertical',
                    flex: 1,
                    contents: [
                        {
                            type: 'text',
                            text: '🤖 MOLTBOT',
                            color: '#4EC9B0',
                            size: 'xs',
                            weight: 'bold'
                        }
                    ]
                },
                {
                    type: 'text',
                    text: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
                    color: '#666666',
                    size: 'xxs',
                    align: 'end'
                }
            ]
        },
        body: {
            type: 'box',
            layout: 'vertical',
            paddingAll: '20px',
            contents: components.length > 0 ? components : [
                { type: 'text', text: text, wrap: true, color: '#E0E0E0', size: 'sm' }
            ]
        },
        footer: {
            type: 'box',
            layout: 'horizontal',
            paddingAll: '10px',
            spacing: 'sm',
            contents: [
                {
                    type: 'button',
                    action: { type: 'message', label: '📋 更多', text: '繼續' },
                    height: 'sm',
                    style: 'link',
                    color: '#4EC9B0'
                },
                {
                    type: 'button',
                    action: { type: 'message', label: '🔄 重問', text: '請重新回答' },
                    height: 'sm',
                    style: 'link',
                    color: '#666666'
                }
            ]
        }
    };

    return {
        type: 'flex',
        altText: title.substring(0, 40),
        contents: bubble
    };
}

// 建立錯誤訊息 Flex
export function createErrorFlex(errorMsg: string): FlexMessage {
    return {
        type: 'flex',
        altText: '⚠️ 錯誤',
        contents: {
            type: 'bubble',
            size: 'kilo',
            styles: { body: { backgroundColor: '#2D1F1F' } },
            body: {
                type: 'box',
                layout: 'vertical',
                paddingAll: '15px',
                contents: [
                    { type: 'text', text: '⚠️ 發生錯誤', color: '#FF6B6B', weight: 'bold', size: 'md' },
                    { type: 'text', text: errorMsg, color: '#CCCCCC', size: 'sm', wrap: true, margin: 'md' }
                ]
            }
        }
    };
}
