import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Loader2, Wand2 } from 'lucide-react';
import { uploadToCloudinary } from '../../services/cloudinary';
import { analyzePrompt } from '../../services/openrouter';
import { compressImage } from '../../utils/imageUtils';

export default function UploadModal({ isOpen, onClose, onUploadComplete }) {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState('');

    const onDrop = useCallback(acceptedFiles => {
        const selectedFile = acceptedFiles[0];
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    const handleUpload = async () => {
        if (!file || !prompt) return;

        // Get API keys from localStorage (for now)
        const openRouterKey = localStorage.getItem('openrouter_key');
        const cloudName = localStorage.getItem('cloudinary_name');
        const uploadPreset = localStorage.getItem('cloudinary_preset');

        if (!openRouterKey || !cloudName || !uploadPreset) {
            alert('Please set your API keys in Settings first!');
            return;
        }

        setIsUploading(true);
        setStatus('Optimizing image...');

        try {
            // 1. Compress Image
            const compressedBlob = await compressImage(file);
            const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                type: 'image/jpeg'
            });

            setStatus('Uploading image...');
            // 2. Upload to Cloudinary
            const cloudData = await uploadToCloudinary(compressedFile, cloudName, uploadPreset);

            setStatus('Analyzing with AI...');
            // 2. Analyze with OpenRouter
            const analysis = await analyzePrompt(openRouterKey, prompt);

            // 3. Complete
            const imageData = {
                id: Date.now(),
                url: cloudData.secure_url,
                prompt: prompt,
                tags: analysis.tags,
                description: analysis.description,
                createdAt: new Date().toISOString()
            };

            onUploadComplete(imageData);
            onClose();
            // Reset
            setFile(null);
            setPreview(null);
            setPrompt('');
        } catch (error) {
            alert('Upload failed: ' + error.message);
        } finally {
            setIsUploading(false);
            setStatus('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass animate-fade-in">
                <header className="modal-header">
                    <h3>Upload to Gallery</h3>
                    <button className="btn-icon" onClick={onClose}><X size={20} /></button>
                </header>

                <div className="modal-body">
                    {!preview ? (
                        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
                            <input {...getInputProps()} />
                            <Upload size={32} />
                            <p>{isDragActive ? "Drop it here!" : "Drag & drop an image, or click to select"}</p>
                        </div>
                    ) : (
                        <div className="preview-container">
                            <img src={preview} alt="Preview" className="image-preview" />
                            <button className="btn-small remove-btn" onClick={() => { setFile(null); setPreview(null); }}>Change Image</button>
                        </div>
                    )}

                    <div className="input-group">
                        <label>Prompt used for this image</label>
                        <textarea
                            placeholder="Paste the prompt you used to generate this image..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={4}
                        />
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
                            <button className="btn-secondary" onClick={onClose}>Cancel</button>
                            <button
                                className="btn-primary"
                                onClick={handleUpload}
                                disabled={!file || !prompt}
                            >
                                <Wand2 size={18} />
                                <span>Process & Save</span>
                            </button>
                        </>
                    )}
                </footer>
            </div>
        </div>
    );
}
