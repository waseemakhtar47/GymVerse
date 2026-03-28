import React from "react";
import { useNavigate } from "react-router-dom";
import { BicepsFlexed } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .float { animation: float 6s ease-in-out infinite; }
        .fadeUp { animation: fadeUp 1s ease forwards; }
        .delay1 { animation-delay: 0.2s; }
        .delay2 { animation-delay: 0.4s; }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-purple-900 via-black to-gray-900"></div>

      {/* Glow */}
      <div className="absolute w-96 h-96 bg-purple-600 blur-3xl opacity-20 top-10 left-10 float"></div>
      <div className="absolute w-96 h-96 bg-blue-600 blur-3xl opacity-20 bottom-10 right-10 float"></div>

      {/* Navbar */}
      <nav className="relative z-10 flex justify-between px-8 py-5 backdrop-blur-md bg-white/5 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          GymVerse
        </h1>
        <div className="space-x-4">
          <button onClick={() => navigate("/login")} className="hover:text-blue-400">Login</button>
          <button
            onClick={() => navigate("/signup")}
            className="bg-linear-to-r from-blue-500 to-purple-600 px-4 py-2 rounded-lg"
          >
            Sign Up
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-6xl font-extrabold mb-6 bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent fadeUp flex">
          <BicepsFlexed size={40} color="#18378c" strokeWidth={2} /> GymVerse 
        </h1>

        <p className="text-gray-300 mb-10 fadeUp delay1">
          Next Level Platform For Gym
        </p>

        <div className="flex gap-4 fadeUp delay2">
          <button
            onClick={() => navigate("/signup")}
            className="bg-linear-to-r from-blue-500 to-purple-600 px-8 py-3 rounded-xl hover:scale-105 transition"
          >
            Get Started 
          </button>

          <button
            onClick={() => navigate("/login")}
            className="border px-8 py-3 rounded-xl hover:bg-white hover:text-black transition"
          >
            Login
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="relative z-10 grid md:grid-cols-3 gap-8 px-10 pb-20 max-w-6xl mx-auto">
        {["Find Gyms", "Expert Trainers", "Stay Motivated"].map((item, i) => (
          <div key={i} className="bg-white/5 p-6 rounded-xl backdrop-blur-lg hover:scale-105 transition">
            <h3 className="text-xl font-semibold mb-2">{item}</h3>
            <p className="text-gray-400">Premium experience for fitness lovers.</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Landing;