import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Doc.css';

function DocumentPage() {
  const { albumId } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [newDocument, setNewDocument] = useState({ name: '', code: '', strCount: 0, develop: '' });
  const [editDocumentId, setEditDocumentId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', code: '', strCount: 0, develop: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const documents = await fetchDocuments(albumId);
        setDocuments(documents);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchData();
  }, [albumId]);

  const fetchDocuments = async (albumId) => {
    try {
      const albumContentResponse = await fetch(`https://localhost:7136/api/AlbumContent/${albumId}`);
      if (!albumContentResponse.ok) {
        throw new Error(`Failed to fetch album content: ${albumContentResponse.statusText}`);
      }

      const documentIds = await albumContentResponse.json();

      if (!documentIds.length) return [];

      const documentsResponse = await fetch(`https://localhost:7136/api/Document?ids=${documentIds.join(',')}`);
      if (!documentsResponse.ok) {
        throw new Error(`Failed to fetch documents: ${documentsResponse.statusText}`);
      }

      const documents = await documentsResponse.json();
      console.log('Fetched documents:', documents);
      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDocument({ ...newDocument, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const addDocument = async () => {
    try {
      const response = await fetch('https://localhost:7136/api/Document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newDocument, albumId }),
      });

      if (!response.ok) {
        console.error('Failed to add document:', response.statusText);
        return;
      }

      const createdDocument = await response.json();

      const albumContentResponse = await fetch('https://localhost:7136/api/AlbumContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumId, documentId: createdDocument.id }),
      });

      if (!albumContentResponse.ok) {
        console.error('Failed to link document to album:', albumContentResponse.statusText);
      }

      const updatedDocuments = await fetchDocuments(albumId);
      setDocuments(updatedDocuments);
      setNewDocument({ name: '', code: '', strCount: 0, develop: '' });
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const deleteDocument = async (id) => {
    try {
      const response = await fetch(`https://localhost:7136/api/Document/${id}`, { method: 'DELETE' });
      if (response.ok) {
        const updatedDocuments = await fetchDocuments(albumId);
        setDocuments(updatedDocuments);
      } else {
        console.error('Failed to delete document:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const startEditing = (document) => {
    setEditDocumentId(document.id);
    setEditFormData(document);
  };

  const cancelEditing = () => {
    setEditDocumentId(null);
    setEditFormData({ name: '', code: '', strCount: 0, develop: '' });
  };

  const saveDocument = async () => {
    try {
      const response = await fetch(`https://localhost:7136/api/Document/${editDocumentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (response.ok) {
        const updatedDocuments = await fetchDocuments(albumId);
        setDocuments(updatedDocuments);
        cancelEditing();
      } else {
        console.error('Failed to update document:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const handleNavigate = (documentId) => {
    navigate(`/chapters/${documentId}`);
  };

  return (
    <>
    <div className='top'>
      <h2>Выберите документ</h2>
    </div>
    <div className="document-container">
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Код</th>
            <th>Количество страниц</th>
            <th>Разработчик</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => (
            <tr key={document.id}>
              {editDocumentId === document.id ? (
                <>
                  <td><input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} /></td>
                  <td><input type="text" name="code" value={editFormData.code} onChange={handleEditInputChange} /></td>
                  <td><input type="number" name="strCount" value={editFormData.strCount} onChange={handleEditInputChange} /></td>
                  <td><input type="text" name="develop" value={editFormData.develop} onChange={handleEditInputChange} /></td>
                  <td>
                    <button onClick={saveDocument}><img className='save' src='/image/save.png' alt="Save" /></button>
                    <button onClick={cancelEditing}><img className='del' src='/image/del.png' alt="Cancel" /></button>
                  </td>
                </>
              ) : (
                <>
                  <td onClick={() => handleNavigate(document.id)} style={{ cursor: 'pointer' }}>
                    {document.name}
                  </td>
                  <td>{document.code}</td>
                  <td>{document.strCount}</td>
                  <td>{document.develop}</td>
                  <td>
                    <button onClick={() => startEditing(document)}><img className='edit' src='/image/edit.png' alt="Edit" /></button>
                    <button onClick={() => deleteDocument(document.id)}><img className='del' src='/image/del.png' alt="Delete" /></button>
                  </td>
                </>
              )}
            </tr>
          ))}
          <tr className="new-document-row">
            <td><input type="text" name="name" value={newDocument.name} onChange={handleInputChange} placeholder="Название" /></td>
            <td><input type="text" name="code" value={newDocument.code} onChange={handleInputChange} placeholder="Код" /></td>
            <td><input type="number" name="strCount" value={newDocument.strCount} onChange={handleInputChange} placeholder="Страницы" /></td>
            <td><input type="text" name="develop" value={newDocument.develop} onChange={handleInputChange} placeholder="Разработчик" /></td>
            <td><button onClick={addDocument}>Добавить</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    </>
  );
}

export default DocumentPage;