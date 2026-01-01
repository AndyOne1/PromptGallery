export const amateurSteps = {
    // 1.1 Substil Auswahl
    amateur_1_1: {
        id: 'amateur_1_1',
        question: 'Wähle deinen fotografischen Substil',
        next_step_id: 'amateur_1_2',
        options: [
            { label: 'Candid Selfie', value: 'candid_selfie', output_tags: ['candid selfie', 'selfie'], next_step_id: 'amateur_1_2' },
            { label: 'Mirror Selfie', value: 'mirror_selfie', output_tags: ['mirror selfie', 'reflection', 'smartphone in mirror'], next_step_id: 'amateur_1_2' },
            { label: 'Social Media Content', value: 'social_media', output_tags: ['social media style'], next_step_id: 'amateur_1_1_social' },
            { label: '2000s / Vintage Phone', value: 'vintage_phone', output_tags: ['vintage mobile photo', 'retro phone camera'], next_step_id: 'amateur_1_1_vintage' },
            { label: 'Boring Life / Slice of Life', value: 'slice_of_life', output_tags: ['boring life', 'slice of life', 'mundane reality'], next_step_id: 'amateur_1_2' },
            { label: 'Party / Event Snapshot', value: 'party_shot', output_tags: ['party snapshot', 'event photo', 'flash photography'], next_step_id: 'amateur_1_2' },
            { label: 'Accidental / Spontaneous Shot', value: 'accidental', output_tags: ['accidental photo', 'spontaneous capture', 'unposed'], next_step_id: 'amateur_1_2' }
        ]
    },
    amateur_1_1_social: {
        id: 'amateur_1_1_social',
        question: 'Welche Social Media Ästhetik?',
        options: [
            { label: 'Instagram aesthetic', value: 'instagram', output_tags: ['instagram style', 'curated aesthetic'], next_step_id: 'amateur_1_2' },
            { label: 'Snapchat style', value: 'snapchat', output_tags: ['snapchat quality', 'phone capture'], next_step_id: 'amateur_1_2' },
            { label: 'TikTok content', value: 'tiktok', output_tags: ['tiktok aesthetic', 'vertical video frame'], next_step_id: 'amateur_1_2' },
            { label: 'BeReal authentic', value: 'bereal', output_tags: ['bereal style', 'completely unedited', 'authentic'], next_step_id: 'amateur_1_2' }
        ]
    },
    amateur_1_1_vintage: {
        id: 'amateur_1_1_vintage',
        question: 'Welches Vintage-Gerät?',
        options: [
            { label: 'Flip phone camera', value: 'flip_phone', output_tags: ['flip phone camera', 'low res', '2000s quality'], next_step_id: 'amateur_1_2' },
            { label: 'Early smartphone', value: 'early_smartphone', output_tags: ['early smartphone photo', '2010s mobile quality'], next_step_id: 'amateur_1_2' },
            { label: 'Webcam quality', value: 'webcam', output_tags: ['webcam photo', 'grainy webcam', '00s webcam aesthetic'], next_step_id: 'amateur_1_2' }
        ]
    },

    // 1.2 Framing & Komposition
    amateur_1_2: {
        id: 'amateur_1_2',
        question: 'Framing & Komposition',
        multi_select: true,
        next_step_id: 'amateur_1_3',
        sections: [
            {
                name: 'Shot Type',
                options: [
                    { label: 'Extreme close-up (face only)', value: 'ecu', output_tags: 'extreme close-up' },
                    { label: 'Close-up (head and shoulders)', value: 'cu', output_tags: 'close-up shot' },
                    { label: 'Medium shot (waist up)', value: 'ms', output_tags: 'medium shot' },
                    { label: 'Full body', value: 'full_body', output_tags: 'full body shot' },
                    { label: 'Environmental (subject in context)', value: 'environmental', output_tags: 'environmental portrait' }
                ]
            },
            {
                name: 'Angle',
                options: [
                    { label: 'High angle (von oben)', value: 'high_angle', output_tags: 'high angle' },
                    { label: 'Eye level', value: 'eye_level', output_tags: 'eye level' },
                    { label: 'Low angle (von unten)', value: 'low_angle', output_tags: 'low angle' },
                    { label: 'Dutch angle (gekippt)', value: 'dutch_angle', output_tags: 'dutch angle' }
                ]
            },
            {
                name: 'Arm Extension (bei Selfies)',
                options: [
                    { label: 'Arm visible in frame', value: 'arm_visible', output_tags: 'arm visible in frame' },
                    { label: 'Arm extended out of frame', value: 'arm_extended', output_tags: 'arm extended out of frame' },
                    { label: 'Mirror reflection with phone', value: 'mirror_phone', output_tags: 'holding phone in mirror reflection' }
                ]
            }
        ]
    },

    // 1.3 Subjekt Definition
    amateur_1_3: {
        id: 'amateur_1_3',
        question: 'Subjekt Definition',
        multi_select: true,
        next_step_id: 'amateur_1_4',
        sections: [
            {
                name: 'Geschlecht',
                options: [
                    { label: 'Mann', value: 'male', output_tags: 'man' },
                    { label: 'Frau', value: 'female', output_tags: 'woman' },
                    { label: 'Non-binär', value: 'nonbinary', output_tags: 'non-binary person' }
                ]
            },
            {
                name: 'Alter',
                options: [
                    { label: 'Kind (5-12)', value: 'child', output_tags: 'child' },
                    { label: 'Teenager (13-19)', value: 'teen', output_tags: 'teenager' },
                    { label: 'Junger Erwachsener (20-30)', value: 'young_adult', output_tags: '20-30 years old' },
                    { label: 'Erwachsener (31-50)', value: 'adult', output_tags: 'adult' },
                    { label: 'Mittleres Alter (51-65)', value: 'middle_aged', output_tags: 'middle aged' },
                    { label: 'Senior (65+)', value: 'senior', output_tags: 'senior' }
                ]
            },
            {
                name: 'Anzahl Personen',
                options: [
                    { label: 'Solo', value: 'solo', output_tags: 'solo shot' },
                    { label: 'Duo/Couple', value: 'duo', output_tags: 'two people' },
                    { label: 'Gruppe (3-5)', value: 'group', output_tags: 'group of people' },
                    { label: 'Crowd (6+)', value: 'crowd', output_tags: 'crowd of people' }
                ]
            },
            {
                name: 'Referenz Option',
                options: [
                    { label: 'Upload Referenzbild', value: 'upload_ref', is_reference_toggle: true, output_tags: [] },
                    { label: 'Beschreibung eingeben', value: 'manual_desc', output_tags: [] }
                ]
            }
        ]
    },

    // 1.4 Umgebung
    amateur_1_4: {
        id: 'amateur_1_4',
        question: 'Location Type',
        next_step_id: 'amateur_1_5',
        options: [
            { label: 'Innen (Indoor)', value: 'indoor', output_tags: 'indoor', next_step_id: 'amateur_1_4_indoor' },
            { label: 'Außen (Outdoor)', value: 'outdoor', output_tags: 'outdoor', next_step_id: 'amateur_1_4_outdoor' },
            { label: 'Fahrzeug (Auto, Bus, Zug)', value: 'vehicle', output_tags: 'inside a vehicle', next_step_id: 'amateur_1_5' },
            { label: 'Übergang (Balkon, Veranda)', value: 'transition', output_tags: 'on a balcony or porch', next_step_id: 'amateur_1_5' }
        ]
    },
    amateur_1_4_indoor: {
        id: 'amateur_1_4_indoor',
        question: 'Indoor Details',
        multi_select: true,
        next_step_id: 'amateur_1_5',
        sections: [
            {
                name: 'Wohnbereich',
                options: [
                    { label: 'Schlafzimmer', value: 'bedroom', output_tags: 'in a bedroom' },
                    { label: 'Wohnzimmer', value: 'living_room', output_tags: 'in a living room' },
                    { label: 'Küche', value: 'kitchen', output_tags: 'in a kitchen' },
                    { label: 'Badezimmer', value: 'bathroom', output_tags: 'in a bathroom' },
                    { label: 'Gang/Flur', value: 'hallway', output_tags: 'in a hallway' }
                ]
            },
            {
                name: 'Öffentlich',
                options: [
                    { label: 'Restaurant/Café', value: 'cafe', output_tags: 'in a cafe' },
                    { label: 'Bar/Club', value: 'bar', output_tags: 'in a bar' },
                    { label: 'Einkaufszentrum', value: 'mall', output_tags: 'in a shopping mall' },
                    { label: 'Büro', value: 'office', output_tags: 'in an office' },
                    { label: 'Schule/Uni', value: 'school', output_tags: 'in a school' },
                    { label: 'Fitnessstudio', value: 'gym', output_tags: 'in a gym' },
                    { label: 'Öffentliche Toilette', value: 'public_toilet', output_tags: 'in a public restroom' },
                    { label: 'Umkleide', value: 'changing_room', output_tags: 'in a changing room' }
                ]
            }
        ]
    },
    amateur_1_4_outdoor: {
        id: 'amateur_1_4_outdoor',
        question: 'Outdoor Details',
        multi_select: true,
        next_step_id: 'amateur_1_5',
        sections: [
            {
                name: 'Urban',
                options: [
                    { label: 'Straße/Gehweg', value: 'street', output_tags: 'on the street' },
                    { label: 'Park', value: 'park', output_tags: 'in a park' },
                    { label: 'Parkplatz', value: 'parking_lot', output_tags: 'in a parking lot' },
                    { label: 'Dach/Rooftop', value: 'rooftop', output_tags: 'on a rooftop' },
                    { label: 'Hinterhof', value: 'backyard', output_tags: 'in a backyard' }
                ]
            },
            {
                name: 'Natur',
                options: [
                    { label: 'Strand', value: 'beach', output_tags: 'at the beach' },
                    { label: 'Wald', value: 'forest', output_tags: 'in a forest' },
                    { label: 'Berge', value: 'mountains', output_tags: 'in the mountains' },
                    { label: 'See/Fluss', value: 'lake', output_tags: 'near a lake' },
                    { label: 'Feld/Wiese', value: 'field', output_tags: 'in a field' }
                ]
            },
            {
                name: 'Travel',
                options: [
                    { label: 'Sehenswürdigkeit', value: 'landmark', output_tags: 'at a famous landmark' },
                    { label: 'Hotel', value: 'hotel', output_tags: 'at a hotel' },
                    { label: 'Flughafen/Bahnhof', value: 'airport', output_tags: 'at an airport' }
                ]
            }
        ]
    },

    // 1.5 Umgebungsstil
    amateur_1_5: {
        id: 'amateur_1_5',
        question: 'Umgebungsstil',
        multi_select: true,
        next_step_id: 'amateur_1_6',
        sections: [
            {
                name: 'Ästhetik',
                options: [
                    { label: 'Modern/Contemporary', value: 'modern', output_tags: 'modern aesthetic' },
                    { label: 'Altmodisch/Vintage', value: 'vintage', output_tags: 'vintage style' },
                    { label: 'Minimalistisch', value: 'minimalist', output_tags: 'minimalist environment' },
                    { label: 'Chaotisch/Messy', value: 'messy', output_tags: 'cluttered and messy background' },
                    { label: 'Gemütlich/Cozy', value: 'cozy', output_tags: 'cozy atmosphere' }
                ]
            },
            {
                name: 'Wohlstandslevel',
                options: [
                    { label: 'Luxuriös', value: 'luxurious', output_tags: 'luxurious surroundings' },
                    { label: 'Gehoben', value: 'highend', output_tags: 'expensive atmosphere' },
                    { label: 'Durchschnittlich', value: 'average', output_tags: 'middle class setting' },
                    { label: 'Bescheiden', value: 'modest', output_tags: 'simple modest setting' },
                    { label: 'Verwahrlost', value: 'rundown', output_tags: 'shabby rundown environment' }
                ]
            },
            {
                name: 'Zustand',
                options: [
                    { label: 'Sauber/Aufgeräumt', value: 'clean', output_tags: 'clean and organized' },
                    { label: 'Gelebt/Normal', value: 'normal', output_tags: 'lived-in realistic atmosphere' },
                    { label: 'Unordentlich', value: 'untidy', output_tags: 'untidy state' },
                    { label: 'Dreckig/Ungepflegt', value: 'dirty', output_tags: 'dirty and neglected' }
                ]
            }
        ]
    },

    // 1.6 Pose & Körperhaltung
    amateur_1_6: {
        id: 'amateur_1_6',
        question: 'Pose & Körperhaltung',
        multi_select: true,
        next_step_id: 'amateur_1_7',
        sections: [
            {
                name: 'Grundpose',
                options: [
                    { label: 'Stehend', value: 'standing', output_tags: 'standing' },
                    { label: 'Sitzend', value: 'sitting', output_tags: 'sitting' },
                    { label: 'Liegend', value: 'lying', output_tags: 'lying down' },
                    { label: 'Hockend/Kniend', value: 'crouched', output_tags: 'crouched' },
                    { label: 'Gelehnt (an Wand/Möbel)', value: 'leaning', output_tags: 'leaning' },
                    { label: 'In Bewegung', value: 'motion', output_tags: 'in motion' }
                ]
            },
            {
                name: 'Körper-Orientierung',
                options: [
                    { label: 'Frontal zur Kamera', value: 'frontal', output_tags: 'facing camera' },
                    { label: 'Seitlich (Profile)', value: 'profile', output_tags: 'profile view' },
                    { label: 'Über Schulter', value: 'over_shoulder', output_tags: 'over shoulder' },
                    { label: 'Rückansicht mit Blick zurück', value: 'back_view_look', output_tags: 'back view looking back' },
                    { label: 'Komplett abgewandt', value: 'turned_away', output_tags: 'turned away' }
                ]
            }
        ]
    },

    // 1.7 Detaillierte Pose-Elemente
    amateur_1_7: {
        id: 'amateur_1_7',
        question: 'Detaillierte Pose-Elemente',
        multi_select: true,
        next_step_id: 'amateur_1_8',
        sections: [
            {
                name: 'Kopf & Hals',
                options: [
                    { label: 'Kopfneigung links', value: 'tilt_left', output_tags: 'head tilted to the left' },
                    { label: 'Kopfneigung rechts', value: 'tilt_right', output_tags: 'head tilted to the right' },
                    { label: 'Kinn angehoben', value: 'chin_up', output_tags: 'chin lifted' },
                    { label: 'Kinn gesenkt', value: 'chin_down', output_tags: 'chin tilted down' }
                ]
            },
            {
                name: 'Arme',
                options: [
                    { label: 'Arme hängend', value: 'arm_hang', output_tags: 'arms hanging' },
                    { label: 'Arme angewinkelt', value: 'arm_bent', output_tags: 'arms bent' },
                    { label: 'Über Kopf', value: 'arm_overhead', output_tags: 'hands over head' },
                    { label: 'Peace-Sign / Victory', value: 'arm_v', output_tags: 'victory sign' }
                ]
            },
            {
                name: 'Torso',
                options: [
                    { label: 'Aufrecht', value: 'torso_upright', output_tags: 'upright posture' },
                    { label: 'Nach vorne gebeugt', value: 'torso_forward', output_tags: 'bent forward' },
                    { label: 'Zurückgelehnt', value: 'torso_back', output_tags: 'leaning back' },
                    { label: 'Verdreht', value: 'torso_twisted', output_tags: 'twisted torso' }
                ]
            }
        ]
    },

    // 1.8 Objekte in Händen
    amateur_1_8: {
        id: 'amateur_1_8',
        question: 'Objekte in Händen',
        options: [
            { label: 'Smartphone/Telefon', value: 'obj_phone', output_tags: 'holding a smartphone', next_step_id: 'amateur_1_9' },
            { label: 'Getränk (Kaffee, Bier, etc.)', value: 'obj_drink', output_tags: 'holding a drink', next_step_id: 'amateur_1_9' },
            { label: 'Essen (Burger, Pizza, etc.)', value: 'obj_food', output_tags: 'holding food', next_step_id: 'amateur_1_9' },
            { label: 'Zigarette/Vape', value: 'obj_vape', output_tags: 'smoking', next_step_id: 'amateur_1_9' },
            { label: 'Tasche/Handtasche', value: 'obj_bag', output_tags: 'carrying a bag', next_step_id: 'amateur_1_9' },
            { label: 'Sonnenbrille', value: 'obj_sunnies', output_tags: 'holding sunglasses', next_step_id: 'amateur_1_9' },
            { label: 'Kein Objekt', value: 'obj_none', output_tags: [], next_step_id: 'amateur_1_9' }
        ]
    },

    // 1.9 Gesichtsausdruck
    amateur_1_9: {
        id: 'amateur_1_9',
        question: 'Gesichtsausdruck',
        multi_select: true,
        next_step_id: 'amateur_1_10',
        sections: [
            {
                name: 'Mund',
                options: [
                    { label: 'Geschlossen neutral', value: 'm_neutral', output_tags: 'closed mouth neutral' },
                    { label: 'Leichtes Lächeln', value: 'm_smile_s', output_tags: 'slight smile' },
                    { label: 'Breites Lächeln', value: 'm_smile_w', output_tags: 'wide smile' },
                    { label: 'Lachen (Zähne sichtbar)', value: 'm_laugh', output_tags: 'laughing with teeth' },
                    { label: 'Schmollmund/Duck Face', value: 'm_duck', output_tags: 'pouting duck face' },
                    { label: 'Kussmund', value: 'm_kiss', output_tags: 'kissing lips' },
                    { label: 'Offener Mund', value: 'm_open', output_tags: 'open mouth' }
                ]
            },
            {
                name: 'Augen',
                options: [
                    { label: 'Normal offen', value: 'e_normal', output_tags: 'normally open eyes' },
                    { label: 'Leicht zusammengekniffen', value: 'e_narrow', output_tags: 'squinting eyes' },
                    { label: 'Zwinkern', value: 'e_wink', output_tags: 'winking' },
                    { label: 'Weit aufgerissen', value: 'e_wide', output_tags: 'wide open eyes' }
                ]
            },
            {
                name: 'Gesamtstimmung',
                options: [
                    { label: 'Glücklich/Fröhlich', value: 'mood_happy', output_tags: 'happy' },
                    { label: 'Cool/Entspannt', value: 'mood_cool', output_tags: 'relaxed' },
                    { label: 'Kokett/Flirty', value: 'mood_flirty', output_tags: 'flirty' },
                    { label: 'Gelangweilt/Müde', value: 'mood_bored', output_tags: 'bored' },
                    { label: 'Überrascht', value: 'mood_surprised', output_tags: 'surprised' },
                    { label: 'Selbstbewusst', value: 'mood_conf', output_tags: 'confident' }
                ]
            }
        ]
    },

    // 1.10 Haare & Frisur
    amateur_1_10: {
        id: 'amateur_1_10',
        question: 'Haare & Frisur',
        multi_select: true,
        next_step_id: 'amateur_1_11',
        sections: [
            {
                name: 'Länge',
                options: [
                    { label: 'Sehr kurz/Buzz cut', value: 'h_buzz', output_tags: 'buzz cut' },
                    { label: 'Kurz', value: 'h_short', output_tags: 'short hair' },
                    { label: 'Schulterlang', value: 'h_shoulder', output_tags: 'shoulder length hair' },
                    { label: 'Lang', value: 'h_long', output_tags: 'long hair' },
                    { label: 'Kahl', value: 'h_bald', output_tags: 'bald head' }
                ]
            },
            {
                name: 'Stil',
                options: [
                    { label: 'Offen/Loose', value: 'h_loose', output_tags: 'loose hair' },
                    { label: 'Pferdeschwanz', value: 'h_pony', output_tags: 'ponytail' },
                    { label: 'Dutt/Bun', value: 'h_bun', output_tags: 'hair bun' },
                    { label: 'Zerzaust/Messy', value: 'h_messy', output_tags: 'messy hair' },
                    { label: 'Lockig/Wellig', value: 'h_curly', output_tags: 'curly hair' }
                ]
            },
            {
                name: 'Zustand',
                options: [
                    { label: 'Frisch gewaschen', value: 'h_fresh', output_tags: 'clean shiny hair' },
                    { label: 'Normal', value: 'h_norm', output_tags: 'normal hair texture' },
                    { label: 'Fettig/Ungepflegt', value: 'h_greasy', output_tags: 'greasy unkempt hair' },
                    { label: 'Nass', value: 'h_wet', output_tags: 'wet hair' }
                ]
            }
        ]
    },

    // 1.11 Kleidungsstil
    amateur_1_11: {
        id: 'amateur_1_11',
        question: 'Kleidungsstil',
        multi_select: true,
        next_step_id: 'amateur_1_12',
        sections: [
            {
                name: 'Style-Kategorie',
                options: [
                    { label: 'Casual', value: 'c_casual', output_tags: 'casual' },
                    { label: 'Sportlich', value: 'c_sport', output_tags: 'sporty' },
                    { label: 'Lounge', value: 'c_lounge', output_tags: 'loungewear' },
                    { label: 'Sexy', value: 'c_sexy', output_tags: 'revealing' },
                    { label: 'Party', value: 'c_party', output_tags: 'party wear' },
                    { label: 'Nightwear/Schlafanzug', value: 'c_night', output_tags: 'nightwear' }
                ]
            },
            {
                name: 'Fit',
                options: [
                    { label: 'Oversized', value: 'f_oversized', output_tags: 'oversized' },
                    { label: 'Locker', value: 'f_loose', output_tags: 'loose fit' },
                    { label: 'Normal', value: 'f_normal', output_tags: 'regular fit' },
                    { label: 'Eng/Tight', value: 'f_tight', output_tags: 'tight fit' }
                ]
            }
        ]
    },

    // 1.12 Oberteil
    amateur_1_12: {
        id: 'amateur_1_12',
        question: 'Oberteil',
        multi_select: true,
        next_step_id: 'amateur_1_13',
        sections: [
            {
                name: 'Typ',
                options: [
                    { label: 'T-Shirt', value: 't_tshirt', output_tags: 't-shirt' },
                    { label: 'Tank Top', value: 't_tank', output_tags: 'tank top' },
                    { label: 'Crop Top', value: 't_crop', output_tags: 'crop top' },
                    { label: 'Hoodie', value: 't_hoodie', output_tags: 'hoodie' },
                    { label: 'Hemd/Bluse', value: 't_shirt', output_tags: 'button-down shirt' },
                    { label: 'Sport-BH', value: 't_sport_bra', output_tags: 'sports bra' },
                    { label: 'Bikini', value: 't_bikini', output_tags: 'bikini top' },
                    { label: 'Nackt (zensiert)', value: 't_naked', output_tags: 'bare skin' }
                ]
            },
            {
                name: 'Farbe/Muster',
                options: [
                    { label: 'Weiß', value: 'col_white', output_tags: 'white' },
                    { label: 'Schwarz', value: 'col_black', output_tags: 'black' },
                    { label: 'Grau', value: 'col_grey', output_tags: 'grey' },
                    { label: 'Logo/Grafik', value: 'pat_graphic', output_tags: 'with graphic print' }
                ]
            }
        ]
    },

    // 1.13 Unterteil
    amateur_1_13: {
        id: 'amateur_1_13',
        question: 'Unterteil',
        multi_select: true,
        next_step_id: 'amateur_1_14',
        sections: [
            {
                name: 'Typ',
                options: [
                    { label: 'Jeans', value: 'b_jeans', output_tags: 'jeans' },
                    { label: 'Jogginghose', value: 'b_joggers', output_tags: 'joggers' },
                    { label: 'Leggings', value: 'b_leggings', output_tags: 'leggings' },
                    { label: 'Shorts', value: 'b_shorts', output_tags: 'shorts' },
                    { label: 'Rock', value: 'b_skirt', output_tags: 'skirt' },
                    { label: 'Nackt (zensiert)', value: 'b_naked', output_tags: 'bare skin' }
                ]
            }
        ]
    },

    // 1.14 Schuhe
    amateur_1_14: {
        id: 'amateur_1_14',
        question: 'Schuhe',
        multi_select: true,
        next_step_id: 'amateur_1_15',
        sections: [
            {
                name: 'Typ',
                options: [
                    { label: 'Sneakers', value: 's_sneakers', output_tags: 'sneakers' },
                    { label: 'Boots', value: 's_boots', output_tags: 'boots' },
                    { label: 'High Heels', value: 's_heels', output_tags: 'high heels' },
                    { label: 'Barfuß', value: 's_barefoot', output_tags: 'barefoot' },
                    { label: 'Socken', value: 's_socks', output_tags: 'socks only' }
                ]
            }
        ]
    },

    // 1.15 Accessoires
    amateur_1_15: {
        id: 'amateur_1_15',
        question: 'Accessoires',
        multi_select: true,
        next_step_id: 'amateur_1_16',
        sections: [
            {
                name: 'Schmuck',
                options: [
                    { label: 'Halskette', value: 'a_necklace', output_tags: 'wearing a necklace' },
                    { label: 'Ohrringe', value: 'a_earrings', output_tags: 'earrings' },
                    { label: 'Piercing', value: 'a_piercing', output_tags: 'piercing' }
                ]
            },
            {
                name: 'Extras',
                options: [
                    { label: 'Brille', value: 'a_glasses', output_tags: 'glasses' },
                    { label: 'Mütze/Cap', value: 'a_hat', output_tags: 'hat' },
                    { label: 'Kopfhörer', value: 'a_phones', output_tags: 'headphones' }
                ]
            }
        ]
    },

    // 1.16 Hintergrund & 1.17 Amateur Details
    amateur_1_16: {
        id: 'amateur_1_16',
        question: 'Technik & Details',
        multi_select: true,
        next_step_id: 'amateur_1_18',
        sections: [
            {
                name: 'Schärfe',
                options: [
                    { label: 'Scharf/Detailed', value: 'bg_sharp', output_tags: 'sharp focus' },
                    { label: 'Leicht verschwommen', value: 'bg_bokeh_l', output_tags: 'slight blur' },
                    { label: 'Stark verschwommen', value: 'bg_bokeh_s', output_tags: 'heavy bokeh' }
                ]
            },
            {
                name: 'Amateur Fehler',
                options: [
                    { label: 'Körnig/Noisy', value: 't_grain', output_tags: 'grainy noise' },
                    { label: 'Bewegungsunschärfe', value: 't_blur', output_tags: 'motion blur' },
                    { label: 'Blitz-Reflektion', value: 't_flash', output_tags: 'harsh flash glare' },
                    { label: 'Dreckige Linse', value: 't_dirty', output_tags: 'smudged lens' }
                ]
            },
            {
                name: 'Timing',
                options: [
                    { label: 'Candind/Echt', value: 't_candid', output_tags: 'candid capture' },
                    { label: 'Ungeschickt getimed', value: 't_awkward', output_tags: 'awkwardly timed snapshot' }
                ]
            }
        ]
    },

    // 1.18 Beleuchtung & 1.19 Wetter
    amateur_1_18: {
        id: 'amateur_1_18',
        question: 'Licht & Wetter',
        multi_select: true,
        next_step_id: 'finish',
        sections: [
            {
                name: 'Lichtquelle',
                options: [
                    { label: 'Fensterlicht', value: 'l_window', output_tags: 'window light' },
                    { label: 'Blitz', value: 'l_flash', output_tags: 'phone flash' },
                    { label: 'Deckenlampe', value: 'l_overhead', output_tags: 'overhead lighting' },
                    { label: 'Goldene Stunde', value: 'l_golden', output_tags: 'golden hour' }
                ]
            },
            {
                name: 'Wetter/Zeit',
                options: [
                    { label: 'Sonnig', value: 'w_sunny', output_tags: 'sunny' },
                    { label: 'Bewölkt', value: 'w_cloudy', output_tags: 'cloudy' },
                    { label: 'Nacht', value: 'w_night', output_tags: 'night time' }
                ]
            }
        ]
    }
};
