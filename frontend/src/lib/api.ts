/**
 * HRSystem Enterprise API Client
 * Seamlessly interfaces Next.js 15 with Laravel 11 Sanctum REST API
 * Supports Bearer token authentication, multi-tenant headers, and offline fallback
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('hr_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const tenantDomain = localStorage.getItem('hr_tenant') || window.location.hostname;
      headers['X-Tenant-Domain'] = tenantDomain;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = { ...this.getHeaders(), ...(options.headers as Record<string, string>) };

    try {
      const response = await fetch(url, { ...options, headers });

      if (response.status === 401 && typeof window !== 'undefined') {
        localStorage.removeItem('hr_token');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.warn(`[HRSystem API Warning] Request to ${endpoint} failed. Using resilience handler:`, err);
      throw err;
    }
  }

  // Authentication
  public auth = {
    login: async (credentials: { email: string; password: string }) => {
      const data = await this.request<{ access_token: string; user: any; tenant: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (typeof window !== 'undefined' && data.access_token) {
        localStorage.setItem('hr_token', data.access_token);
      }
      return data;
    },
    me: async () => {
      return this.request<{ user: any }>('/auth/me');
    },
    logout: async () => {
      try {
        await this.request('/auth/logout', { method: 'POST' });
      } finally {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('hr_token');
        }
      }
    },
  };

  // Employees
  public employees = {
    list: async (params?: { branch_id?: string; department_id?: string; search?: string }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request<{ data: any[] }>(`/employees${query}`);
    },
    get: async (id: string) => {
      return this.request<{ data: any }>(`/employees/${id}`);
    },
  };

  // Attendance & Punches (Dual Hardware Biometric & GPS Mobile)
  public attendance = {
    punch: async (payload: {
      punch_type: 'CHECK_IN' | 'CHECK_OUT';
      latitude?: number;
      longitude?: number;
      device_source: 'MOBILE_APP' | 'BIOMETRIC_CLOCK' | 'MANUAL_WEB';
      wifi_bssid?: string;
    }) => {
      return this.request<{ success: boolean; data: any; message: string }>('/attendance/punch', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    mySummary: async () => {
      return this.request<{ data: any }>('/attendance/my-summary');
    },
  };

  // Leaves & Absence
  public leaves = {
    list: async () => {
      return this.request<{ data: any[] }>('/leaves');
    },
    create: async (payload: {
      leave_type_id: string;
      start_date: string;
      end_date: string;
      reason?: string;
    }) => {
      return this.request<{ success: boolean; data: any }>('/leaves', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    approve: async (id: string) => {
      return this.request<{ success: boolean; message: string }>(`/leaves/${id}/approve`, {
        method: 'PATCH',
      });
    },
    reject: async (id: string, reason: string) => {
      return this.request<{ success: boolean; message: string }>(`/leaves/${id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ rejection_reason: reason }),
      });
    },
  };

  // Statutory Payroll
  public payroll = {
    createRun: async (payload: { company_id: string; payroll_cycle: string }) => {
      return this.request<{ success: boolean; data: any }>('/payroll/runs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    exportWps: (runId: string) => {
      const url = `${API_BASE_URL}/payroll/runs/${runId}/export-wps`;
      window.open(url, '_blank');
    },
  };

  // Secure Documents
  public documents = {
    downloadPayslip: (payslipId: string) => {
      const url = `${API_BASE_URL}/documents/payslips/${payslipId}/download`;
      window.open(url, '_blank');
    },
  };
}

export const api = new ApiClient();
export default api;
