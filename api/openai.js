const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1", // 👈 Required for OpenRouter
  defaultHeaders: {
    "HTTP-Referer": "yourdomain.com", // Optional: your website or app name
    "X-Title": "Health Assistant", // Optional: display name on OpenRouter UI
  },
});

async function generateMessage(message, productNamesList) {
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-4o", // or any model like "anthropic/claude-3-opus"
    messages: [
      {
        role: "system",
        content: `
          You are a helpful and knowledgeable AI medical assistant.
          - You can include relevant external links using markdown (e.g., [text](https://link)).
          - You help users understand possible causes of symptoms, suggest when to seek professional care, and provide general health advice based on provided information.
          - You may also include illustrative images using markdown image syntax (e.g., ![image](https://link-to-image)).
          - Keep responses concise and helpful.
          - Always remind users you're not a substitute for a licensed medical professional.
          - Use clear, calm, and compassionate language. Remember that you're playing the role of a chat bot in a mobile device, so keep responses concise and to the point.
          - You have access to a list of product names: ${productNamesList.join(
            ", "
          )}. You can use these product names to suggest relevant products when appropriate, and when you do use it, you have to re-write the product's name exactly as it is, do not change anything.
          `,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });

  console.log("Completion:", completion.choices[0].message.content);
  return [completion.choices[0].message.content];
}

module.exports = { generateMessage };
