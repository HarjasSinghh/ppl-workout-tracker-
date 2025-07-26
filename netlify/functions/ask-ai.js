// This is the complete, final netlify/functions/ask-ai.js for Gemini
// It now supports conversational memory.

exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { messages } = JSON.parse(event.body);
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
        console.error("CRITICAL: GEMINI_API_KEY environment variable is not set!");
        return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error." }) };
    }

    // Validate that the incoming messages array is correct
    if (!Array.isArray(messages) || messages.length === 0) {
        return { 
            statusCode: 400, 
            body: JSON.stringify({ error: 'Bad Request: "messages" must be a non-empty array.' }) 
        };
    }

    // Gemini requires a specific format for its "contents" array.
    // We need to map our frontend's history to this format.
    // Gemini also uses the role "model" instead of "assistant".
    const contents = messages.map(message => {
        return {
            role: message.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: message.content }]
        };
    });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: contents }) // Send the full history
        });

        const data = await response.json();

        if (data.error || !data.candidates) {
            console.error("Google AI API returned an error:", data.error?.message || 'Invalid response structure');
            return { 
                statusCode: 400, 
                body: JSON.stringify({ error: data.error?.message || 'Failed to get a valid response from the AI service.' })
            };
        }
        
        const aiMessage = data.candidates[0].content.parts[0].text;
        return { statusCode: 200, body: JSON.stringify({ message: aiMessage }) };

    } catch (error) {
        console.error('Function execution error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to connect to the AI service.' }) };
    }
};
