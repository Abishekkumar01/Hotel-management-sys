/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import axios from 'axios';
import getConfig from 'next/config';
import { getSessionToken, removeSessionAndLogoutUser, setSessionUserAndToken, getSessionUser, setSessionUser } from './authentication';

const { publicRuntimeConfig } = getConfig();

// If no API base URL is provided, fall back to a client-side mock backed by localStorage
// Only activate in the browser (window defined)
let SelectedApiService = null;

if (typeof window !== 'undefined' && (!publicRuntimeConfig?.API_BASE_URL || publicRuntimeConfig?.API_BASE_URL === '')) {
  // Local rooms dataset for demo mode
  // eslint-disable-next-line global-require
  const localRooms = require('../data/rooms').default;
  const STORAGE_REVIEWS_KEY = 'BRF-ROOM-REVIEWS';
  const STORAGE_BOOKINGS_KEY = 'BRF-BOOKINGS';
  const STORAGE_USERS_KEY = 'BRF-USERS';

  const readJson = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  const writeJson = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // ignore write errors in demo mode
    }
  };

  const success = (result) => Promise.resolve({ result_code: 0, result });
  const failure = (message) => Promise.reject({ response: { data: { result: { error: { message } } } } });

  const MockApiService = {
    get: async (url) => {
      // Current user profile
      if (url === '/api/v1/get-user') {
        const user = getSessionUser();
        if (!user) return failure('Not authenticated');
        return success({ data: user });
      }

      // User booking orders
      if (url.startsWith('/api/v1/get-user-booking-orders')) {
        const user = getSessionUser();
        if (!user) return failure('Not authenticated');
        const bookings = readJson(STORAGE_BOOKINGS_KEY, []);
        const rows = bookings.filter((b) => b.userId === user.id);
        return success({ data: { rows, total_page: 1, current_page: 1 } });
      }

      // Reviews list: /api/v1/get-room-reviews-list/:roomId?...
      if (url.startsWith('/api/v1/get-room-reviews-list/')) {
        const roomId = url.split('/').pop().split('?')[0];
        const store = readJson(STORAGE_REVIEWS_KEY, {});
        const rows = Array.isArray(store[roomId]) ? store[roomId] : [];
        return success({ data: { rows, total_page: 1 } });
      }

      // Unknown GET in demo mode
      return failure('Endpoint not available in demo mode');
    },

    post: async (url, body) => {
      // Registration
      if (url === '/api/v1/auth/registration') {
        const users = readJson(STORAGE_USERS_KEY, []);
        const exists = users.find((u) => u.email === body?.email);
        if (exists) {
          return failure('User already exists');
        }
        const newUser = {
          id: `demo-user-${users.length + 1}`,
          userName: body?.userName,
          fullName: body?.fullName,
          email: body?.email,
          phone: body?.phone,
          dob: body?.dob,
          gender: body?.gender,
          address: body?.address,
          avatar: '/images/jpeg/room-1.jpeg',
          role: 'user'
        };
        users.push(newUser);
        writeJson(STORAGE_USERS_KEY, users);
        return success({ message: 'Your registration successful', data: newUser });
      }

      // Booking order: /api/v1/placed-booking-order/:roomId
      if (url.startsWith('/api/v1/placed-booking-order/')) {
        const roomId = url.split('/').pop();
        const user = getSessionUser();
        if (!user) return failure('Not authenticated');
        const bookings = readJson(STORAGE_BOOKINGS_KEY, []);
        const roomMatch = localRooms.find((r) => r.sys.id === roomId || r.fields.slug === roomId);
        const room = roomMatch ? {
          room_name: roomMatch.fields.name,
          room_slug: roomMatch.fields.slug
        } : { room_name: 'Unknown', room_slug: 'unknown' };
        bookings.push({
          id: `bk_${Date.now()}`,
          userId: user.id,
          roomId,
          room,
          booking_dates: body?.booking_dates || [],
          booking_status: 'in-reviews',
          reviews: null,
          created_at: new Date().toISOString()
        });
        writeJson(STORAGE_BOOKINGS_KEY, bookings);
        return success({ message: 'Your room booking order placed successful', data: {} });
      }

      // Auth login: accept any credentials for demo
      if (url === '/api/v1/auth/login') {
        const email = body?.email || 'demo@example.com';
        const users = readJson(STORAGE_USERS_KEY, []);
        const found = users.find((u) => u.email === email) || {
          id: 'demo-user-1',
          email,
          fullName: email.split('@')[0],
          avatar: '/images/jpeg/room-1.jpeg',
          role: 'user'
        };
        // also set session for convenience
        setSessionUserAndToken(found, 'demo-access-token', 'demo-refresh-token');
        return Promise.resolve({ result_code: 0, result: { data: found }, access_token: 'demo-access-token', refresh_token: 'demo-refresh-token' });
      }

      return failure('Endpoint not available in demo mode');
    },

    put: async (url, body) => {
      if (url === '/api/v1/update-user') {
        const current = getSessionUser();
        if (!current) return failure('Not authenticated');
        const updated = { ...current, ...body };
        setSessionUser(updated);
        return success({ message: 'Your profile information updated successful', data: updated });
      }
      if (url.startsWith('/api/v1/cancel-booking-order/')) {
        const id = url.split('/').pop();
        const bookings = readJson(STORAGE_BOOKINGS_KEY, []);
        const idx = bookings.findIndex((b) => b.id === id);
        if (idx === -1) return failure('Booking not found');
        bookings[idx].booking_status = 'cancel';
        writeJson(STORAGE_BOOKINGS_KEY, bookings);
        return success({ message: 'Booking order cancel successful', data: bookings[idx] });
      }
      if (url.startsWith('/api/v1/edit-room-review/')) {
        const reviewId = url.split('/').pop();
        const store = readJson(STORAGE_REVIEWS_KEY, {});
        let updatedReview = null;
        Object.keys(store).forEach((roomKey) => {
          const arr = store[roomKey] || [];
          const idx = arr.findIndex((r) => r.id === reviewId);
          if (idx !== -1) {
            arr[idx] = { ...arr[idx], rating: body?.rating, message: body?.message };
            store[roomKey] = arr;
            updatedReview = arr[idx];
          }
        });
        if (!updatedReview) return failure('Review not found');
        writeJson(STORAGE_REVIEWS_KEY, store);
        return success({ message: 'Your reviews updating successful', data: updatedReview });
      }
      return failure('Endpoint not available in demo mode');
    },
    delete: async () => failure('Endpoint not available in demo mode')
  };

  SelectedApiService = MockApiService;
}

const ApiService = axios.create({
  baseURL: publicRuntimeConfig.API_BASE_URL
});

/**
 * Interceptor for all requests
 */
ApiService.interceptors.request.use(
  (config) => {
    /**
     * Add your request interceptor logic here: setting headers, authorization etc.
     */
    config.headers['Content-Type'] = 'application/json';

    if (!config?.noAuth) {
      const token = getSessionToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Interceptor for all responses
 */
ApiService.interceptors.response.use(
  /**
  * Add logic for successful response
  */
  (response) => response?.data || {},

  /**
  * Add logic for any error from backend
  */
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.data?.result_code === 11) {
      // if authorized to logout user and redirect login page
      removeSessionAndLogoutUser();
    }

    // eslint-disable-next-line no-underscore-dangle
    if (error.response.status === 401 && !originalRequest._retry) {
      // if authorized to logout user and redirect login page
      removeSessionAndLogoutUser();
    }

    // Handle other error cases
    return Promise.reject(error);
  }
);

export default SelectedApiService || ApiService;
