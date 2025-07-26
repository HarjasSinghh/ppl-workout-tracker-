// This is the complete, unified netlify/functions/ask-ai.js
exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { type, payload } = JSON.parse(event.body);
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        console.error("CRITICAL: GEMINI_API_KEY environment variable is not set!");
        return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error: API key not found." }) };
    }

    let prompt;

    // Determine the correct prompt based on the request type
    if (type === 'chat') {
        prompt = `You are an expert fitness coach. Provide concise, helpful advice. User's question: "${payload}"`;
    } else if (type === 'analysis') {
        prompt = `You are a world-class fitness analyst. Analyze the following workout data summary. Identify any areas where the user might be stalling or could improve, and provide 2-3 actionable tips in a motivational tone. Format your response with clear headings (e.g., using **bold text**). Here is the data: ${payload}`;
    } else {
        return { statusCode: 400, body: JSON.stringify({ error: "Bad Request: Invalid type." }) };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.error("Google AI API returned an error:", data.error.message);
            return { statusCode: 400, body: JSON.stringify({ error: data.error.message }) };
        }
        
        const aiMessage = data.candidates[0].content.parts[0].text;
        return { statusCode: 200, body: JSON.stringify({ message: aiMessage }) };

    } catch (error) {
        console.error('Function execution error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to connect to the AI service.' }) };
    }
};
