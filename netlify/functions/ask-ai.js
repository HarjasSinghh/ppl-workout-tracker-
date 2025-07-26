// netlify/functions/analyze-progress.js
exports.handler = async function(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const { dataSummary } = JSON.parse(event.body);
    const geminiApiKey = process.env.GEMINI_API_KEY;

    if (!geminiApiKey || !dataSummary) {
        return { statusCode: 400, body: JSON.stringify({ error: "Bad Request" }) };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`;
    const prompt = `You are a world-class fitness analyst. Analyze the following workout data summary for a user. Identify any areas where they might be stalling or could improve, and provide 2-3 actionable tips in a motivational tone. Format your response with clear headings. Here is the data: ${dataSummary}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Google AI API Error:", errorData.error.message);
            return { statusCode: response.status, body: JSON.stringify({ error: errorData.error.message }) };
        }

        const data = await response.json();
        const aiMessage = data.candidates[0].content.parts[0].text;
        return { statusCode: 200, body: JSON.stringify({ analysis: aiMessage }) };

    } catch (error) {
        console.error('Function Execution Error:', error);
        return { statusCode: 500, body: JSON.stringify({ error: 'Failed to connect to the AI service.' }) };
    }
};
