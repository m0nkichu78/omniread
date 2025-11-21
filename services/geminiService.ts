import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ReadingConfig, ProcessedArticle, Language, Mode } from "../types";

// Map UI languages to ISO codes for better prompting
const langMap: Record<Language, string> = {
  [Language.FRENCH]: 'French',
  [Language.ENGLISH]: 'English',
  [Language.SPANISH]: 'Spanish',
  [Language.GERMAN]: 'German',
  [Language.ITALIAN]: 'Italian',
  [Language.JAPANESE]: 'Japanese',
};

const getSystemInstruction = (config: ReadingConfig) => {
  const baseRole = `You are an expert editor and translator named OmniRead.
  Your goal is to transform raw text or a URL content into a calm, readable experience.
  Target Language: ${langMap[config.targetLanguage]}
  Tone: ${config.tone}`;

  if (config.mode === Mode.SUMMARY) {
    return `${baseRole}
    Format: A concise summary of the key points.
    
    Specific formatting rules:
    1. The 'summaryQuote' should be a 1-2 sentence extraction or synthesis.
    2. The 'content' should be a structured summary in Markdown.
    `;
  } else {
    // FULL MODE
    return `${baseRole}
    Format: A STRICT, FULL TRANSLATION of the original content.
    
    Specific formatting rules:
    1. The 'summaryQuote' should be a 1-2 sentence extraction or synthesis serving as a "hook".
    2. The 'content' MUST be the COMPLETE article body translated.
    3. CRITICAL: PRESERVE the exact structure of the original article. Keep all headings (H1, H2, H3), lists, and paragraph breaks exactly as they are in the source.
    4. DO NOT SUMMARIZE the 'content'. Translate it paragraph by paragraph.
    5. Remove only clutter like ads, navigation links, or sidebars. Keep the main article text intact.
    `;
  }
};

export const processContent = async (input: string, config: ReadingConfig, apiKey: string): Promise<Omit<ProcessedArticle, 'id' | 'date' | 'config'>> => {
  // Strict reliance on provided apiKey
  const keyToUse = apiKey;

  if (!keyToUse) {
    throw new Error("Clé API manquante. Veuillez configurer votre clé API dans les paramètres.");
  }

  const ai = new GoogleGenAI({ apiKey: keyToUse });

  // Determine if input is a URL to use Grounding
  const isUrl = input.trim().startsWith('http');

  // Define the expected schema structure
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "The translated title of the article" },
      summaryQuote: { type: Type.STRING, description: "An essential 1-2 sentence quote/summary in italics style" },
      content: { type: Type.STRING, description: "The main body content in Markdown" },
      readingTimeMinutes: { type: Type.NUMBER, description: "Estimated reading time in minutes" },
      sourceName: { type: Type.STRING, description: "The source website name or 'Texte Importé'" }
    },
    required: ["title", "summaryQuote", "content", "readingTimeMinutes", "sourceName"]
  };

  const targetLangName = langMap[config.targetLanguage];
  const modeInstruction = config.mode === Mode.FULL 
    ? "Translate the entire article content word-for-word. PRESERVE ALL HEADINGS, SECTIONS, AND STRUCTURE. Do not summarize." 
    : "Summarize the key points of the article.";

  // Gemini API constraint: Cannot use responseMimeType/responseSchema WITH tools (like googleSearch).
  // If isUrl is true, we use tools, so we must ask for JSON in the prompt text instead.
  // We explicitly add the translation instruction here to ensure it happens during the tool use phase.
  let prompt = `Process the following content: "${input}".\nTarget Language: ${targetLangName}.\nMode: ${config.mode}.\n${modeInstruction}`;
  
  if (isUrl) {
    prompt += `\n\nIMPORTANT: Retrieve the content from the URL using Google Search. Translate the Title, Summary, and Content into ${targetLangName}. 
    
    ${config.mode === Mode.FULL ? "CRITICAL: For the 'content' field, you MUST return the FULL translated text respecting the original article structure (headings, paragraphs). Do not shorten it." : ""}
    
    Return the result strictly as a raw JSON object (no markdown formatting) matching this structure:
    {
      "title": "string (translated)",
      "summaryQuote": "string (translated)",
      "content": "markdown string (translated)",
      "readingTimeMinutes": number,
      "sourceName": "string"
    }`;
  }
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: getSystemInstruction(config),
      tools: isUrl ? [{ googleSearch: {} }] : undefined,
      // Only apply structured output config if NOT using tools
      responseMimeType: isUrl ? undefined : "application/json",
      responseSchema: isUrl ? undefined : responseSchema
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate content");
  }

  let jsonStr = response.text;

  // Clean up potential markdown code blocks if the model added them (common when not using JSON mode)
  if (isUrl) {
    jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
  }

  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    console.error("JSON Parse Error", e);
    console.log("Raw text received:", response.text);
    throw new Error("Failed to parse response from AI");
  }
  
  // Map Language enum to simple code for badge (e.g., 'Français' -> 'FR')
  let languageCode = 'FR';
  if (config.targetLanguage === Language.ENGLISH) languageCode = 'EN';
  if (config.targetLanguage === Language.SPANISH) languageCode = 'ES';
  if (config.targetLanguage === Language.GERMAN) languageCode = 'DE';
  if (config.targetLanguage === Language.ITALIAN) languageCode = 'IT';
  if (config.targetLanguage === Language.JAPANESE) languageCode = 'JP';

  return {
    title: data.title,
    summaryQuote: data.summaryQuote,
    content: data.content,
    readingTimeMinutes: data.readingTimeMinutes,
    sourceName: data.sourceName,
    originalUrl: isUrl ? input : undefined,
    languageCode
  };
};

// Helper to write string to DataView
function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

// Convert raw PCM to WAV (16-bit mono)
function pcmToWav(pcmData: Uint8Array, sampleRate: number = 24000): ArrayBuffer {
  const numChannels = 1;
  const headerLength = 44;
  const dataLength = pcmData.length;
  const buffer = new ArrayBuffer(headerLength + dataLength);
  const view = new DataView(buffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // file length
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sampleRate * blockAlign)
  view.setUint32(28, sampleRate * numChannels * 2, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, numChannels * 2, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, dataLength, true);

  // write the PCM samples
  const pcmArray = new Uint8Array(pcmData);
  const destArray = new Uint8Array(buffer, headerLength);
  destArray.set(pcmArray);

  return buffer;
}

export const generateSpeech = async (text: string, apiKey: string, voiceName: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr' = 'Kore'): Promise<string> => {
  // Strict reliance on provided apiKey
  const keyToUse = apiKey;

  if (!keyToUse) {
     throw new Error("Clé API manquante");
  }

  // Limit text length for TTS preview if necessary to avoid token limits
  const textToSpeak = text.length > 4000 ? text.substring(0, 4000) + "..." : text;

  const ai = new GoogleGenAI({ apiKey: keyToUse });
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: textToSpeak }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  
  if (!base64Audio) {
    throw new Error("Failed to generate audio");
  }

  // Convert Base64 -> Uint8Array
  const binaryString = atob(base64Audio);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Convert Raw PCM -> WAV
  // Gemini 2.5 Flash TTS typically uses 24kHz
  const wavBuffer = pcmToWav(bytes, 24000);

  // Create Blob URL
  const blob = new Blob([wavBuffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
};
