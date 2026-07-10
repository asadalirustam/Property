import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Scale, MapPin, BedDouble, Bath, Square } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { toggleFavorite, addToCompare, removeFromCompare } from '../redux/propertySlice';
import { motion } from 'framer-motion';

const PropertyCard = ({ property }) => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { compareList } = useSelector((state) => state.properties);

  const isFavorite = user?.favorites?.includes(property._id) || false;
  const isCompared = compareList.some((p) => p._id === property._id);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return alert('Please sign in to save favorites');
    dispatch(toggleFavorite(property._id));
  };

  const handleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      dispatch(removeFromCompare(property._id));
    } else {
      dispatch(addToCompare(property));
    }
  };

  const formatPrice = (price, purpose) => {
    const formatted = new Intl.NumberFormat('en-US').format(price);
    return purpose === 'rent' ? `Rs. ${formatted}/mo` : `Rs. ${formatted}`;
  };

  const mainImage = property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=600&q=80';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      {/* Property Image & Badges */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={mainImage}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Purpose Badge */}
        <div className="absolute left-3 top-3 flex gap-2">
          <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${
            property.purpose === 'sale' ? 'bg-indigo-600' : 'bg-green-600'
          }`}>
            For {property.purpose}
          </span>
          {property.isFeatured && (
            <span className="rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Favorite & Compare Buttons */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
          <button
            onClick={handleFavorite}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md backdrop-blur-sm transition-colors hover:text-red-500 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:text-red-400 ${
              isFavorite ? '!text-red-500' : ''
            }`}
            aria-label="Add to favorites"
          >
            <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          
          <button
            onClick={handleCompare}
            className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-slate-600 shadow-md backdrop-blur-sm transition-colors hover:text-primary-500 dark:bg-slate-800/90 dark:text-slate-300 dark:hover:text-primary-400 ${
              isCompared ? '!text-primary-500 !bg-primary-50 dark:!bg-primary-950/40' : ''
            }`}
            aria-label="Compare property"
          >
            <Scale className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Property Details */}
      <div className="flex flex-1 flex-col p-4">
        {/* Price & Type */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">
            {property.propertyType}
          </span>
          <span className="text-base font-bold text-slate-900 dark:text-white">
            {formatPrice(property.price, property.purpose)}
          </span>
        </div>

        {/* Title */}
        <Link to={`/properties/${property._id}`} className="hover:underline">
          <h3 className="line-clamp-1 text-sm font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {property.title}
          </h3>
        </Link>

        {/* Address */}
        <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-500">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{property.address}, {property.city}</span>
        </div>

        {/* Specs Table */}
        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-500">
          <div className="flex items-center gap-1">
            <BedDouble className="h-3.5 w-3.5 text-slate-500" />
            <span>{property.bedrooms} Bed</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5 text-slate-500" />
            <span>{property.bathrooms} Bath</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="h-3.5 w-3.5 text-slate-500" />
            <span>{property.areaSize}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;
