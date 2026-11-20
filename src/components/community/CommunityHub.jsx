import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getUsers, getCommunityFeed, addCommunityFeed } from '../../services/db';
import RatingStars from '../common/RatingStars';
import {
  Users,
  MessageSquare,
  Sparkles,
  MapPin,
  ShieldCheck,
  Send,
  Heart,
  PlusCircle,
  Share2
} from 'lucide-react';

export default function CommunityHub() {
  const { currentUser, setModalState, showToast, refreshData, refreshTick } = useApp();
  const allUsers = getUsers();
  const feed = getCommunityFeed();

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'directory' | 'requests'
  const [newPostText, setNewPostText] = useState('');

  const handlePostWishlist = (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    addCommunityFeed({
      userName: currentUser.fullName,
      userAvatar: currentUser.avatar,
      neighbourhood: currentUser.neighbourhood,
      actionText: `posted a neighbourhood tool wish: "${newPostText.trim()}"`,
      timeAgo: 'Just now',
      type: 'wishlist',
      impactStat: 'Community Help Request'
    });

    setNewPostText('');
    showToast('Your tool request was posted to the neighbourhood feed!', 'success');
    refreshData();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-3xl p-8 text-white shadow-lg mb-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-white/10 px-3 py-1 rounded-full">
              Neighbourhood Commons
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">
              Connected Communities Share More
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Meet your verified neighbours in Indiranagar, Koramangala, and HSR Layout.
              Browse lender reputations, see what is actively being shared, or ask for hard-to-find tools.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-6 pt-4 border-t border-white/10 text-xs">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'feed' ? 'bg-white text-slate-900 shadow-xs' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Activity Feed
            </button>
            <button
              onClick={() => setActiveTab('directory')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'directory' ? 'bg-white text-slate-900 shadow-xs' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Neighbour Directory ({allUsers.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`px-4 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'requests' ? 'bg-white text-slate-900 shadow-xs' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Tool Wishlist Board
            </button>
          </div>
        </div>

        {/* TAB 1: ACTIVITY FEED */}
        {activeTab === 'feed' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {/* Quick Post Box */}
              <form onSubmit={handlePostWishlist} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center gap-3 mb-3">
                  <img src={currentUser.avatar} alt={currentUser.fullName} className="w-9 h-9 rounded-full object-cover" />
                  <input
                    type="text"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                    placeholder="Ask neighbours: Need a pressure washer, tile cutter or carpet cleaner this weekend?..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:bg-white focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                  >
                    Post
                  </button>
                </div>
              </form>

              {/* Feed Stream */}
              <div className="space-y-3">
                {feed.map((entry) => (
                  <div key={entry.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3.5 text-xs">
                    <img src={entry.userAvatar} alt={entry.userName} className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{entry.userName}</span>
                        <span className="text-[11px] text-slate-400">{entry.timeAgo}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {entry.actionText}{' '}
                        {entry.targetUserName && <span className="font-semibold text-slate-900">{entry.targetUserName}</span>}
                      </p>
                      {entry.impactStat && (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <Sparkles size={12} />
                          <span>{entry.impactStat}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Community Guidelines */}
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3 text-xs">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>Neighbourhood Trust Code</span>
                </h3>
                <ul className="space-y-2 text-slate-600 list-disc list-inside">
                  <li>Clean equipment thoroughly before returning to owner.</li>
                  <li>Perform QR Handover scan in person.</li>
                  <li>Report any minor wear or defect promptly.</li>
                  <li>Keep security deposits within recommended brackets.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEMBER DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allUsers.map((user) => (
              <div key={user.id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-start gap-4">
                    <img src={user.avatar} alt={user.fullName} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-100 shrink-0" />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{user.fullName}</h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-emerald-600" />
                        <span>{user.neighbourhood}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <RatingStars rating={user.rating || 5.0} count={user.ratingCount || 10} size="xs" />
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    "{user.bio || 'Happy to share household tools with caring neighbours!'}"
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Trust Score: {user.trustScore || 95}%
                  </span>

                  <button
                    onClick={() => {
                      setModalState(s => ({
                        ...s,
                        messenger: true,
                        activeChatRequest: {
                          id: `direct_chat_${user.id}`,
                          ownerName: user.fullName,
                          ownerId: user.id,
                          borrowerId: currentUser.id
                        }
                      }));
                    }}
                    className="font-bold text-brand-700 hover:text-brand-800 flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>Chat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: WISHLIST BOARD */}
        {activeTab === 'requests' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Neighbourhood Wishlist Board</h2>
              <p className="text-xs text-slate-500 mt-1">
                Looking for a special tool that isn't listed yet? Ask neighbours here so someone can list theirs!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Hedge Shear / Garden Edger</span>
                  <span className="text-[10px] text-amber-700">Indiranagar</span>
                </div>
                <p className="text-slate-600">
                  "Need a manual or electric hedge shear for trimming garden bougainvillea this Sunday morning."
                </p>
                <div className="text-[11px] text-slate-400">— Posted by Priya P. (2 days ago)</div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-sky-900">
                  <span>Heavy Car Jack (Hydraulic)</span>
                  <span className="text-[10px] text-sky-700">Koramangala</span>
                </div>
                <p className="text-slate-600">
                  "Need a hydraulic 2-ton bottle jack for brake pad maintenance for 3 hours."
                </p>
                <div className="text-[11px] text-slate-400">— Posted by Vikram S. (3 days ago)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
