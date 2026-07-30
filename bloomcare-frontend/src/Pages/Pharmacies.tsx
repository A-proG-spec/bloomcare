import React, { useEffect, useState, useRef } from 'react';
import { usePharmacyStore } from '../store/pharmacyStore';
import { useUIStore } from '../store/uiStore';
import { PharmacyCard } from '../components/pharmacy/PharmacyCard';
import { PharmacySearchBar } from '../components/pharmacy/PharmacySearchBar';
import { PharmacyMap } from '../components/pharmacy/PharmacyMap';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import type { Pharmacy } from '../types/pharmacy.types';
import type { Map as LeafletMap } from 'leaflet';
// ✅ REMOVED: import { MapContainer } from 'react-leaflet';

export const Pharmacies: React.FC = () => {
  const {
    pharmacies,
    isLoading,
    fetchPharmacies,
    fetchNearbyPharmacies,
  } = usePharmacyStore();

  const { isSearchOpen, closeSearch, openSearch } = useUIStore();

  const [mapCenter, setMapCenter] = useState({ lat: 9.0222, lng: 38.7468 });
  // ✅ REMOVED: const [searchQuery, setSearchQuery] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);
const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    fetchPharmacies({ isActive: true });
  }, [fetchPharmacies]);

  const handleSearch = (query: string) => {
    fetchPharmacies({ search: query, isActive: true });
    closeSearch();
  };

  const handleNearby = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter({ lat: latitude, lng: longitude });
          fetchNearbyPharmacies(latitude, longitude);
          closeSearch();
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const searchByArea = async (areaName: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(areaName)}&limit=1`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        setMapCenter({ lat: parseFloat(lat), lng: parseFloat(lon) });
        fetchNearbyPharmacies(parseFloat(lat), parseFloat(lon));
        closeSearch();
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Failed to search area. Please try again.');
    }
  };

  const handlePharmacyClick = (pharmacy: Pharmacy) => {
    if (pharmacy.latitude && pharmacy.longitude) {
      setMapCenter({ lat: pharmacy.latitude, lng: pharmacy.longitude });
      setSelectedPharmacy(pharmacy);
      setIsListOpen(false);
    }
  };

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden">
      {/* Full‑screen map */}
      <div className="absolute inset-0">
        <PharmacyMap
          pharmacies={pharmacies}
          center={mapCenter}
          zoom={13}
          selectedPharmacy={selectedPharmacy}
          ref={mapRef}
        />
      </div>

      {/* ===== OVERLAYS ===== */}

      {/* 1. Desktop Search Bar */}
      <div className="hidden md:block absolute top-4 left-0 right-0 px-4 z-20 pointer-events-none">
        <div className="max-w-6xl mx-auto pointer-events-auto">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg p-4 border border-white/30">
            <PharmacySearchBar
              onSearch={handleSearch}
              onNearby={handleNearby}
              onAreaSearch={searchByArea}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* 2. Mobile Search Icon (top right) */}
      <div className="md:hidden absolute top-4 right-4 z-20">
        <button
          onClick={openSearch}
          className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg border border-white/30"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      {/* 3. Floating List Toggle Button (bottom right) */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          onClick={() => setIsListOpen(!isListOpen)}
          className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors"
        >
          {isListOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* 4. Pharmacy List Overlay */}
      {isListOpen && (
        <>
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30"
            onClick={() => setIsListOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md rounded-t-3xl shadow-2xl z-40 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-black">
                Pharmacies ({pharmacies.length})
              </h2>
              <button
                onClick={() => setIsListOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 pb-4 pt-2">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <LoadingSpinner />
                </div>
              ) : pharmacies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No pharmacies found.</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or location.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 pb-8">
                  {pharmacies.map((pharmacy) => (
                    <div
                      key={pharmacy._id}
                      onClick={() => handlePharmacyClick(pharmacy)}
                      className="cursor-pointer"
                    >
                      <PharmacyCard pharmacy={pharmacy} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* 5. Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-20 md:hidden">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Search Pharmacies</h3>
              <button onClick={closeSearch} className="text-gray-500 text-2xl">×</button>
            </div>
            <PharmacySearchBar
              onSearch={handleSearch}
              onNearby={handleNearby}
              onAreaSearch={searchByArea}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};