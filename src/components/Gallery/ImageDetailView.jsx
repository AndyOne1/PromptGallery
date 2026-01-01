import { X, Copy, Check, Trash2, Wand2, Globe, Shield, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ImageDetailView({ image, isOpen, onClose, onDeleteTag, user, onUpdateImage }) {
    const [copied, setCopied] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen]);

    if (!isOpen || !image) return null;

    const isOwner = user && image.userId === user.id;

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
        if (!window.confirm('Are you sure you want to delete this creation?')) return;
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="detail-modal glass animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="detail-grid">
                    <div className="detail-image-section">
                        <img src={image.url} alt={image.description} className="detail-main-image" />
                    </div>

                    <div className="detail-info-section">
                        <header className="detail-header">
                            <div className="flex-col">
                                <h2 className="title-gradient">{image.description}</h2>
                                {isOwner && (
                                    <span className={`visibility-badge ${image.isPublic ? 'public' : 'private'}`}>
                                        {image.isPublic ? <Globe size={14} /> : <Shield size={14} />}
                                        {image.isPublic ? 'Public' : 'Private'}
                                    </span>
                                )}
                            </div>
                            <button className="btn-icon" onClick={onClose}><X size={24} /></button>
                        </header>

                        <div className="detail-body">
                            <section className="detail-segment">
                                <label>Prompt</label>
                                <div className="prompt-display glass">
                                    <p>{image.prompt}</p>
                                    <button className="btn-copy-float" onClick={handleCopy}>
                                        {copied ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </section>

                            <section className="detail-segment">
                                <label>Tags (Click X to remove)</label>
                                <div className="detail-tags">
                                    {image.tags.map((tag, idx) => (
                                        <span key={idx} className="tag-closable">
                                            {tag}
                                            <button className="tag-remove" onClick={() => onDeleteTag(image.id, tag)}>
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <footer className="detail-footer">
                            <div className="action-row">
                                <button className="btn-primary" onClick={handleCreateSimilar} disabled={isUpdating}>
                                    <Wand2 size={20} />
                                    <span>Create Similar</span>
                                </button>

                                {isOwner && (
                                    <>
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
}
