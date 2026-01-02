import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Loader2, Wand2, Globe, Shield, User, ChevronDown } from 'lucide-react';
import { uploadToCloudinary } from '../../services/cloudinary';
import { analyzePrompt } from '../../services/openrouter';
import { compressImage } from '../../utils/imageUtils';
import { galleryApi, charactersApi } from '../../services/api';
import { useData } from '../../context/DataContext';
import { normalizePromptText } from '../../utils/stringUtils';

export default function UploadModal({ isOpen, onClose, onUploadComplete, initialPrompt = '', initialTags = [], user }) {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [prompt, setPrompt] = useState(initialPrompt);
    const [isPublic, setIsPublic] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState('');
    const { privateImages } = useData();

    // Character linking state
    const [characters, setCharacters] = useState([]);
    const [selectedCharacter, setSelectedCharacter] = useState(null);
    const [showCharacterDropdown, setShowCharacterDropdown] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setPrompt(initialPrompt);
            loadCharacters();
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen, initialPrompt]);

    const loadCharacters = async () => {
        if (!user) {
            const local = JSON.parse(localStorage.getItem('local_characters') || '[]');
            setCharacters(local);
            return;
        }
        try {
            const data = await charactersApi.getAll();
            setCharacters(data);
        } catch (err) {
            console.error('Failed to load characters:', err);
        }
    };

    const onDrop = useCallback(acceptedFiles => {
        setFiles(prev => [...prev, ...acceptedFiles]);
        const newPreviews = acceptedFiles.map(file => URL.createObjectURL(file));
        setPreviews(prev => [...prev, ...newPreviews]);
    }, []);

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => {
            URL.revokeObjectURL(prev[index]);
            return prev.filter((_, i) => i !== index);
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true
    });

    const handleUpload = async () => {
        if (files.length === 0 || !prompt) return;

        const openRouterKey = localStorage.getItem('openrouter_key');
        const cloudName = localStorage.getItem('cloudinary_name');
        const uploadPreset = localStorage.getItem('cloudinary_preset');

        if (!openRouterKey || !cloudName || !uploadPreset) {
            alert('Please set your API keys in Settings first!');
            return;
        }

        setIsUploading(true);
        try {
            // 1. Check for existing metadata (Deduplication / Consistency)
            setStatus('Checking for existing metadata...');
            const normalizedCurrent = normalizePromptText(prompt);
            const existingMatch = privateImages.find(img => normalizePromptText(img.prompt) === normalizedCurrent);

            let analysis;
            if (existingMatch) {
                analysis = {
                    tags: existingMatch.tags,
                    title: existingMatch.title,
                    description: existingMatch.description
                };
            } else {
                // Analyze with OpenRouter
                setStatus('Analyzing with AI...');
                analysis = await analyzePrompt(openRouterKey, prompt);
            }

            // If we have initial tags (from saved prompts), we prefer them
            let finalTags = initialTags.length > 0 ? initialTags : analysis.tags;

            // Add character name as tag if selected
            if (selectedCharacter) {
                finalTags = [...finalTags, selectedCharacter.name];
            }

            const finalTitle = analysis.title;
            const finalDescription = analysis.description;

            const uploadResults = [];

            // 2. Process each file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setStatus(`Processing image ${i + 1}/${files.length}...`);

                // Compress
                const compressedBlob = await compressImage(file);
                const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                    type: 'image/jpeg'
                });

                // Upload to Cloudinary
                const cloudData = await uploadToCloudinary(compressedFile, cloudName, uploadPreset);

                uploadResults.push({
                    url: cloudData.secure_url,
                    publicId: cloudData.public_id,
                    prompt: prompt,
                    tags: finalTags,
                    title: finalTitle,
                    description: finalDescription,
                    isPublic: isPublic
                });
            }

            setStatus('Saving to database...');
            // 3. Save as batch
            const savedItems = await galleryApi.upload(uploadResults);
            const savedArray = Array.isArray(savedItems) ? savedItems : [savedItems];

            // 4. Link to character if selected
            if (selectedCharacter && user) {
                setStatus('Linking to character...');
                for (const item of savedArray) {
                    await charactersApi.linkImage(selectedCharacter.id, item.id);
                }
            }

            onUploadComplete(savedArray);
            handleClose();
        } catch (error) {
            alert('Upload failed: ' + error.message);
        } finally {
            setIsUploading(false);
            setStatus('');
        }
    };

    const handleClose = () => {
        setFiles([]);
        setPreviews(prev => {
            prev.forEach(url => URL.revokeObjectURL(url));
            return [];
        });
        setPrompt('');
        setIsPublic(false);
        setSelectedCharacter(null);
        setShowCharacterDropdown(false);
        onClose();
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="modal-overlay">
            <div className="modal-content glass animate-fade-in" style={{ maxWidth: '600px' }}>
                <header className="modal-header">
                    <h3>Upload to Gallery {files.length > 0 && `(${files.length} items)`}</h3>
                    <button className="btn-icon" onClick={handleClose}><X size={20} /></button>
                </header>

                <div className="modal-body">
                    <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''} ${files.length > 0 ? 'compact' : ''}`}>
                        <input {...getInputProps()} />
                        <Upload size={32} />
                        <p>{isDragActive ? "Drop them here!" : "Drag & drop images, or click to select"}</p>
                    </div>

                    {previews.length > 0 && (
                        <div className="multi-preview-grid">
                            {previews.map((url, idx) => (
                                <div key={idx} className="preview-item">
                                    <img src={url} alt={`Preview ${idx}`} />
                                    <button className="remove-preview-btn" onClick={() => removeFile(idx)}>
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="input-group">
                        <label>Prompt used for {files.length > 1 ? 'these images' : 'this image'}</label>
                        <textarea
                            placeholder="Paste the prompt you used..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Character Link Option */}
                    {characters.length > 0 && (
                        <div className="input-group">
                            <label>Link to Character (optional)</label>
                            <div className="character-select-wrapper">
                                <button
                                    className="character-select-btn glass"
                                    onClick={() => setShowCharacterDropdown(!showCharacterDropdown)}
                                >
                                    {selectedCharacter ? (
                                        <>
                                            <User size={16} />
                                            <span>{selectedCharacter.name}</span>
                                        </>
                                    ) : (
                                        <>
                                            <User size={16} />
                                            <span>Kein Character</span>
                                        </>
                                    )}
                                    <ChevronDown size={16} />
                                </button>
                                {showCharacterDropdown && (
                                    <div className="character-dropdown-list glass">
                                        <button
                                            className={`dropdown-item ${!selectedCharacter ? 'active' : ''}`}
                                            onClick={() => { setSelectedCharacter(null); setShowCharacterDropdown(false); }}
                                        >
                                            <span>Kein Character</span>
                                        </button>
                                        {characters.map(char => (
                                            <button
                                                key={char.id}
                                                className={`dropdown-item ${selectedCharacter?.id === char.id ? 'active' : ''}`}
                                                onClick={() => { setSelectedCharacter(char); setShowCharacterDropdown(false); }}
                                            >
                                                <User size={14} />
                                                <span>{char.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="visibility-options">
                        <label className={`visibility-chip ${!isPublic ? 'active' : ''}`} onClick={() => setIsPublic(false)}>
                            <Shield size={16} />
                            <span>Private</span>
                        </label>
                        <label className={`visibility-chip ${isPublic ? 'active' : ''}`} onClick={() => setIsPublic(true)}>
                            <Globe size={16} />
                            <span>Public Gallery</span>
                        </label>
                    </div>
                </div>

                <footer className="modal-footer">
                    {isUploading ? (
                        <div className="upload-status">
                            <Loader2 size={18} className="spin" />
                            <span>{status}</span>
                        </div>
                    ) : (
                        <>
                            <button className="btn-secondary" onClick={handleClose}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={handleUpload}
                                disabled={files.length === 0 || !prompt}
                            >
                                <Wand2 size={18} />
                                <span>Process & Save {files.length > 1 ? `(${files.length})` : ''}</span>
                            </button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );

    return createPortal(modalContent, document.getElementById('modal-root'));
}

