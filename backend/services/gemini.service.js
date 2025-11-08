const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

async function formatWithGemini(sanitizedText) {
  const schema = {
    type: 'object',
    properties: {
      patientOverview: { type: 'string' },
      symptoms: { type: 'array', items: { type: 'string' } },
      diagnoses: { type: 'array', items: { type: 'string' } },
      vitals: {
        type: 'object',
        properties: {
          BP: { type: 'string' },
          Pulse: { type: 'string' },
          Temp: { type: 'string' },
        },
      },
      medications: { type: 'array', items: { type: 'string' } },
      notes: { type: 'string' },
    },
  };

  const prompt = `
  You are a medical text structuring assistant.
  Convert this sanitized text into structured JSON data using this schema:
  ${JSON.stringify(schema, null, 2)}

  Text:
  """${sanitizedText}"""
  `;

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: 'application/json' },
  });

  const json = JSON.parse(result.response.text());
  return json;
}

module.exports = { formatWithGemini };