import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Clock, ThumbsUp, MessageSquare, AlertTriangle, Filter } from 'lucide-react';

interface Story {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  time: number;
  descendants: number;
  type: string;
}

const TypewriterEffect = ({ text, speed = 100, backspaceSpeed = 50, pauseTime = 2000 }) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    let timer;
    
    if (isTyping) {
      if (!isDeleting && displayText === text) {
        // Pause at the end of typing before deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
          setIsTyping(true);
        }, pauseTime);
      } else if (isDeleting && displayText === '') {
        // When done deleting, start typing again
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setIsTyping(false);
        timer = setTimeout(() => {
          setIsTyping(true);
        }, 500);
      } else {
        // Handle typing and deleting
        const timeout = setTimeout(() => {
          const nextDisplayText = isDeleting
            ? displayText.substring(0, displayText.length - 1)
            : text.substring(0, displayText.length + 1);
          
          setDisplayText(nextDisplayText);
        }, isDeleting ? backspaceSpeed : speed);
        
        return () => clearTimeout(timeout);
      }
    } else {
      timer = setTimeout(() => {
        setIsTyping(true);
      }, 500);
    }
    
    return () => clearTimeout(timer);
  }, [displayText, isDeleting, loopNum, text, isTyping, speed, backspaceSpeed, pauseTime]);

  return (
    <span className="inline-block">
      {displayText}
      <span className="animate-blink">|</span>
    </span>
  );
};

const HackerNewsWidget: React.FC = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [storyCount, setStoryCount] = useState(10);
  const [typingText, setTypingText] = useState('');

  useEffect(() => {
    fetchTopStories();
  }, [storyCount]);

  useEffect(() => {
    if (lastUpdated) {
      const formattedDate = lastUpdated.toLocaleDateString();
      const formattedTime = lastUpdated.toLocaleTimeString();
      setTypingText(`Hacker News updated ${formattedTime} ${formattedDate}`);
    }
  }, [lastUpdated]);

  const fetchTopStories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch IDs of top stories
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      if (!response.ok) throw new Error('Failed to fetch top stories');
      
      const storyIds = await response.json();
      
      // Take only the top stories based on storyCount
      const topStoryIds = storyIds.slice(0, storyCount);
      
      // Fetch details for each story
      const storyPromises = topStoryIds.map(id => 
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
          .then(res => {
            if (!res.ok) throw new Error(`Failed to fetch story ${id}`);
            return res.json();
          })
      );
      
      const fetchedStories = await Promise.all(storyPromises);
      setStories(fetchedStories);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching Hacker News stories:', err);
      setError('Failed to load tech news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = new Date();
    const storyTime = new Date(timestamp * 1000);
    const diffInSeconds = Math.floor((now.getTime() - storyTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  const getDomain = (url: string) => {
    try {
      if (!url) return '';
      const hostname = new URL(url).hostname;
      return hostname.replace('www.', '');
    } catch (err) {
      return '';
    }
  };

  return (
    <div className="cyber-card p-6">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-[var(--matrix-color)] mr-3">Hacker News</h2>
          <div className="bg-black/30 px-3 py-1 rounded-md border border-gray-700 text-sm text-gray-300 font-mono">
            <TypewriterEffect 
              text={typingText || "Hacker News feed loading..."} 
              speed={50}
              backspaceSpeed={20}
              pauseTime={3000}
            />
          </div>
        </div>
        <button 
          onClick={fetchTopStories} 
          disabled={loading}
          className="cyber-button px-3 py-1 text-sm flex items-center"
          title="Refresh news"
        >
          <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center mr-4">
          <Filter className="h-4 w-4 text-gray-400 mr-2" />
          <select 
            className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-gray-300"
            value={storyCount}
            onChange={(e) => setStoryCount(Number(e.target.value))}
          >
            <option value="5">5 stories</option>
            <option value="10">10 stories</option>
            <option value="15">15 stories</option>
            <option value="20">20 stories</option>
          </select>
        </div>
        {lastUpdated && (
          <span className="text-xs text-gray-400">
            <Clock className="h-3 w-3 inline mr-1" />
            Updated {formatTimeAgo(Math.floor(lastUpdated.getTime() / 1000))}
          </span>
        )}
      </div>

      {error ? (
        <div className="bg-red-900/30 border border-red-700/50 rounded-md p-4 text-center">
          <AlertTriangle className="h-5 w-5 mx-auto mb-2 text-red-400" />
          <p className="text-red-400">{error}</p>
          <button
            onClick={fetchTopStories}
            className="mt-2 cyber-button px-3 py-1 text-sm"
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(storyCount)].map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-3 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-700 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stories.map(story => (
            <div key={story.id} className="bg-gray-800/50 border border-gray-700 hover:border-[var(--matrix-color)]/30 rounded-lg p-3 transition-all group">
              <div className="mb-2">
                <a 
                  href={story.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-100 hover:text-[var(--matrix-color)] font-medium flex items-start group-hover:text-[var(--matrix-color)]"
                >
                  <span className="mr-1">{story.title}</span>
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
                {story.url && (
                  <a 
                    href={story.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-gray-500 hover:text-gray-400"
                  >
                    {getDomain(story.url)}
                  </a>
                )}
              </div>
              <div className="flex items-center text-xs text-gray-400 space-x-3">
                <div className="flex items-center">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  <span>{story.score}</span>
                </div>
                <div className="flex items-center">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  <span>{story.descendants || 0}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatTimeAgo(story.time)}</span>
                </div>
                <span>by {story.by}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HackerNewsWidget;