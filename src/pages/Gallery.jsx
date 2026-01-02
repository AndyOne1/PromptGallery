import { useState, useEffect, useMemo } from 'react';
import { Upload, Search, Settings as SettingsIcon, Copy, Check, Shield, Globe, Loader2, ListChecks, Trash2, X, User, Link, Layers } from 'lucide-react';
import UploadModal from '../components/Gallery/UploadModal';
import ImageDetailView from '../components/Gallery/ImageDetailView';
import Settings from '../components/Settings';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import { normalizePromptText } from '../utils/stringUtils';
import '../components/Modal.css';
import '../components/Gallery/Gallery.css';
import '../components/Gallery/DetailView.css';
import { galleryApi, charactersApi } from '../services/api';

import { useData } from '../context/DataContext';

export default function Gallery({ user }) {
    const {
        privateImages,
        publicImages,
        isLoadingImages,
        fetchImages,
        addImage,
        updateImageInCache,
        removeImageFromCache
    } = useData();

    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [view, setView] = useState('private');
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    // Character linking state
    const [showCharacterPicker, setShowCharacterPicker] = useState(false);
    const [characters, setCharacters] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [isLinking, setIsLinking] = useState(false);
    const [displayLimit, setDisplayLimit] = useState(30);
    const [isGrouped, setIsGrouped] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        fetchImages(view);
    }, [view, user, fetchImages]);

    useEffect(() => {
        if (user && isSelectionMode) {
            loadCharacters();
        }
    }, [user, isSelectionMode]);

    const loadCharacters = async () => {
        if (!user) return;
        try {
            const data = await charactersApi.getAll();
            setCharacters(data);
        } catch (err) {
            console.error('Failed to load characters:', err);
        }
    };

    const images = view === 'public' ? publicImages : privateImages;

    const handleUploadComplete = (newImage) => {
        addImage(newImage);
    };

    const deleteTag = async (imageId, tagToDelete) => {
        const img = images.find(i => i.id === imageId);
        if (!img) return;

        const updatedTags = img.tags.filter(t => t !== tagToDelete);
        const updatedImg = { ...img, tags: updatedTags };
        updateImageInCache(updatedImg);

        if (selectedImage?.id === imageId) {
            setSelectedImage(updatedImg);
        }
    };

    const copyPrompt = (e, prompt, id) => {
        e.stopPropagation();
        navigator.clipboard.writeText(prompt);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleSelectMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedIds([]);
        setShowCharacterPicker(false);
        setSelectedCharacter(null);
    };

    const toggleImageSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBatchDelete = async () => {
        if (!selectedIds.length) return;
        setIsDeleteConfirmOpen(true);
    };

    const confirmBatchDelete = async () => {
        try {
            await galleryApi.delete(selectedIds);
            selectedIds.forEach(id => removeImageFromCache(id));
            setIsSelectionMode(false);
            setSelectedIds([]);
        } catch (err) {
            console.error('Batch deletion failed:', err);
            alert('Failed to delete some images.');
        }
    };

    const handleLinkToCharacter = async () => {
        if (!selectedCharacter || !selectedIds.length) return;
        setIsLinking(true);
        try {
            for (const imageId of selectedIds) {
                await charactersApi.linkImage(selectedCharacter.id, imageId);
            }
            alert(`${selectedIds.length} Bilder mit ${selectedCharacter.name} verknüpft!`);
            setIsSelectionMode(false);
            setSelectedIds([]);
            setShowCharacterPicker(false);
            setSelectedCharacter(null);
        } catch (err) {
            alert('Fehler beim Verknüpfen: ' + err.message);
        } finally {
            setIsLinking(false);
        }
    };

    const handleCardClick = (img) => {
        if (isSelectionMode) {
            toggleImageSelection(img.id);
        } else {
            setSelectedImage(img);
        }
    };

    const filteredImages = images.filter(img =>
        img.prompt.toLowerCase().includes(search.toLowerCase()) ||
        img.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    // Group images by normalized prompt
    const groupedData = useMemo(() => {
        if (!isGrouped) {
            return filteredImages.map(img => ({ ...img, seriesCount: 1, seriesImages: [img] }));
        }

        const groups = new Map();
        // Sort by createdAt descending first
        const sorted = [...filteredImages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        for (const img of sorted) {
            const key = normalizePromptText(img.prompt);
            if (!groups.has(key)) {
                groups.set(key, []);
            }
            groups.get(key).push(img);
        }

        // Return only the newest (first) image per group, with series metadata
        const result = [];
        for (const [, seriesImages] of groups) {
            const newest = seriesImages[0];
            result.push({
                ...newest,
                seriesCount: seriesImages.length,
                seriesImages: seriesImages
            });
        }
        return result;
    }, [filteredImages, isGrouped]);

    const displayImages = groupedData.slice(0, displayLimit);

    return (
        <>
            <div className="page-container animate-fade-in">
                <header className="page-header">
                    <div>
                        <h1 className="title-gradient">Prompt Gallery</h1>
                        <p className="subtitle">Curate and analyze your high-quality creations</p>
                    </div>
                    <div className="header-actions">
                        <button className={`btn-icon large ${isSelectionMode ? 'active' : ''}`} onClick={toggleSelectMode} title="Batch Selection">
                            <ListChecks size={22} />
                        </button>
                        <button className="btn-icon large" onClick={() => setIsSettingsOpen(true)}>
                            <SettingsIcon size={22} />
                        </button>
                        <button className="btn-primary" onClick={() => setIsUploadOpen(true)}>
                            <Upload size={18} />
                            <span>Upload Image</span>
                        </button>
                    </div>
                </header>

                <div className="gallery-controls">
                    <div className="view-toggle glass">
                        <button
                            className={`toggle-btn ${view === 'private' ? 'active' : ''}`}
                            onClick={() => setView('private')}
                            disabled={!user}
                        >
                            <Shield size={16} />
                            <span>My Gallery</span>
                        </button>
                        <button
                            className={`toggle-btn ${view === 'public' ? 'active' : ''}`}
                            onClick={() => setView('public')}
                        >
                            <Globe size={16} />
                            <span>Public</span>
                        </button>
                    </div>

                    <div className="view-toggle glass group-toggle">
                        <button
                            className={`toggle-btn ${isGrouped ? 'active' : ''}`}
                            onClick={() => setIsGrouped(!isGrouped)}
                            disabled={!user}
                            title="Bilder mit gleichem Prompt gruppieren"
                        >
                            <Layers size={16} />
                            <span>Serien</span>
                        </button>
                    </div>

                    <div className="search-bar glass">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by prompt or tags..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {isLoadingImages ? (
                    <div className="loading-state glass">
                        <Loader2 size={48} className="spin" />
                        <p>Loading your creations...</p>
                    </div>
                ) : filteredImages.length > 0 ? (
                    <div className="gallery-grid">
                        {displayImages.map(img => {
                            const isSelected = selectedIds.includes(img.id);
                            return (
                                <div
                                    key={img.id}
                                    className={`gallery-card glass glass-interactive ${isSelectionMode ? 'selection-active' : ''} ${isSelected ? 'selected' : ''}`}
                                    onClick={() => handleCardClick(img)}
                                >
                                    <div className="card-image-wrap">
                                        <img src={img.url} alt={img.description} />
                                        {isSelectionMode && (
                                            <div className="selection-overlay">
                                                <div className="selection-checkbox">
                                                    <Check size={16} />
                                                </div>
                                            </div>
                                        )}
                                        {img.seriesCount > 1 && (
                                            <div className="series-badge">
                                                <Layers size={12} />
                                                <span>{img.seriesCount}</span>
                                            </div>
                                        )}
                                        <div className="card-overlay">
                                            <button className="btn-copy" onClick={(e) => copyPrompt(e, img.prompt, img.id)}>
                                                {copiedId === img.id ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-content">
                                        <div className="card-tags">
                                            {img.tags.slice(0, 3).map(tag => (
                                                <span key={tag} className="tag">{tag}</span>
                                            ))}
                                            {img.tags.length > 3 && <span className="tag-more">+{img.tags.length - 3}</span>}
                                        </div>
                                        <h4 className="card-title">{img.title || img.description}</h4>
                                        {img.title && <p className="card-desc-small">{img.description}</p>}
                                        <p className="card-prompt">{img.prompt}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="empty-state glass">
                        <div className="empty-icon-wrap">
                            <Upload size={48} />
                        </div>
                        <h3>Your gallery is empty</h3>
                        <p>Upload an image and let Grok analyze your prompts.</p>
                        <button className="btn-secondary" onClick={() => setIsUploadOpen(true)}>
                            Upload First Image
                        </button>
                    </div>
                )}

                {filteredImages.length > displayLimit && (
                    <div className="load-more-container mt-8 flex justify-center">
                        <button className="btn-secondary" onClick={() => setDisplayLimit(prev => prev + 30)}>
                            Show More Images
                        </button>
                    </div>
                )}
            </div>

            {isSelectionMode && selectedIds.length > 0 && (
                <div className="batch-actions-bar glass animate-slide-up">
                    <span className="batch-info">{selectedIds.length} items selected</span>
                    <div className="batch-btns">
                        {/* Character Link Dropdown */}
                        <div className="character-link-section">
                            <button
                                className={`btn-secondary ${showCharacterPicker ? 'active' : ''}`}
                                onClick={() => setShowCharacterPicker(!showCharacterPicker)}
                            >
                                <User size={16} />
                                <span>Verknüpfen mit</span>
                            </button>
                            {showCharacterPicker && (
                                <div className="character-dropdown glass">
                                    {characters.length > 0 ? (
                                        <>
                                            {characters.map(char => (
                                                <button
                                                    key={char.id}
                                                    className={`dropdown-item ${selectedCharacter?.id === char.id ? 'active' : ''}`}
                                                    onClick={() => setSelectedCharacter(char)}
                                                >
                                                    <User size={14} />
                                                    <span>{char.name}</span>
                                                </button>
                                            ))}
                                            {selectedCharacter && (
                                                <button
                                                    className="btn-primary small w-full mt-2"
                                                    onClick={handleLinkToCharacter}
                                                    disabled={isLinking}
                                                >
                                                    {isLinking ? <Loader2 size={14} className="spin" /> : <Link size={14} />}
                                                    <span>Speichern</span>
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <p className="text-dim text-sm p-2">Keine Charaktere</p>
                                    )}
                                </div>
                            )}
                        </div>
                        <button className="btn-secondary" onClick={() => setSelectedIds([])}>
                            Deselect All
                        </button>
                        <button className="btn-primary btn-danger" onClick={handleBatchDelete}>
                            <Trash2 size={18} />
                            <span>Delete Selected</span>
                        </button>
                        <button className="btn-icon" onClick={toggleSelectMode}>
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onUploadComplete={handleUploadComplete}
                user={user}
            />
            <ImageDetailView
                image={selectedImage}
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                onDeleteTag={deleteTag}
                user={user}
                seriesImages={selectedImage?.seriesImages || (selectedImage ? [selectedImage] : [])}
                onUpdateImage={(updated, deletedId) => {
                    if (deletedId) {
                        removeImageFromCache(deletedId);
                        setSelectedImage(null);
                    } else if (updated) {
                        updateImageInCache(updated);
                        setSelectedImage(updated);
                    }
                }}
            />
            <Settings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => setIsDeleteConfirmOpen(false)}
                onConfirm={confirmBatchDelete}
                title="Delete Multiple Images"
                message={(() => {
                    const selectedImages = images.filter(img => selectedIds.includes(img.id));
                    const legacyCount = selectedImages.filter(img => !img.publicId).length;
                    let msg = `Are you sure you want to delete ${selectedIds.length} images?`;
                    if (legacyCount > 0) {
                        msg += `\n\nNote: ${legacyCount} of these were uploaded before Cloudinary synchronization was enabled and must be deleted manually from your Cloudinary dashboard.`;
                    } else {
                        msg += `\n\nAll selected images will also be removed from Cloudinary automatically.`;
                    }
                    return msg;
                })()}
                confirmText={`Delete ${selectedIds.length} items`}
            />
        </>
    );
}
