import React, { useEffect, useRef, useState } from "react";
import { post as apiPost } from '../utils/api';

const EMOJIS = ["🔥", "😍", "👏", "😂", "😮", "😭"];

function timeAgo(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function StoryViewer({ story, onClose, onNext, onPrev, timeAgo: createdAt, user, storyIdx, totalStories }) {
  const [progress, setProgress] = useState(0);
  const timerRef = useRef();
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emojiAnim, setEmojiAnim] = useState(null);
  const touchStartX = useRef(null);

  // Progress bar animation for current story
  useEffect(() => {
    setProgress(0);
    timerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(timerRef.current);
          onNext && onNext();
          return 100;
        }
        return p + 2;
      });
    }, 50); // 2.5s total
    return () => clearInterval(timerRef.current);
  }, [story, onNext]);

  // Tap navigation
  const handleTap = (e) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    if (x < width / 2) {
      onPrev && onPrev();
    } else {
      onNext && onNext();
    }
  };

  // Swipe navigation
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > 50) {
      onPrev && onPrev();
    } else if (deltaX < -50) {
      onNext && onNext();
    }
    touchStartX.current = null;
  };

  // Emoji quick reaction
  const handleEmoji = (emoji) => {
    setEmojiAnim(emoji);
    setTimeout(() => setEmojiAnim(null), 1000);
    setComment(emoji);
    handleAddComment(null, emoji);
  };

  const handleAddComment = async (e, emoji) => {
    if (e) e.preventDefault();
    if (!(comment.trim() || emoji)) return;
    setLoading(true);
    try {
      await apiPost(`/stories/${story._id}/comments`, { text: emoji || comment });
      setComment("");
    } catch (err) {
      setError("Failed to send message");
    }
    setLoading(false);
  };

  if (!story) return null;
  const storyImage = story.image || story.storyImage || story.avatar;
  const caption = story.caption || '';
  const username = user?.username || story.user?.username || story.username;
  const avatar = user?.avatar || story.user?.avatar || story.avatar;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black"
      onClick={handleTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top gradient overlay */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent z-10" />
      {/* Bottom gradient overlay */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/80 to-transparent z-10" />
      {/* Story group progress bars */}
      <div className="absolute top-0 left-0 w-full flex z-20 gap-1 px-2 pt-2">
        {Array.from({ length: totalStories }).map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded-full ${idx < storyIdx ? 'bg-white' : idx === storyIdx ? 'bg-white' : 'bg-white/30'}`}
            style={idx === storyIdx ? { width: `${progress}%`, transition: 'width 0.05s linear' } : {}}
          />
        ))}
      </div>
      {/* Top bar */}
      <div className="absolute top-4 left-4 z-20 flex items-center">
        <img src={avatar} alt={username} className="w-10 h-10 rounded-full border-2 border-white mr-3" />
        <span className="text-white font-semibold text-lg">{username}</span>
        <span className="text-gray-300 text-xs ml-3">{timeAgo(createdAt)}</span>
      </div>
      <button className="absolute top-4 right-4 text-white text-3xl z-20" onClick={e => { e.stopPropagation(); onClose(); }}>&times;</button>
      {/* Story image */}
      <img src={storyImage} alt="story" className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-lg z-10" />
      {/* Animated emoji reaction */}
      {emojiAnim && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-bounce text-6xl select-none">
          {emojiAnim}
        </div>
      )}
      {/* Caption */}
      {caption && (
        <div className="absolute bottom-32 left-0 w-full text-center z-20">
          <span className="text-white text-base px-4">{caption}</span>
        </div>
      )}
      {/* Viewers list placeholder */}
      <div className="absolute bottom-8 left-4 z-20 text-xs text-gray-300 bg-black/40 px-2 py-1 rounded-full">
        {/* TODO: Replace with real viewers */}
        Viewed by: (coming soon)
      </div>
      {/* Bottom bar: emoji reactions and reply */}
      <div className="absolute bottom-8 left-0 w-full flex flex-col items-center z-20">
        <div className="flex gap-3 mb-2">
          {EMOJIS.map(e => (
            <button key={e} className="text-2xl" onClick={ev => { ev.stopPropagation(); handleEmoji(e); }}>{e}</button>
          ))}
        </div>
        <form className="flex w-3/4 mx-auto" onSubmit={handleAddComment}>
          <input
            className="flex-1 px-4 py-2 rounded-full bg-[#232323] text-white border border-gray-700 focus:outline-none"
            placeholder="Send message..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={loading}
          />
          <button className="ml-2 px-4 py-2 rounded-full bg-blue-600 text-white font-semibold" type="submit" disabled={loading || !comment.trim()}>Send</button>
        </form>
        {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
      </div>
    </div>
  );
} 