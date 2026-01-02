import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Plus, Search, Copy, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { charactersApi } from '../services/api';
import CharacterDetailView from '../components/Characters/CharacterDetailView';
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
            setSelectedCharacter(null);
            return;
        }

        try {
            await charactersApi.delete(id);
            setCharacters(prev => prev.filter(c => c.id !== id));
            setDeleteConfirm(null);
            setSelectedCharacter(null);
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

    const handleNewCharacterFromImage = () => {
        navigate('/generator', { state: { mode: 'character-from-image' } });
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
                        <button className="btn-secondary" onClick={handleNewCharacterFromImage}>
                            <ImageIcon size={18} />
                            <span>From Image</span>
                        </button>
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

            {/* New Landscape Character Detail View */}
            <CharacterDetailView
                character={selectedCharacter}
                isOpen={!!selectedCharacter}
                onClose={() => setSelectedCharacter(null)}
                onDelete={(id) => setDeleteConfirm(id)}
                user={user}
            />

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

