export const objectSteps = {
    step_objects_smartphone: {
        id: 'step_objects_smartphone',
        question: 'Smartphone Details (für Mirror Selfie)',
        multi_select: true,
        sections: [
            {
                name: 'Modell',
                options: [
                    { label: 'iPhone 15 Pro', value: 'iphone15', output_tags: ['holding iPhone 15 Pro', 'modern smartphone'] },
                    { label: 'iPhone 13 (Retro)', value: 'iphone13', output_tags: ['holding iPhone 13'] },
                    { label: 'Samsung Galaxy S24', value: 's24', output_tags: ['holding Samsung Galaxy S24'] },
                    { label: 'Google Pixel', value: 'pixel', output_tags: ['holding Google Pixel phone'] }
                ]
            },
            {
                name: 'Farbe',
                options: [
                    { label: 'Titan Natur', value: 'natural_titanium', output_tags: ['natural titanium color phone'] },
                    { label: 'Schwarz', value: 'black_phone', output_tags: ['black smartphone'] },
                    { label: 'Silber / Weiß', value: 'silver_phone', output_tags: ['silver smartphone'] },
                    { label: 'Bunt / Case', value: 'colored_case', output_tags: ['brightly colored phone case'] }
                ]
            }
        ],
        next_step_id: 'step_expression'
    }
};
