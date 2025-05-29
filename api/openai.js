const OpenAI = require("openai");
const uuid = require("uuid");
require("dotenv").config();

// openai configuration
const openai = new OpenAI({
  organization: process.env.ORGANIZATION,
  project: process.env.PROJECT,
  apiKey: process.env.API_KEY,
});

async function generateMessage(message, voice) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are a helpful and knowledgeable AI medical assistant. You help users understand possible causes of symptoms, suggest when to seek professional care, and provide general health advice based on provided information. You are not a substitute for a licensed medical professional and always advise users to consult a doctor for diagnosis or treatment. Use clear, calm, and compassionate language. Remember that you're playing the role of a chat bot in a mobile device, so keep responses concise and to the point.",
      },
      {
        role: "user",
        content: message,
      },
    ],
    model: "gpt-4.1",
  });
  console.log("Completion: ", completion);
  return [completion.choices[0].message.content];
}

module.exports = { generateMessage };
