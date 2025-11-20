import React, { useState, type FormEvent } from 'react';

export interface DriverProfileFormValues {
  numero_licencia: string;
  tipo_licencia: string;
  fecha_vencimiento_licencia: string;
  marca_auto: string;
  modelo_auto: string;
  placa_auto: string;
}

interface DriverProfileFormProps {
  onSubmit?: (values: DriverProfileFormValues) => void;
  onBack?: () => void;
}

const DriverProfileForm: React.FC<DriverProfileFormProps> = ({
  onSubmit,
  onBack,
}) => {
  const [formValues, setFormValues] = useState<DriverProfileFormValues>({
    numero_licencia: '',
    tipo_licencia: '',
    fecha_vencimiento_licencia: '',
    marca_auto: '',
    modelo_auto: '',
    placa_auto: '',
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

  return (
    <form className="sr-form" onSubmit={handleSubmit}>
      <h2 className="sr-section-title">Datos de conductor</h2>

      <div className="sr-form-grid">
        <div>
          <label className="sr-label" htmlFor="numero_licencia">
            Número de licencia
          </label>
          <input
            id="numero_licencia"
            name="numero_licencia"
            type="text"
            className="sr-input"
            placeholder="Ej: LIC443456"
            value={formValues.numero_licencia}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="sr-label" htmlFor="tipo_licencia">
            Tipo de licencia
          </label>
          <select
            id="tipo_licencia"
            name="tipo_licencia"
            className="sr-select"
            value={formValues.tipo_licencia}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione…</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </div>

        <div>
          <label className="sr-label" htmlFor="fecha_vencimiento_licencia">
            Fecha de vencimiento de licencia
          </label>
          <input
            id="fecha_vencimiento_licencia"
            name="fecha_vencimiento_licencia"
            type="date"
            className="sr-input"
            value={formValues.fecha_vencimiento_licencia}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="sr-label" htmlFor="placa_auto">
            Placa del vehículo
          </label>
          <input
            id="placa_auto"
            name="placa_auto"
            type="text"
            className="sr-input"
            placeholder="ABC-1234"
            value={formValues.placa_auto}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="sr-label" htmlFor="marca_auto">
            Marca del vehículo
          </label>
          <input
            id="marca_auto"
            name="marca_auto"
            type="text"
            className="sr-input"
            placeholder="Toyota, Nissan, etc."
            value={formValues.marca_auto}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="sr-label" htmlFor="modelo_auto">
            Modelo del vehículo
          </label>
          <input
            id="modelo_auto"
            name="modelo_auto"
            type="text"
            className="sr-input"
            placeholder="Yaris, Corolla, etc."
            value={formValues.modelo_auto}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="sr-btn-row">
        {onBack && (
          <button
            type="button"
            className="sr-btn-secondary"
            onClick={onBack}
          >
            Volver
          </button>
        )}

        <button type="submit" className="sr-btn-primary">
          Finalizar registro
        </button>
      </div>
    </form>
  );
};

export default DriverProfileForm;
