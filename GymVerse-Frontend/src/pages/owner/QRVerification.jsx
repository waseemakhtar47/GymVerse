import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { membershipService } from '../../services/membershipService';
import { CheckCircleIcon, XCircleIcon, QrCodeIcon, ClipboardIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const QRVerification = () => {
  const [qrCode, setQrCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [recentVerifications, setRecentVerifications] = useState([]);

  const handleVerify = async () => {
    if (!qrCode.trim()) {
      toast.error('Please enter QR code');
      return;
    }
    
    setVerifying(true);
    setResult(null);
    
    try {
      const res = await membershipService.verifyQR(qrCode);
      setResult({
        success: true,
        data: res.data.data,
        message: res.data.message,
      });
      
      setRecentVerifications(prev => [
        {
          id: Date.now(),
          qrCode: qrCode,
          result: res.data.data,
          timestamp: new Date(),
          success: true,
        },
        ...prev.slice(0, 9)
      ]);
      
      toast.success('Access granted!');
      setQrCode('');
    } catch (error) {
      const errorData = error.response?.data;
      setResult({
        success: false,
        message: errorData?.message || 'Verification failed',
        reason: errorData?.reason,
      });
      
      setRecentVerifications(prev => [
        {
          id: Date.now(),
          qrCode: qrCode,
          result: null,
          timestamp: new Date(),
          success: false,
          message: errorData?.message,
        },
        ...prev.slice(0, 9)
      ]);
      
      toast.error(errorData?.message || 'Invalid QR code');
    } finally {
      setVerifying(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setQrCode(text);
      toast.success('Pasted from clipboard');
    } catch (err) {
      toast.error('Unable to read clipboard');
    }
  };

  const getStatusColor = (success) => {
    return success ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20';
  };

  return (
    <DashboardLayout title="QR Code Verification" role="owner">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
          <div className="text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
              <QrCodeIcon className="w-10 h-10 text-purple-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Member QR Verification</h2>
            <p className="text-gray-400 text-sm mt-1">
              Scan or paste member's QR code to verify gym access
            </p>
            <p className="text-yellow-400 text-xs mt-2">
              ⚠️ You can only verify members who have purchased membership for YOUR gyms
            </p>
          </div>
          
          <div className="flex gap-3">
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleVerify()}
              placeholder="Paste QR code here (format: membershipId|userId|gymId)"
              className="flex-1 px-4 py-3 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
            />
            <button
              onClick={handlePaste}
              className="px-4 py-3 bg-gray-700 rounded-lg text-white hover:bg-gray-600"
            >
              <ClipboardIcon className="w-5 h-5" />
            </button>
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="px-6 py-3 bg-purple-600 rounded-lg text-white font-semibold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {verifying ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Verify'}
            </button>
          </div>
        </div>

        {result && (
          <div className={`p-6 rounded-2xl ${result.success ? 'bg-green-500/10 border border-green-500' : 'bg-red-500/10 border border-red-500'}`}>
            <div className="flex items-center gap-3 mb-4">
              {result.success ? <CheckCircleIcon className="w-8 h-8 text-green-400" /> : <XCircleIcon className="w-8 h-8 text-red-400" />}
              <div>
                <h3 className={`text-xl font-bold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                  {result.success ? 'ACCESS GRANTED' : 'ACCESS DENIED'}
                </h3>
                <p className="text-white text-sm">{result.message}</p>
                {result.reason && <p className="text-gray-400 text-sm">{result.reason}</p>}
              </div>
            </div>
            
            {result.success && result.data && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-400 text-xs">Member Name</p>
                    <p className="text-white font-medium">{result.data.membership?.user?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Member Email</p>
                    <p className="text-white">{result.data.membership?.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Gym</p>
                    <p className="text-white font-medium">{result.data.membership?.gym?.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Plan</p>
                    <p className="text-white capitalize">{result.data.membership?.plan}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Valid Until</p>
                    <p className="text-white">{new Date(result.data.membership?.endDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Remaining Days</p>
                    <p className="text-green-400">{result.data.membership?.remainingDays} days</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {recentVerifications.length > 0 && (
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-4">Recent Verifications</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recentVerifications.map((v) => (
                <div key={v.id} className={`flex items-center justify-between p-3 rounded-lg ${v.success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <div className="flex items-center gap-3">
                    {v.success ? <CheckCircleIcon className="w-4 h-4 text-green-400" /> : <XCircleIcon className="w-4 h-4 text-red-400" />}
                    <div>
                      <p className="text-white text-sm font-mono">{v.qrCode.substring(0, 50)}...</p>
                      <p className="text-gray-500 text-xs">{v.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(v.success)}`}>
                    {v.success ? 'Granted' : 'Denied'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default QRVerification;