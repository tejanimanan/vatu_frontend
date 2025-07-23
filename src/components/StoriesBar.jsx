import React, { useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { post, get } from '../utils/api';
import StoryViewer from './StoryViewer';

const StoryBar = ({ stories: propStories, onStoryClick }) => {
  const fileInputRef = useRef(null);
  const [image, setImage] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [text, setText] = useState('');
  const [textPosition, setTextPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [stories, setStories] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  // Fetch stories and user on mount
  React.useEffect(() => {
    get('/stories').then(allStories => {
      // Only keep stories from last 24 hours
      const now = Date.now();
      const filtered = (allStories || []).filter(s => {
        return (now - new Date(s.createdAt).getTime()) < 24 * 60 * 60 * 1000;
      });
      setStories(filtered);
    });
    get('/users/me').then(setCurrentUser);
  }, []);

  // Upload image handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setShowUpload(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag Functions
  const startDrag = (e) => {
    setDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    setOffset({
      x: clientX - textPosition.x,
      y: clientY - textPosition.y,
    });
  };

  const onDrag = (e) => {
    if (!dragging) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    setTextPosition({
      x: clientX - offset.x,
      y: clientY - offset.y,
    });
  };

  const stopDrag = () => {
    setDragging(false);
  };

  // Save story via API
  const handlePostStory = async () => {
    try {
      let imageUrl = image;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        // Use the same upload logic as CreatePost.jsx
        const res = await post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        imageUrl = res.url;
      }
      await post('/stories', {
        image: imageUrl,
        caption: text,
        isOwn: true,
      });
      alert('Story posted successfully!');
      setImage(null);
      setImageFile(null);
      setText('');
      setShowUpload(false);
    } catch (err) {
      console.error('Failed to post story:', err);
      alert('Failed to post story');
    }
  };

  // Find if current user has a story
  const myStoryIdx = stories.findIndex(s => s.user?._id === currentUser?._id);
  const myStory = myStoryIdx !== -1 ? stories[myStoryIdx] : null;

  // Group stories by user (for future multi-story per user)
  const grouped = [];
  const seen = new Set();
  for (const s of stories) {
    const uid = s.user?._id || s.user;
    if (!seen.has(uid)) {
      grouped.push(s);
      seen.add(uid);
    }
  }

  // Open viewer for a story
  const handleStoryClick = idx => {
    setCurrentStoryIdx(idx);
    setViewerOpen(true);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Stories Bar with circular avatars */}
      <div className="flex items-center gap-3 w-full px-2 py-3 bg-[#181818] rounded-b-xl overflow-x-auto">
        {/* Your Story (upload or view) */}
        <button
          onClick={() => myStory ? handleStoryClick(grouped.findIndex(s => s.user?._id === currentUser?._id)) : fileInputRef.current.click()}
          className="flex flex-col items-center justify-center focus:outline-none"
        >
          <div className={`w-16 h-16 rounded-full ${myStory ? 'bg-gradient-to-tr from-pink-500 via-yellow-400 to-purple-500' : 'bg-gray-700'} flex items-center justify-center border-4 border-[#181818] relative`}>
            {myStory ? (
              <img src={currentUser?.avatar} alt="My Story" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white text-3xl font-bold">+</span>
            )}
          </div>
          <span className="text-xs text-white mt-1">Your Story</span>
        </button>
        {/* Other users' stories */}
        {grouped.filter(s => s.user?._id !== currentUser?._id).map((s, idx) => (
          <button
            key={s._id}
            onClick={() => handleStoryClick(grouped.findIndex(st => st._id === s._id))}
            className="flex flex-col items-center justify-center focus:outline-none"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 via-yellow-400 to-purple-500 flex items-center justify-center border-4 border-[#181818]">
              <img src={s.user?.avatar} alt={s.user?.username} className="w-full h-full rounded-full object-cover" />
            </div>
            <span className="text-xs text-white mt-1">{s.user?.username}</span>
          </button>
        ))}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          className="hidden"
        />
      </div>

      {/* Story Upload Modal */}
      {showUpload && image && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onMouseMove={onDrag}
          onMouseUp={stopDrag}
          onTouchMove={onDrag}
          onTouchEnd={stopDrag}
        >
          <div className="relative w-[95vw] max-w-[380px] h-[80vh] max-h-[700px] bg-black rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-700">
            {/* Close Button */}
            <button
              onClick={() => {
                setImage(null);
                setImageFile(null);
                setText('');
                setShowUpload(false);
              }}
              className="absolute top-4 right-4 z-20 text-white text-2xl bg-black/60 rounded-full w-9 h-9 flex items-center justify-center hover:bg-black/80"
              title="Close"
            >
              &times;
            </button>

            {/* Image Preview */}
            <img
              src={image}
              alt="Story Preview"
              className="w-full h-full object-cover rounded-2xl"
            />

            {/* Draggable Text Overlay */}
            <div
              className="absolute px-4 py-2 text-white text-xl font-semibold rounded-lg bg-black/40 cursor-move select-none shadow-lg"
              style={{ left: textPosition.x, top: textPosition.y, minWidth: '120px', maxWidth: '80%' }}
              onMouseDown={startDrag}
              onTouchStart={startDrag}
            >
              {text || <span className="text-gray-300">Your text here</span>}
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-28 left-4 z-50 scale-90">
                <EmojiPicker
                  onEmojiClick={(emojiData) => setText((prev) => prev + emojiData.emoji)}
                  height={300}
                  width={250}
                />
              </div>
            )}

            {/* Caption Input & Emoji Button */}
            <div className="absolute bottom-20 left-0 w-full flex items-center px-6 gap-2">
              <input
                type="text"
                placeholder="Add a caption..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 px-4 py-2 rounded-full bg-white/90 text-black text-base outline-none shadow"
                maxLength={100}
              />
              <button
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="text-2xl text-gray-700 bg-white/80 rounded-full w-10 h-10 flex items-center justify-center hover:bg-white"
                title="Add emoji"
                type="button"
              >
                😊
              </button>
            </div>

            {/* Post Button */}
            <button
              onClick={handlePostStory}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 px-8 py-3 bg-gradient-to-r from-pink-500 to-yellow-400 text-white text-lg rounded-full font-bold shadow-lg hover:scale-105 transition"
            >
              Your Story
            </button>
          </div>
        </div>
      )}

      {/* Story Viewer Modal */}
      {viewerOpen && grouped[currentStoryIdx] && (
        <StoryViewer
          story={grouped[currentStoryIdx]}
          user={grouped[currentStoryIdx].user}
          timeAgo={grouped[currentStoryIdx].createdAt}
          storyIdx={currentStoryIdx}
          totalStories={grouped.length}
          onClose={() => setViewerOpen(false)}
          onNext={() => setCurrentStoryIdx(i => (i + 1 < grouped.length ? i + 1 : 0))}
          onPrev={() => setCurrentStoryIdx(i => (i - 1 >= 0 ? i - 1 : grouped.length - 1))}
        />
      )}
    </div>
  );
};

export default StoryBar;