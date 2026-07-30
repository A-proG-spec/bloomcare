import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { FaSearch, FaMapMarkerAlt, FaGlobe } from 'react-icons/fa';

interface PharmacySearchBarProps {
  onSearch: (query: string) => void;
  onNearby: () => void;
  onAreaSearch?: (area: string) => void;
  isLoading?: boolean;
}

export const PharmacySearchBar: React.FC<PharmacySearchBarProps> = ({
  onSearch,
  onNearby,
  onAreaSearch,
  isLoading,
}) => {
  const [query, setQuery] = useState('');
  const [areaQuery, setAreaQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleAreaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAreaSearch && areaQuery.trim()) {
      onAreaSearch(areaQuery.trim());
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Search by name/address */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="flex-1">
          <Input
            placeholder="Search pharmacies by name or address..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<FaSearch className="w-4 h-4" />}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" isLoading={isLoading} icon={<FaSearch className="w-4 h-4" />}>
            Search
          </Button>
          <Button type="button" variant="outline" onClick={onNearby} icon={<FaMapMarkerAlt className="w-4 h-4" />}>
            Nearby
          </Button>
        </div>
      </form>

      {/* Search by area */}
      <form onSubmit={handleAreaSubmit} className="flex flex-col sm:flex-row gap-2 w-full border-t border-gray-200 pt-3">
        <div className="flex-1">
          <Input
            placeholder="Search area (city, region)..."
            value={areaQuery}
            onChange={(e) => setAreaQuery(e.target.value)}
            icon={<FaGlobe className="w-4 h-4" />}
          />
        </div>
        <Button type="submit" variant="outline" size="sm" icon={<FaSearch className="w-3 h-3" />}>
          Area
        </Button>
      </form>
    </div>
  );
};