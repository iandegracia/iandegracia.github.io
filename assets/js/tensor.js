let modelPromise;

async function getModel() {
    if (!modelPromise) {
        modelPromise = use.load();
    }
    return modelPromise;
}

async function summarizeText(content) {

    // Load the universal sentence encoder model
    const model = await getModel(); 
    //const model = await use.load();

    let sentences = [];

    // Handle different input types safely
    if (typeof content === "string") {
        sentences = content
            .split(/[\.\?\!]\s+/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
    } else if (Array.isArray(content)) {
        sentences = content
            .map(item => {
                if (typeof item === "string") return item.trim();
                if (typeof item === "object" && item !== null) return JSON.stringify(item);
                return String(item);
            })
            .filter(s => s.length > 0);
    } else if (typeof content === "object" && content !== null) {
        sentences = [JSON.stringify(content)];
    }

    if (sentences.length === 0) {
        throw new Error("No valid text found for analysis.");
    }

    //Generate embeddings
    const embeddings = await model.embed(sentences);
    const meanEmbedding = embeddings.mean(0);
    const expanded = meanEmbedding.expandDims(1);
    const scoresTensor = embeddings.matMul(expanded);

    // Rank sentences by similarity to the mean embedding
    const scores = await embeddings.matMul(meanEmbedding.expandDims(1)).data();
    const ranked = sentences.map((s, i) => ({ sentence: s, score: scores[i] }));

    const keySentences = ranked
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map(r => r.sentence);

    // --- Basic sentiment analysis (rule-based) ---
    const textCombined = sentences.join(' ').toLowerCase();
    let sentiment = 'neutral';
    if (textCombined.match(/thank|great|love|awesome|good|happy/)) {
        sentiment = 'positive';
    } else if (textCombined.match(/bad|angry|hate|problem|issue|complain/)) {
        sentiment = 'negative';
    }

    // --- Basic intent detection ---
    let intent = 'general';
    if (/\?$/.test(sentences[sentences.length - 1]) || textCombined.includes('?')) {
        intent = 'question';
    } else if (textCombined.match(/help|support|fix|problem|issue/)) {
        intent = 'support';
    } else if (textCombined.match(/hi|hello|hey/)) {
        intent = 'greeting';
    } else if (textCombined.match(/thanks|thank you/)) {
        intent = 'gratitude';
    } else if (textCombined.match(/connect|reach|get|touch|talk|speak|message|contact/)) {
        intent = 'contact_request';
    }

    embeddings.dispose();
    meanEmbedding.dispose();
    expanded.dispose();
    scoresTensor.dispose();

    return {
        summary: keySentences.join('. ') + '.',
        sentiment: sentiment,
        intent: intent,
        totalMessages: sentences.length,
        scores: scores,
        ranked: ranked
    };
}