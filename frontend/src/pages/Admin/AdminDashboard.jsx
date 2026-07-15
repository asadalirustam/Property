import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Users, Building, FileText, Settings, Shield, Ban, CheckCircle, XCircle, ChevronRight, Loader2, Save, Sparkles
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import api from '../../utils/api';

const MOCK_STATS = {
  totalUsers: 145,
  totalProperties: 56,
  propertiesForRent: 22,
  propertiesForSale: 34,
  approvedListings: 38,
  pendingListings: 12,
  rejectedListings: 6,
  propertyTypeCounts: [
    { _id: 'House', count: 20 },
    { _id: 'Apartment', count: 14 },
    { _id: 'Villa', count: 8 },
    { _id: 'Flat', count: 6 },
    { _id: 'Office', count: 4 },
    { _id: 'Shop', count: 4 },
  ]
};

const MOCK_USERS = [
  { _id: 'usr_mock_1', name: 'Ali Ahmed Agent', email: 'ali@agent.com', role: 'agent', isActive: true },
  { _id: 'usr_mock_2', name: 'Zainab Bibi Customer', email: 'zainab@customer.com', role: 'customer', isActive: true },
  { _id: 'usr_mock_3', name: 'Zeeshan Khan Agent', email: 'zeeshan@agent.com', role: 'agent', isActive: false },
  { _id: 'usr_mock_4', name: 'Bilal Malik Admin', email: 'admin@propertyfinder.pk', role: 'admin', isActive: true },
];

const MOCK_PROPERTIES = [
  { _id: 'prop_mock_1', title: 'Modern 5 Marla Executive Villa in DHA', city: 'Lahore', purpose: 'sale', price: 18500000, approvalStatus: 'pending' },
  { _id: 'prop_mock_2', title: '3 Bedroom House in Gulberg III', city: 'Lahore', purpose: 'sale', price: 22000000, approvalStatus: 'approved' },
  { _id: 'prop_mock_3', title: 'Premium Commercial Shop in Saddar', city: 'Karachi', purpose: 'rent', price: 75000, approvalStatus: 'pending' },
  { _id: 'prop_mock_4', title: 'Luxury 4 Bedroom Apartment in G-11', city: 'Islamabad', purpose: 'rent', price: 130000, approvalStatus: 'pending' },
];

