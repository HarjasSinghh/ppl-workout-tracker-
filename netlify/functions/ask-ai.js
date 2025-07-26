// This code runs securely on Netlify's servers
exports.handler = async function(event) {
  const { userMessage } = JSON.parse(event.body);
  const openAIApiKey = process.env.OPENAI_API_KEY; // Securely gets the key

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
    return {
      statusCode: 200,
      body: JSON.stringify({ message: data.choices[0].message.content }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Failed to connect.' }) };
  }
};
