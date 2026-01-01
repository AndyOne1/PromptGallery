export const characterSteps = {
    step_subject_base: {
        id: 'step_subject_base',
        question: 'Wer oder was ist das Subjekt?',
        options: [
            { label: 'Referenzbild verwenden', value: 'reference', output_tags: ['maintain reference image features'], next_step_id: 'step_character_traits', is_reference_toggle: true },
            { label: 'Frau', value: 'woman', output_tags: ['beautiful woman'], next_step_id: 'step_character_traits' },
            { label: 'Mann', value: 'man', output_tags: ['handsome man'], next_step_id: 'step_character_traits' },
            { label: 'Fabelwesen / Kreatur', value: 'creature', output_tags: [], next_step_id: 'step_character_creature' },
            { label: 'Kind / Teenager', value: 'child', output_tags: ['child'], next_step_id: 'step_character_traits' }
        ]
    },
    step_character_traits: {
        id: 'step_character_traits',
        question: 'Körpermerkmale & Ausdrücke',
        multi_select: true,
        sections: [
            {
                name: 'Körperbau',
                options: [
                    { label: 'Muskulös', value: 'muscular', output_tags: ['muscular build'] },
                    { label: 'Schlank', value: 'slim', output_tags: ['slim', 'slender build'] },
                    { label: 'Kurvig', value: 'curvy', output_tags: ['curvy figure'] },
                    { label: 'Athletisch', value: 'athletic', output_tags: ['athletic body'] },
                    { label: 'Zierlich', value: 'petite', output_tags: ['petite stature'] }
                ]
            },
            {
                name: 'Gesichtsausdruck & Pose',
                options: [
                    { label: 'Lächelnd', value: 'smiling', output_tags: ['smiling', 'happy expression'] },
                    { label: 'Intensiver Blick', value: 'intense', output_tags: ['intense look', 'piercing eyes'] },
                    { label: 'Nachdenklich', value: 'thoughtful', output_tags: ['thoughtful expression'] },
                    { label: 'Selbstbewusst', value: 'confident', output_tags: ['confident posture'] },
                    { label: 'Verführerisch', value: 'seductive', output_tags: ['seductive look'] },
                    { label: 'Spontan / Ungestellt', value: 'candid_pose', output_tags: ['candid pose', 'spontaneous movement'] },
                    { label: 'In den Spiegel schauen', value: 'mirror_look', output_tags: ['looking into mirror', 'mirror reflection'] }
                ]
            },
            {
                name: 'Alter',
                options: [
                    { label: 'Um die 20', value: '20s', output_tags: ['aged in 20s', 'youthful skin'] },
                    { label: 'Um die 30', value: '30s', output_tags: ['aged in 30s'] },
                    { label: 'Reifer (Mature)', value: 'mature', output_tags: ['mature age', 'aged 50s'] }
                ]
            }
        ],
        next_step_id: 'step_character_hair'
    },
    step_character_hair: {
        id: 'step_character_hair',
        question: 'Haare & Frisur',
        multi_select: true,
        sections: [
            {
                name: 'Länge & Stil',
                options: [
                    { label: 'Lange Haare', value: 'long', output_tags: ['long hair'] },
                    { label: 'Kurze Haare', value: 'short', output_tags: ['short hair'] },
                    { label: 'Lockig', value: 'curly', output_tags: ['curly hair'] },
                    { label: 'Glatte Haare', value: 'straight', output_tags: ['straight hair'] },
                    { label: 'Zopf / Braid', value: 'braid', output_tags: ['braided hair'] },
                    { label: 'Dutt / Bun', value: 'bun', output_tags: ['hair in a bun'] },
                    { label: 'Messy Hair', value: 'messy', output_tags: ['messy hair'] }
                ]
            },
            {
                name: 'Farbe',
                options: [
                    { label: 'Blond', value: 'blonde', output_tags: ['blonde hair'] },
                    { label: 'Brunette', value: 'brunette', output_tags: ['brown hair'] },
                    { label: 'Schwarz', value: 'black', output_tags: ['black hair'] },
                    { label: 'Rot', value: 'red', output_tags: ['red hair'] },
                    { label: 'Silber / Weiß', value: 'silver', output_tags: ['silver hair', 'white hair'] },
                    { label: 'Pink / Blau', value: 'colored', output_tags: ['pink hair', 'blue hair'] }
                ]
            }
        ],
        next_step_id: 'step_clothing_category'
    },
    step_character_creature: {
        id: 'step_character_creature',
        question: 'Welches Fabelwesen / Kreatur?',
        options: [
            { label: 'Elf / Fee', value: 'elf', output_tags: ['elf', 'pointed ears', 'ethereal beauty'], next_step_id: 'step_character_traits' },
            { label: 'Drache', value: 'dragon', output_tags: ['majestic dragon', 'scaled skin'], next_step_id: 'step_location_category' },
            { label: 'Meerjungfrau', value: 'mermaid', output_tags: ['mermaid', 'aquatic scales'], next_step_id: 'step_character_traits' },
            { label: 'Vampir', value: 'vampire', output_tags: ['vampire', 'pale skin', 'sharp fangs'], next_step_id: 'step_character_traits' },
            { label: 'Android / Cyborg', value: 'cyborg', output_tags: ['cyborg', 'mechanical parts', 'robot anatomy'], next_step_id: 'step_character_traits' },
            { label: 'Dämon / Engel', value: 'angelic', output_tags: ['angel wings', 'demonic horns'], next_step_id: 'step_character_traits' }
        ]
    }
};
