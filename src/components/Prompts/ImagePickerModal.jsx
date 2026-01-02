import { X, Check } from 'lucide-react';
import { useState } from 'react';
import { createPortal } from 'react-dom';

export default function ImagePickerModal({ isOpen, onClose, images, onSelect, alreadyLinkedIds = [] }) {
    const [selectedIds, setSelectedIds] = useState([]);

    if (!isOpen) return null;

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleConfirm = () => {
        const selectedImages = images.filter(img => selectedIds.includes(img.id));
        onSelect(selectedImages);
        setSelectedIds([]);
        onClose();
    };

    const modalContent = (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass animate-fade-in image-picker-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2 className="title-gradient">Select Images to Link</h2>
                    <button className="btn-icon" onClick={onClose}><X size={24} /></button>
                </header>

                <div className="modal-body p-4">
                    <div className="image-picker-grid">
                        {images.map(img => {
                            const isAlreadyLinked = alreadyLinkedIds.includes(img.id);
                            const isSelected = selectedIds.includes(img.id);

                            return (
                                <div
                                    key={img.id}
                                    className={`picker-card ${isSelected ? 'selected' : ''} ${isAlreadyLinked ? 'already-linked' : ''}`}
                                    onClick={() => !isAlreadyLinked && toggleSelect(img.id)}
                                >
                                    <img src={img.url} alt="" />
                                    {isSelected && <div className="picker-check"><Check size={16} /></div>}
                                    {isAlreadyLinked && <div className="picker-linked-badge">Linked</div>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <footer className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button
                        className="btn-primary"
                        onClick={handleConfirm}
                        disabled={selectedIds.length === 0}
                    >
                        Link {selectedIds.length > 0 ? `(${selectedIds.length})` : ''} Images
                    </button>
                </footer>
            </div>

            <style jsx>{`
                .image-picker-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                    gap: 1rem;
                    max-height: 50vh;
                    overflow-y: auto;
                    padding: 0.5rem;
                }
                .picker-card {
                    position: relative;
                    aspect-ratio: 1;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                }
                .picker-card:hover { border-color: var(--accent-primary); }
                .picker-card.selected { border-color: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary); }
                .picker-card.already-linked { opacity: 0.5; cursor: not-allowed; grayscale: 1; }
                .picker-card img { width: 100%; height: 100%; object-fit: cover; }
                .picker-check {
                    position: absolute;
                    top: 5px;
                    right: 5px;
                    background: var(--accent-primary);
                    color: white;
                    border-radius: 50%;
                    padding: 2px;
                }
                .picker-linked-badge {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.6);
                    color: white;
                    font-size: 0.7rem;
                    text-align: center;
                    padding: 2px;
                }
            `}</style>
        </div>
    );

    return createPortal(modalContent, document.getElementById('modal-root'));
}
