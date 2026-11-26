import {
  Book,
  BookFormData,
  Author,
  Category,
  Publisher,
  MediaItem,
  DashboardStats,
  DashboardAnalytics,
  ActivityLog,
  LandingPageContent,
  SiteSettings,
  Order,
  PaginatedOrdersResponse,
  User,
  NotificationItem,
  GlobalSearchResults
} from '../types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem('dotcom_auth_token');
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem('dotcom_auth_token', token);
    } else {
      localStorage.removeItem('dotcom_auth_token');
    }
  } catch {
    // ignore
  }
}

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An unexpected error occurred';
    try {
      const err = await response.json();
      errorDetail = err.detail || err.message || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }

    if (response.status === 401 && window.location.pathname.startsWith('/admin')) {
      // Token expired or invalid
      setAuthToken(null);
    }

    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  getAuthToken,
  setAuthToken,
  clearAuthToken: () => setAuthToken(null),

  // --- Authentication ---
  async login(username_or_email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await fetchJSON<{ access_token: string; token_type: string; user: User }>(
      `${API_BASE}/auth/login`,
      {
        method: 'POST',
        body: JSON.stringify({ username_or_email, password }),
      }
    );
    setAuthToken(res.access_token);
    return { access_token: res.access_token, user: res.user };
  },

  async getProfile(): Promise<User> {
    return fetchJSON<User>(`${API_BASE}/auth/me`);
  },

  async changePassword(current_password: string, new_password: string): Promise<{ message: string }> {
    return fetchJSON<{ message: string }>(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      body: JSON.stringify({ current_password, new_password }),
    });
  },

  async logout(): Promise<void> {
    try {
      await fetchJSON(`${API_BASE}/auth/logout`, { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setAuthToken(null);
    }
  },

  // --- User Management (RBAC) ---
  async getUsers(search?: string, role?: string): Promise<User[]> {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (role && role !== 'all') query.append('role', role);
    return fetchJSON<User[]>(`${API_BASE}/users?${query.toString()}`);
  },

  async createUser(data: {
    username: string;
    email: string;
    full_name: string;
    role: string;
    password: string;
    is_active?: boolean;
  }): Promise<User> {
    return fetchJSON<User>(`${API_BASE}/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateUser(id: number, data: Partial<User> & { password?: string }): Promise<User> {
    return fetchJSON<User>(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: number): Promise<{ message: string }> {
    return fetchJSON<{ message: string }>(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Notifications ---
  async getNotifications(limit: number = 20): Promise<NotificationItem[]> {
    return fetchJSON<NotificationItem[]>(`${API_BASE}/notifications?limit=${limit}`);
  },

  async markNotificationRead(id: number): Promise<NotificationItem> {
    return fetchJSON<NotificationItem>(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead(): Promise<{ message: string }> {
    return fetchJSON<{ message: string }>(`${API_BASE}/notifications/mark-all-read`, {
      method: 'POST',
    });
  },

  // --- Global Unified Search ---
  async globalSearch(query: string): Promise<GlobalSearchResults> {
    return fetchJSON<GlobalSearchResults>(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  },

  // --- Dashboard & Analytics ---
  async getDashboardStats(): Promise<DashboardStats> {
    return fetchJSON<DashboardStats>(`${API_BASE}/dashboard/stats`);
  },

  async getDashboardAnalytics(): Promise<DashboardAnalytics> {
    return fetchJSON<DashboardAnalytics>(`${API_BASE}/dashboard/analytics`);
  },

  async getActivityLogs(limit: number = 50): Promise<ActivityLog[]> {
    return fetchJSON<ActivityLog[]>(`${API_BASE}/dashboard/activity?limit=${limit}`);
  },

  // --- Books ---
  async getBooks(params?: {
    search?: string;
    category_id?: number;
    author_id?: number;
    status?: string;
    is_featured?: boolean;
    sort_by?: string;
    sort_order?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: Book[]; total: number; page: number; limit: number; pages: number }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category_id) query.append('category_id', params.category_id.toString());
    if (params?.author_id) query.append('author_id', params.author_id.toString());
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.is_featured !== undefined) query.append('is_featured', params.is_featured.toString());
    if (params?.sort_by) query.append('sort_by', params.sort_by);
    if (params?.sort_order) query.append('sort_order', params.sort_order);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return fetchJSON<{ items: Book[]; total: number; page: number; limit: number; pages: number }>(
      `${API_BASE}/books?${query.toString()}`
    );
  },

  async getBook(id: number): Promise<Book> {
    return fetchJSON<Book>(`${API_BASE}/books/${id}`);
  },

  async createBook(data: BookFormData): Promise<Book> {
    return fetchJSON<Book>(`${API_BASE}/books`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateBook(id: number, data: Partial<BookFormData>): Promise<Book> {
    return fetchJSON<Book>(`${API_BASE}/books/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async togglePublishBook(id: number): Promise<{ id: number; is_draft: boolean; status: string }> {
    return fetchJSON<{ id: number; is_draft: boolean; status: string }>(`${API_BASE}/books/${id}/toggle-publish`, {
      method: 'POST',
    });
  },

  async toggleFeaturedBook(id: number): Promise<{ id: number; is_featured: boolean }> {
    return fetchJSON<{ id: number; is_featured: boolean }>(`${API_BASE}/books/${id}/toggle-featured`, {
      method: 'POST',
    });
  },

  async deleteBook(id: number): Promise<{ message: string; id: number }> {
    return fetchJSON<{ message: string; id: number }>(`${API_BASE}/books/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Authors ---
  async getAuthors(search?: string): Promise<Author[]> {
    const url = search ? `${API_BASE}/authors?search=${encodeURIComponent(search)}` : `${API_BASE}/authors`;
    return fetchJSON<Author[]>(url);
  },

  async getAuthor(id: number): Promise<Author> {
    return fetchJSON<Author>(`${API_BASE}/authors/${id}`);
  },

  async createAuthor(data: Partial<Author>): Promise<Author> {
    return fetchJSON<Author>(`${API_BASE}/authors`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateAuthor(id: number, data: Partial<Author>): Promise<Author> {
    return fetchJSON<Author>(`${API_BASE}/authors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteAuthor(id: number): Promise<{ message: string; id: number }> {
    return fetchJSON<{ message: string; id: number }>(`${API_BASE}/authors/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Categories ---
  async getCategories(flat: boolean = false, search?: string): Promise<Category[]> {
    const query = new URLSearchParams();
    if (flat) query.append('flat', 'true');
    if (search) query.append('search', search);
    return fetchJSON<Category[]>(`${API_BASE}/categories?${query.toString()}`);
  },

  async getCategory(id: number): Promise<Category> {
    return fetchJSON<Category>(`${API_BASE}/categories/${id}`);
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    return fetchJSON<Category>(`${API_BASE}/categories`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: number, data: Partial<Category>): Promise<Category> {
    return fetchJSON<Category>(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: number): Promise<{ message: string; id: number }> {
    return fetchJSON<{ message: string; id: number }>(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Publishers ---
  async getPublishers(search?: string): Promise<Publisher[]> {
    const url = search ? `${API_BASE}/publishers?search=${encodeURIComponent(search)}` : `${API_BASE}/publishers`;
    return fetchJSON<Publisher[]>(url);
  },

  async getPublisher(id: number): Promise<Publisher> {
    return fetchJSON<Publisher>(`${API_BASE}/publishers/${id}`);
  },

  async createPublisher(data: Partial<Publisher>): Promise<Publisher> {
    return fetchJSON<Publisher>(`${API_BASE}/publishers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePublisher(id: number, data: Partial<Publisher>): Promise<Publisher> {
    return fetchJSON<Publisher>(`${API_BASE}/publishers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePublisher(id: number): Promise<{ message: string; id: number }> {
    return fetchJSON<{ message: string; id: number }>(`${API_BASE}/publishers/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Media Library ---
  async getMediaItems(search?: string, category?: string): Promise<MediaItem[]> {
    const query = new URLSearchParams();
    if (search) query.append('search', search);
    if (category) query.append('category', category);
    return fetchJSON<MediaItem[]>(`${API_BASE}/media?${query.toString()}`);
  },

  async uploadMedia(file: File, category: string = 'general'): Promise<MediaItem> {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      let errText = 'Failed to upload media file';
      try {
        const err = await response.json();
        errText = err.detail || errText;
      } catch {
        errText = response.statusText;
      }
      throw new Error(errText);
    }

    return response.json();
  },

  async deleteMedia(id: number): Promise<{ message: string; id: number }> {
    return fetchJSON<{ message: string; id: number }>(`${API_BASE}/media/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Landing Page CMS ---
  async getLandingPage(): Promise<LandingPageContent> {
    return fetchJSON<LandingPageContent>(`${API_BASE}/landing`);
  },

  async updateLandingPage(data: LandingPageContent): Promise<LandingPageContent> {
    return fetchJSON<LandingPageContent>(`${API_BASE}/landing`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // --- Settings ---
  async getSettings(): Promise<SiteSettings> {
    return fetchJSON<SiteSettings>(`${API_BASE}/settings`);
  },

  async updateSettings(data: SiteSettings): Promise<SiteSettings> {
    return fetchJSON<SiteSettings>(`${API_BASE}/settings`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // --- Customer Orders ---
  async createOrder(data: any): Promise<Order> {
    return fetchJSON<Order>(`${API_BASE}/orders`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getOrders(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedOrdersResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.status && params.status !== 'all') query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    return fetchJSON<PaginatedOrdersResponse>(`${API_BASE}/orders?${query.toString()}`);
  },

  async getOrder(id: number): Promise<Order> {
    return fetchJSON<Order>(`${API_BASE}/orders/${id}`);
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    return fetchJSON<Order>(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async downloadOrdersCsv(status?: string): Promise<void> {
    const token = getAuthToken();
    const query = status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : '';
    const res = await fetch(`${API_BASE}/orders/export/csv${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error('Failed to export orders spreadsheet.');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dotcom_orders_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  },
};
