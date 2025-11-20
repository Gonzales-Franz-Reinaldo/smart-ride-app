import React, { useState, type FormEvent } from 'react';

export interface UserRegisterFormValues {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  password: string;
  fecha_nacimiento: string;
  genero: string;
  rol: 'pasajero' | 'conductor';
}

interface UserRegisterFormProps {
  onSubmit?: (values: UserRegisterFormValues) => void;
}

const UserRegisterForm: React.FC<UserRegisterFormProps> = ({ onSubmit }) => {
  const [formValues, setFormValues] = useState<UserRegisterFormValues>({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    fecha_nacimiento: '',
    genero: 'masculino',
    rol: 'pasajero',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit?.(formValues);
  };

  const isConductor = formValues.rol === 'conductor';

  return (
    <form className="sr-form" onSubmit={handleSubmit}>
      {/* Switch pasajero / conductor */}
      <div className="sr-role-switch">
        <button
          type="button"
          className={`sr-role-option ${
            formValues.rol === 'pasajero' ? 'active' : ''
          }`}
          onClick={() =>
            setFormValues(prev => ({ ...prev, rol: 'pasajero' }))
          }
        >
          Soy pasajero
        </button>
        <button
          type="button"
          className={`sr-role-option ${
            formValues.rol === 'conductor' ? 'active' : ''
          }`}
          onClick={() =>
            setFormValues(prev => ({ ...prev, rol: 'conductor' }))
          }
        >
          Soy conductor
        </button>
      </div>

      <p className="sr-hint">
        Primero registramos tus datos personales. Si eliges{' '}
        <strong>conductor</strong>, después se completan los datos del vehículo.
      </p>

      {/* Datos personales */}
      <div style={{ marginTop: 16 }}>
        <h2 className="sr-section-title">Datos personales</h2>

        <div className="sr-form-grid">
          <div>
            <label className="sr-label" htmlFor="nombre">
              Nombre
            </label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              className="sr-input"
              placeholder="Nombre"
              value={formValues.nombre}
              onChange={handleChange}
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
              type="text"
              className="sr-input"
              placeholder="Apellido"
              value={formValues.apellido}
              onChange={handleChange}
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
              className="sr-input"
              placeholder="tucorreo@ejemplo.com"
              value={formValues.email}
              onChange={handleChange}
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
              type="tel"
              className="sr-input"
              placeholder="+591 7xxxxxxx"
              value={formValues.telefono}
              onChange={handleChange}
              required
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
              className="sr-input"
              placeholder="Mínimo 8 caracteres"
              value={formValues.password}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="sr-label" htmlFor="fecha_nacimiento">
              Fecha de nacimiento
            </label>
            <input
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              type="date"
              className="sr-input"
              value={formValues.fecha_nacimiento}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="sr-label" htmlFor="genero">
              Género
            </label>
            <select
              id="genero"
              name="genero"
              className="sr-select"
              value={formValues.genero}
              onChange={handleChange}
            >
              <option value="masculino">Masculino</option>
              <option value="femenino">Femenino</option>
              <option value="otro">Otro</option>
              <option value="prefiero_no_decir">Prefiero no decir</option>
            </select>
          </div>

          <div className="sr-field-full">
            <p className="sr-role-info">
              Rol seleccionado: <strong>{isConductor ? 'Conductor' : 'Pasajero'}</strong>
            </p>
          </div>
        </div>
      </div>

      <hr className="sr-divider" />

      <button type="submit" className="sr-btn-primary">
        Continuar
      </button>

      <p className="sr-small-link">
        ¿Ya tienes cuenta? <a href="#">Inicia sesión aquí.</a>
      </p>
    </form>
  );
};

export default UserRegisterForm;
