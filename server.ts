import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with custom agent telemetry
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// REST API for Screening Chat Proxy
app.post('/api/screening/chat', async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY is not configured in this environment. Please configure it in your Settings > Secrets panel.' 
      });
    }

    const { messages, jobRole } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    const selectedRole = jobRole || 'Senior Full-Stack Developer';

    const systemInstruction = `You are an expert, strict, and senior interviewer conducting a technical and situational screening test for a candidate applying for the [${selectedRole}] position.

Your goal is to test the candidate's real-world experience, practical knowledge, and problem-solving skills before the main interview.

Follow these strict guidelines during the interview:
1. Start the conversation with a polite and professional welcome. Ask the candidate for their name and a brief 1-line introduction about their experience.
2. Do not ask multiple-choice questions (MCQs). Ask open-ended, scenario-based, and problem-solving questions. 
3. Ask ONLY ONE question at a time. Wait for the candidate's response before asking the next question.
4. If the candidate gives a generic or shallow answer (like "I will fix the bug"), push them for deep technical details (e.g., "What specific tools, logs, or methods will you use?").
5. Test them on 3 main pillars:
   - Core Knowledge (Concepts and Architecture)
   - Real-world Scenario (How they handle a crisis or failure in this role)
   - Past Experience (Ask about a complex project they handled and what challenges they faced)
6. Total interview should consist of 4 to 5 high-quality questions.
7. Maintain a professional, objective, and slightly challenging tone. Do not give away the correct answers easily.

At the end of the 5 questions, thank the candidate and tell them: "The test is complete. Please inform the HR team." Then, silently output a short internal evaluation summary for the recruiter based on their answers (Rating out of 10, Strengths, and Weaknesses). Keep this output clean, formal and concise.`;

    // Map client messages format (role: 'user'|'model', text: string) to Gemini contents structure.
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error('Error in screening chat proxy:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// REST API for Evaluator Proxy (Evaluates the session in retrospect)
app.post('/api/screening/evaluate', async (req, res) => {
  try {
    if (!ai) {
      return res.status(500).json({ 
        error: 'GEMINI_API_KEY is not configured in this environment.' 
      });
    }

    const { messages, jobRole } = req.body;
    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages must be an array' });
    }

    const selectedRole = jobRole || 'Senior Full-Stack Developer';

    const promptText = `Analyze the following interview transcript of a candidate applying for the [${selectedRole}] position.
Evaluate their responses based on technical competence, experience, and problem-solving skills shown.
Return a structured JSON with:
1. A numerical rating score out of 10.
2. Strengths list.
3. Weaknesses list.
4. Short recap / narrative summary for the Recruiter.

TRANSCRIPT:
${messages.map(m => `${m.role === 'user' ? 'Candidate' : 'Interviewer'}: ${m.content}`).join('\n')}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['score', 'strengths', 'weaknesses', 'summary'],
          properties: {
            score: {
              type: Type.NUMBER,
              description: 'A numeric score from 1.0 to 10.0 indicating how well they qualified for the role.'
            },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Key strengths noticed in the candidate responses.'
            },
            weaknesses: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Areas for development or technical weaknesses identified.'
            },
            summary: {
              type: Type.STRING,
              description: 'A 2-3 sentence overview justifying the score and general suitability.'
            }
          }
        },
        temperature: 0.1,
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (error: any) {
    console.error('Error in evaluating screening:', error);
    res.status(550).json({ error: error.message || 'Internal Server Error' });
  }
});

// Setup Vite Dev server or production static assets
const setupServer = async () => {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server launched successfully on port ${PORT}`);
  });
};

setupServer();
