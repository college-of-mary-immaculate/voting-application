import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api',   // gamit ang proxy o direct
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

// ========== AUTH (unified) ==========
export const registerVoter = (data) => API.post('/auth/register', data);
export const loginVoter = (data) => API.post('/auth/login', data);

// ========== ELECTIONS ==========
export const getElections = () => API.get('/elections/my-elections');

// ========== CANDIDATES ==========
export const getCandidates = () => API.get('/candidates');

// ========== VOTING ==========
export const castVote = (data) => API.post('/voters/vote', data);

// RESULTS
export const getElectionResults = async (electionId) => {
  try {
    const response = await API.get(`/elections/${electionId}/results`);
    console.log('Results API response:', response);
    return response;
  } catch (error) {
    console.error('Get results error:', error.response?.data || error.message);
    throw error;
  }
};

// ========== TOKEN MANAGEMENT ==========
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const getAuthToken = () => localStorage.getItem('token');
export const removeAuthToken = () => localStorage.removeItem('token');
export const isAuthenticated = () => !!localStorage.getItem('token');

// ADD THIS AT THE BOTTOM
export default API;