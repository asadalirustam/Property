import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import api from '../utils/api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const response = await api.post('/admin/newsletter', { email });
      setStatus({ type: 'success', message: response.data.message });
      setEmail('');
    } catch (err) {
      setStatus({ type: 'error', message: err.response?.data?.message || 'Subscription failed' });
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 dark:bg-slate-950 dark:text-slate-500 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 border-b border-slate-800 pb-8">
          
          {/* Brand info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                <span className="font-extrabold text-base">P</span>
              </div>
              <span className="font-sans font-bold text-lg text-white">PropertyFinder</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Premium real estate solution for buying, renting, and listing properties across major cities. Find your next dream home or manage your portfolios effortlessly.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary-500 text-slate-500 transition" aria-label="Facebook">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24"><path d="M9 8H7v3h2v9h3v-9h3.6l.4-3H12V6c0-.9.2-1.2 1-1.2h2V2h-3c-3 0-5 1.8-5 4.8V8Z"/></svg>
              </a>
              <a href="#" className="hover:text-primary-500 text-slate-500 transition" aria-label="Twitter">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24"><path d="M18.2 2.4h3.3L14.3 11l8.5 11.3h-6.7L10.8 15.5l-6 6.8H1.5L9 13.5 1 2.4h6.9l4.8 6.4 5.5-6.4Zm-1.2 17.6h1.8L7.1 4.3H5.1l11.9 15.7Z"/></svg>
              </a>
              <a href="#" className="hover:text-primary-500 text-slate-500 transition" aria-label="Instagram">
                <svg className="h-4.5 w-4.5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="#" className="hover:text-primary-500 text-slate-500 transition" aria-label="LinkedIn">
                <svg className="h-4.5 w-4.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/properties" className="hover:text-primary-500 transition">Find Properties</Link></li>
              <li><Link to="/compare" className="hover:text-primary-500 transition">Compare Listings</Link></li>
              <li><Link to="/blogs" className="hover:text-primary-500 transition">Our Blog</Link></li>
              <li><Link to="/contact" className="hover:text-primary-500 transition">Contact Us</Link></li>
            </ul>
          </div>

          {/* Quick links CMS */}
          <div>
            <h4 className="text-sm font-bold text-white mb-4">Company Info</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/about" className="hover:text-primary-500 transition">About Us</Link></li>
              <li><Link to="/terms" className="hover:text-primary-500 transition">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-primary-500 transition">Privacy Policy</Link></li>
              <li><Link to="/faq" className="hover:text-primary-500 transition">Frequently Asked FAQs</Link></li>
            </ul>
          </div>

          {/* Newsletter subscription */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white mb-4">Subscribe to Newsletter</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Get the latest property alerts, market news, and premium price listings direct in your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="relative flex">
              <input
                type="email"
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-l-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-r-lg bg-primary-600 px-3 hover:bg-primary-700 transition"
              >
                <Send className="h-4 w-4 text-white" />
              </button>
            </form>
            {status.message && (
              <p className={`text-[10px] ${status.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {status.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center text-[10px] text-slate-600">
          <p>© {new Date().getFullYear()} PropertyFinder Ltd. All rights reserved.</p>
          <p>Built with MERN, Tailwind, & Leaflet Maps.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
