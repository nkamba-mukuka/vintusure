import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AIGenerationService } from '@/lib/services/aiGenerationService';

export default function AIContentGenerator() {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        try {
            setIsGenerating(true);
            setError(null);
            setResponse('');

            const apiKey = import.meta.env.VITE_GOOGLE_AI_API_KEY;
            if (!apiKey) {
                throw new Error('Google AI API key not found. Please check your environment variables.');
            }

            // Initialize the service with your API key
            AIGenerationService.initialize(apiKey);

            // For streaming response
            await AIGenerationService.generateContentStream(
                { prompt },
                (chunk) => {
                    setResponse(prev => prev + chunk);
                }
            );
        } catch (err) {
            console.error('Error generating content:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="space-y-4 p-4">
            <div className="space-y-2">
                <label htmlFor="prompt" className="text-sm font-medium">
                    Enter your prompt
                </label>
                <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="What would you like me to help you with?"
                    className="min-h-[100px]"
                />
            </div>

            <Button
                onClick={handleGenerate}
                disabled={!prompt || isGenerating}
            >
                {isGenerating ? 'Generating...' : 'Generate'}
            </Button>

            {error && (
                <div className="text-red-500 text-sm">
                    {error}
                </div>
            )}

            {response && (
                <div className="space-y-2">
                    <h3 className="text-sm font-medium">Response:</h3>
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
                        {response}
                    </div>
                </div>
            )}
        </div>
    );
} 