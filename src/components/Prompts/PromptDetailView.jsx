import { X, Copy, Check, Trash2, Calendar, Hash, Clock, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { galleryApi } from '../../services/api';

export default function PromptDetailView({ prompt, isOpen, onClose, onDelete }) {
    const [copied, setCopied] = useState(false);
    const [linkedImages, setLinkedImages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen && prompt) {
            loadLinkedImages();
        }
    }, [isOpen, prompt]);

    const loadLinkedImages = async () => {
        setIsLoading(true);
        try {
            // Find images where prompt text matches exactly
            const allImages = await galleryApi.get();
            const promptText = prompt.content || prompt.prompt;
            const matches = allImages.filter(img => img.prompt === promptText);
            setLinkedImages(matches);
        } catch (err) {
            console.error('Failed to load linked images:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !prompt) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(prompt.content || prompt.prompt);
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

    return (
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
                        <div className="prompt-display-large glass">
                            <p>{prompt.content || prompt.prompt}</p>
                            <button className="btn-copy-float" onClick={handleCopy}>
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>
                    </section>

                    <section className="detail-segment">
                        <label>Refined Tags</label>
                        <div className="tag-cloud">
                            {(prompt.refinedTags || prompt.tags)?.map(tag => (
                                <span key={tag} className="tag">{tag}</span>
                            ))}
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
}
