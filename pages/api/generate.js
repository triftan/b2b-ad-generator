export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { brand, description, icp, pain, goal } = req.body;

  const prompt = `You are a legendary copywriter. Based on the following product details, generate 5 different ad copies using different timeless advertising frameworks (e.g., AIDA, PAS, Ogilvy, Hopkins, Caples, Curiosity-driven, etc). Each version must include:
- A clear headline
- The name of the framework used
- A full persuasive ad copy
- A suggested image prompt that would visually match the message

Product Details:
Brand: ${brand}
Description: ${description}
Target Customer: ${icp}
Pain Point: ${pain}
Goal: ${goal}

Respond in a JSON array of 5 objects with keys: framework, headline, body, imagePrompt.`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.75
    })
  });

  const json = await openaiRes.json();
  const raw = json.choices?.[0]?.message?.content || "[]";

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    parsed = [{ framework: "Error", headline: "Parsing Failed", body: raw, imageUrl: "" }];
    return res.status(200).json({ results: parsed });
  }

  const imageResults = await Promise.all(parsed.map(async (item) => {
    try {
      const imageRes = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          prompt: item.imagePrompt,
          n: 1,
          size: "512x512"
        })
      });

      const imageData = await imageRes.json();
      return {
        ...item,
        imageUrl: imageData.data?.[0]?.url || ""
      };
    } catch {
      return { ...item, imageUrl: "" };
    }
  }));

  res.status(200).json({ results: imageResults });
}
