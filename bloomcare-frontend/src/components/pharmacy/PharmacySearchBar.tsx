// bloomcare-frontend/src/components/pharmacy/PharmacySearchBar.tsx
import React, { useState } from 'react';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

interface PharmacySearchBarProps {
  onSearch: (query: string) => void;
  onNearby: () => void;
  onAreaSearch?: (area: string) => void;
  isLoading?: boolean;
}

export const PharmacySearchBar: React.FC<PharmacySearchBarProps> = ({
  onSearch,
  onNearby,
  isLoading,
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="flex-1">
          <Input
            placeholder="Search pharmacies..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<FaSearch className="w-3 h-3" />}
            className="text-sm py-1.5 px-3"
          />
        </div>
        <div className="flex gap-1.5">
          <Button type="submit" size="sm" isLoading={isLoading} icon={<FaSearch className="w-3 h-3" />}>
            Search
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={onNearby} icon={<FaMapMarkerAlt className="w-3 h-3" />}>
            Nearby
          </Button>
        </div>
      </form>
    </div>
  );
};