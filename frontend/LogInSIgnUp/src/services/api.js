import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

export const registerVoter = (data) => API.post('/voters/register', data);
export const loginVoter = (data) => API.post('/voters/login', data); // to be implemented on backend