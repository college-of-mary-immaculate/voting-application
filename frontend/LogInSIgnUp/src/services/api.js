import axios from 'axios';

const API = axios.create({
  baseURL: '/api', // will be proxied to backend
  headers: { 'Content-Type': 'application/json' },
});

// ========== AUTH ENDPOINTS ==========
export const registerVoter = (data) => API.post('/voters/register', data);
export const loginVoter = (data) => API.post('/voters/login', data);

// ========== VOTING ENDPOINTS (mock for now) ==========

// National Election
export const getNationalCandidates = () => {
  return Promise.resolve({
    president: [
      { id: 1, name: 'Alice Gomez', party: 'Partido A', image: 'https://api.dicebear.com/9.x/initials/svg?seed=Alice&backgroundColor=0f4c5c' },
      { id: 2, name: 'Bob Santos', party: 'Partido B', image: 'https://api.dicebear.com/9.x/initials/svg?seed=Bob&backgroundColor=0f4c5c' },
    ],
    vicePresident: [
      { id: 3, name: 'Carol Reyes', party: 'Partido A', image: 'https://api.dicebear.com/9.x/initials/svg?seed=Carol&backgroundColor=0f4c5c' },
      { id: 4, name: 'David Cruz', party: 'Partido B', image: 'https://api.dicebear.com/9.x/initials/svg?seed=David&backgroundColor=0f4c5c' },
    ],
    senators: Array.from({ length: 24 }, (_, i) => ({
      id: i + 5,
      name: `Senator ${i + 1}`,
      party: `Partido ${String.fromCharCode(65 + (i % 5))}`,
      image: `https://api.dicebear.com/9.x/initials/svg?seed=Senator${i+1}&backgroundColor=0f4c5c`,
    })),
  });
};

// Barangay Election
export const getBarangayCandidates = () => {
  const councilors = Array.from({ length: 15 }, (_, i) => ({
    id: i + 200,
    name: `Kagawad ${i + 1}`,
    party: `Team ${String.fromCharCode(65 + (i % 3))}`,
    image: `https://api.dicebear.com/9.x/initials/svg?seed=Kagawad${i+1}&backgroundColor=f4a261`,
  }));

  return Promise.resolve({
    captain: [
      { id: 101, name: 'Kapitan Maria', party: 'Team A', image: 'https://api.dicebear.com/9.x/initials/svg?seed=KapitanMaria&backgroundColor=f4a261' },
      { id: 102, name: 'Kapitan Jose', party: 'Team B', image: 'https://api.dicebear.com/9.x/initials/svg?seed=KapitanJose&backgroundColor=f4a261' },
    ],
    councilors,
  });
};

// Class Election
export const getClassCandidates = () => {
  return Promise.resolve({
    president: [
      { id: 201, name: 'John Doe', party: 'Party A', image: 'https://api.dicebear.com/9.x/initials/svg?seed=JohnDoe&backgroundColor=2ecc71' },
      { id: 202, name: 'Jane Smith', party: 'Party B', image: 'https://api.dicebear.com/9.x/initials/svg?seed=JaneSmith&backgroundColor=2ecc71' },
    ],
    vicePresident: [
      { id: 203, name: 'Mike Brown', party: 'Party A', image: 'https://api.dicebear.com/9.x/initials/svg?seed=MikeBrown&backgroundColor=2ecc71' },
      { id: 204, name: 'Sarah Lee', party: 'Party B', image: 'https://api.dicebear.com/9.x/initials/svg?seed=SarahLee&backgroundColor=2ecc71' },
    ],
    representative: [
      { id: 205, name: 'Tom White', party: 'Party A', image: 'https://api.dicebear.com/9.x/initials/svg?seed=TomWhite&backgroundColor=2ecc71' },
      { id: 206, name: 'Lucy Green', party: 'Party B', image: 'https://api.dicebear.com/9.x/initials/svg?seed=LucyGreen&backgroundColor=2ecc71' },
    ],
  });
};

// Custom Election
export const getCustomCandidates = () => {
  return Promise.resolve({
    chairperson: [
      { id: 301, name: 'Alex Black', party: 'Independent', image: 'https://api.dicebear.com/9.x/initials/svg?seed=AlexBlack&backgroundColor=9b59b6' },
      { id: 302, name: 'Blair Grey', party: 'Independent', image: 'https://api.dicebear.com/9.x/initials/svg?seed=BlairGrey&backgroundColor=9b59b6' },
    ],
    members: [
      { id: 303, name: 'Chris Blue', party: 'Group 1', image: 'https://api.dicebear.com/9.x/initials/svg?seed=ChrisBlue&backgroundColor=9b59b6' },
      { id: 304, name: 'Dana Red', party: 'Group 2', image: 'https://api.dicebear.com/9.x/initials/svg?seed=DanaRed&backgroundColor=9b59b6' },
      { id: 305, name: 'Eli Yellow', party: 'Group 1', image: 'https://api.dicebear.com/9.x/initials/svg?seed=EliYellow&backgroundColor=9b59b6' },
    ],
  });
};

// ========== AUTH HELPERS ==========
export const setAuthToken = (token) => localStorage.setItem('token', token);
export const getAuthToken = () => localStorage.getItem('token');
export const removeAuthToken = () => localStorage.removeItem('token');
export const isAuthenticated = () => !!localStorage.getItem('token');