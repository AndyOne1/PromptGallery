import { useState, useEffect } from 'react';
import { X, Save, Settings as SettingsIcon } from 'lucide-react';

export default function Settings({ isOpen, onClose }) {
    const [keys, setKeys] = useState({
        openrouter_key: '',
        cloudinary_name: '',
        cloudinary_preset: ''
    });

    useEffect(() => {
        setKeys({
            openrouter_key: localStorage.getItem('openrouter_key') || '',
            cloudinary_name: localStorage.getItem('cloudinary_name') || '',
            cloudinary_preset: localStorage.getItem('cloudinary_preset') || ''
        });
    }, [isOpen]);

    const handleSave = () => {
        localStorage.setItem('openrouter_key', keys.openrouter_key);
        localStorage.setItem('cloudinary_name', keys.cloudinary_name);
        localStorage.setItem('cloudinary_preset', keys.cloudinary_preset);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass animate-fade-in">
                <header className="modal-header">
                    <div className="flex-row gap-2">
                        <SettingsIcon size={20} className="text-secondary" />
                        <h3>Project Settings</h3>
                    </div>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </header>

                <div className="modal-body">
                    <div className="input-group">
                        <label>OpenRouter API Key</label>
                        <input
                            type="password"
                            placeholder="sk-or-v1-..."
                            value={keys.openrouter_key}
                            onChange={(e) => setKeys({ ...keys, openrouter_key: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Cloudinary Cloud Name</label>
                        <input
                            type="text"
                            placeholder="e.g. dxyz12345"
                            value={keys.cloudinary_name}
                            onChange={(e) => setKeys({ ...keys, cloudinary_name: e.target.value })}
                        />
                    </div>

                    <div className="input-group">
                        <label>Cloudinary Upload Preset (Unsigned)</label>
                        <input
                            type="text"
                            placeholder="e.g. prompt_preset"
                            value={keys.cloudinary_preset}
                            onChange={(e) => setKeys({ ...keys, cloudinary_preset: e.target.value })}
                        />
                    </div>

                    <p className="hint-text">Keys are saved locally in your browser.</p>
                </div>

                <footer className="modal-footer">
                    <button className="btn-secondary" onClick={onClose}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>
                        <Save size={18} />
                        <span>Save Settings</span>
                    </button>
                </footer>
            </div>
        </div>
    );
}
