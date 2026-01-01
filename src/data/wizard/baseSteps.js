export const baseSteps = {
    root: {
        id: 'root',
        question: 'Was möchtest du erschaffen?',
        options: [
            {
                label: 'Profi-Fotografie (Studio / High-End)',
                value: 'photo_pro',
                output_tags: ['professional photography', 'hyperrealistic', '8k', 'perfect focus'],
                next_step_id: 'step_photo_type'
            },
            {
                label: 'Amateur / Candid Snapshot (Alltag / Retro)',
                value: 'photo_amateur',
                output_tags: ['amateur photography', 'snapshot', 'candid', 'unpolished look'],
                next_step_id: 'step_amateur_type'
            },
            {
                label: 'Digital Art / Illustration / Kunst',
                value: 'art',
                output_tags: [],
                next_step_id: 'step_art_category'
            }
        ]
    }
};
