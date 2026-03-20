import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { removeAuthToken, getElections, isAuthenticated } from '../../services/api';

const electionTypeMap = {
  1: {
    slug: 'national',
    name: 'National Election',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" stroke={active ? 'white' : 'currentColor'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  2: {
    slug: 'barangay',
    name: 'Barangay Election',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" stroke={active ? 'white' : 'currentColor'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  },
  3: {
    slug: 'class',
    name: 'Class Election',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" stroke={active ? 'white' : 'currentColor'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    )
  },
  4: {
    slug: 'custom',
    name: 'Custom Election',
    icon: (active) => (
      <svg className="w-5 h-5" fill="none" stroke={active ? 'white' : 'currentColor'} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  }
};

export default function ElectionLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkScreen = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Check authentication and get user info
  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        removeAuthToken();
        navigate('/login', { replace: true });
        return;
      }
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      setAuthChecked(true);
    };
    checkAuth();
  }, [navigate]);

  // Fetch elections only if authenticated
  useEffect(() => {
    if (!authChecked) return;

    const fetchElections = async () => {
      try {
        setLoading(true);
        const res = await getElections();
        setElections(res.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch elections:', err);
        if (err.response?.status === 401) {
          removeAuthToken();
          navigate('/login', { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchElections();
  }, [authChecked, navigate]);

  // Auto-redirect if at /elections root
  useEffect(() => {
    if (!loading && elections.length > 0 && location.pathname === '/elections') {
      const first = elections[0];
      const slug = electionTypeMap[first.election_type_id]?.slug || 'custom';
      if (first.has_voted) {
        navigate(`/elections/tally/${first.election_id}`, { replace: true });
      } else {
        navigate(`/elections/${slug}/${first.election_id}`, { replace: true });
      }
    }
  }, [loading, elections, location.pathname, navigate]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname.startsWith(path);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-pulse text-2xl text-indigo-600">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <aside
        className={`
          fixed left-0 top-0 h-full z-30 bg-white/80 backdrop-blur-md border-r border-indigo-100 shadow-xl
          transition-all duration-300 ease-in-out flex flex-col overflow-hidden
          ${sidebarOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full opacity-30 blur-3xl"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full opacity-30 blur-3xl"></div>

        {/* Toggle Button */}
        <div className="p-4 flex justify-end relative z-10">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>

        {/* User Info */}
        {user && sidebarOpen && (
          <div className="px-4 py-3 border-b border-indigo-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {user.fullname?.charAt(0) || user.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user.fullname || user.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 relative z-10 overflow-y-auto">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="flex items-center px-3 py-3 rounded-xl animate-pulse">
                <div className="w-5 h-5 bg-gray-200 rounded-full mr-3"></div>
                {sidebarOpen && <div className="h-4 bg-gray-200 rounded w-24"></div>}
              </div>
            ))
          ) : elections.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-4">No elections assigned</div>
          ) : (
            elections.map((election) => {
              const typeId = election.election_type_id;
              const info = electionTypeMap[typeId] || electionTypeMap[4];
              const landingPath = `/elections/${info.slug}/${election.election_id}`;
              const tallyPath = `/elections/tally/${election.election_id}`;
              const active = location.pathname === landingPath || location.pathname === tallyPath;
              return (
                <button
                  key={election.election_id}
                  onClick={() => {
                    if (election.has_voted) {
                      navigate(tallyPath);
                    } else {
                      navigate(landingPath);
                    }
                  }}
                  className={`
                    w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200 group
                    ${sidebarOpen ? 'justify-start space-x-3' : 'justify-center'}
                    ${active 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200' 
                      : 'text-indigo-800 hover:bg-indigo-100'
                    }
                  `}
                >
                  <span className={active ? 'text-white' : 'text-indigo-600'}>
                    {info.icon(active)}
                  </span>
                  {sidebarOpen && (
                    <span className="text-sm font-medium truncate">{info.name}</span>
                  )}
                  {active && sidebarOpen && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  )}
                </button>
              );
            })
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-indigo-100 relative z-10">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center px-3 py-3 rounded-xl transition-all duration-200
              ${sidebarOpen ? 'justify-start space-x-3' : 'justify-center'}
              bg-red-50 text-red-700 hover:bg-red-100 hover:text-red-800
            `}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      <main
        className={`
          min-h-screen transition-all duration-300 p-4 md:p-6
          ${sidebarOpen ? 'ml-64' : 'ml-20'}
        `}
      >
        <div className="animate-fadeIn">
          {elections.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl">
                <div className="text-6xl mb-4">🗳️</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Elections Assigned</h2>
                <p className="text-gray-600 mb-6">
                  You are not currently assigned to any election.
                </p>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}