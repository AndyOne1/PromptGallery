export const poseSteps = {
    step_pose: {
        id: 'step_pose',
        question: 'Pose & Körperhaltung',
        multi_select: true,
        sections: [
            {
                name: 'Arme & Hände',
                options: [
                    { label: 'Hand in den Haaren', value: 'hand_hair', output_tags: ['hand in hair', 'relaxed pose'] },
                    { label: 'Arme verschränkt', value: 'arms_crossed', output_tags: ['arms crossed', 'confident stance'] },
                    { label: 'Hand an der Wange', value: 'hand_cheek', output_tags: ['hand on cheek', 'thoughtful pose'] },
                    { label: 'Hände in den Taschen', value: 'hands_pockets', output_tags: ['hands in pockets', 'casual stance'] }
                ]
            },
            {
                name: 'Beine & Stand',
                options: [
                    { label: 'Ein Bein angewinkelt', value: 'leg_bent', output_tags: ['one leg bent', 'dynamic pose'] },
                    { label: 'Sitzend', value: 'sitting', output_tags: ['sitting down', 'relaxed posture'] },
                    { label: 'Anlehnen', value: 'leaning', output_tags: ['leaning against wall', 'casual pose'] },
                    { label: 'Schritt nach vorne', value: 'step_forward', output_tags: ['stepping forward', 'action pose'] }
                ]
            }
        ],
        next_step_id: 'step_clothing_category'
    }
};
