import { createContext, useContext, useState, useCallback } from 'react';
import { galleryApi, promptsApi } from '../services/api';

const DataContext = createContext();

export function DataProvider({ children, user }) {
    const [privateImages, setPrivateImages] = useState([]);
    const [publicImages, setPublicImages] = useState([]);
    const [prompts, setPrompts] = useState([]);

    const [isLoadingImages, setIsLoadingImages] = useState(false);
    const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);

    const [lastFetch, setLastFetch] = useState({
        privateImages: 0,
        publicImages: 0,
        prompts: 0
    });

    const CACHE_TIME = 5 * 60 * 1000; // 5 minutes cache

    const fetchImages = useCallback(async (view = 'private', force = false) => {
        const now = Date.now();
        const cacheKey = view === 'public' ? 'publicImages' : 'privateImages';

        if (!force && now - lastFetch[cacheKey] < CACHE_TIME) {
            return;
        }

        setIsLoadingImages(true);
        try {
            let data;
            if (view === 'public') {
                data = await galleryApi.getPublic();
                setPublicImages(data || []);
            } else if (user) {
                data = await galleryApi.getPrivate();
                setPrivateImages(data || []);
            }
            setLastFetch(prev => ({ ...prev, [cacheKey]: now }));
        } catch (err) {
            console.error(`Failed to fetch ${view} images:`, err);
        } finally {
            setIsLoadingImages(false);
        }
    }, [user, lastFetch]);

    const fetchPrompts = useCallback(async (force = false) => {
        const now = Date.now();
        if (!force && now - lastFetch.prompts < CACHE_TIME) {
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
    }, [user, lastFetch.prompts]);

    const addImage = (newImage) => {
        setPrivateImages(prev => [newImage, ...prev]);
        if (newImage.isPublic) {
            setPublicImages(prev => [newImage, ...prev]);
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

    const value = {
        privateImages,
        publicImages,
        prompts,
        isLoadingImages,
        isLoadingPrompts,
        fetchImages,
        fetchPrompts,
        addImage,
        updateImageInCache,
        removeImageFromCache,
        addPromptToCache,
        removePromptFromCache
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
