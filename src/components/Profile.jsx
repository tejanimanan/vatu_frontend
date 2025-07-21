import React, { useEffect, useState, useRef } from "react";
import { FaRegCommentDots, FaPlusSquare, FaPlay, FaEllipsisV } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { get } from '../utils/api';
import PostCard from './PostCard';

export default function Profile({ user, onEdit, onPostClick, onLogout }) {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.username) {
      get('/posts').then(allPosts => {
        setPosts(allPosts.filter(p => p.user?.username === user.username));
      });
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const highlights = [
    { id: 1, label: 'New', img: '', isNew: true },
    { id: 2, label: 'MAA❣️🙏', img: '', isNew: false },
    { id: 3, label: 'kiyu.&krishu', img: '', isNew: false },
    { id: 4, label: 'HARE KRISHNA', img: '', isNew: false },
  ];

  if (!user) return <div className="text-white text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-md mx-auto w-full pt-6 pb-2 px-2 bg-[#181818] min-h-screen text-white">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-4">
        {/* Avatar */}
        <div className="relative">
          <div className="bg-gradient-to-tr from-pink-500 via-yellow-400 to-purple-500 p-1 rounded-full">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt="avatar"
              className="w-20 h-20 rounded-full object-cover border-4 border-[#181818]"
            />
            <button className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center border-2 border-[#181818] text-lg">+</button>
          </div>
        </div>
        {/* Stats and username */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-bold">{user.username}</span>
          </div>
          <div className="flex gap-6 text-sm mb-2">
            <div className="flex flex-col items-center">
              <span className="font-bold">{posts.length}</span>
              <span className="text-gray-400 text-xs">posts</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">830</span>
              <span className="text-gray-400 text-xs">followers</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-bold">777</span>
              <span className="text-gray-400 text-xs">following</span>
            </div>
          </div>
        </div>
        {/* Settings/Menu Icon */}
        <div className="relative self-start" ref={menuRef}>
          <button onClick={() => setMenuOpen(v => !v)} className="text-white text-2xl p-2 hover:bg-[#232323] rounded-full focus:outline-none">
            <FaEllipsisV />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-[#232323] rounded-lg shadow-lg z-50 py-2">
              <button
                onClick={onLogout}
                className="w-full text-left px-4 py-2 text-red-500 hover:bg-[#363636] rounded"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Bio */}
      <div className="mb-4">
        <span className="font-semibold">{user.name}</span>
        <div className="text-gray-200">{user.bio || 'No bio yet'}</div>
      </div>
      {/* Buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={onEdit} className="flex-1 py-2 bg-[#363636] rounded-lg text-sm font-medium">Edit profile</button>
        <button className="flex-1 py-2 bg-[#363636] rounded-lg text-sm font-medium">View archive</button>
      </div>
      {/* Story Highlights */}
      {/* <div className="mb-6">
        <h3 className="text-sm text-gray-300 mb-4">Story highlights</h3>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {highlights.map(highlight => (
            <div key={highlight.id} className="flex flex-col items-center gap-1 min-w-[64px]">
              <div className={`w-16 h-16 rounded-full border-2 ${highlight.isNew ? 'border-dashed border-gray-500' : 'border-gray-700'} flex items-center justify-center`}>
                {highlight.isNew ? <FaPlusSquare className="text-2xl" /> : null}
              </div>
              <span className="text-xs truncate w-full text-center">{highlight.label}</span>
            </div>
          ))}
        </div>
      </div> */}
      {/* Posts Grid */}
      <div className="grid grid-cols-3 gap-1">
        {posts.map(post => (
          <div key={post._id} className="aspect-square bg-gray-800 relative cursor-pointer" onClick={() => onPostClick ? onPostClick(post) : setSelectedPost(post)}>
            <img src={post.image} alt="" className="w-full h-full object-cover" />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <div className="flex items-center gap-1">
                <FaRegCommentDots />
                <span>{post.comments?.length || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaPlay />
                <span>{post.views || 0}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Post Modal */}
      {selectedPost && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="max-w-3xl w-full bg-[#262626] rounded-xl overflow-hidden">
            <PostCard post={selectedPost} />
            <button 
              className="absolute top-4 right-4 text-white text-2xl"
              onClick={() => setSelectedPost(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 