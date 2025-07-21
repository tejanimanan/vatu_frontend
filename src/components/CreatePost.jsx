import React, { useState } from 'react';
import { post } from '../utils/api';

export default function CreatePost({ onClose, onPostCreated }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Image is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await post('/uploads', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      
      await post('/posts', { image: res.url, caption });
      onPostCreated();
    } catch (err) {
      setError('Failed to create post');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#232323] p-4 rounded-lg w-full max-w-sm">
        <h2 className="text-white text-lg font-semibold mb-4 text-center">Create New Post</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full mb-2 px-2 py-1 rounded bg-[#181818] text-white border border-gray-700"
          />
          {file && (
            <div className="mb-2 flex justify-center">
              <img src={URL.createObjectURL(file)} alt="preview" className="max-h-48 rounded" />
            </div>
          )}
          <textarea
            value={caption}
            onChange={e => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full mb-2 px-2 py-1 rounded bg-[#181818] text-white border border-gray-700 h-20"
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-600 rounded text-white">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-2 bg-blue-600 rounded text-white disabled:opacity-50">
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 