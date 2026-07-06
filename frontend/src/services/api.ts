const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const logout = () => {
  localStorage.clear();
  sessionStorage.clear();
  if (typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/portal-cliente')) {
        window.location.href = '/portal-cliente/login';
    } else {
        window.location.href = '/login';
    }
  }
};

const customFetch = async (url: string, options: RequestInit = {}) => {
  const resp = await fetch(url, options);
  if (resp.status === 401 || resp.status === 403) {
    logout();
    throw new Error("Sesión expirada o acceso denegado. Por favor, inicie sesión nuevamente.");
  }
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || "Error en la petición");
  }
  return resp.json();
};

export const api = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const resp = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData,
    });
    if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.detail || "Login failed");
    }
    return resp.json();
  },

  getMe: async () => {
    return await customFetch(`${API_URL}/users/me`, {
      headers: getHeaders(),
    });
  },

  getExecutiveSummary: async () => {
    return await customFetch(`${API_URL}/dashboard/executive-summary`, {
      headers: getHeaders(),
    });
  },

  getRootCauses: async () => {
    return await customFetch(`${API_URL}/dashboard/root-causes`, {
      headers: getHeaders(),
    });
  },

  getExecutiveInsights: async () => {
    return await customFetch(`${API_URL}/dashboard/executive-insights`, {
      headers: getHeaders(),
    });
  },

  getPqrsfs: async (area?: string) => {
    const url = area ? `${API_URL}/pqrsf?area=${encodeURIComponent(area)}` : `${API_URL}/pqrsf`;
    return await customFetch(url, {
      headers: getHeaders(),
    });
  },

  getPqrsfById: async (id: string | number) => {
    return await customFetch(`${API_URL}/pqrsf/${id}`, {
      headers: getHeaders(),
    });
  },

  createPqrsf: async (data: any) => {
    // Public endpoint, no auth header needed but safe to pass if logged in
    const resp = await fetch(`${API_URL}/pqrsf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!resp.ok) throw new Error("Failed to create case");
    return resp.json();
  },

  classifyPqrsf: async (asunto: string, descripcion: string) => {
    const resp = await fetch(`${API_URL}/pqrsf/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asunto, descripcion }),
    });
    if (!resp.ok) throw new Error("Failed to classify case");
    return resp.json();
  },

  searchCustomers: async (search: string) => {
    const resp = await fetch(`${API_URL}/catalogs/customers?search=${encodeURIComponent(search)}`, {
      headers: { "Content-Type": "application/json" }, // public for now
    });
    if (!resp.ok) throw new Error("Failed to search customers");
    return resp.json();
  },

  getCustomerContacts: async (customerId: number) => {
    const resp = await fetch(`${API_URL}/customers/${customerId}/contacts`, {
      headers: { "Content-Type": "application/json" }, // public for now
    });
    if (!resp.ok) throw new Error("Failed to get contacts");
    return resp.json();
  },

  getCatalogs: async () => {
    const resp = await fetch(`${API_URL}/catalogs`);
    if (!resp.ok) throw new Error("Failed to fetch catalogs");
    return resp.json();
  },

  updatePqrsf: async (id: string | number, updateData: any) => {
    const resp = await fetch(`${API_URL}/pqrsf/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData)
    });
    if (!resp.ok) throw new Error("Failed to update case");
    return resp.json();
  },
  
  // ==================
  // CUSTOMER PORTAL
  // ==================
  
  getMyPqrsfs: async () => {
    return await customFetch(`${API_URL}/portal/pqrsf/mine`, {
      headers: getHeaders(),
    });
  },
  
  getCommunications: async (pqrsfId: string | number) => {
    return await customFetch(`${API_URL}/pqrsf/${pqrsfId}/communications`, {
      headers: getHeaders(),
    });
  },
  
  createCommunication: async (pqrsfId: string | number, data: any) => {
    return await customFetch(`${API_URL}/pqrsf/${pqrsfId}/communications`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  addComment: async (id: number | string, comentario: string) => {
    const resp = await fetch(`${API_URL}/pqrsf/${id}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ comentario }),
    });
    if (!resp.ok) throw new Error("Failed to add comment");
    return resp.json();
  },

  updateFindingStatus: async (pqrsfId: number | string, findingId: number | string, estado: string) => {
    const resp = await fetch(`${API_URL}/pqrsf/${pqrsfId}/findings/${findingId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ estado }),
    });
    if (!resp.ok) throw new Error("Failed to update finding status");
    return resp.json();
  },

  getCustomerRelationshipDashboard: async () => {
    return await customFetch(`${API_URL}/dashboard/customer-relationship`, {
      headers: getHeaders()
    });
  },

  getCustomer: async (id: number) => {
    return await customFetch(`${API_URL}/admin/customers/${id}`, {
      headers: getHeaders()
    });
  }
};
