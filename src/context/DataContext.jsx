import { createContext, useContext, useState, useCallback, useEffect } from 'react';
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

    useEffect(() => {
        // Reset fetch timestamps when user changes (login/logout)
        setLastFetch({
            privateImages: 0,
            publicImages: 0,
            prompts: 0
        });
        // Also clear data to avoid showing previous user's images
        setPrivateImages([]);
        setPrompts([]);
    }, [user?.id]);

    const fetchImages = useCallback(async (view = 'private', force = false) => {
        const now = Date.now();
        const cacheKey = view === 'public' ? 'publicImages' : 'privateImages';

        // Guard: Don't fetch private images if not logged in
        if (view === 'private' && !user) return;

        if (!force && now - lastFetch[cacheKey] < CACHE_TIME) {
            return;
        }

        setIsLoadingImages(true);
        try {
            let data;
            if (view === 'public') {
                data = await galleryApi.getPublic();
                // Sort by newest first
                const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPublicImages(sorted);
                setLastFetch(prev => ({ ...prev, publicImages: now }));
            } else if (user) {
                data = await galleryApi.getPrivate();
                // Sort by newest first
                const sorted = (data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setPrivateImages(sorted);
                setLastFetch(prev => ({ ...prev, privateImages: now }));
            }
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
