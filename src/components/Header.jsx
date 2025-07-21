import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegBell, FaRegCommentDots } from 'react-icons/fa';
import { get } from '../utils/api';

export default function Header() {
  const navigate = useNavigate();
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [unreadMsg, setUnreadMsg] = useState(0);

  useEffect(() => {
    get('/notifications?unread=true').then(nots => {
      setUnreadNotif(nots.length);
    });
    get('/conversations/unread-count').then(res => {
      setUnreadMsg(res.count || 0);
    });
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 max-w-md mx-auto bg-[#181818] border-b border-gray-800 flex items-center justify-between p-4 z-50">
      <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'cursive' }}>
        Beloved❤️
      </h1>
      <div className="flex items-center gap-4 relative">
        <button onClick={() => navigate('/notifications')} className="text-white text-2xl relative">
          <FaRegBell />
          {unreadNotif > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full px-2 py-0.5">
              {unreadNotif}
            </span>
          )}
        </button>
        <button onClick={() => navigate('/messages')} className="text-white text-2xl relative">
          <FaRegCommentDots />
          {unreadMsg > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs text-white rounded-full px-2 py-0.5">
              {unreadMsg}
            </span>
          )}
        </button>
      </div>
    </header>
  );
} 