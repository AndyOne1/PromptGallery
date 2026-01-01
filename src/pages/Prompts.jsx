import { useState, useEffect } from 'react';
import { MessageSquare, Copy, Check, Trash2, Calendar, Loader2 } from 'lucide-react';
import { promptsApi } from '../services/api';
import './Prompts.css';

export default function Prompts({ user }) {
    const [prompts, setPrompts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        loadPrompts();
    }, [user]);

    const loadPrompts = async () => {
        setLoading(true);
        try {
            let data;
            if (user) {
                data = await promptsApi.get();
            } else {
                data = JSON.parse(localStorage.getItem('generated_prompts') || '[]');
            }
            setPrompts(data || []);
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

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="title-gradient">Saved Prompts</h1>
                    <p className="subtitle">Your collection of AI-crafted prompts</p>
                </div>
            </header>

            {prompts.length > 0 ? (
                <div className="prompts-list">
                    {prompts.map(p => (
                        <div key={p.id} className="prompt-item glass">
                            <div className="prompt-header">
                                <div className="prompt-meta">
                                    <Calendar size={14} />
                                    <span>{formatDate(p.createdAt)}</span>
                                </div>
                                <div className="prompt-actions">
                                    <button className="btn-icon-small" onClick={() => copyPrompt(p.prompt, p.id)}>
                                        {copiedId === p.id ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                    <button className="btn-icon-small delete" onClick={() => deletePrompt(p.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="prompt-body">
                                <p>{p.prompt}</p>
                            </div>
                            <div className="prompt-footer">
                                <div className="card-tags">
                                    {p.tags?.map(tag => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="empty-state glass">
                    <MessageSquare size={48} className="text-dim" />
                    <h3>No prompts saved yet</h3>
                    <p>Go to the Generator to create your first high-quality prompt.</p>
                </div>
            )}
        </div>
    );
}
