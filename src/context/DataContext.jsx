import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { galleryApi, promptsApi, charactersApi } from '../services/api';

const DataContext = createContext();

export function DataProvider({ children, user }) {
    const [privateImages, setPrivateImages] = useState(() => {
        const cached = localStorage.getItem('cache_private_images');
        return cached ? JSON.parse(cached) : [];
    });
    const [publicImages, setPublicImages] = useState(() => {
        const cached = localStorage.getItem('cache_public_images');
        return cached ? JSON.parse(cached) : [];
    });
    const [prompts, setPrompts] = useState(() => {
        const cached = localStorage.getItem('cache_prompts');
        return cached ? JSON.parse(cached) : [];
    });
    const [characters, setCharacters] = useState(() => {
        const cached = localStorage.getItem('cache_characters');
        return cached ? JSON.parse(cached) : [];
    });

    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
    const [isLoadingCharacters, setIsLoadingCharacters] = useState(false);

    const [lastFetch, setLastFetch] = useState({
        privateImages: 0,
        publicImages: 0,
        prompts: 0,
        characters: 0
    });

    const CACHE_TIME = 5 * 60 * 1000; // 5 minutes cache

    // Sync to LocalStorage
    useEffect(() => {
        if (privateImages.length > 0) localStorage.setItem('cache_private_images', JSON.stringify(privateImages));
    }, [privateImages]);

    useEffect(() => {
        if (publicImages.length > 0) localStorage.setItem('cache_public_images', JSON.stringify(publicImages));
    }, [publicImages]);

    useEffect(() => {
        if (prompts.length > 0) localStorage.setItem('cache_prompts', JSON.stringify(prompts));
    }, [prompts]);

    useEffect(() => {
        if (characters.length > 0) localStorage.setItem('cache_characters', JSON.stringify(characters));
    }, [characters]);

    useEffect(() => {
        // Reset fetch timestamps and clear private data when user changes (login/logout)
        setLastFetch({
            privateImages: 0,
            publicImages: 0,
            prompts: 0,
            characters: 0
        });

        if (!user) {
            setPrivateImages([]);
            setPrompts([]);
            setCharacters([]);
            localStorage.removeItem('cache_private_images');
            localStorage.removeItem('cache_prompts');
            localStorage.removeItem('cache_characters');
        }
    }, [user?.id]);

    const fetchImages = useCallback(async (view = 'private', force = false) => {
        const now = Date.now();
        const cacheKey = view === 'public' ? 'publicImages' : 'privateImages';

        if (view === 'private' && !user) return;

        if (!force && now - lastFetch[cacheKey] < CACHE_TIME && (view === 'public' ? publicImages : privateImages).length > 0) {
            return;
        }

        setIsLoadingImages(true);
        try {
            let data;
            if (view === 'public') {
                data = await galleryApi.getPublic();
                const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPublicImages(sorted);
                setLastFetch(prev => ({ ...prev, publicImages: now }));
            } else if (user) {
                data = await galleryApi.getPrivate();
                const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPrivateImages(sorted);
                setLastFetch(prev => ({ ...prev, privateImages: now }));
            }
        } catch (err) {
            console.error(`Failed to fetch ${view} images:`, err);
        } finally {
            setIsLoadingImages(false);
        }
    }, [user, lastFetch, publicImages.length, privateImages.length]);

    const fetchPrompts = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && now - lastFetch.prompts < CACHE_TIME && prompts.length > 0) {
            return;
        }

        setIsLoadingPrompts(true);
        try {
            let data;
            if (user) {
                data = await promptsApi.get();
            } else {
                data = JSON.parse(localStorage.getItem('generated_prompts') || '[]');
            }
            setPrompts(data || []);
            setLastFetch(prev => ({ ...prev, prompts: now }));
        } catch (err) {
            console.error('Failed to fetch prompts:', err);
        } finally {
            setIsLoadingPrompts(false);
        }
    }, [user, lastFetch.prompts, prompts.length]);

    const fetchCharacters = useCallback(async (force = false) => {
        const now = Date.now();
        if (!user) return;
        if (!force && now - lastFetch.characters < CACHE_TIME && characters.length > 0) {
            return;
        }

        setIsLoadingCharacters(true);
        try {
            const data = await charactersApi.getAll();
            setCharacters(data || []);
            setLastFetch(prev => ({ ...prev, characters: now }));
        } catch (err) {
            console.error('Failed to fetch characters:', err);
        } finally {
            setIsLoadingCharacters(false);
        }
    }, [user, lastFetch.characters, characters.length]);

    const addImage = (newImages) => {
        const imagesToAdd = Array.isArray(newImages) ? newImages : [newImages];
        setPrivateImages(prev => [...imagesToAdd, ...prev]);
        const publicToAdd = imagesToAdd.filter(img => img.isPublic);
        if (publicToAdd.length > 0) {
            setPublicImages(prev => [...publicToAdd, ...prev]);
        }
    };

    const updateImageInCache = (updated) => {
        setPrivateImages(prev => prev.map(img => img.id === updated.id ? updated : img));
        setPublicImages(prev => prev.map(img => img.id === updated.id ? updated : img));
    };

    const removeImageFromCache = (id) => {
        setPrivateImages(prev => prev.filter(img => img.id !== id));
        setPublicImages(prev => prev.filter(img => img.id !== id));
    };

    const addPromptToCache = (newPrompt) => {
        setPrompts(prev => [newPrompt, ...prev]);
    };

    const removePromptFromCache = (id) => {
        setPrompts(prev => prev.filter(p => p.id !== id));
    };

    const addCharacterToCache = (newChar) => {
        setCharacters(prev => [newChar, ...prev]);
    };

    const updateCharacterInCache = (updated) => {
        setCharacters(prev => prev.map(c => c.id === updated.id ? updated : c));
    };

    const removeCharacterFromCache = (id) => {
        setCharacters(prev => prev.filter(c => c.id !== id));
    };

    const value = {
        privateImages,
        publicImages,
        prompts,
        characters,
        isLoadingImages,
        isLoadingPrompts,
        isLoadingCharacters,
        fetchImages,
        fetchPrompts,
        fetchCharacters,
        addImage,
        updateImageInCache,
        removeImageFromCache,
        addPromptToCache,
        removePromptFromCache,
        addCharacterToCache,
        updateCharacterInCache,
        removeCharacterFromCache
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
