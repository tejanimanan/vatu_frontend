import React, { useRef, useEffect, useState } from "react";

const PEXELS_API_KEY = "JVMpKFEdA7Wv07eamBNp2H5THX4yeiqkNH1Jjjdaymcue6WHJ7JiFXZA";
const DEFAULT_QUERY = "funny";
const OPTIONS = [
  { label: "Funny", value: "funny" },
  { label: "Nature", value: "nature" },
  { label: "Animals", value: "animals" },
  { label: "Dance", value: "dance" },
  { label: "Sports", value: "sports" },
  { label: "Memes", value: "memes" },
  { label: "Pranks", value: "pranks" },
  { label: "Music", value: "music" },
  { label: "Travel", value: "travel" },
];

export default function Reels() {
  const containerRef = useRef();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [muted, setMuted] = useState({});

  useEffect(() => {
    async function fetchReels() {
      setLoading(true);
      try {
        const url = `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=10`;
        const res = await fetch(url, {
          headers: {
            Authorization: PEXELS_API_KEY,
          },
        });
        const data = await res.json();
        setReels(data.videos || []);
      } catch (err) {
        setReels([]);
      }
      setLoading(false);
    }
    fetchReels();
  }, [query]);

  const handleMuteToggle = (id) => {
    setMuted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div ref={containerRef} className="h-screen w-full bg-[#181818] overflow-y-scroll  ">
      {/* Dropdown below header, full width */}
      <div className="w-full bg-[#181818] px-4 pt-4 pb-2 flex items-center justify-between" style={{ zIndex: 10, position: 'relative' }}>
        <h2 className="text-white text-xl font-bold">Reels</h2>
        <select
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="bg-[#232323] text-white rounded px-3 py-1 border border-gray-700 focus:outline-none w-40"
        >
          {OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="pt-8">
        {loading && <div className="text-white text-center">Loading reels...</div>}
        {reels.map((reel) => (
          <div key={reel.id} className="relative h-[70vh] w-full flex flex-col items-center justify-center snap-start mb-8">
            <video
              src={reel.video_files?.[0]?.link}
              className="h-full w-full object-cover rounded-xl shadow-lg"
              autoPlay
              loop
              muted={muted[reel.id] !== false}
              playsInline
              controls={false}
            />
            {/* Mute/Unmute Button */}
            <button
              onClick={() => handleMuteToggle(reel.id)}
              className="absolute bottom-24 right-6 bg-black/60 text-white rounded-full p-2 z-10 border border-white"
              style={{ fontSize: 22 }}
            >
              {muted[reel.id] === false ? '🔊' : '🔇'}
            </button>
            {/* Overlay */}
            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end rounded-b-xl">
              <div className="flex items-center mb-2">
                <img src={reel.user?.image || '/default-avatar.png'} alt={reel.user?.name} className="w-10 h-10 rounded-full object-cover border-2 border-white mr-2" />
                <span className="text-white font-semibold">{reel.user?.name || 'Pexels'}</span>
              </div>
              <div className="text-white text-sm mb-2">{reel.description || 'Demo reel from Pexels'}</div>
              <div className="flex items-center gap-6 text-white text-xl">
                <button className="hover:text-pink-500 transition"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.04 3 12.5 3.99 13 5.36C13.5 3.99 14.96 3 16.5 3C19.5 3 22 5.5 22 8.5C22 13.5 12 21 12 21Z" /></svg></button>
                <button className="hover:text-blue-400 transition"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" /></svg></button>
                <button className="hover:text-green-400 transition"><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 1l4 4-4 4M3 11v-1a4 4 0 0 1 4-4h14" /></svg></button>
              </div>
            </div>
          </div>
        ))}
        {!loading && reels.length === 0 && <div className="text-white text-center">No demo reels found.</div>}
      </div>
    </div>
  );
} 