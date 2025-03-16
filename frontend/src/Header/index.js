import { useNavigate } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();

  return (
    <header className="header">
      <h1 className="title">Нормализация таблиц нормативно-справочных документов</h1>
      <div className="menu">
      <button className="home-button" onClick={() => navigate("/")}>
        <h1>Альбомы</h1> 
      </button>
      <button className="home-button" onClick={() => navigate("/arguments")}>
        <h1>Атрибуты</h1>
      </button>
      </div>
    </header>
  );
}
