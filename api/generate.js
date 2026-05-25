export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { input, mode } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Missing input" });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing in Vercel. Check Environment Variables and redeploy."
      });
    }

    const prompt = `
You are a senior Product Manager assistant.

Mode: ${mode}

Convert these notes into:
1. Executive Summary
2. Key Decisions
3. Missing / Unclear Areas
4. PRD Draft
5. User Stories
6. Acceptance Criteria
7. Dependencies
8. Risk Analysis
9. QA Checklist
10. Stakeholder Update
11. Go / No-Go Recommendation

Be structured, concise, and practical.

Notes:
${input}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenAI API error"
      });
    }

    return res.status(200).json({
      result: data.output_text || "No output generated"
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
