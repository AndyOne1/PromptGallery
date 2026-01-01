export const atmosphereSteps = {
    step_atmosphere_light: {
        id: 'step_atmosphere_light',
        question: 'Beleuchtung & Stimmung',
        multi_select: true,
        sections: [
            {
                name: 'Natürliches Licht',
                options: [
                    { label: 'Golden Hour', value: 'golden', output_tags: ['golden hour lighting', 'warm sunlight'] },
                    { label: 'Blue Hour', value: 'blue', output_tags: ['blue hour', 'cool ambient light'] },
                    { label: 'Hartes Sonnenlicht', value: 'harsh', output_tags: ['harsh sunlight', 'strong shadows'] },
                    { label: 'Diffuses Tageslicht', value: 'diffused', output_tags: ['soft diffused daylight', 'overcast lighting'] },
                    { label: 'Mondlicht', value: 'moonlight', output_tags: ['moonlight', 'mysterious night atmosphere'] }
                ]
            },
            {
                name: 'Künstliches Licht',
                options: [
                    { label: 'Studio Softbox', value: 'studio', output_tags: ['professional studio lighting', 'rembrandt lighting'] },
                    { label: 'Neon / Cyberpunk', value: 'neon', output_tags: ['neon lights', 'vibrant side lighting'] },
                    { label: 'Hard Flash (Snapshot)', value: 'flash', output_tags: ['harsh phone flash', 'direct flash', 'bright blown-out highlights'] },
                    { label: 'Kerzenschein', value: 'candle', output_tags: ['candlelight', 'warm flickering light'] },
                    { label: 'Harsh Super-Flash', value: 'super_flash', output_tags: ['harsh super-flash', 'early-2000s digital camera aesthetic'] }
                ]
            },
            {
                name: 'Effekte',
                options: [
                    { label: 'God Rays', value: 'godrays', output_tags: ['volumetric lighting', 'god rays', 'sunbeams'] },
                    { label: 'Nebel / Mist', value: 'fog', output_tags: ['misty atmosphere', 'foggy'] },
                    { label: 'Lens Flare', value: 'flare', output_tags: ['lens flare'] }
                ]
            }
        ],
        next_step_id: 'step_atmosphere_weather'
    },
    step_atmosphere_weather: {
        id: 'step_atmosphere_weather',
        question: 'Wetter & Jahreszeit',
        multi_select: true,
        sections: [
            {
                name: 'Wetter',
                options: [
                    { label: 'Sonnig', value: 'sunny', output_tags: ['clear sunny sky'] },
                    { label: 'Regnerisch', value: 'rainy', output_tags: ['rainy weather', 'raindrops', 'wet surfaces'] },
                    { label: 'Verschneit', value: 'snowy', output_tags: ['snowy weather', 'falling snow'] },
                    { label: 'Stürmisch', value: 'stormy', output_tags: ['stormy sky', 'lightning'] }
                ]
            },
            {
                name: 'Jahreszeit',
                options: [
                    { label: 'Frühling (Blüte)', value: 'spring', output_tags: ['springtime', 'cherry blossoms'] },
                    { label: 'Sommer (Hitze)', value: 'summer', output_tags: ['summer vibes'] },
                    { label: 'Herbst (Blätter)', value: 'autumn', output_tags: ['autumn leaves', 'orange and red foliage'] },
                    { label: 'Winter (Eis)', value: 'winter', output_tags: ['wintry landscape', 'frost'] }
                ]
            }
        ],
        next_step_id: 'step_atmosphere_color'
    },
    step_atmosphere_color: {
        id: 'step_atmosphere_color',
        question: 'Farben & Paletten',
        options: [
            { label: 'Lebhafte Farben', value: 'vibrant', output_tags: ['vibrant colors', 'high saturation'], next_step_id: 'step_quality_composition' },
            { label: 'Gedämpft / Muted', value: 'muted', output_tags: ['muted colors', 'desaturated palette'], next_step_id: 'step_quality_composition' },
            { label: 'Schwarz-Weiß', value: 'bw', output_tags: ['black and white photography', 'monochrome'], next_step_id: 'step_quality_composition' },
            { label: 'Pastell-Farben', value: 'pastel', output_tags: ['pastel color palette'], next_step_id: 'step_quality_composition' },
            { label: 'Erdtöne', value: 'earthy', output_tags: ['earth tones', 'natural colors'], next_step_id: 'step_quality_composition' },
            { label: 'Kühle Töne (Blau)', value: 'cool', output_tags: ['cool tones', 'teal and blue'], next_step_id: 'step_quality_composition' },
            { label: 'Warme Töne (Gold)', value: 'warm', output_tags: ['warm tones', 'orange and gold'], next_step_id: 'step_quality_composition' }
        ]
    }
};
