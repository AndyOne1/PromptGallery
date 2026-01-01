import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, User, Copy, Check, Trash2, ChevronDown, ChevronUp,
    Sparkles, Image as ImageIcon, Send, Loader2, Plus, Pin
} from 'lucide-react';
import { generateSmartPrompt } from '../../services/openrouter';
import { promptsApi, charactersApi } from '../../services/api';
import './CharacterDetailView.css';

const ATTRIBUTE_LABELS = {
    name: 'Name', age: 'Alter', gender: 'Geschlecht',
    hairColor: 'Haarfarbe', hairStyle: 'Haarstil', eyeColor: 'Augenfarbe',
    skinTone: 'Hautton', bodyType: 'Körperbau', height: 'Größe',
    facialFeatures: 'Gesichtszüge', style: 'Stil', personality: 'Persönlichkeit',
    accessories: 'Accessoires', distinguishingMarks: 'Besondere Merkmale'
};

function CollapsibleSection({ title, defaultOpen = true, children, icon }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className={`collapsible-section ${isOpen ? 'open' : ''}`}>
            <button className="collapsible-header" onClick={() => setIsOpen(!isOpen)}>
                {icon}
                <span>{title}</span>
                {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <div className="collapsible-content">
                {children}
            </div>
        </div>
    );
}

