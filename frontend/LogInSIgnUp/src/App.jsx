import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import ElectionSelector from './components/pages/ElectionSelector';
import NationalElection from './components/pages/NationalElection';
import BarangayElection from './components/pages/BarangayElection';
import ClassElection from './components/pages/ClassElection';
import CustomElection from './components/pages/CustomElection';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/elections" element={<ElectionSelector />} />
        <Route path="/elections/national" element={<NationalElection />} />
        <Route path="/elections/barangay" element={<BarangayElection />} />
        <Route path="/elections/class" element={<ClassElection />} />
        <Route path="/elections/custom" element={<CustomElection />} />
        <Route path="/" element={<Navigate to="/signup" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;