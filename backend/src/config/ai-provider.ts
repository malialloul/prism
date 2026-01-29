// src/config/ai-provider.ts
import { Ollama } from 'ollama';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { exec } from 'child_process';

// AI Provider configuration
export type AIProvider = 'ollama' | 'gemini';

export const AI_PROVIDER = (process.env.AI_PROVIDER as AIProvider) || 'gemini';
export const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:1.5b';
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
export const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

// Initialize Ollama client (for local development)
export const ollama = new Ollama({
  host: OLLAMA_URL,
});

// Initialize Gemini client (for production)
let gemini: GoogleGenerativeAI | null = null;
if (GEMINI_API_KEY) {
  gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
}

/**
 * Generate text using the configured AI provider
 */
export async function generateAIResponse(prompt: string, systemPrompt: string): Promise<string> {
  if (AI_PROVIDER === 'gemini') {
    return generateWithGemini(prompt, systemPrompt);
  } else {
    return generateWithOllama(prompt, systemPrompt);
  }
}

/**
 * Generate using Google Gemini
 */
async function generateWithGemini(prompt: string, systemPrompt: string): Promise<string> {
  if (!gemini || !GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in your environment.');
  }

  try {
    const model = gemini.getGenerativeModel({ 
      model: GEMINI_MODEL,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text() || '';
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Generate using Ollama (local)
 */
async function generateWithOllama(prompt: string, systemPrompt: string): Promise<string> {
  try {
    const response = await ollama.generate({
      model: OLLAMA_MODEL,
      prompt,
      system: systemPrompt,
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 300, // Limit tokens for faster response
        num_ctx: 2048,    // Smaller context window for speed
      },
      keep_alive: '5m',   // Keep model loaded for 5 minutes
    });

    return response.response || '';
  } catch (error) {
    if (error instanceof Error && error.message.includes('ECONNREFUSED')) {
      throw new Error('Ollama is not running. Please start Ollama first.');
    }
    if (error instanceof Error && error.message.includes('timeout')) {
      throw new Error('AI request timed out. The model may still be loading. Please try again.');
    }
    throw error;
  }
}

/**
 * Check if Ollama server is running
 */
async function isOllamaRunning(): Promise<boolean> {
  try {
    await ollama.list();
    return true;
  } catch {
    return false;
  }
}

/**
 * Try to start Ollama server
 */
async function tryStartOllama(): Promise<boolean> {
  console.log('🔄 Attempting to start Ollama...');
  
  try {
    if (process.platform === 'win32') {
      exec('start "" "ollama" serve', { windowsHide: true });
    } else if (process.platform === 'darwin') {
      exec('open -a Ollama || ollama serve &');
    } else {
      exec('ollama serve &');
    }

    await new Promise(resolve => setTimeout(resolve, 3000));
    return await isOllamaRunning();
  } catch (error) {
    console.error('Failed to start Ollama:', error);
    return false;
  }
}

/**
 * Check if the required model is available
 */
async function isModelAvailable(): Promise<boolean> {
  try {
    const models = await ollama.list();
    return models.models.some(m => m.name.startsWith(OLLAMA_MODEL));
  } catch {
    return false;
  }
}

/**
 * Pull the required model if not available
 */
async function pullModel(): Promise<void> {
  console.log(`🔄 Pulling Ollama model: ${OLLAMA_MODEL}...`);
  console.log('   This may take a few minutes on first run.');
  
  try {
    const response = await ollama.pull({ 
      model: OLLAMA_MODEL,
      stream: true 
    });
    
    for await (const part of response) {
      if (part.status) {
        process.stdout.write(`\r   ${part.status}${part.completed ? ` ${Math.round((part.completed / part.total) * 100)}%` : ''}`);
      }
    }
    console.log('\n✅ Model pulled successfully');
  } catch (error) {
    throw new Error(`Failed to pull model ${OLLAMA_MODEL}: ${error}`);
  }
}

/**
 * Initialize AI provider - check configuration and availability
 */
export async function initializeAI(): Promise<{ available: boolean; message: string }> {
  console.log('\n🤖 Initializing AI Provider...');
  console.log(`   Provider: ${AI_PROVIDER.toUpperCase()}`);
  
  if (AI_PROVIDER === 'gemini') {
    // Check Gemini configuration
    if (!GEMINI_API_KEY) {
      return {
        available: false,
        message: `Gemini API key not configured. Set GEMINI_API_KEY in your .env file.
   Get a free API key from: https://makersuite.google.com/app/apikey`,
      };
    }
    
    // Just verify API key is set - don't make a test call to avoid quota usage
    console.log(`✅ Gemini AI configured (model: ${GEMINI_MODEL})`);
    return { available: true, message: 'Gemini AI is ready' };
  } else {
    // Initialize Ollama
    let running = await isOllamaRunning();
    
    if (!running) {
      console.log('⚠️  Ollama is not running.');
      running = await tryStartOllama();
      
      if (!running) {
        return {
          available: false,
          message: `Ollama is not running. Please install and start Ollama:
   1. Download from https://ollama.ai
   2. Install and run Ollama
   3. The AI SQL Generator will then be available`,
        };
      }
      console.log('✅ Ollama started successfully');
    } else {
      console.log('✅ Ollama is running');
    }

    const modelAvailable = await isModelAvailable();
    
    if (!modelAvailable) {
      try {
        await pullModel();
      } catch (error) {
        return {
          available: false,
          message: `Failed to pull Ollama model: ${error}`,
        };
      }
    } else {
      console.log(`✅ Model ${OLLAMA_MODEL} is available`);
    }

    return { available: true, message: 'Ollama is ready' };
  }
}
