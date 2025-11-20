const USERS_API_URL = import.meta.env.VITE_USERS_API_URL;

if (!USERS_API_URL) {
  console.error('Falta VITE_USERS_API_URL en el .env');
}

async function request(path: string, options: RequestInit) {
  const resp = await fetch(`${USERS_API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(text || `Error HTTP ${resp.status}`);
  }

  if (resp.status === 204) return null;
  return resp.json();
}

export type RolUsuario = 'pasajero' | 'conductor' | 'admin';

export interface CreateUserDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  fecha_nacimiento?: string;
  genero?: string;
  rol: RolUsuario;
}

export interface User {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  rol: RolUsuario;
}

export interface CreateDriverDto {
  id_usuario: number;
  numero_licencia: string;
  tipo_licencia: string;
  fecha_vencimiento_licencia: string;
  marca_auto: string;
  modelo_auto: string;
  placa_auto: string;
}

// POST /users
export async function createUser(data: CreateUserDto): Promise<User> {
  return request('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// POST /users/conductores
export async function createDriverProfile(data: CreateDriverDto) {
  return request('/users/conductores', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// POST /auth/login  ← ajusta el path si tu backend usa otro
export async function loginUser(email: string, password: string) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
