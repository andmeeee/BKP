import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ChapTitle.css';

function ChapTitle() {
  const { documentId } = useParams();
  const [album, setAlbum] = useState(null);
  const [document, setDocument] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlbumId = async () => {
      try {
        const response = await fetch(`https://localhost:7136/api/AlbumContent/document/${documentId}`);
        if (!response.ok) {
          throw new Error('Ошибка при загрузке ID альбома');
        }
        const albumIds = await response.json();
        if (albumIds.length > 0) {
          fetchAlbum(albumIds[0]);
        }
      } catch (error) {
        setError(error.message);
        console.error(error);
      }
    };

    const fetchAlbum = async (albumId) => {
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

    const fetchDocument = async () => {
      try {
        const response = await fetch(`https://localhost:7136/api/Document/${documentId}`);
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных документа');
        }
        const data = await response.json();
        setDocument(data);
      } catch (error) {
        setError(error.message);
        console.error(error);
      }
    };

    fetchAlbumId();
    fetchDocument();
  }, [documentId]);

  if (error) {
    return <div className="error-message">Ошибка: {error}</div>;
  }

  if (!album || !document) {
    return <div className="loading-message">Загрузка...</div>;
  }

  return (
    <div className="chap-title">
      <div className="chap-title-container">
        <p><strong>Альбом: </strong>{album.name}</p>
        <p><strong>Код альбома: </strong>{album.code}</p>
      </div>
      <div className="chap-title-container">
        <p><strong>Документ: </strong>{document.name}</p>
        <p><strong>Код документа: </strong>{document.code}</p>
      </div>
    </div>
  );
}

export default ChapTitle;