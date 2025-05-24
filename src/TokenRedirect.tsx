import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from './contexts/AuthContext';

const TokenRedirect = () => {
  const [searchParams] = useSearchParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('access_token', token);

      fetch('http://localhost:8000/api/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch user');
          return res.json();
        })
        .then((userData) => {
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          toast.success(`Welcome, ${userData.name}!`);
          navigate('/dashboard');
        })
        .catch((err) => {
          console.error('Token login error:', err);
          toast.error('Invalid or expired login token.');
          navigate('/login');
        });
    } else {
      // No token? Just show the landing page.
      navigate('/'); // or navigate to Index or login
    }
  }, [searchParams, setUser, navigate]);

  return null;
};

export default TokenRedirect;
