
import { LlmResponse } from "@/types";

/**
 * GeminiService provides integration with Google's Gemini API
 */
export class GeminiService {
  private static apiKey: string = "AIzaSyCWTKPDIrSFF0BvVV4HiGj8hNcVZyKYM8E";
  
  /**
   * Checks if an API key is set
   */
  static hasApiKey(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Generates a response from Gemini based on context and question
   */
  static async generateResponse(
    question: string, 
    context: string, 
    chatHistory: string = ""
  ): Promise<LlmResponse> {
    if (!this.apiKey) {
      return {
        answer: "",
        error: "Gemini API key is not configured"
      };
    }
    
    try {
      // Build the prompt for the LLM
      const prompt = this.buildPrompt(question, context, chatHistory);
      
      // Make the actual Gemini API call
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData?.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract the response text
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return {
          answer: data.candidates[0].content.parts[0].text
        };
      } else {
        return {
          answer: "",
          error: "Invalid response format from Gemini API"
        };
      }
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return {
        answer: "",
        error: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  }
  
  /**
   * Builds a well-structured prompt for the LLM
   */
  private static buildPrompt(
    question: string,
    context: string,
    chatHistory: string = ""
  ): string {
    return `
You are a helpful assistant that answers questions based ONLY on the provided context. 
If you don't know the answer based on the provided context, say "I don't have enough information in the provided context to answer this question."
Do not make up information or use prior knowledge outside of the provided context.

CONTEXT:
${context}

${chatHistory ? `PREVIOUS CONVERSATION:\n${chatHistory}\n\n` : ''}

USER QUESTION: ${question}

Please provide a helpful, direct, and well-structured answer based only on the information in the provided context.
`.trim();
  }
}
