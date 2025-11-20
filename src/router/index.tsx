import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from '../pages/auth/RegisterPage';
import LoginPage from '../pages/auth/LoginPage';
import AdminPage from '../pages/admin/AdminPage';

// Páginas muy simples por ahora (las puedes mover a archivos separados luego)
const PassengerHome: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold mb-2">Panel de Pasajero</h1>
    <p>Aquí luego irán las opciones para solicitar viajes, ver historial, etc.</p>
  </div>
);

const DriverDashboard: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold mb-2">Panel de Conductor</h1>
    <p>Aquí luego podrás ver viajes asignados, estado (disponible/ocupado), etc.</p>
  </div>
);

/* const AdminDashboard: React.FC = () => (
  <div className="p-6">
    <h1 className="text-2xl font-semibold mb-2">Panel de Administrador</h1>
    <p>Aquí irán las vistas de administración general del sistema.</p>
  </div>
); */

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Paneles por rol */}
        <Route path="/pasajero" element={<PassengerHome />} />
        <Route path="/conductor" element={<DriverDashboard />} />
       {/*  <Route path="/admin" element={<AdminDashboard />} /> */}

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />

        
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
