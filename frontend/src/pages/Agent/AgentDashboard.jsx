import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMyProperties, createNewProperty, updateProperty, deleteProperty } from '../../redux/propertySlice';
import { fetchBookings, updateBookingStatus } from '../../redux/bookingSlice';
import { fetchChats, fetchMessages, sendChatMessage, setActiveChat } from '../../redux/chatSlice';
import { 
  Building, Plus, Edit, Trash2, Calendar, MessageSquare, Save, Check, X, Send, Loader2, Info
} from 'lucide-react';
import api from '../../utils/api';

const AgentDashboard = () => {
  const dispatch = useDispatch();

  // Tab: 'listings', 'form', 'bookings', 'messages'
  const [activeTab, setActiveTab] = useState('listings');
  const { myProperties, loading: propertyLoading } = useSelector((state) => state.properties);
  const { bookings, loading: bookingLoading } = useSelector((state) => state.bookings);
  const { chats, messages, activeChatId, loading: chatLoading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  // Form States
  const [editMode, setEditMode] = useState(false);
  const [targetId, setTargetId] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [purpose, setPurpose] = useState('sale');
  const [propertyType, setPropertyType] = useState('House');
  const [price, setPrice] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('31.5204');
  const [lng, setLng] = useState('74.3587');
  const [bedrooms, setBedrooms] = useState('3');
  const [bathrooms, setBathrooms] = useState('2');
  const [areaSize, setAreaSize] = useState('5 Marla');
  const [yearBuilt, setYearBuilt] = useState('2026');
  
  const [amenities, setAmenities] = useState({
    parking: false,
    swimmingPool: false,
    garden: false,
    gym: false,
    electricityBackup: false,
    waterSupply: true,
    gas: true,
    internet: false,
    security: true,
  });

  const [images, setImages] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');

  useEffect(() => {
    if (activeTab === 'listings') {
      dispatch(fetchMyProperties());
    } else if (activeTab === 'bookings') {
      dispatch(fetchBookings());
    } else if (activeTab === 'messages') {
      dispatch(fetchChats());
    }
  }, [activeTab, dispatch]);

  const handleEditClick = (prop) => {
    setEditMode(true);
    setTargetId(prop._id);
    
    setTitle(prop.title || '');
    setDescription(prop.description || '');
    setPurpose(prop.purpose || 'sale');
    setPropertyType(prop.propertyType || 'House');
    setPrice(prop.price || '');
    setCity(prop.city || '');
    setArea(prop.area || '');
    setAddress(prop.address || '');
    if (prop.location?.coordinates) {
      setLng(prop.location.coordinates[0]);
      setLat(prop.location.coordinates[1]);
    }
    setBedrooms(prop.bedrooms || '3');
    setBathrooms(prop.bathrooms || '2');
    setAreaSize(prop.areaSize || '5 Marla');
    setYearBuilt(prop.yearBuilt || '2026');
    setAmenities({
      parking: prop.amenities?.parking || false,
      swimmingPool: prop.amenities?.swimmingPool || false,
      garden: prop.amenities?.garden || false,
      gym: prop.amenities?.gym || false,
      electricityBackup: prop.amenities?.electricityBackup || false,
      waterSupply: prop.amenities?.waterSupply || false,
      gas: prop.amenities?.gas || false,
      internet: prop.amenities?.internet || false,
      security: prop.amenities?.security || false,
    });
    
    setActiveTab('form');
  };

  const handleDeleteClick = async (propId) => {
    if (!window.confirm('Delete this listing permanently?')) return;
    try {
      await dispatch(deleteProperty(propId)).unwrap();
      alert('Property deleted.');
    } catch (err) {
      alert(err || 'Failed to delete listing.');
    }
  };

  const handleResetForm = () => {
    setEditMode(false);
    setTargetId(null);
    setTitle('');
    setDescription('');
    setPurpose('sale');
    setPropertyType('House');
    setPrice('');
    setCity('');
    setArea('');
    setAddress('');
    setLat('31.5204');
    setLng('74.3587');
    setBedrooms('3');
    setBathrooms('2');
    setAreaSize('5 Marla');
    setYearBuilt('2026');
    setAmenities({
      parking: false,
      swimmingPool: false,
      garden: false,
      gym: false,
      electricityBackup: false,
      waterSupply: true,
      gas: true,
      internet: false,
      security: true,
    });
    setImages([]);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('purpose', purpose);
    formData.append('propertyType', propertyType);
    formData.append('price', price);
    formData.append('city', city);
    formData.append('area', area);
    formData.append('address', address);
    formData.append('lat', lat);
    formData.append('lng', lng);
    formData.append('bedrooms', bedrooms);
    formData.append('bathrooms', bathrooms);
    formData.append('areaSize', areaSize);
    formData.append('yearBuilt', yearBuilt);
    formData.append('amenities', JSON.stringify(amenities));

    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }

    try {
      if (editMode) {
        await dispatch(updateProperty({ id: targetId, formData })).unwrap();
        alert('Listing updated successfully!');
      } else {
        await dispatch(createNewProperty(formData)).unwrap();
        alert('Listing created! Pending verification approval.');
      }
      handleResetForm();
      setActiveTab('listings');
    } catch (err) {
      alert(err || 'Form submission failed');
    }
  };

  const handleBookingAction = async (bookingId, action) => {
    try {
      await dispatch(updateBookingStatus({
        id: bookingId,
        statusData: { status: action }
      })).unwrap();
      alert(`Booking ${action}!`);
    } catch (err) {
      alert(err || 'Failed to update booking status.');
    }
  };

  const handleSelectChat = (chatId) => {
    dispatch(setActiveChat(chatId));
    dispatch(fetchMessages(chatId));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatId) return;

    try {
      await dispatch(sendChatMessage({ chatId: activeChatId, text: typedMessage })).unwrap();
      setTypedMessage('');
    } catch (err) {
      alert(err || 'Failed to send message.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Overview stats */}
      <div className="rounded-3xl bg-indigo-950 p-6 text-white mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-md">
        <div className="flex items-center gap-4">
          <img src={user?.avatar} alt="avatar" className="h-16 w-16 rounded-full border-2 border-indigo-400 object-cover" />
          <div>
            <h1 className="text-xl font-bold font-sans">Owner/Agent Center</h1>
            <p className="text-xs text-indigo-300">Advertise residential/commercial portfolios and coordinate visit timeslots</p>
          </div>
        </div>
        
        <div className="flex gap-4 text-center text-xs">
          <div className="bg-indigo-900 rounded-xl px-4 py-2">
            <p className="text-indigo-300">My Listings</p>
            <p className="text-lg font-bold text-white">{myProperties.length}</p>
          </div>
          <div className="bg-indigo-900 rounded-xl px-4 py-2">
            <p className="text-indigo-300">Scheduler Visited</p>
            <p className="text-lg font-bold text-white">{bookings.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 rounded-2xl border bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('listings')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'listings' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Building className="h-4.5 w-4.5" />
            <span>Manage Listings</span>
          </button>

          <button
            onClick={() => { handleResetForm(); setActiveTab('form'); }}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'form' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Property</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'bookings' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            <span>Incoming Bookings</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'messages' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>Customer Chats</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3">
          
          {/* Listings view */}
          {activeTab === 'listings' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold dark:text-white font-sans">Advertised Listings</h2>
              
              {propertyLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
              ) : myProperties.length === 0 ? (
                <p className="text-xs text-slate-400 py-10 text-center">No properties listed yet.</p>
              ) : (
                <div className="space-y-4">
                  {myProperties.map((prop) => (
                    <div key={prop._id} className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-4">
                        <img src={prop.images?.[0]} alt="preview" className="h-16 w-24 object-cover rounded-xl shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{prop.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{prop.address}, {prop.city}</p>
                          <p className="text-[10px] text-primary-600 font-bold mt-2">Rs. {new Intl.NumberFormat().format(prop.price)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                          prop.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
                          prop.approvalStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {prop.approvalStatus}
                        </span>

                        <button onClick={() => handleEditClick(prop)} className="rounded-lg border p-1.5 hover:bg-slate-50 text-slate-500 dark:border-slate-800 dark:hover:bg-slate-800">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDeleteClick(prop._id)} className="rounded-lg border p-1.5 hover:bg-red-50 text-red-500 dark:border-slate-800 dark:hover:bg-red-950/20">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Add/Edit Property Form */}
          {activeTab === 'form' && (
            <div className="rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
              <h2 className="text-lg font-bold dark:text-white font-sans">{editMode ? 'Edit Listing Details' : 'Add New Listing'}</h2>
              
              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Property Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Beautiful 5 Marla House in DHA"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Purpose</label>
                      <select
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                      >
                        <option value="sale">For Sale</option>
                        <option value="rent">For Rent</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Type</label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                      >
                        {['House', 'Apartment', 'Villa', 'Flat', 'Commercial Building', 'Office', 'Shop', 'Plot', 'Farm House'].map(t => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description</label>
                  <textarea
                    required
                    placeholder="Enter detailed description..."
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Price (Rs)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 15,000,000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lahore"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Area/Society</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gulberg III"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Complete Address</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. House 45, Street 2"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Latitude</label>
                      <input
                        type="text"
                        required
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Longitude</label>
                      <input
                        type="text"
                        required
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bedrooms</label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bathrooms</label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Area Size</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 5 Marla"
                      value={areaSize}
                      onChange={(e) => setAreaSize(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Year Built</label>
                    <input
                      type="number"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 dark:border-slate-800 space-y-3">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amenities checklist</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Upload Images (multiple files allowed)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(e.target.files)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:transition dark:file:bg-slate-800 dark:file:text-slate-300"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="rounded-xl border border-slate-200 px-6 py-2 text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-2 text-xs font-semibold text-white shadow hover:bg-primary-700 transition"
                  >
                    <Save className="h-4.5 w-4.5" />
                    <span>{editMode ? 'Update Properties' : 'Publish Property'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bookings Scheduler manager */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold dark:text-white font-sans">Incoming Bookings</h2>
              
              {bookingLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
              ) : bookings.length === 0 ? (
                <p className="text-xs text-slate-400 py-10 text-center">No incoming visit requests yet.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{booking.property?.title}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">Requested Date: {new Date(booking.visitDate).toLocaleDateString()} at {booking.visitTime}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg italic">
                          "Customer comment: {booking.customerMessage || 'None'}"
                        </p>
                        <p className="text-[10px] text-slate-400 mt-2 font-semibold">Client Name: {booking.customer?.name} - {booking.customer?.phone}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`rounded px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                          booking.status === 'approved' ? 'bg-green-100 text-green-700' :
                          booking.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          booking.status === 'cancelled' ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status}
                        </span>

                        {booking.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleBookingAction(booking._id, 'approved')}
                              className="rounded-lg bg-green-600 p-1.5 text-white hover:bg-green-700 transition"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleBookingAction(booking._id, 'rejected')}
                              className="rounded-lg bg-red-600 p-1.5 text-white hover:bg-red-700 transition"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Direct Messaging Chat */}
          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 rounded-2xl border bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm h-[500px]">
              
              {/* Inbox lists */}
              <div className="sm:col-span-1 border-r dark:border-slate-800 flex flex-col">
                <div className="p-3 border-b dark:border-slate-800">
                  <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Inbox Threads</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y dark:divide-slate-800">
                  {chats.length === 0 ? (
                    <p className="text-[10px] text-slate-400 p-4 text-center">No active chats.</p>
                  ) : (
                    chats.map((chat) => {
                      const counterpart = chat.participants.find(p => p._id !== user?.id);
                      return (
                        <button
                          key={chat._id}
                          onClick={() => handleSelectChat(chat._id)}
                          className={`w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition ${
                            activeChatId === chat._id ? 'bg-slate-50 dark:bg-slate-800' : ''
                          }`}
                        >
                          <img src={counterpart?.avatar} alt="avatar" className="h-8 w-8 rounded-full object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{counterpart?.name}</h4>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{chat.lastMessage || 'Click to message'}</p>
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat Thread Panel */}
              <div className="sm:col-span-2 flex flex-col h-full bg-slate-50 dark:bg-slate-900/30">
                {activeChatId ? (
                  <>
                    <div className="p-3 border-b bg-white dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
                      <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200">Chat log</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatLoading ? (
                        <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
                      ) : (
                        messages.map((msg) => {
                          const isMe = msg.sender?._id === user?.id;
                          return (
                            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                                isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-tl-none'
                              }`}>
                                <p>{msg.text}</p>
                                <span className={`text-[8px] block text-right mt-1 ${isMe ? 'text-primary-200' : 'text-slate-400'}`}>
                                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-3 border-t bg-white dark:border-slate-800 dark:bg-slate-900 flex gap-2">
                      <input
                        type="text"
                        placeholder="Type message..."
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                      />
                      <button type="submit" className="rounded-xl bg-primary-600 px-4 hover:bg-primary-700 text-white flex items-center justify-center">
                        <Send className="h-4.5 w-4.5" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center p-6 text-center text-slate-400">
                    <MessageSquare className="h-10 w-10 mb-2" />
                    <p className="text-xs">Select an inbox thread to view message history or reply.</p>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
