import React, { useState, useEffect } from 'react';
import './Argument.css'; // Подключаем стили

function Argument() {
  const [argumentsList, setArgumentsList] = useState([]);
  const [newArgument, setNewArgument] = useState({ name: '', descriprion: '', dataType: '' });
  const [editArgumentId, setEditArgumentId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', descriprion: '', dataType: '' });

  // Функция для получения списка аргументов с сервера
  const fetchArguments = async () => {
    try {
      const response = await fetch('https://localhost:7136/api/Argument');
      if (!response.ok) {
        throw new Error('Ошибка при получении данных');
      }
      const data = await response.json();
      setArgumentsList(data);
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  // Загружаем аргументы при монтировании компонента
  useEffect(() => {
    fetchArguments();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewArgument({ ...newArgument, [name]: value });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const addArgument = async () => {
    try {
      const response = await fetch('https://localhost:7136/api/Argument', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newArgument),
      });
      if (!response.ok) {
        throw new Error('Ошибка при добавлении аргумента');
      }
      const addedArgument = await response.json();
      setArgumentsList([...argumentsList, addedArgument]);
      setNewArgument({ name: '', descriprion: '', dataType: '' });
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const deleteArgument = async (id) => {
    try {
      const response = await fetch(`https://localhost:7136/api/Argument/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Ошибка при удалении аргумента');
      }
      setArgumentsList(argumentsList.filter(argument => argument.id !== id));
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const startEditing = (argument) => {
    setEditArgumentId(argument.id);
    setEditFormData(argument);
  };

  const cancelEditing = () => {
    setEditArgumentId(null);
    setEditFormData({ name: '', descriprion: '', dataType: '' });
  };

  const saveArgument = async () => {
    try {
      console.log('Saving argument with ID:', editArgumentId);
      console.log('Data to save:', editFormData);
  
      const response = await fetch(`https://localhost:7136/api/Argument/${editArgumentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });
  
      if (!response.ok) {
        throw new Error('Ошибка при обновлении аргумента');
      }
  
      const updatedArgument = await response.json();
      console.log('Updated argument from server:', updatedArgument);
  
      const updatedArguments = argumentsList.map(argument =>
        argument.id === editArgumentId ? updatedArgument : argument
      );
  
      setArgumentsList(updatedArguments);
      cancelEditing();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  // Функция для расшифровки типа данных
  const decodeDataType = (code) => {
    switch (code) {
      case 'int':
        return 'Число';
      case 'string':
        return 'Строка';
      case 'image':
        return 'Изображение';
      default:
        return 'Неизвестный тип';
    }
  };

  return (
    <>
      <div className='top'>
        <h2>Список атрибутов</h2>
      </div>
      <div className="argument-container">
        <table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Описание</th>
              <th>Тип данных</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {argumentsList.map((argument) => (
              <tr key={argument.id}>
              {editArgumentId === argument.id ? (
                <>
                  <td>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="descriprion"
                      value={editFormData.descriprion}
                      onChange={handleEditInputChange}
                    />
                  </td>
                  <td>{decodeDataType(argument.dataType)}</td>
                  <td>
                    <button onClick={saveArgument}>
                      <img className='save' src='/image/save.png' alt="save" />
                    </button>
                    <button onClick={cancelEditing}>
                      <img className='del' src='/image/del.png' alt="Cancel" />
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{argument.name}</td>
                  <td>{argument.descriprion}</td>
                  <td>{decodeDataType(argument.dataType)}</td>
                  <td>
                    <button onClick={() => startEditing(argument)}>
                      <img className='edit' src='/image/edit.png' alt="edit" />
                    </button>
                    <button onClick={() => deleteArgument(argument.id)}>
                      <img className='del' src='/image/del.png' alt="Cancel" />
                    </button>
                  </td>
                </>
              )}
            </tr>
            ))}
            <tr className="new-argument-row">
              <td>
                <input
                  type="text"
                  name="name"
                  value={newArgument.name}
                  onChange={handleInputChange}
                  placeholder="Название"
                />
              </td>
              <td>
                <input
                  type="text"
                  name="descriprion"
                  value={newArgument.descriprion}
                  onChange={handleInputChange}
                  placeholder="Описание"
                />
              </td>
              <td>
                <div className="select-wrapper">
                    <select
                    name="dataType"
                    value={newArgument.dataType}
                    onChange={handleInputChange}
                    >
                    <option value="">Выберите тип</option>
                    <option value="int">Число</option>
                    <option value="string">Строка</option>
                    <option value="image">Изображение</option>
                    </select>
                </div>
                </td>
              <td>
                <button onClick={addArgument}>Добавить</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

export default Argument;