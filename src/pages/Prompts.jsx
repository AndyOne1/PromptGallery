import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Copy, Check, Trash2, Calendar, ImagePlus, Search, Hash, Clock, User } from 'lucide-react';
import { promptsApi } from '../services/api';
import UploadModal from '../components/Gallery/UploadModal';
import PromptDetailView from '../components/Prompts/PromptDetailView';
import './Prompts.css';
import '../components/Prompts/PromptDetailView.css';
import ConfirmationModal from '../components/UI/ConfirmationModal';

import { useData } from '../context/DataContext';
import { normalizePromptText } from '../utils/stringUtils';

export default function Prompts({ user }) {
    const { prompts, isLoadingPrompts, fetchPrompts, removePromptFromCache, privateImages, characters } = useData();
    const [copiedId, setCopiedId] = useState(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayLimit, setDisplayLimit] = useState(30);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const [promptToDelete, setPromptToDelete] = useState(null);
    const [excludeCharacters, setExcludeCharacters] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        fetchPrompts();
    }, [user, fetchPrompts]);

    const copyPrompt = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const deletePrompt = (id) => {
        setPromptToDelete(id);
        setIsDeleteConfirmOpen(true);
    };

    const confirmDeletePrompt = async () => {
        const id = promptToDelete;
        if (!id) return;

        if (user) {
            try {
                await promptsApi.delete(id);
                removePromptFromCache(id);
            } catch (err) {
                alert('Failed to delete prompt');
            }
        } else {
            const updated = prompts.filter(p => p.id !== id);
            localStorage.setItem('generated_prompts', JSON.stringify(updated));
            removePromptFromCache(id);
            if (selectedPrompt?.id === id) {
                setIsDetailOpen(false);
                setSelectedPrompt(null);
            }
        }
    };

    const handleAttachImage = (e, prompt) => {
        e.stopPropagation();
        setSelectedPrompt(prompt);
        setIsUploadOpen(true);
    };

    const handleOpenDetail = (prompt) => {
        setSelectedPrompt(prompt);
        setIsDetailOpen(true);
    };

    const getEffectiveTitle = (p) => {
        if (p.title) return p.title;

        const content = p.content || p.prompt;
        if (!content) return 'Untitled Prompt';
        const normalized = normalizePromptText(content);

        const matches = privateImages
            .filter(img => normalizePromptText(img.prompt) === normalized)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return matches.length > 0 ? matches[0].title : 'Untitled Prompt';
    };

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return {
            day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        };
    };

    const sortedPrompts = useMemo(() => {
        return [...prompts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [prompts]);

    const filteredPrompts = useMemo(() => {
        let result = sortedPrompts;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = sortedPrompts.filter(p => {
                const content = (p.content || p.prompt || '').toLowerCase();
                const tags = (p.refinedTags || p.tags || []).join(' ').toLowerCase();
                return content.includes(query) || tags.includes(query);
            });
        }
        if (excludeCharacters) {
            // Get character names for matching
            const characterNames = characters.map(c => c.name.toLowerCase());

            result = result.filter(p => {
                const tags = (p.refinedTags || p.tags || []).map(t => t.toLowerCase());

                // Check if any tag contains "character" keyword
                const hasCharacterKeyword = tags.some(tag =>
                    tag.includes('character') ||
                    tag.includes('charakter') ||
                    tag.includes('reference sheet') ||
                    tag.includes('ref sheet')
                );
                if (hasCharacterKeyword) return false;

                // Check if any tag matches a character name
                const hasCharacterName = tags.some(tag =>
                    characterNames.some(name => tag.includes(name) || name.includes(tag))
                );
                if (hasCharacterName) return false;

                return true;
            });
        }
        return result;
    }, [sortedPrompts, searchQuery, excludeCharacters, characters]);

    const displayPrompts = useMemo(() => {
        return filteredPrompts.slice(0, displayLimit);
    }, [filteredPrompts, displayLimit]);

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="title-gradient">Saved Prompts</h1>
                    <p className="subtitle">Your collection of AI-crafted prompts</p>
                </div>
            </header>

            <div className="prompts-controls">
                <div className="view-toggle glass filter-toggle">
                    <button
                        className={`toggle-btn ${excludeCharacters ? 'active' : ''}`}
                        onClick={() => setExcludeCharacters(!excludeCharacters)}
                        title="Character Prompts ausblenden"
                    >
                        <User size={16} />
                        <span>Ohne Charaktere</span>
                    </button>
                </div>

                <div className="search-bar glass">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by content or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {filteredPrompts.length > 0 ? (
                <>
                    <div className="prompts-list">
                        {displayPrompts.map((p, index) => {
                            const dateInfo = formatDate(p.createdAt);
                            const seqNumber = filteredPrompts.length - index;

                            return (
                                <div key={p.id} className="prompt-item glass clickable" onClick={() => handleOpenDetail(p)}>
                                    <div className="prompt-header">
                                        <div className="prompt-meta">
                                            <div className="prompt-number">
                                                <Hash size={12} />
                                                <span>{seqNumber}</span>
                                            </div>
                                            <div className="meta-item">
                                                <Calendar size={14} />
                                                <span>{dateInfo.day}</span>
                                            </div>
                                            <div className="meta-item">
                                                <Clock size={14} />
                                                <span>{dateInfo.time}</span>
                                            </div>
                                        </div>
                                        <div className="prompt-actions">
                                            <button className="btn-icon-small" onClick={(e) => { e.stopPropagation(); copyPrompt(p.content || p.prompt, p.id); }} title="Copy Prompt">
                                                {copiedId === p.id ? <Check size={16} /> : <Copy size={16} />}
                                            </button>
                                            <button className="btn-icon-small" onClick={(e) => handleAttachImage(e, p)} title="Add Image to Gallery">
                                                <ImagePlus size={16} />
                                            </button>
                                            <button className="btn-icon-small delete" onClick={(e) => { e.stopPropagation(); deletePrompt(p.id); }} title="Delete Prompt">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="prompt-body">
                                        <h3 className="prompt-card-title">{getEffectiveTitle(p)}</h3>
                                        <p className="prompt-text-truncate">{p.content || p.prompt}</p>
                                    </div>
                                    <div className="prompt-footer">
                                        <div className="card-tags">
                                            {(p.refinedTags || p.tags)?.map(tag => (
                                                <span key={tag} className="tag">{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {filteredPrompts.length > displayLimit && (
                        <div className="load-more-container">
                            <button className="btn-secondary" onClick={() => setDisplayLimit(prev => prev + 10)}>
                                Show More Prompts
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div className="empty-state glass">
                    <MessageSquare size={48} className="text-dim" />
                    <h3>{searchQuery ? 'No matching prompts found' : 'No prompts saved yet'}</h3>
                    <p>{searchQuery ? 'Try a different search term.' : 'Go to the Generator to create your first high-quality prompt.'}</p>
                </div>
            )}

            <UploadModal
                isOpen={isUploadOpen}
                onClose={() => {
                    setIsUploadOpen(false);
                    setSelectedPrompt(null);
                }}
                onUploadComplete={() => {
                    setIsUploadOpen(false);
                    setSelectedPrompt(null);
                }}
                initialPrompt={selectedPrompt?.content || selectedPrompt?.prompt}
                initialTags={selectedPrompt?.refinedTags || selectedPrompt?.tags}
            />
            <PromptDetailView
                isOpen={isDetailOpen}
                prompt={selectedPrompt}
                onClose={() => {
                    setIsDetailOpen(false);
                    setSelectedPrompt(null);
                }}
                onDelete={deletePrompt}
            />
            <ConfirmationModal
                isOpen={isDeleteConfirmOpen}
                onClose={() => {
                    setIsDeleteConfirmOpen(false);
                    setPromptToDelete(null);
                }}
                onConfirm={confirmDeletePrompt}
                title="Delete Prompt"
                message="Are you sure you want to delete this prompt forever? This action cannot be undone."
                confirmText="Delete forever"
            />
        </div>
    );
}
