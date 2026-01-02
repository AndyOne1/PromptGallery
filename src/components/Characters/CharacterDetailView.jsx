import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    X, User, Copy, Check, Trash2, ChevronDown, ChevronUp,
    Sparkles, Image as ImageIcon, Send, Loader2, Plus, Pin, Camera, Edit3
} from 'lucide-react';
import { generateSmartPrompt } from '../../services/openrouter';
import { promptsApi, charactersApi, galleryApi } from '../../services/api';
import { useData } from '../../context/DataContext';
import ImageDetailView from '../Gallery/ImageDetailView';
import './CharacterDetailView.css';

const ATTRIBUTE_LABELS = {
    name: 'Name', age: 'Alter', gender: 'Geschlecht',
    hairColor: 'Haarfarbe', hairStyle: 'Haarstil', eyeColor: 'Augenfarbe',
    skinTone: 'Hautton', bodyType: 'Körperbau', height: 'Größe',
    facialFeatures: 'Gesichtszüge', style: 'Stil', personality: 'Persönlichkeit',
    accessories: 'Accessoires', distinguishingMarks: 'Besondere Merkmale'
};

// Base realism instruction that will be prepended to all template prompts
const REALISM_INSTRUCTION = 'Ultra-realistic photograph of a real human. NOT CGI, NOT 3D render, NOT animation, NOT illustration. Professional photography, high resolution, photorealistic. The subject is wearing form-fitting athletic wear (short spandex shorts and sports bra or similar skintight outfit) that clearly shows the body shape and proportions.';