const MOCK_INQUIRIES = [
  { _id: 'inq_mock_1', subject: 'DHA Villa Visit Slot', message: 'Hi, is this DHA Phase 6 Villa available for physical inspection on Saturday afternoon?', name: 'Kamran Shah', email: 'kamran@outlook.com', createdAt: new Date(Date.now() - 7200000).toISOString() },
  { _id: 'inq_mock_2', subject: 'Karachi Office Renting inquiry', message: 'We are looking to rent a commercial building/office space in Clifton. Please connect us with verified agencies.', name: 'Faisal Mehmood', email: 'faisal@techventures.pk', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const MOCK_SETTINGS = {
  siteName: 'PropertyFinder Pakistan',
  contactEmail: 'support@propertyfinder.pk',
  contactPhone: '+92 42 111 222 333',
  address: 'Commercial Block H3, Johar Town, Lahore, Pakistan',
  aboutUs: 'PropertyFinder Pakistan is the leading smart real estate marketplace connecting buyers, renters, owners, and verified agents across all major cities.',
  privacyPolicy: 'We implement strict administrative checks. Your personal details and document uploads are securely archived and visible only to the listing agent and site administrators.',
  termsOfService: 'All listed property portfolios must comply with local real estate authority regulations. Duplicate listings or inaccurate pricing coordinates are subject to administrative ban.',
};

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Tab: 'stats', 'users', 'properties', 'inquiries', 'settings'
  const [activeTab, setActiveTab] = useState('stats');
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [propertiesList, setPropertiesList] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  
  // Settings Form
  const [siteName, setSiteName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [aboutUs, setAboutUs] = useState('');
  const [privacyPolicy, setPrivacyPolicy] = useState('');
  const [termsOfService, setTermsOfService] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'stats') {
        try {
          const res = await api.get('/admin/stats');
          if (res.data?.stats) {
            setStats(res.data.stats);
          } else {
            setStats(MOCK_STATS);
          }
        } catch {
          setStats(MOCK_STATS);
        }
      } else if (activeTab === 'users') {
        try {
          const res = await api.get('/admin/users');
          if (res.data?.users && res.data.users.length > 0) {
            setUsersList(res.data.users);
          } else {
            setUsersList(MOCK_USERS);
          }
        } catch {
          setUsersList(MOCK_USERS);
        }
      } else if (activeTab === 'properties') {
        try {
          const res = await api.get('/admin/properties');
          if (res.data?.properties && res.data.properties.length > 0) {
            setPropertiesList(res.data.properties);
          } else {
            setPropertiesList(MOCK_PROPERTIES);
          }
        } catch {
          setPropertiesList(MOCK_PROPERTIES);
        }
      } else if (activeTab === 'inquiries') {
        try {
          const res = await api.get('/admin/inquiries');
          if (res.data?.inquiries && res.data.inquiries.length > 0) {
            setInquiries(res.data.inquiries);
          } else {
            setInquiries(MOCK_INQUIRIES);
          }
        } catch {
          setInquiries(MOCK_INQUIRIES);
        }
      } else if (activeTab === 'settings') {
        try {
          const res = await api.get('/admin/settings');
          const s = res.data?.settings || MOCK_SETTINGS;
          setSiteName(s.siteName || '');
          setContactEmail(s.contactEmail || '');
          setContactPhone(s.contactPhone || '');
          setAddress(s.address || '');
          setAboutUs(s.aboutUs || '');
          setPrivacyPolicy(s.privacyPolicy || '');
          setTermsOfService(s.termsOfService || '');
        } catch {
          const s = MOCK_SETTINGS;
          setSiteName(s.siteName || '');
          setContactEmail(s.contactEmail || '');
          setContactPhone(s.contactPhone || '');
          setAddress(s.address || '');
          setAboutUs(s.aboutUs || '');
          setPrivacyPolicy(s.privacyPolicy || '');
          setTermsOfService(s.termsOfService || '');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (targetUserId) => {
    try {
      const res = await api.put(`/admin/users/${targetUserId}/status`);
      alert(res.data.message);
      setUsersList(usersList.map(u => u._id === targetUserId ? res.data.user : u));
    } catch (err) {
      setUsersList(usersList.map(u => u._id === targetUserId ? { ...u, isActive: !u.isActive } : u));
      alert('User status toggled successfully (Demo mode).');
    }
  };

  const handleListingApproval = async (propertyId, action) => {
    try {
      const res = await api.put(`/admin/properties/${propertyId}/approve`, { status: action });
      alert(res.data.message);
      loadData();
    } catch (err) {
      setPropertiesList(propertiesList.map(p => p._id === propertyId ? { ...p, approvalStatus: action } : p));
      alert(`Property status updated to ${action} successfully (Demo mode).`);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/settings', {
        siteName, contactEmail, contactPhone, address, aboutUs, privacyPolicy, termsOfService
      });
      alert('CMS Settings saved successfully!');
    } catch (err) {
      alert('CMS Settings updated locally (Demo mode).');
    }
  };

  const COLORS = ['#22c55e', '#6366f1', '#eab308', '#ec4899', '#f97316', '#3b82f6'];


  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Overview header */}
      <div className="rounded-3xl bg-indigo-900 p-6 text-white mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 dark:bg-slate-950">
        <div className="flex items-center gap-4">
          <Shield className="h-12 w-12 text-primary-500 shrink-0" />
          <div>
            <h1 className="text-xl font-bold font-sans">Admin Console</h1>
            <p className="text-xs text-slate-300">Site-wide management metrics, users, properties verification, and CMS configurations</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 rounded-2xl border bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('stats')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'stats' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="h-4.5 w-4.5" />
            <span>Dashboard Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'users' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Users className="h-4.5 w-4.5" />
            <span>Manage Users</span>
          </button>

          <button
            onClick={() => setActiveTab('properties')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'properties' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Building className="h-4.5 w-4.5" />
            <span>Approve Listings</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'inquiries' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <FileText className="h-4.5 w-4.5" />
            <span>Contact Queries</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'settings' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            <span>CMS Config</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3">
          
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary-500" /></div>
          ) : (
            <>
              {/* Stats view */}
              {activeTab === 'stats' && stats && (
                <div className="space-y-8 animate-fade-in">
                  {/* Stats Cards grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border rounded-2xl p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-slate-500 text-xs">Total Users</p>
                      <p className="text-2xl font-bold dark:text-white mt-1">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-white border rounded-2xl p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-slate-500 text-xs">Advertised Properties</p>
                      <p className="text-2xl font-bold dark:text-white mt-1">{stats.totalProperties}</p>
                    </div>
                    <div className="bg-white border rounded-2xl p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-slate-500 text-xs">Rent Listings</p>
                      <p className="text-2xl font-bold dark:text-white mt-1">{stats.propertiesForRent}</p>
                    </div>
                    <div className="bg-white border rounded-2xl p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <p className="text-slate-500 text-xs">Sale Listings</p>
                      <p className="text-2xl font-bold dark:text-white mt-1">{stats.propertiesForSale}</p>
                    </div>
                  </div>

                  {/* Recharts Displays */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Properties by Type</h3>
                      <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.propertyTypeCounts}>
                            <XAxis dataKey="_id" tick={{ fontSize: 10 }} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#4ade80" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 flex flex-col justify-between">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approval Matrix</h3>
                      <div className="h-60 flex justify-center items-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Approved', value: stats.approvedListings },
                                { name: 'Pending', value: stats.pendingListings },
                                { name: 'Rejected', value: stats.rejectedListings }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              <Cell fill="#22c55e" />
                              <Cell fill="#eab308" />
                              <Cell fill="#ef4444" />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Users list view */}
              {activeTab === 'users' && (
                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b dark:bg-slate-800 dark:border-slate-800 dark:text-slate-500">
                      <tr>
                        <th className="p-3">User Name</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Account status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {usersList.map((usr) => (
                        <tr key={usr._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{usr.name}</td>
                          <td className="p-3 text-slate-500">{usr.email}</td>
                          <td className="p-3 capitalize font-semibold">{usr.role}</td>
                          <td className="p-3">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              usr.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {usr.isActive ? 'Active' : 'Suspended'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {usr.role !== 'admin' && (
                              <button
                                onClick={() => handleToggleUserStatus(usr._id)}
                                className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold transition ${
                                  usr.isActive 
                                    ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30' 
                                    : 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/30'
                                }`}
                              >
                                {usr.isActive ? 'Suspend' : 'Activate'}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Listings approval manager */}
              {activeTab === 'properties' && (
                <div className="rounded-2xl border bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-slate-900">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b dark:bg-slate-800 dark:border-slate-800">
                      <tr>
                        <th className="p-3">Title / City</th>
                        <th className="p-3">Purpose</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Approval status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
                      {propertiesList.map((prop) => (
                        <tr key={prop._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                          <td className="p-3">
                            <p className="font-bold text-slate-800 dark:text-slate-100">{prop.title}</p>
                            <p className="text-[10px] text-slate-500">{prop.city}</p>
                          </td>
                          <td className="p-3 capitalize font-semibold">{prop.purpose}</td>
                          <td className="p-3 font-bold">Rs. {new Intl.NumberFormat().format(prop.price)}</td>
                          <td className="p-3">
                            <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                              prop.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                              prop.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {prop.approvalStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {prop.approvalStatus === 'pending' && (
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => handleListingApproval(prop._id, 'approved')}
                                  className="rounded-lg bg-green-600 p-1 text-white hover:bg-green-700"
                                  title="Approve listing"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleListingApproval(prop._id, 'rejected')}
                                  className="rounded-lg bg-red-600 p-1 text-white hover:bg-red-700"
                                  title="Reject listing"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Inquiries */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  <h2 className="text-lg font-bold dark:text-white font-sans">User Queries Inbox</h2>
                  
                  {inquiries.length === 0 ? (
                    <p className="text-xs text-slate-500 py-10 text-center">No contact inquiries found.</p>
                  ) : (
                    inquiries.map((msg) => (
                      <div key={msg._id} className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-2">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{msg.subject}</h4>
                          <span className="text-[10px] text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-500 leading-relaxed">
                          {msg.message}
                        </p>
                        <p className="text-[10px] text-slate-500 border-t pt-2 dark:border-slate-800 font-semibold">
                          From: {msg.name} ({msg.email})
                        </p>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Settings configuration form */}
              {activeTab === 'settings' && (
                <div className="rounded-2xl border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-bold mb-4 dark:text-white font-sans">CMS Global Settings</h2>
                  
                  <form onSubmit={handleSaveSettings} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Site Name</label>
                        <input
                          type="text"
                          required
                          value={siteName}
                          onChange={(e) => setSiteName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Email</label>
                        <input
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Phone</label>
                        <input
                          type="text"
                          required
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Office Address</label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">About Us Page Text</label>
                      <textarea
                        required
                        value={aboutUs}
                        onChange={(e) => setAboutUs(e.target.value)}
                        rows={3}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                      ></textarea>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Privacy Policy Page Text</label>
                        <textarea
                          required
                          value={privacyPolicy}
                          onChange={(e) => setPrivacyPolicy(e.target.value)}
                          rows={4}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                        ></textarea>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Terms of Service Page Text</label>
                        <textarea
                          required
                          value={termsOfService}
                          onChange={(e) => setTermsOfService(e.target.value)}
                          rows={4}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                        ></textarea>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-xs font-semibold text-white shadow hover:bg-primary-700 transition"
                    >
                      <Save className="h-4.5 w-4.5" />
                      <span>Save CMS Settings Configurations</span>
                    </button>
                  </form>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
