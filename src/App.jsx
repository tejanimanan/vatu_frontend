import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { FaHome, FaFilm, FaPlusSquare, FaRegCommentDots, FaUser } from 'react-icons/fa';

import Feed from "./components/Feed";
import Reels from "./pages/Reels";
import Profile from "./components/Profile";
import Messages from "./components/Messages";
import Notifications from "./components/Notifications";
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import ProtectedRoute from './utils/ProtectedRoute';
import StoryViewer from './components/StoryViewer';
import EditProfile from './components/EditProfile';
import { get } from "./utils/api";
import CreatePost from "./components/CreatePost";
import PostDetail from './pages/PostDetail';
import Header from "./components/Header";


const TABS = [
  { path: "/", icon: <FaHome />, activeIcon: <FaHome style={{ color: 'white' }} /> },
  { path: "/reels", icon: <FaFilm />, activeIcon: <FaFilm style={{ color: 'white' }} /> },
  { path: "/add", icon: <FaPlusSquare />, activeIcon: <FaPlusSquare style={{ color: 'white' }} />, isAction: true },
  { path: "/messages", icon: <FaRegCommentDots />, activeIcon: <FaRegCommentDots style={{ color: 'white' }} /> },
  { path: "/profile", icon: <FaUser />, activeIcon: <FaUser style={{ color: 'white' }} /> },
];

function AppLayout({ activeTab, setActiveTab, onAddClick }) {
  const location = useLocation();
  const showHeader = ['/', '/reels', '/messages', '/profile'].includes(location.pathname);

  return (
    <>
      {showHeader && <Header />}
      <div className="pt-16 pb-12">
        <Outlet /> {/* This renders the current page! */}
      </div>
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#181818] border-t border-gray-800 flex justify-around">
        {TABS.map(tab => (
          tab.isAction ? (
            <button key={tab.path} onClick={onAddClick} className="p-3 text-2xl text-white">
              {tab.icon}
            </button>
          ) : (
            <Link key={tab.path} to={tab.path} className="p-3 text-2xl text-white" onClick={() => setActiveTab(tab.path)}>
              {activeTab === tab.path ? tab.activeIcon : tab.icon}
            </Link>
          )
        ))}
      </div>
    </>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState("/");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [storyIdx, setStoryIdx] = useState(0);
  const [groups, setGroups] = useState([]);
  const [user, setUser] = useState(null);
  const [userError, setUserError] = useState("");
  const [isCreatePostOpen, setCreatePostOpen] = useState(false);
  const navigate = useNavigate();

  const fetchUser = () => {
    get('/users/me').then(setUser).catch((err) => {
      setUser(null);
      setUserError("Failed to load user. Please log in again.");
    });
  };

  const handleLogin = () => {
    setUserError("");
    fetchUser();
    navigate('/');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setUserError("");
    navigate('/login');
  };

  useEffect(() => {
    fetchUser();
    get('/stories').then(stories => {
      const byUser = {};
      (stories || []).forEach(story => {
        const userId = story.user?._id || story.user;
        if (!groups[userId]) {
          byUser[userId] = { user: story.user, stories: [] };
        }
        byUser[userId].stories.push(story);
      });
      setGroups(Object.values(byUser));
    });
  }, []);

  // Show login page if not authenticated
  if (!localStorage.getItem('token')) {
    return <Login onLogin={handleLogin} />;
  }

  // Show error if user data fails to load
  if (userError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#181818] text-white">
        <h1 className="text-2xl font-bold mb-4">{userError}</h1>
        <button className="px-6 py-2 rounded bg-blue-600 text-white font-semibold" onClick={handleLogout}>Go to Login</button>
      </div>
    );
  }

  const handleStoryClick = (group, storyIndex = 0) => {
    setSelectedGroup(group);
    setStoryIdx(storyIndex);
  };
  const closeStory = () => setSelectedGroup(null);
  const nextStory = () => setStoryIdx(i => i + 1);
  const prevStory = () => setStoryIdx(i => i - 1);

  const handleProfileUpdate = () => {
    fetchUser();
    navigate('/profile');
  };
  
  const handlePostCreated = () => {
    setCreatePostOpen(false);
    // Optionally refresh feed here
  };

  return (
    <>
      {isCreatePostOpen && <CreatePost onClose={() => setCreatePostOpen(false)} onPostCreated={handlePostCreated} />}
      <Routes>
        <Route path="/*" element={<AppLayout activeTab={activeTab} setActiveTab={setActiveTab} onAddClick={() => setCreatePostOpen(true)} />}>
          <Route index element={<ProtectedRoute><Feed onStoryClick={handleStoryClick} stories={groups.flatMap(g => g.stories)} /></ProtectedRoute>} />
          <Route path="reels" element={<ProtectedRoute><Reels /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute><Profile user={user} onEdit={() => navigate('/edit-profile')} onPostClick={post => navigate(`/post/${post._id}`)} onLogout={handleLogout} /></ProtectedRoute>} />
          <Route path="edit-profile" element={<ProtectedRoute><EditProfile user={user} onBack={() => navigate('/profile')} onSave={handleProfileUpdate} /></ProtectedRoute>} />
          <Route path="messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="post/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
      </Routes>
      {selectedGroup && (
        <StoryViewer
          group={selectedGroup}
          storyIdx={storyIdx}
          onClose={closeStory}
          onNext={nextStory}
          onPrev={prevStory}
          totalStories={selectedGroup.stories.length}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}