import { useState, useEffect } from 'react';
import { Upload, Search, Settings as SettingsIcon, Copy, Check, Shield, Globe, Loader2, ListChecks, Trash2, X } from 'lucide-react';
import UploadModal from '../components/Gallery/UploadModal';
import ImageDetailView from '../components/Gallery/ImageDetailView';
import Settings from '../components/Settings';
import '../components/Modal.css';
import '../components/Gallery/Gallery.css';
import '../components/Gallery/DetailView.css';
import { galleryApi } from '../services/api';

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
    const [view, setView] = useState('private'); // 'private' or 'public'
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState(null);
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        fetchImages(view);
    }, [view, user, fetchImages]);

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
    };

    const toggleImageSelection = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleBatchDelete = async () => {
        if (!selectedIds.length) return;

        const selectedImages = images.filter(img => selectedIds.includes(img.id));
        const legacyCount = selectedImages.filter(img => !img.publicId).length;

        let message = `Are you sure you want to delete ${selectedIds.length} images?`;
        if (legacyCount > 0) {
            message += `\n\nNote: ${legacyCount} of these were uploaded before Cloudinary synchronization was enabled and must be deleted manually from your Cloudinary dashboard.`;
        } else {
            message += `\n\nAll selected images will also be removed from Cloudinary automatically.`;
        }

        if (!window.confirm(message)) return;

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
                        {filteredImages.map(img => {
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
            </div>

            {isSelectionMode && selectedIds.length > 0 && (
                <div className="batch-actions-bar glass animate-slide-up">
                    <span className="batch-info">{selectedIds.length} items selected</span>
                    <div className="batch-btns">
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
            />
            <ImageDetailView
                image={selectedImage}
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                onDeleteTag={deleteTag}
                user={user}
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
        </>
    );
}
