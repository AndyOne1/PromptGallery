import { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Wand2, Check, RefreshCcw, Save, Trash2 } from 'lucide-react';
import { WIZARD_DATA } from '../../data/wizard';
import { generateFinalPrompt } from '../../services/openrouter';

const GeneratorWizard = ({ onComplete, initialData }) => {
    const [currentStepId, setCurrentStepId] = useState('root');
    const [history, setHistory] = useState([]);
    const [selections, setSelections] = useState({}); // { stepId: value(s) }
    const [useReference, setUseReference] = useState(false);
    const [customInstruction, setCustomInstruction] = useState('');
    const [templates, setTemplates] = useState(() => {
        const saved = localStorage.getItem('instruction_templates');
        return saved ? JSON.parse(saved) : [];
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState(null);

    const currentStep = WIZARD_DATA.steps[currentStepId];

    useEffect(() => {
        if (initialData) {
            setResult(null);
            setCurrentStepId('finish');
            if (initialData.useReference) setUseReference(true);
        }
    }, [initialData]);

    useEffect(() => {
        localStorage.setItem('instruction_templates', JSON.stringify(templates));
    }, [templates]);

    const handleSingleSelect = (option) => {
        if (option.is_reference_toggle) {
            setUseReference(true);
        } else if (currentStepId === 'step_subject_base') {
            setUseReference(false);
        }

        setSelections(prev => ({ ...prev, [currentStepId]: option }));

        if (option.next_step_id === 'finish') {
            setHistory([...history, currentStepId]);
            setCurrentStepId('finish');
        } else {
            setHistory([...history, currentStepId]);
            setCurrentStepId(option.next_step_id);
        }
    };

    const handleMultiSelect = (stepId, sectionName, optionValue, isSelected) => {
        setSelections(prev => {
            const currentStepSelections = prev[stepId] || {};
            const sectionSelections = currentStepSelections[sectionName] || [];

            let newSectionSelections;
            if (isSelected) {
                newSectionSelections = [...sectionSelections, optionValue];
            } else {
                newSectionSelections = sectionSelections.filter(v => v !== optionValue);
            }

            return {
                ...prev,
                [stepId]: {
                    ...currentStepSelections,
                    [sectionName]: newSectionSelections
                }
            };
        });
    };

    const nextStep = () => {
        if (currentStep.next_step_id === 'finish') {
            setHistory([...history, currentStepId]);
            setCurrentStepId('finish');
        } else {
            setHistory([...history, currentStepId]);
            setCurrentStepId(currentStep.next_step_id);
        }
    };

    const prevStep = () => {
        if (history.length === 0) return;
        const newHistory = [...history];
        const lastStepId = newHistory.pop();
        setHistory(newHistory);
        setCurrentStepId(lastStepId);
    };

    const getAccumulatedTags = () => {
        let tags = [];
        const fullPath = [...history];

        fullPath.forEach(stepId => {
            const step = WIZARD_DATA.steps[stepId];
            const selection = selections[stepId];
            if (!selection) return;

            if (step.multi_select) {
                step.sections.forEach(section => {
                    const selectedValues = selection[section.name] || [];
                    section.options.forEach(opt => {
                        if (selectedValues.includes(opt.value)) {
                            tags = [...tags, ...(Array.isArray(opt.output_tags) ? opt.output_tags : [opt.output_tags])];
                        }
                    });
                });
            } else {
                tags = [...tags, ...(Array.isArray(selection.output_tags) ? selection.output_tags : [])];
            }
        });

        if (initialData?.tags) {
            tags = [...tags, ...initialData.tags];
        }

        return [...new Set(tags)].filter(Boolean);
    };

    const handleGenerate = async () => {
        const key = localStorage.getItem('openrouter_key');
        if (!key) return;

        const allTags = getAccumulatedTags();
        const finalSelections = {
            tags: allTags,
            useReference,
            customInstruction,
            rawSelections: selections
        };

        setIsGenerating(true);
        try {
            const data = await generateFinalPrompt(key, finalSelections);
            setResult(data);
            setCurrentStepId('result');
        } catch (error) {
            alert('Generation failed: ' + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSaveTemplate = () => {
        if (!customInstruction.trim()) return;
        const name = prompt('Name für dieses Template:');
        if (name) {
            setTemplates([...templates, { name, content: customInstruction }]);
        }
    };

    const handleLoadTemplate = (content) => {
        setCustomInstruction(prev => prev ? `${prev} ${content}` : content);
    };

    const handleDeleteTemplate = (e, index) => {
        e.stopPropagation();
        setTemplates(templates.filter((_, i) => i !== index));
    };

    const renderStepContent = () => {
        if (currentStepId === 'finish') {
            return (
                <div className="wizard-step finish-step">
                    <h3>Review & Refine</h3>

                    <div className="review-dashboard">
                        {/* Summary of choices */}
                        <div className="summary-grid">
                            {history.slice(-4).map(stepId => {
                                const step = WIZARD_DATA.steps[stepId];
                                const sel = selections[stepId];
                                if (!sel) return null;
                                return (
                                    <div key={stepId} className="summary-item glass">
                                        <label>{step.question}</label>
                                        <span>{step.multi_select ? 'Multiple' : sel.label}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Custom Instruction Section */}
                        <div className="instruction-section glass">
                            <header className="section-header">
                                <label>Extra Anweisungen für Grok</label>
                                <button className="btn-icon-tiny" onClick={handleSaveTemplate} title="Als Template speichern" disabled={!customInstruction}>
                                    <Save size={14} />
                                </button>
                            </header>
                            <textarea
                                className="instruction-input"
                                placeholder="z.B. 'Füge einen roten Schal hinzu' oder 'Ganzkörper-Aufnahme'..."
                                value={customInstruction}
                                onChange={(e) => setCustomInstruction(e.target.value)}
                            />

                            {templates.length > 0 && (
                                <div className="templates-container">
                                    <div className="templates-scroll">
                                        {templates.map((tpl, i) => (
                                            <button
                                                key={i}
                                                className="template-chip glass"
                                                onClick={() => handleLoadTemplate(tpl.content)}
                                            >
                                                <span>{tpl.name}</span>
                                                <Trash2 size={12} className="delete-icon" onClick={(e) => handleDeleteTemplate(e, i)} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Reference Image Toggle */}
                        <div className="review-section glass compact-row">
                            <label style={{ marginBottom: 0 }}>Reference Image</label>
                            <label className="toggle-label glass">
                                <input type="checkbox" checked={useReference} onChange={(e) => setUseReference(e.target.checked)} />
                                <span>Use as Subject</span>
                            </label>
                        </div>

                        {/* Tag Cloud */}
                        <div className="review-section glass">
                            <label>Accumulated Tags</label>
                            <div className="tag-cloud small">
                                {getAccumulatedTags().slice(0, 15).map((tag, i) => (
                                    <span key={i} className="tag-chip">{tag}</span>
                                ))}
                                {getAccumulatedTags().length > 15 && <span className="tag-chip opacity-50">+{getAccumulatedTags().length - 15} mehr...</span>}
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (currentStepId === 'result') {
            return (
                <div className="wizard-step result animate-fade-in">
                    <div className="success-icon"><Check size={32} /></div>
                    <h3>Your Prompt is Ready!</h3>
                    <div className="result-card glass">
                        <p className="final-prompt">{result?.prompt}</p>
                        <div className="result-tags">
                            {result?.refined_tags?.map(tag => <span key={tag} className="tag">{tag}</span>)}
                        </div>
                    </div>
                    <div className="result-actions">
                        <button className="btn-secondary" onClick={() => {
                            setSelections({});
                            setHistory([]);
                            setCustomInstruction('');
                            setCurrentStepId('root');
                        }}>
                            <RefreshCcw size={18} />
                            <span>Start Again</span>
                        </button>
                        <button className="btn-primary" onClick={() => onComplete(result)}>
                            <span>Save to Prompts</span>
                        </button>
                    </div>
                </div>
            );
        }

        if (!currentStep) return null;

        if (currentStep.multi_select) {
            return (
                <div className="wizard-step">
                    <h3 className="mb-8">{currentStep.question}</h3>
                    {currentStep.sections.map(section => (
                        <div key={section.name} className="env-group mb-8">
                            <label className="group-label">{section.name}</label>
                            <div className="options-flex">
                                {section.options.map(opt => {
                                    const isSelected = selections[currentStepId]?.[section.name]?.includes(opt.value);
                                    return (
                                        <button
                                            key={opt.value}
                                            className={`chip ${isSelected ? 'active' : ''}`}
                                            onClick={() => handleMultiSelect(currentStepId, section.name, opt.value, !isSelected)}
                                        >
                                            {opt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="wizard-step">
                <h3>{currentStep.question}</h3>
                <div className="options-grid">
                    {currentStep.options.map(opt => (
                        <button
                            key={opt.value}
                            className={`option-card ${selections[currentStepId]?.value === opt.value ? 'active' : ''}`}
                            onClick={() => handleSingleSelect(opt)}
                        >
                            <span className="option-label">{opt.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    const isStepComplete = () => {
        if (!currentStep) return true;
        if (currentStep.multi_select) {
            const stepSel = selections[currentStepId] || {};
            return Object.values(stepSel).some(vals => vals.length > 0);
        }
        return selections[currentStepId] !== undefined;
    };

    return (
        <div className="wizard-container glass animate-fade-in">
            {currentStepId !== 'result' && (
                <div className="wizard-progress">
                    <div className="progress-bar" style={{ width: `${(history.length / 15) * 100}%` }}></div>
                    <span className="step-count">Step {history.length + 1}</span>
                </div>
            )}

            <div className="wizard-content">
                {renderStepContent()}
            </div>

            {currentStepId !== 'result' && (
                <footer className="wizard-footer">
                    <button className="btn-secondary" onClick={prevStep} disabled={history.length === 0 || isGenerating}>
                        <ChevronLeft size={18} /> Back
                    </button>

                    <div className="wizard-actions-right">
                        {currentStepId !== 'finish' && (
                            <button className="btn-secondary btn-skip" onClick={nextStep} disabled={isGenerating}>
                                Skip
                            </button>
                        )}

                        {currentStepId === 'finish' ? (
                            <button className="btn-primary" onClick={handleGenerate} disabled={isGenerating}>
                                {isGenerating ? <RefreshCcw size={18} className="spin" /> : <Wand2 size={18} />}
                                {isGenerating ? 'Generating...' : 'Generate Prompt'}
                            </button>
                        ) : (
                            <button className="btn-primary" onClick={nextStep} disabled={!isStepComplete()}>
                                Next <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </footer>
            )}
        </div>
    );
};

export default GeneratorWizard;
