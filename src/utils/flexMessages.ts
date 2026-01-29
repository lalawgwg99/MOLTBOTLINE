import { FlexMessage, FlexBubble, FlexContainer } from '@line/bot-sdk';

export function createTextFlexMessage(text: string): FlexMessage {
    // Basic formatting to bubble if text is too long or structured
    // For simple text, we might just return text, but let's wrap it in a "Glass" card for style.

    // Parse Markdown-like headers for better presentation
    const sections = text.split('\n');
    const title = sections[0].startsWith('**[') ? sections[0] : 'MOLTBOT Response';
    const body = sections.slice(1).join('\n').trim();

    const bubble: FlexBubble = {
        type: 'bubble',
        size: 'giga',
        styles: {
            header: { backgroundColor: '#000000' },
            body: { backgroundColor: '#1a1a1a' }, // Dark Mode
            footer: { backgroundColor: '#1a1a1a' }
        },
        header: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: 'MOLTBOT SYSTEM',
                    color: '#666666',
                    size: 'xs',
                    weight: 'bold',
                    align: 'center'
                }
            ]
        },
        body: {
            type: 'box',
            layout: 'vertical',
            paddingAll: '20px',
            contents: [
                {
                    type: 'text',
                    text: text, // Direct text for now, can perform better markdown parsing later
                    wrap: true,
                    color: '#ffffff',
                    size: 'sm',
                    lineSpacing: '4px'
                }
            ]
        },
        footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'separator',
                    color: '#333333'
                },
                {
                    type: 'button',
                    action: {
                        type: 'message',
                        label: 'Generate Plan',
                        text: 'Generate Plan'
                    },
                    height: 'sm',
                    style: 'link',
                    color: '#4ec9b0'
                }
            ],
            paddingTop: '10px'
        }
    };

    return {
        type: 'flex',
        altText: title,
        contents: bubble
    };
}
