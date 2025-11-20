// src/pages/admin/AdminPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../../styles/register.css'; // mismos estilos del login/registro
import '../../styles/admin.css';    // estilos del panel admin

import type { User, DriverProfile } from '../../types/user';
import { fetchAllUsers, fetchAllDrivers, createConductorUser, createDriverProfile } from '../../api/userApi';

type AdminSection = 'pasajeros' | 'conductores';

const AdminPage: React.FC = () => {
  const [section, setSection] = useState<AdminSection>('pasajeros');
  const [users, setUsers] = useState<User[]>([]);
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);


  const navigate = useNavigate();

    useEffect(() => {
    const stored = localStorage.getItem('smartRideUser');
    if (!stored) {
        navigate('/login');
        return;
    }

    let parsed: { token: string | null; user: User } | null = null;
    try {
        parsed = JSON.parse(stored);
    } catch {
        parsed = null;
    }

    if (!parsed?.token || parsed.user.rol !== 'admin') {
        navigate('/login');
        return;
    }

    const t = parsed.token;
    setToken(t);

    const loadData = async (authToken: string) => {
        try {
        setLoading(true);
        setError(null);

        const [allUsers, allDrivers] = await Promise.all([
            fetchAllUsers(authToken),
            fetchAllDrivers(authToken),
        ]);

        setUsers(allUsers);
        setDrivers(allDrivers);
        } catch (err: any) {
        console.error(err);
        setError(err.message ?? 'Error cargando datos.');
        } finally {
        setLoading(false);
        }
    };

    void loadData(t);
    }, [navigate]);

    const reloadData = async () => {
        if (!token) return;
        try {
            setLoading(true);
            setError(null);
            const [allUsers, allDrivers] = await Promise.all([
            fetchAllUsers(token),
            fetchAllDrivers(token),
            ]);
            setUsers(allUsers);
            setDrivers(allDrivers);
        } catch (err: any) {
            console.error(err);
            setError(err.message ?? 'Error cargando datos.');
        } finally {
            setLoading(false);
        }
    };



  const pasajeros = users.filter(u => u.rol === 'pasajero');

  const handleLogout = () => {
    localStorage.removeItem('smartRideUser');
    navigate('/login');
  };

  return (
    <div className="register-page">
      {/* Header reutilizado */}
      <header className="register-header">
        <div className="register-header-left">
          <div className="register-logo-mini">SR</div>
          <div>
            <div className="register-header-title">Smart Ride</div>
            <div className="register-header-sub">
              Panel de administración
            </div>
          </div>
        </div>

        <div className="register-header-right">
          <button
            className="register-btn-ghost"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="register-main">
        <div className="admin-layout">
          {/* Sidebar */}
          <aside className="admin-sidebar">
            <h2 className="admin-sidebar-title">Administrar</h2>

            <button
              className={
                'admin-nav-button' +
                (section === 'pasajeros'
                  ? ' admin-nav-button-active'
                  : '')
              }
              onClick={() => setSection('pasajeros')}
            >
              Pasajeros
            </button>

            <button
              className={
                'admin-nav-button' +
                (section === 'conductores'
                  ? ' admin-nav-button-active'
                  : '')
              }
              onClick={() => setSection('conductores')}
            >
              Conductores
            </button>
          </aside>

          {/* Contenido principal */}
          <section className="admin-content-card">
            {error && (
              <p className="text-red-600 text-sm mb-3 font-medium">
                {error}
              </p>
            )}

            {loading && (
              <p className="text-slate-500 text-sm mb-3">
                Cargando datos…
              </p>
            )}

            {section === 'pasajeros' ? (
            <PassengersTable pasajeros={pasajeros} />
            ) : (
            <DriversTable
                drivers={drivers}
                token={token}
                onCreated={reloadData}
            />
            )}

          </section>
        </div>
      </main>
    </div>
  );
};

// ---------- Tablas ----------

interface PassengersTableProps {
  pasajeros: User[];
}

