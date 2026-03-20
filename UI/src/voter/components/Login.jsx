import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginVoter, setAuthToken } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/elections', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';
    if (!form.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await loginVoter(form);
      console.log('Login response:', res.data); // Debug log

      const { result, token } = res.data;

      if (result.status === 'success') {
        // Store token first
        setAuthToken(token);
        
        const userType = result.data?.type;
        const userData = result.data;

        if (userType === 'admin') {
          localStorage.setItem('user', JSON.stringify(userData));
          const tokenEncoded = encodeURIComponent(token);
          const userEncoded = encodeURIComponent(JSON.stringify(userData));
          window.location.href = `/admin?token=${tokenEncoded}&user=${userEncoded}`;
        } else {
          // Voter - navigate to elections
          console.log('Voter logged in, navigating to /elections');
          navigate('/elections', { replace: true });
        }
      } else {
        setApiError(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      setApiError(error.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 voter-bg" />
      <div className="absolute inset-0 voter-overlay" />

      <div className="relative w-full max-w-[90%] sm:max-w-md md:max-w-lg neumorphic-card p-6 sm:p-8 z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#1e3a8a] mb-2">Welcome Back</h2>
        <p className="text-center text-[#1e3a8a]/70 text-sm sm:text-base mb-6 sm:mb-8">Sign in to continue</p>

        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-red-600 text-sm shadow-inner">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1e3a8a]/80 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 neumorphic-input text-[#1e3a8a] placeholder-[#1e3a8a]/40 focus:outline-none transition ${
                errors.email ? 'neumorphic-input-error' : ''
              }`}
              placeholder="you@example.com"
              disabled={loading}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1e3a8a]/80 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-16 neumorphic-input text-[#1e3a8a] placeholder-[#1e3a8a]/40 focus:outline-none transition ${
                  errors.password ? 'neumorphic-input-error' : ''
                }`}
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-[#1e3a8a]/70 hover:text-[#1e3a8a] focus:outline-none uppercase tracking-wider"
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 neumorphic-button text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-sm text-[#1e3a8a]/70 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-[#1e3a8a] font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}