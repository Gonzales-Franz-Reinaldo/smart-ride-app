import { apiFetch } from './http';

export interface AuthUser {
  id_usuario: number;
  email: string;
  rol: 'pasajero' | 'conductor' | 'admin';
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export async function loginRequest(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
