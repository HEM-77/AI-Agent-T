async function generateAIResponse(prompt) {
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "task_analysis",
            strict: true,
            schema: {
              type: "object",
              properties: {
                tasks: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      taskId: { type: "string" },
                      priority: {
                        type: "string",
                        enum: ["High", "Medium", "Low"],
                      },
                      reason: { type: "string" },
                    },
                    required: ["taskId", "priority", "reason"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["tasks"],
              additionalProperties: false,
            },
          },
        },
        provider: {
          require_parameters: true,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json();

    throw new Error(errorData.error?.message || "OpenRouter request failed");
  }

  const data = await response.json();

  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("No AI response received");
  }

  return JSON.parse(content);
}

module.exports = { generateAIResponse };
