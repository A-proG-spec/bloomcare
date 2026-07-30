import React, { useState, forwardRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import type { Pharmacy } from '../../types/pharmacy.types';
import { useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaStore, FaStar, FaArrowRight } from 'react-icons/fa';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface PharmacyMapProps {
  pharmacies: Pharmacy[];
  center?: { lat: number; lng: number };
  zoom?: number;
  onPharmacySelect?: (pharmacy: Pharmacy) => void;
  selectedPharmacy?: Pharmacy | null;
}

const MapClickHandler: React.FC<{
  setClickedPos: (pos: LatLngExpression | null) => void;
  setClickedLatLng: (latlng: { lat: number; lng: number } | null) => void;
}> = ({ setClickedPos, setClickedLatLng }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setClickedPos([lat, lng]);
      setClickedLatLng({ lat, lng });
    },
  });
  return null;
};

export const PharmacyMap = forwardRef<MapContainer, PharmacyMapProps>(({
  pharmacies,
  center = { lat: 9.0222, lng: 38.7468 },
  zoom = 13,
  onPharmacySelect,
  selectedPharmacy,
}, ref) => {
  const navigate = useNavigate();
  const [clickedPos, setClickedPos] = useState<LatLngExpression | null>(null);
  const [clickedLatLng, setClickedLatLng] = useState<{ lat: number; lng: number } | null>(null);
  const [map, setMap] = useState<MapContainer | null>(null);

  useEffect(() => {
    if (selectedPharmacy && map) {
      const { latitude, longitude } = selectedPharmacy;
      if (latitude && longitude) {
        map.flyTo([latitude, longitude], 16, { duration: 1.5 });
      }
    }
  }, [selectedPharmacy, map]);

  const handleMarkerClick = (pharmacy: Pharmacy) => {
    if (onPharmacySelect) onPharmacySelect(pharmacy);
  };

  const handleViewDetails = (pharmacy: Pharmacy) => {
    navigate(`/pharmacy/${pharmacy._id}`);
  };

  const position: LatLngExpression = [center.lat, center.lng];

  return (
    <div className="w-full h-full rounded-xl overflow-hidden">
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        className="z-0 rounded-xl"
        zoomControl={false}
        ref={(mapInstance) => {
          setMap(mapInstance);
          if (typeof ref === 'function') ref(mapInstance);
          else if (ref) ref.current = mapInstance;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &bull; &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapClickHandler setClickedPos={setClickedPos} setClickedLatLng={setClickedLatLng} />

        {pharmacies.map((pharmacy) => {
          const isActive = pharmacy.isActive;
          const icon = isActive ? defaultIcon : defaultIcon;
          return (
            <Marker
              key={pharmacy._id}
              position={[pharmacy.latitude || center.lat, pharmacy.longitude || center.lng]}
              icon={icon}
              eventHandlers={{
                click: () => handleMarkerClick(pharmacy),
              }}
            >
              <Popup>
                <div className="p-3 max-w-xs">
                  <h4 className="font-semibold text-black text-base flex items-center gap-1 font-outfit">
                    <FaStore className="w-4 h-4 text-[#22c55e]" />
                    {pharmacy.name}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1 mt-1 font-outfit">
                    <FaMapMarkerAlt className="w-3 h-3" />
                    {pharmacy.address}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-black flex items-center gap-0.5 font-outfit">
                      <FaStar className="w-3 h-3 text-yellow-400" />
                      {pharmacy.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500 font-outfit">({pharmacy.totalReviews})</span>
                  </div>
                  <button
                    onClick={() => handleViewDetails(pharmacy)}
                    className="mt-2 w-full bg-[#22c55e] text-white px-4 py-2 rounded-xl hover:bg-[#16a34a] transition-colors font-medium flex items-center justify-center gap-2 font-outfit"
                  >
                    View Details
                    <FaArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {clickedPos && clickedLatLng && (
          <Marker position={clickedPos} icon={defaultIcon}>
            <Popup>
              <div className="p-2">
                <p className="font-medium text-sm text-black font-outfit flex items-center gap-1">
                  <FaMapMarkerAlt className="w-3 h-3 text-[#22c55e]" />
                  Clicked Location
                </p>
                <p className="text-xs text-gray-600 mt-1 font-outfit">
                  <strong>Lat:</strong> {clickedLatLng.lat.toFixed(6)}
                </p>
                <p className="text-xs text-gray-600 font-outfit">
                  <strong>Lng:</strong> {clickedLatLng.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {clickedLatLng && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md text-sm text-gray-700 border border-gray-200 font-outfit flex items-center gap-2">
          <FaMapMarkerAlt className="w-3 h-3 text-[#22c55e]" />
          {clickedLatLng.lat.toFixed(6)}, {clickedLatLng.lng.toFixed(6)}
        </div>
      )}
    </div>
  );
});

PharmacyMap.displayName = 'PharmacyMap';