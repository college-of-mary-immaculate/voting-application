import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import ElectionLayout from './components/layout/ElectionLayout';
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
        
        {/* Protected routes with sidebar layout */}
        <Route path="/elections" element={<ElectionLayout />}>
          <Route index element={<ElectionSelector />} />
          <Route path="national" element={<NationalElection />} />
          <Route path="barangay" element={<BarangayElection />} />
          <Route path="class" element={<ClassElection />} />
          <Route path="custom" element={<CustomElection />} />
        </Route>

        <Route path="/" element={<Navigate to="/signup" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;