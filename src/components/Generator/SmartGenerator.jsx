import { useState, useRef, useEffect } from 'react';
import { Wand2, Sparkles, Send, Shield, RefreshCcw, Check, AlertTriangle, User, Plus, X, ImageIcon, ChevronDown } from 'lucide-react';
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
            const activeCharacters = useCharacter ? selectedCharacters : [];
            if (activeCharacters.length > 0) {
                characterContext = activeCharacters.map(char =>
                    `[CHARACTER: ${char.name}]\n${char.prompt}`
                ).join('\n\n');
            }

            let finalInstruction;
            if (useReference) {
                // If reference image is active, simplify the subject and add note
                const subjectInfo = activeCharacters.length > 0
                    ? activeCharacters.map(c => `${c.attributes?.gender || 'person'} named ${c.name}`).join(' and ')
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
            if (useCharacter && activeCharacters.length > 0) {
                const charTags = activeCharacters.map(c => c.name);
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

            <div className="smart-controls-modern">
                <div className="modern-toggles-row">
                    {/* Character Toggle & Popover */}
                    <div className="modern-popover-group">
                        <button
                            className={`modern-toggle-btn ${useCharacter ? 'active' : ''}`}
                            onClick={() => setUseCharacter(!useCharacter)}
                        >
                            <User size={18} />
                            <span>Characters</span>
                            {useCharacter && selectedCharacters.length > 0 && (
                                <span className="badge-count-mini">{selectedCharacters.length}</span>
                            )}
                        </button>

                        {useCharacter && (
                            <div className="modern-popover glass animate-scale-in">
                                <div className="popover-header">
                                    <span>Select Characters</span>
                                    <X size={14} className="clickable" onClick={() => setUseCharacter(false)} />
                                </div>
                                <div className="popover-body character-list-mini">
                                    {characters.length > 0 ? (
                                        characters.map(char => {
                                            const isSelected = selectedCharacters.some(c => c.id === char.id);
                                            return (
                                                <button
                                                    key={char.id}
                                                    className={`popover-item ${isSelected ? 'active' : ''}`}
                                                    onClick={() => handleCharacterToggle(char)}
                                                >
                                                    <div className="flex-row align-center gap-2">
                                                        {isSelected ? <Check size={14} className="text-accent" /> : <div className="bullet-spacer" />}
                                                        <span>{char.name}</span>
                                                    </div>
                                                </button>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 text-center text-dim text-xs">No characters yet</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Reference Image Toggle & Popover */}
                    <div className="modern-popover-group">
                        <button
                            className={`modern-toggle-btn ${useReference ? 'active' : ''}`}
                            onClick={() => setUseReference(!useReference)}
                        >
                            <ImageIcon size={18} />
                            <span>Reference</span>
                            {useReference && referenceGender && (
                                <span className="badge-status-mini">{referenceGender === 'man' ? 'M' : 'W'}</span>
                            )}
                        </button>

                        {useReference && (
                            <div className="modern-popover glass animate-scale-in">
                                <div className="popover-header">
                                    <span>Subject Gender</span>
                                    <X size={14} className="clickable" onClick={() => setUseReference(false)} />
                                </div>
                                <div className="popover-body genders-list-mini">
                                    <button
                                        className={`popover-item ${referenceGender === 'man' ? 'active' : ''}`}
                                        onClick={() => setReferenceGender('man')}
                                    >
                                        <div className="flex-row align-center gap-2">
                                            {referenceGender === 'man' ? <Check size={14} className="text-accent" /> : <div className="bullet-spacer" />}
                                            <span>Man</span>
                                        </div>
                                    </button>
                                    <button
                                        className={`popover-item ${referenceGender === 'woman' ? 'active' : ''}`}
                                        onClick={() => setReferenceGender('woman')}
                                    >
                                        <div className="flex-row align-center gap-2">
                                            {referenceGender === 'woman' ? <Check size={14} className="text-accent" /> : <div className="bullet-spacer" />}
                                            <span>Woman</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Safety Selector (Modernized) */}
                    <div className="safety-selector-modern glass">
                        <button
                            className={`safety-btn sfw ${safetyLevel === 'sfw' ? 'active' : ''}`}
                            onClick={() => setSafetyLevel('sfw')}
                            title="Safe For Work"
                        >
                            SFW
                        </button>
                        <button
                            className={`safety-btn nsfw ${safetyLevel === 'nsfw' ? 'active' : ''}`}
                            onClick={() => setSafetyLevel('nsfw')}
                            title="Not Safe For Work"
                        >
                            NSFW
                        </button>
                        <button
                            className={`safety-btn bypass ${safetyLevel === 'bypass' ? 'active' : ''}`}
                            onClick={() => setSafetyLevel('bypass')}
                            title="Artistic Bypass"
                        >
                            BP
                        </button>
                    </div>
                </div>

                <div className="modern-vibes-section">
                    <label className="text-xs text-dim mb-2 block uppercase letter-spacing-wide">Style Vibes</label>
                    <div className="vibe-chips-modern">
                        {VIBES.map(vibe => (
                            <button
                                key={vibe}
                                className={`modern-vibe-chip ${selectedVibes.includes(vibe) ? 'active' : ''}`}
                                onClick={() => handleVibeToggle(vibe)}
                            >
                                {vibe}
                            </button>
                        ))}
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
