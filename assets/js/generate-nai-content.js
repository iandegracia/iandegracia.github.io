async function askAI(history) {
    
    const k41 = 'gsk_UGu1NgE6pvCQrCU';   
    const k32 = '2LxomgLEsm30f';  
    const k43 = 'NvywVD5deTo96VDLR';
    const geminiKey = k31+k32+k33;
    const groqKey = k41+k42+k43;

    if (USE_DIRECT_OPENAI) {

        // Gemini from Google
        const geminiHistory = history
            .filter(msg =>
                msg && typeof msg.content === "string" && msg.content.trim().length > 0)
            .map(msg => ({
                role: msg.role === "assistant" ? "model" : "user",
                parts: [{text: msg.content.trim()}]
        }));

        const geminiBody = {
            contents: [
                {
                    role: "user",
                    parts: [{text: SYSTEM_PROMPT}]
                },
                ...geminiHistory
            ],
            generationConfig: {
                temperature: 0.6
            }
        };

        //llama3 from meta - facebook
        const groqBody = {
            //model: "llama3-70b-8192",
            //model: "llama3-8b-8192",
            model: "llama-3.1-8b-instant",
            messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...history],
            temperature: 0.6,
            max_tokens: 2048
        };

        //Qwen from Alibaba Cloud
        const groqBodyQwen = {
            model: "qwen/qwen3.6-27b",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                ...history
            ],
            temperature: 0.1,
            response_format: {
                type: "json_object"
            },
            max_tokens: 1024
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

            const resGemini = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(geminiBody),
            });

            if (resGemini.ok) {
                // const data3 = await resGemini.json();
                // return data3.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Sorry, I did not understand that.';
                const data = await resGemini.json();
                const cleaned =
                    (data?.candidates ?? [])
                        .flatMap(c => c?.content?.parts ?? [])
                        .map(p => p?.text ?? '')
                        .join('\n')
                        .replace(/^```(?:json)?\s*/i, '')
                        .replace(/\s*```$/, '')
                        .trim();

                try {
                    JSON.parse(cleaned);
                    return cleaned;
                }
                catch {
                    return 'Sorry, I did not understand that';
                }
            }  

            const resGroqQwen = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqKey}`,
                },
                body: JSON.stringify(groqBodyQwen),
            });

            if (resGroqQwen.ok) {
                const data4 = await resGroq.json();
                return data4.choices?.[0]?.message?.content?.trim() || 'Sorry, I did not understand that.';
            }

            const t3 = await resGemini.text();
            const t4 = await resGroq.text();
            const t5 = await resGroqQwen.text();

            return `Gemini & Groq Error: \nGemini (${resGemini.status}): ${t3}\nGroq (${resGroq.status}): ${t4}\nQwen (${resGroqQwen.status}): ${t5}`;

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
