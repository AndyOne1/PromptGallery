export const baseSteps = {
    root: {
        id: 'root',
        question: 'What kind of scene do you want to create?',
        options: [
            {
                label: 'AMATEUR / CASUAL PHOTOGRAPHY',
                value: 'amateur',
                output_tags: ['amateur photography', 'candid', 'snapshot'],
                next_step_id: 'amateur_1_1'
            }
        ]
    }
};
