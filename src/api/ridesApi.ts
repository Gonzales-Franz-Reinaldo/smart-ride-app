// src/api/ridesApi.ts
// src/api/ridesApi.ts
export interface Ride {
  id?: number;          // por si en algún momento usas id simple
  id_viaje?: number;
  id_cliente?: number;
  id_conductor?: number | null;
  origen: string;
  destino: string;
  estado?: string;
  fecha_solicitud?: string;
  fecha_asignacion?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  motivo_cancelacion?: string | null;
  created_at?: string;
  updated_at?: string;
  distancia_km?: number;
  precio_estimado?: number;
}


const BASE_URL =
  import.meta.env.VITE_RIDES_API_URL ?? 'http://localhost/api/v1';

// Crear viaje
export async function createRide(
  origen: string,
  destino: string,
  token: string,
  extra?: { distancia_km?: number; precio_estimado?: number },
): Promise<Ride> {
  const body: any = { origen, destino, ...extra };

  const res = await fetch(`${BASE_URL}/rides`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Error createRide:', text);
    throw new Error('No se pudo crear el viaje');
  }

  return (await res.json()) as Ride;
}


// Listar mis viajes (historial)
export async function getMyRides(token: string): Promise<Ride[]> {
  const res = await fetch(`${BASE_URL}/rides`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Error getMyRides:', text);
    throw new Error('No se pudo obtener el historial de viajes');
  }

  return (await res.json()) as Ride[];
}

export async function getRideById(
  id_viaje: number,
  token: string,
): Promise<Ride> {
  const res = await fetch(`${BASE_URL}/rides/${id_viaje}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Error getRideById:', text);
    throw new Error('No se pudo obtener el detalle del viaje');
  }

  return (await res.json()) as Ride;
}

// Cambiar estado de un viaje (para el conductor)
export async function updateRideState(
  id_viaje: number,
  action: string, // por ejemplo: 'start', 'finish', 'cancel', etc.
  token: string,
): Promise<Ride> {
  const res = await fetch(`${BASE_URL}/rides/state/${id_viaje}/${action}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Error updateRideState:', text);
    throw new Error('No se pudo actualizar el estado del viaje');
  }

  return (await res.json()) as Ride;
}

