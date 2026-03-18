import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Voter imports
import VoterSignup from './voter/components/Signup';
import VoterLogin from './voter/components/Login';
import ElectionLayout from './voter/components/layout/ElectionLayout';
import WelcomePage from './voter/components/pages/WelcomePage';
import NationalElection from './voter/components/pages/NationalElection';
import BarangayElection from './voter/components/pages/BarangayElection';
import ClassElection from './voter/components/pages/ClassElection';
import CustomElection from './voter/components/pages/CustomElection';
import TallyPage from './voter/components/pages/TallyPage';

// Admin imports
import AdminLayout from './admin/components/AdminLayout';
import Dashboard from './admin/pages/Dashboard/Dashboard';
import Users from './admin/pages/Users/Users';
import Elections from './admin/pages/Elections/Election';
import Candidates from './admin/pages/Candidates/Candidates';
import Admins from './admin/pages/Admins/Admins';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Voter routes */}
        <Route path="/signup" element={<VoterSignup />} />
        <Route path="/login" element={<VoterLogin />} />
        <Route path="/tally" element={<TallyPage />} />
        
        <Route path="/elections" element={<ElectionLayout />}>
          <Route index element={<WelcomePage />} />
          <Route path="national" element={<NationalElection />} />
          <Route path="barangay" element={<BarangayElection />} />
          <Route path="class" element={<ClassElection />} />
          <Route path="custom" element={<CustomElection />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="elections" element={<Elections />} />
          <Route path="candidates" element={<Candidates />} />
          <Route path="admins" element={<Admins />} />
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/signup" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;