import { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Loader2, Wand2, Globe, Shield } from 'lucide-react';
import { uploadToCloudinary } from '../../services/cloudinary';
import { analyzePrompt } from '../../services/openrouter';
import { compressImage } from '../../utils/imageUtils';
import { galleryApi } from '../../services/api';
import { useData } from '../../context/DataContext';
import { normalizePromptText } from '../../utils/stringUtils';

export default function UploadModal({ isOpen, onClose, onUploadComplete, initialPrompt = '', initialTags = [] }) {
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [prompt, setPrompt] = useState(initialPrompt);
    const [isPublic, setIsPublic] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState('');
    const { privateImages } = useData();

    useEffect(() => {
        if (isOpen) {
            setPrompt(initialPrompt);
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }
        return () => document.body.classList.remove('modal-open');
    }, [isOpen, initialPrompt]);

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
            const finalTags = initialTags.length > 0 ? initialTags : analysis.tags;
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

            onUploadComplete(Array.isArray(savedItems) ? savedItems[0] : savedItems);
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
