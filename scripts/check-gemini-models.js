
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error('No API Key found within .env.local');
    process.exit(1);
}

async function listModels() {
    console.log('--- Listing Models ---');
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error('List Models Failed:', res.status, res.statusText);
            const text = await res.text();
            console.error(text);
        } else {
            const data = await res.json();
            if (data.models) {
                // Filter for generateContent supported models
                const genModels = data.models.filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'));
                console.log('Generate Content Models:');
                genModels.forEach(m => console.log(`- ${m.name} (${m.displayName})`));
            } else {
                console.log('No models found in response.');
            }
        }
    } catch (e) {
        console.error('Exception listing models:', e);
    }
}

async function testGenerate(modelName) {
    console.log(`\n--- Testing ${modelName} ---`);
    const shortName = modelName.replace('models/', '');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${shortName}:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: "Hello" }] }]
    };
    
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (!res.ok) {
            console.error(`Failed ${shortName}:`, res.status, res.statusText);
            const text = await res.text();
            console.error('Error Body:', text);
        } else {
            const data = await res.json();
            console.log(`Success ${shortName}! Response snippet:`, JSON.stringify(data).substring(0, 100));
        }
    } catch (e) {
        console.error(`Exception testing ${shortName}:`, e);
    }
}

async function main() {
    await listModels();
    // Test the one we want to use
    await testGenerate('gemini-1.5-flash');
}

main();
