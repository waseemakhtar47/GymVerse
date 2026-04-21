import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { membershipService } from '../../services/membershipService';
import { gymService } from '../../services/gymService';
import PaymentButton from '../../components/PaymentButton';
import QRCodeDisplay from '../../components/QRCodeDisplay';
import { 
  CreditCardIcon, 
  QrCodeIcon, 
  XMarkIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const MyMemberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedGym, setSelectedGym] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [refreshKey, setRefreshKey] = useState(0);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [membershipsRes, gymsRes] = await Promise.all([
        membershipService.getMyMemberships(),
        gymService.getAllGyms(),
      ]);
      setMemberships(membershipsRes.data.data || []);
      setGyms(gymsRes.data.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to load memberships');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Are you sure you want to cancel this membership?')) return;
    try {
      await membershipService.cancelMembership(id);
      toast.success('Membership cancelled');
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel');
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

  const getPlanDetails = (plan) => {
    switch(plan) {
      case 'monthly': return { name: 'Monthly', price: '₹49', amount: 49, duration: '1 month' };
      case 'quarterly': return { name: 'Quarterly', price: '₹129', amount: 129, duration: '3 months' };
      case 'yearly': return { name: 'Yearly', price: '₹499', amount: 499, duration: '12 months' };
      default: return { name: 'Unknown', price: '₹0', amount: 0, duration: 'Unknown' };
    }
  };

  const getRemainingDays = (endDate) => {
    const remaining = Math.ceil((new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (remaining < 0) return 0;
    return remaining;
  };

  const activeMemberships = memberships.filter(m => m.status === 'active');
  const expiredMemberships = memberships.filter(m => m.status === 'expired');
  const cancelledMemberships = memberships.filter(m => m.status === 'cancelled');

  if (loading) {
    return (
      <DashboardLayout title="My Memberships" role="user">
        <div className="flex items-center justify-center min-h-[400px]">
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
        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/10 pb-2 flex-wrap">
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              activeTab === 'active' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckCircleIcon className="w-4 h-4" />
            Active ({activeMemberships.length})
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              activeTab === 'expired' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <ExclamationTriangleIcon className="w-4 h-4" />
            Expired ({expiredMemberships.length})
          </button>
          <button
            onClick={() => setActiveTab('cancelled')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              activeTab === 'cancelled' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <XMarkIcon className="w-4 h-4" />
            Cancelled ({cancelledMemberships.length})
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              activeTab === 'buy' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CreditCardIcon className="w-4 h-4" />
            Buy New
          </button>
        </div>

        {/* Active Memberships Tab */}
        {activeTab === 'active' && (
          <div>
            {activeMemberships.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <CheckCircleIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Active Memberships</h3>
                <p className="text-gray-400">Buy a membership to get started!</p>
                <button
                  onClick={() => setActiveTab('buy')}
                  className="mt-4 px-6 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700"
                >
                  Buy Membership
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeMemberships.map((m) => {
                  const plan = getPlanDetails(m.plan);
                  const remainingDays = getRemainingDays(m.endDate);
                  return (
                    <div key={m._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-green-500/30 hover:scale-105 transition">
                      <div className="h-24 bg-gradient-to-r from-green-600 to-emerald-600 p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-white/20 overflow-hidden flex items-center justify-center">
                            {m.gymId?.profilePic ? (
                              <img src={m.gymId.profilePic} alt={m.gymId?.name} className="w-full h-full object-cover" />
                            ) : (
                              <BuildingOfficeIcon className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-lg">{m.gymId?.name || 'Gym'}</h3>
                            <p className="text-white/80 text-sm">{plan.name} Plan</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Amount</span>
                          <span className="text-white font-semibold">{plan.price}</span>
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
                          <span className="text-gray-400">Remaining</span>
                          <span className={`font-semibold ${remainingDays < 7 ? 'text-red-400' : 'text-green-400'}`}>
                            {remainingDays} days
                          </span>
                        </div>
                        
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => setSelectedQR(m.qrCode)}
                            className="flex-1 py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700 transition flex items-center justify-center gap-1"
                          >
                            <QrCodeIcon className="w-4 h-4" />
                            Show QR
                          </button>
                          <button
                            onClick={() => handleCancel(m._id)}
                            className="flex-1 py-2 bg-red-600/20 rounded-lg text-red-400 text-sm hover:bg-red-600/30 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Expired Memberships Tab */}
        {activeTab === 'expired' && (
          <div>
            {expiredMemberships.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Expired Memberships</h3>
                <p className="text-gray-400">All your memberships are active!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {expiredMemberships.map((m) => (
                  <div key={m._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-red-500/30">
                    <div className="h-20 bg-gray-700 p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">
                          {m.gymId?.profilePic ? (
                            <img src={m.gymId.profilePic} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BuildingOfficeIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{m.gymId?.name}</h3>
                          <p className="text-gray-400 text-sm">{getPlanDetails(m.plan).name} Plan</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Expired on</span>
                        <span className="text-red-400 text-sm">{new Date(m.endDate).toLocaleDateString()}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedGym(m.gymId);
                          setSelectedPlan(m.plan);
                          setShowBuyModal(true);
                        }}
                        className="w-full py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700"
                      >
                        Renew Membership
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Cancelled Memberships Tab */}
        {activeTab === 'cancelled' && (
          <div>
            {cancelledMemberships.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <XMarkIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Cancelled Memberships</h3>
                <p className="text-gray-400">You haven't cancelled any memberships.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cancelledMemberships.map((m) => (
                  <div key={m._id} className="bg-white/5 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-500/30 opacity-80">
                    <div className="h-20 bg-gray-800 p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden">
                          {m.gymId?.profilePic ? (
                            <img src={m.gymId.profilePic} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <BuildingOfficeIcon className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-white font-bold">{m.gymId?.name || 'Gym'}</h3>
                          <p className="text-gray-400 text-sm">{getPlanDetails(m.plan).name} Plan</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Cancelled on</span>
                        <span className="text-gray-400 text-sm">{new Date(m.updatedAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between mb-3">
                        <span className="text-gray-400">Original End Date</span>
                        <span className="text-gray-400 text-sm">{new Date(m.endDate).toLocaleDateString()}</span>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedGym(m.gymId);
                          setSelectedPlan(m.plan);
                          setShowBuyModal(true);
                        }}
                        className="w-full py-2 bg-purple-600 rounded-lg text-white text-sm hover:bg-purple-700"
                      >
                        Buy New Membership
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Buy Membership Tab - WITH DISABLED CHECK */}
        {activeTab === 'buy' && (
          <div>
            <h3 className="text-white font-semibold mb-4">Choose a Gym</h3>
            {gyms.length === 0 ? (
              <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                <BuildingOfficeIcon className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400">No gyms available at the moment.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gyms.map((gym) => {
                  const hasActive = activeMemberships.some(m => m.gymId?._id === gym._id);
                  
                  return (
                    <div
                      key={gym._id}
                      onClick={() => {
                        if (!hasActive) {
                          setSelectedGym(gym);
                          setShowBuyModal(true);
                        } else {
                          toast.error('You already have an active membership for this gym');
                        }
                      }}
                      className={`bg-white/5 backdrop-blur-lg rounded-xl p-4 border cursor-pointer transition ${
                        hasActive 
                          ? 'border-green-500/50 opacity-60 cursor-not-allowed' 
                          : 'border-white/10 hover:border-purple-500'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 overflow-hidden flex items-center justify-center">
                          {gym.profilePic ? (
                            <img src={gym.profilePic} alt={gym.name} className="w-full h-full object-cover" />
                          ) : (
                            <BuildingOfficeIcon className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{gym.name}</h4>
                          <p className="text-gray-400 text-xs">{gym.address?.substring(0, 60)}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-500">Starting at</span>
                        <span className="text-purple-400 font-bold">₹49/mo</span>
                      </div>
                      {hasActive && (
                        <div className="mt-2 text-center">
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" />
                            Already Purchased
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* QR Modal */}
        {selectedQR && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setSelectedQR(null)}>
            <div className="bg-gray-900 rounded-xl max-w-sm w-full mx-4 border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Gym Access QR Code</h3>
                  <button onClick={() => setSelectedQR(null)} className="text-gray-400 hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <QRCodeDisplay value={selectedQR} size={250} />
                <p className="text-gray-500 text-xs text-center mt-4">Show this code at the gym entrance</p>
              </div>
            </div>
          </div>
        )}

        {/* Buy Membership Modal */}
        {showBuyModal && selectedGym && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setShowBuyModal(false)}>
            <div className="bg-gray-900 rounded-xl max-w-md w-full mx-4 border border-white/10" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Buy Membership</h3>
                  <button onClick={() => setShowBuyModal(false)} className="text-gray-400 hover:text-white">
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 overflow-hidden">
                    {selectedGym.profilePic ? (
                      <img src={selectedGym.profilePic} alt={selectedGym.name} className="w-full h-full object-cover" />
                    ) : (
                      <BuildingOfficeIcon className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Gym</p>
                    <p className="text-white font-semibold">{selectedGym.name}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="text-gray-400 text-sm block mb-2">Select Plan</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['monthly', 'quarterly', 'yearly'].map((plan) => {
                      const details = getPlanDetails(plan);
                      return (
                        <button
                          key={plan}
                          onClick={() => setSelectedPlan(plan)}
                          className={`p-3 rounded-lg border transition ${
                            selectedPlan === plan
                              ? 'border-purple-500 bg-purple-500/20'
                              : 'border-white/10 hover:border-purple-500'
                          }`}
                        >
                          <p className="text-white font-semibold text-sm">{details.name}</p>
                          <p className="text-purple-400 text-xs">{details.price}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                <PaymentButton
                  type="membership"
                  itemId={selectedGym._id}
                  plan={selectedPlan}
                  amount={getPlanDetails(selectedPlan).amount}
                  buttonText={`Pay ${getPlanDetails(selectedPlan).price}`}
                  onSuccess={() => {
                    setShowBuyModal(false);
                    setSelectedGym(null);
                    setRefreshKey(prev => prev + 1);
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyMemberships;