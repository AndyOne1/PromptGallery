import axios from 'axios';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const analyzePrompt = async (apiKey, prompt) => {
    try {
        const response = await axios.post(
            OPENROUTER_API_URL,
            {
                model: 'x-ai/grok-4.1-fast',
                messages: [
                    {
                        role: 'system',
                        content: `You are an AI assistant specialized in analyzing image prompts. 
            Return ONLY a JSON object with "tags" (array of strings), "title" (string), and "description" (string).
            
            Rules:
            1. "title": EXTREMELY SHORT (3-5 words max). Focus on the core subject/action only. NO technical terms, NO full sentences, NO "Reference woman...". 
               (Good Examples: "Candid Mirror Selfie", "Cyberpunk Cityscape", "Golden Retriever Puppy").
            2. "description": A concise 1-sentence summary of the scene.
            3. "tags": Hierarchy of 6-8 tags (Category, Style, Subject, Environment, Details).
            4. Avoid redundant or micro-tags. Choose broad categories.
            `
                    },
                    {
                        role: 'user',
                        content: `Analyze this image prompt and return clean, hierarchical JSON: "${prompt}"`
                    }
                ],
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'http://localhost:5173',
                    'X-Title': 'PromptFlow Local',
                    'Content-Type': 'application/json'
                }
            }
        );

        // Some models return the content as a string inside message.content
        const content = response.data.choices[0].message.content;
        return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
        if (error.response) {
            console.error('OpenRouter Error:', error.response.data);
        }
        throw error;
    }
};

export const generateFinalPrompt = async (apiKey, selections) => {
    try {
        const response = await axios.post(
            OPENROUTER_API_URL,
            {
                model: 'x-ai/grok-4.1-fast',
                messages: [
                    {
                        role: 'system',
                        content: `You are a professional Prompt Engineer for the "Nano Banana Pro" image generation model. 
                        Nano Banana Pro works best with natural language, full sentences, and specific structures.
                        
                        STRUCTURE (Golden Circle Principle):
                        1. Subject & Main Person: Detailed description of who/what is the focus.
                        2. Environment & Setting: Where and in what context.
                        3. Technical Details: Lighting (natural/studio), camera gear (lens, aperture, sensors), and composition rules.
                        4. Style & Aesthetics: Specific artistic or photographic style and quality parameters.
                        
                        AMATEUR / CANDID SPECIAL RULES:
                        - If "amateur" or "snapshot" or "candid" is detected in selections:
                        - POSITIVE TAGS: "Hyperealistic Amateur photography", "Captured on an android phone", "Boring reality", "Candid", "23mm focal length", "Washed out", "disposable camera vibe", "background also in focus", "imperfect", "everyday aesthetic", "2020 vibe", "slight JPEG artifacts", "Grain in dark areas", "Overexposed", "unedited snapshot".
                        - NEGATIVE TAGS (ACTIVELY AVOID): "No timestamp / date", "No intense colors", "No intense filters", "No Cinematic vibe", "No vignette", "No Background Blur", "No perfect composition", "subject shouldn't be exactly centered", "less symmetry".
                        - NIGHT TIME AMATEUR: Use "Realistic darkness", "harsh phone flash", "washed-out colors", "Auto mode capture". Avoid "neon glow", "light trails", "HDR".
                        
                        IDENTITY LOCKING:
                        - If selections.useReference is true: "Maintain EXACT features, proportions, and identity from reference. No alterations to bone structure or hairstyle."
                        
                        Return a JSON object with: 
                        { 
                          "title": "Extremely short subject-focused title (3-5 words max)",
                          "prompt": "The detailed natural language prompt", 
                          "refined_tags": ["Strictly 6-8 tags total. Use broad categories: Category, Style, Subject, Environment. No micro-tags or redundant details."] 
                        }`
                    },
                    {
                        role: 'user',
                        content: `Create a professional image prompt based on these selections: ${JSON.stringify(selections)}.
                        
                        ${selections.customInstruction ? `PRIORITY INSTRUCTION: Incorporate the following user preference above all else: "${selections.customInstruction}"` : ""}
                        
                        ${selections.useReference ? "CRITICAL: The user is providing a reference image. Your prompt MUST instruct the model to maintain the EXACT features, proportions, and likeness of the subject in the reference image. Do not describe new facial features or body types that would conflict with the reference." : ""}
                        `
                    }
                ],
                response_format: { type: 'json_object' }
            },
            {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'http://localhost:5173',
                    'X-Title': 'PromptFlow Local',
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content;
        return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
        if (error.response) {
            console.error('OpenRouter Error:', error.response.data);
        }
        throw error;
    }
};
