import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import GeneratorWizard from '../components/Generator/GeneratorWizard.jsx';
import '../components/Generator/Generator.css';
import { promptsApi } from '../services/api';

export default function Generator({ user }) {
    const location = useLocation();
    const [showWizard, setShowWizard] = useState(!!location.state?.initialSelections);
    const [initialSelections, setInitialSelections] = useState(location.state?.initialSelections || null);

    useEffect(() => {
        // 1. Check location state
        if (location.state?.initialSelections) {
            setInitialSelections(location.state.initialSelections);
            setShowWizard(true);
            window.history.replaceState({}, document.title);
            localStorage.removeItem('pending_template'); // Ensure backup is also cleared
        }
        // 2. Fallback to localStorage (survives refreshes or state loss)
        else {
            const saved = localStorage.getItem('pending_template');
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    setInitialSelections(data);
                    setShowWizard(true);
                    localStorage.removeItem('pending_template');
                } catch (e) {
                    localStorage.removeItem('pending_template');
                }
            }
        }
    }, [location.key]);

    const handleComplete = async (result) => {
        if (user) {
            try {
                await promptsApi.save(result.prompt, result.refined_tags, result.title);
            } catch (err) {
                console.error('Failed to save prompt to DB:', err);
            }
        } else {
            const saved = JSON.parse(localStorage.getItem('generated_prompts') || '[]');
            const newPrompt = {
                id: Date.now(),
                title: result.title,
                prompt: result.prompt,
                tags: result.refined_tags,
                createdAt: new Date().toISOString()
            };
            const updated = [newPrompt, ...saved];
            localStorage.setItem('generated_prompts', JSON.stringify(updated));
        }
        setShowWizard(false);
        setInitialSelections(null);
    };

    return (
        <div className="page-container animate-fade-in">
            <header className="page-header">
                <div>
                    <h1 className="title-gradient">Prompt Generator</h1>
                    <p className="subtitle">Craft the perfect AI prompt with Grok's intelligence</p>
                </div>
            </header>

            {!showWizard ? (
                <div className="wizard-intro glass">
                    <div className="wizard-icon-wrap">
                        <Wand2 size={48} className="wizard-icon" />
                    </div>
                    <h2>Start Your Creation</h2>
                    <p>
                        Our setup wizard will guide you through selecting the category, style, and details
                        for your next masterpiece. Grok will then weave your choices into a perfect prompt.
                    </p>
                    <button className="btn-primary large" onClick={() => setShowWizard(true)}>
                        Launch Setup Wizard
                    </button>
                </div>
            ) : (
                <GeneratorWizard
                    key={JSON.stringify(initialSelections || 'new-wizard')}
                    onComplete={handleComplete}
                    initialData={initialSelections}
                />
            )}
        </div>
    );
}
