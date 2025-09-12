
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    const { error } = await resetPassword(email);

    if (error) {
      toast.error(error.message || "An error occurred while sending reset email");
    } else {
      toast.success("Password reset email sent! Please check your inbox.");
      navigate("/login");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-center">Forgot Password</h1>
        <p className="text-sm mb-6 text-center text-gray-600">
          Please enter the email address you'd like your password reset information sent to
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="your-email@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#6366F1] text-white p-2 rounded-lg hover:bg-[#6366F1]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? "Sending..." : "Send Reset Email"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-[#6366F1] hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
