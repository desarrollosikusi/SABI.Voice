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
  const resp = await fetch(url, { ...options, cache: 'no-store' });
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

  getCustomerMe: async () => {
    return await customFetch(`${API_URL}/portal/me`, {
      headers: getHeaders(),
    });
  },

  updateCustomerMe: async (data: any) => {
    return await customFetch(`${API_URL}/portal/me`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
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

  getCustomerPqrsfById: async (id: string | number) => {
    return await customFetch(`${API_URL}/portal/pqrsf/${id}`, {
      headers: getHeaders(),
    });
  },

  getCustomerPqrsfCommunications: async (id: string | number) => {
    return await customFetch(`${API_URL}/portal/pqrsf/${id}/communications`, {
      headers: getHeaders(),
    });
  },

  createCustomerCommunication: async (id: string | number, mensaje: string) => {
    return await customFetch(`${API_URL}/portal/pqrsf/${id}/communications`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ mensaje })
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

  getEconomicSectors: async () => {
    return await customFetch(`${API_URL}/catalogs/economic-sectors`, {
      headers: getHeaders(),
    });
  },

  getInternalUsers: async () => {
    return await customFetch(`${API_URL}/catalogs/internal-users`, {
      headers: getHeaders(),
    });
  },
  createContact: async (data: any) => {
    return await customFetch(`${API_URL}/contacts`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  updateContact: async (id: number, data: any) => {
    return await customFetch(`${API_URL}/contacts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  deactivateContact: async (id: number, reporter: string, support: string) => {
    return await customFetch(`${API_URL}/contacts/${id}/deactivate`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ deactivation_reporter: reporter, deactivation_support: support }),
    });
  },

  reactivateContact: async (id: number) => {
    return await customFetch(`${API_URL}/contacts/${id}/reactivate`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
  },

  updateCustomerAdmin: async (id: number, data: any) => {
    return await customFetch(`${API_URL}/admin/customers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  createCustomer: async (data: any) => {
    return await customFetch(`${API_URL}/customers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
  },

  checkNit: async (nit: string) => {
    return await customFetch(`${API_URL}/customers/check-nit/${encodeURIComponent(nit)}`, {
      headers: getHeaders(),
    });
  },

  uploadCustomerLogo: async (id: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await fetch(`${API_URL}/admin/customers/${id}/logo`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData,
    });
    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to upload logo');
    }
    return resp.json();
  },

  getAdminCustomers: async (filters: any = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.economic_sector_id) params.append('economic_sector_id', filters.economic_sector_id);
    else if (filters.sector) params.append('sector', filters.sector);
    if (filters.pm_id) params.append('pm_id', filters.pm_id);
    if (filters.sdm_id) params.append('sdm_id', filters.sdm_id);
    if (filters.am_id) params.append('am_id', filters.am_id);
    
    return await customFetch(`${API_URL}/admin/customers?${params.toString()}`, {
      headers: getHeaders(),
    });
  },

  getAdminCustomerById: async (id: number | string) => {
    return await customFetch(`${API_URL}/admin/customers/${id}`, {
      headers: getHeaders(),
    });
  },

  getAdminUsers: async () => {
    return await customFetch(`${API_URL}/admin/users`, {
      headers: getHeaders(),
    });
  },

  getCustomerSectors: async () => {
    return await customFetch(`${API_URL}/admin/customers/sectors`, {
      headers: getHeaders(),
    });
  },

  getEconomicSectors: async () => {
    return await customFetch(`${API_URL}/catalogs/economic-sectors`, {
      headers: getHeaders(),
    });
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
  
  getCustomerDashboard: async () => {
    return await customFetch(`${API_URL}/portal/dashboard`, {
      headers: getHeaders(),
    });
  },
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
