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

        {/* Voter routes */}
        <Route path="/elections" element={<ElectionLayout />}>
          {/* Kung walang napiling election, pwedeng mag-redirect sa unang assigned election (kung meron) */}
          {/* Pero sa ngayon, magdi-display na lang ng mensahe – kung gusto mo, gawin na lang sa ElectionLayout ang redirect */}
          <Route index element={<Navigate to="/elections/first" />} /> 
          {/* Temporary: ire-redirect sa /elections/first – dapat sa ElectionLayout mo i-handle ang redirect to first election */}
          {/* Para sa simple, i-delete na lang natin ang index route at sa ElectionLayout na lang mag-redirect */}
        </Route>

        {/* Para sa actual na landing page */}
        <Route path="/elections/:slug/:electionId" element={<ElectionLayout />}>
          <Route index element={<ElectionLanding />} />
        </Route>

        {/* Voting pages */}
        <Route path="/elections/:slug/:electionId/vote" element={<ElectionLayout />}>
          <Route index element={<NationalElection />} /> {/* temporary – kailangan dynamic */}
          {/* Sa totoo lang, kailangan mong palitan ang voting pages para tanggapin ang slug at electionId, pero sa ngayon ganito muna */}
        </Route>

        {/* Tally page */}
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
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;