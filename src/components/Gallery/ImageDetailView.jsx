import { X, Copy, Check, Trash2, Wand2, Globe, Shield, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { galleryApi, promptsApi } from '../../services/api';
import { normalizePromptText } from '../../utils/stringUtils';
import { MessageSquare, Calendar, Clock, BookmarkPlus } from 'lucide-react';
import { useData } from '../../context/DataContext';

export default function ImageDetailView({ image, isOpen, onClose, onDeleteTag, user, onUpdateImage }) {
    const [copied, setCopied] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);
    const [linkedPrompts, setLinkedPrompts] = useState([]);
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
    const [isSavingPrompt, setIsSavingPrompt] = useState(false);
    const { addPromptToCache } = useData();
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
            if (image) loadLinkedPrompts();
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen, image]);

    const loadLinkedPrompts = async () => {
        setIsLoadingPrompts(true);
        try {
            const allPrompts = await promptsApi.get();
            const normalizedImagePrompt = normalizePromptText(image.prompt);
            const matches = allPrompts.filter(p =>
                normalizePromptText(p.content || p.prompt) === normalizedImagePrompt
            );
            setLinkedPrompts(matches);
        } catch (err) {
            console.error('Failed to load linked prompts:', err);
        } finally {
            setIsLoadingPrompts(false);
        }
    };

    if (!isOpen || !image) return null;

    const isOwner = user && image.userId === user.id;
    const tags = image.tags || [];
    const displayTags = showAllTags ? tags : tags.slice(0, 10);

    const handleCopy = () => {
        navigator.clipboard.writeText(image.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTogglePublic = async () => {
        setIsUpdating(true);
        try {
            const updated = await galleryApi.togglePublic(image.id, !image.isPublic);
            onUpdateImage(updated);
        } catch (err) {
            alert('Failed to update visibility');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDelete = async () => {
        let message = 'Are you sure you want to delete this creation?';
        if (!image.publicId) {
            message += '\n\nNote: This image was uploaded before Cloudinary synchronization was enabled. It will be removed from your gallery, but you must delete it manually from your Cloudinary dashboard.';
        } else {
            message += '\n\nThis will also automatically remove the image from Cloudinary storage.';
        }

        if (!window.confirm(message)) return;
        setIsUpdating(true);
        try {
            await galleryApi.delete(image.id);
            onClose();
            onUpdateImage(null, image.id); // null image, but provide ID to remove from list
        } catch (err) {
            alert('Failed to delete image');
            setIsUpdating(false);
        }
    };

    const handleCreateSimilar = () => {
        // Pass industrial/clean tags to the generator
        navigate('/generator', {
            state: {
                initialSelections: {
                    category: image.tags[0] || '', // Usually first tag is category
                    style: image.tags[1] || '',    // Second is style
                    subject: image.description,
                    tags: image.tags
                }
            }
        });
    };

    const modalContent = (
        <div className="modal-overlay" onClick={onClose}>
            <div className="detail-modal glass animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="detail-grid">
                    <div className="detail-image-section">
                        <img src={image.url} alt={image.description} className="detail-main-image" />
                    </div>

                    <div className="detail-info-section">
                        <header className="detail-header">
                            <div className="flex-col">
                                {image.title ? (
                                    <>
                                        <h2 className="title-gradient">{image.title}</h2>
                                        <p className="image-description-sub">{image.description}</p>
                                    </>
                                ) : (
                                    <h2 className="title-gradient">{image.description}</h2>
                                )}
                                {isOwner && (
                                    <div className="status-row">
                                        <span className={`visibility-badge ${image.isPublic ? 'public' : 'private'}`}>
                                            {image.isPublic ? <Globe size={14} /> : <Shield size={14} />}
                                            {image.isPublic ? 'Public' : 'Private'}
                                        </span>
                                        <div className="meta-timestamp">
                                            <Calendar size={12} />
                                            <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                                            <Clock size={12} className="ml-2" />
                                            <span>{new Date(image.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button className="btn-icon" onClick={onClose}><X size={24} /></button>
                        </header>

                        <div className="detail-body">
                            <section className="detail-segment">
                                <label>Prompt used for this image</label>
                                <div className={`prompt-display glass ${isExpanded ? 'expanded' : 'truncated'}`} onClick={() => setIsExpanded(!isExpanded)}>
                                    <p>{image.prompt}</p>
                                    <button className="btn-copy-float" onClick={handleCopy}>
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                    {!isExpanded && image.prompt.length > 200 && <div className="expand-overlay-detail">Click to expand</div>}
                                </div>
                            </section>

                            <section className="detail-segment">
                                <label>Refined Tags</label>
                                <div className="detail-tags">
                                    {displayTags.map((tag, idx) => (
                                        <span key={idx} className="tag-closable">
                                            {tag}
                                            {isOwner && (
                                                <button className="tag-remove" onClick={() => onDeleteTag(image.id, tag)}>
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                    {tags.length > 10 && !showAllTags && (
                                        <button className="tag-more-btn" onClick={() => setShowAllTags(true)}>
                                            +{tags.length - 10} more
                                        </button>
                                    )}
                                </div>
                            </section>

                            {linkedPrompts.length > 0 && (
                                <section className="detail-segment">
                                    <label>Linked Saved Records</label>
                                    <div className="linked-prompts-list">
                                        {linkedPrompts.map(p => (
                                            <div key={p.id} className="linked-prompt-card glass">
                                                <MessageSquare size={16} className="text-secondary" />
                                                <span>Saved Prompt #{p.id}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        <footer className="detail-footer">
                            <div className="action-row">
                                <button className="btn-primary" onClick={handleCreateSimilar} disabled={isUpdating}>
                                    <Wand2 size={20} />
                                    <span>Create Similar</span>
                                </button>

                                {isOwner && (
                                    <>
                                        <button
                                            className="btn-secondary"
                                            onClick={async () => {
                                                setIsSavingPrompt(true);
                                                try {
                                                    const saved = await promptsApi.save(image.prompt, image.tags, image.title);
                                                    addPromptToCache(saved);
                                                    alert('Prompt saved to your collection!');
                                                    loadLinkedPrompts(); // Refresh links
                                                } catch (err) {
                                                    alert('Failed to save prompt');
                                                } finally {
                                                    setIsSavingPrompt(false);
                                                }
                                            }}
                                            disabled={isSavingPrompt}
                                            title="Save prompt to your collection"
                                        >
                                            {isSavingPrompt ? <Loader2 className="spin" size={18} /> : <BookmarkPlus size={18} />}
                                            <span>Save Prompt</span>
                                        </button>
                                        <button className={`btn-secondary ${image.isPublic ? 'active' : ''}`} onClick={handleTogglePublic} disabled={isUpdating}>
                                            {isUpdating ? <Loader2 className="spin" size={18} /> : (image.isPublic ? <Shield size={18} /> : <Globe size={18} />)}
                                            <span>{image.isPublic ? 'Make Private' : 'Publish'}</span>
                                        </button>
                                        <button className="btn-icon-danger" onClick={handleDelete} disabled={isUpdating}>
                                            <Trash2 size={20} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );

    return createPortal(modalContent, document.getElementById('modal-root'));
}
