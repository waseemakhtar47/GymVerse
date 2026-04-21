import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../services/paymentService';
import toast from 'react-hot-toast';

const PaymentButton = ({ type, itemId, plan, amount, onSuccess, buttonText }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      toast.error('Failed to load payment gateway');
      setLoading(false);
      return;
    }
    
    try {
      let orderData;
      
      if (type === 'membership') {
        const res = await paymentService.createMembershipOrder(itemId, plan);
        orderData = res.data.data;
      } else if (type === 'course') {
        const res = await paymentService.createCourseOrder(itemId);
        orderData = res.data.data;
      }
      
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GymVerse',
        description: type === 'membership' ? 'Gym Membership' : 'Course Enrollment',
        order_id: orderData.orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.phone || '',
        },
        theme: {
          color: '#7c3aed',
        },
        handler: async (response) => {
          const verifyData = {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            type: type,
            itemId: itemId,
            plan: plan,
          };
          
          try {
            const verifyRes = await paymentService.verifyPayment(verifyData);
            toast.success(verifyRes.data.message);
            if (onSuccess) onSuccess();
          } catch (error) {
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled');
          },
        },
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Processing...
        </>
      ) : (
        buttonText || `Pay ₹${amount}`
      )}
    </button>
  );
};

export default PaymentButton;