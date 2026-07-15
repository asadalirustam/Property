import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { fetchBookings, updateBookingStatus } from '../../redux/bookingSlice';
import { fetchChats, fetchMessages, sendChatMessage, setActiveChat } from '../../redux/chatSlice';
import { 
  Heart, Calendar, MessageSquare, Clock, Trash2, Send, Loader2, MapPin
} from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import { mockPropertiesFallback } from '../../redux/propertySlice';

/* ── Demo favourites shown when user has none saved ── */
const MOCK_FAVORITES = mockPropertiesFallback.filter(p => p.isFeatured).slice(0, 4);

/* ── Demo bookings shown when API returns nothing ── */
const MOCK_BOOKINGS = [
  {
    _id: 'bk_demo_1',
    property: { title: 'Modern 5 Marla Executive Villa in DHA', address: 'Sector C, DHA Phase 6, Lahore' },
    agent: { name: 'Ali Real Estate Agency' },
    visitDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    visitTime: '11:00 AM',
    status: 'approved',
  },
  {
    _id: 'bk_demo_2',
    property: { title: '3 Bedroom House in Gulberg III', address: 'Block E, Gulberg III, Lahore' },
    agent: { name: 'Kareem Properties' },
    visitDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    visitTime: '03:00 PM',
    status: 'pending',
  },
];

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('favorites');
  const { user } = useSelector((state) => state.auth);
  const { bookings, loading: bookingLoading } = useSelector((state) => state.bookings);
  const { chats, messages, activeChatId, loading: chatLoading } = useSelector((state) => state.chat);
  const [typedMessage, setTypedMessage] = useState('');

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
    } else {
      setActiveTab('favorites');
    }
  }, [location.pathname, searchParams, dispatch]);

  // Load tab-specific data only when needed
  useEffect(() => {
    if (activeTab === 'bookings') {
      dispatch(fetchBookings());
    } else if (activeTab === 'messages') {
      dispatch(fetchChats());
    }
  }, [activeTab, dispatch]);

  const handleBookingCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this visit slot?')) return;
    try {
      await dispatch(updateBookingStatus({
        id: bookingId,
        statusData: { status: 'cancelled' }
      })).unwrap();
    } catch {
      // Handled locally for demo/offline resilience
    }
  };

  const handleSelectChat = (chatId) => {
    navigate(`/customer/messages?chatId=${chatId}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatId) return;
    try {
      await dispatch(sendChatMessage({ chatId: activeChatId, text: typedMessage })).unwrap();
      setTypedMessage('');
    } catch {
      setTypedMessage('');
    }
  };

  const favoritesToShow = user?.favorites?.length > 0 ? user.favorites : MOCK_FAVORITES;
  const bookingsToShow = bookings.length > 0 ? bookings : MOCK_BOOKINGS;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-slate-900 p-6 text-white mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 dark:bg-slate-950">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png'}
            alt="avatar"
            className="h-16 w-16 rounded-full border-2 border-primary-500 object-cover"
          />
          <div>
            <h1 className="text-xl font-bold font-sans">Welcome Back, {user?.name || 'Customer'}</h1>
            <p className="text-xs text-slate-400">Customer account — track visits and saved listings</p>
          </div>
        </div>
        <div className="flex gap-4 text-center text-xs">
          <div className="bg-slate-800 rounded-xl px-4 py-2">
            <p className="text-slate-400">Favorites</p>
            <p className="text-lg font-bold text-primary-400">{favoritesToShow.length}</p>
          </div>
          <div className="bg-slate-800 rounded-xl px-4 py-2">
            <p className="text-slate-400">Bookings</p>
            <p className="text-lg font-bold text-indigo-400">{bookingsToShow.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <div className="lg:col-span-1 rounded-2xl border bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <button
            onClick={() => navigate('/customer/favorites')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'favorites' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Heart className="h-4 w-4" />
            <span>Saved Favorites</span>
          </button>
          <button
            onClick={() => navigate('/customer/bookings')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'bookings' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Calendar className="h-4 w-4" />
            <span>Visits Schedule</span>
          </button>
          <button
            onClick={() => navigate('/customer/messages')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'messages' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Messages Inbox</span>
          </button>
        </div>

        <div className="lg:col-span-3">
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold dark:text-white font-sans">Saved Properties</h2>
                {favoritesToShow === MOCK_FAVORITES && (
                  <span className="text-[10px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full px-2 py-0.5 font-semibold">Demo data</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {favoritesToShow.map((prop) => (
                  <PropertyCard key={prop._id} property={prop} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold dark:text-white font-sans">Your Visits Timeline</h2>
                {bookingsToShow === MOCK_BOOKINGS && (
                  <span className="text-[10px] bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 rounded-full px-2 py-0.5 font-semibold">Demo data</span>
                )}
              </div>
              {bookingLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
              ) : (
                <div className="space-y-4">
                  {bookingsToShow.map((booking) => (
                    <div key={booking._id} className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{booking.property?.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />{booking.property?.address}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-slate-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {new Date(booking.visitDate).toLocaleDateString('en-PK', { weekday: 'short', day: 'numeric', month: 'short' })} at {booking.visitTime}
                          </span>
                          <span>Agent: {booking.agent?.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                          booking.status === 'approved' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                          booking.status === 'rejected' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          booking.status === 'cancelled' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                          'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                          {booking.status}
                        </span>
                        {booking.status === 'pending' && (
                          <button
                            onClick={() => handleBookingCancel(booking._id)}
                            className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition dark:border-red-900 dark:hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 rounded-2xl border bg-white dark:border-slate-800 dark:bg-slate-900 overflow-hidden shadow-sm h-[500px]">
              <div className="sm:col-span-1 border-r dark:border-slate-800 flex flex-col">
                <div className="p-3 border-b dark:border-slate-800">
                  <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">Inbox Threads</h3>
                </div>
                <div className="flex-1 overflow-y-auto divide-y dark:divide-slate-800">
                  {chats.length === 0 ? (
                    <div className="p-4 text-center">
                      <MessageSquare className="h-8 w-8 text-slate-200 dark:text-slate-700 mx-auto mb-2" />
                      <p className="text-[10px] text-slate-500">No active chats yet.<br/>Contact an agent from a property listing to start a conversation.</p>
                    </div>
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
              <div className="sm:col-span-2 flex flex-col h-full bg-slate-50 dark:bg-slate-900/30">
                {activeChatId ? (
                  <>
                    <div className="p-3 border-b bg-white dark:border-slate-800 dark:bg-slate-900">
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
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col justify-center items-center p-6 text-center text-slate-500">
                    <MessageSquare className="h-10 w-10 mb-2 text-slate-200 dark:text-slate-700" />
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

export default CustomerDashboard;
