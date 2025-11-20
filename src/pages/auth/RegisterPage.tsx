import React, { useState } from 'react';
import '../../styles/register.css';
import { createDriverProfile, createUser, type User } from '../../api/userApi';
import DriverProfileForm, { type DriverProfileFormValues } from '../../components/forms/DriverProfileForm';
import type { UserRegisterFormValues } from '../../components/forms/UserRegisterForm';
import UserRegisterForm from '../../components/forms/UserRegisterForm';

type RegisterStep = 'user' | 'driver';

const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<RegisterStep>('user');
  const [userDataForm, setUserDataForm] = useState<UserRegisterFormValues | null>(null);
  const [createdUser, setCreatedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUserSubmit = async (values: UserRegisterFormValues) => {
    try {
      setError(null);
      setLoading(true);

      // Guardamos lo que vino del form por si hace falta
      setUserDataForm(values);

      const payload = {
        nombre: values.nombre,
        apellido: values.apellido,
        email: values.email,
        telefono: values.telefono,
        password: values.password,
        fecha_nacimiento: values.fecha_nacimiento || undefined,
        genero: values.genero || undefined,
        rol: values.rol,
      };

      // Llamada real al microservicio de usuarios
      const user = await createUser(payload);
      setCreatedUser(user);

      if (values.rol === 'conductor') {
        setStep('driver');
      } else {
        // pasajero listo: aquí puedes redirigir a login o panel pasajero
        // por ahora solo dejamos el registro funcionando
        alert('Usuario pasajero registrado correctamente');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al registrar usuario.');
    } finally {
      setLoading(false);
    }
  };

  const handleDriverSubmit = async (values: DriverProfileFormValues) => {
    if (!createdUser) return;

    try {
      setError(null);
      setLoading(true);

      await createDriverProfile({
        id_usuario: createdUser.id_usuario,
        numero_licencia: values.numero_licencia,
        tipo_licencia: values.tipo_licencia,
        fecha_vencimiento_licencia: values.fecha_vencimiento_licencia,
        marca_auto: values.marca_auto,
        modelo_auto: values.modelo_auto,
        placa_auto: values.placa_auto,
      });

      alert('Conductor registrado correctamente');
      // aquí luego rediriges a /login o /conductor
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al registrar datos de conductor.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToUser = () => {
    setStep('user');
  };

  const isDriverFlow = userDataForm?.rol === 'conductor';

  return (
    <div className="register-page">
      <header className="register-header">
        <div className="register-header-left">
          <div className="register-logo-mini">SR</div>
          <div>
            <div className="register-header-title">Smart Ride</div>
            <div className="register-header-sub">Registro de usuario</div>
          </div>
        </div>

        <div className="register-header-right">
          <span>¿Ya tienes cuenta?</span>
          <button className="register-btn-ghost">
            Inicia sesión
          </button>
        </div>
      </header>

      <main className="register-main">
        <div className="register-card">
          <h1 className="register-card-title">
            {step === 'user'
              ? 'Crear una nueva cuenta'
              : 'Completar datos como conductor'}
          </h1>

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          {step === 'user' && (
            <>
              <UserRegisterForm onSubmit={handleUserSubmit} />
              {loading && <p className="mt-2 text-sm">Guardando...</p>}
            </>
          )}

          {step === 'driver' && isDriverFlow && (
            <>
              <DriverProfileForm
                onSubmit={handleDriverSubmit}
                onBack={handleBackToUser}
              />
              {loading && <p className="mt-2 text-sm">Guardando...</p>}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
