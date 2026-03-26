import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const gymIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const GymMap = ({ gyms, onGymClick, userLocation }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Default center (Delhi)
    const defaultCenter = userLocation || [28.6139, 77.2090];
    
    mapRef.current = L.map(mapContainerRef.current).setView(defaultCenter, 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update user location marker and center map
  useEffect(() => {
    if (!mapRef.current) return;

    if (userLocation && userLocation.lat && userLocation.lng) {
      // Remove old marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }
      
      // Add new marker
      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindPopup('<b>📍 You are here</b>')
        .addTo(mapRef.current);
      
      // Center map to user location
      mapRef.current.setView([userLocation.lat, userLocation.lng], 13);
    }
  }, [userLocation]);

  // Update gym markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    gyms.forEach(gym => {
      let lat = null, lng = null;
      
      if (gym.location?.coordinates) {
        lat = gym.location.coordinates[1];
        lng = gym.location.coordinates[0];
      } else if (gym.lat && gym.lng) {
        lat = gym.lat;
        lng = gym.lng;
      }
      
      if (lat && lng) {
        const popupDiv = document.createElement('div');
        popupDiv.className = 'p-2 min-w-[200px]';
        popupDiv.innerHTML = `
          <h3 class="font-bold text-gray-900">${gym.name || 'Gym'}</h3>
          <p class="text-sm text-gray-600 mt-1">${gym.address || 'Address not available'}</p>
          ${gym.timings?.open ? `<p class="text-xs text-gray-500 mt-1">🕒 ${gym.timings.open} - ${gym.timings.close}</p>` : ''}
          ${gym.contactNumber ? `<p class="text-xs text-gray-500">📞 ${gym.contactNumber}</p>` : ''}
        `;
        
        const marker = L.marker([lat, lng], { icon: gymIcon })
          .bindPopup(popupDiv)
          .addTo(mapRef.current);
        
        marker.on('click', () => {
          if (onGymClick) onGymClick(gym);
        });
        
        markersRef.current.push(marker);
      }
    });
  }, [gyms, onGymClick]);

  return <div ref={mapContainerRef} className="w-full h-125 rounded-xl bg-gray-800" />;
};

export default GymMap;