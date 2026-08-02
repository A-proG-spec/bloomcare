import React, { useEffect, useState, useRef } from 'react';
import { usePharmacyStore } from '../store/pharmacyStore';
import { useUIStore } from '../store/uiStore';
import { PharmacyCard } from '../components/pharmacy/PharmacyCard';
import { PharmacySearchBar } from '../components/pharmacy/PharmacySearchBar';
import { PharmacyMap } from '../components/pharmacy/PharmacyMap';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import type { Pharmacy } from '../types/pharmacy.types';
import { FaMapMarkedAlt, FaList, FaSearch, FaTimes, FaChevronUp, FaChevronDown } from 'react-icons/fa';

export const Pharmacies: React.FC = () => {
  const {
    pharmacies,
    isLoading,
    fetchPharmacies,
    fetchNearbyPharmacies,
  } = usePharmacyStore();

  const { isSearchOpen, closeSearch, openSearch } = useUIStore();

  const [mapCenter, setMapCenter] = useState({ lat: 9.0222, lng: 38.7468 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  const [isListOpen, setIsListOpen] = useState(true); // ✅ Default to list view on mobile
  const [isMapView, setIsMapView] = useState(false); // ✅ Toggle between list and map
  const mapRef = useRef<MapContainer>(null);

  useEffect(() => {
    fetchPharmacies({ isActive: true });
  }, [fetchPharmacies]);

  // ✅ Check screen size for responsive view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // On mobile, default to list view
        setIsMapView(false);
        setIsListOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
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
          // ✅ Switch to map view on mobile when using nearby
          if (window.innerWidth < 768) {
            setIsMapView(true);
            setIsListOpen(false);
          }
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
        if (window.innerWidth < 768) {
          setIsMapView(true);
          setIsListOpen(false);
        }
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
      // ✅ On mobile, switch to map view when selecting a pharmacy
      if (window.innerWidth < 768) {
        setIsMapView(true);
        setIsListOpen(false);
      }
    }
  };

  const toggleView = () => {
    setIsMapView(!isMapView);
    if (!isMapView) {
      // Switching to map view - close list
      setIsListOpen(false);
    } else {
      // Switching to list view - open list
      setIsListOpen(true);
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gray-50">
      {/* ✅ Mobile Search Bar - Fixed at top */}
      <div className="md:hidden absolute top-0 left-0 right-0 z-20 px-3 pt-3 pb-2 bg-gradient-to-b from-gray-50 to-transparent">
        <div className="flex items-center gap-2">
          <button
            onClick={openSearch}
            className="flex-1 flex items-center gap-2 bg-white rounded-xl px-4 py-2.5 shadow-md border border-gray-200"
          >
            <FaSearch className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-500">Search pharmacies...</span>
          </button>
          <button
            onClick={toggleView}
            className="bg-white p-2.5 rounded-xl shadow-md border border-gray-200"
          >
            {isMapView ? (
              <FaList className="w-5 h-5 text-[#22c55e]" />
            ) : (
              <FaMapMarkedAlt className="w-5 h-5 text-[#22c55e]" />
            )}
          </button>
        </div>
      </div>

      {/* ✅ Desktop Search Bar - Hidden on mobile */}
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

      {/* ✅ Map Container */}
      <div className={`absolute inset-0 ${isMapView ? 'opacity-100' : 'opacity-0 md:opacity-100'} transition-opacity duration-300`}>
        <PharmacyMap
          pharmacies={pharmacies}
          center={mapCenter}
          zoom={13}
          selectedPharmacy={selectedPharmacy}
          ref={mapRef}
        />
      </div>

      {/* ✅ Mobile: Bottom Sheet List */}
      <div
        className={`md:hidden absolute bottom-0 left-0 right-0 z-30 transition-transform duration-300 ease-in-out ${
          isListOpen ? 'translate-y-0' : 'translate-y-[calc(100%-80px)]'
        }`}
      >
        {/* ✅ Drag Handle */}
        <div
          className="bg-white rounded-t-3xl shadow-lg border border-gray-200"
          onClick={() => setIsListOpen(!isListOpen)}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>
          
          {/* ✅ Header with count and close button */}
          <div className="flex items-center justify-between px-4 pb-2">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-black">
                Pharmacies
              </h2>
              <span className="text-xs bg-[#d1f843] text-black px-2 py-0.5 rounded-full font-medium">
                {pharmacies.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {isListOpen ? 'Pull down to close' : 'Pull up to open'}
              </span>
              <button
                onClick={() => setIsListOpen(!isListOpen)}
                className="text-gray-400 p-1"
              >
                {isListOpen ? (
                  <FaChevronDown className="w-4 h-4" />
                ) : (
                  <FaChevronUp className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Pharmacy List */}
        <div
          className="bg-white rounded-b-2xl overflow-y-auto"
          style={{ maxHeight: '60vh' }}
        >
          {isLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : pharmacies.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaSearch className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">No pharmacies found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
            </div>
          ) : (
            <div className="px-4 pb-4 space-y-3">
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

      {/* ✅ Desktop: Floating List Toggle */}
      <div className="hidden md:block absolute bottom-6 right-6 z-20">
        <button
          onClick={() => setIsListOpen(!isListOpen)}
          className="bg-[#22c55e] text-white p-4 rounded-full shadow-lg hover:bg-[#16a34a] transition-colors"
        >
          {isListOpen ? (
            <FaTimes className="w-6 h-6" />
          ) : (
            <FaList className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* ✅ Desktop: List Overlay */}
      <div
        className={`hidden md:block absolute top-24 right-4 z-20 w-96 transition-all duration-300 ${
          isListOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'
        }`}
      >
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 max-h-[calc(100vh-120px)] flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h2 className="font-semibold text-black">
              Pharmacies ({pharmacies.length})
            </h2>
            <button
              onClick={() => setIsListOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-2">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : pharmacies.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">No pharmacies found</p>
              </div>
            ) : (
              <div className="space-y-2">
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
      </div>

      {/* ✅ Mobile Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 pt-20">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 w-full max-w-md animate-slideUp">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-black flex items-center gap-2">
                <FaSearch className="w-5 h-5 text-[#22c55e]" />
                Search Pharmacies
              </h3>
              <button
                onClick={closeSearch}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <FaTimes className="w-5 h-5" />
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