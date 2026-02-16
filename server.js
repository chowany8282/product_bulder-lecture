require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- API Key Check ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("\nFATAL ERROR: Gemini API Key not found.");
  console.error("Please make sure you have a file named '.env' in the project root.");
  console.error("The .env file should contain one line: GEMINI_API_KEY=your_actual_api_key\n");
  process.exit(1); // Stop the server from starting
}
// ---------------------

const app = express();
const port = 3000;

app.use(express.static(__dirname));
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);

app.post('/analyze-log', async (req, res) => {
  const { log } = req.body;

  if (!log) {
    return res.status(400).json({ error: 'Log message is required.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const prompt = `
      Analyze the following Cisco IOS log message. Provide a brief explanation of the probable cause and a clear, actionable solution.
      Format the output as plain text.

      Log Message: "${log}"

      Analysis:
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysis = response.text();
    
    res.json({ analysis });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to analyze log.' });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
