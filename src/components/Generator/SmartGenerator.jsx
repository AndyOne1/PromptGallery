import { useState, useRef, useEffect } from 'react';
import { Wand2, Sparkles, Send, Shield, RefreshCcw, Check, AlertTriangle } from 'lucide-react';
import { generateSmartPrompt } from '../../services/openrouter';

const VIBES = [
    'Cinematic', 'Candid', 'Cyberpunk', 'Ethereal', 'Dark Fantasy',
    'Studio Portrait', 'Vintage', 'Anime', 'Minimalist', 'Surreal'
];

export default function SmartGenerator({ onComplete }) {
    const [instruction, setInstruction] = useState('');
    const [selectedVibes, setSelectedVibes] = useState([]);
    const [safetyLevel, setSafetyLevel] = useState('sfw');
    const [isGenerating, setIsGenerating] = useState(false);
    const textareaRef = useRef(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [instruction]);

    const handleVibeToggle = (vibe) => {
        setSelectedVibes(prev =>
            prev.includes(vibe) ? prev.filter(v => v !== vibe) : [...prev, vibe]
        );
    };

    const handleSurprise = () => {
        const surprises = [
            "A futuristic city made of crystal floating in a nebula...",
            "A candid portrait of a woman laughing in a rainy neon street...",
            "An ancient library where books fly like birds...",
            "A cyberpunk samurai eating noodles in a flying car...",
            "A golden retriever wearing a space suit on Mars..."
        ];
        const randomInfo = surprises[Math.floor(Math.random() * surprises.length)];
        setInstruction(randomInfo);
        // Also pick a random vibe
        const randomVibe = VIBES[Math.floor(Math.random() * VIBES.length)];
        setSelectedVibes([randomVibe]);
    };

    const handleGenerate = async () => {
        const key = localStorage.getItem('openrouter_key')?.trim();
        if (!key) {
            alert('Bitte hinterlege zuerst deinen OpenRouter API Key in den Einstellungen.');
            return;
        }

        if (!instruction.trim()) return;

        setIsGenerating(true);
        try {
            const result = await generateSmartPrompt(key, {
                instruction,
                vibes: selectedVibes,
                safetyLevel
            });
            onComplete(result);
        } catch (error) {
            alert('Generation failed: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="smart-generator-container glass animate-fade-in">
            <header className="smart-header">
                <div className="smart-title-wrap">
                    <Sparkles className="text-accent spin-slow" size={24} />
                    <h2>The Mental Canvas</h2>
                </div>
                <button className="btn-secondary small" onClick={handleSurprise}>
                    <RefreshCcw size={14} />
                    <span>Surprise Me</span>
                </button>
            </header>

            <div className="smart-input-area">
                <textarea
                    ref={textareaRef}
                    className="magic-input"
                    placeholder="Describe what you want to see... (e.g. 'A sad robot looking at a butterfly')"
                    value={instruction}
                    onChange={(e) => setInstruction(e.target.value)}
                    disabled={isGenerating}
                />

                <div className="input-actions">
                    <button
                        className="btn-primary-round"
                        onClick={handleGenerate}
                        disabled={!instruction.trim() || isGenerating}
                    >
                        {isGenerating ? <RefreshCcw className="spin" size={20} /> : <Send size={20} />}
                    </button>
                </div>
            </div>

            <div className="smart-controls">
                <div className="control-section">
                    <label>Vibe Modifiers</label>
                    <div className="vibe-scroll">
                        {VIBES.map(vibe => (
                            <button
                                key={vibe}
                                className={`vibe-chip ${selectedVibes.includes(vibe) ? 'active' : ''}`}
                                onClick={() => handleVibeToggle(vibe)}
                            >
                                {vibe}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="control-section">
                    <label>Content Safety</label>
                    <div className="safety-toggle-group glass">
                        <button
                            className={`safety-opt ${safetyLevel === 'sfw' ? 'active sfw' : ''}`}
                            onClick={() => setSafetyLevel('sfw')}
                        >
                            <span>SFW</span>
                        </button>
                        <button
                            className={`safety-opt ${safetyLevel === 'nsfw' ? 'active nsfw' : ''}`}
                            onClick={() => setSafetyLevel('nsfw')}
                        >
                            <span>NSFW</span>
                        </button>
                        <button
                            className={`safety-opt ${safetyLevel === 'bypass' ? 'active bypass' : ''}`}
                            onClick={() => setSafetyLevel('bypass')}
                        >
                            <span>Bypass</span>
                        </button>
                    </div>
                </div>
            </div>

            {!localStorage.getItem('openrouter_key') && (
                <div className="api-warning-banner glass mt-4">
                    <AlertTriangle size={18} />
                    <span>API Key missing in Settings!</span>
                </div>
            )}
        </div>
    );
}
