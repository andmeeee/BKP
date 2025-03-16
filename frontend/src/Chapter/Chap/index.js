import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Chap.css';

function ChapPage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [newChapter, setNewChapter] = useState({ name: '' });
  const [editChapterId, setEditChapterId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const chapters = await fetchDocuments(documentId);
        setChapters(chapters);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    fetchData();
  }, [documentId]);

  const fetchDocuments = async (documentId) => {
    try {
      const albumContentResponse = await fetch(`https://localhost:7136/api/DocumentContent/${documentId}`);
      if (!albumContentResponse.ok) {
        throw new Error(`Failed to fetch album content: ${albumContentResponse.statusText}`);
      }

      const chaptersIds = await albumContentResponse.json();

      if (!chaptersIds.length) return [];

      const documentsResponse = await fetch(`https://localhost:7136/api/Chapter?ids=${chaptersIds.join(',')}`);
      if (!documentsResponse.ok) {
        throw new Error(`Failed to fetch documents: ${documentsResponse.statusText}`);
      }

      const chapters = await documentsResponse.json();
      console.log('Fetched documents:', chapters);
      return chapters;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewChapter({ ...newChapter, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const addChapter = async () => {
    try {
      // Сначала создаем главу (Chapter)
      const response = await fetch('https://localhost:7136/api/Chapter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newChapter, documentId }),
      });
  
      if (!response.ok) {
        console.error('Failed to add chapter:', response.statusText);
        return;
      }
  
      const createdChapter = await response.json();
  
      // Затем создаем запись в DocumentContent, связывающую главу с документом
      const documentContentResponse = await fetch('https://localhost:7136/api/DocumentContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, chapterId: createdChapter.id }),
      });
  
      if (!documentContentResponse.ok) {
        console.error('Failed to link chapter to document:', documentContentResponse.statusText);
        return;
      }
  
      // Обновляем список глав
      setChapters([...chapters, createdChapter]);
      setNewChapter({ name: '' });
    } catch (error) {
      console.error('Error adding chapter:', error);
    }
  };

  const deleteChapter = async (id) => {
    try {
      const response = await fetch(`https://localhost:7136/api/Chapter/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setChapters(chapters.filter(chapter => chapter.id !== id));
      } else {
        console.error('Failed to delete chapter:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const startEditing = (chapter) => {
    setEditChapterId(chapter.id);
    setEditFormData(chapter);
  };

  const cancelEditing = () => {
    setEditChapterId(null);
    setEditFormData({ name: '' });
  };

  const saveChapter = async () => {
    try {
      const response = await fetch(`https://localhost:7136/api/Chapter/${editChapterId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedChapters = chapters.map(chapter =>
          chapter.id === editChapterId ? { ...chapter, ...editFormData } : chapter
        );
        setChapters(updatedChapters);
        cancelEditing();
      } else {
        console.error('Failed to update chapter:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  const navigateToTable = (chapterId) => {
    navigate(`/tables/${chapterId}`);
  };

  return (
    <>
    <div className='top'>
      <h2>Выберите раздел</h2>
    </div>
    <div className="chapter-container">
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter) => (
            <tr key={chapter.id}>
              {editChapterId === chapter.id ? (
                <>
                  <td><input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} /></td>
                  <td>
                    <button onClick={saveChapter}><img className='save' src='/image/save.png' alt="Save" /></button>
                    <button onClick={cancelEditing}><img className='del' src='/image/del.png' alt="Cancel" /></button>
                  </td>
                </>
              ) : (
                <>
                  <td onClick={() => navigateToTable(chapter.id)} style={{ cursor: 'pointer'}}>
                    {chapter.name}
                  </td>
                  <td>
                    <button onClick={() => startEditing(chapter)}><img className='edit' src='/image/edit.png' alt="Edit" /></button>
                    <button onClick={() => deleteChapter(chapter.id)}><img className='del' src='/image/del.png' alt="Delete" /></button>
                  </td>
                </>
              )}
            </tr>
          ))}
          <tr className="new-chapter-row">
            <td><input type="text" name="name" value={newChapter.name} onChange={handleInputChange} placeholder="Название" /></td>
            <td><button onClick={addChapter}>Добавить</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    </>
  );
}

export default ChapPage;
