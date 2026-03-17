import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function TokenHandler({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if token is in URL
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (token) {
      console.log('📦 Token found in URL, storing in localStorage');
      localStorage.setItem('token', token);
      
      // Remove token from URL
      navigate('/admin', { replace: true });
    }
  }, [location, navigate]);

  return children;
}