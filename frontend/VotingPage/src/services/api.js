import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Helper para gumawa ng avatar URL (DiceBear initials)
const getAvatarUrl = (name, bg = '0f4c5c') => {
  const encoded = encodeURIComponent(name);
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encoded}&backgroundColor=${bg}&fontSize=40&chars=2`;
};

// --- NATIONAL ELECTION ---
export const getNationalCandidates = () => {
  const senators = [];
  for (let i = 1; i <= 24; i++) {
    const name = `Senator ${i}`;
    senators.push({
      id: i + 100,
      name,
      party: `Partido ${String.fromCharCode(65 + (i % 5))}`,
      image: getAvatarUrl(name, '1e3a8a'),
    });
  }
  return Promise.resolve({
    president: [
      { id: 1, name: 'Alice Gomez', party: 'Partido A', image: getAvatarUrl('Alice Gomez', '1e3a8a') },
      { id: 2, name: 'Bob Santos', party: 'Partido B', image: getAvatarUrl('Bob Santos', '1e3a8a') },
    ],
    vicePresident: [
      { id: 3, name: 'Carol Reyes', party: 'Partido A', image: getAvatarUrl('Carol Reyes', '1e3a8a') },
      { id: 4, name: 'David Cruz', party: 'Partido B', image: getAvatarUrl('David Cruz', '1e3a8a') },
    ],
    senators,
  });
};

// --- BARANGAY ELECTION ---
export const getBarangayCandidates = () => {
  const councilors = [];
  for (let i = 1; i <= 15; i++) {
    const name = `Kagawad ${i}`;
    councilors.push({
      id: i + 200,
      name,
      party: `Team ${String.fromCharCode(65 + (i % 3))}`,
      image: getAvatarUrl(name, 'f4a261'),
    });
  }
  return Promise.resolve({
    captain: [
      { id: 101, name: 'Kapitan Maria', party: 'Team A', image: getAvatarUrl('Kapitan Maria', 'f4a261') },
      { id: 102, name: 'Kapitan Jose', party: 'Team B', image: getAvatarUrl('Kapitan Jose', 'f4a261') },
    ],
    councilors,
  });
};

// --- CLASS ELECTION ---
export const getClassCandidates = () => {
  return Promise.resolve({
    president: [
      { id: 201, name: 'John Doe', party: 'Party A', image: getAvatarUrl('John Doe', '2ecc71') },
      { id: 202, name: 'Jane Smith', party: 'Party B', image: getAvatarUrl('Jane Smith', '2ecc71') },
    ],
    vicePresident: [
      { id: 203, name: 'Mike Brown', party: 'Party A', image: getAvatarUrl('Mike Brown', '2ecc71') },
      { id: 204, name: 'Sarah Lee', party: 'Party B', image: getAvatarUrl('Sarah Lee', '2ecc71') },
    ],
    representative: [
      { id: 205, name: 'Tom White', party: 'Party A', image: getAvatarUrl('Tom White', '2ecc71') },
      { id: 206, name: 'Lucy Green', party: 'Party B', image: getAvatarUrl('Lucy Green', '2ecc71') },
    ],
  });
};

// --- CUSTOM ELECTION (example) ---
export const getCustomCandidates = () => {
  return Promise.resolve({
    chairperson: [
      { id: 301, name: 'Alex Black', party: 'Independent', image: getAvatarUrl('Alex Black', '9b59b6') },
      { id: 302, name: 'Blair Grey', party: 'Independent', image: getAvatarUrl('Blair Grey', '9b59b6') },
    ],
    members: [
      { id: 303, name: 'Chris Blue', party: 'Group 1', image: getAvatarUrl('Chris Blue', '9b59b6') },
      { id: 304, name: 'Dana Red', party: 'Group 2', image: getAvatarUrl('Dana Red', '9b59b6') },
      { id: 305, name: 'Eli Yellow', party: 'Group 1', image: getAvatarUrl('Eli Yellow', '9b59b6') },
    ],
  });
};

// Auth helpers
export const getAuthToken = () => localStorage.getItem('token');
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const removeAuthToken = () => localStorage.removeItem('token');
export const isAuthenticated = () => !!localStorage.getItem('token');