import { useState, useEffect } from 'react';

const itemsPerPage = 20;

export default function useListGIFs() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);

  const gifCount = data.length;

  const pageCount = Math.ceil(gifCount / itemsPerPage);

  const prevPage = page > 1 ? () => setPage(page - 1) : null;
  const nextPage = page < pageCount ? () => setPage(page + 1) : null;

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
    end: start + itemsPerPage,
    isLoading,
  };
}
