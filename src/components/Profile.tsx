import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Award, 
  Camera, 
  Save, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  addToast: (text: string, type: 'success' | 'info' | 'warning' | 'danger') => void;
}

export default function Profile({ profile, onUpdateProfile, addToast }: ProfileProps) {
  const [username, setUsername] = useState(profile.username);
  const [role, setRole] = useState(profile.role);
  const [email, setEmail] = useState('kafasamira2019@gmail.com');
  const [bio, setBio] = useState('Central HR Administrator - Managing signature records, compliance, and staff auditing operations.');

  // Handle avatar upload and convert to base64
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Profile picture must be under 2MB in size.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateProfile({
          ...profile,
          avatar: reader.result
        });
        addToast('Profile avatar updated successfully!', 'success');
      }
    };
    reader.onerror = () => {
      addToast('Failed to read image file.', 'danger');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      addToast('Username cannot be empty.', 'warning');
      return;
    }
    if (!role.trim()) {
      addToast('Active role title cannot be empty.', 'warning');
      return;
    }

    onUpdateProfile({
      ...profile,
      username: username.trim().toLowerCase(),
      role: role.trim()
    });
    addToast('Profile details updated successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-display font-bold text-2xl md:text-3xl tracking-tight text-slate-900 dark:text-white">
          Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your personal system avatar, authorization role, and contact credentials.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="glass-panel rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          {/* Header Cover Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute top-3.5 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> SECURED MODULE
            </div>
          </div>

          <div className="px-6 md:px-8 pb-8 relative">
            {/* Interactive Profile Avatar */}
            <div className="absolute -top-12 left-6 md:left-8">
              <div className="relative group">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt={profile.username} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-display font-bold text-3xl flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-md">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
                
                {/* Camera Overlay Trigger */}
                <label 
                  htmlFor="profile-avatar-upload"
                  className="absolute inset-0 bg-black/40 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150 cursor-pointer"
                >
                  <Camera className="w-5 h-5" />
                </label>
                <input
                  type="file"
                  id="profile-avatar-upload"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Profile Info Summary */}
            <div className="pt-16 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-display font-bold text-xl text-slate-800 dark:text-white capitalize flex items-center gap-2">
                    {profile.username} <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                  </h3>
                  {profile.role && profile.role.toLowerCase() !== 'administrator' && (
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                      {profile.role}
                    </p>
                  )}
                </div>
                <span className="self-start sm:self-center text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 rounded-full">
                  System Superuser
                </span>
              </div>
            </div>

            {/* Editing Form */}
            <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" /> Username (Sign-in Identifier)
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
                  />
                </div>

                {/* Role Title Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> System Role Title
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200"
                />
              </div>

              {/* Bio/Profile Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Profile Bio / Job Summary
                </label>
                <textarea
                  value={bio}
                  rows={3}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:border-blue-500 text-slate-700 dark:text-slate-200 resize-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/10 transition"
                >
                  <Save className="w-4 h-4" /> Save Profile Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
