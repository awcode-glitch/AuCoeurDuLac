const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

function getToken(): string | null {
  try {
    const stored = localStorage.getItem('afromarket-auth');
    if (!stored) return null;
    return JSON.parse(stored)?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
  if (!res.ok) {
    // Flask-JWT renvoie { msg: "..." }, notre API renvoie { error: "..." }
    const msg = data.error ?? data.msg ?? 'Erreur serveur';
    if (res.status === 401 || res.status === 422) {
      // Token expiré ou invalide → déconnexion propre
      localStorage.removeItem('afromarket-auth');
      window.location.href = '/login';
    }
    throw new Error(msg);
  }
  return data as T;
}

// ─── Upload ──────────────────────────────────────────────────────────────────

export const apiUploadImage = (file: File, onProgress?: (pct: number) => void): Promise<string> => {
  const token = getToken();
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    if (onProgress) {
      xhr.upload.addEventListener('progress', e => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }
    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 400) reject(new Error(data.error ?? 'Erreur upload'));
        else {
          // URL Cloudinary = déjà absolue ; URL locale = chemin relatif à préfixer
          const url = data.url.startsWith('http')
            ? data.url
            : `${BASE_URL.replace('/api', '')}${data.url}`;
          resolve(url);
        }
      } catch { reject(new Error('Erreur upload')); }
    };
    xhr.onerror = () => reject(new Error('Erreur réseau'));
    xhr.open('POST', `${BASE_URL}/upload`);
    if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(formData);
  });
};

// ─── Categories ─────────────────────────────────────────────────────────────

export const apiGetCategories = () =>
  request<{ id: string; name: string; icon: string }[]>('/categories');

export const apiGetLocations = () =>
  request<string[]>('/locations');

// ─── Products ───────────────────────────────────────────────────────────────

export interface ApiProduct {
  id: string; name: string; description: string;
  price: number; originalPrice?: number; image: string; images: string[];
  category: string; vendorId: string; vendorName: string; vendorAvatar: string;
  rating: number; reviews: number; stock: number; tags: string[]; featured: boolean;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  location?: string;
  sort?: string;
  featured?: boolean;
  page?: number;
  perPage?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductsPage {
  items: ApiProduct[];
  total: number;
  pages: number;
  page: number;
}

export const apiGetProducts = (filters: ProductFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.search)   params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.location) params.set('location', filters.location);
  if (filters.sort)     params.set('sort', filters.sort);
  if (filters.featured) params.set('featured', 'true');
  return request<ApiProduct[]>(`/products?${params}`);
};

export const apiGetProductsPaginated = (filters: ProductFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.search)   params.set('search', filters.search);
  if (filters.category) params.set('category', filters.category);
  if (filters.location) params.set('location', filters.location);
  if (filters.sort)     params.set('sort', filters.sort);
  if (filters.featured) params.set('featured', 'true');
  if (filters.minPrice) params.set('min_price', String(filters.minPrice));
  if (filters.maxPrice && filters.maxPrice < 500000) params.set('max_price', String(filters.maxPrice));
  params.set('page', String(filters.page ?? 1));
  params.set('per_page', String(filters.perPage ?? 12));
  return request<ProductsPage>(`/products?${params}`);
};

export const apiGetProduct = (id: string) =>
  request<ApiProduct & { related: ApiProduct[] }>(`/products/${id}`);

export interface Review {
  id: number;
  productId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export const apiGetReviews = (productId: string) =>
  request<Review[]>(`/products/${productId}/reviews`);

export const apiAddReview = (productId: string, rating: number, comment: string) =>
  request<Review>(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });

// ─── Vendors ────────────────────────────────────────────────────────────────

export interface ApiVendor {
  id: string; name: string; description: string;
  avatar: string; banner: string; rating: number; reviews: number;
  products: number; location: string; verified: boolean;
  joinDate: string; categories: string[]; phone?: string;
}

export interface VendorFilters {
  search?: string;
  location?: string;
  verified?: boolean;
}

export const apiGetVendors = (filters: VendorFilters = {}) => {
  const params = new URLSearchParams();
  if (filters.search)   params.set('search', filters.search);
  if (filters.location) params.set('location', filters.location);
  if (filters.verified) params.set('verified', 'true');
  return request<ApiVendor[]>(`/vendors?${params}`);
};

export const apiGetVendor = (id: string) =>
  request<ApiVendor & { productList: ApiProduct[] }>(`/vendors/${id}`);

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string; name: string; email: string;
  phone?: string; avatar: string; role: string; vendorId?: string; address?: string;
}

export const apiRegister = (name: string, email: string, password: string, phone?: string) =>
  request<{ token: string; user: ApiUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, phone }),
  });

export const apiLogin = (email: string, password: string) =>
  request<{ token: string; user: ApiUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const apiMe = () => request<ApiUser>('/auth/me');

export const apiUpdateProfile = (name: string, phone?: string, avatar?: string, address?: string) =>
  request<ApiUser>('/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ name, phone: phone || null, avatar: avatar || null, address: address || null }),
  });

export const apiChangePassword = (currentPassword: string, newPassword: string) =>
  request<{ message: string }>('/users/me/password', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  });

export const apiForgotPassword = (email: string) =>
  request<{ message: string; dev_token?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });

export const apiResetPassword = (token: string, newPassword: string) =>
  request<{ message: string }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });

// ─── Orders ─────────────────────────────────────────────────────────────────

export interface OrderPayload {
  items: { productId: string; productName: string; quantity: number; price: number; image: string }[];
  address: Record<string, string>;
  paymentMethod: string;
}

