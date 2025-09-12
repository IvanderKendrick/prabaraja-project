import { Sidebar } from "@/components/Sidebar";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Redirect after 3 seconds
    const timer = setTimeout(() => {
      if (user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [location.pathname, navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      {user && <Sidebar />}
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-2">Oops! Page not found</p>
          <p className="text-sm text-gray-500 mb-4">Path: {location.pathname}</p>
          <p className="text-sm text-gray-500 mb-4">
            Redirecting to {user ? 'Dashboard' : 'Login'} in 3 seconds...
          </p>
          <button
            onClick={() => navigate(user ? '/dashboard' : '/login')}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Go {user ? 'to Dashboard' : 'to Login'} now
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;