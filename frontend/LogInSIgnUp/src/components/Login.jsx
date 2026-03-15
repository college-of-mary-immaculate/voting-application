import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginVoter, setAuthToken } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

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
      // Try voter login first
      const res = await loginVoter(form);
      setAuthToken(res.data.token);
      
      // If voter login successful, go to elections
      navigate('/elections');
    } catch (voterError) {
      // If voter login fails, try admin login
      try {
        console.log('Attempting admin login...');
        
        const response = await fetch('http://localhost:3000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });

        const data = await response.json();
        console.log('Login response:', data);

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        // Check if login was successful and user is admin
        if (data.result?.status === 'success' && data.result.data?.type === 'admin') {
          // Store token and user data in login app's localStorage (optional)
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.result.data));
          
          console.log('Login successful! Token stored:', localStorage.getItem('token'));
          console.log('User stored:', localStorage.getItem('user'));
          
          // Pass token and user via URL parameters
          const token = encodeURIComponent(data.token);
          const user = encodeURIComponent(JSON.stringify(data.result.data));
          
          // Redirect to admin panel with token in URL
          window.location.href = `http://localhost:5175/admin?token=${token}&user=${user}`;
        } else {
          setApiError('Invalid admin credentials');
        }
      } catch (error) {
        console.error('Login error:', error);
        setApiError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070&auto=format&fit=crop')",
          opacity: 0.2,
          filter: 'blur(4px)',
        }}
      />
      <div className="absolute inset-0 bg-black/10" />

      {/* Card - Responsive */}
      <div className="relative w-full max-w-[90%] sm:max-w-md md:max-w-lg bg-[#eef5ff] rounded-3xl p-6 sm:p-8 shadow-[20px_20px_60px_#b0c4de,-20px_-20px_60px_#ffffff] z-10">
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
              className={`w-full px-4 py-3 bg-[#eef5ff] border-0 rounded-xl text-[#1e3a8a] placeholder-[#1e3a8a]/40 focus:outline-none transition shadow-[inset_5px_5px_10px_#b0c4de,inset_-5px_-5px_10px_#ffffff] ${
                errors.email ? 'shadow-[inset_5px_5px_10px_#fecaca,inset_-5px_-5px_10px_#ffffff]' : ''
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
                className={`w-full px-4 py-3 pr-16 bg-[#eef5ff] border-0 rounded-xl text-[#1e3a8a] placeholder-[#1e3a8a]/40 focus:outline-none transition shadow-[inset_5px_5px_10px_#b0c4de,inset_-5px_-5px_10px_#ffffff] ${
                  errors.password ? 'shadow-[inset_5px_5px_10px_#fecaca,inset_-5px_-5px_10px_#ffffff]' : ''
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
            className="w-full py-3 px-4 bg-[#1e3a8a] text-white font-semibold rounded-xl shadow-[8px_8px_16px_#b0c4de,-8px_-8px_16px_#ffffff] hover:bg-[#2563eb] hover:shadow-[inset_5px_5px_10px_#b0c4de,inset_-5px_-5px_10px_#ffffff] transition duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
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