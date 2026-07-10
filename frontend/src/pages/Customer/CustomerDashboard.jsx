import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loadUser } from '../../redux/authSlice';
import { fetchBookings, updateBookingStatus } from '../../redux/bookingSlice';
import { fetchChats, fetchMessages, sendChatMessage, setActiveChat } from '../../redux/chatSlice';
import { 
  Heart, Calendar, MessageSquare, User, Settings, CheckCircle, Clock, Trash2, Send, Loader2
} from 'lucide-react';
import PropertyCard from '../../components/PropertyCard';
import api from '../../utils/api';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  
  // States
  const [activeTab, setActiveTab] = useState('favorites'); // favorites, bookings, messages
  const { user } = useSelector((state) => state.auth);
  const { bookings, loading: bookingLoading } = useSelector((state) => state.bookings);
  const { chats, messages, activeChatId, loading: chatLoading } = useSelector((state) => state.chat);
  
  const [typedMessage, setTypedMessage] = useState('');

  useEffect(() => {
    dispatch(loadUser());
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
      alert('Booking visit cancelled.');
    } catch (err) {
      alert(err || 'Failed to cancel booking.');
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
      {/* Overview Banner */}
      <div className="rounded-3xl bg-slate-900 p-6 text-white mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 dark:bg-slate-950">
        <div className="flex items-center gap-4">
          <img src={user?.avatar} alt="avatar" className="h-16 w-16 rounded-full border-2 border-primary-500 object-cover" />
          <div>
            <h1 className="text-xl font-bold font-sans">Welcome Back, {user?.name}</h1>
            <p className="text-xs text-slate-500">Customer account - track visits and saved listings</p>
          </div>
        </div>
        <div className="flex gap-4 text-center text-xs">
          <div className="bg-slate-800 rounded-xl px-4 py-2">
            <p className="text-slate-500">Favorites</p>
            <p className="text-lg font-bold text-primary-500">{user?.favorites?.length || 0}</p>
          </div>
          <div className="bg-slate-800 rounded-xl px-4 py-2">
            <p className="text-slate-500">Bookings</p>
            <p className="text-lg font-bold text-indigo-500">{bookings.length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 rounded-2xl border bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-1">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'favorites' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Heart className="h-4.5 w-4.5" />
            <span>Saved Favorites</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'bookings' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            <span>Visits Schedule</span>
          </button>

          <button
            onClick={() => setActiveTab('messages')}
            className={`w-full flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'messages' ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="h-4.5 w-4.5" />
            <span>Messages Inbox</span>
          </button>
        </div>

        {/* Content Pane */}
        <div className="lg:col-span-3">
          
          {/* Favorites List */}
          {activeTab === 'favorites' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold dark:text-white font-sans">Saved Properties</h2>
              {!user?.favorites || user.favorites.length === 0 ? (
                <p className="text-xs text-slate-500 py-10 text-center">No properties saved yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {user.favorites.map((prop) => (
                    <PropertyCard key={prop._id} property={prop} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bookings Tracker */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold dark:text-white font-sans">Your Visits Timeline</h2>
              {bookingLoading ? (
                <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary-500" /></div>
              ) : bookings.length === 0 ? (
                <p className="text-xs text-slate-500 py-10 text-center">No visits requested yet.</p>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking._id} className="rounded-2xl border bg-white p-4 dark:border-slate-800 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">{booking.property?.title}</h4>
                        <p className="text-[10px] text-slate-500 mt-1">{booking.property?.address}</p>
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-[10px] text-slate-500 font-semibold">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(booking.visitDate).toLocaleDateString()} at {booking.visitTime}</span>
                          <span className="text-slate-500">Agent: {booking.agent?.name}</span>
                        </div>
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
                          <button
                            onClick={() => handleBookingCancel(booking._id)}
                            className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50 transition"
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
                    {/* Header */}
                    <div className="p-3 border-b bg-white dark:border-slate-800 dark:bg-slate-900 flex items-center gap-3">
                      <h3 className="font-bold text-xs text-slate-700 dark:text-slate-200">
                        Chat log
                      </h3>
                    </div>

                    {/* Messages Body */}
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

                    {/* Message form */}
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

        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
