import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Redirect based on role
      const role = result.role;
      if (role === 'owner') {
        navigate('/owner/dashboard');
      } else if (role === 'trainer') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/user/dashboard');
      }
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black text-white overflow-hidden">
      <div className="absolute top-6 left-6 z-20">
        <button
          onClick={() => navigate("/")}
          className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg backdrop-blur-md hover:bg-white hover:text-black transition"
        >
          ← Home
        </button>
      </div>

      <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-black to-gray-900"></div>

      <div className="relative z-10 bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl w-96">
        <h2 className="text-3xl font-bold text-center mb-6 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Login 
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 px-4 py-3 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 px-4 py-3 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-linear-to-r from-blue-500 to-purple-600 py-3 rounded-lg hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          Don't have an account?{" "}
          <Link to="/signup" className="text-purple-400 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;