export const locationSteps = {
    step_location_category: {
        id: 'step_location_category',
        question: 'Wo spielt die Szene?',
        options: [
            { label: 'Natur & Landschaften', value: 'nature', output_tags: [], next_step_id: 'step_location_nature' },
            { label: 'Städtisch / Urban', value: 'urban', output_tags: [], next_step_id: 'step_location_urban' },
            { label: 'Innenräume / Interior', value: 'interior', output_tags: [], next_step_id: 'step_location_interior' },
            { label: 'Fantasie & Sci-Fi', value: 'fantasy', output_tags: [], next_step_id: 'step_location_fantasy' },
            { label: 'Berühmte Weltstädte', value: 'city', output_tags: [], next_step_id: 'step_location_cities' }
        ]
    },
    step_location_nature: {
        id: 'step_location_nature',
        question: 'Wähle die Natur-Umgebung',
        options: [
            { label: 'Berge / Alpen', value: 'mountains', output_tags: ['mountain range', 'alpine landscape', 'snowy peaks'], next_step_id: 'step_atmosphere_light' },
            { label: 'Wald / Dschungel', value: 'forest', output_tags: ['dense forest', 'jungle', 'lush greenery'], next_step_id: 'step_atmosphere_light' },
            { label: 'Strand / Ozean', value: 'beach', output_tags: ['beach', 'tropical coast', 'ocean waves'], next_step_id: 'step_atmosphere_light' },
            { label: 'Wüste / Oase', value: 'desert', output_tags: ['desert dunes', 'sand', 'oasis'], next_step_id: 'step_atmosphere_light' },
            { label: 'Wasserfall / Fluss', value: 'water', output_tags: ['majestic waterfall', 'river bank'], next_step_id: 'step_atmosphere_light' },
            { label: 'Wiese / Feld', value: 'meadow', output_tags: ['flower meadow', 'open field', 'prairie'], next_step_id: 'step_atmosphere_light' }
        ]
    },
    step_location_urban: {
        id: 'step_location_urban',
        question: 'Wähle die städtische Umgebung',
        options: [
            { label: 'Moderne Metropolis', value: 'metropolis', output_tags: ['metropolis skyline', 'skyscrapers', 'city downtown'], next_step_id: 'step_atmosphere_light' },
            { label: 'Dunkle Gasse', value: 'alley', output_tags: ['dark city alley', 'wet pavement', 'urban grit'], next_step_id: 'step_atmosphere_light' },
            { label: 'Einkaufszentrum', value: 'mall', output_tags: ['shopping mall', 'modern architecture'], next_step_id: 'step_atmosphere_light' },
            { label: 'Bahnhof / Flughafen', value: 'transit', output_tags: ['train station', 'airport terminal'], next_step_id: 'step_atmosphere_light' },
            { label: 'Industriegebiet', value: 'industrial', output_tags: ['industrial area', 'factory', 'warehouse'], next_step_id: 'step_atmosphere_light' },
            { label: 'Vorstadt / Nachbarschaft', value: 'suburban', output_tags: ['suburban neighborhood', 'quiet street'], next_step_id: 'step_atmosphere_light' }
        ]
    },
    step_location_interior: {
        id: 'step_location_interior',
        question: 'Welcher Innenraum?',
        options: [
            { label: 'Luxus-Wohnzimmer', value: 'living_room', output_tags: ['luxury living room interior', 'high-end furniture'], next_step_id: 'step_atmosphere_light' },
            { label: 'Modernes Schlafzimmer', value: 'bedroom', output_tags: ['modern bedroom interior', 'cozy atmosphere'], next_step_id: 'step_atmosphere_light' },
            { label: 'Büro / Bibliothek', value: 'office', output_tags: ['home office', 'library', 'wooden bookshelves'], next_step_id: 'step_atmosphere_light' },
            { label: 'Restaurant / Bar', value: 'restaurant', output_tags: ['fancy restaurant', 'bar interior', 'ambient lighting'], next_step_id: 'step_atmosphere_light' },
            { label: 'Krankenhaus / Labor', value: 'lab', output_tags: ['scientific laboratory', 'hospital room', 'sterile environment'], next_step_id: 'step_atmosphere_light' },
            { label: 'Atelier / Werkstatt', value: 'studio', output_tags: ['artist studio', 'workshop', 'creative mess'], next_step_id: 'step_atmosphere_light' }
        ]
    },
    step_location_fantasy: {
        id: 'step_location_fantasy',
        question: 'Fantasie & Sci-Fi Orte',
        options: [
            { label: 'Cyberpunk Stadt', value: 'cyberpunk', output_tags: ['cyberpunk city', 'neon lights', 'futuristic urban'], next_step_id: 'step_atmosphere_light' },
            { label: 'Raumschiff Innenraum', value: 'spaceship', output_tags: ['spaceship interior', 'sci-fi cockpit'], next_step_id: 'step_atmosphere_light' },
            { label: 'Magischer Wald', value: 'magic_forest', output_tags: ['enchanted forest', 'magical realm', 'glowing plants'], next_step_id: 'step_atmosphere_light' },
            { label: 'Schloss / Festung', value: 'castle', output_tags: ['medieval castle', 'fortress', 'stone walls'], next_step_id: 'step_atmosphere_light' },
            { label: 'Unterwasserstadt', value: 'underwater', output_tags: ['underwater city', 'aquatic architecture'], next_step_id: 'step_atmosphere_light' },
            { label: 'Post-Apokalypse', value: 'apocalypse', output_tags: ['post-apocalyptic wasteland', 'ruined buildings'], next_step_id: 'step_atmosphere_light' }
        ]
    },
    step_location_cities: {
        id: 'step_location_cities',
        question: 'Wähle eine Weltstadt',
        options: [
            { label: 'Paris', value: 'paris', output_tags: ['Paris city background', 'Eiffel Tower in distance'], next_step_id: 'step_atmosphere_light' },
            { label: 'Tokyo', value: 'tokyo', output_tags: ['Tokyo street', 'shibuya crossing vibe'], next_step_id: 'step_atmosphere_light' },
            { label: 'New York', value: 'ny', output_tags: ['New York City', 'times square vibe'], next_step_id: 'step_atmosphere_light' },
            { label: 'London', value: 'london', output_tags: ['London street', 'big ben in distance'], next_step_id: 'step_atmosphere_light' },
            { label: 'Berlin', value: 'berlin', output_tags: ['Berlin city', 'urban german vibe'], next_step_id: 'step_atmosphere_light' },
            { label: 'Dubai', value: 'dubai', output_tags: ['Dubai skyline', 'modern desert city'], next_step_id: 'step_atmosphere_light' }
        ]
    }
};