export const apiCreateOrder = (payload: OrderPayload) =>
  request<{ id: string; status: string; total: number; date: string }>('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const apiGetOrders = () =>
  request('/orders');

export const apiCancelOrder = (orderId: number) =>
  request<{ id: string; status: string; total: number }>(`/orders/${orderId}/cancel`, { method: 'PATCH' });

export const apiGetWishlist = () =>
  request<ApiProduct[]>('/wishlist');

export const apiToggleWishlist = (productId: string) =>
  request<{ action: string; inWishlist: boolean }>('/wishlist/toggle', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalVendors: number;
  totalUsers: number;
}

export interface AdminOrder {
  id: string;
  date: string;
  status: string;
  total: number;
  customer: string;
  customerEmail: string;
  items: { productId: string; productName: string; quantity: number; price: number; image: string }[];
}

export const apiAdminStats = () => request<AdminStats>('/admin/stats');
export const apiAdminOrders = () => request<AdminOrder[]>('/admin/orders');
export const apiAdminUsers = () => request<ApiUser[]>('/admin/users');
export const apiAdminUpdateOrderStatus = (orderId: string, status: string) =>
  request(`/admin/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });

export interface AdminProductPayload extends ProductPayload {
  vendorId?: string;
  vendorName?: string;
  featured?: boolean;
}

export const apiAdminAddProduct    = (payload: AdminProductPayload) =>
  request<ApiProduct>('/admin/products', { method: 'POST', body: JSON.stringify(payload) });
export const apiAdminUpdateProduct = (id: string, payload: Partial<AdminProductPayload>) =>
  request<ApiProduct>(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
export const apiAdminDeleteProduct = (id: string) =>
  request<{ message: string }>(`/admin/products/${id}`, { method: 'DELETE' });
export const apiAdminVerifyVendor  = (vendorId: string) =>
  request<ApiVendor>(`/admin/vendors/${vendorId}/verify`, { method: 'PATCH' });

export const apiAdminAddCategory = (name: string, icon: string) =>
  request<{ id: string; name: string; icon: string }>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify({ name, icon }),
  });

export const apiAdminDeleteCategory = (id: string) =>
  request<{ message: string }>(`/admin/categories/${id}`, { method: 'DELETE' });

// ─── Vendor ──────────────────────────────────────────────────────────────────

export interface VendorStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
}

export const apiVendorStats    = () => request<VendorStats>('/vendor/stats');
export const apiVendorOrders   = () => request<AdminOrder[]>('/vendor/orders');
export const apiVendorProducts = () => request<ApiProduct[]>('/vendor/products');

export interface VendorSettingsPayload {
  name?: string; description?: string; location?: string;
  phone?: string; avatar?: string; banner?: string;
}
export const apiVendorUpdateSettings = (payload: VendorSettingsPayload) =>
  request<ApiVendor>('/vendor/settings', { method: 'PATCH', body: JSON.stringify(payload) });

export interface ProductPayload {
  name: string;
  description: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  images?: string[];
  category: string;
  stock: number;
  tags?: string[];
}

export const apiVendorAddProduct    = (payload: ProductPayload) =>
  request<ApiProduct>('/vendor/products', { method: 'POST', body: JSON.stringify(payload) });

export const apiVendorUpdateProduct = (id: string, payload: Partial<ProductPayload>) =>
  request<ApiProduct>(`/vendor/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) });

export const apiVendorDeleteProduct = (id: string) =>
  request<{ message: string }>(`/vendor/products/${id}`, { method: 'DELETE' });

export interface VendorApplyPayload {
  shopName: string;
  description: string;
  category: string;
  location: string;
}

export const apiVendorApply = (payload: VendorApplyPayload) =>
  request<{ token: string; user: ApiUser }>('/vendor/apply', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

// ─── Messages ────────────────────────────────────────────────────────────────

export interface ApiConversation {
  id: number;
  vendorId: string;
  vendorName: string;
  vendorAvatar: string;
  buyerId: string;
  buyerName: string;
  buyerAvatar: string;
  productId: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  updatedAt: string;
}

export interface ApiMessage {
  id: number;
  conversationId: number;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export const apiGetConversations  = () => request<ApiConversation[]>('/conversations');
export const apiStartConversation = (vendorId: string, productId?: string) =>
  request<ApiConversation>('/conversations', { method: 'POST', body: JSON.stringify({ vendorId, productId }) });
export const apiGetMessages       = (convId: number) => request<ApiMessage[]>(`/conversations/${convId}/messages`);
export const apiSendMessage       = (convId: number, content: string) =>
  request<ApiMessage>(`/conversations/${convId}/messages`, { method: 'POST', body: JSON.stringify({ content }) });
export const apiUnreadMessages    = () => request<{ count: number }>('/messages/unread-count');

// ─── Notifications ────────────────────────────────────────────────────────────

export interface ApiNotification {
  id: number;
  type: 'order' | 'status' | 'review' | 'promo';
  title: string;
  message: string;
  read: boolean;
  date: string;
}

export const apiGetNotifications  = () => request<ApiNotification[]>('/notifications');
export const apiUnreadCount       = () => request<{ count: number }>('/notifications/unread-count');
export const apiMarkAllRead       = () => request<{ message: string }>('/notifications/read-all', { method: 'PATCH' });
export const apiMarkOneRead       = (id: number) => request<ApiNotification>(`/notifications/${id}/read`, { method: 'PATCH' });

// ─── Vendor Reviews ───────────────────────────────────────────────────────────

export interface VendorReview {
  id: number;
  vendorId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
}

export const apiGetVendorReviews = (vendorId: string) =>
  request<VendorReview[]>(`/vendors/${vendorId}/reviews`);

export const apiAddVendorReview = (vendorId: string, rating: number, comment: string) =>
  request<VendorReview>(`/vendors/${vendorId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
