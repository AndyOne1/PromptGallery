export const clothingSteps = {
    step_clothing_category: {
        id: 'step_clothing_category',
        question: 'Welcher Kleidungsstil?',
        options: [
            { label: 'Business / Corporate', value: 'business', output_tags: ['professional attire', 'business style'], next_step_id: 'step_clothing_items' },
            { label: 'Casual / Streetwear', value: 'casual', output_tags: ['casual streetwear', 'modern outfit'], next_step_id: 'step_clothing_items' },
            { label: 'Sexy / Lingerie', value: 'sexy', output_tags: ['alluring outfit', 'provocative fashion'], next_step_id: 'step_clothing_items' },
            { label: 'Cyberpunk / Sci-Fi', value: 'scifi', output_tags: ['futuristic techwear', 'cyberpunk fashion'], next_step_id: 'step_clothing_items' },
            { label: 'Formal / Evening', value: 'formal', output_tags: ['formal wear', 'evening attire'], next_step_id: 'step_clothing_items' },
            { label: 'Athleisure / Sport', value: 'sport', output_tags: ['athleisure', 'sporty look'], next_step_id: 'step_clothing_items' },
            { label: 'Fantasy / Armor', value: 'armor', output_tags: ['fantasy armor', 'knight attire'], next_step_id: 'step_clothing_items' }
        ]
    },
    step_clothing_items: {
        id: 'step_clothing_items',
        question: 'Stelle das Outfit zusammen',
        multi_select: true,
        sections: [
            {
                name: 'Oberbekleidung',
                options: [
                    { label: 'T-Shirt', value: 'tshirt', output_tags: ['t-shirt'] },
                    { label: 'Bluse / Hemd', value: 'shirt', output_tags: ['blouse', 'dress shirt'] },
                    { label: 'Pullover', value: 'sweater', output_tags: ['sweater', 'knitted jumper'] },
                    { label: 'Hoodie', value: 'hoodie', output_tags: ['hoodie'] },
                    { label: 'Jacke', value: 'jacket', output_tags: ['jacket'] },
                    { label: 'Mantel', value: 'coat', output_tags: ['long coat'] },
                    { label: 'Blazer', value: 'blazer', output_tags: ['blazer'] },
                    { label: 'Weste', value: 'vest', output_tags: ['vest'] },
                    { label: 'Rollkragen', value: 'turtleneck', output_tags: ['turtleneck'] },
                    { label: 'Crop Top', value: 'croptop', output_tags: ['crop top'] }
                ]
            },
            {
                name: 'Hosen & Röcke',
                options: [
                    { label: 'Jeans', value: 'jeans', output_tags: ['jeans', 'denim pants'] },
                    { label: 'Anzughose', value: 'trousers', output_tags: ['trousers', 'dress pants'] },
                    { label: 'Cargohose', value: 'cargo', output_tags: ['cargo pants'] },
                    { label: 'Leggings', value: 'leggings', output_tags: ['leggings'] },
                    { label: 'Minirock', value: 'miniskirt', output_tags: ['mini skirt'] },
                    { label: 'Maxirock', value: 'maxiskirt', output_tags: ['maxi skirt'] },
                    { label: 'Kurze Hose', value: 'shorts', output_tags: ['shorts'] }
                ]
            },
            {
                name: 'Materialien',
                options: [
                    { label: 'Leder', value: 'leather', output_tags: ['leather material'] },
                    { label: 'Seide', value: 'silk', output_tags: ['silk fabric'] },
                    { label: 'Spitze', value: 'lace', output_tags: ['lace details'] },
                    { label: 'Latex / PVC', value: 'latex', output_tags: ['latext material', 'shiny pvc'] },
                    { label: 'Samt', value: 'velvet', output_tags: ['velvet texture'] },
                    { label: 'Denim', value: 'denim', output_tags: ['denim texture'] }
                ]
            },
            {
                name: 'Accessoires',
                options: [
                    { label: 'Brille', value: 'glasses', output_tags: ['glasses'] },
                    { label: 'Sonnenbrille', value: 'sunglasses', output_tags: ['sunglasses'] },
                    { label: 'Hut / Kappe', value: 'hat', output_tags: ['hat', 'baseball cap'] },
                    { label: 'Schmuck', value: 'jewelry', output_tags: ['necklace', 'earrings', 'bracelet'] },
                    { label: 'Uhr', value: 'watch', output_tags: ['wrist watch'] },
                    { label: 'Schal', value: 'scarf', output_tags: ['scarf'] },
                    { label: 'Handschuhe', value: 'gloves', output_tags: ['gloves'] }
                ]
            }
        ],
        next_step_id: 'step_location_category'
    }
};
