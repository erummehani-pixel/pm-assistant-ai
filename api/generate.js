export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const { input, mode } = req.body;

    if (!input) {
      return res.status(400).json({ error: "Missing input" });
    }

    const prompt = `
You are a senior Product Manager assistant.

Mode: ${mode}

Convert the following notes into structured execution output.

Return sections:

1. Executive Summary
2. Key Decisions
3. Missing / Unclear Areas
4. PRD Draft
5. User Stories
6. Acceptance Criteria (numbered)
7. Dependencies
8. Risk Analysis
9. QA Checklist
10. Stakeholder Update
11. Go / No-Go Recommendation

Rules:
- Be concise
- Do not assume missing facts
- Flag gaps clearly
- Make output practical for engineering + business

Notes:
${input}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({
        error: data.error?.message || "OpenAI error"
      });
    }

    return res.status(200).json({
      result: data.output_text || "No output"
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
