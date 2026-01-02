import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, User, Copy, Check, Trash2, ChevronDown, ChevronUp,
    Sparkles, Image as ImageIcon, Send, Loader2, Plus, Pin, Camera
} from 'lucide-react';
import { generateSmartPrompt } from '../../services/openrouter';
import { promptsApi, charactersApi, galleryApi } from '../../services/api';
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
    const [recentPrompts, setRecentPrompts] = useState([]);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);

    useEffect(() => {
        if (character?.id && isOpen) {
            loadLinkedImages();
            loadRecentPrompts();
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

    const loadRecentPrompts = async () => {
        if (!user || !character?.name) return;
        try {
            const allPrompts = await promptsApi.get();
            const charPrompts = allPrompts
                .filter(p => p.refinedTags?.includes(character.name) || p.title?.includes(character.name))
                .slice(0, 5);
            setRecentPrompts(charPrompts);
        } catch (err) {
            console.error('Failed to load prompts:', err);
        }
    };

    const loadGalleryImages = async () => {
        if (!user) return;
        setIsLoadingGallery(true);
        try {
            const data = await galleryApi.getPrivate();
            setGalleryImages(data);
        } catch (err) {
            console.error('Failed to load gallery:', err);
        } finally {
            setIsLoadingGallery(false);
        }
    };

    const handleSelectImage = async (imageId) => {
        if (!user || !character?.id) return;
        try {
            // Link image to character
            await charactersApi.linkImage(character.id, imageId);
            // Pin the image
            await charactersApi.pinImage(character.id, imageId);
            setShowImagePicker(false);
            // Trigger reload
            onUpdate?.({ ...character, pinnedImageId: imageId });
            loadLinkedImages();
        } catch (err) {
            alert('Fehler beim Setzen des Bildes: ' + err.message);
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

            if (user) {
                await promptsApi.save(
                    result.prompt,
                    [...(result.refined_tags || []), 'Character Prompt', character.name],
                    `${character.name}: ${result.title}`
                );
                loadRecentPrompts();
            }

            setInstruction('');
        } catch (err) {
            alert('Fehler: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const openImagePicker = () => {
        loadGalleryImages();
        setShowImagePicker(true);
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

                {/* Header - Just name, no tags */}
                <div className="detail-header flex-col">
                    <h2 className="title-gradient">{character.name}</h2>
                    <div className="creator-info-mini flex-row align-center gap-1 mt-1">
                        <User size={12} className="text-dim" />
                        <span className="text-dim text-xs">Created by: {character.userName || (character.userId === user?.id ? 'You' : 'Unknown')}</span>
                    </div>
                </div>

                {/* 3-Column Layout */}
                <div className="detail-columns">
                    {/* Left: Portrait + Tags */}
                    <div className="detail-column-left">
                        <div className="large-portrait clickable" onClick={openImagePicker}>
                            {character.pinnedImage?.url ? (
                                <img src={character.pinnedImage.url} alt={character.name} />
                            ) : (
                                <div className="portrait-placeholder-large">
                                    <User size={80} />
                                </div>
                            )}
                            <div className="portrait-edit-overlay">
                                <Camera size={24} />
                                <span>Foto ändern</span>
                            </div>
                        </div>

                        {/* Tags moved here below portrait */}
                        <div className="portrait-tags">
                            {character.attributes?.age && <span className="tag">{character.attributes.age}</span>}
                            {character.attributes?.gender && <span className="tag">{character.attributes.gender}</span>}
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

                                    {/* Recent Prompts */}
                                    {recentPrompts.length > 0 && (
                                        <div className="recent-prompts">
                                            <h4>Letzte Prompts</h4>
                                            <div className="prompt-tiles">
                                                {recentPrompts.map(p => (
                                                    <div
                                                        key={p.id}
                                                        className="prompt-tile"
                                                        onClick={() => handleCopy(p.content)}
                                                        title={p.content}
                                                    >
                                                        <span className="tile-title">{p.title || 'Prompt'}</span>
                                                        <span className="tile-preview">{p.content?.slice(0, 60)}...</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
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
                                            <button className="btn-secondary small" onClick={openImagePicker}>
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

            {/* Image Picker Modal */}
            {showImagePicker && (
                <div className="image-picker-modal glass" onClick={e => e.stopPropagation()}>
                    <div className="picker-header">
                        <h3>Bild auswählen</h3>
                        <button className="modal-close-btn" onClick={() => setShowImagePicker(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="picker-content detail-scroll">
                        {isLoadingGallery ? (
                            <div className="loading-mini">
                                <Loader2 size={32} className="spin" />
                            </div>
                        ) : galleryImages.length > 0 ? (
                            <div className="picker-grid">
                                {galleryImages.map(img => (
                                    <div
                                        key={img.id}
                                        className="picker-item"
                                        onClick={() => handleSelectImage(img.id)}
                                    >
                                        <img src={img.url} alt="" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-dim text-center">Keine Bilder in deiner Galerie</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );

    return createPortal(modal, document.body);
}

