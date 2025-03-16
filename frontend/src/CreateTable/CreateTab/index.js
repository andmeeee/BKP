import React, { useState, useEffect } from "react";
import "./CreateTab.css";
import { useParams } from 'react-router-dom';

function CreateTab() {
  const { chapterId } = useParams();
  const [argumentsList, setArgumentsList] = useState([]);
  const [availableArguments, setAvailableArguments] = useState([]);
  const [newArgument, setNewArgument] = useState({
    name: "",
    explicitness: false,
    role: false,
    discreteness: false,
    minValue: "",
    maxValue: "",
    step: "",
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [isDiscretenessEnabled, setIsDiscretenessEnabled] = useState(false);
  const [areFieldsEnabled, setAreFieldsEnabled] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null); // Состояние для загруженного фото

  // Загрузка списка аргументов с сервера
  useEffect(() => {
    const fetchArguments = async () => {
      try {
        const response = await fetch("https://localhost:7136/api/Argument");
        const data = await response.json();
        setAvailableArguments(data);
      } catch (error) {
        console.error("Ошибка при загрузке аргументов:", error);
      }
    };

    fetchArguments();
  }, []);

  // Обработчик изменения выбранного аргумента
  const handleNewArgumentChange = (e) => {
    const { name, value, type, checked } = e.target;
    const selectedArgument = availableArguments.find((arg) => arg.name === value);

    if (name === "name") {
      const isIntType = selectedArgument?.dataType === "int";
      setIsDiscretenessEnabled(isIntType);

      if (!isIntType) {
        setNewArgument((prev) => ({
          ...prev,
          discreteness: false,
          minValue: "",
          maxValue: "",
          step: "",
        }));
        setAreFieldsEnabled(false);
      }
    }

    setNewArgument((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Обработчик изменения чекбокса "Дискретно?"
  const handleDiscretenessChange = (e) => {
    const { checked } = e.target;
    setNewArgument((prev) => ({
      ...prev,
      discreteness: checked,
      minValue: checked ? prev.minValue : "",
      maxValue: checked ? prev.maxValue : "",
      step: checked ? prev.step : "",
    }));
    setAreFieldsEnabled(checked);
  };

  // Обработчик изменения аргумента в режиме редактирования
  const handleEditArgumentChange = (index, field, value) => {
    const updatedArguments = [...argumentsList];
    const selectedArgument = availableArguments.find((arg) => arg.name === value);

    if (field === "name" && selectedArgument) {
      const isIntType = selectedArgument.dataType === "int";
      updatedArguments[index].discreteness = isIntType ? updatedArguments[index].discreteness : false;
      updatedArguments[index].minValue = isIntType ? updatedArguments[index].minValue : "";
      updatedArguments[index].maxValue = isIntType ? updatedArguments[index].maxValue : "";
      updatedArguments[index].step = isIntType ? updatedArguments[index].step : "";
    }

    updatedArguments[index][field] = value;
    setArgumentsList(updatedArguments);
  };

  // Обработчик изменения чекбокса "Дискретно?" для редактируемой строки
  const handleEditDiscretenessChange = (index, checked) => {
    const updatedArguments = [...argumentsList];
    updatedArguments[index].discreteness = checked;
    updatedArguments[index].minValue = checked ? updatedArguments[index].minValue : "";
    updatedArguments[index].maxValue = checked ? updatedArguments[index].maxValue : "";
    updatedArguments[index].step = checked ? updatedArguments[index].step : "";
    setArgumentsList(updatedArguments);
  };

  // Обработчик добавления аргумента
  const handleAddArgument = () => {
    if (newArgument.name.trim() !== "") {
      setArgumentsList([...argumentsList, newArgument]);
      setNewArgument({
        name: "",
        explicitness: false,
        role: false,
        discreteness: false,
        minValue: "",
        maxValue: "",
        step: "",
      });
      setIsDiscretenessEnabled(false);
      setAreFieldsEnabled(false);
    }
  };

  // Обработчик удаления аргумента
  const handleDeleteArgument = (index) => {
    const updatedArguments = argumentsList.filter((_, i) => i !== index);
    setArgumentsList(updatedArguments);
  };

  // Обработчик редактирования аргумента
  const handleEditArgument = (index) => {
    setEditingIndex(index);
  };

  // Обработчик сохранения аргумента
  const handleSaveArgument = (index) => {
    setEditingIndex(null);
  };

  // Обработчик изменения файла через выбор
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
    }
  };

  // Обработчик перетаскивания файла
  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);
    }
  };

  // Обработчик для предотвращения стандартного поведения браузера при перетаскивании
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleCreateTable = async () => {
    try {
      // Сбор данных из формы ненормализованной таблицы
      const nnTableData = {
        name: document.querySelector('.left-forms input[type="text"]').value, // Название
        place: document.querySelector('.left-forms input[type="text"]').value, // Расположение
      };
  
      // Создание записи в NNTable (без изображения)
      const nnTableResponse = await fetch('https://localhost:7136/api/NNTable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nnTableData),
      });
      const nnTableResult = await nnTableResponse.json();
      const nnTableId = nnTableResult.id;
  
      // Если изображение загружено, отправляем его отдельным запросом
      if (uploadedImage) {
        const fileInput = document.querySelector('#fileInput');
        const file = fileInput.files[0];
  
        const formData = new FormData();
        formData.append('file', file);
  
        const uploadImageResponse = await fetch(
          `https://localhost:7136/api/NNTable/upload/${nnTableId}`,
          {
            method: 'POST',
            body: formData,
            // Заголовок Content-Type не указываем, браузер добавит его автоматически
          }
        );
  
        if (!uploadImageResponse.ok) {
          throw new Error('Ошибка при загрузке изображения');
        }
      }

      const chapterContentData = {
        ChapterId: chapterId,
        NNTableId: nnTableId,
      };
      await fetch('https://localhost:7136/api/ChapterContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chapterContentData),
      });

    // Сбор данных из формы нормализованной таблицы
    const nTableData = {
      name: document.querySelector('.left-forms input[type="text"]').value, // Название
    };

    // Создание записи в NTable
    const nTableResponse = await fetch('https://localhost:7136/api/NTable', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nTableData),
    });
    const nTableResult = await nTableResponse.json();
    const nTableId = nTableResult.id;

    // Создание связи между NNTable и NTable
    const tableConnectionData = {
      NNTableId: nnTableId,
      NTableId: nTableId,
    };
    await fetch('https://localhost:7136/api/TableConnection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tableConnectionData),
    });

    // Создание записей в TableContent
    const tableContentPromises = argumentsList.map(async (arg) => {
      // Получаем dataType из availableArguments
      const argument = availableArguments.find((a) => a.name === arg.name);
      if (!argument) {
        throw new Error(`Argument ${arg.name} not found in availableArguments`);
      }

      const tableContentData = {
        NTableId: nTableId,
        ArgumentId: argument.id, // ID аргумента
        Bright: arg.explicitness, // Явно?
        Role: arg.role, // Функция?
        Discr: arg.discreteness, // Дискретно?
        Min: arg.minValue || 0, // Минимальное значение
        Max: arg.maxValue || 0, // Максимальное значение
        Step: arg.step || 0, // Шаг
      };

      await fetch('https://localhost:7136/api/TableContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tableContentData),
      });
    });
    await Promise.all(tableContentPromises);

    // Создание динамической таблицы
    const createTableResponse = await fetch(
      `https://localhost:7136/DynamicTable/create-table/${nTableId}`,
      {
        method: 'POST',
      }
    );
    if (createTableResponse.ok) {
      alert('Таблица успешно создана!');
    } else {
      alert('Ошибка при создании таблицы.');
    }
  } catch (error) {
    console.error('Ошибка:', error);
    alert('Произошла ошибка при создании таблицы.');
  }
};


  return (
    <div className="CreateTab">
      <div className="forms-container">
        <div className="left-forms">
          <h2>Ненормализованная таблица</h2>
          <form className="small-form">
            <div className="groupe">
            <strong>Название:</strong>
            <input type="text" placeholder="Введите название..." />
            </div>
            <div className="groupe">
            <strong>Расположение:</strong>
            <input type="text" placeholder="Введите расположение..." />
            </div>

            <strong>Выберите фото:</strong>
            <div
              className="file-upload"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
                id="fileInput"
              />
              <label htmlFor="fileInput" className="file-upload-label">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
                ) : (
                  "Перетащите фото сюда или нажмите для выбора"
                )}
              </label>
            </div>
          </form>

          <h2>Нормализованная таблица</h2>
          <form className="small-form">
            <div className="groupe">
              <strong>Название:</strong>
              <input type="text" placeholder="Введите название..." />
            </div>
          </form>
        </div>
        <div className="right-form">
          <div className="topp">
            <h2>Выбор аргументов</h2>
            <button className="create-button" onClick={handleCreateTable}>
              Создать таблицу
            </button>
          </div>
          <form className="large-form">
            <table>
              <thead>
                <tr>
                  <th>Аргумент</th>
                  <th>Явно?</th>
                  <th>Функция?</th>
                  <th>Дискретно?</th>
                  <th>Мин</th>
                  <th>Макс</th>
                  <th>Шаг</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {argumentsList.map((arg, index) => (
                  <tr key={index}>
                    <td>
                      {editingIndex === index ? (
                        <select
                          value={arg.name}
                          onChange={(e) =>
                            handleEditArgumentChange(index, "name", e.target.value)
                          }
                        >
                          {availableArguments.map((arg, idx) => (
                            <option key={idx} value={arg.name}>
                              {arg.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        arg.name
                      )}
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={arg.explicitness}
                        onChange={(e) =>
                          handleEditArgumentChange(
                            index,
                            "explicitness",
                            e.target.checked
                          )
                        }
                        disabled={editingIndex !== index}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={arg.role}
                        onChange={(e) =>
                          handleEditArgumentChange(index, "role", e.target.checked)
                        }
                        disabled={editingIndex !== index}
                      />
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={arg.discreteness}
                        onChange={(e) =>
                          handleEditDiscretenessChange(index, e.target.checked)
                        }
                        disabled={
                          editingIndex !== index ||
                          availableArguments.find((a) => a.name === arg.name)?.dataType !== "int"
                        }
                      />
                    </td>
                    <td>
                      {editingIndex === index ? (
                        <input
                          type="number"
                          value={arg.minValue}
                          onChange={(e) =>
                            handleEditArgumentChange(index, "minValue", e.target.value)
                          }
                          disabled={!arg.discreteness}
                        />
                      ) : (
                        arg.minValue
                      )}
                    </td>
                    <td>
                      {editingIndex === index ? (
                        <input
                          type="number"
                          value={arg.maxValue}
                          onChange={(e) =>
                            handleEditArgumentChange(index, "maxValue", e.target.value)
                          }
                          disabled={!arg.discreteness}
                        />
                      ) : (
                        arg.maxValue
                      )}
                    </td>
                    <td>
                      {editingIndex === index ? (
                        <input
                          type="number"
                          value={arg.step}
                          onChange={(e) =>
                            handleEditArgumentChange(index, "step", e.target.value)
                          }
                          disabled={!arg.discreteness}
                        />
                      ) : (
                        arg.step
                      )}
                    </td>
                    <td>
                      {editingIndex === index ? (
                        <>
                        <button className="but" type="button" onClick={() => handleSaveArgument(index)}>
                        <img className='cancel' src='/image/del.png' alt="Cancel" />
                      </button>
                        
                      </>
                      ) : (
                        <>
                        <button className="but" type="button" onClick={() => handleEditArgument(index)}>
                          <img className='edit' src='/image/edit.png' alt="edit" />
                        </button>
                        
                        <button className="but" type="button" onClick={() => handleDeleteArgument(index)}>
                        <img className='del' src='/image/del.png' alt="del" />
                      </button>
                      </>
                      )}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <select
                      name="name"
                      value={newArgument.name}
                      onChange={handleNewArgumentChange}
                    >
                      <option value="">Аргумент</option>
                      {availableArguments.map((arg, index) => (
                        <option key={index} value={arg.name}>
                          {arg.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      name="explicitness"
                      checked={newArgument.explicitness}
                      onChange={handleNewArgumentChange}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      name="role"
                      checked={newArgument.role}
                      onChange={handleNewArgumentChange}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      name="discreteness"
                      checked={newArgument.discreteness}
                      onChange={handleDiscretenessChange}
                      disabled={!isDiscretenessEnabled}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="minValue"
                      value={newArgument.minValue}
                      onChange={handleNewArgumentChange}
                      disabled={!areFieldsEnabled}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="maxValue"
                      value={newArgument.maxValue}
                      onChange={handleNewArgumentChange}
                      disabled={!areFieldsEnabled}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="step"
                      value={newArgument.step}
                      onChange={handleNewArgumentChange}
                      disabled={!areFieldsEnabled}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={handleAddArgument}>
                      Добавить
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateTab;