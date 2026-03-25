import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    navigate("/"); // after login
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

      <style>{`
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fadeUp { animation: fadeUp 0.8s ease forwards; }
      `}</style>

      <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-black to-gray-900"></div>

      <div className="relative z-10 bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-2xl w-96 fadeUp">

        <h2 className="text-3xl font-bold text-center mb-6 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Login 🔐
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 px-4 py-3 bg-white/10 rounded-lg"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-6 px-4 py-3 bg-white/10 rounded-lg"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <button className="w-full bg-linear-to-r from-blue-500 to-purple-600 py-3 rounded-lg hover:scale-105 transition">
            Login
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-purple-400">Sign Up</Link>
        </p>

      </div>
    </div>
  );
};

export default Login;