const PassengersTable: React.FC<PassengersTableProps> = ({ pasajeros }) => (
  <div>
    <h1 className="admin-content-title">Pasajeros</h1>
    <p className="admin-content-subtitle">
      Lista de cuentas de pasajero registradas en Smart Ride.
    </p>

    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Correo</th>
            <th>Teléfono</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {pasajeros.map(u => (
            <tr key={u.id_usuario}>
              <td>{u.nombre} {u.apellido}</td>
              <td>{u.email}</td>
              <td>{(u as any).telefono ?? '-'}</td>
              <td className="capitalize">
                {(u as any).estado_cuenta ?? '-'}
              </td>
            </tr>
          ))}

          {pasajeros.length === 0 && (
            <tr>
              <td className="admin-table-empty" colSpan={4}>
                No hay pasajeros registrados aún.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

interface DriversTableProps {
  drivers: DriverProfile[];
  token: string | null;
  onCreated: () => void; // para recargar lista después de crear
}


const DriversTable: React.FC<DriversTableProps> = ({
  drivers,
  token,
  onCreated,
}) => {
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formValues, setFormValues] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    numero_licencia: '',
    tipo_licencia: 'A',
    fecha_vencimiento_licencia: '',
    marca_auto: '',
    modelo_auto: '',
    placa_auto: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('No hay token de administrador.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // 1) Crear usuario con rol "conductor"
      const userResp = await createConductorUser(
        {
          nombre: formValues.nombre,
          apellido: formValues.apellido,
          email: formValues.email,
          telefono: formValues.telefono,
          password: formValues.password,
          // si quieres puedes mandar fecha_nacimiento / genero también
        },
        token
      );

      const usuario =
        userResp.data?.usuario ?? userResp.data ?? userResp;
      const idUsuario = usuario.id_usuario;

      if (!idUsuario) {
        throw new Error(
          'No se recibió id_usuario al crear el usuario.'
        );
      }

      // 2) Crear perfil de conductor
      await createDriverProfile(
        {
          id_usuario: idUsuario,
          numero_licencia: formValues.numero_licencia,
          tipo_licencia: formValues.tipo_licencia,
          fecha_vencimiento_licencia:
            formValues.fecha_vencimiento_licencia,
          marca_auto: formValues.marca_auto,
          modelo_auto: formValues.modelo_auto,
          placa_auto: formValues.placa_auto,
        },
        token
      );

      // limpiar y recargar
      setFormValues({
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        password: '',
        numero_licencia: '',
        tipo_licencia: 'A',
        fecha_vencimiento_licencia: '',
        marca_auto: '',
        modelo_auto: '',
        placa_auto: '',
      });
      setFormOpen(false);
      await onCreated();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Error al crear conductor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="admin-header-row">
        <div>
          <h1 className="admin-content-title">Conductores</h1>
          <p className="admin-content-subtitle">
            Lista de conductores y datos de vehículo.
          </p>
        </div>

        <button
          type="button"
          className="sr-btn-primary"
          style={{ paddingInline: '1.5rem', height: '40px' }}
          onClick={() => setFormOpen(prev => !prev)}
        >
          {formOpen ? 'Cancelar' : 'Nuevo conductor'}
        </button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="admin-driver-form"
        >
          {error && (
            <p className="text-red-600 text-sm mb-2">{error}</p>
          )}

          <div className="admin-form-grid">
            <div>
              <label className="sr-label">Nombre</label>
              <input
                name="nombre"
                value={formValues.nombre}
                onChange={handleChange}
                className="sr-input"
                required
              />
            </div>

            <div>
              <label className="sr-label">Apellido</label>
              <input
                name="apellido"
                value={formValues.apellido}
                onChange={handleChange}
                className="sr-input"
                required
              />
            </div>

            <div>
              <label className="sr-label">Correo</label>
              <input
                type="email"
                name="email"
                value={formValues.email}
                onChange={handleChange}
                className="sr-input"
                required
              />
            </div>

            <div>
              <label className="sr-label">Teléfono</label>
              <input
                name="telefono"
                value={formValues.telefono}
                onChange={handleChange}
                className="sr-input"
              />
            </div>

            <div>
              <label className="sr-label">
                Contraseña inicial
              </label>
              <input
                type="password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                className="sr-input"
                required
              />
            </div>

            <div>
              <label className="sr-label">N.º licencia</label>
              <input
                name="numero_licencia"
                value={formValues.numero_licencia}
                onChange={handleChange}
                className="sr-input"
                required
              />
            </div>

            <div>
              <label className="sr-label">Tipo de licencia</label>
              <select
                name="tipo_licencia"
                value={formValues.tipo_licencia}
                onChange={handleChange}
                className="sr-input"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>

            <div>
              <label className="sr-label">
                Vencimiento licencia
              </label>
              <input
                type="date"
                name="fecha_vencimiento_licencia"
                value={formValues.fecha_vencimiento_licencia}
                onChange={handleChange}
                className="sr-input"
                required
              />
            </div>

            <div>
              <label className="sr-label">Marca</label>
              <input
                name="marca_auto"
                value={formValues.marca_auto}
                onChange={handleChange}
                className="sr-input"
              />
            </div>

            <div>
              <label className="sr-label">Modelo</label>
              <input
                name="modelo_auto"
                value={formValues.modelo_auto}
                onChange={handleChange}
                className="sr-input"
              />
            </div>

            <div>
              <label className="sr-label">Placa</label>
              <input
                name="placa_auto"
                value={formValues.placa_auto}
                onChange={handleChange}
                className="sr-input"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="sr-btn-primary mt-3"
            disabled={loading}
          >
            {loading ? 'Guardando…' : 'Guardar conductor'}
          </button>
        </form>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>N.º licencia</th>
              <th>Tipo</th>
              <th>Placa</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(d => (
              <tr key={d.id_conductor}>
                <td>
                  {d.usuario?.nombre} {d.usuario?.apellido}
                </td>
                <td>{d.usuario?.email}</td>
                <td>{d.numero_licencia}</td>
                <td>{d.tipo_licencia}</td>
                <td>{d.placa_auto}</td>
                <td className="capitalize">
                  {d.estado_conductor}
                </td>
              </tr>
            ))}

            {drivers.length === 0 && (
              <tr>
                <td
                  className="admin-table-empty"
                  colSpan={6}
                >
                  No hay conductores registrados aún.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default AdminPage;
