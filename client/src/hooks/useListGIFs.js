import { useState, useEffect } from 'react';

const itemsPerPage = 20;

let mounted;
let loadingTimeout;
export default function useListGIFs() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPageState] = useState(0);

  const gifCount = data.length;
  const pageCount = Math.ceil(gifCount / itemsPerPage);
  const start = page * itemsPerPage;
  const gifs = data.slice(start, start + itemsPerPage);

  const cancelLoadingTimeout = () => {
    if (loadingTimeout) clearTimeout(loadingTimeout);
  };

  const setPage = (index) => {
    cancelLoadingTimeout();
    if (!isLoading) setIsLoading(true);
    setPageState(index);
    // setting a delay on loading the images on incriment here so we don't spam img requests
    loadingTimeout = setTimeout(() => setIsLoading(false), 500);
  };

  const listGifs = async () => {
    try {
      const res = await fetch('/listGifs');
      const json = await res.json();
      if (!mounted) return;
      setData(json);
      setIsLoading(false);
      setIsInitializing(false);
    } catch (e) {
      console.error('Error:', e);
    }
  };

  useEffect(() => {
    mounted = true;
    listGifs();
    return () => {
      mounted = false;
      cancelLoadingTimeout();
    };
  }, []);

  return {
    page,
    gifCount: data.length,
    gifs,
    pageCount,
    start: gifCount > 0 ? start + 1 : 0,
    end: Math.min(start + itemsPerPage, gifCount),
    isLoading,
    isInitializing,
    setPage,
  };
}
