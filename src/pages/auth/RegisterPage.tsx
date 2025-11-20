// src/pages/auth/RegisterPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/register.css';
import UserRegisterForm from '../../components/forms/UserRegisterForm';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="register-page">
      {/* HEADER */}
      <header className="register-header">
        <div className="register-header-left">
          <div className="register-logo-mini">SR</div>
          <div>
            <div className="register-header-title">Smart Ride</div>
            <div className="register-header-sub">
              Registro de usuario
            </div>
          </div>
        </div>

        <div className="register-header-right">
          <span>¿Ya tienes cuenta?</span>
          <button
            className="register-btn-ghost"
            onClick={goToLogin}
          >
            Inicia sesión
          </button>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="register-main">
        <div className="register-card">
          <h1 className="register-card-title">
            Crear una nueva cuenta
          </h1>
          <p className="register-card-subtitle">
            Regístrate como pasajero para solicitar viajes en
            Smart Ride.
          </p>

          <UserRegisterForm />
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
