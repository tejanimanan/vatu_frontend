import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { get, del, put } from '../utils/api';
import PostCard from '../components/PostCard';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [caption, setCaption] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    get(`/posts`).then(posts => {
      const found = posts.find(p => p._id === id);
      setPost(found);
      setCaption(found?.caption || '');
      setLoading(false);
    }).catch(() => {
      setError('Post not found');
      setLoading(false);
    });
    get('/users/me').then(setCurrentUser).catch(() => setCurrentUser(null));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    await del(`/posts/${id}`);
    navigate('/profile');
  };

  const handleEdit = async () => {
    await put(`/posts/${id}`, { caption });
    setPost({ ...post, caption });
    setEditMode(false);
  };

  if (loading) return <div className="text-white text-center mt-10">Loading...</div>;
  if (error || !post) return <div className="text-red-400 text-center mt-10">{error || 'Post not found'}</div>;

  const isOwner = currentUser && post.user?._id === currentUser._id;

  return (
    <div className="min-h-screen bg-[#181818] flex flex-col items-center pt-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between px-4 py-2">
          <button onClick={() => navigate(-1)} className="text-white text-xl">&#8592;</button>
          {isOwner && (
            <div className="relative">
              <button onClick={() => setShowMenu(v => !v)} className="text-white text-2xl p-2 hover:bg-[#232323] rounded-full focus:outline-none">&#8942;</button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-[#232323] rounded-lg shadow-lg z-50 py-2">
                  <button onClick={() => setEditMode(true)} className="w-full text-left px-4 py-2 text-gray-200 hover:bg-[#363636] rounded">Edit</button>
                  <button onClick={handleDelete} className="w-full text-left px-4 py-2 text-red-500 hover:bg-[#363636] rounded">Delete</button>
                </div>
              )}
            </div>
          )}
        </div>
        {editMode ? (
          <div className="bg-[#232323] rounded-lg shadow mb-4 w-full max-w-md mx-auto border border-gray-800 p-4">
            <textarea
              className="w-full rounded bg-[#181818] text-white border border-gray-700 p-2 mb-2"
              value={caption}
              onChange={e => setCaption(e.target.value)}
            />
            <div className="flex gap-2">
              <button onClick={handleEdit} className="flex-1 py-2 bg-blue-600 rounded text-white font-semibold">Save</button>
              <button onClick={() => setEditMode(false)} className="flex-1 py-2 bg-gray-600 rounded text-white">Cancel</button>
            </div>
          </div>
        ) : (
          <PostCard post={post} />
        )}
      </div>
    </div>
  );
} 