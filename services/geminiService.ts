
import { GoogleGenAI } from "@google/genai";

export const getNetflixSpecAdvice = async (currentBitrate: number): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        const prompt = `
            Act as a senior video encoding engineer consulting for a team preparing ad creatives for Netflix.
            A user's video was rejected with the error: "Bitrate ${currentBitrate} is too low."

            Based on the official Netflix Ad Creative Source Specification (which requires a minimum of 10,000 kbps for SDR and 20,000 kbps for HDR), provide a concise and clear explanation and recommendation.

            Structure your response in Markdown:
            1.  **Problem Analysis:** Briefly explain why the bitrate of ${currentBitrate} kbps is too low for Netflix.
            2.  **Netflix Requirements:** State the minimum bitrate requirements for both SDR and HDR content.
            3.  **Recommendation:** Suggest a safe target bitrate for SDR content (e.g., 12,000-15,000 kbps) and explain the benefit of choosing a bitrate slightly above the minimum.
            4.  **Key Settings:** Mention other important encoding settings from the spec, such as H.264 High Profile, Level 4.2.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching advice from Gemini API:", error);
        return "An error occurred while fetching expert advice. Please ensure your Gemini API key is configured correctly. For Netflix compliance, aim for a video bitrate of at least 10,000 kbps for SDR content.";
    }
};
