export const expressionSteps = {
    step_expression: {
        id: 'step_expression',
        question: 'Gesichtsausdruck & Augen',
        multi_select: true,
        sections: [
            {
                name: 'Augen',
                options: [
                    { label: 'Beide offen', value: 'eyes_open', output_tags: ['eyes open', 'direct gaze'] },
                    { label: 'Ein Auge zu (Zwinkern)', value: 'wink', output_tags: ['winking', 'one eye closed', 'playful expression'] },
                    { label: 'Augen geschlossen', value: 'eyes_closed', output_tags: ['eyes closed', 'peaceful expression'] },
                    { label: 'Geweitete Pupillen', value: 'dilated', output_tags: ['dilated pupils', 'intense gaze'] },
                    { label: 'Blick zur Seite', value: 'look_away', output_tags: ['looking away', 'candid gaze'] }
                ]
            },
            {
                name: 'Mund & Lächeln',
                options: [
                    { label: 'Breites Grinsen', value: 'wide_smile', output_tags: ['wide grin', 'showing teeth', 'happy'] },
                    { label: 'Kleines Lächeln', value: 'slight_smile', output_tags: ['slight smile', 'subtle expression'] },
                    { label: 'Lippe beißen', value: 'biting_lip', output_tags: ['biting lip', 'alluring expression'] },
                    { label: 'Schmollmund', value: 'pout', output_tags: ['pouting', 'duck face'] },
                    { label: 'Neutral / Ernst', value: 'neutral', output_tags: ['neutral expression', 'serious look'] }
                ]
            }
        ],
        next_step_id: 'step_pose'
    }
};
