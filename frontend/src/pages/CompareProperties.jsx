import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCompare, clearCompareList } from '../redux/propertySlice';
import { Trash2, X, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const CompareProperties = () => {
  const dispatch = useDispatch();
  const { compareList } = useSelector((state) => state.properties);

  const amenitiesKeys = [
    { key: 'parking', label: 'Parking Space' },
    { key: 'swimmingPool', label: 'Swimming Pool' },
    { key: 'garden', label: 'Garden / Lawn' },
    { key: 'gym', label: 'Gymnasium' },
    { key: 'electricityBackup', label: 'Power Backup' },
    { key: 'waterSupply', label: 'Water Supply' },
    { key: 'gas', label: 'Sui Gas' },
    { key: 'internet', label: 'Broadband Internet' },
    { key: 'security', label: '24/7 Security' }
  ];

  if (compareList.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold dark:text-white">Comparison List is Empty</h2>
        <p className="text-xs text-slate-400 mt-2">
          Select and add up to 3 listings from the listings page to compare them side by side.
        </p>
        <div className="pt-6">
          <Link to="/properties" className="rounded-xl bg-primary-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-primary-700 transition">
            Explore Properties
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex justify-between items-center border-b pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Compare Listings</h1>
          <p className="text-xs text-slate-500 mt-1">Comparing {compareList.length} properties side by side</p>
        </div>
        <button
          onClick={() => dispatch(clearCompareList())}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:text-red-400 dark:hover:bg-red-950/20"
        >
          <Trash2 className="h-4 w-4" />
          Clear Comparison
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] border-collapse bg-white rounded-2xl overflow-hidden shadow dark:bg-slate-900">
          <thead>
            <tr className="border-b dark:border-slate-800">
              <th className="w-1/4 p-4 text-left text-xs font-bold uppercase tracking-wider text-slate-400">Spec Matrix</th>
              {compareList.map((p) => (
                <th key={p._id} className="w-1/4 p-4 text-left font-sans text-xs relative group border-l dark:border-slate-800">
                  <button
                    onClick={() => dispatch(removeFromCompare(p._id))}
                    className="absolute right-2 top-2 rounded-full p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <img src={p.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'} alt="preview" className="h-32 w-full object-cover rounded-lg mb-2" />
                  <Link to={`/properties/${p._id}`} className="font-bold text-slate-800 hover:underline dark:text-slate-100 line-clamp-1">
                    {p.title}
                  </Link>
                  <span className="text-[10px] text-primary-600 dark:text-primary-400 font-semibold">{p.propertyType}</span>
                </th>
              ))}
              {/* Fill remaining empty columns if comparing less than 3 */}
              {compareList.length < 3 && 
                Array.from({ length: 3 - compareList.length }).map((_, idx) => (
                  <th key={idx} className="w-1/4 p-4 text-center text-xs font-medium text-slate-300 border-l dark:border-slate-800">
                    Add another listing to compare
                  </th>
                ))
              }
            </tr>
          </thead>
          
          <tbody className="text-xs font-semibold text-slate-600 dark:text-slate-300 divide-y divide-slate-100 dark:divide-slate-800">
            {/* Price */}
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-900/50 font-bold">Asking Price</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4 border-l dark:border-slate-800 font-bold text-slate-900 dark:text-white">
                  Rs. {new Intl.NumberFormat().format(p.price)} {p.purpose === 'rent' ? '/mo' : ''}
                </td>
              ))}
              {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l dark:border-slate-800"></td>)}
            </tr>

            {/* City */}
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-900/50 font-bold">City Location</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4 border-l dark:border-slate-800 capitalize">
                  {p.city}
                </td>
              ))}
              {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l dark:border-slate-800"></td>)}
            </tr>

            {/* Address */}
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-900/50 font-bold">Full Address</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4 border-l dark:border-slate-800 text-xs">
                  {p.address}
                </td>
              ))}
              {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l dark:border-slate-800"></td>)}
            </tr>

            {/* Bedrooms */}
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-900/50 font-bold">Bedrooms</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4 border-l dark:border-slate-800 font-bold">
                  {p.bedrooms} Beds
                </td>
              ))}
              {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l dark:border-slate-800"></td>)}
            </tr>

            {/* Bathrooms */}
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-900/50 font-bold">Bathrooms</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4 border-l dark:border-slate-800 font-bold">
                  {p.bathrooms} Baths
                </td>
              ))}
              {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l dark:border-slate-800"></td>)}
            </tr>

            {/* Area Size */}
            <tr>
              <td className="p-4 bg-slate-50/50 dark:bg-slate-900/50 font-bold">Area Size</td>
              {compareList.map((p) => (
                <td key={p._id} className="p-4 border-l dark:border-slate-800">
                  {p.areaSize}
                </td>
              ))}
              {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l dark:border-slate-800"></td>)}
            </tr>

            {/* Amenities Checklist */}
            {amenitiesKeys.map((amenity) => (
              <tr key={amenity.key}>
                <td className="p-4 bg-slate-50/50 dark:bg-slate-900/50 font-bold text-xs">{amenity.label}</td>
                {compareList.map((p) => {
                  const hasAmenity = p.amenities?.[amenity.key];
                  return (
                    <td key={p._id} className="p-4 border-l dark:border-slate-800">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                        hasAmenity ? 'bg-green-100 text-green-700 dark:bg-green-950/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/20 dark:text-red-400'
                      }`}>
                        {hasAmenity ? 'Available' : 'Not Available'}
                      </span>
                    </td>
                  );
                })}
                {compareList.length < 3 && Array.from({ length: 3 - compareList.length }).map((_, idx) => <td key={idx} className="p-4 border-l dark:border-slate-800"></td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompareProperties;
