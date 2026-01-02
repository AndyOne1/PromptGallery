import { useState, useRef, useEffect } from 'react';
import { Wand2, Sparkles, Send, Shield, RefreshCcw, Check, AlertTriangle, User, Plus, X, ImageIcon, ChevronDown, Camera, Share2, History, ZapOff } from 'lucide-react';
import { generateSmartPrompt } from '../../services/openrouter';
import { charactersApi } from '../../services/api';

const VIBE_CATEGORIES = {
    'Amateur': {
        icon: Camera,
        subcategories: {
            'Selfie-Typen': [
                { name: 'Handy-Selfie', tags: 'Frontkamera, Arm ausgestreckt, zufälliger Blick, Screen-Flash, shot on phone' },
                { name: 'Spiegel-Selfie', tags: 'Badezimmerspiegel, schlechte Beleuchtung, Handykamera sichtbar, mirror selfie' },
                { name: 'Spiegel-Check', tags: 'Kurzer Blick in den Spiegel, unvorbereitet, natürlicher Ausdruck, quick look' },
                { name: 'Badezimmer-Spiegel', tags: 'Overhead-Beleuchtung, Fliesen im Hintergrund, schlechte Kameraqualität, bathroom mirror' },
                { name: 'Autospiegel-Selfie', tags: 'Fahrzeugspiegel, Tageslicht durch Fenster, Roadtrip-Atmosphäre, car mirror' },
                { name: 'Aufzug-Selfie', tags: 'Metallwände, Deckenlicht, beengter Raum, zufälliger Mitfahrer' },
                { name: 'Toilettenspiegel-Selfie', tags: 'Typische Teenager-Situation, schlechte Handykamera, Blitz, restroom mirror' },
                { name: 'Schrankspiegel-Selfie', tags: 'Dunkler Flur, mäßige Beleuchtung, Kleiderbügel sichtbar, closet mirror' }
            ],
            'Alltag': [
                { name: 'Candid Alltag', tags: 'Ungestellt, während einer Aktivität, keine Pose angenommen, real life' },
                { name: 'Langweiliges Leben', tags: 'Auf dem Sofa liegend, Pyjama, Netflix im Hintergrund, boring reality' },
                { name: 'Prokrastination', tags: 'Handy scrollend, Laptop offen, untätig, lazy day' },
                { name: 'Kochen', tags: 'In der Küche, Schürze, Topf in der Hand, dampfend, cooking' },
                { name: 'Frühstück', tags: 'Am Tisch, Kaffee, verschlavener Look, breakfast' },
                { name: 'Arbeiten', tags: 'Am Laptop, Kaffeetasse, unordentlicher Schreibtisch, workspace' },
                { name: 'Putzen', tags: 'Staub wischend, Reinigungsmittel, Hausschuhe, cleaning' },
                { name: 'Haustier-Interaktion', tags: 'Mit Hund oder Katze, keine Kamera beachtend, pet play' }
            ]
        }
    },
    'Social': {
        icon: Share2,
        subcategories: {
            'Style': [
                { name: 'Instagram-Ästhetik', tags: 'Gute Selfie-Qualität, Filterspuren, trendige Pose, insta style' },
                { name: 'TikTok-Capture', tags: 'Vertikales Video-Frame, Schnappschuss, unvorbereitet, tiktok clip' },
                { name: 'Snapchat-Style', tags: 'Frontkamera, diverses Licht, schnelle Aufnahme, snap chat' },
                { name: 'BeReal-Moment', tags: 'Natürlich, echt, keine Inszenierung, Timer-Optik, be real' },
                { name: 'VSCO-Ästhetik', tags: 'Filmkamera-Look, analoger Farben, Understated, vsco filter' }
            ]
        }
    },
    'Retro': {
        icon: History,
        subcategories: {
            'Ästhetik': [
                { name: '2000er-Jahre', tags: 'Frontkamera-Engelsflügelchen, helle Farben, unscharf, Y2K aesthetic' },
                { name: '2010er-Early', tags: 'Frühe Handykamera-Qualität, Instagram-Startphase, 2010s style' },
                { name: 'Dispo-Kamera', tags: 'Abgelaufen, Farbverschiebung, Kratzer, Korn, disposable camera' },
                { name: 'Einwegkamera-Strand', tags: 'Sommer 2005, Rotstich, verblasst, beach disposable' },
                { name: 'Wegwerfkamera-Party', tags: 'Dunkel, Blitz, verschwommen, authentisch, party snapshot' }
            ]
        }
    },
    'Lo-Fi': {
        icon: ZapOff,
        subcategories: {
            'Unbeabsichtigt': [
                { name: 'Versehentlicher Schnappschuss', tags: 'Kamera in der Tasche ausgelöst, accidental shot' },
                { name: 'Pocket-Dial-Foto', tags: 'Handy in der Tasche, zufällige Aufnahme, pocket photo' },
                { name: 'Screenshots aus Videos', tags: 'Video-Frame, unscharf, komprimiert, video grab' },
                { name: 'Gelöschte Version', tags: 'Komprimiert, Artefakte, schlechte Qualität, low res' },
                { name: 'Niedrige Auflösung', tags: 'Web-Optimierung, Pixelierung, Kompression, poor quality' }
            ]
        }
    }
};

