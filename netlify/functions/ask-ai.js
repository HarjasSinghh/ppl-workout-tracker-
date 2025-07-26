// This is the new, improved netlify/functions/ask-ai.js
exports.handler = async function(event) {
    const { userMessage } = JSON.parse(event.body);
    const openAIApiKey = process.env.OPENAI_API_KEY;

    // First, check if the API key is even available
    if (!openAIApiKey) {
        console.error("CRITICAL: OPENAI_API_KEY environment variable is not set!");
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Server configuration error: API key not found." })
        };
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${openAIApiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are an expert fitness coach. Provide concise, helpful advice.' },
                    { role: 'user', content: userMessage }
                ],
            }),
        });
        
        const data = await response.json();

        // Check for errors returned by OpenAI itself
        if (data.error) {
            console.error("OpenAI API returned an error:", data.error.message);
            return {
                statusCode: 400, // Or whatever status code OpenAI gives
                body: JSON.stringify({ error: data.error.message })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: data.choices[0].message.content }),
        };
    } catch (error) {
        // This will log the detailed network error or other issues
        console.error('Function execution error:', error);
        return { 
            statusCode: 500, 
            body: JSON.stringify({ error: 'Failed to connect to the AI service.' }) 
        };
    }
};
