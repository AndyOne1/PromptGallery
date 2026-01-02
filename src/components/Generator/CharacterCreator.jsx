import { useState, useRef, useEffect } from 'react';
import { User, Sparkles, Send, RefreshCcw, Check, AlertTriangle, Save, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { generateCharacterAttributes, refineCharacterAttributes, generateCharacterPrompt, analyzeImageForCharacter } from '../../services/openrouter';
import { charactersApi } from '../../services/api';
import { uploadToCloudinary } from '../../services/cloudinary';

const ATTRIBUTE_LABELS = {
    name: 'Name',
    age: 'Alter',
    gender: 'Geschlecht',
    hairColor: 'Haarfarbe',
    hairStyle: 'Haarstil',
    eyeColor: 'Augenfarbe',
    skinTone: 'Hautton',
    bodyType: 'Körperbau',
    height: 'Größe',
    facialFeatures: 'Gesichtszüge',
    style: 'Kleidungsstil',
    personality: 'Persönlichkeit',
    accessories: 'Accessoires',
    distinguishingMarks: 'Besondere Merkmale',
};

export default function CharacterCreator({ onComplete, user, initialMode = 'text' }) {
    const [phase, setPhase] = useState(initialMode === 'image' ? 'upload' : 'input'); // 'input', 'upload', 'refining', 'generating', 'saving'
    const [mode, setMode] = useState(initialMode); // 'text' or 'image'
    const [description, setDescription] = useState('');
    const [attributes, setAttributes] = useState(null);
    const [refinementText, setRefinementText] = useState('');
    const [finalPrompt, setFinalPrompt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const textareaRef = useRef(null);
    const refinementRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [description]);

    const getApiKey = () => localStorage.getItem('openrouter_key')?.trim();

    const handleCreatePrompt = async () => {
        const key = getApiKey();
        if (!key) {
            setError('Bitte hinterlege zuerst deinen OpenRouter API Key in den Einstellungen.');
            return;
        }
        if (!description.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await generateCharacterAttributes(key, description);
            setAttributes(result);
            setPhase('refining');
            setDescription('');
        } catch (err) {
            setError('Fehler bei der Generierung: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target.result);
        reader.readAsDataURL(file);

        setUploadedImage(file);
    };

    const handleAnalyzeImage = async () => {
        const key = getApiKey();
        if (!key) {
            setError('Bitte hinterlege zuerst deinen OpenRouter API Key in den Einstellungen.');
            return;
        }
        if (!uploadedImage) return;

        setIsLoading(true);
        setError(null);
        try {
            // Upload to Cloudinary first
            const cloudinaryUrl = await uploadToCloudinary(uploadedImage);

            // Analyze with vision model
            const result = await analyzeImageForCharacter(key, cloudinaryUrl);
            setAttributes(result);
            setPhase('refining');
        } catch (err) {
            setError('Fehler bei der Bildanalyse: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefinement = async () => {
        const key = getApiKey();
        if (!key || !refinementText.trim()) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await refineCharacterAttributes(key, attributes, refinementText);
            setAttributes(result);
            setRefinementText('');
        } catch (err) {
            setError('Fehler bei der Aktualisierung: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateCharacter = async () => {
        const key = getApiKey();
        if (!key || !attributes) return;

        setPhase('generating');
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateCharacterPrompt(key, attributes);
            setFinalPrompt(result);
            setPhase('saving');
        } catch (err) {
            setError('Fehler bei der Prompt-Generierung: ' + err.message);
            setPhase('refining');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveCharacter = async () => {
        if (!user) {
            // Save to localStorage for non-logged-in users
            const saved = JSON.parse(localStorage.getItem('local_characters') || '[]');
            const newChar = {
                id: Date.now(),
                name: attributes.name,
                attributes,
                prompt: finalPrompt?.prompt,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('local_characters', JSON.stringify([newChar, ...saved]));
            onComplete?.(newChar);
            return;
        }

        setIsLoading(true);
        try {
            const newChar = await charactersApi.create({
                name: attributes.name,
                attributes,
                prompt: finalPrompt?.prompt
            });
            onComplete?.(newChar);
        } catch (err) {
            setError('Fehler beim Speichern: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderInputPhase = () => (
        <div className="character-input-phase">
            <div className="character-input-area">
                <textarea
                    ref={textareaRef}
                    className="magic-input"
                    placeholder="Beschreibe deinen Charakter... (z.B. 'Eine mysteriöse Hexe mit silbernem Haar und violetten Augen')"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                />
                <div className="input-actions">
                    <button
                        className="btn-primary-round"
                        onClick={handleCreatePrompt}
                        disabled={!description.trim() || isLoading}
                    >
                        {isLoading ? <Loader2 className="spin" size={20} /> : <Sparkles size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderUploadPhase = () => (
        <div className="character-upload-phase">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
            />

            {!imagePreview ? (
                <div
                    className="upload-dropzone glass"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Upload size={48} className="text-accent" />
                    <p>Klicke hier oder ziehe ein Bild hierher</p>
                    <span className="text-dim">JPG, PNG, WebP bis 10MB</span>
                </div>
            ) : (
                <div className="upload-preview">
                    <img src={imagePreview} alt="Preview" className="preview-image" />
                    <div className="preview-actions">
                        <button
                            className="btn-secondary"
                            onClick={() => {
                                setImagePreview(null);
                                setUploadedImage(null);
                            }}
                        >
                            <RefreshCcw size={16} />
                            <span>Anderes Bild</span>
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleAnalyzeImage}
                            disabled={isLoading}
                        >
                            {isLoading ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
                            <span>Charakter analysieren</span>
                        </button>
                    </div>
                </div>
            )}

            <button
                className="btn-link mt-4"
                onClick={() => {
                    setMode('text');
                    setPhase('input');
                }}
            >
                ← Oder beschreibe den Charakter manuell
            </button>
        </div>
    );

    const renderAttributesTable = () => (
        <div className="character-attributes-table glass">
            <h3>Charakter-Attribute</h3>
            <div className="attributes-grid">
                {Object.entries(attributes || {}).map(([key, value]) => (
                    <div key={key} className="attribute-row">
                        <span className="attribute-label">{ATTRIBUTE_LABELS[key] || key}:</span>
                        <span className="attribute-value">{value || '—'}</span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderRefiningPhase = () => (
        <div className="character-refining-phase">
            {renderAttributesTable()}

            <div className="refinement-input-area glass">
                <input
                    ref={refinementRef}
                    type="text"
                    className="refinement-input"
                    placeholder="Was möchtest du anpassen?"
                    value={refinementText}
                    onChange={(e) => setRefinementText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRefinement()}
                    disabled={isLoading}
                />
                <button
                    className="btn-secondary"
                    onClick={handleRefinement}
                    disabled={!refinementText.trim() || isLoading}
                >
                    {isLoading ? <Loader2 className="spin" size={16} /> : <RefreshCcw size={16} />}
                    <span>Update</span>
                </button>
            </div>

            <button
                className="btn-primary large generate-btn"
                onClick={handleGenerateCharacter}
                disabled={isLoading}
            >
                <Sparkles size={20} />
                <span>Generate Character</span>
            </button>
        </div>
    );

    const renderSavingPhase = () => (
        <div className="character-saving-phase">
            {renderAttributesTable()}

            <div className="final-prompt-preview glass">
                <h3>Generierter Character Prompt</h3>
                <p className="prompt-text">{finalPrompt?.prompt}</p>
                {finalPrompt?.summary && (
                    <p className="prompt-summary text-dim">{finalPrompt.summary}</p>
                )}
            </div>

            <button
                className="btn-primary large save-btn"
                onClick={handleSaveCharacter}
                disabled={isLoading}
            >
                {isLoading ? <Loader2 className="spin" size={20} /> : <Save size={20} />}
                <span>Charakter speichern</span>
            </button>
        </div>
    );

    return (
        <div className="character-creator-container glass animate-fade-in">
            <header className="character-header">
                <div className="character-title-wrap">
                    <User className="text-accent" size={24} />
                    <h2>Character Creator</h2>
                </div>
                {(phase !== 'input' && phase !== 'upload') && (
                    <button className="btn-secondary small" onClick={() => {
                        setPhase(mode === 'image' ? 'upload' : 'input');
                        setAttributes(null);
                        setFinalPrompt(null);
                        setDescription('');
                        setImagePreview(null);
                        setUploadedImage(null);
                    }}>
                        <RefreshCcw size={14} />
                        <span>Neu starten</span>
                    </button>
                )}
            </header>

            {error && (
                <div className="error-banner glass">
                    <AlertTriangle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {phase === 'input' && renderInputPhase()}
            {phase === 'upload' && renderUploadPhase()}
            {phase === 'refining' && renderRefiningPhase()}
            {(phase === 'generating' || phase === 'saving') && renderSavingPhase()}

            {phase === 'generating' && isLoading && (
                <div className="generating-overlay">
                    <Loader2 className="spin" size={48} />
                    <p>Generiere Character Prompt...</p>
                </div>
            )}

            {!getApiKey() && (
                <div className="api-warning-banner glass mt-4">
                    <AlertTriangle size={18} />
                    <span>API Key fehlt in den Einstellungen!</span>
                </div>
            )}
        </div>
    );
}
