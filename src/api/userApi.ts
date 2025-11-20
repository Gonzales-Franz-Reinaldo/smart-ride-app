// src/api/userApi.ts
import type { User, DriverProfile } from '../types/user';

export type UserRole = 'admin' | 'pasajero' | 'conductor';

export interface UserFromApi extends User {
  access_token?: string;
  refresh_token?: string;
  [key: string]: any;
}

const AUTH_BASE_URL =
  import.meta.env.VITE_AUTH_API_URL ?? 'http://localhost/api/v1';

// ====================== LOGIN ======================
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${AUTH_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    throw new Error('No se pudo leer la respuesta del servidor');
  }

  if (!res.ok) {
    const msg =
      data?.message ??
      'Error al iniciar sesión (respuesta no exitosa del servidor).';
    throw new Error(msg);
  }

  const payload = data?.data ?? data;

  if (!payload || !payload.access_token || !payload.rol) {
    console.error('Estructura de login inesperada:', data);
    throw new Error('Respuesta de login inesperada del servidor');
  }

  return {
    token: payload.access_token as string,
    user: payload as UserFromApi,
  };
}

// ================== REGISTRO PASAJERO ==================
export async function registerPassenger(dto: {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  password: string;
}) {
  const res = await fetch(`${AUTH_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.message ?? 'Error al registrar pasajero (respuesta no exitosa).';
    throw new Error(msg);
  }

  return data;
}

// ================ LISTAR USUARIOS (ADMIN) ================
export async function fetchAllUsers(token: string): Promise<User[]> {
  const res = await fetch(`${AUTH_BASE_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.message ?? 'Error al obtener usuarios desde el backend.';
    throw new Error(msg);
  }

  // Tu backend responde { success: true, data: [...] }
  const list = data?.data ?? data;
  return (list as any[]).map(u => ({
    id_usuario: u.id_usuario,
    nombre: u.nombre,
    apellido: u.apellido,
    email: u.email,
    telefono: u.telefono ?? null,
    rol: u.rol,
    estado_cuenta: u.estado_cuenta ?? null,
  }));
}

// ============== LISTAR CONDUCTORES (ADMIN) ==============
export async function fetchAllDrivers(token: string): Promise<DriverProfile[]> {
  const res = await fetch(`${AUTH_BASE_URL}/users/conductores/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.message ?? 'Error al obtener conductores desde el backend.';
    throw new Error(msg);
  }

  // Tu backend responde algo así:
  // { success: true, data: [ {...}, {...} ], total: 1, ... }
  const raw = data?.data ?? data;

  // Caso normal: data.data es un array
  if (Array.isArray(raw)) {
    return raw as DriverProfile[];
  }

  // Por si algún día tu backend envía { data: { data: [...], total: ... } }
  if (raw && Array.isArray((raw as any).data)) {
    return (raw as any).data as DriverProfile[];
  }

  console.log('fetchAllDrivers: estructura inesperada', data);
  return [];
}



// 🔹 Crear usuario con rol CONDUCTOR (solo usuario)
export async function createConductorUser(
  payload: {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    password: string;
  },
  token: string
) {
  const res = await fetch(`${AUTH_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...payload,
      rol: 'conductor',
      // si luego tu backend exige fecha_nacimiento / genero, los agregas aquí
    }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.message ?? 'Error al crear el usuario conductor.';
    throw new Error(msg);
  }

  // devolvemos la respuesta tal cual la manda el backend
  return data;
}


// Crea el perfil de conductor usando POST /users/conductores
export async function createDriverProfile(
  dto: {
    id_usuario: number;
    numero_licencia: string;
    tipo_licencia: string;
    fecha_vencimiento_licencia: string;
    marca_auto: string;
    modelo_auto: string;
    placa_auto: string;
  },
  token: string
) {
  const res = await fetch(`${AUTH_BASE_URL}/users/conductores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(dto),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      data?.message ?? 'Error al crear perfil de conductor.';
    throw new Error(msg);
  }

  return data;
}

// Cambia el estado del conductor (activo / inactivo)
export async function cambiarEstadoConductor(
  conductorId: number,
  nuevoEstado: string, // 'disponible' | 'inactivo' | etc.
  token: string,
): Promise<DriverProfile> {
  const res = await fetch(
    // ⚠️ PON AQUÍ EXACTAMENTE TU ENDPOINT QUE YA PROBASTE EN POSTMAN
    `${AUTH_BASE_URL}/users/conductores/${conductorId}/estado`,
    {
      method: 'PATCH', // o el método que uses en tu backend
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        estado_conductor: nuevoEstado,
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    console.error('Error al cambiar estado:', text);
    throw new Error('No se pudo cambiar el estado del conductor');
  }

  return (await res.json()) as DriverProfile;
}
