import React, { useState, useEffect, useRef } from "react";
import { FaSmile, FaPaperclip, FaPaperPlane, FaArrowLeft, FaPhone, FaVideo, FaCamera } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { get, post } from '../utils/api';

export default function Messages() {
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const [chatUser, setChatUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    get('/users/me').then(setCurrentUser).catch(() => setCurrentUser(null));
    get('/conversations').then(setConversations).catch(() => setConversations([]));
    get('/users').then(setAllUsers).catch(() => setAllUsers([]));
    // Mark all as read when opening the page
    post('/conversations/mark-all-read');
  }, []);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversations, selectedId]);

  const conversation = conversations.find((c) => c._id === selectedId);
  const otherUser = conversation?.users.find(u => u._id !== currentUser?._id);

  const filteredUsers = allUsers.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) &&
      u._id !== currentUser?._id
  );

  const handleUserClick = (user) => {
    const conv = conversations.find(c => c.users.some(u => u._id === user._id));
    if (conv) {
      setSelectedId(conv._id);
      setChatUser(null);
    } else {
      setChatUser(user);
      setSelectedId(null);
    }
    setSearchMode(false);
    setSearch("");
  };

  const closeChatUser = () => {
    setChatUser(null);
    setSelectedId(null);
  };
  const goToHome = () => navigate("/");

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setError("");

    try {
      if (selectedId) {
        // Add to existing conversation
        await post(`/conversations/${selectedId}/messages`, { text: message, time: new Date().toLocaleTimeString() });
      } else if (chatUser) {
        // Create new conversation
        const newConversation = await post('/conversations', {
          userId: chatUser._id,
          text: message,
        });
        setSelectedId(newConversation._id); // Switch to the new conversation
        setChatUser(null);
      }
      
      // Refresh all conversations
      const updated = await get('/conversations');
      setConversations(updated);
      setMessage("");

    } catch (err) {
      setError("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (!selectedId && !chatUser) {
    const usersToShow = searchMode ? filteredUsers : allUsers.filter(u => u._id !== currentUser?._id);
    return (
      <div className="flex flex-col max-w-md mx-auto w-full h-[80vh] pt-4 pb-2 px-1 bg-[#181818]">
        <div className="flex items-center px-2 py-3 bg-[#181818] border-b border-gray-800 sticky top-0 z-10">
          <button className="text-white text-2xl mr-2" onClick={goToHome}><FaArrowLeft /></button>
          <span className="text-xl font-bold text-white">Messages</span>
        </div>
        <div className="mb-2 flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setSearchMode(e.target.value.length > 0);
            }}
            placeholder="Search users..."
            className="w-full rounded-full border border-gray-700 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-[#232323] text-white"
          />
        </div>
        <div className="flex items-center justify-between px-2 mt-2 mb-1">
          <span className="text-lg font-bold text-white">Messages</span>
          <button className="text-blue-400 text-sm font-semibold">Requests</button>
        </div>
        <div className="flex flex-col divide-y divide-gray-800 bg-transparent">
          {usersToShow.length === 0 && (
            <div className="p-4 text-center text-gray-400">No users found</div>
          )}
          {usersToShow.map((user) => (
            <button
              key={user._id}
              className="flex items-center py-3 px-2 hover:bg-[#232323] transition text-left focus:outline-none"
              onClick={() => handleUserClick(user)}
            >
              <div className="relative mr-3">
                <div className={`rounded-full p-0.5 ${user.hasStory ? 'bg-gradient-to-tr from-pink-500 via-yellow-400 to-purple-500' : ''}`}>
                  <img src={user.avatar} alt={user.username} className="w-12 h-12 rounded-full object-cover border-2 border-black" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center">
                  <span className="font-semibold text-white truncate">{user.username}</span>
                </div>
                <div className="text-gray-400 text-sm truncate">{user.lastMessage || "No messages yet"}</div>
              </div>
              <div className="ml-2 text-xs text-gray-500">{user.time || ""}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Show chat area full screen when a user or conversation is selected
  return (
    <div className="flex flex-col max-w-md mx-auto w-full h-[80vh] pt-4 pb-2 px-1 bg-[#181818]">
      <div className="flex-1 flex flex-col h-full">
        {selectedId && conversation ? (
          <div className="flex flex-col h-full bg-[#181818] rounded-lg relative">
            {/* Header */}
            <div className="flex items-center px-2 py-3 bg-[#181818] border-b border-gray-800 sticky top-0 z-10">
              <button className="text-white text-2xl mr-2" onClick={() => setSelectedId(null)}><FaArrowLeft /></button>
              {otherUser && (
                <img src={otherUser.avatar} alt={otherUser.username} className="w-10 h-10 rounded-full object-cover mr-2" />
              )}
              <div className="flex flex-col flex-1">
                <span className="font-bold text-white text-base">{otherUser?.username}</span>
                <span className="text-xs text-gray-400">{otherUser?.email || ''}</span>
              </div>
              <button className="text-white text-xl mr-2"><FaSmile /></button>
              <button className="text-white text-xl mr-2"><FaPhone /></button>
              <button className="text-white text-xl"><FaVideo /></button>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-2 py-2 bg-[#181818]">
              {conversation.messages.map((msg, idx) => {
                const isMe = String(msg.from) === String(currentUser?._id);
                return (
                  <div key={idx} className={`mb-2 flex ${isMe ? 'justify-end' : 'justify-start'}`}> 
                    <div className={`flex items-end ${isMe ? 'flex-row-reverse' : ''}`}> 
                      {!isMe && (
                        <img src={otherUser?.avatar} alt={otherUser?.username} className="w-8 h-8 rounded-full object-cover mr-2" />
                      )}
                      <div className={`rounded-2xl px-4 py-2 max-w-xs break-words ${isMe ? 'bg-[#a259ff] text-white' : 'bg-[#232323] text-white'} ${isMe ? 'ml-2' : 'mr-2'}`}
                        style={{ fontFamily: 'inherit', fontSize: '1.1rem' }}>
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            {/* Input Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-[#181818] flex items-center border-t border-gray-800 rounded-b-lg">
              <button className="text-pink-500 text-2xl mr-2"><FaCamera /></button>
              <input
                type="text"
                placeholder="Message..."
                className="flex-1 rounded-full border border-gray-700 px-4 py-2 text-base focus:outline-none bg-[#232323] text-white mr-2"
                value={message}
                onChange={e => setMessage(e.target.value)}
                disabled={loading}
              />
              <button className="text-white text-2xl mr-2"><FaPaperclip /></button>
              <button className="text-white text-2xl mr-2"><FaSmile /></button>
              <button className="ml-2 text-blue-500 text-2xl" onClick={handleSendMessage} disabled={loading || !message.trim()}><FaPaperPlane /></button>
            </div>
            {error && <div className="text-red-400 text-sm absolute bottom-14 left-0 w-full text-center">{error}</div>}
          </div>
        ) : chatUser ? (
          <div className="flex flex-col h-full bg-[#181818] rounded-lg relative">
            {/* ...similar header and input bar for new chat... */}
          </div>
        ) : null}
      </div>
    </div>
  );
} 