import React, { useState } from 'react';
import { put, post } from '../utils/api';

export default function EditProfile({ user, onBack, onSave }) {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    email: user?.email || '',
    gender: user?.gender || '',
    pronouns: user?.pronouns || '',
    link: user?.link || '',
    music: user?.music || '',
  });
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let avatarUrl = user?.avatar;
      if (avatar) {
        const formDataUpload = new FormData();
        formDataUpload.append('image', avatar);
        const response = await post('/uploads', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        avatarUrl = response.url;
      }
      await put('/users/me', {
        ...formData,
        avatar: avatarUrl,
      });
      onSave();
    } catch (error) {
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#181818] text-white p-4">
      <div className="w-full max-w-md bg-[#232323] rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <button onClick={onBack} className="text-blue-400 font-semibold">Cancel</button>
          <h1 className="text-lg font-semibold">Edit Profile</h1>
          <button 
            onClick={handleSubmit} 
            className="text-blue-400 font-semibold disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Done'}
          </button>
        </div>
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full overflow-hidden mb-2 border-4 border-[#181818]">
            <img 
              src={avatar ? URL.createObjectURL(avatar) : (user?.avatar || '/default-avatar.png')} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          </div>
          <label className="text-blue-400 cursor-pointer hover:underline">
            Change profile photo
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-[#181818] rounded-lg p-2 text-white border border-gray-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full bg-[#181818] rounded-lg p-2 text-white border border-gray-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full bg-[#181818] rounded-lg p-2 text-white border border-gray-700 h-24 resize-none focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-[#181818] rounded-lg p-2 text-white border border-gray-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-[#181818] rounded-lg p-2 text-white border border-gray-700 focus:outline-none"
            >
              <option value="">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Pronouns</label>
            <input
              type="text"
              name="pronouns"
              value={formData.pronouns}
              onChange={handleChange}
              className="w-full bg-[#181818] rounded-lg p-2 text-white border border-gray-700 focus:outline-none"
              placeholder="Example: they/them, she/her"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Website</label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              className="w-full bg-[#181818] rounded-lg p-2 text-white border border-gray-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">Music</label>
            <input
              type="text"
              name="music"
              value={formData.music}
              onChange={handleChange}
              className="w-full bg-[#181818] rounded-lg p-2 text-white border border-gray-700 focus:outline-none"
            />
          </div>
        </form>
      </div>
    </div>
  );
} 