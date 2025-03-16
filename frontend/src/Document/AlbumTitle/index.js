import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import './AlbumTitle.css';

function AlbumTitle() {
  const { albumId } = useParams();
  const [album, setAlbum] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbum = async () => {
      try {
        const response = await fetch(`https://localhost:7136/api/Album/${albumId}`);
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных альбома');
        }
        const data = await response.json();
        setAlbum(data);
      } catch (error) {
        setError(error.message);
        console.error(error);
      }
    };

    fetchAlbum();
  }, [albumId]);

  if (error) {
    return <div className="error-message">Ошибка: {error}</div>;
  }

  if (!album) {
    return <div className="loading-message">Загрузка...</div>;
  }

  return (
    <div className="album-title-container">
        
      <p><strong>Альбом: </strong>{album.name}</p>
      <p><strong>Код альбома: </strong>{album.code}</p>
    </div>
  );
}

export default AlbumTitle;
