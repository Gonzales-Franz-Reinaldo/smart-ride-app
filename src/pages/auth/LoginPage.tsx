import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/register.css';
import { loginUser } from '../../api/userApi';

type UserRole = 'pasajero' | 'conductor' | 'admin';

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const [formValues, setFormValues] = useState<LoginFormValues>({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data: any = await loginUser(
        formValues.email,
        formValues.password
      );

      console.log('RESPUESTA LOGIN BACKEND ===>', data);

      let token: string | null = null;
      let user: any = null;

      // 🟢 Caso 1: { token, user: { ... } }
      if (data.user) {
        token = data.token ?? null;
        user = data.user;

      // 🟢 Caso 2: { success, data: { ... }, token? }
      } else if (data.data) {
        // puede ser { data: { user: {...} } } o { data: {...} }
        if (data.data.user) {
          user = data.data.user;
        } else {
          user = data.data;
        }
        token = data.token ?? data.data.token ?? null;

      // 🟢 Caso 3: todo viene plano { id_usuario, email, rol, token? }
      } else {
        user = data;
        token = data.token ?? null;
      }

      if (!user || !user.rol) {
        throw new Error(
          'La respuesta del backend no incluye el rol del usuario.'
        );
      }

      const rol = user.rol as UserRole;

      localStorage.setItem(
        'smartRideUser',
        JSON.stringify({ token, user })
      );

      if (rol === 'admin') navigate('/admin');
      else if (rol === 'conductor') navigate('/conductor');
      else navigate('/pasajero');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };


  const goToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="register-page">
      <header className="register-header">
        <div className="register-header-left">
          <div className="register-logo-mini">SR</div>
          <div>
            <div className="register-header-title">Smart Ride</div>
            <div className="register-header-sub">Inicio de sesión</div>
          </div>
        </div>

        <div className="register-header-right">
          <span>¿Aún no tienes cuenta?</span>
          <button
            className="register-btn-ghost"
            onClick={goToRegister}
          >
            Regístrate
          </button>
        </div>
      </header>

      <main className="register-main">
        <div className="register-card" style={{ maxWidth: 480 }}>
          <h1 className="register-card-title">Inicia sesión</h1>

          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}

          <form className="sr-form" onSubmit={handleSubmit}>
            <div
              className="sr-form-grid"
              style={{ gridTemplateColumns: '1fr' }}
            >
              <div>
                <label className="sr-label" htmlFor="email">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="sr-input"
                  placeholder="tucorreo@ejemplo.com"
                  value={formValues.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="sr-label" htmlFor="password">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  className="sr-input"
                  placeholder="Tu contraseña"
                  value={formValues.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="sr-btn-primary mt-4"
              disabled={loading}
            >
              {loading ? 'Ingresando…' : 'Ingresar'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;