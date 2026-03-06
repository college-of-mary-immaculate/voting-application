import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ElectionSelector from './components/pages/ElectionSelector';
import NationalElection from './components/pages/NationalElection';
import BarangayElection from './components/pages/BarangayElection';
import ClassElection from './components/pages/ClassElection';
import CustomElection from './components/pages/CustomElection';

// Mock Login component with same background
function MockLogin() {
  const handleMockLogin = () => {
    localStorage.setItem('token', 'mock-token');
    window.location.href = '/elections';
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="absolute inset-0 opacity-10 bg-repeat"
        style={{
          backgroundImage: "url('https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flag_of_the_Philippines.svg/1280px-Flag_of_the_Philippines.svg.png')",
          backgroundSize: '200px 100px',
        }}
      />
      <div className="relative z-10 bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
        <button
          onClick={handleMockLogin}
          className="bg-[#1e3a8a] text-white px-6 py-3 rounded-xl shadow-lg hover:bg-[#2563eb] transition"
        >
          Mock Login (set token)
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<MockLogin />} />
        <Route path="/elections" element={<ElectionSelector />} />
        <Route path="/elections/national" element={<NationalElection />} />
        <Route path="/elections/barangay" element={<BarangayElection />} />
        <Route path="/elections/class" element={<ClassElection />} />
        <Route path="/elections/custom" element={<CustomElection />} />
        <Route path="/" element={<Navigate to="/elections" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;