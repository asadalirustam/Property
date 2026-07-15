import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchMyProperties, createNewProperty, updateProperty, deleteProperty } from '../../redux/propertySlice';
import { fetchBookings, updateBookingStatus } from '../../redux/bookingSlice';
import { fetchChats, fetchMessages, sendChatMessage, setActiveChat } from '../../redux/chatSlice';
import { 
  Building, Plus, Edit, Trash2, Calendar, MessageSquare, Save, Check, X, Send, Loader2, Info,
  ShieldCheck, MapPin, PlusCircle, XCircle, FileText
} from 'lucide-react';
import api from '../../utils/api';

import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Helper component to re-center the map when coords change
const MapRecenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (!isNaN(latitude) && !isNaN(longitude)) {
      map.setView([latitude, longitude], map.getZoom());
    }
  }, [lat, lng, map]);
  return null;
};

// Helper component to capture map click events
const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

// Pakistan cities/areas for agent area division
const PAKISTAN_AREAS = {
  Lahore:     ['DHA Phase 1','DHA Phase 2','DHA Phase 3','DHA Phase 4','DHA Phase 5','DHA Phase 6','Gulberg I','Gulberg II','Gulberg III','Johar Town','Bahria Town','Model Town','Garden Town','Faisal Town','Iqbal Town','Wapda Town','Township','Defence Road','Cantt','Shadman'],
  Karachi:    ['DHA Phase 1','DHA Phase 2','DHA Phase 5','DHA Phase 6','Clifton','Defence','Gulshan-e-Iqbal','Nazimabad','North Nazimabad','PECHS','Bahadurabad','Tariq Road','Saddar','FB Area','Korangi','Malir'],
  Islamabad:  ['F-6','F-7','F-8','F-10','F-11','G-9','G-10','G-11','G-13','G-15','E-7','DHA Phase 1','DHA Phase 2','Bahria Town Phase 1','Bahria Town Phase 7','Sector H-13','PWD','CBR Town'],
  Rawalpindi: ['Bahria Town','Saddar','Satellite Town','Chaklala Scheme','Gulraiz Housing','Askari 14','Raja Market','Commercial Market','DHA Rawalpindi','Airport Road'],
  Faisalabad: ['Gulberg','Madina Town','Ghulam Muhammadabad','Peoples Colony','Jinnah Colony','Raza Abad'],
  Multan:     ['Cantt','Wapda Town','Garden Town','Gulshan Abad','Shah Rukn-e-Alam Colony'],
  Peshawar:   ['University Town','Hayatabad Phase 1','Hayatabad Phase 4','Hayatabad Phase 5','Dalazak Road'],
  Quetta:     ['Samungli Road','Airport Road','Jinnah Town','Satellite Town'],
};

const ALL_CITIES = Object.keys(PAKISTAN_AREAS);

const AgentDashboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Tab: 'listings', 'form', 'bookings', 'messages', 'areaCoverage'
  const [activeTab, setActiveTab] = useState('listings');
  const { myProperties, loading: propertyLoading } = useSelector((state) => state.properties);
  const { bookings, loading: bookingLoading } = useSelector((state) => state.bookings);
  const { chats, messages, activeChatId, loading: chatLoading } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);

  // Sync active tab and chat thread details from URL parameters
  useEffect(() => {
    if (location.pathname.includes('/messages')) {
      setActiveTab('messages');
      const chatId = searchParams.get('chatId');
      if (chatId) {
        dispatch(setActiveChat(chatId));
        dispatch(fetchMessages(chatId));
      }
    } else if (location.pathname.includes('/bookings')) {
      setActiveTab('bookings');
    } else if (location.pathname.includes('/form')) {
      setActiveTab('form');
    } else if (location.pathname.includes('/areaCoverage')) {
      setActiveTab('areaCoverage');
    } else {
      setActiveTab('listings');
    }
  }, [location.pathname, searchParams, dispatch]);

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
  const [documents, setDocuments] = useState([]);
  const [typedMessage, setTypedMessage] = useState('');
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  // Live Location / Geolocation states
  const [detectingLoc, setDetectingLoc] = useState(false);

  // Geolocation trigger
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      return alert('Geolocation is not supported by your browser');
    }
    setDetectingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toFixed(6));
        setLng(position.coords.longitude.toFixed(6));
        setDetectingLoc(false);
      },
      (error) => {
        setDetectingLoc(false);
        alert('Failed to detect location: ' + error.message);
      }
    );
  };

  // Fix Leaflet default marker icons for Vite
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
  }, []);

  // Area Coverage (agent's assigned service areas)
  const [agentCoveredCity, setAgentCoveredCity] = useState('Lahore');
  const [agentCoveredAreas, setAgentCoveredAreas] = useState([]);
  const [newAreaInput, setNewAreaInput] = useState('');

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
    setDocuments([]);
    setPrivacyAccepted(false);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!privacyAccepted) {
      alert('Please read and accept the Property Listing Privacy Policy before publishing.');
      return;
    }
    
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
    if (documents.length > 0) {
      for (let i = 0; i < documents.length; i++) {
        formData.append('documents', documents[i]);
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

  // Area coverage management
  const handleAddArea = () => {
    const areaToAdd = newAreaInput.trim() || agentCoveredCity;
    const key = `${agentCoveredCity} — ${areaToAdd}`;
    if (!agentCoveredAreas.includes(key)) {
      setAgentCoveredAreas(prev => [...prev, key]);
    }
    setNewAreaInput('');
  };

  const handleRemoveArea = (area) => {
    setAgentCoveredAreas(prev => prev.filter(a => a !== area));
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
    navigate(`/agent/messages?chatId=${chatId}`);
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
            onClick={() => navigate('/agent/listings')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'listings' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Building className="h-4.5 w-4.5" />
            <span>Manage Listings</span>
          </button>

          <button
            onClick={() => { handleResetForm(); navigate('/agent/form'); }}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'form' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Property</span>
          </button>

          <button
            onClick={() => navigate('/agent/bookings')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'bookings' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            <span>Incoming Bookings</span>
          </button>

          <button
            onClick={() => navigate('/agent/messages')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'messages' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>Customer Chats</span>
          </button>

          <button
            onClick={() => navigate('/agent/areaCoverage')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'areaCoverage' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <MapPin className="h-4.5 w-4.5" />
            <span>My Service Areas</span>
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
                <p className="text-xs text-slate-500 py-10 text-center">No properties listed yet.</p>
              ) : (
                <div className="space-y-4">
                  {myProperties.map((prop) => (
                    <div key={prop._id} className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex gap-4">
                        <img src={prop.images?.[0]} alt="preview" className="h-16 w-24 object-cover rounded-xl shrink-0" />
                        <div>
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{prop.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5">{prop.address}, {prop.city}</p>
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
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Property Title</label>
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
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Purpose</label>
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
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Type</label>
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
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
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
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (Rs)</label>
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
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">City</label>
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
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Area/Society</label>
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
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Complete Address</label>
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
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Latitude</label>
                      <input
                        type="text"
                        required
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Longitude</label>
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

                {/* Interactive map display and detect location action */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Select Location on Map</label>
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={detectingLoc}
                      className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline disabled:opacity-50"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{detectingLoc ? 'Detecting...' : 'Detect Live Location'}</span>
                    </button>
                  </div>
                  
                  <div className="h-60 rounded-xl overflow-hidden border dark:border-slate-800 z-10 relative">
                    <MapContainer center={[parseFloat(lat) || 31.5204, parseFloat(lng) || 74.3587]} zoom={13} className="h-full w-full">
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[parseFloat(lat) || 31.5204, parseFloat(lng) || 74.3587]} />
                      <MapRecenter lat={lat} lng={lng} />
                      <MapEventsHandler onMapClick={(latlng) => {
                        setLat(latlng.lat.toFixed(6));
                        setLng(latlng.lng.toFixed(6));
                      }} />
                    </MapContainer>
                  </div>
                  <p className="text-[10px] text-slate-400">Click anywhere on the map or click 'Detect Live Location' to place a marker at the property's coordinates.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bedrooms</label>
                    <input
                      type="number"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Bathrooms</label>
                    <input
                      type="number"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Area Size</label>
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
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Year Built</label>
                    <input
                      type="number"
                      value={yearBuilt}
                      onChange={(e) => setYearBuilt(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 dark:border-slate-800 space-y-3">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Amenities checklist</label>
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

                {/* Upload Images */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Upload Images (multiple files allowed)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImages(e.target.files)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:transition dark:file:bg-slate-800 dark:file:text-slate-300"
                  />
                </div>

                {/* Upload Property Documents */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Property Documents (title deed, NOC, fard, etc.)</label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setDocuments(e.target.files)}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:transition dark:file:bg-slate-800 dark:file:text-slate-300"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Accepted: PDF, Word, or image files. These documents are securely stored and accessible only by you and the platform admin.</p>
                </div>

                {/* ── Privacy Policy Agreement ── */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Property Listing Privacy Policy</h4>
                      <div className="mt-2 text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed space-y-1.5">
                        <p>By listing this property on <strong>PropertyFinder</strong>, you agree to the following terms:</p>
                        <ul className="list-disc pl-4 space-y-1">
                          <li><strong>Document Accessibility:</strong> All property documents you upload (title deed, NOC, fard, utility bills, etc.) will be securely stored and accessible to <em>you (the listing agent)</em> and <em>the platform administrator</em> only. They will <u>not</u> be shared with buyers or renters without your consent.</li>
                          <li><strong>Admin Verification:</strong> The platform admin reserves the right to review uploaded documents to verify the authenticity of your listing before it goes live.</li>
                          <li><strong>Area Assignment:</strong> Your listing will be associated with the area you specify. Buyers/renters searching that area will be able to discover your listing.</li>
                          <li><strong>Listing Accuracy:</strong> You confirm that all provided information (price, size, documents, location) is accurate and you are the authorized agent/owner for this property.</li>
                          <li><strong>Data Retention:</strong> Documents are retained securely for the duration the listing remains active on the platform.</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer group mt-2">
                    <input
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 group-hover:text-amber-900">
                      I have read, understood, and agree to the Property Listing Privacy Policy. I confirm that all uploaded documents are genuine and I am the authorized agent/owner of this property.
                    </span>
                  </label>
                </div>

                {/* Agent's covered areas summary */}
                {agentCoveredAreas.length > 0 && (
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Your Registered Service Areas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {agentCoveredAreas.map(a => (
                        <span key={a} className="inline-flex items-center gap-1 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 text-[10px] font-semibold px-2 py-0.5">
                          <MapPin className="h-2.5 w-2.5" />{a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

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
                    disabled={!privacyAccepted}
                    className={`flex items-center gap-2 rounded-xl px-6 py-2 text-xs font-semibold text-white shadow transition ${
                      privacyAccepted ? 'bg-primary-600 hover:bg-primary-700' : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                    }`}
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
                <p className="text-xs text-slate-500 py-10 text-center">No incoming visit requests yet.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{booking.property?.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">Requested Date: {new Date(booking.visitDate).toLocaleDateString()} at {booking.visitTime}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-2 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg italic">
                          "Customer comment: {booking.customerMessage || 'None'}"
                        </p>
                        <p className="text-[10px] text-slate-500 mt-2 font-semibold">Client Name: {booking.customer?.name} - {booking.customer?.phone}</p>
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
                  <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Inbox Threads</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto divide-y dark:divide-slate-800">
                  {chats.length === 0 ? (
                    <p className="text-[10px] text-slate-500 p-4 text-center">No active chats.</p>
                  ) : (
                    chats.map((chat) => {
                      const counterpart = chat.participants?.find(p => p._id !== user?.id);
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
                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{chat.lastMessage || 'Click to message'}</p>
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
                                <span className={`text-[8px] block text-right mt-1 ${isMe ? 'text-primary-200' : 'text-slate-500'}`}>
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
                  <div className="flex-1 flex flex-col justify-center items-center p-6 text-center text-slate-500">
                    <MessageSquare className="h-10 w-10 mb-2" />
                    <p className="text-xs">Select an inbox thread to view message history or reply.</p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ── My Service Areas (Area Division) ── */}
          {activeTab === 'areaCoverage' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold dark:text-white font-sans">My Service Areas</h2>
                <p className="text-xs text-slate-500 mt-1">Define the cities and areas where you operate as an agent. Buyers searching those areas will see your listings prominently.</p>
              </div>

              {/* Add Area Form */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Register a New Area</h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* City */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">City</label>
                    <select
                      value={agentCoveredCity}
                      onChange={(e) => { setAgentCoveredCity(e.target.value); setNewAreaInput(''); }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                    >
                      {ALL_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Known sub-area quick pick */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Area / Society (select)</label>
                    <select
                      value={newAreaInput}
                      onChange={(e) => setNewAreaInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="">— pick from list —</option>
                      {(PAKISTAN_AREAS[agentCoveredCity] || []).map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  {/* Custom area name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Or Type Custom Area</label>
                    <input
                      type="text"
                      placeholder="e.g. Phase 8, Block D"
                      value={newAreaInput}
                      onChange={(e) => setNewAreaInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddArea}
                  className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2 text-xs font-bold text-white hover:bg-primary-700 active:scale-95 transition"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Area to My Coverage
                </button>
              </div>

              {/* Covered areas list */}
              <div className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
                <h3 className="text-xs font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider mb-4">
                  Registered Coverage Areas ({agentCoveredAreas.length})
                </h3>
                {agentCoveredAreas.length === 0 ? (
                  <div className="py-10 text-center">
                    <MapPin className="h-10 w-10 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No areas registered yet. Add your first service area above.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {agentCoveredAreas.map((a) => {
                      const [aCity, aArea] = a.split(' — ');
                      return (
                        <div key={a} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <MapPin className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-200 truncate">{aArea || a}</p>
                              <p className="text-[9px] text-slate-500">{aCity}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveArea(a)}
                            className="ml-2 text-red-400 hover:text-red-600 transition"
                            title="Remove area"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Info about area division */}
              <div className="rounded-2xl border border-sky-100 dark:border-sky-900 bg-sky-50 dark:bg-sky-950/20 p-4 flex gap-3">
                <Info className="h-5 w-5 text-sky-500 shrink-0 mt-0.5" />
                <div className="text-[11px] text-sky-800 dark:text-sky-300 leading-relaxed space-y-1">
                  <p className="font-extrabold uppercase tracking-wide text-sky-700 dark:text-sky-400 text-[10px]">How Area Division Works</p>
                  <p>Each registered area represents a <strong>geographic territory</strong> where you are authorized to list and manage properties. The platform admin may assign or approve additional exclusive areas.</p>
                  <p>When a buyer or renter searches properties in one of your covered areas, your listings will appear prominently. Areas are also used in admin reporting to divide agent performance metrics by territory.</p>
                  <p className="text-sky-600 dark:text-sky-400 font-semibold">Your covered areas and their associated listings are visible to the platform administrator for verification and audit purposes.</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;

