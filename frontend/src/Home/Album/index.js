import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Album.css';

function Album() {
  const [albums, setAlbums] = useState([]);
  const [newAlbum, setNewAlbum] = useState({ name: '', code: '', docCount: 0, develop: '' });
  const [editAlbumId, setEditAlbumId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', code: '', docCount: 0, develop: '' });

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await fetch('https://localhost:7136/api/Album');
      if (!response.ok) {
        console.error('Failed to fetch albums:', response.statusText);
        return;
      }
      const data = await response.json();
      setAlbums(data);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAlbum({ ...newAlbum, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const addAlbum = async () => {
    try {
      const response = await fetch('https://localhost:7136/api/Album', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAlbum),
      });
      if (response.ok) {
        fetchAlbums();
        setNewAlbum({ name: '', code: '', docCount: 0, develop: '' });
      } else {
        console.error('Failed to add album:', response.statusText);
      }
    } catch (error) {
      console.error('Error adding album:', error);
    }
  };

  const deleteAlbum = async (id) => {
    try {
      const response = await fetch(`https://localhost:7136/api/Album/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchAlbums();
      } else {
        console.error('Failed to delete album:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting album:', error);
    }
  };

  const startEditing = (album) => {
    setEditAlbumId(album.id);
    setEditFormData(album);
  };

  const cancelEditing = () => {
    setEditAlbumId(null);
    setEditFormData({ name: '', code: '', docCount: 0, develop: '' });
  };

  const saveAlbum = async () => {
    try {
      const response = await fetch(`https://localhost:7136/api/Album/${editAlbumId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (response.ok) {
        fetchAlbums();
        cancelEditing();
      } else {
        console.error('Failed to update album:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating album:', error);
    }
  };

  const handleNavigate = (id) => {
    console.log("Navigating to: ", `/documents/${id}`);
    navigate(`/documents/${id}`);
  };
  

  const navigate = useNavigate();

  return (
    <>
    <div className='top'>
      <h2>Выберите альбом</h2>
    </div>
    <div className="album-container">
      <table className='table'>
        <thead>
          <tr>
            <th>Название</th>
            <th>Код</th>
            <th>Количество документов</th>
            <th>Разработчик</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {albums.map((album) => (
            <tr key={album.id}>
              {editAlbumId === album.id ? (
                <>
                  <td><input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} /></td>
                  <td><input type="text" name="code" value={editFormData.code} onChange={handleEditInputChange} /></td>
                  <td><input type="number" name="docCount" value={editFormData.docCount} onChange={handleEditInputChange} /></td>
                  <td><input type="text" name="develop" value={editFormData.develop} onChange={handleEditInputChange} /></td>
                  <td>
                    <button onClick={saveAlbum}><img alt='save' className='save' src='image/save.png'/></button>
                    <button onClick={cancelEditing}><img alt='cancel' className='cancel' src='image/del.png'/></button>
                  </td>
                </>
              ) : (
                <>
                  
                  <td onClick={() => handleNavigate(album.id)} style={{ cursor: 'pointer'}}>
                    {album.name}
                  </td>
                  <td>{album.code}</td>
                  <td>{album.docCount}</td>
                  <td>{album.develop}</td>
                  <td>
                    <button onClick={() => startEditing(album)}><img alt='edit' className='edit' src='image/edit.png'/></button>
                    <button onClick={() => deleteAlbum(album.id)}><img alt='del' className='del' src='image/del.png'/></button>
                  </td>
                </>
              )}
            </tr>
          ))}
          <tr className="new-album-row">
            <td><input type="text" name="name" value={newAlbum.name} onChange={handleInputChange} placeholder="Название" /></td>
            <td><input type="text" name="code" value={newAlbum.code} onChange={handleInputChange} placeholder="Код" /></td>
            <td><input type="number" name="docCount" value={newAlbum.docCount} onChange={handleInputChange} placeholder="Кол-во документов" /></td>
            <td><input type="text" name="develop" value={newAlbum.develop} onChange={handleInputChange} placeholder="Разработчик" /></td>
            <td><button onClick={addAlbum}>Добавить</button></td>
          </tr>
        </tbody>
      </table>
    </div>
    </>
  );
}

export default Album;
