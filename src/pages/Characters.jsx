import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plus, Search, Copy, Check, Trash2, Loader2, X, Pin, Image as ImageIcon } from 'lucide-react';
import { charactersApi } from '../services/api';
import ConfirmationModal from '../components/UI/ConfirmationModal';
import '../components/Gallery/Gallery.css';
import './Characters.css';

export default function Characters({ user }) {
    const navigate = useNavigate();
    const [characters, setCharacters] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [copiedId, setCopiedId] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        loadCharacters();
    }, [user]);

    const loadCharacters = async () => {
        if (!user) {
            // Load from localStorage for non-logged users
            const local = JSON.parse(localStorage.getItem('local_characters') || '[]');
            setCharacters(local);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const data = await charactersApi.getAll();
            setCharacters(data);
        } catch (err) {
            console.error('Failed to load characters:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyPrompt = (e, prompt, id) => {
        e.stopPropagation();
        if (!prompt) return;
        navigator.clipboard.writeText(prompt);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (id) => {
        if (!user) {
            const updated = characters.filter(c => c.id !== id);
            localStorage.setItem('local_characters', JSON.stringify(updated));
            setCharacters(updated);
            setDeleteConfirm(null);
            return;
        }

        try {
            await charactersApi.delete(id);
            setCharacters(prev => prev.filter(c => c.id !== id));
            setDeleteConfirm(null);
            if (selectedCharacter?.id === id) setSelectedCharacter(null);
        } catch (err) {
            console.error('Delete failed:', err);
        }
    };

    const filteredCharacters = characters.filter(char =>
        char.name.toLowerCase().includes(search.toLowerCase()) ||
        char.attributes?.personality?.toLowerCase().includes(search.toLowerCase())
    );

    const handleNewCharacter = () => {
        navigate('/generator', { state: { mode: 'character' } });
    };

    return (
        <>
            <div className="page-container animate-fade-in">
                <header className="page-header">
                    <div>
                        <h1 className="title-gradient">Characters</h1>
                        <p className="subtitle">Your AI-generated character library</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn-primary" onClick={handleNewCharacter}>
                            <Plus size={18} />
                            <span>New Character</span>
                        </button>
                    </div>
                </header>

                <div className="gallery-controls">
                    <div className="search-bar glass">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search characters..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-state glass">
                        <Loader2 size={48} className="spin" />
                        <p>Loading characters...</p>
                    </div>
                ) : filteredCharacters.length > 0 ? (
                    <div className="gallery-grid characters-grid">
                        {filteredCharacters.map(char => (
                            <div
                                key={char.id}
                                className="gallery-card glass glass-interactive character-card"
                                onClick={() => setSelectedCharacter(char)}
                            >
                                <div className="card-image-wrap character-avatar">
                                    {char.pinnedImage?.url ? (
                                        <img src={char.pinnedImage.url} alt={char.name} />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            <User size={48} />
                                        </div>
                                    )}
                                    <div className="card-overlay">
                                        <button
                                            className="btn-copy"
                                            onClick={(e) => handleCopyPrompt(e, char.prompt, char.id)}
                                            title="Copy character prompt"
                                        >
                                            {copiedId === char.id ? <Check size={16} /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="card-content">
                                    <h4 className="card-title">{char.name}</h4>
                                    <div className="character-meta">
                                        {char.attributes?.age && <span>{char.attributes.age}</span>}
                                        {char.attributes?.gender && <span>{char.attributes.gender}</span>}
                                    </div>
                                    {char.attributes?.personality && (
                                        <p className="card-desc-small">{char.attributes.personality}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state glass">
                        <div className="empty-icon-wrap">
                            <User size={48} />
                        </div>
                        <h3>No characters yet</h3>
                        <p>Create your first AI character and bring them to life.</p>
                        <button className="btn-secondary" onClick={handleNewCharacter}>
                            Create First Character
                        </button>
                    </div>
                )}
            </div>

            {/* Character Detail Modal */}
            {selectedCharacter && (
                <div className="modal-overlay" onClick={() => setSelectedCharacter(null)}>
                    <div className="modal-content character-detail-modal glass" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setSelectedCharacter(null)}>
                            <X size={20} />
                        </button>

                        <div className="character-detail-header">
                            <div className="character-portrait">
                                {selectedCharacter.pinnedImage?.url ? (
                                    <img src={selectedCharacter.pinnedImage.url} alt={selectedCharacter.name} />
                                ) : (
                                    <div className="portrait-placeholder">
                                        <User size={64} />
                                    </div>
                                )}
                            </div>
                            <div className="character-info">
                                <h2>{selectedCharacter.name}</h2>
                                <div className="character-tags">
                                    {selectedCharacter.attributes?.age && (
                                        <span className="tag">{selectedCharacter.attributes.age}</span>
                                    )}
                                    {selectedCharacter.attributes?.gender && (
                                        <span className="tag">{selectedCharacter.attributes.gender}</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="character-attributes-section">
                            <h3>Attributes</h3>
                            <div className="attributes-grid">
                                {Object.entries(selectedCharacter.attributes || {}).map(([key, value]) => (
                                    <div key={key} className="attribute-row">
                                        <span className="attribute-label">{key}:</span>
                                        <span className="attribute-value">{value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {selectedCharacter.prompt && (
                            <div className="character-prompt-section glass">
                                <h3>Character Prompt</h3>
                                <p className="prompt-text">{selectedCharacter.prompt}</p>
                                <button
                                    className="btn-secondary"
                                    onClick={(e) => handleCopyPrompt(e, selectedCharacter.prompt, selectedCharacter.id)}
                                >
                                    {copiedId === selectedCharacter.id ? <Check size={16} /> : <Copy size={16} />}
                                    <span>Copy Prompt</span>
                                </button>
                            </div>
                        )}

                        <div className="character-actions">
                            <button
                                className="btn-secondary btn-danger"
                                onClick={() => setDeleteConfirm(selectedCharacter.id)}
                            >
                                <Trash2 size={16} />
                                <span>Delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={() => handleDelete(deleteConfirm)}
                title="Delete Character"
                message="Are you sure you want to delete this character? This action cannot be undone."
                confirmText="Delete"
            />
        </>
    );
}
