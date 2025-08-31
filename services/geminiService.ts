import { GoogleGenAI, Type } from "@google/genai";
import type { MedicineInfo } from '../types';

if (!process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const medicineInfoSchema = {
    type: Type.OBJECT,
    properties: {
        brandName: { type: Type.STRING, description: "The brand name of the medicine identified from the user query." },
        genericName: { type: Type.STRING, description: "The active pharmaceutical ingredient or generic name of the medicine." },
        publicName: { type: Type.STRING, description: "A commonly known brand name for the generic version of this medicine available in the Indian market." },
        composition: {
            type: Type.ARRAY,
            description: "A list of all active ingredients and their respective strengths (e.g., '500mg').",
            items: {
                type: Type.OBJECT,
                properties: {
                    ingredient: { type: Type.STRING, description: "Name of the active ingredient." },
                    strength: { type: Type.STRING, description: "Strength of the ingredient." },
                },
                required: ["ingredient", "strength"]
            }
        },
        dosage: { type: Type.STRING, description: "General recommended dosage for an adult, e.g., 'One tablet twice a day'." },
        timing: { type: Type.STRING, description: "Recommended timing for dosage, e.g., 'After meals'." },
        brandPrice: { type: Type.STRING, description: "Estimated price for the brand name medicine in India, formatted as '₹XXX for Y units'." },
        genericPrice: { type: Type.STRING, description: "Estimated price for the generic version in India, formatted as '₹XXX for Y units'." },
        availableAt: {
            type: Type.ARRAY,
            description: "A list of 5 fictional but realistic-sounding medical stores in various major cities and states in India where the generic version could be found. At least one store must be located in Tripura.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Fictional name of the medical store." },
                    city: { type: Type.STRING, description: "City where the store is located." },
                    state: { type: Type.STRING, description: "State where the store is located." },
                    address: { type: Type.STRING, description: "Fictional street address of the store." },
                },
                required: ["name", "city", "state", "address"]
            }
        }
    },
    required: ["brandName", "genericName", "publicName", "composition", "dosage", "timing", "brandPrice", "genericPrice", "availableAt"]
};


export const getMedicineInfo = async (
    prompt: string,
    imagePart: { inlineData: { data: string; mimeType: string; } } | null
): Promise<MedicineInfo> => {
    
    const basePrompt = `You are a helpful medical information assistant. Your goal is to provide details about a medicine based on user input. Provide its generic name, a publicly available brand name for the generic version in India, active ingredients with their strengths, common adult dosage, timing, and an estimated price comparison in INR (₹) for both the brand-name and generic versions. Also, suggest a list of 5 fictional medical stores in various cities and states in India where the generic medicine might be available. CRITICAL: Ensure at least one of these stores is located in the state of Tripura. The user's query is as follows:`;

    const fullPrompt = `${basePrompt} ${prompt}`;

    const contents = imagePart ? { parts: [imagePart, { text: fullPrompt }] } : { parts: [{ text: fullPrompt }]};

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: contents,
            config: {
                responseMimeType: "application/json",
                responseSchema: medicineInfoSchema,
                temperature: 0.2
            }
        });
        
        const jsonText = response.text.trim();
        const parsedData = JSON.parse(jsonText);

        // Basic validation
        if (!parsedData.genericName || !parsedData.composition) {
            throw new Error("Invalid data structure received from API.");
        }

        return parsedData as MedicineInfo;

    } catch (error) {
        console.error("Error fetching medicine info from Gemini API:", error);
        throw new Error("Failed to get information from the AI. Please check your input or try again later.");
    }
};