import React, { useRef, useEffect, useState } from "react";
import { get } from '../utils/api';

export default function Reels() {
  const containerRef = useRef();
  const [reels, setReels] = useState([]);
  useEffect(() => {
    get('/reels').then(setReels).catch(() => setReels([]));
  }, []);
  return (
    <div ref={containerRef} className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory">
      {reels.map((reel) => (
        <div key={reel._id} className="relative h-screen w-full flex flex-col items-center justify-center snap-start">
          <video
            src={reel.video}
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* Overlay */}
          <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end">
            <div className="flex items-center mb-2">
              {/* You may want to check if reel.user is populated */}
              <img src={reel.user?.avatar} alt={reel.user?.username} className="w-10 h-10 rounded-full object-cover border-2 border-white mr-2" />
              <span className="text-white font-semibold">{reel.user?.username}</span>
            </div>
            <div className="text-white text-sm mb-2">{reel.caption}</div>
            <div className="flex items-center gap-6 text-white text-xl">
              <button className="hover:text-pink-500 transition"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.04 3 12.5 3.99 13 5.36C13.5 3.99 14.96 3 16.5 3C19.5 3 22 5.5 22 8.5C22 13.5 12 21 12 21Z" /></svg></button>
              <button className="hover:text-blue-400 transition"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" /></svg></button>
              <button className="hover:text-green-400 transition"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14" /></svg></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 