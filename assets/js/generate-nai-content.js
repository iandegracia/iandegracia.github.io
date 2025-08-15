async function askAI(history) {
    const openaiKey = process.env.OPENAI_API_KEY;
    const claudeKey = process.env.CLAUDE_API_KEY;

    if (!openaiKey) console.error("OPENAI_API_KEY is not set!");
    else console.log("OPENAI_API_KEY is set:", openaiKey.slice(0, 4) + "...");

    if (!claudeKey) console.error("CLAUDE_API_KEY is not set!");
    else console.log("CLAUDE_API_KEY is set:", claudeKey.slice(0, 4) + "...");

    if (USE_DIRECT_OPENAI) {
        if (!openaiKey) throw new Error('OPENAI_API_KEY is missing in environment variables.');
        if (!claudeKey) throw new Error('CLAUDE_API_KEY is missing in environment variables.');

        const openaiBody = {
            model: OPENAI_MODEL,
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
            temperature: 0.6
        };

        const claudeBody = {
            model: 'anthropic/claude-opus-4.1',
            max_tokens: 1024,
            temperature: 0.6,
            messages: [
                { role: 'user', content: `${SYSTEM_PROMPT}\n\n${history[0]?.content || ''}` },
                ...history.slice(1)
            ]
        };

        try {
            const resOpenAI = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiKey}`
                },
                body: JSON.stringify(openaiBody)
            });

            if (resOpenAI.ok) {
                const data = await resOpenAI.json();
                return data.choices?.[0]?.message?.content?.trim() || 'Sorry, I did not understand that.';
            }

            const resClaude = await fetch('https://api.aimlapi.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${claudeKey}`
                },
                body: JSON.stringify(claudeBody)
            });

            if (resClaude.ok) {
                const data2 = await resClaude.json();
                return data2.content?.[0]?.text?.trim() || 'Sorry, I did not understand that.';
            }

            const t1 = await resOpenAI.text();
            const t2 = await resClaude.text();
            return `OpenAI & Claude error:\nOpenAI (${resOpenAI.status}): ${t1}\nClaude (${resClaude.status}): ${t2}`;

        } catch (err) {
            console.error("AI request failed:", err);
            throw err;
        }

    } else {
        const res = await fetch(PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: history, system: SYSTEM_PROMPT })
        });

        if (!res.ok) {
            const t = await res.text();
            throw new Error('Proxy error ' + res.status + ': ' + t);
        }

        const data = await res.json();
        return (data.reply || '').trim();
    }
}

window.askAI = askAI;
