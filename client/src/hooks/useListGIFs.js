import { useState, useEffect } from 'react';

export default function useListGIFs() {
  const [data, setData] = useState([]);

  useEffect(() => {
    listGifs();
  }, []);

  const listGifs = async () => {
    try {
      const res = await fetch('/listGifs');
      const json = await res.json();
      setData(json.Contents);
    } catch (e) {
      console.error('Error:', e);
    }
  };

  return data;
}
