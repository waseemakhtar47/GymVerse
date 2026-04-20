import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { membershipService } from '../../services/membershipService';
import { gymService } from '../../services/gymService';
import { 
  UserGroupIcon, 
  QrCodeIcon,
  CheckCircleIcon,
  XCircleIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const GymMemberships = () => {
  const { gymId } = useParams();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState([]);
  const [gym, setGym] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrVerification, setQrVerification] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  useEffect(() => {
    fetchData();
  }, [gymId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membershipsRes, gymRes] = await Promise.all([
        membershipService.getGymMemberships(gymId),
        gymService.getGymById(gymId),
      ]);
      setMemberships(membershipsRes.data.data || []);
      setStats(membershipsRes.data.stats || null);
      setGym(gymRes.data.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load memberships');
      navigate('/owner/gyms');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyQR = async () => {
    if (!qrVerification.trim()) {
      toast.error('Please enter QR code');
      return;
    }
    
    setVerifying(true);
    setVerificationResult(null);
    try {
      const res = await membershipService.verifyQR(qrVerification);
      setVerificationResult(res.data.data);
      toast.success('QR code verified! Access granted.');
    } catch (error) {
      setVerificationResult(null);
      toast.error(error.response?.data?.message || 'Invalid QR code');
    } finally {
      setVerifying(false);
      setQrVerification('');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'active':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">Active</span>;
      case 'expired':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">Expired</span>;
      case 'cancelled':
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">Cancelled</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Gym Memberships" role="owner">
        <div className="flex items-center justify-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading memberships...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Memberships - ${gym?.name || 'Gym'}`} role="owner">
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/owner/gyms')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Gyms
        </button>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <UserGroupIcon className="w-8 h-8 text-blue-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.total}</p>
              <p className="text-gray-400 text-sm">Total Members</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <CheckCircleIcon className="w-8 h-8 text-green-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-gray-400 text-sm">Active</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <XCircleIcon className="w-8 h-8 text-red-400 mb-2" />
              <p className="text-2xl font-bold text-white">{stats.expired + stats.cancelled}</p>
              <p className="text-gray-400 text-sm">Inactive</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <CurrencyDollarIcon className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="text-2xl font-bold text-white">${stats.revenue}</p>
              <p className="text-gray-400 text-sm">Revenue</p>
            </div>
          </div>
        )}

        {/* QR Verification Section */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <QrCodeIcon className="w-5 h-5" />
            Verify Member QR Code
          </h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={qrVerification}
              onChange={(e) => setQrVerification(e.target.value)}
              placeholder="Scan or enter QR code..."
              className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              onKeyPress={(e) => e.key === 'Enter' && handleVerifyQR()}
            />
            <button
              onClick={handleVerifyQR}
              disabled={verifying}
              className="px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition disabled:opacity-50"
            >
              {verifying ? 'Verifying...' : 'Verify'}
            </button>
          </div>
          
          {verificationResult && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500 rounded-lg">
              <p className="text-green-400 font-semibold">✓ Access Granted</p>
              <p className="text-white text-sm mt-1">
                Member: {verificationResult.membership?.userId?.name}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Valid until: {new Date(verificationResult.membership?.endDate).toLocaleDateString()}
              </p>
              <p className="text-gray-400 text-xs">
                Remaining: {verificationResult.remainingDays} days
              </p>
            </div>
          )}
        </div>

        {/* Members List */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10">
          <div className="p-4 border-b border-white/10">
            <h3 className="text-white font-semibold">Member List</h3>
            <p className="text-gray-400 text-xs mt-1">{memberships.length} total members</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left text-gray-400 text-sm">
                  <th className="p-4">Member</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Start Date</th>
                  <th className="p-4">End Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Amount</th>
                 </tr>
              </thead>
              <tbody>
                {memberships.map((m) => (
                  <tr key={m._id} className="border-b border-white/10 hover:bg-white/5">
                    <td className="p-4">
                      <div>
                        <p className="text-white font-medium">{m.userId?.name}</p>
                        <p className="text-gray-400 text-xs">{m.userId?.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize text-white">{m.plan}</span>
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {new Date(m.startDate).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-gray-300 text-sm">
                      {new Date(m.endDate).toLocaleDateString()}
                    </td>
                    <td className="p-4">{getStatusBadge(m.status)}</td>
                    <td className="p-4 text-white">${m.paymentAmount}</td>
                  </tr>
                ))}
                {memberships.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-400">
                      No memberships yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GymMemberships;