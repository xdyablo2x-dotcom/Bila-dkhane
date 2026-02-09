
import { GoogleGenAI } from "@google/genai";
import { AppLanguage } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getGlobalPersona = (lang: AppLanguage) => {
  const personas = {
    fr: "Tu es le Stratège Neural de Bila Dkhane. Ton élocution est calme, lente, articulée et extrêmement professionnelle. Tu ne montres aucune précipitation. Tu es là pour assurer le bien-être total de l'Agent. Réponds toujours en Français.",
    ar: "أنت المخطط العصبي لـ Bila Dkhane. حديثك هادئ، بطيء، واضح واحترافي للغاية. لا تظهر أي عجلة. أنت هنا لضمان الرفاهية الكاملة للعميل. أجب دائماً بالعربية الفصحى.",
    en: "You are the Bila Dkhane Neural Strategist. Your speech is calm, slow, articulate, and highly professional. You show no rush. You are here to ensure the Agent's total well-being. Always respond in English.",
    es: "Eres el Estratega Neural de Bila Dkhane. Tu habla es tranquila, lenta, articulada y altamente profesional. No muestras ninguna prisa. Estás aquí para asegurar el bienestar total del Agente. Responde siempre en español."
  };
  return personas[lang] || personas.fr;
};

export const analyzeCraving = async (trigger: string, intensity: number, lang: AppLanguage = 'fr') => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `ALERT: CRAVING [${trigger}] - LEVEL [${intensity}/5]. GENERATE NEURAL SHIELD PROTOCOL.`,
      config: {
        systemInstruction: `${getGlobalPersona(lang)} Mission: Neutraliser l'envie par une commande mentale précise et apaisante de 10-15 mots maximum.`,
        temperature: 0.1,
      }
    });
    return response.text;
  } catch (e) {
    return "Protocol Delta: Focus on breath. Your neuro-resistance is at 100%.";
  }
};

export const getDailyWisdom = async (days: number, target: number, lang: AppLanguage = 'fr') => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Mission Day: ${days}/${target}. Generate a high-end wellness affirmation.`,
      config: {
        systemInstruction: `${getGlobalPersona(lang)} Mission: Générer une seule phrase de bien-être absolu, encourageante et ultra-pro.`,
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (e) {
    return "Every clean cell is a victory in your quantum architecture.";
  }
};

export const getHealthCoachResponse = async (prompt: string, daysClean: number, lang: AppLanguage = 'fr') => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Agent Status: ${daysClean} days. Inquiry: ${prompt}`,
      config: {
        systemInstruction: `${getGlobalPersona(lang)} Mission: Fournir une réponse stratégique, hautement intelligente et calme sur le sevrage.`,
        temperature: 0.5,
      }
    });
    return response.text;
  } catch (error) {
    return "Signal disruption. Maintain focus, Agent Elite.";
  }
};

export const generateAnatomyImage = async (type: 'smoker' | 'elite') => {
  const ai = getAI();
  const prompts = {
    smoker: "A hyper-realistic 4K anatomical rendering of a human torso affected by smoking. Ashy lungs, dark congested airways, dull skin tone, slow-firing grey neural pathways, obsidian background, clinical red warning lights, extreme detail, medical visualization style.",
    elite: "A hyper-realistic 4K anatomical rendering of a perfectly healthy human torso. Luminous emerald-clean lungs, crystalline airways, vibrant golden skin glow, bright electric emerald neural pathways firing rapidly, futuristic medical interface background, sense of peak performance."
  };
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompts[type] }] },
      config: { imageConfig: { aspectRatio: "1:1", imageSize: "1K" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};

export const generateAppHeroImage = async () => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: "Abstract 8K quantum neural field, glowing connections, obsidian background, clinical emerald and deep violet lighting, cinematic 4D depth." }]
      },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};

export const generateWishImage = async (wishName: string) => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: `A photorealistic 4K cinematic visualization of the ultimate reward: ${wishName}. Dramatic lighting, futuristic aesthetic, hyper-detailed symbol of success.` }]
      },
      config: { imageConfig: { aspectRatio: "16:9", imageSize: "1K" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (error) { return null; }
};
