import React, { useState } from "react";
import { post as apiPost, get } from '../utils/api';

export default function PostCard({ post }) {
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.some(l => l === localStorage.getItem('userId')) || false);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLike = async () => {
    setLoading(true);
    try {
      if (liked) {
        const res = await apiPost(`/posts/${post._id}/unlike`);
        setLikes(res.likes);
        setLiked(false);
      } else {
        const res = await apiPost(`/posts/${post._id}/like`);
        setLikes(res.likes);
        setLiked(true);
      }
    } catch (err) {
      setError("Failed to like/unlike");
    }
    setLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setLoading(true);
    try {
      const res = await apiPost(`/posts/${post._id}/comments`, { text: comment });
      setComments(res);
      setComment("");
    } catch (err) {
      setError("Failed to add comment");
    }
    setLoading(false);
  };

  return (
    <div className="post-card bg-[#232323] rounded-lg shadow mb-4 w-full max-w-md mx-auto border border-gray-800">
      {/* Header */}
      <div className="flex items-center px-4 py-2">
        <img src={post.user?.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover mr-3" />
        <span className="font-semibold text-gray-200">{post.user?.username}</span>
      </div>
      {/* Image */}
      <div className="w-full h-72 bg-gray-900 overflow-hidden">
        <img src={post.image} alt="post" className="w-full h-full object-cover" />
      </div>
      {/* Actions */}
      <div className="flex items-center px-4 py-2 space-x-6 text-2xl text-gray-400">
        <button onClick={handleLike} disabled={loading} className={liked ? "text-pink-500" : ""}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 21C12 21 4 13.5 4 8.5C4 5.5 6.5 3 9.5 3C11.04 3 12.5 3.99 13 5.36C13.5 3.99 14.96 3 16.5 3C19.5 3 22 5.5 22 8.5C22 13.5 12 21 12 21Z" />
          </svg>
        </button>
        <button onClick={() => setShowComments(v => !v)}>
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
      {/* Likes & Caption */}
      <div className="px-4 pb-2">
        <div className="text-sm font-semibold text-gray-200 mb-1">{likes} likes</div>
        <div className="text-sm"><span className="font-semibold mr-1 text-gray-200">{post.user?.username}</span>{post.caption}</div>
        <div className="text-xs text-gray-500 mt-1 cursor-pointer" onClick={() => setShowComments(v => !v)}>
          View all {comments.length} comments
        </div>
        {showComments && (
          <div className="mt-2">
            {comments.map((c, idx) => (
              <div key={idx} className="flex items-center mb-1">
                <img src={c.user?.avatar} alt={c.user?.username} className="w-6 h-6 rounded-full object-cover mr-2" />
                <span className="text-gray-200 text-xs font-semibold mr-1">{c.user?.username}</span>
                <span className="text-gray-300 text-xs">{c.text}</span>
              </div>
            ))}
            <form className="flex items-center mt-2" onSubmit={handleAddComment}>
              <input
                className="flex-1 px-2 py-1 rounded bg-[#181818] text-white border border-gray-700 focus:outline-none text-xs"
                placeholder="Add a comment..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                disabled={loading}
              />
              <button className="ml-2 px-2 py-1 rounded bg-blue-600 text-white text-xs font-semibold" type="submit" disabled={loading || !comment.trim()}>Post</button>
            </form>
          </div>
        )}
        {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
      </div>
    </div>
  );
} 