import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchPropertyById, clearCurrentProperty } from '../redux/propertySlice';
import { createBooking } from '../redux/bookingSlice';
import { createChat } from '../redux/chatSlice';
import { 
  Phone, Mail, Calendar, MessageSquare, Info, BedDouble, Bath, Square, Clock, MapPin, 
  Check, ShieldAlert, Star, ThumbsUp, Send, Heart, Play, Loader2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import api from '../utils/api';


const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Fix Leaflet marker icons in Vite
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

  const { currentProperty, loading, compareList } = useSelector((state) => state.properties);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Booking states
  const [visitDate, setVisitDate] = useState('');
  const [visitTime, setVisitTime] = useState('');
  const [bookingMsg, setBookingMsg] = useState('');
  const [bookingStatus, setBookingStatus] = useState('');

  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewReplyText, setReviewReplyText] = useState({});
  const [reviewError, setReviewError] = useState('');

  // Gallery main image
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    dispatch(fetchPropertyById(id));
    loadReviews();
    return () => dispatch(clearCurrentProperty());
  }, [id, dispatch]);

  const loadReviews = async () => {
    try {
      const res = await api.get(`/reviews/property/${id}`);
      setReviews(res.data.reviews);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert('Please sign in to book visits.');
    setBookingStatus('submitting');
    
    try {
      await dispatch(createBooking({
        propertyId: id,
        visitDate,
        visitTime,
        customerMessage: bookingMsg
      })).unwrap();

      setBookingStatus('success');
      setVisitDate('');
      setVisitTime('');
      setBookingMsg('');
    } catch (err) {
      setBookingStatus('error');
      alert(err || 'Failed to submit visit request.');
    }
  };

  const handleStartChat = async () => {
    if (!isAuthenticated) return alert('Please sign in to contact the owner.');
    if (user.id === currentProperty.owner?._id) return alert('This is your own listing.');

    try {
      const res = await dispatch(createChat(currentProperty.owner._id)).unwrap();
      const targetPath = user.role === 'agent' || user.role === 'admin'
        ? `/agent/messages?chatId=${res.chat._id}`
        : `/customer/messages?chatId=${res.chat._id}`;
      navigate(targetPath);
    } catch (err) {
      alert(err || 'Failed to start chat thread.');
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return alert('Please sign in to leave reviews.');
    setReviewError('');

    try {
      const res = await api.post('/reviews', {
        propertyId: id,
        rating,
        comment: reviewComment
      });
      setReviews([res.data.review, ...reviews]);
      setReviewComment('');
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Review post failed');
    }
  };

  const handlePostReply = async (reviewId) => {
    const text = reviewReplyText[reviewId];
    if (!text) return;

    try {
      const res = await api.post(`/reviews/${reviewId}/reply`, { text });
      setReviews(reviews.map((r) => (r._id === reviewId ? res.data.review : r)));
      setReviewReplyText({ ...reviewReplyText, [reviewId]: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!isAuthenticated) return alert('Please sign in to like reviews.');
    try {
      const res = await api.post(`/reviews/${reviewId}/like`);
      setReviews(reviews.map((r) => (r._id === reviewId ? { ...r, likes: res.data.likes } : r)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportReview = async (reviewId) => {
    if (!isAuthenticated) return alert('Please sign in to report reviews.');
    try {
      await api.post(`/reviews/${reviewId}/report`);
      alert('Review reported successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !currentProperty) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
      </div>
    );
  }

  const mapCenter = currentProperty.location?.coordinates
    ? [currentProperty.location.coordinates[1], currentProperty.location.coordinates[0]]
    : [31.5204, 74.3587];

  const galleryImages = currentProperty.images?.length > 0
    ? currentProperty.images
    : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`rounded px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white ${
              currentProperty.purpose === 'sale' ? 'bg-indigo-600' : 'bg-green-600'
            }`}>
              For {currentProperty.purpose}
            </span>
            <span className="text-xs text-slate-500 font-semibold">{currentProperty.propertyType}</span>
            {currentProperty.isVerified && (
              <span className="rounded bg-primary-100 text-primary-700 px-2 py-0.5 text-[10px] font-bold uppercase">
                Verified
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold dark:text-white leading-tight">{currentProperty.title}</h1>
          <p className="flex items-center gap-1 text-xs text-slate-500 mt-1 dark:text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{currentProperty.address}, {currentProperty.city}</span>
          </p>
        </div>

        <div className="text-left md:text-right">
          <p className="text-xs text-slate-500">Asking Price</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Rs. {new Intl.NumberFormat().format(currentProperty.price)}
            {currentProperty.purpose === 'rent' && <span className="text-xs font-medium text-slate-500">/mo</span>}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 columns: Details, gallery, map, reviews */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Image Gallery */}
          <div className="space-y-3">
            <div className="aspect-[16/9] overflow-hidden rounded-2xl bg-slate-100 relative group">
              <img
                src={galleryImages[activeImage]}
                alt="Property gallery"
                className="h-full w-full object-cover transition"
              />
              
              {currentProperty.videos?.length > 0 && (
                <a
                  href={currentProperty.videos[0]}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-lg bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur hover:bg-slate-900 transition"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Play video tour</span>
                </a>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {galleryImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition ${
                      activeImage === i ? 'border-primary-500 scale-95 shadow-md' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="thumb" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-lg font-bold mb-3 dark:text-white">Property Description</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {currentProperty.description}
            </p>
          </div>

          {/* Key Specs */}
          <div className="rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Listing Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-3 border-r dark:border-slate-800">
                <div className="bg-primary-50 dark:bg-primary-950/40 p-2.5 rounded-xl text-primary-600 dark:text-primary-400">
                  <BedDouble className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-slate-500">Bedrooms</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{currentProperty.bedrooms} Bed</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-r dark:border-slate-800">
                <div className="bg-primary-50 dark:bg-primary-950/40 p-2.5 rounded-xl text-primary-600 dark:text-primary-400">
                  <Bath className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-slate-500">Bathrooms</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{currentProperty.bathrooms} Bath</p>
                </div>
              </div>
              <div className="flex items-center gap-3 border-r dark:border-slate-800">
                <div className="bg-primary-50 dark:bg-primary-950/40 p-2.5 rounded-xl text-primary-600 dark:text-primary-400">
                  <Square className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-slate-500">Area size</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{currentProperty.areaSize}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-primary-50 dark:bg-primary-950/40 p-2.5 rounded-xl text-primary-600 dark:text-primary-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-slate-500">Year Built</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{currentProperty.yearBuilt || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities & Features Checklist */}
          <div className="rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <h3 className="text-lg font-bold mb-4 dark:text-white">Features & Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Object.entries(currentProperty.amenities || {}).map(([key, val]) => (
                <div key={key} className="flex items-center gap-2 text-xs font-semibold">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full ${val ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {val ? <Check className="h-3 w-3" /> : <span className="text-[10px]">-</span>}
                  </div>
                  <span className="capitalize text-slate-700 dark:text-slate-300">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Location */}
          <div className="rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-lg font-bold dark:text-white">Coordinates location</h3>
            <div className="h-80 rounded-xl overflow-hidden border dark:border-slate-800">
              <MapContainer center={mapCenter} zoom={14} className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={mapCenter}>
                  <Popup>
                    <span className="text-xs font-bold">{currentProperty.title}</span>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Reviews list and review submit */}
          <div className="rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
            <h3 className="text-lg font-bold dark:text-white">Reviews & Feedback</h3>
            
            {/* Post review */}
            {isAuthenticated && (
              <form onSubmit={handlePostReview} className="space-y-4 border-b pb-6 mb-6 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leave your feedback</p>
                {reviewError && <p className="text-xs text-red-500">{reviewError}</p>}
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-amber-500 p-0.5 hover:scale-110 transition`}
                      >
                        <Star className="h-5 w-5" fill={rating >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Write comment..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:border-primary-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                  />
                  <button type="submit" className="rounded-xl bg-primary-600 px-4 py-2 hover:bg-primary-700 text-white flex items-center justify-center">
                    <Send className="h-4.5 w-4.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Review comments */}
            <div className="space-y-4">
              {reviews.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No reviews yet for this listing. Be the first to leave a feedback!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev._id} className="border-b pb-4 mb-4 last:border-b-0 dark:border-slate-800 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <img src={rev.user?.avatar} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{rev.user?.name}</p>
                          <div className="flex gap-0.5 mt-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className="h-3 w-3" fill={rev.rating >= s ? 'currentColor' : 'none'} />
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <button onClick={() => handleLikeReview(rev._id)} className="flex items-center gap-1 hover:text-primary-600 transition">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          <span>{rev.likes?.length || 0}</span>
                        </button>
                        <button onClick={() => handleReportReview(rev._id)} className="hover:text-red-500">
                          <ShieldAlert className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 pl-10">{rev.comment}</p>

                    {/* Replies list */}
                    {rev.replies?.map((rep, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl ml-10 flex gap-2">
                        <img src={rep.user?.avatar} alt="avatar" className="h-6 w-6 rounded-full object-cover" />
                        <div>
                          <p className="text-[10px] font-bold text-slate-800 dark:text-slate-200">{rep.user?.name} (Agent)</p>
                          <p className="text-xs text-slate-500 mt-0.5">{rep.text}</p>
                        </div>
                      </div>
                    ))}

                    {/* Reply Form (only for listing owner or admin) */}
                    {isAuthenticated && (user.id === currentProperty.owner?._id || user.role === 'admin') && (
                      <div className="flex gap-2 ml-10 pt-2">
                        <input
                          type="text"
                          placeholder="Reply to review..."
                          value={reviewReplyText[rev._id] || ''}
                          onChange={(e) => setReviewReplyText({ ...reviewReplyText, [rev._id]: e.target.value })}
                          className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                        />
                        <button
                          onClick={() => handlePostReply(rev._id)}
                          className="rounded-lg bg-slate-800 px-3 py-1 hover:bg-slate-900 text-white text-[10px] font-semibold dark:bg-slate-700"
                        >
                          Reply
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right 1 column: Contacts card, Booking Widget */}
        <div className="lg:col-span-1 space-y-6">
          {/* Agent info card */}
          <div className="rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-center space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Listing Advertiser</h3>
            <div className="flex flex-col items-center gap-2">
              <img
                src={currentProperty.owner?.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'}
                alt="Agent"
                className="h-16 w-16 rounded-full object-cover border-2 border-primary-500"
              />
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100">{currentProperty.owner?.name}</h4>
                <p className="text-[10px] text-slate-500 capitalize">{currentProperty.owner?.role}</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs">
              <a href={`tel:${currentProperty.owner?.phone}`} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 hover:bg-slate-50 font-semibold dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300">
                <Phone className="h-4 w-4 text-slate-500" />
                <span>Call: {currentProperty.owner?.phone || 'N/A'}</span>
              </a>
              <button
                onClick={handleStartChat}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-white shadow-md hover:bg-primary-700 transition font-semibold"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Contact Agent</span>
              </button>
            </div>
          </div>

          {/* Book Site Visit Schedule */}
          <div className="rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Book Visit</h3>
            
            {bookingStatus === 'success' ? (
              <div className="bg-green-50 p-4 rounded-xl text-center space-y-2 dark:bg-green-950/20">
                <Check className="mx-auto h-8 w-8 text-green-500" />
                <p className="text-xs font-bold text-green-700 dark:text-green-400">Booking requested!</p>
                <p className="text-[10px] text-slate-500">Wait for agent confirmation in your booking schedules inbox.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Date</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Time slot</label>
                  <select
                    required
                    value={visitTime}
                    onChange={(e) => setVisitTime(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                  >
                    <option value="">Choose slot</option>
                    <option value="10:00 AM - 12:00 PM">Morning (10:00 AM - 12:00 PM)</option>
                    <option value="01:00 PM - 03:00 PM">Afternoon (01:00 PM - 03:00 PM)</option>
                    <option value="04:00 PM - 06:00 PM">Evening (04:00 PM - 06:00 PM)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Message for Agent</label>
                  <textarea
                    placeholder="e.g. I want to visit on Sunday..."
                    value={bookingMsg}
                    onChange={(e) => setBookingMsg(e.target.value)}
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={bookingStatus === 'submitting'}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-slate-900 transition dark:bg-slate-700 dark:hover:bg-slate-600"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Book Site Visit</span>
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PropertyDetails;
