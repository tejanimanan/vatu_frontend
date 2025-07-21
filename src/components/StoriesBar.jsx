import React, { useState } from "react";
import { post as apiPost, api } from '../utils/api';

function groupStoriesByUser(stories) {
  const groups = {};
  stories.forEach(story => {
    const userId = story.user?._id || story.user || story.username;
    if (!groups[userId]) {
      groups[userId] = {
        user: story.user || { username: story.username, avatar: story.avatar },
        stories: [],
      };
    }
    groups[userId].stories.push(story);
  });
  return Object.values(groups);
}

export default function StoriesBar({ stories, onStoryClick }) {
  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState(null);
  const [image, setImage] = useState("");
  const [caption, setCaption] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setFile(file);
    setError("");
    setSuccess(false);
    setImage("");
    if (file) {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await apiPost('/uploads', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setImage(res.url);
      } catch (err) {
        setError("Image upload failed");
      }
      setLoading(false);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (loading) {
      setError("Please wait for the image to finish uploading.");
      return;
    }
    if (!image) {
      setError("Image is required");
      return;
    }
    setLoading(true);
    try {
      await apiPost('/stories', { image, caption });
      setImage("");
      setFile(null);
      setCaption("");
      setSuccess(true);
      setShowForm(false);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
    } catch (err) {
      setError("Failed to create story");
    }
    setLoading(false);
  };

  const grouped = groupStoriesByUser(stories);

  return (
    <div className="flex space-x-4 overflow-x-auto px-2 py-3 bg-[#181818] rounded-b-lg shadow-sm mb-2 scrollbar-hide">
      {/* Add story button */}
      <div className="flex flex-col items-center min-w-[64px]">
        <button
          className="flex flex-col items-center focus:outline-none"
          style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
          onClick={() => setShowForm(!showForm)}
        >
          <div className="rounded-full p-1 bg-blue-500">
            <span className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl bg-blue-600">+</span>
          </div>
          <span className="text-xs mt-1 text-blue-300 truncate w-16 text-center">Add Story</span>
        </button>
        {showForm && (
          <form className="bg-[#232323] p-2 rounded-lg mt-2 w-48 absolute z-50" onSubmit={handleCreateStory} style={{ left: 0 }}>
            <input
              type="file"
              accept="image/*"
              className="w-full mb-2 px-2 py-1 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none"
              onChange={handleFileChange}
            />
            {file && (
              <div className="mb-2 flex justify-center">
                <img src={URL.createObjectURL(file)} alt="preview" className="max-h-32 rounded" />
              </div>
            )}
            <input
              className="w-full mb-2 px-2 py-1 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none"
              placeholder="Caption (optional)"
              value={caption}
              onChange={e => setCaption(e.target.value)}
            />
            {loading && <div className="text-blue-400 text-xs mb-1">Uploading...</div>}
            {error && <div className="text-red-400 text-xs mb-1">{error}</div>}
            {success && <div className="text-green-400 text-xs mb-1">Story created!</div>}
            <div className="flex gap-2">
              <button type="button" className="flex-1 py-1 rounded bg-gray-600 text-white text-xs" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="flex-1 py-1 rounded bg-blue-600 text-white text-xs" disabled={loading || !image}>Add</button>
            </div>
          </form>
        )}
      </div>
      {grouped.map((group, idx) => (
        <button
          key={group.user._id || group.user.username || idx}
          className="flex flex-col items-center min-w-[64px] focus:outline-none"
          onClick={() => onStoryClick && onStoryClick(group)}
          style={{ background: 'none', border: 'none', padding: 0, margin: 0 }}
        >
          <div className={`rounded-full p-1 bg-gradient-to-tr from-pink-500 via-yellow-400 to-purple-500`}>
            <img
              src={group.user.avatar}
              alt={group.user.username}
              className={`w-14 h-14 rounded-full object-cover border-2`}
            />
          </div>
          <span className="text-xs mt-1 text-gray-200 truncate w-16 text-center">{group.user.username}</span>
        </button>
      ))}
    </div>
  );
} 