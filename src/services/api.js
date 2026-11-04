/**
 * Simple API helper for 2nd Year College Project
 * Handles Fetch calls, JWT token attachment and basic error messages
 */

const BASE_URL = '/api';

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('rental_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request('/auth/me'),

  // Equipment
  getEquipment: (params = '') => request(`/equipment${params}`),
  getEquipmentById: (id) => request(`/equipment/${id}`),
  createEquipment: (data) => request('/equipment', { method: 'POST', body: JSON.stringify(data) }),
  updateEquipment: (id, data) => request(`/equipment/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEquipment: (id) => request(`/equipment/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (data) => request('/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Bookings
  getBookings: (params = '') => request(`/bookings${params}`),
  getBookingById: (id) => request(`/bookings/${id}`),
  createBooking: (data) => request('/bookings', { method: 'POST', body: JSON.stringify(data) }),
  updateBookingStatus: (id, status) => request(`/bookings/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteBooking: (id) => request(`/bookings/${id}`, { method: 'DELETE' }),

  // Rentals
  getRentals: (params = '') => request(`/rentals${params}`),
  getRentalById: (id) => request(`/rentals/${id}`),
  processPickup: (data) => request('/rentals/pickup', { method: 'POST', body: JSON.stringify(data) }),
  processReturn: (id, data) => request(`/rentals/${id}/return`, { method: 'POST', body: JSON.stringify(data) }),

  // Inspections
  getInspections: (params = '') => request(`/inspections${params}`),
  createInspection: (data) => request('/inspections', { method: 'POST', body: JSON.stringify(data) }),

  // Payments
  getPayments: (params = '') => request(`/payments${params}`),
  createPayment: (data) => request('/payments', { method: 'POST', body: JSON.stringify(data) }),

  // Users (Admin)
  getUsers: (params = '') => request(`/users${params}`),
  createUser: (data) => request('/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),

  // Reports
  getDashboardStats: () => request('/reports/dashboard'),
};
