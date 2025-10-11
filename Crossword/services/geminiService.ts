import { GoogleGenAI, Type } from "@google/genai";
import type { PuzzleData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateTopicText = async (topic: string, language: string): Promise<string> => {
    try {
        const prompt = `Generate a rich, descriptive text in ${language} of around 250 words about "${topic}". The text should be suitable for creating a crossword puzzle, so it should contain many specific nouns, verbs, and key terms related to the topic. Do not format it as a list. Write it as a single block of prose.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating topic text:", error);
        throw new Error("The AI failed to generate text for the topic. Please try another topic.");
    }
};


const responseSchema = {
    type: Type.OBJECT,
    properties: {
        gridSize: { 
            type: Type.INTEGER, 
            description: "The size of the grid (e.g., 15 for a 15x15 grid). Max 15." 
        },
        clues: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    number: { type: Type.INTEGER, description: "The clue number on the grid." },
                    clue: { type: Type.STRING, description: "The crossword puzzle clue." },
                    answer: { 
                        type: Type.STRING, 
                        description: "The answer to the clue. Should be all uppercase, contain no spaces or special characters." 
                    },
                    direction: { type: Type.STRING, description: "The direction of the word: 'across' or 'down'." },
                    row: { type: Type.INTEGER, description: "The 0-indexed starting row of the word." },
                    col: { type: Type.INTEGER, description: "The 0-indexed starting column of the word." }
                },
                required: ["number", "clue", "answer", "direction", "row", "col"]
            }
        }
    },
    required: ["gridSize", "clues"]
};

export const generateCrossword = async (
    content: string,
    wordCount: string,
    difficulty: string,
    language: string
): Promise<PuzzleData> => {
    try {
        const prompt = `Generate a high-quality, solvable 15x15 crossword puzzle with approximately ${wordCount} words and a ${difficulty} difficulty level. The language for the clues and answers must be ${language}. The clues and answers must be derived exclusively from the following text content. The words should intersect correctly. Provide the output as a JSON object that strictly matches the provided schema. The answers must be uppercase and contain no spaces or special characters. Ensure all coordinates are 0-indexed and within the 15x15 grid. Make it challenging but fair, according to the specified difficulty.

Content to use:
---
${content}
---`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        
        const jsonText = response.text;
        const parsedData = JSON.parse(jsonText);

        // Enhanced validation
        if (!parsedData.gridSize || !Array.isArray(parsedData.clues) || parsedData.clues.length < 5) {
            throw new Error("The AI failed to create a valid puzzle from the text. Please try again with a longer or different piece of text, or adjust the puzzle options.");
        }
        
        // Add bounds checking and filter out invalid clues returned by the AI
        const validatedClues = parsedData.clues.filter(clue => {
            // Basic property validation
            if (clue.row === undefined || clue.col === undefined || !clue.answer || typeof clue.answer !== 'string') {
                console.warn('Clue has missing/invalid properties, removing:', clue);
                return false;
            }
            
            const gridSize = parsedData.gridSize;

            // Check if clue starts within the grid
            if (clue.row < 0 || clue.col < 0 || clue.row >= gridSize || clue.col >= gridSize) {
                console.warn('Clue start is out of bounds, removing:', clue);
                return false;
            }
            
            // Check if the entire word fits within the grid
            if (clue.direction === 'across' && (clue.col + clue.answer.length > gridSize)) {
                console.warn('Across clue goes out of bounds, removing:', clue);
                return false;
            }
            if (clue.direction === 'down' && (clue.row + clue.answer.length > gridSize)) {
                console.warn('Down clue goes out of bounds, removing:', clue);
                return false;
            }
            
            return true;
        });

        // If too many clues were invalid, the puzzle is likely unsolvable.
        if (validatedClues.length < 5) {
            throw new Error("The AI created a puzzle that was not valid. Please try generating again, perhaps with a different text or options.");
        }
        
        parsedData.clues = validatedClues;

        // Sanitize answers to be uppercase and remove non-alphabetic characters
        const alphabet = language === 'Spanish' ? 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const regex = new RegExp(`[^${alphabet}]`, 'g');

        parsedData.clues = parsedData.clues.map(clue => ({
            ...clue,
            answer: clue.answer.toUpperCase().replace(regex, ''),
        }));

        return parsedData as PuzzleData;

    } catch (error) {
        console.error("Error generating crossword:", error);
        if (error instanceof Error && error.message.includes("The AI failed")) {
            throw error;
        }
        throw new Error("Failed to generate crossword puzzle. The provided text might be too short, too complex, or the AI is currently unavailable.");
    }
};