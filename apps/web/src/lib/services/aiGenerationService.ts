import { functions } from '@/lib/firebase/functions';
import { httpsCallable } from 'firebase/functions';

export interface AIGenerationRequest {
    prompt: string;
    maxTokens?: number;
    temperature?: number;
}

export interface AIGenerationResponse {
    text: string;
    success: boolean;
    error?: string;
}

export interface AIStreamChunk {
    text: string;
    done: boolean;
}

export const aiGenerationService = {
    async generateContent(request: AIGenerationRequest): Promise<AIGenerationResponse> {
        try {
            const generateAIContent = httpsCallable<AIGenerationRequest, AIGenerationResponse>(
                functions,
                'generateAIContent'
            );

            const result = await generateAIContent(request);
            return result.data;
        } catch (error) {
            console.error('Error generating AI content:', error);
            return {
                text: '',
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate content',
            };
        }
    },

    async generateContentStream(request: AIGenerationRequest, onChunk: (text: string) => void): Promise<AIGenerationResponse> {
        try {
            const generateAIContentStream = httpsCallable<AIGenerationRequest, AIStreamChunk>(
                functions,
                'generateAIContentStream'
            );

            const result = await generateAIContentStream(request);
            const chunk = result.data;
            onChunk(chunk.text);

            return {
                text: chunk.text,
                success: true,
            };
        } catch (error) {
            console.error('Error generating AI content stream:', error);
            return {
                text: '',
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate content stream',
            };
        }
    },
}; 