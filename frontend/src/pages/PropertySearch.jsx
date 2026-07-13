import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProperties } from '../redux/propertySlice';
import PropertyCard from '../components/PropertyCard';
import { 
  SlidersHorizontal, MapPin, Grid, List as ListIcon, Map as MapIcon, RotateCcw, Loader2, Info
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icon asset paths inside Vite builds
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Sub-component to center map when coords change
const ChangeMapView = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
};

// Sub-component to detect map click events and trigger parent searches
const MapEvents = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const PropertySearch = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { properties, loading } = useSelector((state) => state.properties);

  // Layout View State: 'grid', 'list', 'map'
  const [viewMode, setViewMode] = useState('grid');
  
  // Filter States
  const [purpose, setPurpose] = useState(searchParams.get('purpose') || 'sale');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [propertyType, setPropertyType] = useState(searchParams.get('propertyType') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [bedrooms, setBedrooms] = useState(searchParams.get('bedrooms') || '');
  const [bathrooms, setBathrooms] = useState(searchParams.get('bathrooms') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  
  // Amenities toggles
  const [amenities, setAmenities] = useState({
    parking: searchParams.get('parking') === 'true',
    swimmingPool: searchParams.get('swimmingPool') === 'true',
    garden: searchParams.get('garden') === 'true',
    gym: searchParams.get('gym') === 'true',
    security: searchParams.get('security') === 'true',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Coordinates from GPS search
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const radiusParam = searchParams.get('radius');

  useEffect(() => {
    // Compile filters
    const filters = {
      purpose,
      city,
      propertyType,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      sort,
      lat: latParam,
      lng: lngParam,
      radius: radiusParam,
    };
    
    // Add amenities
    Object.entries(amenities).forEach(([key, val]) => {
      if (val) filters[key] = 'true';
    });

    dispatch(fetchProperties(filters));
  }, [searchParams, dispatch, latParam, lngParam, radiusParam]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const params = {};
    if (purpose) params.purpose = purpose;
    if (city) params.city = city;
    if (propertyType) params.propertyType = propertyType;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (bedrooms) params.bedrooms = bedrooms;
    if (bathrooms) params.bathrooms = bathrooms;
    if (sort) params.sort = sort;
    
    // Coordinates
    if (latParam) params.lat = latParam;
    if (lngParam) params.lng = lngParam;
    if (radiusParam) params.radius = radiusParam;

    Object.entries(amenities).forEach(([key, val]) => {
      if (val) params[key] = 'true';
    });

    setSearchParams(params);
  };

  const handleReset = () => {
    setCity('');
    setPropertyType('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setSort('newest');
    setAmenities({
      parking: false,
      swimmingPool: false,
      garden: false,
      gym: false,
      security: false,
    });
    setSearchParams({ purpose });
  };

  const handleMapClick = (lat, lng) => {
    const currentParams = Object.fromEntries(searchParams);
    currentParams.lat = lat;
    currentParams.lng = lng;
    currentParams.radius = radiusParam || 5;
    setSearchParams(currentParams);
  };

  // Map settings - center around query coords, or first coordinate found, or Lahore
  const firstPropCoords = properties.find(p => p.location?.coordinates)?.location?.coordinates;
  const mapCenter = latParam && lngParam 
    ? [parseFloat(latParam), parseFloat(lngParam)] 
    : firstPropCoords && firstPropCoords.length === 2
      ? [firstPropCoords[1], firstPropCoords[0]]
      : [31.5204, 74.3587]; // Default Lahore center

  return (
    <div className="mx-auto max-w-8xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 mb-6 dark:border-slate-800 gap-4">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Properties Search Engine</h1>
          <p className="text-xs text-slate-500 mt-1">
            {latParam ? `Showing listings within ${radiusParam || 5}km of current location` : `Explore verified options across Pakistan`}
          </p>
        </div>

        {/* View Mode controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
          <button
            onClick={() => setViewMode('grid')}
            className={`rounded-lg p-2 transition text-slate-600 dark:text-slate-500 ${viewMode === 'grid' ? '!bg-white dark:!bg-slate-900 !text-primary-600' : ''}`}
            title="Grid View"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-lg p-2 transition text-slate-600 dark:text-slate-500 ${viewMode === 'list' ? '!bg-white dark:!bg-slate-900 !text-primary-600' : ''}`}
            title="List View"
          >
            <ListIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`rounded-lg p-2 transition text-slate-600 dark:text-slate-500 ${viewMode === 'map' ? '!bg-white dark:!bg-slate-900 !text-primary-600' : ''}`}
            title="Full Map View"
          >
            <MapIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 border border-slate-100 bg-white rounded-2xl p-4 dark:border-slate-800 dark:bg-slate-900 shadow-md space-y-4">
          <div className="flex justify-between items-center border-b pb-2 mb-2 dark:border-slate-800">
            <span className="text-sm font-bold flex items-center gap-1 dark:text-white">
              <SlidersHorizontal className="h-4 w-4 text-primary-500" />
              <span>Filters Options</span>
            </span>
            <button onClick={handleReset} className="text-[10px] font-semibold text-slate-500 hover:text-red-500 flex items-center gap-1 transition">
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          </div>

          {/* Purpose Buy/Rent */}
          <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-lg dark:bg-slate-800">
            <button
              onClick={() => { setPurpose('sale'); setSearchParams({ ...Object.fromEntries(searchParams), purpose: 'sale' }); }}
              className={`rounded-md py-1 text-xs font-bold transition ${purpose === 'sale' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-500'}`}
            >
              Buy
            </button>
            <button
              onClick={() => { setPurpose('rent'); setSearchParams({ ...Object.fromEntries(searchParams), purpose: 'rent' }); }}
              className={`rounded-md py-1 text-xs font-bold transition ${purpose === 'rent' ? 'bg-primary-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-500'}`}
            >
              Rent
            </button>
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4">
            {/* City */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">City</label>
              <input
                type="text"
                placeholder="e.g. Lahore"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:focus:bg-slate-900"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:focus:bg-slate-900"
              >
                <option value="">Any Type</option>
                {['House', 'Apartment', 'Villa', 'Flat', 'Commercial Building', 'Office', 'Shop', 'Plot', 'Farm House'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price Budget (Rs)</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Sorting */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Sort Listings</label>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="lowestPrice">Price: Low to High</option>
                <option value="highestPrice">Price: High to Low</option>
                <option value="mostViewed">Most Popular</option>
              </select>
            </div>

            {/* Advanced Trigger */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-primary-600 hover:underline flex items-center dark:text-primary-400"
            >
              {showAdvanced ? '- Hide Amenities' : '+ Show Amenities'}
            </button>

            {showAdvanced && (
              <div className="space-y-3 pt-2 border-t dark:border-slate-800">
                {/* Rooms */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bedrooms</label>
                    <input
                      type="number"
                      placeholder="e.g. 3"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bathrooms</label>
                    <input
                      type="number"
                      placeholder="e.g. 2"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Amenities checkboxes */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Amenities</label>
                  {Object.keys(amenities).map((key) => (
                    <label key={key} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={amenities[key]}
                        onChange={(e) => setAmenities({ ...amenities, [key]: e.target.checked })}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-primary-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-primary-700 transition"
            >
              Apply Filter Parameters
            </button>
          </form>
        </div>

        {/* Listings Display & Leaflet Split */}
        <div className={`lg:col-span-3 grid grid-cols-1 ${viewMode !== 'map' ? 'md:grid-cols-3' : ''} gap-6`}>
          
          {/* List/Grid displays */}
          {viewMode !== 'map' && (
            <div className="md:col-span-2 space-y-6">
              {loading ? (
                <div className="flex flex-col justify-center items-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary-500 mb-4" />
                  <span className="text-sm text-slate-500">Retrieving matched listings...</span>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl dark:border-slate-800 dark:bg-slate-900">
                  <Info className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No properties found</p>
                  <p className="text-xs text-slate-500 mt-1">Try resetting the filters or widening your search radius.</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-6' : 'space-y-4'}>
                  {properties.map((prop) => (
                    <PropertyCard key={prop._id} property={prop} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Interactive Map Section */}
          <div className={`${viewMode === 'map' ? 'md:col-span-3' : 'md:col-span-1'} h-[550px] sticky top-24 rounded-2xl overflow-hidden border shadow-lg dark:border-slate-800 relative`}>
            {/* Click helper overlay */}
            <div className="absolute top-2 left-2 z-[1000] bg-white/95 dark:bg-slate-900/95 backdrop-blur px-2.5 py-1.5 rounded-lg shadow border border-slate-100 dark:border-slate-800">
              <span className="text-[9px] font-bold text-slate-600 dark:text-slate-300">
                💡 Tip: Click anywhere on the map to search nearby
              </span>
            </div>

            <MapContainer center={mapCenter} zoom={12} className="h-full w-full">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              
              <ChangeMapView center={mapCenter} />
              <MapEvents onMapClick={handleMapClick} />

              {/* Current GPS Position Indicator (if coordinates search) */}
              {latParam && lngParam && (
                <Marker position={mapCenter}>
                  <Popup>
                    <span className="text-xs font-bold">Search Center Point</span>
                  </Popup>
                </Marker>
              )}

              {/* Listings Markers */}
              {properties.map((prop) => {
                if (!prop.location?.coordinates) return null;
                const [lng, lat] = prop.location.coordinates;
                return (
                  <Marker key={prop._id} position={[lat, lng]}>
                    <Popup>
                      <div className="p-1 space-y-1">
                        <img src={prop.images?.[0]} alt="preview" className="h-16 w-full object-cover rounded-md" />
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{prop.title}</h4>
                        <p className="text-[10px] font-semibold text-primary-600">Rs. {new Intl.NumberFormat().format(prop.price)}</p>
                        <Link to={`/properties/${prop._id}`} className="block text-[10px] text-center text-white bg-primary-600 py-0.5 rounded hover:bg-primary-700 transition">
                          View details
                        </Link>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PropertySearch;
