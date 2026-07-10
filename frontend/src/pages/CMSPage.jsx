import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { HelpCircle, ChevronDown, CheckCircle, Info, Loader2 } from 'lucide-react';
import api from '../utils/api';

const CMSPage = () => {
  const { pathname } = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setSettings(res.data.settings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Determine content depending on pathname
  let title = 'System Documents';
  let content = '';

  if (pathname === '/about') {
    title = 'About Us';
    content = settings?.aboutUs || 'PropertyFinder is Pakistan\'s leading digital real estate portal. Our platform connects buyers, tenants, owners, and developers with verified properties, automated visits schedules, and text chats.';
  } else if (pathname === '/privacy') {
    title = 'Privacy Policy';
    content = settings?.privacyPolicy || 'Your security is our absolute priority. We collect user profiles (name, email, phone) to connect you with advertisers, and store coordinate maps to support radius queries.';
  } else if (pathname === '/terms') {
    title = 'Terms & Conditions';
    content = settings?.termsOfService || 'By registering, you guarantee all property details (price, size, lat/lng coordinates) represent real available listings. Abuse of chats or scheduler results in immediate suspension.';
  }

  const faqs = settings?.faqs?.length > 0 ? settings.faqs : [
    { question: 'How do I schedule a site visit?', answer: 'Navigate to any property listing page, choose a date and slot in the sidebar scheduler, and click "Book Site Visit".' },
    { question: 'What does "Verified" badge mean?', answer: 'It indicates that our admin team inspected the coordinates index and title deeds of the listing.' },
    { question: 'Can I list a property for free?', answer: 'Yes! Register an Agent account to upload unlimited properties for rent or sale. Real estate listings will display upon admin approval.' }
  ];

  if (pathname === '/faq') {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <HelpCircle className="mx-auto h-12 w-12 text-primary-500" />
          <h1 className="text-3xl font-extrabold tracking-tight dark:text-white">Frequently Asked Questions</h1>
          <p className="text-xs text-slate-500">Quick answers to common questions about our property platform.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 cursor-pointer"
              onClick={() => setActiveFaq(activeFaq === i ? null : i)}
            >
              <div className="flex justify-between items-center text-sm font-bold text-slate-800 dark:text-slate-100">
                <span>{faq.question}</span>
                <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
              </div>
              {activeFaq === i && (
                <p className="text-xs text-slate-500 mt-3 border-t pt-3 leading-relaxed dark:text-slate-400">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
      <div className="space-y-2 border-b pb-4 dark:border-slate-800">
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white font-sans">{title}</h1>
        <p className="text-xs text-slate-400">Official page documents for PropertyFinder</p>
      </div>

      <div className="rounded-3xl border bg-white p-8 shadow-md dark:border-slate-800 dark:bg-slate-900 leading-relaxed text-slate-600 dark:text-slate-300 text-sm whitespace-pre-line">
        {content}
      </div>
    </div>
  );
};

export default CMSPage;
