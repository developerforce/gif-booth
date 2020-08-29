import { useState, useEffect } from 'react';

const itemsPerPage = 20;

let loadingTimeout;

export default function useListGIFs() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);

  const gifCount = data.length;

  const pageCount = Math.ceil(gifCount / itemsPerPage);

  const createIncrement = (condition, difference) => {
    if (!condition) return null;
    return () => {
      if (loadingTimeout) clearTimeout(loadingTimeout);
      if (!isLoading) setIsLoading(true);
      setPage(page + difference);
      // setting a delay on loading the images on incriment here so we don't spam img requests
      loadingTimeout = setTimeout(() => setIsLoading(false), 500);
    };
  };

  const prevPage = createIncrement(page > 1, -1);
  const nextPage = createIncrement(page < pageCount, 1);

  const start = (page - 1) * itemsPerPage;
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
    } catch (e) {
      console.error('Error:', e);
    }
  };

  return {
    gifCount: data.length,
    gifs,
    nextPage,
    prevPage,
    pageCount,
    start: start + 1,
    end: nextPage ? start + itemsPerPage : gifCount,
    isLoading,
  };
}
