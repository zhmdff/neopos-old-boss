import { useState, useEffect } from 'react';

/**
 * A simple hook to cache API data in localStorage for offline viewing.
 * @param {string} cacheKey - The key to use in localStorage
 * @param {Function} fetcher - The async function that fetches data
 * @param {any} initialData - Initial state value
 * @returns {[any, boolean, Error | null, Function]} - [data, loading, error, refresh]
 */
export const useOfflineCache = (cacheKey, fetcher, initialData = null) => {
  const [data, setData] = useState(() => {
    const cached = localStorage.getItem(`boss_cache_${cacheKey}`);
    return cached ? JSON.parse(cached) : initialData;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (navigator.onLine) {
        const result = await fetcher();
        setData(result);
        localStorage.setItem(`boss_cache_${cacheKey}`, JSON.stringify(result));
      } else {
        const cached = localStorage.getItem(`boss_cache_${cacheKey}`);
        if (cached) {
          setData(JSON.parse(cached));
        }
      }
    } catch (err) {
      setError(err);
      console.error(`[useOfflineCache] Error fetching ${cacheKey}:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleOnline = () => fetchData();
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [cacheKey]);

  return [data, loading, error, fetchData];
};

export default useOfflineCache;
