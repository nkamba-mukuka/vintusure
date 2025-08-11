import {
    GoogleGenerativeAI,
    GenerativeModel,
    GenerationConfig,
    GenerateContentRequest,
    EnhancedGenerateContentResponse
} from '@google/generative-ai';

interface GenerationRequest {
    prompt: string;
    config?: Partial<GenerationConfig>;
}

export class AIGenerationService {
    private static ai: GoogleGenerativeAI;
    private static model: GenerativeModel;
    private static defaultConfig: Partial<GenerationConfig> = {
        maxOutputTokens: 65535,
        temperature: 1,
        topP: 0.95,
    };

    /**
     * Initialize the AI service with API key
     */
    static initialize(apiKey: string) {
        this.ai = new GoogleGenerativeAI(apiKey);
        this.model = this.ai.getGenerativeModel({
            model: 'gemini-2.5-flash-lite',
            generationConfig: this.defaultConfig
        });
    }

    /**
     * Generate content using the Gemini model with streaming response
     */
    static async generateContentStream(request: GenerationRequest, onChunk: (text: string) => void) {
        try {
            if (!this.model) {
                throw new Error('AIGenerationService not initialized. Call initialize() first.');
            }

            const result = await this.model.generateContentStream(request.prompt);

            for await (const chunk of result.stream) {
                if (chunk.text) {
                    onChunk(chunk.text);
                }
            }
        } catch (error) {
            console.error('Error generating content:', error);
            throw error;
        }
    }

    /**
     * Generate content using the Gemini model with a single response
     */
    static async generateContent(request: GenerationRequest): Promise<string> {
        try {
            if (!this.model) {
                throw new Error('AIGenerationService not initialized. Call initialize() first.');
            }

            const result = await this.model.generateContent(request.prompt);
            return result.response.text();
        } catch (error) {
            console.error('Error generating content:', error);
            throw error;
        }
    }
} 