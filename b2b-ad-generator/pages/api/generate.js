export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { brand, description, icp, pain, goal } = req.body;

  const prompt = `You are a legendary B2B copywriter. Write a persuasive ad copy using timeless frameworks for:
Brand: ${brand}
Description: ${description}
Target Customer: ${icp}
Pain Point: ${pain}
Goal: ${goal}

Respond with headline and ad copy only.`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    })
  });

  const json = await openaiRes.json();
  const reply = json.choices?.[0]?.message?.content || "No response";
  res.status(200).json({ result: reply });
}