const REFERENCE_TEMPLATES = [
    {
        id: 'portrait-front',
        label: 'Portrait (Front)',
        icon: '👤',
        prompt: 'Close-up portrait photograph, front view, facing camera directly. Studio lighting, neutral background.'
    },
    {
        id: 'portrait-side',
        label: 'Portrait (Seite)',
        icon: '👤',
        prompt: 'Close-up portrait photograph, side profile view. Studio lighting, neutral background.'
    },
    {
        id: 'fullbody-front',
        label: 'Ganzkörper (Front)',
        icon: '🧍',
        prompt: 'Full body photograph, front view, standing pose. Studio lighting, neutral background, full length shot.'
    },
    {
        id: 'fullbody-side',
        label: 'Ganzkörper (Seite)',
        icon: '🧍',
        prompt: 'Full body photograph, side view, standing pose. Studio lighting, neutral background, full length shot.'
    },
    {
        id: 'character-sheet',
        label: 'Character Sheet',
        icon: '📋',
        prompt: 'Professional character reference sheet with multiple views: front view, side profile, and back view. Clean white background, consistent lighting across all views, reference sheet for production use.'
    }
];

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
    const [selectedDetailImage, setSelectedDetailImage] = useState(null);
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [useReferenceImage, setUseReferenceImage] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [isSavingName, setIsSavingName] = useState(false);

    const { updateImageInCache, removeImageFromCache } = useData();

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
            if (character?.id) {
                loadLinkedImages();
                loadRecentPrompts();
            }
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
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

            // Fetch updated character and trigger reload in parent
            const updatedCharacter = await charactersApi.getById(character.id);
            onUpdate?.(updatedCharacter);

            setShowImagePicker(false);
            loadLinkedImages();
        } catch (err) {
            alert('Fehler beim Setzen des Bildes: ' + err.message);
        }
    };

    const toggleTemplate = (template) => {
        setSelectedTemplates(prev => {
            const exists = prev.find(t => t.id === template.id);
            if (exists) {
                return prev.filter(t => t.id !== template.id);
            } else {
                return [...prev, template];
            }
        });
    };

    const applySelectedTemplates = () => {
        if (selectedTemplates.length === 0) return;
        const combinedPrompts = selectedTemplates.map(t => t.prompt).join(' AND ');
        setInstruction(combinedPrompts);
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
            // Prepend realism instruction if templates are selected (detected by common template keywords)
            const hasTemplateContent = selectedTemplates.length > 0 ||
                instruction.includes('portrait') ||
                instruction.includes('full body') ||
                instruction.includes('reference sheet');

            let finalInstruction;

            if (useReferenceImage) {
                // Reference image mode: simplified description with note to use reference
                finalInstruction = `${hasTemplateContent ? REALISM_INSTRUCTION + '\n\n' : ''}${instruction}\n\n[REFERENCE IMAGE MODE: The user will provide a reference image. Use the reference image as the primary subject. Only include basic identifying features (${character.attributes?.gender || 'person'}, ${character.attributes?.age || 'adult'}, ${character.attributes?.hairColor || ''} hair). Match the subject exactly to the reference image.]`;
            } else {
                // Normal mode: full character description
                finalInstruction = hasTemplateContent
                    ? `${REALISM_INSTRUCTION}\n\n${instruction}`
                    : instruction;
            }

            const result = await generateSmartPrompt(key, {
                instruction: `Character: ${character.prompt}\n\nScene Request: ${finalInstruction}`,
                vibes: [],
                safetyLevel: 'sfw',
                useReference: useReferenceImage,
                referenceGender: character.attributes?.gender || ''
            });

            if (user) {
                await promptsApi.save(
                    result.prompt,
                    [...(result.refined_tags || []), 'Character Prompt', character.name, ...(useReferenceImage ? ['Reference Image'] : [])],
                    `${character.name}: ${result.title}`
                );
                loadRecentPrompts();
            }

            setInstruction('');
            setSelectedTemplates([]);
        } catch (err) {
            alert('Fehler: ' + err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveName = async () => {
        if (!editedName.trim() || editedName === character.name) {
            setIsEditingName(false);
            return;
        }
        setIsSavingName(true);
        try {
            const updated = await charactersApi.update(character.id, { name: editedName.trim() });
            onUpdate?.(updated);
            setIsEditingName(false);
        } catch (err) {
            alert('Fehler beim Speichern: ' + err.message);
        } finally {
            setIsSavingName(false);
        }
    };

    const openImagePicker = () => {
        loadGalleryImages();
        setShowImagePicker(true);
    };

    if (!isOpen || !character) return null;

    return createPortal(
        <>
            <div className="modal-overlay character-modal-overlay" onClick={onClose}>
                <div
                    className="character-detail-landscape glass"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={18} />
                    </button>

                    {/* Header - Editable name */}
                    <div className="detail-header flex-col">
                        {isEditingName ? (
                            <div className="flex-row gap-2 align-center mb-1">
                                <input
                                    type="text"
                                    className="title-edit-input glass"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                    disabled={isSavingName}
                                />
                                <button className="btn-primary small" onClick={handleSaveName} disabled={isSavingName}>
                                    {isSavingName ? <Loader2 size={16} className="spin" /> : <Check size={16} />}
                                </button>
                                <button className="btn-secondary small" onClick={() => setIsEditingName(false)} disabled={isSavingName}>
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <h2
                                className="title-gradient clickable"
                                onClick={() => {
                                    if (character.userId === user?.id) {
                                        setEditedName(character.name);
                                        setIsEditingName(true);
                                    }
                                }}
                                title={character.userId === user?.id ? "Click to rename" : ""}
                            >
                                {character.name}
                                {character.userId === user?.id && <Edit3 size={16} className="edit-icon ml-2" />}
                            </h2>
                        )}
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
                                className="btn-primary mt-6 w-full"
                                onClick={() => {
                                    navigate('/generator', {
                                        state: {
                                            mode: 'smart',
                                            preSelectedCharacter: character
                                        }
                                    });
                                    onClose();
                                }}
                            >
                                <Plus size={16} />
                                <span>Add to Prompt</span>
                            </button>

                            <button
                                className="btn-secondary btn-danger mt-2 w-full"
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

                                        {/* Reference Image Templates */}
                                        <div className="template-section">
                                            <label className="template-label">Schnell-Templates für Referenzbilder (mehrere auswählbar)</label>
                                            <div className="template-grid">
                                                {REFERENCE_TEMPLATES.map(template => {
                                                    const isSelected = selectedTemplates.some(t => t.id === template.id);
                                                    return (
                                                        <button
                                                            key={template.id}
                                                            className={`template-btn glass ${isSelected ? 'selected' : ''}`}
                                                            onClick={() => toggleTemplate(template)}
                                                            disabled={isGenerating}
                                                        >
                                                            <span className="template-icon">{template.icon}</span>
                                                            <span className="template-name">{template.label}</span>
                                                            {isSelected && <Check size={14} className="template-check" />}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            {selectedTemplates.length > 0 && (
                                                <button
                                                    className="btn-secondary small mt-2"
                                                    onClick={applySelectedTemplates}
                                                    disabled={isGenerating}
                                                >
                                                    <Plus size={14} />
                                                    <span>Auswahl anwenden ({selectedTemplates.length})</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* Use Reference Image Toggle */}
                                        <div className="reference-toggle-section">
                                            <label
                                                className={`reference-toggle glass ${useReferenceImage ? 'active' : ''}`}
                                                onClick={() => setUseReferenceImage(!useReferenceImage)}
                                            >
                                                <div className="toggle-switch">
                                                    <div className={`toggle-knob ${useReferenceImage ? 'on' : ''}`} />
                                                </div>
                                                <div className="toggle-content">
                                                    <span className="toggle-title">Use Reference Image</span>
                                                    <span className="toggle-desc">
                                                        {useReferenceImage
                                                            ? 'Prompt für Bild mit Referenz (vereinfachte Beschreibung)'
                                                            : 'Aktivieren wenn du ein Referenzbild hochladen möchtest'}
                                                    </span>
                                                </div>
                                                <ImageIcon size={20} className={useReferenceImage ? 'text-accent' : 'text-dim'} />
                                            </label>
                                        </div>

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
                                                    <div key={img.id} className="mini-gallery-item" onClick={() => setSelectedDetailImage(img)}>
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
            </div>

            {showImagePicker && (
                <div className="modal-overlay" onClick={() => setShowImagePicker(false)}>
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
                </div>
            )}

            {selectedDetailImage && (
                <ImageDetailView
                    isOpen={!!selectedDetailImage}
                    image={selectedDetailImage}
                    onClose={() => setSelectedDetailImage(null)}
                    user={user}
                    onUpdateImage={(updated, deletedId) => {
                        if (deletedId) {
                            removeImageFromCache(deletedId);
                            loadLinkedImages();
                            setSelectedDetailImage(null);
                        } else if (updated) {
                            updateImageInCache(updated);
                            loadLinkedImages();
                            setSelectedDetailImage(updated);
                        }
                    }}
                    onDeleteTag={() => { }}
                />
            )}
        </>,
        document.getElementById('modal-root')
    );
}

