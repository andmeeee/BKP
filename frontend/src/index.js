import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Home from './Home';
import Document from './Document';
import Chapter from './Chapter'
import Header from './Header';
import NNTable from './NNTable'
import CreateTable from './CreateTable'
import Argument from './Argument'
import ResultTable from './ResultTable'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
    <Header/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/documents/:albumId" element={<Document />} />
        <Route path="/chapters/:documentId" element={<Chapter />} />
        <Route path="/tables/:chapterId" element={<NNTable />} />
        <Route path="/create-table/:chapterId" element={<CreateTable />} />
        <Route path="/arguments" element={<Argument />} />
        <Route path="/result-table/:nnTableId" element={<ResultTable />} />
      </Routes>
    </Router>
  </React.StrictMode>
);