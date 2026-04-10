import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './componets/AuthContext'
import { CasosProvider } from './componets/CasosContext'
import ProtectedRoute from './componets/ProtectedRoute'

import InicioPage  from './pages/InicioPage'
import RegistroPage from './pages/RegistroPage'
import HomePage    from './pages/HomePage'
import PerfilPage  from './pages/PerfilPage'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>           {/* 👈 Auth envuelve todo */}
      <CasosProvider>        {/* 👈 Casos envuelve las páginas que lo necesitan */}
        <Routes>
          {/* Rutas públicas */}
          <Route path="/"         element={<InicioPage />} />
          <Route path="/inicio"   element={<InicioPage />} />
          <Route path="/registro" element={<RegistroPage />} />

          {/* Rutas protegidas */}
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <PerfilPage />
            </ProtectedRoute>
          } />
        </Routes>
      </CasosProvider>
    </AuthProvider>
  </BrowserRouter>
)
