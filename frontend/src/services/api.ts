const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const getHeaders = () => {
  return {
    "Content-Type": "application/json",
  };
};

export const logout = async () => {
  try {
    await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
  } catch(e) {}
  if (typeof window !== 'undefined') {
    if (window.location.pathname.startsWith('/portal-cliente') || window.location.pathname.startsWith('/nueva-solicitud')) {
        window.location.href = '/portal-cliente/login';
    } else {
        window.location.href = '/login';
    }
  }
};

const handleErrorResponse = async (resp: Response) => {
  if (resp.status === 401) {
    logout();
    return new Error("Sesión expirada. Por favor, inicie sesión nuevamente.");
  }
  if (resp.status === 403) {
    return new Error("Acceso denegado. No tienes permisos para realizar esta acción.");
  }
  
  if (resp.status === 404) {
    return new Error("El recurso solicitado no fue encontrado.");
  }
  
  if (resp.status >= 500) {
    return new Error("Ocurrió un error en el servidor. Por favor, intente más tarde.");
  }

  const err = await resp.json().catch(() => ({}));
  
  if (err.detail && Array.isArray(err.detail)) {
    // Pydantic 422 error
    const pydanticErrors = err.detail.map((e: any) => {
      const field = e.loc[e.loc.length - 1];
      return `El campo '${field}' es inválido o requerido.`;
    }).join('\n');
    return new Error(pydanticErrors);
  }
  
  return new Error(typeof err.detail === 'string' ? err.detail : (err.message || "Error en la petición"));
};

