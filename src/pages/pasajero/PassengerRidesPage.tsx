// src/pages/pasajero/PassengerRidesPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getMyRides,
  getRideById,
  type Ride,
} from '../../api/ridesApi';

const PassengerRidesPage: React.FC = () => {
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // verificar login y cargar historial
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

    if (!parsed?.token || parsed.user?.rol !== 'pasajero') {
      navigate('/login');
      return;
    }

    const t: string = parsed.token;
    setToken(t);

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyRides(t);
        setRides(data);
        if (data.length > 0) {
          setSelectedRide(data[0]); // seleccionar el primero por defecto
        }
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? 'Error cargando viajes.');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [navigate]);

  const handleSelectRide = async (ride: Ride) => {
    if (!token) return;

    const id = ride.id_viaje ?? ride.id;
    if (!id) {
      setSelectedRide(ride);
      return;
    }

    try {
      setLoadingDetail(true);
      const full = await getRideById(id, token);
      setSelectedRide(full);
    } catch (e: any) {
      console.error(e);
      setError(e.message ?? 'No se pudo cargar el detalle del viaje.');
      setSelectedRide(ride); // al menos mostramos lo que ya teníamos
    } finally {
      setLoadingDetail(false);
    }
  };

  const formatDate = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : '—';

  return (
    <div className="register-page">
      <header className="register-header">
        <div className="register-header-left">
          <div className="register-logo-mini">SR</div>
          <div>
            <div className="register-header-title">Smart Ride</div>
            <div className="register-header-sub">
              Historial de viajes
            </div>
          </div>
        </div>

        <div className="register-header-right">
          <button
            className="register-btn-ghost"
            onClick={() => navigate('/pasajero')}
          >
            Nuevo viaje
          </button>
        </div>
      </header>

      <main className="register-main">
        <div className="admin-layout">
          {/* Lista de viajes */}
          <section className="admin-content-card">
            <h1 className="admin-content-title">Mis viajes</h1>
            <p className="admin-content-subtitle">
              Selecciona un viaje para ver su estado y detalles.
            </p>

            {error && (
              <p className="text-red-600 text-sm mb-2">{error}</p>
            )}

            {loading ? (
              <p className="text-slate-500 text-sm">Cargando viajes…</p>
            ) : (
              <div className="admin-table-wrapper" style={{ maxHeight: 420, overflowY: 'auto' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Origen</th>
                      <th>Destino</th>
                      <th>Estado</th>
                      <th>Solicitado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rides.map((r) => {
                      const id = r.id_viaje ?? r.id;
                      const isSelected =
                        selectedRide &&
                        (selectedRide.id_viaje ?? selectedRide.id) === id;

                      return (
                        <tr
                          key={id}
                          className={isSelected ? 'bg-slate-50 cursor-pointer' : 'cursor-pointer'}
                          onClick={() => handleSelectRide(r)}
                        >
                          <td>{id}</td>
                          <td>{r.origen}</td>
                          <td>{r.destino}</td>
                          <td className="capitalize">
                            {r.estado ?? '—'}
                          </td>
                          <td>{formatDate(r.fecha_solicitud)}</td>
                        </tr>
                      );
                    })}

                    {rides.length === 0 && (
                      <tr>
                        <td colSpan={5} className="admin-table-empty">
                          Aún no tienes viajes registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Detalle del viaje seleccionado */}
          <aside className="admin-sidebar">
            <h2 className="admin-sidebar-title">Detalle del viaje</h2>

            {!selectedRide && !loading && (
              <p className="text-sm text-slate-500">
                Selecciona un viaje de la lista para ver el detalle.
              </p>
            )}

            {loadingDetail && (
              <p className="text-sm text-slate-500 mb-2">
                Cargando detalle…
              </p>
            )}

            {selectedRide && (
              <div className="p-3 rounded-md bg-white shadow-sm text-sm mt-2">
                <p>
                  <span className="font-medium">ID viaje:</span>{' '}
                  {selectedRide.id_viaje ?? selectedRide.id}
                </p>
                <p>
                  <span className="font-medium">Estado:</span>{' '}
                  {selectedRide.estado ?? '—'}
                </p>
                <p>
                  <span className="font-medium">ID cliente:</span>{' '}
                  {selectedRide.id_cliente ?? '—'}
                </p>
                <p>
                  <span className="font-medium">ID conductor:</span>{' '}
                  {selectedRide.id_conductor ?? 'Pendiente'}
                </p>

                <hr className="my-2" />

                <p>
                  <span className="font-medium">Origen:</span>{' '}
                  {selectedRide.origen}
                </p>
                <p>
                  <span className="font-medium">Destino:</span>{' '}
                  {selectedRide.destino}
                </p>

                <hr className="my-2" />

                <p>
                  <span className="font-medium">Fecha solicitud:</span>{' '}
                  {formatDate(selectedRide.fecha_solicitud)}
                </p>
                <p>
                  <span className="font-medium">Fecha asignación:</span>{' '}
                  {formatDate(selectedRide.fecha_asignacion)}
                </p>
                <p>
                  <span className="font-medium">Inicio de viaje:</span>{' '}
                  {formatDate(selectedRide.fecha_inicio)}
                </p>
                <p>
                  <span className="font-medium">Fin de viaje:</span>{' '}
                  {formatDate(selectedRide.fecha_fin)}
                </p>

                {selectedRide.motivo_cancelacion && (
                  <>
                    <hr className="my-2" />
                    <p>
                      <span className="font-medium">Motivo cancelación:</span>{' '}
                      {selectedRide.motivo_cancelacion}
                    </p>
                  </>
                )}

                {(selectedRide.distancia_km || selectedRide.precio_estimado) && (
                  <>
                    <hr className="my-2" />
                    {selectedRide.distancia_km != null && (
                      <p>
                        <span className="font-medium">Distancia:</span>{' '}
                        {selectedRide.distancia_km} km
                      </p>
                    )}
                    {selectedRide.precio_estimado != null && (
                      <p>
                        <span className="font-medium">Precio estimado:</span>{' '}
                        {selectedRide.precio_estimado} Bs
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default PassengerRidesPage;
