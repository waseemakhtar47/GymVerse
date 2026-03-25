import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">💪 Gym Verse</h1>
      <div className="space-x-4">
        <Link to="/" className="hover:text-gray-300">Home</Link>
        <Link to="/login" className="hover:text-gray-300">Login</Link>
        <Link to="/signup" className="bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700">
          Sign Up
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;