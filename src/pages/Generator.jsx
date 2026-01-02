import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Wand2, Sparkles, User } from 'lucide-react';
import GeneratorWizard from '../components/Generator/GeneratorWizard.jsx';
import SmartGenerator from '../components/Generator/SmartGenerator.jsx';
import CharacterCreator from '../components/Generator/CharacterCreator.jsx';
import '../components/Generator/Generator.css';
import { promptsApi } from '../services/api';

export default function Generator({ user }) {
    const location = useLocation();
    const [mode, setMode] = useState(location.state?.initialSelections ? 'wizard' : 'intro'); // 'intro', 'wizard', 'smart', 'character'
    const [initialSelections, setInitialSelections] = useState(location.state?.initialSelections || null);

    useEffect(() => {
        // 1. Handle character mode from navigation
        if (location.state?.mode === 'character') {
            setMode('character');
            window.history.replaceState({}, document.title);
            return;
        }
        if (location.state?.mode === 'character-from-image') {
            setMode('character-from-image');
            window.history.replaceState({}, document.title);
            return;
        }

        // 2. Check location state for wizard
        if (location.state?.initialSelections) {
            setInitialSelections(location.state.initialSelections);
            setMode('wizard');
            window.history.replaceState({}, document.title);
            localStorage.removeItem('pending_template'); // Ensure backup is also cleared
        }
        // 3. Fallback to localStorage (survives refreshes or state loss)
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
        setMode('intro');
        setInitialSelections(null);
    };

    const handleCharacterComplete = (character) => {
        setMode('intro');
        // Could navigate to characters page or show success
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
            return <SmartGenerator
                onComplete={handleComplete}
                user={user}
                initialCharacter={location.state?.preSelectedCharacter}
            />;
        }

        if (mode === 'character') {
            return <CharacterCreator onComplete={handleCharacterComplete} user={user} initialMode="text" />;
        }

        if (mode === 'character-from-image') {
            return <CharacterCreator onComplete={handleCharacterComplete} user={user} initialMode="image" />;
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
                    <button className="btn-primary large" onClick={() => setMode('smart')}>
                        <Sparkles size={20} />
                        Tell AI what you want
                    </button>
                    <button className="btn-primary large" onClick={() => setMode('character')}>
                        <User size={20} />
                        Character Creator
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

