
import { GoogleGenAI, Chat, GenerateContentResponse, Type, FunctionDeclaration, ThinkingLevel } from "@google/genai";
import { Event } from "../types";

// System instruction for the assistant
const SYSTEM_INSTRUCTION = `You are StudyPro AI, an intelligent productivity assistant embedded in a comprehensive study and work management app.
Your goal is to help users organize their life, break down complex tasks, explain academic concepts, and provide motivation.
You can directly help users manage their productivity by calling functions to add, update, or delete tasks and events. 
You must always use these functions when a user asks to modify their data.
The user will confirm the action in the UI, after which you will receive an "OK" confirmation that the action was successful.

Modules:
- Dashboard
- Task Management
- Focus Timer
- Calendar
- Notes

Use "Thinking Mode" for complex queries. Keep answers concise.`;

const tools: FunctionDeclaration[] = [
  {
    name: 'addTask',
    parameters: {
      type: Type.OBJECT,
      description: 'Adds a new task to the user\'s task list.',
      properties: {
        title: { type: Type.STRING, description: 'The title of the task.' },
        projectName: { type: Type.STRING, description: 'The name of the project. Optional.' },
        deadline: { type: Type.STRING, description: 'YYYY-MM-DD format. Optional.' },
      },
      required: ['title'],
    },
  },
  {
    name: 'updateTask',
    parameters: {
      type: Type.OBJECT,
      description: 'Updates an existing task. Search for the task by title roughly if ID is not known, but the app handles fuzzy matching best it can.',
      properties: {
        oldTitle: { type: Type.STRING, description: 'The current title of the task to find.' },
        newTitle: { type: Type.STRING, description: 'The new title (optional).' },
        completed: { type: Type.BOOLEAN, description: 'Mark as completed (true) or uncompleted (false).' },
      },
      required: ['oldTitle'],
    },
  },
  {
    name: 'deleteTask',
    parameters: {
      type: Type.OBJECT,
      description: 'Deletes a task from the list.',
      properties: {
        title: { type: Type.STRING, description: 'The title of the task to delete.' },
      },
      required: ['title'],
    },
  },
  {
    name: 'addEvent',
    parameters: {
      type: Type.OBJECT,
      description: 'Adds a new event to the user\'s calendar.',
      properties: {
        title: { type: Type.STRING, description: 'The title of the event.' },
        date: { type: Type.STRING, description: 'YYYY-MM-DD format.' },
        startTime: { type: Type.STRING, description: 'HH:mm format. Optional.' },
        endTime: { type: Type.STRING, description: 'HH:mm format. Optional.' },
      },
      required: ['title', 'date'],
    },
  },
  {
    name: 'addNote',
    parameters: {
      type: Type.OBJECT,
      description: 'Adds a new note or journal entry.',
      properties: {
        title: { type: Type.STRING, description: 'The title of the note.' },
        content: { type: Type.STRING, description: 'The body content of the note.' },
        category: { type: Type.STRING, description: 'Category (e.g., General, University, Journal).' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'addGoal',
    parameters: {
      type: Type.OBJECT,
      description: 'Adds a new habit or goal to track.',
      properties: {
        title: { type: Type.STRING, description: 'The habit or goal to track.' },
        icon: { type: Type.STRING, description: 'A single emoji representing the goal.' },
        color: { type: Type.STRING, description: 'A hex color code (e.g., #ef4444).' },
      },
      required: ['title'],
    },
  },
  {
    name: 'addFlashcard',
    parameters: {
      type: Type.OBJECT,
      description: 'Adds a new flashcard to a deck.',
      properties: {
        deckTitle: { type: Type.STRING, description: 'The title of the deck to add the card to.' },
        front: { type: Type.STRING, description: 'The question or term on the front.' },
        back: { type: Type.STRING, description: 'The answer or definition on the back.' },
      },
      required: ['deckTitle', 'front', 'back'],
    },
  }
];

const getApiKey = (): string | null => {
  return process.env.GEMINI_API_KEY || null;
};

export const createChatSession = (): Chat | null => {
  const apiKey = getApiKey();
  if (!apiKey) return null;
  const ai = new GoogleGenAI({ apiKey });
  return ai.chats.create({
    model: 'gemini-3.1-pro-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [{ functionDeclarations: tools }],
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }, 
    },
  });
};

export const sendMessageStream = async (
  chat: Chat,
  message: string
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    return await chat.sendMessageStream({ message });
  } catch (error: unknown) {
    console.error("Error sending message to Gemini:", error);
    if ((error as Error)?.message?.includes("Requested entity was not found") || (error as Error)?.message?.includes("API key not valid")) {
        throw new Error("API Key issue: Please check your API key in Settings.");
    }
    throw error;
  }
};

export const getDailyPrompt = async (): Promise<string> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return "What is your main focus for today?";
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate a short, one-sentence reflective prompt for a student or professional to start their day.",
    });
    return response.text?.trim() || "What is your main focus for today?";
  } catch {
    return "What is your main focus for today?"; 
  }
};

export const generateSubtasks = async (title: string, notes?: string): Promise<string[]> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return [];
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Break down the task "${title}" ${notes ? `(Context: ${notes})` : ''} into a JSON list of subtasks strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subtasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            }
          }
        }
      },
    });
    const json = JSON.parse(response.text || "{}");
    return json.subtasks || [];
  } catch {
    return [];
  }
};

export const parseEventFromText = async (text: string): Promise<Partial<Omit<Event, 'id' | 'color'>>> => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) return {};
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Extract event details from "${text}" relative to ${new Date().toISOString()} as JSON.`,
       config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            startTime: { type: Type.STRING },
            endTime: { type: Type.STRING },
          },
          required: ['title', 'date']
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch {
    return {};
  }
};
