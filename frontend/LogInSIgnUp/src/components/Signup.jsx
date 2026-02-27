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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.fullname.trim()) newErrors.fullname = 'Full name is required';
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
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
      const res = await registerVoter({
        fullname: form.fullname,
        email: form.email,
        password: form.password
      });
      setSuccess(res.data.message || 'Registration successful!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setApiError(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with low opacity and blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=2070&auto=format&fit=crop')",
          opacity: 0.2,
          filter: 'blur(4px)',
        }}
      />
      {/* Optional overlay for extra dimming */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Card */}
      <div className="relative w-full max-w-md bg-[#eef5ff] rounded-3xl p-8 shadow-[20px_20px_60px_#b0c4de,-20px_-20px_60px_#ffffff] z-10">
        <h2 className="text-4xl font-bold text-center text-[#1e3a8a] mb-2">Create Account</h2>
        <p className="text-center text-[#1e3a8a]/70 mb-8">Vote Wisely</p>

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

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1e3a8a]/80 mb-1">Full Name</label>
            <input
              type="text"
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-[#eef5ff] border-0 rounded-xl text-[#1e3a8a] placeholder-[#1e3a8a]/40 focus:outline-none transition shadow-[inset_5px_5px_10px_#b0c4de,inset_-5px_-5px_10px_#ffffff] ${errors.fullname ? 'shadow-[inset_5px_5px_10px_#fecaca,inset_-5px_-5px_10px_#ffffff]' : ''}`}
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
              className={`w-full px-4 py-3 bg-[#eef5ff] border-0 rounded-xl text-[#1e3a8a] placeholder-[#1e3a8a]/40 focus:outline-none transition shadow-[inset_5px_5px_10px_#b0c4de,inset_-5px_-5px_10px_#ffffff] ${errors.email ? 'shadow-[inset_5px_5px_10px_#fecaca,inset_-5px_-5px_10px_#ffffff]' : ''}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1e3a8a]/80 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-[#eef5ff] border-0 rounded-xl text-[#1e3a8a] placeholder-[#1e3a8a]/40 focus:outline-none transition shadow-[inset_5px_5px_10px_#b0c4de,inset_-5px_-5px_10px_#ffffff] ${errors.password ? 'shadow-[inset_5px_5px_10px_#fecaca,inset_-5px_-5px_10px_#ffffff]' : ''}`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1e3a8a]/80 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-[#eef5ff] border-0 rounded-xl text-[#1e3a8a] placeholder-[#1e3a8a]/40 focus:outline-none transition shadow-[inset_5px_5px_10px_#b0c4de,inset_-5px_-5px_10px_#ffffff] ${errors.confirmPassword ? 'shadow-[inset_5px_5px_10px_#fecaca,inset_-5px_-5px_10px_#ffffff]' : ''}`}
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#1e3a8a] text-white font-semibold rounded-xl shadow-[8px_8px_16px_#b0c4de,-8px_-8px_16px_#ffffff] hover:bg-[#2563eb] hover:shadow-[inset_5px_5px_10px_#b0c4de,inset_-5px_-5px_10px_#ffffff] transition duration-200"
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