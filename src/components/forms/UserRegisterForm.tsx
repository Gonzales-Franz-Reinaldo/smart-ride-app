// src/components/forms/UserRegisterForm.tsx
import { type FormEvent, useState } from 'react';
import { registerPassenger } from '../../api/userApi';

interface FormValues {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  genero: string;           // solo UI, NO se envía
  fechaNacimiento: string;  // solo UI, NO se envía
}

const UserRegisterForm = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    genero: 'Masculino',
    fechaNacimiento: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si quieres mostrar algún mensaje bonito luego, puedes usarlo
  // const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await registerPassenger({
        nombre: formValues.nombre,
        apellido: formValues.apellido,
        email: formValues.email,
        telefono: formValues.telefono,
        password: formValues.password,
      });

      // Si llegó aquí, se creó el pasajero
      // setSuccess('Cuenta creada correctamente. Ahora puedes iniciar sesión.');
      window.location.href = '/login';
    } catch (err: any) {
      console.error('Error al registrar pasajero:', err);
      setError(err.message ?? 'Error al registrar pasajero.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="sr-form">
      {error && (
        <p className="mt-2 text-sm text-red-600 break-words">{error}</p>
      )}

      <p className="text-sm text-slate-500 mb-3">
        Primero registramos tus datos personales. Este formulario crea
        una cuenta de <span className="font-semibold">pasajero</span>.
      </p>

      <div className="sr-form-grid">
        <div>
          <label className="sr-label" htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            value={formValues.nombre}
            onChange={handleChange}
            className="sr-input"
            placeholder="Nombre"
            required
          />
        </div>

        <div>
          <label className="sr-label" htmlFor="apellido">
            Apellido
          </label>
          <input
            id="apellido"
            name="apellido"
            value={formValues.apellido}
            onChange={handleChange}
            className="sr-input"
            placeholder="Apellido"
            required
          />
        </div>

        <div>
          <label className="sr-label" htmlFor="email">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleChange}
            className="sr-input"
            placeholder="tucorreo@ejemplo.com"
            required
          />
        </div>

        <div>
          <label className="sr-label" htmlFor="telefono">
            Teléfono
          </label>
          <input
            id="telefono"
            name="telefono"
            value={formValues.telefono}
            onChange={handleChange}
            className="sr-input"
            placeholder="+591 7xxxxxxx"
          />
        </div>

        <div>
          <label className="sr-label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formValues.password}
            onChange={handleChange}
            className="sr-input"
            placeholder="Mínimo 8 caracteres"
            required
          />
        </div>
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Rol seleccionado: <span className="font-semibold">Pasajero</span>
      </p>

      <button
        type="submit"
        disabled={loading}
        className="sr-btn-primary mt-4"
      >
        {loading ? 'Creando cuenta…' : 'Continuar'}
      </button>
    </form>
  );
};

export default UserRegisterForm;
