/* // src/types/user.ts

export type UserRole = 'pasajero' | 'conductor' | 'admin';

export interface UserRegisterFormValues {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  fecha_nacimiento: string; // luego podemos usar Date si quieres
  genero: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
  rol: UserRole;
}

export interface DriverProfileFormValues {
  id_usuario: number;
  numero_licencia: string;
  tipo_licencia: 'A' | 'B' | 'C';
  fecha_vencimiento_licencia: string;
  marca_auto: string;
  modelo_auto: string;
  placa_auto: string;
}
 */

// src/types/user.ts

// Roles que maneja el sistema
export type UserRole = 'pasajero' | 'conductor' | 'admin';

/* ===========================
   1. Tipos de ENTIDAD (BD / API)
   =========================== */

export interface User {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  rol: UserRole;
  estado_cuenta?: string;
}

export interface DriverProfile {
  id_conductor: number;
  id_usuario: number;
  numero_licencia: string;
  tipo_licencia: string;
  fecha_vencimiento_licencia: string;
  marca_auto: string;
  modelo_auto: string;
  placa_auto: string;
  estado_conductor?: string | null;
  usuario?: User; // viene embebido desde el backend
}

/* ===========================
   2. Tipos para FORMULARIOS
   (los que ya tenías)
   =========================== */

export interface UserRegisterFormValues {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  fecha_nacimiento: string; // si ya no la usas, luego la quitamos
  genero: 'masculino' | 'femenino' | 'otro' | 'prefiero_no_decir';
  rol: UserRole;
}

export interface DriverProfileFormValues {
  id_usuario: number;
  numero_licencia: string;
  tipo_licencia: 'A' | 'B' | 'C';
  fecha_vencimiento_licencia: string;
  marca_auto: string;
  modelo_auto: string;
  placa_auto: string;
}
