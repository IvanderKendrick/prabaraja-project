
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLoading(true);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      if (error.message === "Invalid login credentials") {
        toast.error("Invalid email or password. Please try again.");
      } else if (error.message === "Email not confirmed") {
        toast.error("Please check your email and confirm your account before logging in.");
      } else {
        toast.error(error.message || "An error occurred during login");
      }
    } else {
      navigate("/");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="email@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#6366F1] text-white p-2 rounded-lg hover:bg-[#6366F1]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/register" className="text-sm text-[#6366F1] hover:underline">
            Don't have an account? Register
          </Link>
        </div>
        <div className="mt-2 text-center">
          <Link to="/forgot-password" className="text-sm text-[#6366F1] hover:underline">
            Forgot Password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