export default function SmartGenerator({ onComplete, user, initialCharacter }) {
    const [instruction, setInstruction] = useState('');
    const [selectedVibeTags, setSelectedVibeTags] = useState([]);
    const [safetyLevel, setSafetyLevel] = useState('sfw');
    const [useReference, setUseReference] = useState(false);
    const [referenceGender, setReferenceGender] = useState('');
    const [useCharacter, setUseCharacter] = useState(initialCharacter ? true : false);
    const [selectedCharacters, setSelectedCharacters] = useState(initialCharacter ? [initialCharacter] : []);
    const [characters, setCharacters] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // UI Popover States
    const [showCharPopover, setShowCharPopover] = useState(false);
    const [showRefPopover, setShowRefPopover] = useState(false);
    const [activeVibePopover, setActiveVibePopover] = useState(null); // 'Amateur', 'Social', etc.

    const textareaRef = useRef(null);
    const charPopoverRef = useRef(null);
    const refPopoverRef = useRef(null);
    const vibePopoverRefs = useRef({});

    useEffect(() => {
        loadCharacters();
    }, [user]);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (charPopoverRef.current && !charPopoverRef.current.contains(event.target)) {
                setShowCharPopover(false);
            }
            if (refPopoverRef.current && !refPopoverRef.current.contains(event.target)) {
                setShowRefPopover(false);
            }
            if (activeVibePopover && vibePopoverRefs.current[activeVibePopover] && !vibePopoverRefs.current[activeVibePopover].contains(event.target)) {
                setActiveVibePopover(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeVibePopover]);

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

    const handleVibeTagToggle = (vibeItem) => {
        const tagString = vibeItem.tags;
        setSelectedVibeTags(prev =>
            prev.includes(tagString) ? prev.filter(t => t !== tagString) : [...prev, tagString]
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

        // Randomly pick a vibe from a random category
        const categories = Object.keys(VIBE_CATEGORIES);
        const randCat = categories[Math.floor(Math.random() * categories.length)];
        const subCats = Object.keys(VIBE_CATEGORIES[randCat].subcategories);
        const randSub = subCats[Math.floor(Math.random() * subCats.length)];
        const items = VIBE_CATEGORIES[randCat].subcategories[randSub];
        const randItem = items[Math.floor(Math.random() * items.length)];
        setSelectedVibeTags([randItem.tags]);
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
                vibes: selectedVibeTags,
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
                    <div className="modern-popover-group" ref={charPopoverRef}>
                        <button
                            className={`modern-toggle-btn ${useCharacter ? 'active' : ''}`}
                            onClick={() => {
                                if (showCharPopover) {
                                    setShowCharPopover(false);
                                } else {
                                    if (!useCharacter) {
                                        setUseCharacter(true);
                                        setShowCharPopover(true);
                                    } else {
                                        setUseCharacter(false);
                                    }
                                }
                            }}
                        >
                            <User size={18} />
                            <span>Characters</span>
                            {useCharacter && selectedCharacters.length > 0 && (
                                <span className="badge-count-mini">{selectedCharacters.length}</span>
                            )}
                        </button>

                        {showCharPopover && (
                            <div className="modern-popover glass animate-scale-in">
                                <div className="popover-header">
                                    <span>Select Characters</span>
                                    <X size={14} className="clickable" onClick={() => setShowCharPopover(false)} />
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
                    <div className="modern-popover-group" ref={refPopoverRef}>
                        <button
                            className={`modern-toggle-btn ${useReference ? 'active' : ''}`}
                            onClick={() => {
                                if (showRefPopover) {
                                    setShowRefPopover(false);
                                } else {
                                    if (!useReference) {
                                        setUseReference(true);
                                        setShowRefPopover(true);
                                    } else {
                                        setUseReference(false);
                                    }
                                }
                            }}
                        >
                            <ImageIcon size={18} />
                            <span>Reference</span>
                            {useReference && referenceGender && (
                                <span className="badge-status-mini">{referenceGender === 'man' ? 'M' : 'W'}</span>
                            )}
                        </button>

                        {showRefPopover && (
                            <div className="modern-popover glass animate-scale-in">
                                <div className="popover-header">
                                    <span>Subject Gender</span>
                                    <X size={14} className="clickable" onClick={() => setShowRefPopover(false)} />
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
                    <label className="text-xs text-dim mb-3 block uppercase letter-spacing-wide">Style Vibes & Categories</label>
                    <div className="modern-toggles-row">
                        {Object.entries(VIBE_CATEGORIES).map(([catName, data]) => {
                            const Icon = data.icon;
                            // Check if any vibe in this category is selected
                            const hasSelection = Object.values(data.subcategories).flat().some(item =>
                                selectedVibeTags.includes(item.tags)
                            );
                            const selectedCount = Object.values(data.subcategories).flat().filter(item =>
                                selectedVibeTags.includes(item.tags)
                            ).length;

                            return (
                                <div
                                    key={catName}
                                    className="modern-popover-group"
                                    ref={el => vibePopoverRefs.current[catName] = el}
                                >
                                    <button
                                        className={`modern-toggle-btn ${hasSelection ? 'active' : ''}`}
                                        onClick={() => {
                                            if (activeVibePopover === catName) {
                                                setActiveVibePopover(null);
                                            } else {
                                                setActiveVibePopover(catName);
                                            }
                                        }}
                                    >
                                        <Icon size={18} />
                                        <span>{catName}</span>
                                        {selectedCount > 0 && (
                                            <span className="badge-count-mini">{selectedCount}</span>
                                        )}
                                    </button>

                                    {activeVibePopover === catName && (
                                        <div className="modern-popover vibe-categories-popover glass animate-scale-in">
                                            <div className="popover-header">
                                                <span>{catName} Styles</span>
                                                <X size={14} className="clickable" onClick={() => setActiveVibePopover(null)} />
                                            </div>
                                            <div className="popover-body vibe-selection-scroll">
                                                {Object.entries(data.subcategories).map(([subCatName, items]) => (
                                                    <div key={subCatName} className="vibe-subgroup">
                                                        <label className="subgroup-label">{subCatName}</label>
                                                        <div className="vibe-grid-mini">
                                                            {items.map(vibeItem => {
                                                                const isSelected = selectedVibeTags.includes(vibeItem.tags);
                                                                return (
                                                                    <button
                                                                        key={vibeItem.name}
                                                                        className={`vibe-pill-mini ${isSelected ? 'active' : ''}`}
                                                                        onClick={() => handleVibeTagToggle(vibeItem)}
                                                                    >
                                                                        {isSelected && <Check size={10} />}
                                                                        <span>{vibeItem.name}</span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
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
