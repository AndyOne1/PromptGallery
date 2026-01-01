import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Copy, Check, Trash2, Calendar, ImagePlus, Search, Hash, Clock } from 'lucide-react';
import { promptsApi } from '../services/api';
import UploadModal from '../components/Gallery/UploadModal';
import PromptDetailView from '../components/Prompts/PromptDetailView';
import './Prompts.css';
import '../components/Prompts/PromptDetailView.css';

export default function Prompts({ user }) {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [displayLimit, setDisplayLimit] = useState(10);

    useEffect(() => {
        loadPrompts();
    }, [user]);

    useEffect(() => {
        if (isUploadOpen || isDetailOpen) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isUploadOpen, isDetailOpen]);

    const loadPrompts = async () => {
        setLoading(true);
        try {
            let data;
            if (user) {
                data = await promptsApi.get();
            } else {
                data = JSON.parse(localStorage.getItem('generated_prompts') || '[]');
            }

            // Sort by newest first
            const sorted = (data || []).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );

            setPrompts(sorted);
        } catch (err) {
            console.error('Failed to load prompts:', err);
        } finally {
            setLoading(false);
        }
    };

    const copyPrompt = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const deletePrompt = async (id) => {
        if (!window.confirm('Delete this prompt forever?')) return;
        if (user) {
            try {
                await promptsApi.delete(id);
                setPrompts(prompts.filter(p => p.id !== id));
            } catch (err) {
                alert('Failed to delete prompt');
            }
        } else {
            const updated = prompts.filter(p => p.id !== id);
            setPrompts(updated);
            localStorage.setItem('generated_prompts', JSON.stringify(updated));
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

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return {
            day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
        };
    };

    const filteredPrompts = useMemo(() => {
        let result = prompts;
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = prompts.filter(p => {
                const content = (p.content || p.prompt || '').toLowerCase();
                const tags = (p.refinedTags || p.tags || []).join(' ').toLowerCase();
                return content.includes(query) || tags.includes(query);
            });
        }
        return result;
    }, [prompts, searchQuery]);

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
        </div>
    );
}
