import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './NNTabTitle.css'; // Импортируем новый файл стилей

function CustomSectionTitle() {
  const { chapterId } = useParams();
  const [album, setAlbum] = useState(null);
  const [document, setDocument] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocumentId = async () => {
      try {
        const response = await fetch(`https://localhost:7136/api/DocumentContent/chapter/${chapterId}`);
        if (!response.ok) {
          throw new Error('Ошибка при загрузке ID альбома');
        }
        const documentIds = await response.json();
        if (documentIds.length > 0) {
          fetchDocument(documentIds[0]);
          fetchAlbumId(documentIds[0]);
        }
      } catch (error) {
        setError(error.message);
        console.error(error);
      }
    };

    const fetchAlbumId = async (documentId) => {
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

    const fetchDocument = async (documentId) => {
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

    const fetchChapter = async () => {
      try {
        const response = await fetch(`https://localhost:7136/api/Chapter/${chapterId}`);
        if (!response.ok) {
          throw new Error('Ошибка при загрузке данных раздела');
        }
        const data = await response.json();
        setChapter(data);
      } catch (error) {
        setError(error.message);
        console.error(error);
      }
    };

    fetchDocumentId();
    fetchChapter();
  }, [chapterId]);

  if (error) {
    return <div className="error-message">Ошибка: {error}</div>;
  }

  if (!album || !document || !chapter) {
    return <div className="loading-message">Загрузка...</div>;
  }

  return (
    <div className="section-title">
        
      <div className="section-title-container-2">
        <p><strong>Документ: </strong>{document.name}</p>
        <p><strong>Код документа: </strong>{document.code}</p>
      </div>

      <div className="section-title-container">
        <p><strong>Альбом: </strong>{album.name}</p>
        <p><strong>Код альбома: </strong>{album.code}</p>
      </div>

      <div className="section-title-container-3">
        <p><strong>Раздел: </strong>{chapter.name}</p>
      </div>
      
      
    </div>
  );
}

export default CustomSectionTitle;