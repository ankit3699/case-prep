import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type { Message } from '../types';
import { Role } from '../types';

// Ensure the API key is available, otherwise throw an error.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Starts a new chat session with the Gemini model.
 * @param systemInstruction The initial instruction to set the context for the AI.
 * @returns A Chat instance.
 */
export function startCaseChat(systemInstruction: string): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      topK: 40,
    }
  });
  return chat;
}

/**
 * Resumes a chat session with the Gemini model using existing history.
 * @param systemInstruction The initial instruction to set the context for the AI.
 * @param history The existing chat history.
 * @returns A Chat instance.
 */
export function resumeCaseChat(systemInstruction: string, history: Message[]): Chat {
  // The last message might be an empty placeholder from a streaming response, filter it out.
  const validHistory = history.filter(m => m.text.trim() !== '' || m.role === Role.USER);
  
  const mappedHistory = validHistory.map(message => ({
    role: message.role === Role.USER ? 'user' : 'model',
    parts: [{ text: message.text }],
  }));

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: mappedHistory,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.7,
      topK: 40,
    }
  });
  return chat;
}


/**
 * Sends a message to the AI in an existing chat session.
 * @param chat The Chat instance to use.
 * @param message The user's message text.
 * @returns The AI's text response.
 */
export async function sendMessageToAI(chat: Chat, message: string): Promise<string> {
  try {
    const response = await chat.sendMessage({ message: message });
    // Using the .text accessor for direct text output
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    // Provide a user-friendly error message
    return "An error occurred while communicating with the AI. Please try again later.";
  }
}

/**
 * Sends a message to the AI and gets a streaming response.
 * @param chat The Chat instance to use.
 * @param message The user's message text.
 * @returns An async iterator of GenerateContentResponse chunks.
 */
export async function sendMessageToAIStream(chat: Chat, message: string): Promise<AsyncGenerator<GenerateContentResponse>> {
    try {
        const response = await chat.sendMessageStream({ message: message });
        return response;
    } catch (error) {
        console.error("Gemini API stream call failed:", error);
        // In case of an error, return an empty async generator
        async function* emptyGenerator() {}
        return emptyGenerator();
    }
}
