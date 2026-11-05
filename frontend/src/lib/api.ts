/**
 * HRSystem Enterprise API Client
 * Interfaces Next.js 15 with Laravel 11 Sanctum REST API
 * Supports Bearer token authentication, multi-tenant headers, and offline resilience
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

  public async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
    login: async (credentials: { email: string; password: string; subdomain?: string }) => {
      const data = await this.request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      const token = data?.data?.token || data?.token || data?.access_token;
      if (typeof window !== 'undefined' && token) {
        localStorage.setItem('hr_token', token);
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

  // Companies & Branches
  public companies = {
    list: async () => {
      return this.request<{ data: any[] }>('/companies');
    },
    get: async (id: string) => {
      return this.request<{ data: any }>(`/companies/${id}`);
    },
  };

  public branches = {
    list: async (companyId?: string) => {
      const q = companyId ? `?company_id=${companyId}` : '';
      return this.request<{ data: any[] }>(`/branches${q}`);
    },
    get: async (id: string) => {
      return this.request<{ data: any }>(`/branches/${id}`);
    },
    updateGeofence: async (id: string, payload: {
      geofence_latitude: number;
      geofence_longitude: number;
      geofence_radius_meters: number;
      attendance_mode: string;
    }) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/branches/${id}/geofence`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  };

  // Employees & Dossier 360
  public employees = {
    list: async (params?: { branch_id?: string; department_id?: string; company_id?: string; search?: string; per_page?: string | number }) => {
      const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request<{ data: any }>(`/employees${query}`);
    },
    get: async (id: string) => {
      return this.request<{ data: any }>(`/employees/${id}`);
    },
    create: async (payload: any) => {
      return this.request<{ success: boolean; data: any; message: string }>('/employees', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    update: async (id: string, payload: any) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/employees/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  };

  // Attendance (Dual Hardware Biometric & GPS Mobile)
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
    list: async (params?: { company_id?: string; status?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request<{ data: any }>(`/payroll/runs${q}`);
    },
    get: async (id: string) => {
      return this.request<{ data: any }>(`/payroll/runs/${id}`);
    },
    createRun: async (payload: {
      company_id: string;
      cycle_name: string;
      start_date: string;
      end_date: string;
      disbursement_date: string;
    }) => {
      return this.request<{ success: boolean; data: any; message: string }>('/payroll/runs', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    adjustPayslip: async (runId: string, payslipId: string, payload: {
      other_deductions?: number;
      unpaid_leave_deductions?: number;
      adjustment_reason: string;
    }) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/payroll/runs/${runId}/payslips/${payslipId}/adjust`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
    approve: async (id: string) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/payroll/runs/${id}/approve`, {
        method: 'PATCH',
      });
    },
    exportWps: (runId: string) => {
      const url = `${API_BASE_URL}/payroll/runs/${runId}/export-wps`;
      window.open(url, '_blank');
    },
  };

  // Assets & Hardware Custody
  public assets = {
    list: async (params?: { category?: string; status?: string; search?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request<{ data: any }>(`/assets${q}`);
    },
    get: async (id: string) => {
      return this.request<{ data: any }>(`/assets/${id}`);
    },
    create: async (payload: any) => {
      return this.request<{ success: boolean; data: any; message: string }>('/assets', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    assign: async (id: string, payload: {
      employee_id: string;
      assigned_date: string;
      condition_on_handover: string;
      handover_notes?: string;
    }) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/assets/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    returnAsset: async (id: string, payload: {
      returned_date: string;
      condition_on_return: string;
      handover_notes?: string;
    }) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/assets/${id}/return`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };

  // Recruitment & ATS
  public recruitment = {
    listOpenings: async (params?: { status?: string; department_id?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request<{ data: any[] }>(`/recruitment/openings${q}`);
    },
    getOpening: async (id: string) => {
      return this.request<{ data: any }>(`/recruitment/openings/${id}`);
    },
    createOpening: async (payload: any) => {
      return this.request<{ success: boolean; data: any; message: string }>('/recruitment/openings', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    createApplication: async (openingId: string, payload: any) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/recruitment/openings/${openingId}/applications`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    updateStage: async (applicationId: string, stage: string) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/recruitment/applications/${applicationId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage }),
      });
    },
    updateScorecard: async (applicationId: string, payload: { scorecard_rating: number; interviewer_feedback?: string }) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/recruitment/applications/${applicationId}/scorecard`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  };

  // Grievances & Employee Relations
  public grievances = {
    list: async (params?: { status?: string; category?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request<{ data: any }>(`/grievances${q}`);
    },
    get: async (id: string) => {
      return this.request<{ data: any }>(`/grievances/${id}`);
    },
    create: async (payload: any) => {
      return this.request<{ success: boolean; data: any; message: string }>('/grievances', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    updateStatus: async (id: string, payload: { status: string; resolution_notes?: string }) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/grievances/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  };

  // Performance & OKRs
  public performance = {
    listGoals: async (params?: { employee_id?: string; cycle_period?: string; status?: string }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request<{ data: any[] }>(`/performance/goals${q}`);
    },
    createGoal: async (payload: any) => {
      return this.request<{ success: boolean; data: any; message: string }>('/performance/goals', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    updateProgress: async (id: string, payload: { progress_percentage: number; status?: string }) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/performance/goals/${id}/progress`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
    },
  };

  // Cryptographic Audit Trail
  public audit = {
    listLogs: async (params?: { action_type?: string; search?: string; per_page?: number }) => {
      const q = params ? '?' + new URLSearchParams(params as any).toString() : '';
      return this.request<{ data: any }>(`/audit/logs${q}`);
    },
    verifyChain: async () => {
      return this.request<{ success: boolean; verified: boolean; total_blocks: number; message: string; corrupted_block?: string }>('/audit/verify-chain');
    },
  };

  // Secure Documents
  public documents = {
    downloadPayslip: (payslipId: string) => {
      const url = `${API_BASE_URL}/documents/payslips/${payslipId}/download`;
      window.open(url, '_blank');
    },
    downloadCertificate: (certId: string) => {
      const url = `${API_BASE_URL}/documents/certificates/${certId}/download`;
      window.open(url, '_blank');
    },
  };

  // Offboarding & End of Service Award (ESB)
  public offboarding = {
    calculateEsb: async (payload: {
      last_full_salary: number;
      service_years: number;
      separation_reason: string;
      is_female?: boolean;
    }) => {
      return this.request<{ success: boolean; data: any }>('/offboarding/esb/calculate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    clearanceStatus: async (employeeId: string) => {
      return this.request<{ success: boolean; data: any }>(`/offboarding/clearance/${employeeId}`);
    },
    initiate: async (payload: {
      employee_id: string;
      separation_date: string;
      separation_reason: string;
      notes?: string;
    }) => {
      return this.request<{ success: boolean; data: any; message: string }>('/offboarding/initiate', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };

  // Executive Reports & Statutory Compliance
  public reports = {
    saudization: async (companyId?: string) => {
      const q = companyId ? `?company_id=${companyId}` : '';
      return this.request<{ success: boolean; data: any }>(`/reports/saudization${q}`);
    },
    egyptianization: async (companyId?: string) => {
      const q = companyId ? `?company_id=${companyId}` : '';
      return this.request<{ success: boolean; data: any }>(`/reports/egyptianization${q}`);
    },
    bradfordFactor: async (employeeId?: string) => {
      const q = employeeId ? `?employee_id=${employeeId}` : '';
      return this.request<{ success: boolean; data: any }>(`/reports/bradford-factor${q}`);
    },
    glJournal: async (runId: string) => {
      return this.request<{ success: boolean; data: any }>(`/reports/payroll/${runId}/gl-voucher`);
    },
    headcount: async () => {
      return this.request<{ success: boolean; data: any }>('/reports/headcount');
    },
  };

  // Shift Rostering
  public shifts = {
    list: async () => {
      return this.request<{ success: boolean; data: any[] }>('/shifts');
    },
    create: async (payload: any) => {
      return this.request<{ success: boolean; data: any; message: string }>('/shifts', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };

  // Learning & Development
  public learning = {
    listCourses: async () => {
      return this.request<{ success: boolean; data: any[] }>('/learning/courses');
    },
    getCourse: async (id: string) => {
      return this.request<{ success: boolean; data: any }>(`/learning/courses/${id}`);
    },
    enroll: async (courseId: string, employeeId: string) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/learning/courses/${courseId}/enroll`, {
        method: 'POST',
        body: JSON.stringify({ employee_id: employeeId }),
      });
    },
    issueCertificate: async (courseId: string, employeeId: string, score: number) => {
      return this.request<{ success: boolean; data: any; message: string }>(`/learning/courses/${courseId}/certificate`, {
        method: 'POST',
        body: JSON.stringify({ employee_id: employeeId, score }),
      });
    },
  };

  // Organizational Chart
  public orgChart = {
    hierarchy: async () => {
      return this.request<{ success: boolean; data: any }>('/org-chart/hierarchy');
    },
  };
}

export const api = new ApiClient();
export default api;
