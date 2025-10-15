import React, { useState, useEffect } from "react";
import type { Customer, CustomerFormData } from "../../types/crm";
import "./CustomerForm.css";

interface CustomerFormProps {
  customer?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    cpf: "",
    birthDate: "",
    address: {
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
    },
    preferences: {
      favoriteProducts: [],
      dietaryRestrictions: [],
      observations: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        whatsapp: customer.whatsapp || "",
        cpf: customer.cpf || "",
        birthDate: customer.birthDate || "",
        address: customer.address || {
          street: "",
          number: "",
          complement: "",
          neighborhood: "",
          city: "",
          state: "",
          zipCode: "",
        },
        preferences: customer.preferences || {
          favoriteProducts: [],
          dietaryRestrictions: [],
          observations: "",
        },
      });
    }
  }, [customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (err) {
      setError("Erro ao salvar cliente");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address!,
        [name]: value,
      },
    }));
  };

  const handlePreferencesChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences!,
        [name]: value,
      },
    }));
  };

  return (
    <div className="customer-form-container">
      <h2>{customer ? "Editar Cliente" : "Novo Cliente"}</h2>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="customer-form">
        <div className="form-section">
          <h3>Informações Básicas</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Nome Completo *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Telefone *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="cpf">CPF</label>
              <input
                type="text"
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleChange}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="birthDate">Data de Nascimento</label>
              <input
                type="date"
                id="birthDate"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Endereço</h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="zipCode">CEP</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.address?.zipCode}
                onChange={handleAddressChange}
                placeholder="00000-000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="street">Rua</label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.address?.street}
                onChange={handleAddressChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="number">Número</label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.address?.number}
                onChange={handleAddressChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="complement">Complemento</label>
              <input
                type="text"
                id="complement"
                name="complement"
                value={formData.address?.complement}
                onChange={handleAddressChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="neighborhood">Bairro</label>
              <input
                type="text"
                id="neighborhood"
                name="neighborhood"
                value={formData.address?.neighborhood}
                onChange={handleAddressChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">Cidade</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.address?.city}
                onChange={handleAddressChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">Estado</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.address?.state}
                onChange={handleAddressChange}
                maxLength={2}
                placeholder="SP"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Preferências</h3>
          <div className="form-group">
            <label htmlFor="observations">Observações</label>
            <textarea
              id="observations"
              name="observations"
              value={formData.preferences?.observations}
              onChange={handlePreferencesChange}
              rows={4}
              placeholder="Preferências alimentares, restrições, observações gerais..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CustomerForm;
