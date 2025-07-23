import React, { useEffect, useState } from 'react';
import { get } from '../utils/api';
import StoriesBar from './StoriesBar';
import PostCard from './PostCard';
import StoryViewer from './StoryViewer';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(null); // index of active story
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [postsData, storiesData] = await Promise.all([
          get('/posts'),
          get('/stories'),
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

  const openStoryViewer = (index) => {
    setCurrentStoryIndex(index);
    setViewerOpen(true);
  };

  const closeViewer = () => {
    setViewerOpen(false);
    setCurrentStoryIndex(null);
  };

  const nextStory = () => {
    if (currentStoryIndex + 1 < stories.length) {
      setCurrentStoryIndex((prev) => prev + 1);
    } else {
      closeViewer();
    }
  };

  const prevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="pt-4 pb-2 px-1 max-w-md mx-auto w-full bg-[#181818] text-white min-h-screen">
      <StoriesBar stories={stories} onStoryClick={openStoryViewer} />
      {posts.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}
     
      {viewerOpen && stories[currentStoryIndex] && (
        <StoryViewer
          story={stories[currentStoryIndex]}
          user={stories[currentStoryIndex].user}
          timeAgo={stories[currentStoryIndex].createdAt}
          storyIdx={currentStoryIndex}
          totalStories={stories.length}
          onClose={closeViewer}
          onNext={nextStory}
          onPrev={prevStory}
        />
      )}
    </div>
  );
}