const customFetch = async (url: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});

  const finalOptions = {
    ...options,
    headers,
    credentials: "include" as RequestCredentials,
    cache: 'no-store' as RequestCache
  };
  const resp = await fetch(url, finalOptions);
  
  if (!resp.ok) {
    throw await handleErrorResponse(resp);
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
      credentials: "include"
    });
    if (!resp.ok) {
      throw await handleErrorResponse(resp);
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

  getPqrsfs: async (filters: any = {}) => {
    const params = new URLSearchParams();
    if (filters.area) params.append('area', filters.area);
    if (filters.customer_id) params.append('customer_id', filters.customer_id);
    if (filters.status_id) params.append('status_id', filters.status_id);
    if (filters.priority_id) params.append('priority_id', filters.priority_id);
    if (filters.assigned_to) params.append('assigned_to', filters.assigned_to);
    if (filters.from_date) params.append('from_date', filters.from_date);
    if (filters.to_date) params.append('to_date', filters.to_date);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return await customFetch(`${API_URL}/pqrsf${queryString}`, {
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
      credentials: "include"
    });
    if (!resp.ok) throw new Error("Failed to create case");
    return resp.json();
  },

  uploadAttachment: async (pqrsfId: string | number, file: File, observation?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (observation) {
      formData.append("observacion", observation);
    }
    return await customFetch(`${API_URL}/pqrsf/${pqrsfId}/attachments`, {
      method: 'POST',
      body: formData
    });
  },

  classifyPqrsf: async (asunto: string, descripcion: string) => {
    const resp = await fetch(`${API_URL}/pqrsf/classify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ asunto, descripcion }),
      credentials: "include"
    });
    if (!resp.ok) throw new Error("Failed to classify case");
    return resp.json();
  },

  searchCustomers: async (search: string) => {
    const resp = await fetch(`${API_URL}/catalogs/customers?search=${encodeURIComponent(search)}`, {
      headers: { "Content-Type": "application/json" }, // public for now
      credentials: "include"
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
    
    // Bypass Next.js proxy on local dev to prevent multipart/form-data stream drops
    const baseUrl = (typeof window !== 'undefined' && window.location.hostname === 'localhost' && API_URL.startsWith('/')) 
      ? 'http://localhost:8000' 
      : API_URL;
      
    const resp = await fetch(`${baseUrl}/admin/customers/${id}/logo`, {
      method: 'POST',
      body: formData,
      credentials: "include"
    });
    if (!resp.ok) {
      throw await handleErrorResponse(resp);
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



  getCustomerContacts: async (customerId: number) => {
    const resp = await fetch(`${API_URL}/customers/${customerId}/contacts`, {
      headers: { "Content-Type": "application/json" }, // public for now
      credentials: "include"
    });
    if (!resp.ok) throw new Error("Failed to get contacts");
    return resp.json();
  },

  getCatalogs: async () => {
    const resp = await fetch(`${API_URL}/catalogs`, { credentials: "include" });
    if (!resp.ok) throw new Error("Failed to fetch catalogs");
    return resp.json();
  },

  getCaseCategories: async () => {
    return await customFetch(`${API_URL}/catalogs/case-categories`, {
      headers: getHeaders(),
    });
  },

  getCaseSources: async () => {
    return await customFetch(`${API_URL}/catalogs/case-sources`, {
      headers: getHeaders(),
    });
  },

  updatePqrsf: async (id: string | number, updateData: any) => {
    const resp = await fetch(`${API_URL}/pqrsf/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
      credentials: "include"
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
      credentials: "include"
    });
    if (!resp.ok) throw new Error("Failed to add comment");
    return resp.json();
  },

  updateFindingStatus: async (pqrsfId: number | string, findingId: number | string, estado: string) => {
    const resp = await fetch(`${API_URL}/pqrsf/${pqrsfId}/findings/${findingId}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ estado }),
      credentials: "include"
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
  },

  // --- Contracts API ---
  getCustomerContracts: async (customerId: string | number, filters: any = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.contract_type) params.append('contract_type', filters.contract_type);
    if (filters.architecture) params.append('architecture', filters.architecture);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    
    return await customFetch(`${API_URL}/admin/customers/${customerId}/contracts${queryString}`, {
      headers: getHeaders(),
      cache: 'no-store' // Compliance with AG-001
    });
  },

  getCustomerContractMetrics: async (customerId: string | number) => {
    return await customFetch(`${API_URL}/admin/customers/${customerId}/contracts/metrics`, {
      headers: getHeaders(),
      cache: 'no-store' // Compliance with AG-001
    });
  },

  getIntegrationStatus: async () => {
    return await customFetch(`${API_URL}/admin/contracts/integration-status`, {
      headers: getHeaders(),
      cache: 'no-store' // Compliance with AG-001
    });
  },

  getContractDetails: async (externalId: string) => {
    return await customFetch(`${API_URL}/admin/contracts/${externalId}`, {
      headers: getHeaders(),
      cache: 'no-store' // Compliance with AG-001
    });
  },

  // ==========================================
  // COMMAND CENTER ENDPOINTS (Sprint 2 & 3 Evolution)
  // ==========================================

  getGlobalCommandCenterSummary: async () => {
    return await customFetch(`${API_URL}/admin/command-center/global/summary`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
  },

  getGlobalCommandCenterMyWork: async () => {
    return await customFetch(`${API_URL}/admin/command-center/global/my-work`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
  },

  getGlobalCommandCenterAlerts: async () => {
    return await customFetch(`${API_URL}/admin/command-center/global/alerts`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
  },

  getGlobalCommandCenterActions: async () => {
    return await customFetch(`${API_URL}/admin/command-center/global/actions`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
  },

  getGlobalTimeline: async (filters: { entity_type?: string, entity_id?: number, customer_id?: number } = {}) => {
    const params = new URLSearchParams();
    if (filters.entity_type) params.append('entity_type', filters.entity_type);
    if (filters.entity_id) params.append('entity_id', filters.entity_id.toString());
    if (filters.customer_id) params.append('customer_id', filters.customer_id.toString());
    const qs = params.toString() ? `?${params.toString()}` : '';

    return await customFetch(`${API_URL}/admin/events/timeline${qs}`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
  },

  getCommandCenterAlerts: async (customerId: string | number) => {
    return await customFetch(`${API_URL}/admin/command-center/${customerId}/alerts`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
  },

  getCommandCenterActions: async (customerId: string | number) => {
    return await customFetch(`${API_URL}/admin/command-center/${customerId}/actions`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
  },



  getCommandCenterAiSummary: async (customerId: string | number) => {
    return await customFetch(`${API_URL}/admin/command-center/${customerId}/ai-summary`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
  },

  getCommandCenterTimeline: async (customerId: string | number) => {
    return await customFetch(`${API_URL}/admin/command-center/${customerId}/timeline`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
  },

  getAllowedTransitions: async (pqrsfId: number | string) => {
    return await customFetch(`${API_URL}/pqrsf/${pqrsfId}/allowed-transitions`, {
      headers: getHeaders()
    });
  },

  executeTransition: async (pqrsfId: number | string, data: any) => {
    return await customFetch(`${API_URL}/pqrsf/${pqrsfId}/transition`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
  },

  // ==========================================
  // EVENTS / NOTIFICATIONS (Sprint 3)
  // ==========================================

  getMyEvents: async (status?: string, severity?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (severity) params.append('severity', severity);
    const qs = params.toString() ? `?${params.toString()}` : '';

    return await customFetch(`${API_URL}/admin/events${qs}`, {
      headers: getHeaders(),
      cache: 'no-store'
    });
  },

  markEventRead: async (receiptId: string | number) => {
    return await customFetch(`${API_URL}/admin/events/${receiptId}/read`, {
      method: 'PUT',
      headers: getHeaders()
    });
  },

  archiveEvent: async (receiptId: string | number) => {
    return await customFetch(`${API_URL}/admin/events/${receiptId}/archive`, {
      method: 'PUT',
      headers: getHeaders()
    });
  },

  // Documentos MVP
  getDocuments: async (filters: any = {}) => {
    const params = new URLSearchParams();
    if (filters.category_id) params.append('category_id', filters.category_id.toString());
    const qs = params.toString() ? `?${params.toString()}` : '';
    return await customFetch(`${API_URL}/documents${qs}`, { headers: getHeaders() });
  },

  getDocumentCategories: async () => {
    return await customFetch(`${API_URL}/documents/categories`, { headers: getHeaders() });
  },

  getDocumentCustomers: async () => {
    return await customFetch(`${API_URL}/documents/customers`, { headers: getHeaders() });
  },

  createDocument: async (formData: FormData) => {
    // Para FormData NO incluimos Content-Type para que el navegador asigne el boundary
    const headers = new Headers();
    // customFetch merges headers, but we might need to rely on standard fetch or customFetch if it allows omitting.
    return await customFetch(`${API_URL}/documents`, {
      method: 'POST',
      body: formData
    });
  },

  deleteDocument: async (id: number) => {
    return await customFetch(`${API_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
  }
};
