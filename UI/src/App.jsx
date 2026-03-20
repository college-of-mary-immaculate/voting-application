import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Voter imports
import VoterSignup from './voter/components/Signup';
import VoterLogin from './voter/components/Login';
import ElectionLayout from './voter/components/layout/ElectionLayout';
import ElectionLanding from './voter/components/pages/ElectionLanding';
import NationalElection from './voter/components/pages/NationalElection';
import BarangayElection from './voter/components/pages/BarangayElection';
import ClassElection from './voter/components/pages/ClassElection';
import CustomElection from './voter/components/pages/CustomElection';
import ElectionTally from './voter/components/pages/ElectionTally';

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
        {/* Public routes */}
        <Route path="/signup" element={<VoterSignup />} />
        <Route path="/login" element={<VoterLogin />} />

        {/* Voter routes - NO INDEX ROUTE HERE */}
        <Route path="/elections" element={<ElectionLayout />} />
        
        {/* These routes will be rendered inside ElectionLayout's Outlet */}
        <Route path="/elections/:slug/:electionId" element={<ElectionLayout />}>
          <Route index element={<ElectionLanding />} />
        </Route>

        <Route path="/elections/:slug/:electionId/vote" element={<ElectionLayout />}>
          <Route index element={<NationalElection />} />
        </Route>

        <Route path="/elections/tally/:electionId" element={<ElectionLayout />}>
          <Route index element={<ElectionTally />} />
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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;