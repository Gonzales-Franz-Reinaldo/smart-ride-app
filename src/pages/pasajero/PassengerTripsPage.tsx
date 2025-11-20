// src/pages/pasajero/PassengerTripsPage.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRide, getMyRides, type Ride } from '../../api/ridesApi';

// Si usas leaflet instalado via npm:
import L, { Map as LeafletMap, Marker as LeafletMarker,Polyline as LeafletPolyline } from 'leaflet';
import 'leaflet/dist/leaflet.css';

type PassengerTab = 'nuevo' | 'historial';


const PassengerTripsPage: React.FC = () => {
  const navigate = useNavigate();

  const [tab, setTab] = useState<PassengerTab>('nuevo'); 
  const [token, setToken] = useState<string | null>(null);
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null); // 👈 NUEVO
  const [rides, setRides] = useState<Ride[]>([]);
  const [lastRide, setLastRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // refs para el mapa
  const mapRef = useRef<LeafletMap | null>(null);
  const originMarkerRef = useRef<LeafletMarker | null>(null);
  const destMarkerRef = useRef<LeafletMarker | null>(null);
  const routeLineRef = useRef<LeafletPolyline | null>(null);  
  const hasOriginRef = useRef(false);

  // 1. verificar login y cargar historial
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
        const data = await getMyRides(t);
        setRides(data);
      } catch (e: any) {
        console.error(e);
        setError(e.message ?? 'Error cargando historial');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [navigate]);

  // 2. inicializar mapa una sola vez
    useEffect(() => {
    if (mapRef.current) return;

    const map = L.map('map-pasajero').setView([-17.3895, -66.1568], 14); // Cochabamba
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    // manejamos los clicks
    map.on('click', async (e: any) => {
        const { lat, lng } = e.latlng;

        // PRIMER CLICK -> ORIGEN
        if (!hasOriginRef.current) {
        if (originMarkerRef.current) {
            map.removeLayer(originMarkerRef.current);
        }
        if (destMarkerRef.current) {
            map.removeLayer(destMarkerRef.current);
            destMarkerRef.current = null;
        }
        if (routeLineRef.current) {
            map.removeLayer(routeLineRef.current);
            routeLineRef.current = null;
        }

        const marker = L.marker([lat, lng]).addTo(map);
        originMarkerRef.current = marker;
        hasOriginRef.current = true;

        setOrigen(`Origen cerca de (${lat.toFixed(5)}, ${lng.toFixed(5)})`);
        setDistanceKm(null);
        setEstimatedPrice(null);
        setDestino('');
        return;
        }

        // SEGUNDO CLICK -> DESTINO + RUTA POR CALLES (OSRM)
        if (!destMarkerRef.current) {
        const marker = L.marker([lat, lng]).addTo(map);
        destMarkerRef.current = marker;

        setDestino(`Destino cerca de (${lat.toFixed(5)}, ${lng.toFixed(5)})`);

        if (originMarkerRef.current) {
            const oLatLng = originMarkerRef.current.getLatLng();
            const dLatLng = marker.getLatLng();

            // URL a OSRM (ruteo por calles)
            const url = `https://router.project-osrm.org/route/v1/driving/` +
            `${oLatLng.lng},${oLatLng.lat};${dLatLng.lng},${dLatLng.lat}` +
            `?overview=full&geometries=geojson`;

            try {
            const res = await fetch(url);
            const data = await res.json();

            if (!data.routes || !data.routes.length) {
                console.warn('OSRM no devolvió rutas, usando línea recta');
                // fallback: distancia recta
                const meters = map.distance(oLatLng, dLatLng);
                const km = meters / 1000;
                const kmRounded = parseFloat(km.toFixed(2));
                setDistanceKm(kmRounded);

                const BASE_FARE = 5;
                const PRICE_PER_KM = 2.5;
                setEstimatedPrice(
                parseFloat((BASE_FARE + PRICE_PER_KM * kmRounded).toFixed(2)),
                );

                if (routeLineRef.current) {
                map.removeLayer(routeLineRef.current);
                }
                const line = L.polyline([oLatLng, dLatLng], {
                color: '#2563eb',
                weight: 4,
                }).addTo(map);
                routeLineRef.current = line;

                return;
            }

            const route = data.routes[0];

            // distancia en km REAL por calles
            const km = route.distance / 1000;
            const kmRounded = parseFloat(km.toFixed(2));
            setDistanceKm(kmRounded);

            const BASE_FARE = 5;
            const PRICE_PER_KM = 2.5;
            const price = BASE_FARE + PRICE_PER_KM * kmRounded;
            setEstimatedPrice(parseFloat(price.toFixed(2)));

            // geometría de la ruta: [lng,lat] -> [lat,lng] para Leaflet
            const coordsLatLng = route.geometry.coordinates.map(
                ([lng2, lat2]: [number, number]) => [lat2, lng2] as [number, number],
            );

            if (routeLineRef.current) {
                map.removeLayer(routeLineRef.current);
            }
            const line = L.polyline(coordsLatLng, {
                color: '#2563eb',
                weight: 4,
            }).addTo(map);
            routeLineRef.current = line;

            // si quieres que encuadre la ruta:
            // map.fitBounds(line.getBounds());
            } catch (err) {
            console.error('Error llamando a OSRM, usando línea recta:', err);
            const meters = map.distance(oLatLng, dLatLng);
            const km = meters / 1000;
            const kmRounded = parseFloat(km.toFixed(2));
            setDistanceKm(kmRounded);

            const BASE_FARE = 5;
            const PRICE_PER_KM = 2.5;
            setEstimatedPrice(
                parseFloat((BASE_FARE + PRICE_PER_KM * kmRounded).toFixed(2)),
            );

            if (routeLineRef.current) {
                map.removeLayer(routeLineRef.current);
                }
                const line = L.polyline([oLatLng, dLatLng], {
                    color: '#2563eb',
                    weight: 4,
                }).addTo(map);
                routeLineRef.current = line;
                }
            }
            return;
            }

            // TERCER CLICK EN ADELANTE -> reset
            if (originMarkerRef.current) map.removeLayer(originMarkerRef.current);
            if (destMarkerRef.current) map.removeLayer(destMarkerRef.current);
            if (routeLineRef.current) map.removeLayer(routeLineRef.current);

            originMarkerRef.current = null;
            destMarkerRef.current = null;
            routeLineRef.current = null;
            hasOriginRef.current = false;

            setOrigen('');
            setDestino('');
            setDistanceKm(null);
            setEstimatedPrice(null);
        });
        }, []);


  // 3. enviar viaje al backend
  const handleCreateRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('No hay token, vuelve a iniciar sesión.');
      return;
    }

    if (!origen || !destino) {
      setError('Completa origen y destino (puedes usar el mapa).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const nuevoViaje = await createRide(origen, destino, token);

        setLastRide(nuevoViaje); // 👈 guardamos para mostrar “Conductor asignado”

        // recargar historial
        const data = await getMyRides(token);
        setRides(data);

        alert('Viaje creado correctamente');
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? 'Error al crear viaje');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <header className="register-header">
        <div className="register-header-left">
          <div className="register-logo-mini">SR</div>
          <div>
            <div className="register-header-title">Smart Ride</div>
            <div className="register-header-sub">
              Panel del pasajero
            </div>
          </div>
        </div>
      </header>

      <main className="register-main">
        <div className="admin-layout">
          {/* Panel lateral */}
          <aside className="admin-sidebar">
            <div className="flex gap-2 mb-3">
                <button
                type="button"
                className={
                    'admin-nav-button' +
                    (tab === 'nuevo' ? ' admin-nav-button-active' : '')
                }
                onClick={() => setTab('nuevo')}
                >
                Nuevo viaje
                </button>
                <button
                className="register-btn-ghost"
                onClick={() => navigate('/pasajero/viajes')}
                >
                Mis viajes
                </button>
            </div>

            {tab === 'nuevo' && (
            <>
                <h2 className="admin-sidebar-title">Nuevo viaje</h2>
                <p className="admin-content-subtitle">
                1º click en el mapa: origen. 2º click: destino.
                </p>

                {error && (
                <p className="text-red-600 text-sm mb-2">{error}</p>
                )}

                <form onSubmit={handleCreateRide}>
                <label className="sr-label">
                    Calle / referencia de origen
                </label>
                <input
                    className="sr-input"
                    value={origen}
                    onChange={(e) => setOrigen(e.target.value)}
                    placeholder="Ej: Plaza 14 de Septiembre"
                />

                <label className="sr-label">
                    Calle / referencia de destino
                </label>
                <input
                    className="sr-input"
                    value={destino}
                    onChange={(e) => setDestino(e.target.value)}
                    placeholder="Ej: UMSS puerta principal"
                />

                <label className="sr-label">Distancia estimada</label>
                <input
                    className="sr-input"
                    readOnly
                    value={
                    distanceKm != null
                        ? `${distanceKm} km (aprox.)`
                        : 'Selecciona origen y destino en el mapa'
                    }
                />

                <button
                    type="submit"
                    className="sr-btn-primary mt-3"
                    disabled={loading}
                >
                    {loading ? 'Creando viaje…' : 'Crear viaje'}
                </button>

                {distanceKm != null && (
                    <div className="mt-3 text-sm text-slate-700">
                    <p>
                        Distancia estimada:{' '}
                        <strong>{distanceKm} km</strong>
                    </p>
                    <p>
                        Precio estimado:{' '}
                        <strong>{estimatedPrice ?? '-'} Bs</strong>
                    </p>
                    </div>
                )}
                </form>

                {lastRide && (
                <div className="mt-4 p-3 rounded-md bg-white shadow-sm text-sm">
                    <h3 className="font-semibold mb-2">Conductor asignado</h3>

                    <p>
                    <span className="font-medium">ID viaje:</span>{' '}
                    {lastRide.id_viaje ?? lastRide.id}
                    </p>
                    <p>
                    <span className="font-medium">Estado:</span>{' '}
                    {lastRide.estado ?? '—'}
                    </p>
                    <p>
                    <span className="font-medium">ID conductor:</span>{' '}
                    {lastRide.id_conductor ?? 'Pendiente'}
                    </p>
                    <p>
                    <span className="font-medium">Fecha solicitud:</span>{' '}
                    {lastRide.fecha_solicitud
                        ? new Date(lastRide.fecha_solicitud).toLocaleString()
                        : '—'}
                    </p>
                    <p>
                    <span className="font-medium">Fecha asignación:</span>{' '}
                    {lastRide.fecha_asignacion
                        ? new Date(lastRide.fecha_asignacion).toLocaleString()
                        : 'Aún no asignado'}
                    </p>
                </div>
                )}
            </>
            )}


            <hr className="my-3" />

            {tab === 'historial' && (
            <>
                <h2 className="admin-sidebar-title">Mis viajes</h2>
                <p className="admin-content-subtitle">
                Aquí puedes ver el estado de todos tus viajes.
                </p>

                <div
                className="admin-table-wrapper"
                style={{ maxHeight: 320, overflowY: 'auto' }}
                >
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
                    {rides.map((r) => (
                        <tr
                        key={r.id_viaje ?? r.id}
                        className={
                            lastRide && (r.id_viaje ?? r.id) === (lastRide.id_viaje ?? lastRide.id)
                            ? 'bg-slate-50' // resalta el último viaje
                            : ''
                        }
                        >
                        <td>{r.id_viaje ?? r.id}</td>
                        <td>{r.origen}</td>
                        <td>{r.destino}</td>
                        <td className="capitalize">{r.estado ?? '-'}</td>
                        <td>
                            {r.fecha_solicitud
                            ? new Date(r.fecha_solicitud).toLocaleString()
                            : '—'}
                        </td>
                        </tr>
                    ))}

                    {rides.length === 0 && (
                        <tr>
                        <td colSpan={5} className="admin-table-empty">
                            Aún no tienes viajes.
                        </td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </>
            )}

          </aside>

          {/* Mapa */}
          <section className="admin-content-card">
            <div
              id="map-pasajero"
              style={{ width: '100%', height: '100%', minHeight: '500px' }}
            />
          </section>
        </div>
      </main>
    </div>
  );
};

export default PassengerTripsPage;
