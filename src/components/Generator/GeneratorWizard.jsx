import { useState, useEffect } from 'react';
import { WIZARD_DATA } from '../../data/wizard';
import { generateFinalPrompt } from '../../services/openrouter';
import { ChevronDown, ChevronRight, ChevronLeft, Wand2, Check, RefreshCcw, Save, Trash2, Eye, Shield, AlertTriangle, Loader2, Hash } from 'lucide-react';

const GeneratorWizard = ({ onComplete, initialData }) => {
    const isTemplateMode = !!initialData;
    const [currentStepId, setCurrentStepId] = useState(initialData ? 'finish' : 'root');
    const [history, setHistory] = useState([]);
    const [selections, setSelections] = useState({}); // { stepId: value(s) }
    const [useReference, setUseReference] = useState(false);
    const [customInstruction, setCustomInstruction] = useState('');
    const [templates, setTemplates] = useState(() => {
        const saved = localStorage.getItem('instruction_templates');
        return saved ? JSON.parse(saved) : [];
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [openSections, setOpenSections] = useState(() => {
        if (initialData) {
            const initial = ['tags'];
            if (initialData.originalPrompt) initial.push('reference');
            return initial;
        }
        return ['info'];
    });
    const [safetyLevel, setSafetyLevel] = useState('sfw');

    const currentStep = WIZARD_DATA.steps[currentStepId];

    useEffect(() => {
        const setupTemplateData = async () => {
            if (isTemplateMode) {
                setResult(null);
                setCurrentStepId('finish');

                if (initialData.useReference) setUseReference(true);

                // For template mode, we don't need heavy analysis of 19 steps anymore.
                // We just prepare the UI for manual refinement.
                const initialOpen = ['info', 'tags'];
                if (initialData.originalPrompt) initialOpen.push('reference');
                setOpenSections(initialOpen);
            }
        };

        setupTemplateData();
    }, [initialData, isTemplateMode]);

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

    const handleMultiSelect = (stepId, sectionName, optionValue, isSelected, option) => {
        if (option?.is_reference_toggle) {
            setUseReference(isSelected);
        }

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
            originalPrompt: initialData?.originalPrompt,
            safetyLevel,
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
            const toggleSection = (id) => {
                setOpenSections(prev =>
                    prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
                );
            };

            return (
                <div className="wizard-step finish-step">
                    <header className="step-header-with-status">
                        <h3>{isTemplateMode ? 'Template-Refinement' : 'Review & Refine'}</h3>
                        {isAnalyzing && (
                            <div className="analyzing-badge glass animate-pulse">
                                <Loader2 size={14} className="spin" />
                                <span>Grok is analyzing image...</span>
                            </div>
                        )}
                    </header>

                    <div className="review-accordion">
                        {/* 1. CONTENT SAFETY PRESETS */}
                        <div className={`accordion-row glass ${openSections.includes('safety') ? 'open' : ''}`}>
                            <header className="accordion-trigger" onClick={() => toggleSection('safety')}>
                                <div className="trigger-label">
                                    <Shield size={16} />
                                    <span>Content Safety & Style</span>
                                </div>
                                <div className="trigger-status">
                                    <span className={`status-chip ${safetyLevel}`}>{safetyLevel === 'nsfw_bypass' ? 'Bypassing' : safetyLevel.toUpperCase()}</span>
                                    <ChevronDown size={18} className="icon-arrow" />
                                </div>
                            </header>
                            <div className="accordion-content">
                                <div className="safety-grid">
                                    <button className={`safety-card ${safetyLevel === 'sfw' ? 'active' : ''}`} onClick={() => setSafetyLevel('sfw')}>
                                        <Check size={20} className="check-icon" />
                                        <Eye size={24} />
                                        <div className="safety-info">
                                            <span className="name">SFW (Clean)</span>
                                            <span className="desc">No provocative elements</span>
                                        </div>
                                    </button>
                                    <button className={`safety-card nsfw ${safetyLevel === 'nsfw' ? 'active' : ''}`} onClick={() => setSafetyLevel('nsfw')}>
                                        <Check size={20} className="check-icon" />
                                        <AlertTriangle size={24} />
                                        <div className="safety-info">
                                            <span className="name">NSFW (Explicit)</span>
                                            <span className="desc">Direct descriptions</span>
                                        </div>
                                    </button>
                                    <button className={`safety-card bypass ${safetyLevel === 'nsfw_bypass' ? 'active' : ''}`} onClick={() => setSafetyLevel('nsfw_bypass')}>
                                        <Check size={20} className="check-icon" />
                                        <RefreshCcw size={24} />
                                        <div className="safety-info">
                                            <span className="name">NSFW (Safe Bypass)</span>
                                            <span className="desc">Artistic circumlocution</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 1.5 REFERENCE PROMPT (READ ONLY) */}
                        {initialData?.originalPrompt && (
                            <div className={`accordion-row glass ${openSections.includes('reference') ? 'open' : ''}`}>
                                <header className="accordion-trigger" onClick={() => toggleSection('reference')}>
                                    <div className="trigger-label">
                                        <Hash size={16} />
                                        <span>Reference Prompt</span>
                                    </div>
                                    <div className="trigger-status">
                                        <span className="status-dot active"></span>
                                        <ChevronDown size={18} className="icon-arrow" />
                                    </div>
                                </header>
                                <div className="accordion-content">
                                    <div className="reference-prompt-view glass">
                                        <p>{initialData.originalPrompt}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 2. EXTRA INSTRUCTIONS */}
                        <div className={`accordion-row glass ${openSections.includes('info') ? 'open' : ''}`}>
                            <header className="accordion-trigger" onClick={() => toggleSection('info')}>
                                <div className="trigger-label">
                                    <Wand2 size={16} />
                                    <span>{isTemplateMode ? 'Was möchtest du ändern?' : 'Extra Anweisungen & Templates'}</span>
                                </div>
                                <div className="trigger-status">
                                    {customInstruction ? <span className="status-dot active"></span> : null}
                                    <ChevronDown size={18} className="icon-arrow" />
                                </div>
                            </header>
                            <div className="accordion-content">
                                <div className="instruction-section-embedded">
                                    <header className="section-header">
                                        <button className="btn-icon-tiny" onClick={handleSaveTemplate} title="Als Template speichern" disabled={!customInstruction}>
                                            <Save size={14} />
                                        </button>
                                    </header>
                                    <textarea
                                        className={`instruction-input ${isTemplateMode ? 'template-highlight' : ''}`}
                                        placeholder={isTemplateMode ? "Beschreibe hier deine Änderungen (z.B. Hintergrund zu Dschungel, Kleidung zu schwarz)..." : "z.B. 'Füge einen roten Schal hinzu'..."}
                                        value={customInstruction}
                                        onChange={(e) => setCustomInstruction(e.target.value)}
                                    />
                                    {templates.length > 0 && (
                                        <div className="templates-container mini">
                                            {templates.map((tpl, i) => (
                                                <button key={i} className="template-chip glass" onClick={() => handleLoadTemplate(tpl.content)}>
                                                    <span>{tpl.name}</span>
                                                    <Trash2 size={12} className="delete-icon" onClick={(e) => handleDeleteTemplate(e, i)} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 2.5 ACCUMULATED TAGS */}
                        <div className={`accordion-row glass ${openSections.includes('tags') ? 'open' : ''}`}>
                            <header className="accordion-trigger" onClick={() => toggleSection('tags')}>
                                <div className="trigger-label">
                                    <Eye size={16} />
                                    <span>Vorschau Tags ({getAccumulatedTags().length})</span>
                                </div>
                                <div className="trigger-status">
                                    <ChevronDown size={18} className="icon-arrow" />
                                </div>
                            </header>
                            <div className="accordion-content">
                                <div className="tag-cloud small">
                                    {getAccumulatedTags().map((tag, i) => (
                                        <span key={i} className="tag-chip">{tag}</span>
                                    ))}
                                    {getAccumulatedTags().length === 0 && (
                                        <span className="opacity-50">Noch keine Tags gesammelt...</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 3. WIZARD STEPS REVIEW - ONLY SHOW IN REGULAR MODE OR IF HISTORY EXISTS */}
                        {!isTemplateMode && history.length > 0 && (
                            <div className="review-steps-header">
                                <span>Wizard Selections</span>
                                <small>Click to adjust any step</small>
                            </div>
                        )}

                        {!isTemplateMode && history.map(stepId => {
                            const step = WIZARD_DATA.steps[stepId];
                            if (!step) return null;
                            const sel = selections[stepId];
                            const isOpen = openSections.includes(stepId);

                            return (
                                <div key={stepId} className={`accordion-row step-row glass ${isOpen ? 'open' : ''}`}>
                                    <header className="accordion-trigger" onClick={() => toggleSection(stepId)}>
                                        <div className="trigger-label">
                                            <span>{step.question}</span>
                                        </div>
                                        <div className="trigger-status">
                                            <span className="selection-summary">
                                                {step.multi_select
                                                    ? `${Object.values(sel || {}).flat().length} Selected`
                                                    : sel?.label || 'Skipped'}
                                            </span>
                                            <ChevronDown size={18} className="icon-arrow" />
                                        </div>
                                    </header>
                                    <div className="accordion-content overflow-visible">
                                        {step.multi_select ? (
                                            <div className="step-options-container">
                                                {step.sections.map(section => (
                                                    <div key={section.name} className="mini-options-group">
                                                        <label>{section.name}</label>
                                                        <div className="options-flex wrap">
                                                            {section.options.map(opt => {
                                                                const isSelected = sel?.[section.name]?.includes(opt.value);
                                                                return (
                                                                    <button
                                                                        key={opt.value}
                                                                        className={`mini-chip ${isSelected ? 'active' : ''}`}
                                                                        onClick={() => handleMultiSelect(stepId, section.name, opt.value, !isSelected, opt)}
                                                                    >
                                                                        {opt.label}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="options-flex wrap">
                                                {step.options.map(opt => (
                                                    <button
                                                        key={opt.value}
                                                        className={`mini-chip ${sel?.value === opt.value ? 'active' : ''}`}
                                                        onClick={() => handleSingleSelect(opt)}
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* 4. REFERENCE TOGGLE */}
                        <div className="review-section glass compact-row mt-4">
                            <label style={{ marginBottom: 0 }}>Reference Image</label>
                            <label className="toggle-label glass">
                                <input type="checkbox" checked={useReference} onChange={(e) => setUseReference(e.target.checked)} />
                                <span>Use as Subject Identity</span>
                            </label>
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
                        <h4 className="result-title title-gradient">{result?.title}</h4>
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
                                            onClick={() => handleMultiSelect(currentStepId, section.name, opt.value, !isSelected, opt)}
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
            {currentStepId !== 'result' && !isTemplateMode && (
                <div className="wizard-progress">
                    <div className="progress-bar" style={{ width: `${Math.min((history.length / 12) * 100, 100)}%` }}></div>
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
                        {currentStepId !== 'finish' && !isTemplateMode && (
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
