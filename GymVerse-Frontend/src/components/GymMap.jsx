import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const gymIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const GymMap = ({ gyms, onGymClick, userLocation, selectedGym }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const isMapInitialized = useRef(false);

  // Initialize map
  useEffect(() => {
    // Ensure container exists before creating map
    if (!containerRef.current || isMapInitialized.current) return;

    // Small delay to ensure container is fully rendered
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      
      // Default to Ganjdundwara
      const defaultCenter = [27.731571, 78.941208];
      
      try {
        mapRef.current = L.map(containerRef.current).setView(defaultCenter, 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        }).addTo(mapRef.current);
        isMapInitialized.current = true;
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        isMapInitialized.current = false;
      }
    };
  }, []);

  // Update when userLocation changes
  useEffect(() => {
    if (!mapRef.current || !userLocation?.lat || !userLocation?.lng) return;
    
    try {
      const { lat, lng } = userLocation;
      
      // Move map
      mapRef.current.setView([lat, lng], 14);
      
      // Update user marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      
      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
        .bindPopup("📍 You are here")
        .addTo(mapRef.current);
    } catch (error) {
      console.error("Error updating user location:", error);
    }
  }, [userLocation]);

  // Update gym markers
  useEffect(() => {
    if (!mapRef.current) return;
    
    try {
      // Remove existing markers
      markersRef.current.forEach(m => {
        if (m && m.remove) m.remove();
      });
      markersRef.current = [];
      
      // Add new markers
      gyms.forEach(gym => {
        let lat = gym.location?.coordinates?.[1];
        let lng = gym.location?.coordinates?.[0];
        
        if (lat && lng) {
          const marker = L.marker([lat, lng], { icon: gymIcon })
            .bindPopup(`<b>${gym.name}</b><br>${gym.address || ""}`)
            .addTo(mapRef.current);
          
          marker.on("click", () => onGymClick?.(gym));
          markersRef.current.push(marker);
        }
      });
    } catch (error) {
      console.error("Error updating gym markers:", error);
    }
  }, [gyms, onGymClick]);

  // Center on selected gym
  useEffect(() => {
    if (!mapRef.current || !selectedGym) return;
    
    try {
      const lat = selectedGym.location?.coordinates?.[1];
      const lng = selectedGym.location?.coordinates?.[0];
      if (lat && lng) {
        mapRef.current.setView([lat, lng], 15);
      }
    } catch (error) {
      console.error("Error centering on selected gym:", error);
    }
  }, [selectedGym]);

  return <div ref={containerRef} className="w-full h-125 rounded-xl bg-gray-800" />;
};

export default GymMap;