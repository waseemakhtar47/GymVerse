import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { membershipService } from '../../services/membershipService';
import { CreditCardIcon, QrCodeIcon, XMarkIcon } from '@heroicons/react/24/outline';

const MyMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMemberships();
  }, []);

  const fetchMemberships = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await membershipService.getMyMemberships();
      setMemberships(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch memberships:', error);
      setError(error.response?.data?.message || 'Failed to load memberships');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this membership?')) return;
    try {
      await membershipService.cancelMembership(id);
      fetchMemberships();
    } catch (error) {
      alert('Failed to cancel membership');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-green-400 bg-green-500/20';
      case 'expired': return 'text-red-400 bg-red-500/20';
      case 'cancelled': return 'text-gray-400 bg-gray-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getPlanPrice = (plan) => {
    switch(plan) {
      case 'monthly': return '$49';
      case 'quarterly': return '$129';
      case 'yearly': return '$499';
      default: return '$0';
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Memberships" role="user">
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
    <DashboardLayout title="My Memberships" role="user">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-xl p-4 text-red-400 text-center">
            {error}
          </div>
        )}

        {memberships.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
            <CreditCardIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Active Memberships</h3>
            <p className="text-gray-400">You don't have any gym memberships yet.</p>
            <button className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700">
              Find Gyms
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {memberships.map((m) => (
              <div key={m._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-white/10 hover:scale-105 transition">
                <div className="h-32 bg-linear-to-r from-purple-600 to-blue-600 p-4">
                  <h3 className="text-white font-bold text-xl">{m.gymId?.name || 'Gym'}</h3>
                  <p className="text-white/80 text-sm mt-1">{m.plan?.toUpperCase()} Plan</p>
                </div>
                
                <div className="p-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount</span>
                      <span className="text-white font-semibold">{getPlanPrice(m.plan)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Start Date</span>
                      <span className="text-white">{new Date(m.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">End Date</span>
                      <span className="text-white">{new Date(m.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(m.status)}`}>
                        {m.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {m.status === 'active' && m.qrCode && (
                      <button
                        onClick={() => setSelectedQR(m.qrCode)}
                        className="flex-1 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition flex items-center justify-center gap-1"
                      >
                        <QrCodeIcon className="w-4 h-4" />
                        Show QR
                      </button>
                    )}
                    {m.status === 'active' && (
                      <button
                        onClick={() => handleCancel(m._id)}
                        className="flex-1 py-2 bg-red-600/20 rounded-lg text-red-400 text-sm hover:bg-red-600/30 transition"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* QR Modal */}
        {selectedQR && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setSelectedQR(null)}>
            <div className="bg-white p-6 rounded-xl max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-900">Gym Access QR Code</h3>
                <button onClick={() => setSelectedQR(null)} className="text-gray-500 hover:text-gray-700">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-gray-600 text-sm break-all font-mono">{selectedQR}</p>
                <p className="text-gray-500 text-xs mt-2">Show this QR code at the gym entrance</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyMemberships;