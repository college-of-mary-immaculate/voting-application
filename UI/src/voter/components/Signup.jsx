import { useState } from 'react';
import { registerVoter } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullname.trim()) newErrors.fullname = 'Full name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await registerVoter({
        fullname: form.fullname,
        email: form.email,
        password: form.password
      });
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 voter-bg" />
      <div className="absolute inset-0 voter-overlay" />

      {/* Card */}
      <div className="relative w-full max-w-[90%] sm:max-w-md md:max-w-lg neumorphic-card p-6 sm:p-8 z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-[#1e3a8a] mb-2">Create Account</h2>
        <p className="text-center text-[#1e3a8a]/70 text-sm sm:text-base mb-6 sm:mb-8">Vote Wisely</p>

        {apiError && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-xl text-red-600 text-sm shadow-inner">
            {apiError}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-xl text-green-600 text-sm shadow-inner">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1e3a8a]/80 mb-1">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              className={`w-full px-4 py-3 neumorphic-input text-[#1e3a8a] placeholder-[#1e3a8a]/40 focus:outline-none transition ${
                errors.fullname ? 'neumorphic-input-error' : ''
              }`}
              placeholder="Jober Reyes"
            />
            {errors.fullname && <p className="mt-1 text-xs text-red-600">{errors.fullname}</p>}
          </div>

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
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-[#1e3a8a]/70 hover:text-[#1e3a8a] focus:outline-none uppercase tracking-wider"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1e3a8a]/80 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 pr-16 neumorphic-input text-[#1e3a8a] placeholder-[#1e3a8a]/40 focus:outline-none transition ${
                  errors.confirmPassword ? 'neumorphic-input-error' : ''
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-semibold text-[#1e3a8a]/70 hover:text-[#1e3a8a] focus:outline-none uppercase tracking-wider"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 neumorphic-button text-sm sm:text-base"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-[#1e3a8a]/70 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#1e3a8a] font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}