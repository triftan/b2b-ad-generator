// pages/api/generate.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { brand, description, icp, pain, goal } = req.body;

  // 1) Generate the 7 ad variations via Chat Completion
  const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `
You are AdGen — a B2B cold-traffic ad generator. Produce 7 ad variants (Pain, Enemy, Curiosity, Cost, BeforeAfter, Switch, Identity).
For each variant return a JSON object with:
- framework
- headline
- cta
- metaHeadline
- bodyCopy
- imagePrompt
        `},
        { role: 'user', content: `
Brand: ${brand}
Description: ${description}
Target Audience: ${icp}
Top Pain: ${pain}
Primary Goal: ${goal}
        `}
      ],
      temperature: 0.7
    })
  });

  const chatJson = await chatRes.json();
  const items = JSON.parse(chatJson.choices[0].message.content);

  // 2) For each ad, call GPT Image 1 instead of DALL·E
  const imageResults = await Promise.all(
    items.map(async (item) => {
      try {
        const imageRes = await fetch(
          'https://api.openai.com/v1/images/generations',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'gpt-image-1',
              prompt: item.imagePrompt,
              n: 1,
              size: '1000x1000'
            })
          }
        );
        const imageData = await imageRes.json();
        return {
          ...item,
          imageUrl: imageData.data?.[0]?.url || ''
        };
      } catch (error) {
        console.error('Image gen error:', error);
        return { ...item, imageUrl: '' };
      }
    })
  );

  // 3) Return the combined JSON
  res.status(200).json({ results: imageResults });
}
