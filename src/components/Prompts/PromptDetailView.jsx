import { X, Copy, Check, Trash2, Calendar, Hash, Clock, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { galleryApi } from '../../services/api';
import { normalizePromptText } from '../../utils/stringUtils';

export default function PromptDetailView({ prompt, isOpen, onClose, onDelete }) {
    const [copied, setCopied] = useState(false);
    const [linkedImages, setLinkedImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showAllTags, setShowAllTags] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-open');
            if (prompt) loadLinkedImages();
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen, prompt]);

    const loadLinkedImages = async () => {
        setIsLoading(true);
        try {
            const allImages = await galleryApi.getPrivate();
            const normalizedContent = normalizePromptText(prompt.content || prompt.prompt);
            const matches = allImages.filter(img =>
                normalizePromptText(img.prompt) === normalizedContent
            );
            setLinkedImages(matches);
        } catch (err) {
            console.error('Failed to load linked images:', err);
        } finally {
            setIsLoading(false);
        }
    };

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

    const modalContent = (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass animate-fade-in prompt-detail-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="prompt-meta">
                        <div className="meta-item">
                            <Calendar size={14} />
                            <span>{dateInfo.day}</span>
                        </div>
                        <div className="meta-item">
                            <Clock size={14} />
                            <span>{dateInfo.time}</span>
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
                        <label>Linked Gallery Creations ({linkedImages.length})</label>
                        {linkedImages.length > 0 ? (
                            <div className="linked-images-grid">
                                {linkedImages.map(img => (
                                    <div key={img.id} className="linked-image-card glass">
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

                <footer className="modal-footer">
                    <button className="btn-secondary text-danger" onClick={() => {
                        if (window.confirm('Delete this prompt?')) {
                            onDelete(prompt.id);
                            onClose();
                        }
                    }}>
                        <Trash2 size={18} />
                        <span>Delete Prompt</span>
                    </button>
                    <button className="btn-primary" onClick={onClose}>Close</button>
                </footer>
            </div>
        </div>
    );

    return createPortal(modalContent, document.getElementById('modal-root'));
}
