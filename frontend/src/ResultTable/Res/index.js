import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import "./Res.css";

function Res() {
  const { nnTableId } = useParams();
  const [nTableName, setNTableName] = useState("");
  const [uploadedImage, setUploadedImage] = useState(null);
  const [tableColumns, setTableColumns] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [newRow, setNewRow] = useState({});
  const [editingRow, setEditingRow] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!nnTableId) {
          console.error("NNTableId is undefined");
          return;
        }

        const tableConnectionResponse = await fetch(
          `https://localhost:7136/api/TableConnection?nnTableId=${nnTableId}`
        );

        if (!tableConnectionResponse.ok) {
          throw new Error("Failed to fetch TableConnection");
        }

        const tableConnections = await tableConnectionResponse.json();
        console.log("Table Connections:", tableConnections);

        if (!tableConnections || tableConnections.length === 0) {
          console.error("No TableConnection found for the given NNTableId");
          return;
        }

        const nTableId = tableConnections[0].nTableId || tableConnections[0].NTableId;
        console.log("NTableId:", nTableId);

        if (!nTableId) {
          console.error("NTableId is undefined");
          return;
        }

        const nTableResponse = await fetch(
          `https://localhost:7136/api/NTable/${nTableId}`
        );

        if (!nTableResponse.ok) {
          throw new Error("Failed to fetch NTable");
        }

        const nTableData = await nTableResponse.json();
        console.log("NTable Data:", nTableData);
        setNTableName(nTableData.name);

        const nnTableResponse = await fetch(
          `https://localhost:7136/api/NNTable/download/${nnTableId}`
        );

        if (nnTableResponse.ok) {
          const imageBlob = await nnTableResponse.blob();
          const imageUrl = URL.createObjectURL(imageBlob);
          setUploadedImage(imageUrl);
        }

        const tableContentResponse = await fetch(
          `https://localhost:7136/api/TableContent/${nTableId}`
        );

        if (!tableContentResponse.ok) {
          throw new Error("Failed to fetch TableContent");
        }

        const tableContents = await tableContentResponse.json();
        console.log("Table Contents:", tableContents);

        const columns = await Promise.all(
          tableContents.map(async (contentId) => {
            const argumentResponse = await fetch(
              `https://localhost:7136/api/Argument/${contentId}`
            );
            if (!argumentResponse.ok) {
              throw new Error("Failed to fetch Argument");
            }
            const argument = await argumentResponse.json();
            return {
              id: contentId,
              argumentName: argument.name,
              dataType: argument.dataType,
            };
          })
        );

        console.log("Columns:", columns);

        const sortedColumns = columns.sort((a, b) => {
          if (!a.Bright && !b.Bright) return 0;
          if (!a.Bright) return -1;
          if (!b.Bright) return 1;
          if (!a.Role && !b.Role) return 0;
          if (!a.Role) return -1;
          if (!b.Role) return 1;
          return 0;
        });

        console.log("Sorted Columns:", sortedColumns);
        setTableColumns(sortedColumns);

        const dynamicTableResponse = await fetch(
          `https://localhost:7136/DynamicTable/get-table/${nTableId}`
        );

        if (!dynamicTableResponse.ok) {
          throw new Error("Failed to fetch dynamic table data");
        }

        const dynamicTableData = await dynamicTableResponse.json();
        console.log("Dynamic Table Data:", dynamicTableData);
        setTableData(dynamicTableData);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      }
    };

    fetchData();
  }, [nnTableId]);

  const handleInputChange = (e) => {
    setNTableName(e.target.value);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const uploadResponse = await fetch(
          `https://localhost:7136/api/NNTable/upload/${nnTableId}`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (uploadResponse.ok) {
          const imageUrl = URL.createObjectURL(file);
          setUploadedImage(imageUrl);
          alert("Изображение успешно загружено!");
        } else {
          alert("Ошибка при загрузке изображения.");
        }
      } catch (error) {
        console.error("Ошибка при загрузке изображения:", error);
        alert("Произошла ошибка при загрузке изображения.");
      }
    }
  };

  const handleNewRowChange = (e, column) => {
    setNewRow({
      ...newRow,
      [column.argumentName]: e.target.value,
    });
  };

  const handleAddRow = async () => {
    try {
      const response = await fetch(
        `https://localhost:7136/DynamicTable/add-row/${nTableName}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newRow),
        }
      );

      if (response.ok) {
        const newDataResponse = await fetch(
          `https://localhost:7136/DynamicTable/get-table/${nTableName}`
        );
        const newData = await newDataResponse.json();
        setTableData(newData);
        setNewRow({});
      } else {
        alert("Ошибка при добавлении строки.");
      }
    } catch (error) {
      console.error("Ошибка при добавлении строки:", error);
      alert("Произошла ошибка при добавлении строки.");
    }
  };

  const handleEditRow = (rowIndex) => {
    setEditingRow(rowIndex);
  };

  const handleSaveRow = async (rowIndex) => {
    const row = tableData[rowIndex];
    try {
      const response = await fetch(
        `https://localhost:7136/DynamicTable/update-row/${nTableName}/${row.Id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(row),
        }
      );

      if (response.ok) {
        setEditingRow(null);
        alert("Строка успешно обновлена.");
      } else {
        alert("Ошибка при обновлении строки.");
      }
    } catch (error) {
      console.error("Ошибка при обновлении строки:", error);
      }
  };

  const handleDeleteRow = async (rowIndex) => {
    const row = tableData[rowIndex];
    try {
      const response = await fetch(
        `https://localhost:7136/DynamicTable/delete-row/${nTableName}/${row.Id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const newData = tableData.filter((_, index) => index !== rowIndex);
        setTableData(newData);
        alert("Строка успешно удалена.");
      } else {
        alert("Ошибка при удалении строки.");
      }
    } catch (error) {
      console.error("Ошибка при удалении строки:", error);
    }
  };

  const handleRowChange = (e, rowIndex, column) => {
    const newData = tableData.map((row, index) =>
      index === rowIndex ? { ...row, [column.argumentName]: e.target.value } : row
    );
    setTableData(newData);
  };

  return (
    <div className="res-result-table">
      <div className="res-forms-container">
        <div className="res-left-forms">
          <h2>Нормализованная таблица</h2>
          <form className="res-small-form">
            <div className="res-groupe">
              <strong>Название:</strong>
              <input
                type="text"
                placeholder="Введите название..."
                value={nTableName}
                onChange={handleInputChange}
              />
            </div>

            <div className="res-file-upload">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                id="res-fileInput"
                onChange={handleFileChange}
              />
              <label htmlFor="res-fileInput" className="res-file-upload-label">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Uploaded" className="uploaded-image" />
                ) : (
                  "Перетащите фото сюда или нажмите для выбора"
                )}
              </label>
            </div>
          </form>
        </div>

        <div className="res-right-form">
          <div className="res-topp">
            <button className="res-create-button">Сохранить таблицу</button>
          </div>
          <form className="res-large-form">
            <table>
              <thead>
                <tr>
                  {tableColumns.map((column) => (
                    <th key={column.id}>{column.argumentName}</th>
                  ))}
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {tableData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {tableColumns.map((column) => (
                      <td key={column.id}>
                        {editingRow === rowIndex ? (
                          <input
                            type="text"
                            value={row[column.argumentName] || ""}
                            onChange={(e) => handleRowChange(e, rowIndex, column)}
                          />
                        ) : (
                          row[column.argumentName]?.toString() || ""
                        )}
                      </td>
                    ))}
                    <td>
                      {editingRow === rowIndex ? (
                        <button onClick={() => handleSaveRow(rowIndex)}>Сохранить</button>
                      ) : (
                        <button onClick={() => handleEditRow(rowIndex)}>Редактировать</button>
                      )}
                      <button onClick={() => handleDeleteRow(rowIndex)}>Удалить</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  {tableColumns.map((column) => (
                    <td key={column.id}>
                      <input
                        type="text"
                        value={newRow[column.argumentName] || ""}
                        onChange={(e) => handleNewRowChange(e, column)}
                        placeholder={`Введите ${column.argumentName}`}
                      />
                    </td>
                  ))}
                  <td>
                    <button onClick={handleAddRow}>Добавить</button>
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

export default Res;