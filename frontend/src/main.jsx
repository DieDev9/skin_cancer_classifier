import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import App from './App'
import HomePage from './pages/HomePage'
import './index.css'
import { CasosProvider } from './componets/CasosContext'

console.log("MAIN ESTA CARGANDO")

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <CasosProvider> {/* 👈 envuelve todas las rutas */}
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </CasosProvider>
  </BrowserRouter>,
);