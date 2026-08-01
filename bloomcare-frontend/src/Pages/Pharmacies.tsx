// src/Pages/Pharmacies.tsx
import React, { useEffect, useState, useRef } from 'react';
import { usePharmacyStore } from '../store/pharmacyStore';
import { useUIStore } from '../store/uiStore';
import { useAuthStore } from '../store/authStore';
import { useLocation } from 'react-router-dom';
import { PharmacyCard } from '../components/pharmacy/PharmacyCard';
import { PharmacySearchBar } from '../components/pharmacy/PharmacySearchBar';
import { PharmacyMap } from '../components/pharmacy/PharmacyMap';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import type { Pharmacy } from '../types/pharmacy.types';
import { FaStore, FaSearch, FaTimes } from 'react-icons/fa';

export const Pharmacies: React.FC = () => {
  const {
    pharmacies,
    isLoading,
    fetchPharmacies,
    fetchNearbyPharmacies,
  } = usePharmacyStore();

  const { isSearchOpen, closeSearch, openSearch } = useUIStore();
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  const [mapCenter, setMapCenter] = useState({ lat: 9.0222, lng: 38.7468 });
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const mapRef = useRef<any>(null);

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

  // Check if we're on a dashboard route
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  // Dynamic height based on authentication and route
  const getPageHeight = () => {
    if (isDashboardRoute) {
      return 'h-full min-h-screen md:min-h-full';
    }
    return isAuthenticated ? 'h-screen' : 'h-[calc(100vh-64px)]';
  };

  return (
    <div className={`relative ${getPageHeight()} w-full overflow-hidden`}>
      <div className="absolute inset-0">
        <PharmacyMap
          pharmacies={pharmacies}
          center={mapCenter}
          zoom={13}
          selectedPharmacy={selectedPharmacy}
          onPharmacySelect={handlePharmacyClick}
          ref={mapRef}
        />
      </div>

      {/* Desktop Search Bar - Only visible on desktop */}
      <div className={`hidden md:block absolute ${isDashboardRoute ? 'top-6' : 'top-4'} left-4 z-40 pointer-events-none`}>
        <div className="pointer-events-auto">
          <div className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-2 border border-white/30 w-[600px]">
            <PharmacySearchBar
              onSearch={handleSearch}
              onNearby={handleNearby}
              onAreaSearch={searchByArea}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>

      {/* ✅ FIXED: Mobile Search Icon - Positioned at bottom-left, just above the list toggle button */}
      <div className="md:hidden absolute bottom-24 left-4 z-50">
        <button
          onClick={openSearch}
          className="bg-white text-gray-700 shadow-xl p-3.5 rounded-full border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all duration-200 flex items-center justify-center cursor-pointer"
          aria-label="Search pharmacies"
        >
          <FaSearch className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Floating List Toggle Button - Moved up to be above the hamburger */}
      <div className="absolute bottom-32 right-6 z-40">
        <button
          onClick={() => setIsListOpen(!isListOpen)}
          className="bg-[#22c55e] text-white p-4 rounded-full shadow-lg hover:bg-[#16a34a] active:scale-95 transition-all cursor-pointer flex items-center justify-center"
          aria-label="Toggle pharmacy list"
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

      {/* Pharmacy List Overlay */}
      {isListOpen && (
        <>
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setIsListOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md rounded-t-3xl shadow-2xl z-50 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <FaStore className="w-5 h-5 text-[#22c55e]" />
                Pharmacies ({pharmacies.length})
              </h2>
              <button
                onClick={() => setIsListOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-2 py-1"
                aria-label="Close list"
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

      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-start justify-center p-4 pt-20 md:hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-black">Search Pharmacies</h3>
              <button 
                onClick={closeSearch} 
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                aria-label="Close search"
              >
                <FaTimes className="w-5 h-5 text-gray-500" />
              </button>
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