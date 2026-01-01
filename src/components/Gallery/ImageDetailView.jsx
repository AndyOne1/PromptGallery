import { X, Copy, Check, Trash2, Wand2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ImageDetailView({ image, isOpen, onClose, onDeleteTag, onSaveImages }) {
    const [copied, setCopied] = useState(false);
    const navigate = useNavigate();

    if (!isOpen || !image) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(image.prompt);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
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
                            <h2 className="title-gradient">{image.description}</h2>
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
                            <button className="btn-primary large full-width" onClick={handleCreateSimilar}>
                                <Wand2 size={20} />
                                <span>Create Similar Prompt</span>
                            </button>
                        </footer>
                    </div>
                </div>
            </div>
        </div>
    );
}
