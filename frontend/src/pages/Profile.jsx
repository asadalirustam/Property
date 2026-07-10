import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateProfile } from '../redux/authSlice';
import { User, Phone, Lock, Save, Loader2, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [localErr, setLocalErr] = useState('');

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccess('');
    setLocalErr('');

    if (password && password !== confirmPassword) {
      return setLocalErr('Passwords do not match');
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    if (password) formData.append('password', password);
    if (avatar) formData.append('avatar', avatar);

    try {
      await dispatch(updateProfile(formData)).unwrap();
      setSuccess('Profile updated successfully!');
      setPassword('');
      setConfirmPassword('');
      setAvatar(null);
    } catch (err) {
      setLocalErr(err || 'Failed to update profile');
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white font-sans">Profile Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Configure your personal information and credentials</p>
      </div>

      {(success || success === '') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar / Overview Card */}
          <div className="md:col-span-1 rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm text-center space-y-4">
            <div className="relative inline-block">
              <img
                src={avatar ? URL.createObjectURL(avatar) : (user?.avatar || 'https://cdn-icons-png.flaticon.com/512/147/147144.png')}
                alt="Avatar"
                className="mx-auto h-24 w-24 rounded-full object-cover border-4 border-primary-500 shadow-md"
              />
            </div>
            
            <div>
              <h2 className="font-bold text-slate-800 dark:text-slate-100">{user?.name}</h2>
              <p className="text-[10px] text-slate-400 capitalize font-semibold">{user?.role} Account</p>
            </div>

            <div className="border-t pt-4 text-left space-y-2 text-xs">
              <p className="text-slate-500">Email: <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.email}</span></p>
              <p className="text-slate-500">Status: <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-[10px] font-bold">Active</span></p>
            </div>
          </div>

          {/* Form details Card */}
          <div className="md:col-span-2 rounded-2xl border bg-white p-6 dark:border-slate-800 dark:bg-slate-900 shadow-sm space-y-6">
            {success && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs text-green-600 dark:bg-green-950/20 dark:text-green-400">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {(localErr || error) && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/20 dark:text-red-400">
                <AlertCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{localErr || error}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:border-primary-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Update Avatar Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 file:transition dark:file:bg-slate-800 dark:file:text-slate-300"
                />
              </div>

              <div className="border-t pt-4 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Change Password (leave empty to keep current)</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs focus:outline-none dark:border-slate-800 dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-primary-700 transition disabled:opacity-50 mt-6"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                  <>
                    <Save className="h-4.5 w-4.5" />
                    <span>Save Profiles Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
