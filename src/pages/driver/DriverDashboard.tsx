// src/pages/driver/DriverDashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyRides, updateRideState, type Ride } from '../../api/ridesApi';

const DriverDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // cargar viajes del conductor
  useEffect(() => {
    const stored = localStorage.getItem('smartRideUser');
    if (!stored) {
      navigate('/login');
      return;
    }

    let parsed: any = null;
    try {
      parsed = JSON.parse(stored);
    } catch {
      parsed = null;
    }

    if (!parsed?.token || parsed.user?.rol !== 'conductor') {
      navigate('/login');
      return;
    }

    const t: string = parsed.token;
    setToken(t);

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyRides(t); // el backend devuelve los viajes de ESTE usuario
        setRides(data);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? 'Error cargando viajes asignados.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [navigate]);

  const reloadRides = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const data = await getMyRides(token);
      setRides(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'Error recargando viajes.');
    } finally {
      setLoading(false);
    }
  };

  // helper para cambiar estado (start / finish)
  const handleChangeState = async (ride: Ride, action: string) => {
    if (!token) return;
    const id = ride.id_viaje ?? ride.id;
    if (!id) return;

    try {
      setUpdatingId(id);
      setError(null);
      await updateRideState(id, action, token);
      await reloadRides();
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'No se pudo actualizar el estado del viaje.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : '—';

  const getEstado = (ride: Ride) => (ride.estado ?? '').toUpperCase();

  const canStart = (ride: Ride) => {
    const estado = getEstado(ride);
    return estado === 'ASIGNADO' || estado === 'PENDIENTE';
  };

  const canFinish = (ride: Ride) => {
    const estado = getEstado(ride);
    // AJUSTA ESTOS VALORES según tus estados reales en el backend
    return estado === 'EN_CURSO' || estado === 'INICIADO';
  };

  const handleLogout = () => {
    localStorage.removeItem('smartRideUser');
    navigate('/login');
  };

  return (
    <div className="register-page">
      <header className="register-header">
        <div className="register-header-left">
          <div className="register-logo-mini">SR</div>
          <div>
            <div className="register-header-title">Smart Ride</div>
            <div className="register-header-sub">
              Panel del conductor
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
          <section className="admin-content-card" style={{ width: '100%' }}>
            <div className="admin-header-row">
              <div>
                <h1 className="admin-content-title">Viajes asignados</h1>
                <p className="admin-content-subtitle">
                  Aquí puedes iniciar y finalizar los viajes que te han asignado.
                </p>
              </div>

              <button
                type="button"
                className="sr-btn-primary"
                onClick={reloadRides}
                disabled={loading}
              >
                {loading ? 'Actualizando…' : 'Actualizar'}
              </button>
            </div>

            {error && (
              <p className="text-red-600 text-sm mb-2">{error}</p>
            )}

            {loading && (
              <p className="text-slate-500 text-sm mb-2">
                Cargando viajes…
              </p>
            )}

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Origen</th>
                    <th>Destino</th>
                    <th>Estado</th>
                    <th>Solicitud</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((r) => {
                    const id = r.id_viaje ?? r.id;
                    const estado = getEstado(r);

                    return (
                      <tr key={id}>
                        <td>{id}</td>
                        <td>{r.origen}</td>
                        <td>{r.destino}</td>
                        <td className="capitalize">{estado}</td>
                        <td>{formatDate(r.fecha_solicitud)}</td>
                        <td>{formatDate(r.fecha_inicio)}</td>
                        <td>{formatDate(r.fecha_fin)}</td>
                        <td>
                          <div className="flex flex-col gap-1">
                            <button
                              type="button"
                              className="sr-btn-secondary"
                              disabled={
                                updatingId === id || !canStart(r)
                              }
                              onClick={() => handleChangeState(r, 'start')}
                            >
                              {updatingId === id && canStart(r)
                                ? 'Iniciando…'
                                : 'Iniciar viaje'}
                            </button>
                            <button
                              type="button"
                              className="sr-btn-primary"
                              disabled={
                                updatingId === id || !canFinish(r)
                              }
                              onClick={() => handleChangeState(r, 'finish')}
                            >
                              {updatingId === id && canFinish(r)
                                ? 'Finalizando…'
                                : 'Finalizar viaje'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {rides.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="admin-table-empty">
                        No tienes viajes asignados por ahora.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DriverDashboard;
