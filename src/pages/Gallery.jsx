import { useState, useEffect } from 'react';
import { Upload, Search, Settings as SettingsIcon, Copy, Check } from 'lucide-react';
import UploadModal from '../components/Gallery/UploadModal';
import ImageDetailView from '../components/Gallery/ImageDetailView';
import Settings from '../components/Settings';
import '../components/Modal.css';
import '../components/Gallery/Gallery.css';
import '../components/Gallery/DetailView.css';

export default function Gallery() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [images, setImages] = useState([]);
    const [search, setSearch] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('gallery_images') || '[]');
        setImages(saved);
    }, []);

    const handleUploadComplete = (newImage) => {
        const updated = [newImage, ...images];
        setImages(updated);
        localStorage.setItem('gallery_images', JSON.stringify(updated));
    };

    const deleteTag = (imageId, tagToDelete) => {
        const updated = images.map(img => {
            if (img.id === imageId) {
                return { ...img, tags: img.tags.filter(t => t !== tagToDelete) };
            }
            return img;
        });
        setImages(updated);
        localStorage.setItem('gallery_images', JSON.stringify(updated));
        // Update selected image to reflect changes
        if (selectedImage?.id === imageId) {
            setSelectedImage(updated.find(img => img.id === imageId));
        }
    };

    const copyPrompt = (e, prompt, id) => {
        e.stopPropagation();
        navigator.clipboard.writeText(prompt);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredImages = images.filter(img =>
        img.prompt.toLowerCase().includes(search.toLowerCase()) ||
        img.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="title-gradient">Prompt Gallery</h1>
                    <p className="subtitle">Curate and analyze your high-quality creations</p>
                </div>
                <div className="header-actions">
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

            {filteredImages.length > 0 ? (
                <div className="gallery-grid">
                    {filteredImages.map(img => (
                        <div key={img.id} className="gallery-card glass glass-interactive" onClick={() => setSelectedImage(img)}>
                            <div className="card-image-wrap">
                                <img src={img.url} alt={img.description} />
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
                                <h4 className="card-desc">{img.description}</h4>
                                <p className="card-prompt">{img.prompt}</p>
                            </div>
                        </div>
                    ))}
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
            />
            <Settings
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
}
