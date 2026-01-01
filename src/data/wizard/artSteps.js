export const artSteps = {
    step_art_category: {
        id: 'step_art_category',
        question: 'Welcher Kunst-Weg?',
        options: [
            { label: 'Traditionelle Medien', value: 'traditional', output_tags: [], next_step_id: 'step_art_traditional' },
            { label: 'Digitale Stile', value: 'digital', output_tags: [], next_step_id: 'step_art_digital' },
            { label: 'Geschichtliche Epochen', value: 'epoch', output_tags: [], next_step_id: 'step_art_epoch' },
            { label: 'Berühmte Künstler', value: 'artist', output_tags: [], next_step_id: 'step_art_artist' }
        ]
    },
    step_art_traditional: {
        id: 'step_art_traditional',
        question: 'Traditionelle Medien',
        options: [
            { label: 'Ölgemälde', value: 'oil', output_tags: ['oil painting', 'oil on canvas', 'textured brushstrokes'], next_step_id: 'step_subject_base' },
            { label: 'Aquarell', value: 'watercolor', output_tags: ['watercolor painting', 'watercolor on paper', 'soft bleeds'], next_step_id: 'step_subject_base' },
            { label: 'Bleistiftskizze', value: 'pencil', output_tags: ['pencil sketch', 'graphite drawing', 'hand-drawn'], next_step_id: 'step_subject_base' },
            { label: 'Kohlezeichnung', value: 'charcoal', output_tags: ['charcoal drawing', 'carbon dust', 'high contrast black and white'], next_step_id: 'step_subject_base' },
            { label: 'Pastell', value: 'pastel', output_tags: ['pastel art', 'soft textures'], next_step_id: 'step_subject_base' },
            { label: 'Tusche / Ink', value: 'ink', output_tags: ['ink drawing', 'pen and ink', 'ink wash'], next_step_id: 'step_subject_base' }
        ]
    },
    step_art_digital: {
        id: 'step_art_digital',
        question: 'Digitale Stile',
        options: [
            { label: '3D Render', value: '3d', output_tags: ['3d render', 'unreal engine 5', 'octane render', 'raytracing'], next_step_id: 'step_subject_base' },
            { label: 'Vector Art', value: 'vector', output_tags: ['vector art', 'flat vector', 'clean lines'], next_step_id: 'step_subject_base' },
            { label: 'Pixel Art', value: 'pixel', output_tags: ['pixel art', 'low res', '8-bit aesthetic'], next_step_id: 'step_subject_base' },
            { label: 'Isometric', value: 'isometric', output_tags: ['isometric view', 'low poly'], next_step_id: 'step_subject_base' },
            { label: 'Anime / Manga', value: 'anime', output_tags: ['anime style', 'manga aesthetic', 'cel shading'], next_step_id: 'step_subject_base' },
            { label: 'Concept Art', value: 'concept', output_tags: ['concept art', 'matte painting', 'speedpainting'], next_step_id: 'step_subject_base' },
            { label: 'Vaporwave / Glitch', value: 'glitch', output_tags: ['glitch art', 'vaporwave aesthetic', 'synthwave colors'], next_step_id: 'step_subject_base' }
        ]
    },
    step_art_epoch: {
        id: 'step_art_epoch',
        question: 'Kunstgeschichtliche Epoche',
        options: [
            { label: 'Renaissance', value: 'renaissance', output_tags: ['renaissance style', 'classic composition'], next_step_id: 'step_subject_base' },
            { label: 'Barock', value: 'baroque', output_tags: ['baroque', 'dramatic chiaroscuro'], next_step_id: 'step_subject_base' },
            { label: 'Impressionismus', value: 'impressionism', output_tags: ['impressionism', 'loose brushwork'], next_step_id: 'step_subject_base' },
            { label: 'Expressionismus', value: 'expressionism', output_tags: ['expressionism', 'vibrant distorted colors'], next_step_id: 'step_subject_base' },
            { label: 'Surrealismus', value: 'surrealism', output_tags: ['surrealism', 'dreamlike', 'salvador dali style'], next_step_id: 'step_subject_base' },
            { label: 'Art Deco', value: 'art_deco', output_tags: ['Art Deco', 'geometric', 'golden accents'], next_step_id: 'step_subject_base' },
            { label: 'Pop Art', value: 'pop_art', output_tags: ['pop art', 'andy warhol style'], next_step_id: 'step_subject_base' }
        ]
    },
    step_art_artist: {
        id: 'step_art_artist',
        question: 'Berühmte Künstler-Einflüsse',
        options: [
            { label: 'Van Gogh', value: 'vangogh', output_tags: ['style of Vincent van Gogh', 'swirling brushstrokes'], next_step_id: 'step_subject_base' },
            { label: 'Da Vinci', value: 'davinci', output_tags: ['style of Leonardo da Vinci', 'sfumato'], next_step_id: 'step_subject_base' },
            { label: 'Picasso', value: 'picasso', output_tags: ['style of Pablo Picasso', 'cubism'], next_step_id: 'step_subject_base' },
            { label: 'Studio Ghibli', value: 'ghibli', output_tags: ['Studio Ghibli style', 'hayao miyazaki aesthetic'], next_step_id: 'step_subject_base' },
            { label: 'Salvador Dalí', value: 'dali', output_tags: ['style of Salvador Dalí', 'melting objects'], next_step_id: 'step_subject_base' }
        ]
    }
};
