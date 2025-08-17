async function askAI(history) {
    
    const k14 = '9qnYvVS3BleQke1N-H7rIRJRmQvdq5a84u';
    const k15 = 'I_OFgISzCjkETCMEsr4kUhuBHKyNW7Z6UA';    
    const k23 = '6c437f6ba8';
    const k22 = '5f48b9a6d242';    
    const k32 = '2LxomgLEsm30f';
    const k33 = 'D6fZmcEGs5uLK9s';      
    const k41 = 'gsk_UGu1NgE6pvCQrCU';
    const k43 = 'NvywVD5deTo96VDLR';

    const openaiKey = k11+k12+k13+k14+k15;
    const claudeKey = k21+k22+k23;
    const geminiKey = k31+k32+k33;
    const groqKey = k41+k42+k43;

    if (!openaiKey) console.error("OPENAI_API_KEY is not set!");
    else console.log("OPENAI_API_KEY is set:", openaiKey.slice(2, 6) + "...");

    if (!claudeKey) console.error("CLAUDE_API_KEY is not set!");
    else console.log("CLAUDE_API_KEY is set:", claudeKey.slice(2, 6) + "...");

    if (!geminiKey) console.error("GEMINI_API_KEY is not set!");
    else console.log("GEMINI_API_KEY is set:", geminiKey.slice(2, 6) + "...");

    if (!groqKey) console.error("GROQ_API_KEY is not set!");
    else console.log("GROQ_API_KEY is set:", groqKey.slice(2, 6) + "...");

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
        
        const geminiBody = {
            contents: [
                {
                role: 'user',
                parts: [{ text: SYSTEM_PROMPT }],
                },
                ...history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }],
                })),
            ],
            generationConfig: {
                temperature: 0.6,
            },
        };

        const groqBody = {
            model: "llama3-70b-8192",
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
            temperature: 0.6,
            max_tokens: 2048
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

            const resGroq = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqKey}`,
                },
                body: JSON.stringify(groqBody),
            });

            if (resGroq.ok) {
                const data4 = await resGroq.json();
                return data4.choices?.[0]?.message?.content?.trim() || 'Sorry, I did not understand that.';
            } 
            
            const resGemini = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(geminiBody),
            });

            if (resGemini.ok) {
                const data3 = await resGemini.json();
                return data3.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Sorry, I did not understand that.';
            }          

            const t1 = await resOpenAI.text();
            const t2 = await resClaude.text();
            const t3 = await resGemini.text();
            const t4 = await resGroq.text();
            return `OpenAI & Claude & Gemini & Groq Error:\nOpenAI (${resOpenAI.status}): ${t1}
            \nClaude (${resClaude.status}): ${t2}
            \nGemini (${resGemini.status}): ${t3}
            \nGroq (${resGroq.status}): ${t4}`;

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
