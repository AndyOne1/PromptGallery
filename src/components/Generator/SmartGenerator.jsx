import { useState, useRef, useEffect } from 'react';
import { Wand2, Sparkles, Send, Shield, RefreshCcw, Check, AlertTriangle, User, Plus, X } from 'lucide-react';
import { generateSmartPrompt } from '../../services/openrouter';
import { charactersApi } from '../../services/api';

const VIBES = [
    'Cinematic', 'Candid', 'Cyberpunk', 'Ethereal', 'Dark Fantasy',
    'Studio Portrait', 'Vintage', 'Anime', 'Minimalist', 'Surreal'
];

export default function SmartGenerator({ onComplete, user, initialCharacter }) {
    const [instruction, setInstruction] = useState('');
    const [selectedVibes, setSelectedVibes] = useState([]);
    const [safetyLevel, setSafetyLevel] = useState('sfw');
    const [useReference, setUseReference] = useState(false);
    const [referenceGender, setReferenceGender] = useState('');
    const [useCharacter, setUseCharacter] = useState(initialCharacter ? true : false);
    const [selectedCharacters, setSelectedCharacters] = useState(initialCharacter ? [initialCharacter] : []);
    const [characters, setCharacters] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const textareaRef = useRef(null);

    useEffect(() => {
        loadCharacters();
    }, [user]);

    const loadCharacters = async () => {
        if (!user) {
            const local = JSON.parse(localStorage.getItem('local_characters') || '[]');
            setCharacters(local);
            return;
        }
        try {
            const data = await charactersApi.getAll();
            setCharacters(data);
        } catch (err) {
            console.error('Failed to load characters:', err);
        }
    };

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
        const randomVibe = VIBES[Math.floor(Math.random() * VIBES.length)];
        setSelectedVibes([randomVibe]);
    };

    const handleCharacterToggle = (character) => {
        setSelectedCharacters(prev => {
            const exists = prev.find(c => c.id === character.id);
            if (exists) {
                return prev.filter(c => c.id !== character.id);
            } else {
                return [...prev, character];
            }
        });
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
            // Build instruction with character context if selected
            let characterContext = "";
            if (useCharacter && selectedCharacters.length > 0) {
                characterContext = selectedCharacters.map(char =>
                    `[CHARACTER: ${char.name}]\n${char.prompt}`
                ).join('\n\n');
            }

            let finalInstruction;
            if (useReference) {
                // If reference image is active, simplify the subject and add note
                const subjectInfo = selectedCharacters.length > 0
                    ? selectedCharacters.map(c => `${c.attributes?.gender || 'person'} named ${c.name}`).join(' and ')
                    : 'the subject';

                finalInstruction = `${characterContext ? characterContext + '\n\n' : ''}[SCENE REQUEST]\n${instruction}\n\n[REFERENCE IMAGE MODE: The user will provide a reference image. Use the reference image as the primary subject for ${subjectInfo}. Only include basic identifying features from their descriptions. Match the subject exactly to the reference image.]`;
            } else {
                finalInstruction = `${characterContext ? characterContext + '\n\n' : ''}[SCENE REQUEST]\n${instruction}`;
            }

            const result = await generateSmartPrompt(key, {
                instruction: finalInstruction,
                vibes: selectedVibes,
                safetyLevel,
                useReference,
                referenceGender
            });

            // Add character tags if characters were used
            if (useCharacter && selectedCharacters.length > 0) {
                const charTags = selectedCharacters.map(c => c.name);
                result.refined_tags = [...(result.refined_tags || []), 'Character Prompt', ...charTags];
            }

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
                {/* Character Selection */}
                <div className="control-section">
                    <div className="flex-row justify-between align-center mb-2">
                        <label>Use Characters</label>
                        {useCharacter && (
                            <div className="text-xs text-dim">
                                {selectedCharacters.length} selected
                            </div>
                        )}
                    </div>

                    <div className="flex-col gap-3">
                        <label className="toggle-label glass">
                            <input
                                type="checkbox"
                                checked={useCharacter}
                                onChange={(e) => {
                                    setUseCharacter(e.target.checked);
                                    if (!e.target.checked) setSelectedCharacters([]);
                                }}
                            />
                            <span>Include characters in prompt</span>
                        </label>

                        {useCharacter && (
                            <div className="character-selector-tags glass animate-fade-in">
                                <div className="character-chips">
                                    {selectedCharacters.map(char => (
                                        <button
                                            key={char.id}
                                            className="character-chip active"
                                            onClick={() => handleCharacterToggle(char)}
                                        >
                                            <User size={14} />
                                            <span>{char.name}</span>
                                            <X size={12} className="ml-1" />
                                        </button>
                                    ))}

                                    <div className="character-add-dropdown-wrapper">
                                        <button className="character-chip add-btn">
                                            <Plus size={14} />
                                            <span>Add Character</span>
                                        </button>
                                        <div className="character-dropdown-list glass">
                                            {characters.filter(c => !selectedCharacters.some(sc => sc.id === c.id)).length > 0 ? (
                                                characters
                                                    .filter(c => !selectedCharacters.some(sc => sc.id === c.id))
                                                    .map(char => (
                                                        <button
                                                            key={char.id}
                                                            className="dropdown-item"
                                                            onClick={() => handleCharacterToggle(char)}
                                                        >
                                                            <User size={14} />
                                                            <span>{char.name}</span>
                                                        </button>
                                                    ))
                                            ) : (
                                                <div className="p-2 text-xs text-dim">All characters added</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="control-section">
                    <label>Reference Image</label>
                    <div className="flex-col gap-3">
                        <label className="toggle-label glass">
                            <input
                                type="checkbox"
                                checked={useReference}
                                onChange={(e) => setUseReference(e.target.checked)}
                            />
                            <span>Use Reference Image in final generation</span>
                        </label>

                        {useReference && (
                            <div className="gender-selector glass animate-fade-in">
                                <span className="text-sm text-dim mb-2 block">Subject Gender in Reference:</span>
                                <div className="flex-row gap-2">
                                    <button
                                        className={`chip small ${referenceGender === 'man' ? 'active' : ''}`}
                                        onClick={() => setReferenceGender('man')}
                                    >
                                        Man
                                    </button>
                                    <button
                                        className={`chip small ${referenceGender === 'woman' ? 'active' : ''}`}
                                        onClick={() => setReferenceGender('woman')}
                                    >
                                        Woman
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


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
