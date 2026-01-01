import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Wand2 } from 'lucide-react';
import GeneratorWizard from '../components/Generator/GeneratorWizard.jsx';
import '../components/Generator/Generator.css';

export default function Generator() {
    const location = useLocation();
    const [showWizard, setShowWizard] = useState(false);
    const [initialSelections, setInitialSelections] = useState(null);

    useEffect(() => {
        if (location.state?.initialSelections) {
            setInitialSelections(location.state.initialSelections);
            setShowWizard(true);
        }
    }, [location]);

    const handleComplete = (result) => {
        const saved = JSON.parse(localStorage.getItem('generated_prompts') || '[]');
        const newPrompt = {
            id: Date.now(),
            prompt: result.prompt,
            tags: result.refined_tags,
            createdAt: new Date().toISOString()
        };
        const updated = [newPrompt, ...saved];
        localStorage.setItem('generated_prompts', JSON.stringify(updated));

        // We could redirect or show a success message here
        // For now, let's just stay on the result step in the wizard
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
                <GeneratorWizard onComplete={handleComplete} initialData={initialSelections} />
            )}
        </div>
    );
}
