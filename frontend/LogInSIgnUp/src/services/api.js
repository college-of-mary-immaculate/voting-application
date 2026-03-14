import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',   // use proxy
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT interceptor
API.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== AUTH ==========
export const registerVoter = (data) => API.post('/voters/register', data);
export const loginVoter = (data) => API.post('/voters/login', data);

// ========== ELECTIONS ==========
export const getElections = () => API.get('/elections');

// ========== CANDIDATES ==========
export const getCandidates = () => API.get('/candidates');

// ========== VOTING ==========
export const castVote = (data) => API.post('/voters/vote', data);

// ========== TOKEN MANAGEMENT ==========
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const getAuthToken = () => localStorage.getItem('token');
export const removeAuthToken = () => localStorage.removeItem('token');
export const isAuthenticated = () => !!localStorage.getItem('token');