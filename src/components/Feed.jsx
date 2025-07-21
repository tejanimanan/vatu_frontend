import React, { useEffect, useState } from "react";
import { get } from '../utils/api';
import StoriesBar from './StoriesBar';
import PostCard from './PostCard';

export default function Feed({ onStoryClick }) {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [postsData, storiesData] = await Promise.all([
          get('/posts'),
          get('/stories')
        ]);
        setPosts(postsData || []);
        setStories(storiesData || []);
      } catch (error) {
        setPosts([]);
        setStories([]);
      }
    };
    fetchAll();
  }, []);

  return (
    <div className="pt-4 pb-2 px-1 max-w-md mx-auto w-full bg-[#181818] text-white min-h-screen">
      <StoriesBar stories={stories} onStoryClick={onStoryClick} />
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
    </div>
  );
} 