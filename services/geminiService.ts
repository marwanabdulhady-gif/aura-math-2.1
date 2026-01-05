import { GoogleGenAI, Type } from "@google/genai";
import { ScriptContent } from "../types";

// Note: In a real production app, this would be behind a proxy server to hide the key.
// For this demo, we assume process.env.API_KEY is available or handled by the user's setup.
const API_KEY = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey: API_KEY });

const MANIM_SYSTEM_INSTRUCTION = `
You are a specialized AI Agent for generating Python code using the Manim (Mathematical Animation Engine) library. Your goal is to create high-quality, educational animations for math teachers.

CRITICAL RULES:

Class Name: You MUST always use class MathLessonScene(Scene): as the main class.

Library Version: Use Manim Community Edition syntax only.

Mathematical Formulas: Use MathTex for all formulas. Wrap LaTeX in raw strings r"...". Example: MathTex(r"f'(x) = nx^{n-1}").

Coordinate System: Remember the screen is from -7 to 7 on the X-axis and -4 to 4 on the Y-axis. Place titles at UP and center visuals.

Clean Code: Output ONLY raw Python code. Do not include markdown blocks (\\\`\\\`\\\`python), explanations, or comments.

Animation Flow:
- Start with a Title: title = Text("Lesson Title").to_edge(UP).
- Use self.play(Write(title)).
- Use self.play(Create(graph)) for axes or shapes.
- Use self.play(Transform(formula1, formula2)) to show mathematical derivations.

Handling Errors: Avoid complex custom shaders. Stick to standard objects: Axes, Line, Circle, Polygon, ValueTracker.
`;

export interface GeminiLessonResponse {
  title: string;
  script: ScriptContent;
  manimCode: string;
}

export const generateLessonPlan = async (topic: string): Promise<GeminiLessonResponse> => {
  if (!API_KEY) {
    throw new Error("Missing API Key for Gemini Service");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `TOPIC TO VISUALIZE: "${topic}"`,
      config: {
        systemInstruction: MANIM_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            script: {
              type: Type.OBJECT,
              properties: {
                intro: { type: Type.STRING },
                explanation: { type: Type.STRING },
                conclusion: { type: Type.STRING },
              }
            },
            manimCode: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from Gemini");
    
    return JSON.parse(text) as GeminiLessonResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};