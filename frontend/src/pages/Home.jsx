import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Home as HomeIcon, Building2, MapPin, Award, CheckCircle, Quote, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import SmartSearchBar from '../components/SmartSearchBar';
import PropertyCard from '../components/PropertyCard';
import api from '../utils/api';

const Home = () => {
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const propRes = await api.get('/properties?sort=featured');
        setFeaturedProperties(propRes.data.properties.slice(0, 4));

        const blogRes = await api.get('/blogs');
        setLatestBlogs(blogRes.data.blogs.slice(0, 3));
      } catch (err) {
        console.error('Home page loader error:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const categories = [
    { name: 'House', icon: HomeIcon, count: '12 Listings' },
    { name: 'Apartment', icon: Building2, count: '32 Listings' },
    { name: 'Villa', icon: Building2, count: '8 Listings' },
    { name: 'Flat', icon: Building2, count: '18 Listings' },
    { name: 'Office', icon: Building2, count: '15 Listings' },
    { name: 'Shop', icon: Building2, count: '11 Listings' },
  ];

  const popularCities = [
    { name: 'Lahore', image: 'https://images.unsplash.com/photo-1587135941948-670b381f08ec?auto=format&fit=crop&w=400&q=80', listings: '120+' },
    { name: 'Karachi', image: 'https://images.unsplash.com/photo-1566837497312-7be4743b5a04?auto=format&fit=crop&w=400&q=80', listings: '210+' },
    { name: 'Islamabad', image: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=400&q=80', listings: '95+' },
    { name: 'Rawalpindi', image: 'https://images.unsplash.com/photo-1598977123418-45f04b61b49e?auto=format&fit=crop&w=400&q=80', listings: '45+' }
  ];

  const reviews = [
    {
      name: 'Muhammad Ahmed',
      role: 'Property Agent',
      content: 'PropertyFinder has completely transformed our business operations. The site visit scheduler works incredibly well and clients love the interface!',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80'
    },
    {
      name: 'Ayesha Khan',
      role: 'Home Buyer',
      content: 'I managed to find my dream house in Gulberg Lahore in under a week. Geolocation radius search made it incredibly convenient to discover nearby clinics.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Banner Section */}
      <section className="relative flex min-h-[500px] flex-col items-center justify-center bg-slate-900 bg-cover bg-center px-4 py-20 text-center text-white" style={{ backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.95)), url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80')` }}>
        <div className="mx-auto max-w-3xl space-y-4 mb-8">
          <span className="rounded-full bg-primary-600/35 border border-primary-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary-400">
            Smart Real Estate Platform
          </span>
          <h1 className="font-sans text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Find Your Next Perfect <span className="text-primary-500">Address</span>
          </h1>
          <p className="text-base text-slate-300">
            Search Houses, Apartments, Commercial Buildings for rent or sale. Real-time booking, chat services, and nearby maps details at your fingertips.
          </p>
        </div>

        {/* Smart Search Bar */}
        <SmartSearchBar />
      </section>

      {/* Property Categories */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold dark:text-white sm:text-3xl">Browse by Property Type</h2>
          <p className="text-xs text-slate-500 mt-2">Discover premium listings categorized by modern architectural layouts.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/properties?propertyType=${cat.name}`}
                className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-primary-500 dark:border-slate-800 dark:bg-slate-900 transition"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                <span className="text-[10px] text-slate-500 mt-1">{cat.count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Properties */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-2xl font-bold dark:text-white sm:text-3xl">Featured Listings</h2>
            <p className="text-xs text-slate-500 mt-2">Hand-picked residential and commercial listings vetted by our admins.</p>
          </div>
          <Link to="/properties" className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 w-full animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"></div>
            ))}
          </div>
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-2xl">
            <p className="text-sm text-slate-500">No properties available yet. Register as an Agent to add listings!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProperties.map((prop) => (
              <PropertyCard key={prop._id} property={prop} />
            ))}
          </div>
        )}
      </section>

      {/* Popular Cities */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold dark:text-white sm:text-3xl">Explore Hot Locations</h2>
          <p className="text-xs text-slate-500 mt-2">Invest in real estate across major metropolitan hubs.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {popularCities.map((city) => (
            <Link
              key={city.name}
              to={`/properties?city=${city.name}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-md"
            >
              <img
                src={city.image}
                alt={city.name}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <h3 className="font-bold text-lg">{city.name}</h3>
                <p className="text-xs text-slate-300">{city.listings} Listings</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-900/50 py-12 rounded-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base dark:text-white">Verified Properties</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">
                All property listings undergo rigorous administrative review. We inspect documents and tags coordinates accuracy.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600 dark:bg-green-950/40 dark:text-green-400">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base dark:text-white">Instant Communication</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">
                Connect directly with owners/agents via our integrated real-time text chat, call, or Book Visit appointment requests.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base dark:text-white">Market Vetted Advisors</h3>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-2 leading-relaxed">
                Unlock top deals with verified agencies and top developers featured on our homepage slides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl font-bold dark:text-white sm:text-3xl">What Our Users Say</h2>
          <p className="text-xs text-slate-500 mt-2">Real testimonials from happy clients and agencies on PropertyFinder.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reviews.map((rev, i) => (
            <div key={i} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
              <div>
                <Quote className="h-8 w-8 text-primary-500/20 mb-4" />
                <p className="text-slate-600 dark:text-slate-300 text-sm italic leading-relaxed">"{rev.content}"</p>
              </div>
              <div className="flex items-center gap-3 mt-6 border-t pt-4 dark:border-slate-800">
                <img src={rev.avatar} alt={rev.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{rev.name}</h4>
                  <p className="text-[10px] text-slate-500">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blog Previews */}
      {latestBlogs.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold dark:text-white sm:text-3xl">Real Estate Advisory & News</h2>
              <p className="text-xs text-slate-500 mt-2">Latest trends, tax laws, and guide tutorials.</p>
            </div>
            <Link to="/blogs" className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
              <span>Read all blogs</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {latestBlogs.map((blog) => (
              <Link
                key={blog._id}
                to={`/blogs/${blog.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="aspect-[16/9] overflow-hidden bg-slate-100">
                  <img
                    src={blog.image}
                    alt={blog.title}
                    className="h-full w-full object-cover transition group-hover:scale-105 duration-500"
                  />
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider">{blog.category}</span>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 mt-1 group-hover:underline">
                      {blog.title}
                    </h3>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-4">
                    Published on {new Date(blog.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
