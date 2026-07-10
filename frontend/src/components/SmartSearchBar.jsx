import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Loader2 } from 'lucide-react';
import useGeolocation from '../hooks/useGeolocation';

const SmartSearchBar = () => {
  const navigate = useNavigate();
  const { loading: geoLoading, getLocation } = useGeolocation();

  const [purpose, setPurpose] = useState('sale'); // sale or rent
  const [city, setCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.append('purpose', purpose);
    if (city) params.append('city', city);
    if (propertyType) params.append('propertyType', propertyType);
    if (maxPrice) params.append('maxPrice', maxPrice);

    navigate(`/properties?${params.toString()}`);
  };

  const handleGpsSearch = async () => {
    try {
      const coords = await getLocation();
      if (coords?.lat && coords?.lng) {
        navigate(`/properties?lat=${coords.lat}&lng=${coords.lng}&radius=5&purpose=${purpose}`);
      }
    } catch (err) {
      alert(err || 'Failed to detect GPS location. Ensure location services are active.');
    }
  };

  const propertyTypes = ['House', 'Apartment', 'Villa', 'Flat', 'Commercial Building', 'Office', 'Shop', 'Plot', 'Farm House'];

  return (
    <div className="w-full max-w-4xl rounded-2xl bg-white p-4 shadow-xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800 transition-all animate-slide-up">
      {/* Purpose Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-3 mb-4 dark:border-slate-800">
        <button
          onClick={() => setPurpose('sale')}
          className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
            purpose === 'sale'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setPurpose('rent')}
          className={`rounded-lg px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
            purpose === 'rent'
              ? 'bg-primary-600 text-white'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          Rent
        </button>
      </div>

      {/* Main Search inputs */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        {/* City Input */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Location / City</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Lahore, Karachi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
            />
          </div>
        </div>

        {/* Property Type Selector */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Property Type</label>
          <select
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
          >
            <option value="">Any Type</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Max Price */}
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Max Budget (Rs)</label>
          <input
            type="number"
            placeholder="e.g. 5,000,000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 dark:focus:bg-slate-900"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* GPS Detector */}
          <button
            type="button"
            onClick={handleGpsSearch}
            disabled={geoLoading}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-600 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            title="Search near my current location"
          >
            {geoLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <MapPin className="h-4.5 w-4.5" />}
          </button>

          {/* Search trigger */}
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 p-2.5 text-xs font-semibold text-white shadow-md hover:bg-primary-700 transition"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SmartSearchBar;
