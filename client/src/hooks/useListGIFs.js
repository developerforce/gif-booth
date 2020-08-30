import { useState, useEffect } from 'react';

const itemsPerPage = 20;

let loadingTimeout;

export default function useListGIFs() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPageState] = useState(0);

  const gifCount = data.length;

  const pageCount = Math.ceil(gifCount / itemsPerPage);

  const setPage = (index) => {
    if (loadingTimeout) clearTimeout(loadingTimeout);
    if (!isLoading) setIsLoading(true);
    setPageState(index);
    // setting a delay on loading the images on incriment here so we don't spam img requests
    loadingTimeout = setTimeout(() => setIsLoading(false), 500);
  };

  const start = page * itemsPerPage;
  const gifs = data.slice(start, start + itemsPerPage);

  useEffect(() => {
    listGifs();
  }, []);

  const listGifs = async () => {
    try {
      const res = await fetch('/listGifs');
      const json = await res.json();
      setData(json);
      setIsLoading(false);
      setIsInitializing(false);
    } catch (e) {
      console.error('Error:', e);
    }
  };

  return {
    page,
    gifCount: data.length,
    gifs,
    pageCount,
    start: start + 1,
    end: page < pageCount - 1 ? start + itemsPerPage : gifCount,
    isLoading,
    isInitializing,
    setPage,
  };
}
