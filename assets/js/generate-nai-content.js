async function askAI(history) {
    
    const k41 = 'gsk_UGu1NgE6pvCQrCU';   
    const k32 = '2LxomgLEsm30f';  
    const k43 = 'NvywVD5deTo96VDLR';
    const geminiKey = k31+k32+k33;
    const groqKey = k41+k42+k43;

    // if (!geminiKey) console.error("GEMINI_API_KEY is not set!");
    // else console.log("GEMINI_API_KEY is set:", geminiKey.slice(2, 6) + "...");

    // if (!groqKey) console.error("GROQ_API_KEY is not set!");
    // else console.log("GROQ_API_KEY is set:", groqKey.slice(2, 6) + "...");

    if (USE_DIRECT_OPENAI) {
        
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

            const t3 = await resGemini.text();
            const t4 = await resGroq.text();

            return `Gemini & Groq Error: \nGemini (${resGemini.status}): ${t3}\nGroq (${resGroq.status}): ${t4}`;

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