export default function CharacterDetailView({
    character,
    isOpen,
    onClose,
    onDelete,
    onUpdate,
    user
}) {
    const [activeTab, setActiveTab] = useState('generator');
    const [copiedId, setCopiedId] = useState(null);
    const [instruction, setInstruction] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [linkedImages, setLinkedImages] = useState([]);
    const [isLoadingImages, setIsLoadingImages] = useState(false);

    useEffect(() => {
        if (character?.id && isOpen) {
            loadLinkedImages();
        }
    }, [character?.id, isOpen]);

    const loadLinkedImages = async () => {
        if (!user || !character?.id) return;
        setIsLoadingImages(true);
        try {
            const data = await charactersApi.getById(character.id);
            setLinkedImages(data.images || []);
        } catch (err) {
            console.error('Failed to load linked images:', err);
        } finally {
            setIsLoadingImages(false);
        }
    };

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopiedId('prompt');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleGenerateScene = async () => {
        const key = localStorage.getItem('openrouter_key')?.trim();
        if (!key) {
            alert('Bitte hinterlege deinen OpenRouter API Key in den Einstellungen.');
            return;
        }
        if (!instruction.trim()) return;

        setIsGenerating(true);
        try {
            const result = await generateSmartPrompt(key, {
                instruction: `Character: ${character.prompt}\n\nScene Request: ${instruction}`,
                vibes: [],
                safetyLevel: 'sfw',
                useReference: false,
                referenceGender: ''
            });

            // Save prompt with Character tag
            if (user) {
                await promptsApi.save(
                    result.prompt,
                    [...(result.refined_tags || []), 'Character Prompt', character.name],
                    `${character.name}: ${result.title}`
                );
            }

            setInstruction('');
            alert('Prompt erstellt und gespeichert!');
        } catch (err) {
            alert('Fehler: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    if (!isOpen || !character) return null;

    const modal = (
        <div className="modal-overlay character-modal-overlay" onClick={onClose}>
            <div
                className="character-detail-landscape glass"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button className="modal-close-btn" onClick={onClose}>
                    <X size={18} />
                </button>

                {/* Header */}
                <div className="detail-header">
                    <h2 className="title-gradient">{character.name}</h2>
                    <div className="header-tags">
                        {character.attributes?.age && <span className="tag">{character.attributes.age}</span>}
                        {character.attributes?.gender && <span className="tag">{character.attributes.gender}</span>}
                    </div>
                </div>

                {/* 3-Column Layout */}
                <div className="detail-columns">
                    {/* Left: Portrait */}
                    <div className="detail-column-left">
                        <div className="large-portrait">
                            {character.pinnedImage?.url ? (
                                <img src={character.pinnedImage.url} alt={character.name} />
                            ) : (
                                <div className="portrait-placeholder-large">
                                    <User size={80} />
                                </div>
                            )}
                        </div>
                        <button
                            className="btn-secondary btn-danger mt-4 w-full"
                            onClick={() => onDelete?.(character.id)}
                        >
                            <Trash2 size={16} />
                            <span>Delete Character</span>
                        </button>
                    </div>

                    {/* Center: Scrollable Info */}
                    <div className="detail-column-center detail-scroll">
                        <CollapsibleSection
                            title="Attributes"
                            defaultOpen={true}
                            icon={<User size={16} />}
                        >
                            <div className="attributes-grid-compact">
                                {Object.entries(character.attributes || {}).map(([key, value]) => (
                                    <div key={key} className="attribute-item">
                                        <span className="attr-label">{ATTRIBUTE_LABELS[key] || key}</span>
                                        <span className="attr-value">{value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </CollapsibleSection>

                        {character.prompt && (
                            <CollapsibleSection
                                title="Character Prompt"
                                defaultOpen={false}
                                icon={<Sparkles size={16} />}
                            >
                                <p className="prompt-text-compact">{character.prompt}</p>
                                <button
                                    className="btn-secondary small mt-3"
                                    onClick={() => handleCopy(character.prompt)}
                                >
                                    {copiedId === 'prompt' ? <Check size={14} /> : <Copy size={14} />}
                                    <span>Copy</span>
                                </button>
                            </CollapsibleSection>
                        )}
                    </div>

                    {/* Right: Tabs */}
                    <div className="detail-column-right">
                        <div className="tab-nav">
                            <button
                                className={`tab-btn ${activeTab === 'generator' ? 'active' : ''}`}
                                onClick={() => setActiveTab('generator')}
                            >
                                <Sparkles size={16} />
                                <span>Generator</span>
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
                                onClick={() => setActiveTab('gallery')}
                            >
                                <ImageIcon size={16} />
                                <span>Gallery</span>
                            </button>
                        </div>

                        <div className="tab-content detail-scroll">
                            {activeTab === 'generator' && (
                                <div className="generator-tab">
                                    <p className="tab-intro">
                                        Erstelle Szenen und Prompts mit diesem Charakter.
                                    </p>
                                    <textarea
                                        className="scene-input"
                                        placeholder="z.B. 'Ein Portrait im Film Noir Stil' oder 'Character Sheet mit verschiedenen Posen'"
                                        value={instruction}
                                        onChange={(e) => setInstruction(e.target.value)}
                                        disabled={isGenerating}
                                    />
                                    <button
                                        className="btn-primary w-full"
                                        onClick={handleGenerateScene}
                                        disabled={!instruction.trim() || isGenerating}
                                    >
                                        {isGenerating ? (
                                            <Loader2 size={18} className="spin" />
                                        ) : (
                                            <Send size={18} />
                                        )}
                                        <span>Generate & Save</span>
                                    </button>
                                </div>
                            )}

                            {activeTab === 'gallery' && (
                                <div className="gallery-tab">
                                    {isLoadingImages ? (
                                        <div className="loading-mini">
                                            <Loader2 size={24} className="spin" />
                                        </div>
                                    ) : linkedImages.length > 0 ? (
                                        <div className="mini-gallery-grid">
                                            {linkedImages.map(img => (
                                                <div key={img.id} className="mini-gallery-item">
                                                    <img src={img.url} alt="" />
                                                    {img.isPinned && (
                                                        <div className="pin-badge">
                                                            <Pin size={12} />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="empty-gallery">
                                            <ImageIcon size={32} />
                                            <p>Keine Bilder verknüpft</p>
                                            <button className="btn-secondary small">
                                                <Plus size={14} />
                                                <span>Bild hinzufügen</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
