import { X, Copy, Check, Trash2, Calendar, Hash, Clock, Image as ImageIcon, Loader2, Wand2, Link as LinkIcon, Upload, User } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { normalizePromptText } from '../../utils/stringUtils';
import { useData } from '../../context/DataContext';
import { galleryApi } from '../../services/api';
import ConfirmationModal from '../UI/ConfirmationModal';
import ImageDetailView from '../Gallery/ImageDetailView';
import ImagePickerModal from './ImagePickerModal';
import UploadModal from '../Gallery/UploadModal';

export default function PromptDetailView({ prompt, isOpen, onClose, onDelete }) {
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [isLinking, setIsLinking] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');

    const { privateImages, user, updateImageInCache, removeImageFromCache, addImage, updatePromptInCache } = useData();

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen]);

    const linkedImages = useMemo(() => {
        if (!prompt) return [];
        const normalizedContent = normalizePromptText(prompt.content || prompt.prompt);
        return privateImages
            .filter(img => normalizePromptText(img.prompt) === normalizedContent)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [prompt, privateImages]);

    if (!isOpen || !prompt) return null;

    const fullText = prompt.content || prompt.prompt;
    const tags = prompt.refinedTags || prompt.tags || [];
    const displayTags = showAllTags ? tags : tags.slice(0, 10);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return {
            day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        };
    };

    const dateInfo = formatDate(prompt.createdAt);
    const promptTitle = prompt.title || (linkedImages.length > 0 ? linkedImages[0].title : 'Saved Prompt Record');
    const creatorName = prompt.userName || (prompt.userId === user?.id ? 'You' : 'Unknown Creator');

    const handleLinkImages = async (selectedImages) => {
        setIsLinking(true);
        try {
            // To "link" them, we update their prompt text to match this record exactly
            const updates = selectedImages.map(img =>
                galleryApi.update(img.id, { prompt: fullText })
            );
            const updatedImages = await Promise.all(updates);
            updatedImages.forEach(img => updateImageInCache(img));
            alert(`Successfully linked ${selectedImages.length} images.`);
        } catch (err) {
            console.error('Failed to link images:', err);
            alert('Failed to link some images');
        } finally {
            setIsLinking(false);
        }
    };

    const handleUploadComplete = (newImageArray) => {
        // newImageArray is already an array from my previous fix
        const images = Array.isArray(newImageArray) ? newImageArray : [newImageArray];
        addImage(images);
        setIsUploadOpen(false);
    };

    const handleSaveTitle = async () => {
        if (!editedTitle.trim()) return;
        try {
            const updated = await promptsApi.update(prompt.id, { title: editedTitle });
            updatePromptInCache(updated);
            setIsEditingTitle(false);

            // Sync with linked images?
            if (linkedImages.length > 0) {
                const shouldSync = window.confirm(`Update the title for all ${linkedImages.length} linked images too?`);
                if (shouldSync) {
                    const syncPromises = linkedImages.map(img =>
                        galleryApi.update(img.id, { title: editedTitle })
                    );
                    const updatedImages = await Promise.all(syncPromises);
                    updatedImages.forEach(img => updateImageInCache(img));
                }
            }
        } catch (err) {
            console.error('Failed to update title:', err);
            alert('Failed to update title');
        }
    };

    return createPortal(
        <>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content glass animate-fade-in prompt-detail-modal" onClick={e => e.stopPropagation()}>
                    <header className="modal-header">
                        <div className="prompt-meta-wrapper">
                            {isEditingTitle ? (
                                <div className="flex-row gap-2 w-full mb-2">
                                    <input
                                        type="text"
                                        className="title-edit-input glass w-full"
                                        value={editedTitle}
                                        onChange={(e) => setEditedTitle(e.target.value)}
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                                    />
                                    <button className="btn-primary small" onClick={handleSaveTitle}><Check size={16} /></button>
                                    <button className="btn-secondary small" onClick={() => setIsEditingTitle(false)}><X size={16} /></button>
                                </div>
                            ) : (
                                <h2 className="title-gradient clickable" onClick={() => {
                                    setEditedTitle(promptTitle);
                                    setIsEditingTitle(true);
                                }} title="Click to rename">{promptTitle}</h2>
                            )}
                            <div className="prompt-meta">
                                <div className="meta-item">
                                    <Calendar size={14} />
                                    <span>{dateInfo.day}</span>
                                </div>
                                <div className="meta-item">
                                    <Clock size={14} />
                                    <span>{dateInfo.time}</span>
                                </div>
                                <div className="meta-item creator-tag">
                                    <User size={14} />
                                    <span>Created by: {creatorName}</span>
                                </div>
                            </div>
                        </div>
                        <button className="btn-icon" onClick={onClose}><X size={24} /></button>
                    </header>

                    <div className="modal-body">
                        <section className="detail-segment">
                            <label>Prompt Content</label>
                            <div className={`prompt-display-large glass ${isExpanded ? 'expanded' : 'truncated'}`} onClick={() => setIsExpanded(!isExpanded)}>
                                <p>{fullText}</p>
                                <button className="btn-copy-float" onClick={handleCopy}>
                                    {copied ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                                {!isExpanded && fullText.length > 200 && <div className="expand-overlay">Click to expand</div>}
                            </div>
                        </section>

                        <section className="detail-segment">
                            <label>Refined Tags</label>
                            <div className="tag-cloud">
                                {displayTags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                                {tags.length > 10 && !showAllTags && (
                                    <button className="tag-more" onClick={() => setShowAllTags(true)}>
                                        +{tags.length - 10} more
                                    </button>
                                )}
                            </div>
                        </section>

                        <section className="detail-segment">
                            <div className="flex-row justify-between align-center mb-2">
                                <label className="m-0">Linked Gallery Creations ({linkedImages.length})</label>
                                <div className="flex-row gap-2">
                                    <button className="btn-secondary small" onClick={() => setIsPickerOpen(true)}>
                                        <LinkIcon size={14} />
                                        <span>Link Images</span>
                                    </button>
                                    <button className="btn-secondary small" onClick={() => setIsUploadOpen(true)}>
                                        <Upload size={14} />
                                        <span>Upload Image</span>
                                    </button>
                                </div>
                            </div>
                            {linkedImages.length > 0 ? (
                                <div className="linked-images-grid">
                                    {linkedImages.map(img => (
                                        <div key={img.id} className="linked-image-card glass clickable" onClick={() => setSelectedImage(img)}>
                                            <img src={img.url} alt={img.description} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="empty-linked glass">
                                    <ImageIcon size={24} className="text-dim" />
                                    <span>No images found for this prompt</span>
                                </div>
                            )}
                        </section>
                    </div>

                    <footer className="modal-footer footer-split">
                        <div className="flex-row gap-3">
                            <button className="btn-secondary text-danger" onClick={() => setIsDeleteConfirmOpen(true)}>
                                <Trash2 size={18} />
                                <span>Delete</span>
                            </button>
                        </div>
                        <div className="flex-row gap-3">
                            <button className="btn-secondary" onClick={onClose}>Close</button>
                            <button className="btn-primary" onClick={() => {
                                const data = {
                                    originalPrompt: fullText,
                                    tags: tags
                                };
                                localStorage.setItem('pending_template', JSON.stringify(data));
                                navigate('/generator', {
                                    state: { initialSelections: data }
                                });
                            }}>
                                <Wand2 size={20} />
                                <span>Create Similar</span>
                            </button>
                        </div>
                    </footer>

                    <ConfirmationModal
                        isOpen={isDeleteConfirmOpen}
                        onClose={() => setIsDeleteConfirmOpen(false)}
                        onConfirm={() => {
                            onDelete(prompt.id);
                            onClose();
                        }}
                        title="Delete Prompt"
                        message="Are you sure you want to delete this prompt? This action cannot be undone."
                        confirmText="Delete forever"
                    />
                </div>
                {isPickerOpen && (
                    <ImagePickerModal
                        isOpen={isPickerOpen}
                        onClose={() => setIsPickerOpen(false)}
                        images={privateImages}
                        onSelect={handleLinkImages}
                        alreadyLinkedIds={linkedImages.map(img => img.id)}
                    />
                )}

                {isUploadOpen && (
                    <UploadModal
                        isOpen={isUploadOpen}
                        onClose={() => setIsUploadOpen(false)}
                        onUploadComplete={handleUploadComplete}
                        initialPrompt={fullText}
                        initialTags={tags}
                    />
                )}

                {selectedImage && (
                    <ImageDetailView
                        isOpen={!!selectedImage}
                        image={selectedImage}
                        onClose={() => setSelectedImage(null)}
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
                        onDeleteTag={() => { }} // Not implemented in this view context yet
                    />
                )}
            </div>
        </>,
        document.getElementById('modal-root')
    );
}
