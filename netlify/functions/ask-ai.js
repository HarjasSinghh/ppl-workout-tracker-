// This is the new, updated netlify/functions/ask-ai.js for Google Gemini
exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { userMessage } = JSON.parse(event.body);
    // We will now use the Gemini API key
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        console.error("CRITICAL: GEMINI_API_KEY environment variable is not set!");
        return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error: API key not found." }) };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are an expert fitness coach. Provide concise, helpful advice on workouts and nutrition. User's question: "${userMessage}"`
                    }]
                }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Google AI API returned an error:", errorData.error.message);
            return { statusCode: response.status, body: JSON.stringify({ error: errorData.error.message }) };
        }

        const data = await response.json();
        const aiMessage = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ message: aiMessage }),
        };
    } catch (error) {
        console.error('Function execution error:', error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: 'Failed to connect to the AI service.' }) 
        };
    }
};
