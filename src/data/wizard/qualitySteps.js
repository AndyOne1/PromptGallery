export const qualitySteps = {
    step_quality_composition: {
        id: 'step_quality_composition',
        question: 'Komposition & Qualität',
        multi_select: true,
        sections: [
            {
                name: 'Komposition',
                options: [
                    { label: 'Zentriert', value: 'centered', output_tags: ['centered composition', 'symmetrical'] },
                    { label: 'Drittel-Regel', value: 'thirds', output_tags: ['rule of thirds', 'balanced composition'] },
                    { label: 'Goldener Schnitt', value: 'golden_ratio', output_tags: ['golden ratio composition'] },
                    { label: 'Vordergrund-Fokus', value: 'foreground', output_tags: ['strong foreground element'] },
                    { label: 'Leading Lines', value: 'lines', output_tags: ['leading lines'] }
                ]
            },
            {
                name: 'Qualitäts-Tags',
                options: [
                    { label: 'Hyper-Realistisch', value: 'hyper', output_tags: ['hyperrealistic', 'ultra detailed', '8k resolution'] },
                    { label: 'Meisterwerk', value: 'masterpiece', output_tags: ['masterpiece', 'award winning photography'] },
                    { label: 'Cinematic Scan', value: 'scan', output_tags: ['high resolution scan', 'detailed textures'] },
                    { label: 'Scharfer Fokus', value: 'sharp', output_tags: ['extremely sharp focus', 'crisp details'] }
                ]
            }
        ],
        next_step_id: 'step_quality_skin'
    },
    step_quality_skin: {
        id: 'step_quality_skin',
        question: 'Haut- & Körperdetails',
        multi_select: true,
        sections: [
            {
                name: 'Haut-Textur',
                options: [
                    { label: 'Klare Haut', value: 'clear_skin', output_tags: ['clear skin', 'natural skin texture'] },
                    { label: 'Sommersprossen', value: 'freckles', output_tags: ['freckles', 'natural skin details'] },
                    { label: 'Poren-Detail', value: 'pores', output_tags: ['visible skin pores', 'highly detailed skin'] },
                    { label: 'Glatte Haut', value: 'smooth_skin', output_tags: ['smooth skin', 'perfect complexion'] }
                ]
            },
            {
                name: 'Zusatz-Effekte',
                options: [
                    { label: 'Schweiß / Glanz', value: 'sweat', output_tags: ['sweat drops', 'glowing skin'] },
                    { label: 'Tattoo', value: 'tattoo', output_tags: ['intricate tattoos'] },
                    { label: 'Narben', value: 'scars', output_tags: ['subtle scars'] }
                ]
            },
            {
                name: 'Bild-Fehler vermeiden (Optimierung)',
                options: [
                    { label: 'Keine Unschärfe', value: 'no_blur', output_tags: ['sharp focus', 'no blur', 'crisp details'] },
                    { label: 'Saubere Anatomie', value: 'anatomy', output_tags: ['perfect anatomy', 'correct fingers', 'well drawn hands'] },
                    { label: 'Kein Rauschen', value: 'no_noise', output_tags: ['clean image', 'no noise', 'no artifacts'] }
                ]
            }
        ],
        next_step_id: 'finish'
    }
};
