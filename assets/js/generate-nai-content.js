  async function askAI(history){
    const key = process.env.OPENAI_API_KEY;
    console.log(key);
    if(USE_DIRECT_OPENAI){	  
        if (!key) {
            console.error("OPENAI_API_KEY is not set!");
        } else {
            console.log("OPENAI_API_KEY is set");
            console.log("Key starts with:", key.slice(0, 4) + "...");
        }

      if(!key) throw new Error('No OPENAI_API_KEY found in localStorage. Add it for local testing.');

	  const key2 = process.env.CLAUDE_API_KEY;
	  if(!key2) throw new Error('No Claude AI Key found in localStorage. Add it for local testing.');
      
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
			{
			role: 'user',
			content: `${SYSTEM_PROMPT}\n\n${history[0]?.content || ''}`
			},
			...history.slice(1)
		]
		};

		let res = await fetch('https://api.openai.com/v1/chat/completions', {
			method: 'POST',
			headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${key}`
			},
			body: JSON.stringify(openaiBody)
		});

		if (res.ok) { 
			const data = await res.json();
			return data.choices?.[0]?.message?.content?.trim() || 'Sorry, I did not understand that.';
		} else { 
			let res2 = await fetch('https://api.aimlapi.com/v1/chat/completions', {
			method: 'POST',
			headers: {				
				'Authorization': `Bearer ${key2}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(claudeBody)
			});

			if (res2.ok) {
			const data2 = await res2.json();
			return data2.content?.[0]?.text?.trim() || 'Sorry, I did not understand that.';
			} else {
			const t1 = await res.text();
			const t2 = await res2.text();
			return `OpenAI & Claude error:\nOpenAI (${res.status}): ${t1}\nClaude (${res2.status}): ${t2}`;
			}
		}
    } else {
      const res = await fetch(PROXY_URL,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: history, system: SYSTEM_PROMPT })
      });
      if(!res.ok){
        const t = await res.text();
        throw new Error('Proxy error '+res.status+': '+t);
      }
      const data = await res.json();
      return (data.reply || '').trim();
    }
  }