import groq from '../config/groq';
import { CustomError } from '../utils/errorHandler';
import dotenv from 'dotenv';

dotenv.config();

const GROQ_MODEL = process.env.GROQ_MODEL || 'llama3-8b-8192';

export const generateText = async (prompt: string): Promise<string> => {
  if (!groq) {
    throw new CustomError('AI service is not configured. Please set GROQ_API_KEY in environment variables.', 503);
  }
  
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: GROQ_MODEL,
      temperature: 0.7,
      max_tokens: 1024,
    });

    return chatCompletion.choices[0]?.message?.content || 'No response from AI.';
  } catch (error: any) {
    console.error('Error generating text with Groq:', error);
    throw new CustomError(`Failed to generate text with AI: ${error.message}`, 500);
  }
};

export const generateQuizFromText = async (text: string, numQuestions: number = 5): Promise<any> => {
  const prompt = `Based on the following text, generate a multiple-choice quiz with ${numQuestions} questions. Each question should have 4 options, and clearly indicate the correct answer. Provide the output as a JSON array of objects, where each object has 'questionText', 'options' (an array of strings), and 'correctAnswer' (the text of the correct option).

Text:
"${text}"

Example JSON format:
[
  {
    "questionText": "What is the capital of France?",
    "options": ["Berlin", "Madrid", "Paris", "Rome"],
    "correctAnswer": "Paris"
  }
]
`;

  try {
    const response = await generateText(prompt);
    // Attempt to parse the JSON response
    const quizData = JSON.parse(response);
    if (!Array.isArray(quizData) || quizData.some(q => !q.questionText || !Array.isArray(q.options) || !q.correctAnswer)) {
      throw new Error('Invalid quiz format received from AI.');
    }
    return quizData;
  } catch (error: any) {
    console.error('Error generating quiz from text:', error);
    throw new CustomError(`Failed to generate quiz: ${error.message}`, 500);
  }
};