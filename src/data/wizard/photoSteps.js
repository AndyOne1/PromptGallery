export const photoSteps = {
    step_photo_type: {
        id: 'step_photo_type',
        question: 'Welche Art von Foto?',
        options: [
            { label: 'Portrait / Model', value: 'portrait', output_tags: ['portrait photography'], next_step_id: 'step_photo_gear' },
            { label: 'Architektur / Interieur', value: 'architecture', output_tags: ['architectural photography'], next_step_id: 'step_photo_gear' },
            { label: 'Landschaft / Natur', value: 'landscape', output_tags: ['landscape photography'], next_step_id: 'step_photo_gear' },
            { label: 'Street Photography', value: 'street', output_tags: ['street photography'], next_step_id: 'step_photo_gear' },
            { label: 'Makro Fotografie', value: 'macro', output_tags: ['macro photography'], next_step_id: 'step_photo_gear' }
        ]
    },
    step_photo_gear: {
        id: 'step_photo_gear',
        question: 'Kamera & Sensor',
        options: [
            { label: 'Sony Alpha (Vollformat)', value: 'sony', output_tags: ['Sony Alpha', 'full frame sensor'], next_step_id: 'step_photo_lens' },
            { label: 'Canon EOS', value: 'canon', output_tags: ['Canon', 'high resolution'], next_step_id: 'step_photo_lens' },
            { label: 'Nikon Z', value: 'nikon', output_tags: ['Nikon', 'sharp optics'], next_step_id: 'step_photo_lens' },
            { label: 'Fujifilm (Film-Look)', value: 'fuji', output_tags: ['Fujifilm X', 'film simulation'], next_step_id: 'step_photo_lens' },
            { label: 'Leica (Premium)', value: 'leica', output_tags: ['Leica', 'rangefinder aesthetic'], next_step_id: 'step_photo_lens' },
            { label: 'Hasselblad (Mittelformat)', value: 'hasselblad', output_tags: ['Hasselblad', 'medium format sensor'], next_step_id: 'step_photo_lens' },
            { label: 'iPhone / Smartphone', value: 'smartphone', output_tags: ['iPhone photography', 'mobile photo'], next_step_id: 'step_photo_lens' }
        ]
    },
    step_photo_lens: {
        id: 'step_photo_lens',
        question: 'Objektiv & Brennweite',
        options: [
            { label: '24mm (Weitwinkel)', value: '24mm', output_tags: ['24mm wide angle lens'], next_step_id: 'step_photo_settings' },
            { label: '35mm (Standard)', value: '35mm', output_tags: ['35mm lens'], next_step_id: 'step_photo_settings' },
            { label: '50mm (Nifty Fifty)', value: '50mm', output_tags: ['50mm lens'], next_step_id: 'step_photo_settings' },
            { label: '85mm (Portrait)', value: '85mm', output_tags: ['85mm portrait lens'], next_step_id: 'step_photo_settings' },
            { label: '135mm (Tele)', value: '135mm', output_tags: ['135mm telephoto lens'], next_step_id: 'step_photo_settings' },
            { label: 'Macro Objektiv', value: 'macro_lens', output_tags: ['macro lens', 'extreme detail'], next_step_id: 'step_photo_settings' },
            { label: 'Fisheye', value: 'fisheye', output_tags: ['fisheye lens', 'ultra wide distortion'], next_step_id: 'step_photo_settings' },
            { label: 'Anamorphic (Cinema)', value: 'anamorphic', output_tags: ['anamorphic lens', 'cinematic aspect ratio'], next_step_id: 'step_photo_settings' }
        ]
    },
    step_photo_settings: {
        id: 'step_photo_settings',
        question: 'Kamera-Einstellungen',
        multi_select: true,
        sections: [
            {
                name: 'Blende & Fokus',
                options: [
                    { label: 'F1.4 (Viel Bokeh)', value: 'f1.4', output_tags: ['f/1.4 aperture', 'shallow depth of field', 'bokeh'] },
                    { label: 'F2.8 (Scharf & Trennung)', value: 'f2.8', output_tags: ['f/2.8 aperture', 'soft background'] },
                    { label: 'F11 (Alles scharf)', value: 'f11', output_tags: ['f/11 aperture', 'deep depth of field'] },
                    { label: 'Motion Blur', value: 'motion', output_tags: ['motion blur', 'dynamic action'] }
                ]
            },
            {
                name: 'Effekte',
                options: [
                    { label: 'Long Exposure', value: 'long_exp', output_tags: ['long exposure'] },
                    { label: 'Tilt-Shift', value: 'tilt', output_tags: ['tilt-shift effect'] },
                    { label: 'Double Exposure', value: 'double', output_tags: ['double exposure'] }
                ]
            }
        ],
        next_step_id: 'step_subject_base'
    },
    // New Amateur / Candid Paths
    step_amateur_type: {
        id: 'step_amateur_type',
        question: 'Was für einen Snapshot?',
        options: [
            { label: 'Selfie / Mirror Selfie', value: 'selfie', output_tags: ['mirror selfie', 'tight selfie composition'], next_step_id: 'step_amateur_gear' },
            { label: 'Alltags-Moment (Candid)', value: 'candid', output_tags: ['candid photography', 'unpolished snapshot'], next_step_id: 'step_amateur_gear' },
            { label: 'Abend / Party (Night)', value: 'night', output_tags: ['night out', 'party atmosphere'], next_step_id: 'step_amateur_gear' },
            { label: 'Instagram Story Vibe', value: 'story', output_tags: ['instagram story aesthetic', 'influencer lifestyle photography'], next_step_id: 'step_amateur_gear' }
        ]
    },
    step_amateur_gear: {
        id: 'step_amateur_gear',
        question: 'Womit wurde es aufgenommen?',
        options: [
            { label: 'Smartphone (Android/iPhone)', value: 'smartphone_amateur', output_tags: ['shot on smartphone', 'mobile phone photography', 'slight JPEG artifacts'], next_step_id: 'step_amateur_vibe' },
            { label: 'Digitalkamera (2000s Look)', value: 'digicam', output_tags: ['early-2000s digital camera aesthetic', 'subtle grain', 'retro highlights'], next_step_id: 'step_amateur_vibe' },
            { label: 'Alte Filmkamera / Einweg', value: 'film_cam', output_tags: ['disposable camera vibe', '35mm lens flash', 'nostalgic glow'], next_step_id: 'step_amateur_vibe' }
        ]
    },
    step_amateur_vibe: {
        id: 'step_amateur_vibe',
        question: 'Welcher Vibe soll rüberkommen?',
        multi_select: true,
        sections: [
            {
                name: 'Atmosphäre',
                options: [
                    { label: 'Authentisch & Unperfekt', value: 'imperfect', output_tags: ['authentic imperfections', 'imperfect', 'unpolished look'] },
                    { label: '2000er Nostalgie', value: 'nostalgic', output_tags: ['2000s nostalgic vibe', 'retro white balance'] },
                    { label: 'Boring Reality', value: 'boring', output_tags: ['boring reality', 'everyday aesthetic'] },
                    { label: 'Washed Out', value: 'washed', output_tags: ['washed out colors', 'faded look'] }
                ]
            }
        ],
        next_step_id: 'step_subject_base'
    }
};
