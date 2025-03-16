import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './NNTab.css';

function NNTablePage() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const [nnTables, setNNTables] = useState([]);
  const [editnnTableId, setEditnnTableId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', place: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nnTables = await fetchNNTables(chapterId);
        setNNTables(nnTables);
      } catch (error) {
        console.error('Error fetching NN tables:', error);
      }
    };

    fetchData();
  }, [chapterId]);

  const fetchNNTables = async (chapterId) => {
    try {
      const chapterContentResponse = await fetch(`https://localhost:7136/api/ChapterContent/${chapterId}`);
      if (!chapterContentResponse.ok) {
        throw new Error(`Failed to fetch chapter content: ${chapterContentResponse.statusText}`);
      }

      const nnTableIds = await chapterContentResponse.json();

      if (!nnTableIds.length) return [];

      const nnTablesResponse = await fetch(`https://localhost:7136/api/NNTable?ids=${nnTableIds.join(',')}`);
      if (!nnTablesResponse.ok) {
        throw new Error(`Failed to fetch NN tables: ${nnTablesResponse.statusText}`);
      }

      const nnTables = await nnTablesResponse.json();
      console.log('Fetched NN tables:', nnTables);
      return nnTables;
    } catch (error) {
      console.error('Error fetching NN tables:', error);
      throw error;
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const deleteNNTable = async (id) => {
    try {
      const response = await fetch(`https://localhost:7136/api/NNTable/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setNNTables(nnTables.filter(nnTable => nnTable.id !== id));
      } else {
        console.error('Failed to delete NN table:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting NN table:', error);
    }
  };

  const startEditing = (nnTable) => {
    setEditnnTableId(nnTable.id);
    setEditFormData(nnTable);
  };

  const cancelEditing = () => {
    setEditnnTableId(null);
    setEditFormData({ name: '', place: '' });
  };

  const saveNNTable = async () => {
    try {
      const response = await fetch(`https://localhost:7136/api/NNTable/${editnnTableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });

      if (response.ok) {
        const updatedNNTables = nnTables.map(nnTable =>
          nnTable.id === editnnTableId ? { ...nnTable, ...editFormData } : nnTable
        );
        setNNTables(updatedNNTables);
        cancelEditing();
      } else {
        console.error('Failed to update NN table:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating NN table:', error);
    }
  };

  const handleAddButtonClick = () => {
    navigate(`/create-table/${chapterId}`);
  };

  const handleTableNameClick = (tableId) => {
    navigate(`/result-table/${tableId}`);
  };

  return (
    <>
    <div className='top'>
      <h2>Выберите таблицу</h2>
      <button onClick={handleAddButtonClick} className="add-nntable-button">
        Добавить
      </button>
    </div>
    <div className="nntable-container">
      <table>
        <thead>
          <tr>
            <th>Название</th>
            <th>Расположение</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {nnTables.map((nnTable) => (
            <tr key={nnTable.id}>
              {editnnTableId === nnTable.id ? (
                <>
                  <td><input type="text" name="name" value={editFormData.name} onChange={handleEditInputChange} /></td>
                  <td><input type="text" name="place" value={editFormData.place} onChange={handleEditInputChange} /></td>
                  <td>
                    <button onClick={saveNNTable}><img className='save' src='/image/save.png' alt="Save" /></button>
                    <button onClick={cancelEditing}><img className='del' src='/image/del.png' alt="Cancel" /></button>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <span onClick={() => handleTableNameClick(nnTable.id)} style={{ cursor: 'pointer'}}>
                      {nnTable.name}
                    </span>
                  </td>
                  <td>{nnTable.place}</td>
                  <td>
                    <button onClick={() => startEditing(nnTable)}><img className='edit' src='/image/edit.png' alt="Edit" /></button>
                    <button onClick={() => deleteNNTable(nnTable.id)}><img className='del' src='/image/del.png' alt="Delete" /></button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    
    </>
  );
}

export default NNTablePage;