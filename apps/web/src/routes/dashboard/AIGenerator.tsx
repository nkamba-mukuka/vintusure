import AIContentGenerator from '@/components/ai/AIContentGenerator';

export default function AIGeneratorPage() {
    return (
        <div className="container mx-auto py-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">AI Content Generator</h1>
                <p className="text-gray-600 mb-8">
                    Use this tool to generate content using Google's Gemini AI model. Simply enter your prompt
                    and the AI will generate a response in real-time.
                </p>
                <AIContentGenerator />
            </div>
        </div>
    );
} 