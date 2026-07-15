import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Home as HomeIcon, Building2, MapPin, Award, Quote, ArrowRight,
  ShieldCheck, Zap, X, BedDouble, Bath, Square, ChevronRight,
  Store, Briefcase, TreePine, Trees, LayoutGrid
} from 'lucide-react';
import SmartSearchBar from '../components/SmartSearchBar';
import PropertyCard from '../components/PropertyCard';
import { mockPropertiesFallback } from '../redux/propertySlice';
import api from '../utils/api';

/* ── Category colour/icon config ── */
const CATEGORY_CONFIG = {
  House:        { icon: HomeIcon,   bg: 'bg-blue-50 dark:bg-blue-950/40',     text: 'text-blue-600 dark:text-blue-400' },
  Apartment:    { icon: Building2,  bg: 'bg-violet-50 dark:bg-violet-950/40', text: 'text-violet-600 dark:text-violet-400' },
  Villa:        { icon: TreePine,   bg: 'bg-emerald-50 dark:bg-emerald-950/40',text: 'text-emerald-600 dark:text-emerald-400' },
  Flat:         { icon: LayoutGrid, bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-600 dark:text-orange-400' },
  Office:       { icon: Briefcase,  bg: 'bg-sky-50 dark:bg-sky-950/40',       text: 'text-sky-600 dark:text-sky-400' },
  Shop:         { icon: Store,      bg: 'bg-rose-50 dark:bg-rose-950/40',     text: 'text-rose-600 dark:text-rose-400' },
  'Farm House': { icon: Trees,      bg: 'bg-green-50 dark:bg-green-950/40',   text: 'text-green-600 dark:text-green-400' },
  Plot:         { icon: MapPin,     bg: 'bg-amber-50 dark:bg-amber-950/40',   text: 'text-amber-600 dark:text-amber-400' },
};

/* ── Compact card inside modal ── */
const MiniCard = ({ property }) => {
  const img = property.images?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=60';
  const price = new Intl.NumberFormat('en-US').format(property.price);
  return (
    <Link to={`/properties/${property._id}`}
      className="group flex gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 hover:border-primary-400 hover:shadow-md transition-all">
      <img src={img} alt={property.title} loading="lazy"
        className="h-20 w-24 shrink-0 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300" />
      <div className="flex flex-col justify-between min-w-0">
        <div>
          <p className="line-clamp-1 text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors">{property.title}</p>
          <p className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-500 truncate">
            <MapPin className="h-3 w-3 shrink-0" />{property.address}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs font-extrabold text-primary-600 dark:text-primary-400">
            Rs. {price}{property.purpose === 'rent' ? '/mo' : ''}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-slate-500">
            {property.bedrooms > 0 && <span className="flex items-center gap-0.5"><BedDouble className="h-3 w-3" />{property.bedrooms}</span>}
            {property.bathrooms > 0 && <span className="flex items-center gap-0.5"><Bath className="h-3 w-3" />{property.bathrooms}</span>}
            <span className="flex items-center gap-0.5"><Square className="h-3 w-3" />{property.areaSize}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

/* ── Category Modal/Drawer ── */
const CategoryModal = ({ category, onClose }) => {
  const navigate = useNavigate();
  if (!category) return null;
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG['House'];
  const Icon = cfg.icon;
  const listings = mockPropertiesFallback.filter(p => p.propertyType === category).slice(0, 6);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 shadow-2xl flex flex-col"
        style={{ animation: 'slideUpModal 0.25s ease-out' }} onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white dark:bg-slate-900 z-10 flex items-center justify-between px-5 pt-5 pb-4 border-b dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${cfg.bg} ${cfg.text}`}><Icon className="h-5 w-5" /></div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{category} Listings</h3>
              <p className="text-[10px] text-slate-500">{listings.length} demo {listings.length === 1 ? 'property' : 'properties'} available</p>
            </div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-600 dark:text-slate-400">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 flex-1">
          {listings.length === 0 ? (
            <div className="py-12 text-center"><p className="text-sm text-slate-500">No demo listings for {category} yet.</p></div>
          ) : (
            <div className="grid grid-cols-1 gap-3">{listings.map(prop => <MiniCard key={prop._id} property={prop} />)}</div>
          )}
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-slate-900 px-5 py-4 border-t dark:border-slate-800">
          <button onClick={() => { onClose(); navigate(`/properties?propertyType=${encodeURIComponent(category)}`); }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 text-sm font-bold text-white shadow-md hover:bg-primary-700 active:scale-95 transition">
            Browse All {category} Properties <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};



const Home = () => {
  // Instantly show featured mock data — no loading spinner
  const [featuredProperties, setFeaturedProperties] = useState(
    mockPropertiesFallback.filter(p => p.isFeatured).slice(0, 4)
  );
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);

  // Load real API data silently in background
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [propRes, blogRes] = await Promise.all([
          api.get('/properties?sort=featured'),
          api.get('/blogs'),
        ]);
        if (cancelled) return;
        if (propRes.data.properties?.length > 0) setFeaturedProperties(propRes.data.properties.slice(0, 4));
        if (blogRes.data.blogs?.length > 0) setLatestBlogs(blogRes.data.blogs.slice(0, 3));
      } catch { /* Mock data stays */ }
    })();
    return () => { cancelled = true; };
  }, []);

  const categories = ['House', 'Apartment', 'Villa', 'Flat', 'Office', 'Shop', 'Farm House', 'Plot'].map(name => ({
    name,
    count: mockPropertiesFallback.filter(p => p.propertyType === name).length,
  }));

  const popularCities = [
    { name: 'Lahore',     image: 'https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=400&q=70' },
    { name: 'Karachi',    image: 'https://images.unsplash.com/photo-1566837497312-7be4743b5a04?auto=format&fit=crop&w=400&q=70' },
    { name: 'Islamabad',  image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=400&q=70' },
    { name: 'Rawalpindi', image: 'https://images.unsplash.com/photo-1598977123418-45f04b61b49e?auto=format&fit=crop&w=400&q=70' },
  ].map(c => ({ ...c, listings: mockPropertiesFallback.filter(p => p.city === c.name).length + '+' }));

  const reviews = [
    { name: 'Muhammad Ahmed', role: 'Property Agent', content: 'PropertyFinder has completely transformed our business operations. The site visit scheduler works incredibly well and clients love the interface!', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=60' },
    { name: 'Ayesha Khan', role: 'Home Buyer', content: 'I found my dream house in Gulberg Lahore in under a week. The geolocation radius search made it incredibly convenient to discover nearby listings.', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=60' },
  ];

  return (
    <>
      {activeCategory && <CategoryModal category={activeCategory} onClose={() => setActiveCategory(null)} />}

      <div className="space-y-16 pb-16">

        {/* ── Hero ── */}
        <section
          className="relative flex min-h-[520px] flex-col items-center justify-center bg-slate-900 bg-cover bg-center px-4 py-20 text-center text-white"
          style={{ backgroundImage: `linear-gradient(to bottom,rgba(15,23,42,.82),rgba(15,23,42,.97)),url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=70')` }}
        >
          <div className="mx-auto max-w-3xl space-y-4 mb-8">
            <span className="inline-block rounded-full bg-primary-600/30 border border-primary-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-400">
              Smart Real Estate Platform
            </span>
            <h1 className="font-sans text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Find Your Next Perfect <span className="text-primary-500">Address</span>
            </h1>
            <p className="text-base text-slate-300">
              Search Houses, Apartments, Villas, Offices for rent or sale. Real-time booking, chat, and map search at your fingertips.
            </p>
          </div>
          <SmartSearchBar />
        </section>

        {/* ── Browse by Property Type ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold dark:text-white sm:text-3xl">Browse by Property Type</h2>
            <p className="text-xs text-slate-500 mt-2">Click any category to instantly see matching listings.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {categories.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat.name] || CATEGORY_CONFIG['House'];
              const Icon = cfg.icon;
              return (
                <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
                  className="group flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-primary-400 dark:border-slate-800 dark:bg-slate-900 transition-all active:scale-95 cursor-pointer">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${cfg.bg} ${cfg.text} mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 text-center leading-tight">{cat.name}</span>
                  <span className="text-[10px] text-slate-500 mt-1">{cat.count} Listings</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Featured Listings ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold dark:text-white sm:text-3xl">Featured Listings</h2>
              <p className="text-xs text-slate-500 mt-2">Hand-picked residential and commercial listings.</p>
            </div>
            <Link to="/properties" className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProperties.map((prop) => <PropertyCard key={prop._id} property={prop} />)}
          </div>
        </section>

        {/* ── Popular Cities ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold dark:text-white sm:text-3xl">Explore Hot Locations</h2>
            <p className="text-xs text-slate-500 mt-2">Invest in real estate across major metropolitan hubs.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {popularCities.map((city) => (
              <Link key={city.name} to={`/properties?city=${city.name}`} className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-md">
                <img src={city.image} alt={city.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                  <h3 className="font-bold text-lg">{city.name}</h3>
                  <p className="text-xs text-slate-300">{city.listings} Listings</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Why Choose Us ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 py-12 rounded-3xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"><ShieldCheck className="h-6 w-6" /></div>
              <div><h3 className="font-bold text-base dark:text-white">Verified Properties</h3><p className="text-xs text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">All listings undergo rigorous administrative review. We inspect documents and coordinates accuracy.</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400"><Zap className="h-6 w-6" /></div>
              <div><h3 className="font-bold text-base dark:text-white">Instant Communication</h3><p className="text-xs text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">Connect directly with owners via real-time chat, phone calls, or Book Visit appointment requests.</p></div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"><Award className="h-6 w-6" /></div>
              <div><h3 className="font-bold text-base dark:text-white">Market Vetted Advisors</h3><p className="text-xs text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">Unlock top deals with verified agencies and top developers featured on our platform.</p></div>
            </div>
          </div>
        </section>

        {/* ── Reviews ── */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold dark:text-white sm:text-3xl">What Our Users Say</h2>
            <p className="text-xs text-slate-500 mt-2">Real testimonials from happy clients and agencies.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {reviews.map((rev, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
                <div>
                  <Quote className="h-8 w-8 text-primary-500/20 mb-4" />
                  <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed">"{rev.content}"</p>
                </div>
                <div className="flex items-center gap-3 mt-6 border-t pt-4 dark:border-slate-800">
                  <img src={rev.avatar} alt={rev.name} loading="lazy" className="h-10 w-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{rev.name}</h4>
                    <p className="text-[10px] text-slate-500">{rev.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Blogs (API only) ── */}
        {latestBlogs.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-2xl font-bold dark:text-white sm:text-3xl">Real Estate Advisory &amp; News</h2>
                <p className="text-xs text-slate-500 mt-2">Latest trends, tax laws, and guide tutorials.</p>
              </div>
              <Link to="/blogs" className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                Read all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestBlogs.map((blog) => (
                <Link key={blog._id} to={`/blogs/${blog.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
                  <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                    <img src={blog.image} alt={blog.title} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105 duration-500" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{blog.category}</span>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mt-1 group-hover:underline">{blog.title}</h3>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-4">Published on {new Date(blog.createdAt).toLocaleDateString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <style>{`
        @keyframes slideUpModal {
          from { opacity: 0; transform: translateY(50px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

export default Home;

