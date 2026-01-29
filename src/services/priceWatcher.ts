import axios from 'axios';
import * as cheerio from 'cheerio';

interface WatchTarget {
    id: string;
    url: string;
    selector: string; // CSS selector for price
    lastPrice: number;
    name: string;
}

// In-memory store (Replace with Database in Prod)
let targets: WatchTarget[] = [
    // Example: PChome 24h (Structure changes often, this is illustrative)
    // { id: '1', name: 'MacBook Air', url: 'https://...', selector: '#PriceTotal', lastPrice: 35900 }
];

export const PriceWatcher = {
    addTarget: (name: string, url: string, selector: string) => {
        targets.push({
            id: Date.now().toString(),
            name,
            url,
            selector,
            lastPrice: 0
        });
        console.log(`[PriceWatcher] Added target: ${name}`);
    },

    checkPrices: async () => {
        const results = [];
        for (const target of targets) {
            try {
                console.log(`[PriceWatcher] Checking ${target.name}...`);
                const { data } = await axios.get(target.url, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
                });
                const $ = cheerio.load(data);

                // Flexible parsing: Try to find numbers in the selected element
                const priceText = $(target.selector).text().trim();
                const priceMatch = priceText.match(/[\d,.]+/);

                if (priceMatch) {
                    const currentPrice = parseFloat(priceMatch[0].replace(/,/g, ''));

                    if (target.lastPrice > 0 && currentPrice < target.lastPrice) {
                        results.push({
                            target,
                            oldPrice: target.lastPrice,
                            newPrice: currentPrice,
                            drop: target.lastPrice - currentPrice
                        });
                    }
                    // Update last price
                    target.lastPrice = currentPrice;
                } else {
                    console.log(`[PriceWatcher] Could not parse price for ${target.name}: ${priceText}`);
                }
            } catch (err) {
                console.error(`[PriceWatcher] Error checking ${target.name}:`, err);
            }
        }
        return results;
    }
};
