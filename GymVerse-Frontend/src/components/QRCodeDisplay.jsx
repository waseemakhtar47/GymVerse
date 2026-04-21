import { useRef } from 'react';

const QRCodeDisplay = ({ value, size = 200 }) => {
  const qrRef = useRef();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(value);
    alert('QR code copied to clipboard!');
  };

  return (
    <div className="text-center" ref={qrRef}>
      <div className="bg-gray-800 p-4 rounded-xl inline-block">
        <div className="bg-white p-2 rounded-lg">
          <div 
            className="font-mono text-xs text-black break-all p-4 bg-gray-100 rounded-lg"
            style={{ width: size, wordBreak: 'break-all' }}
          >
            {value}
          </div>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={copyToClipboard}
          className="flex-1 py-2 bg-blue-600 rounded-lg text-white text-sm hover:bg-blue-700"
        >
          Copy Code
        </button>
      </div>
      <p className="text-gray-400 text-xs mt-3">Show this code at the gym entrance</p>
    </div>
  );
};

export default QRCodeDisplay;