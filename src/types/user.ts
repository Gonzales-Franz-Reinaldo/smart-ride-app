// src/types/user.ts

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
