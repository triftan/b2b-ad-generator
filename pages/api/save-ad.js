export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { headline, body, framework, imageUrl } = req.body;

  console.log("Ad received:", { headline, body, framework, imageUrl });

  return res.status(200).json({
    status: "success",
    message: "Ad saved successfully.",
    data: { headline, body, framework, imageUrl }
  });
}
