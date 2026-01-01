import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Wand2, Sparkles } from 'lucide-react';
import GeneratorWizard from '../components/Generator/GeneratorWizard.jsx';
import SmartGenerator from '../components/Generator/SmartGenerator.jsx';
import '../components/Generator/Generator.css';
import { promptsApi } from '../services/api';

export default function Generator({ user }) {
    const location = useLocation();
    const [mode, setMode] = useState(location.state?.initialSelections ? 'wizard' : 'intro'); // 'intro', 'wizard', 'smart'
    const [initialSelections, setInitialSelections] = useState(location.state?.initialSelections || null);

    useEffect(() => {
        // 1. Check location state
        if (location.state?.initialSelections) {
            setInitialSelections(location.state.initialSelections);
            setMode('wizard');
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
                    setMode('wizard');
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
        const updated = [newPrompt, ...saved];
        localStorage.setItem('generated_prompts', JSON.stringify(updated));
    }
    setMode('intro');
    setInitialSelections(null);
};

const renderContent = () => {
    if (mode === 'wizard') {
        return (
            <GeneratorWizard
                key={JSON.stringify(initialSelections || 'new-wizard')}
                onComplete={handleComplete}
                initialData={initialSelections}
            />
        );
    }

    if (mode === 'smart') {
        return <SmartGenerator onComplete={handleComplete} />;
    }

    return (
        <div className="wizard-intro glass">
            <div className="wizard-icon-wrap">
                <Wand2 size={48} className="wizard-icon" />
            </div>
            <h2>Start Your Creation</h2>
            <p>
                Choose how you want to create your masterpiece. Use our step-by-step wizard or tell the AI exactly what you want.
            </p>
            <div className="flex-row gap-4 mt-8 flex-wrap justify-center">
                <button className="btn-primary large" onClick={() => setMode('wizard')}>
                    <Wand2 size={20} />
                    Launch Setup Wizard
                </button>
                <button className="btn-secondary large" onClick={() => setMode('smart')}>
                    <Sparkles size={20} className="text-accent" />
                    Tell AI what you want
                </button>
            </div>
        </div>
    );
};

return (
    <div className="page-container animate-fade-in">
        <header className="page-header">
            <div>
                <h1 className="title-gradient">Prompt Generator</h1>
                <p className="subtitle">Craft the perfect AI prompt with Grok's intelligence</p>
            </div>
        </header>

        {renderContent()}
    </div>
);
}
