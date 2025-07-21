import React, { useEffect, useState } from 'react';
import { get, post } from '../utils/api';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  useEffect(() => {
    get('/notifications').then(setNotifications);
    // Mark all as read when opening the page
    post('/notifications/mark-all-read');
  }, []);
  return (
    <div className="p-4 bg-[#181818] min-h-screen text-white">
      <h2 className="text-xl font-bold mb-4">Notifications</h2>
      {notifications.length === 0 && <div className="text-gray-400">No notifications yet.</div>}
      {notifications.map(n => (
        <div key={n._id} className="flex items-center gap-3 mb-3 bg-[#232323] p-3 rounded-lg">
          {n.from && (
            <img src={n.from.avatar} alt={n.from.username} className="w-8 h-8 rounded-full object-cover" />
          )}
          <span>
            <b>{n.from?.username || 'Someone'}</b> {n.type === 'like' ? 'liked' : 'commented on'} your post
          </span>
        </div>
      ))}
    </div>
  );
} 