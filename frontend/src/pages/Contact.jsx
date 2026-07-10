import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

const Contact = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/admin/inquiries', { name, email, subject, message });
      setSuccess(res.data.message);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight dark:text-white font-sans">Contact Support</h1>
        <p className="text-xs text-slate-500">Reach out for business collaborations, queries, or technical issues.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Contact info list */}
        <div className="md:col-span-1 rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <h3 className="font-bold text-base dark:text-white">Our Offices</h3>
          
          <div className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <div className="flex gap-3">
              <Phone className="h-5 w-5 text-primary-500 shrink-0" />
              <div>
                <p className="text-slate-400">Phone Support</p>
                <p className="mt-1 dark:text-white">+92 300 1234567</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="h-5 w-5 text-primary-500 shrink-0" />
              <div>
                <p className="text-slate-400">Email Address</p>
                <p className="mt-1 dark:text-white">support@propertyfinder.com</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-primary-500 shrink-0" />
              <div>
                <p className="text-slate-400">Headquarters Address</p>
                <p className="mt-1 dark:text-white leading-relaxed">Office 402, Al-Hafeez Heights, Gulberg III, Lahore, Pakistan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inquiry Submit Form */}
        <div className="md:col-span-2 rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h3 className="font-bold text-base dark:text-white">Submit Inquiry</h3>
          
          {success && (
            <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-600 dark:bg-green-950/20 dark:text-green-400">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ahmed"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Subject</label>
              <input
                type="text"
                required
                placeholder="e.g. Advertisement queries"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Message Content</label>
              <textarea
                required
                placeholder="Write your details..."
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-primary-700 transition disabled:opacity-50 mt-6"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>
                  <Send className="h-4.5 w-4.5" />
                  <span>Send Inquiry</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
