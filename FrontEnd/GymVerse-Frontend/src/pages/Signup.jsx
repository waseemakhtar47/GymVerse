import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(formData);
    navigate("/login"); // after signup
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
          Sign Up 🚀
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            className="w-full mb-4 px-4 py-3 bg-white/10 rounded-lg"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 px-4 py-3 bg-white/10 rounded-lg"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 px-4 py-3 bg-white/10 rounded-lg"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

            <div className="relative mb-6">
  <select
    className="w-full px-4 py-3 bg-white/10 text-white border border-white/20 rounded-lg 
               focus:outline-none focus:ring-2 focus:ring-purple-500 
               appearance-none cursor-pointer"
    style={{ colorScheme: "dark" }}
    value={formData.role}
    onChange={(e) => setFormData({...formData, role: e.target.value})}
  >
    <option className="bg-gray-900 text-white" value="user">User</option>
    <option className="bg-gray-900 text-white" value="trainer">Trainer</option>
    <option className="bg-gray-900 text-white" value="owner">Owner</option>
  </select>

  {/* 🔥 Custom arrow (important for UX) */}
  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400">
    ▼
  </div>
</div>

          <button className="w-full bg-linear-to-r from-blue-500 to-purple-600 py-3 rounded-lg hover:scale-105 transition">
            Create Account
          </button>
        </form>

        <p className="text-center mt-4 text-gray-400">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
