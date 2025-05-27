// VideoSearch.tsx
import React, { useState, useRef, useCallback, useMemo } from 'react';
import { FaArrowLeft, FaSearch, FaPlay } from 'react-icons/fa';
import { Loader2, Play } from 'lucide-react';
import VideoPlayer, { VideoData, TranscriptSegment } from './VideoPlayer';

interface VideoSearchProps {
  onClose: () => void;
}

const VideoSearch: React.FC<VideoSearchProps> = ({ onClose }) => {
  // State management
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [playingVideoData, setPlayingVideoData] = useState<VideoData | null>(null);
  const [videoStartTime, setVideoStartTime] = useState<number>(0);
  const debouncedSearch = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sample video database focused on HTML5 Structure and Elements
  const videoDatabase: VideoData[] = useMemo(() => [
    {
      videoId: 'HTML5-001',
      courseCode: 'WEB101',
      courseName: 'Introduction to Web Development',
      sectionName: 'HTML Fundamentals',
      videoTitle: 'HTML5 Structure and Elements.mkv',
      videoFileName: 'HTML5 Structure and Elements.mkv',
      title: 'HTML5 Structure and Elements',
      subtitle: 'Introduction to Web Development',
      instructor: 'Dr. Sarah Chen',
      videoUrl: 'https://archive.org/download/ElephantsDream/ed_1024_512.mp4',
      thumbnailUrl: '/api/placeholder/1280/720',
      transcript: [
        { timestamp: 0, text: "Welcome to our tutorial on HTML5 structure and elements. Today, we'll explore the foundation of modern web development." },
        { timestamp: 30, text: "HTML5 introduces semantic elements that clearly describe their meaning to both the browser and the developer." },
        { timestamp: 60, text: "Let's start with the basic structure: <!DOCTYPE html>, <html>, <head>, and <body> elements form the skeleton of every HTML document." },
        { timestamp: 90, text: "The <header> element represents introductory content or navigational links for its nearest sectioning content." },
        { timestamp: 120, text: "The <nav> element is specifically designed for navigation links, improving accessibility and SEO." },
        { timestamp: 150, text: "The <main> element specifies the main content of the document, which should be unique to the document." },
        { timestamp: 180, text: "The <section> element represents a standalone section of content that may have its own heading." },
        { timestamp: 210, text: "The <article> element represents a self-contained composition that is intended to be independently distributable or reusable." },
        { timestamp: 240, text: "The <aside> element represents content that is tangentially related to the content around it, often presented as a sidebar." },
        { timestamp: 270, text: "The <footer> element represents a footer for its nearest sectioning content or sectioning root element." },
      ],
    },
    {
      videoId: 'HTML5-002',
      courseCode: 'WEB101',
      courseName: 'Introduction to Web Development',
      sectionName: 'HTML Fundamentals',
      videoTitle: 'HTML5 Text Elements and Attributes.mkv',
      videoFileName: 'HTML5 Text Elements and Attributes.mkv',
      title: 'HTML5 Text Elements and Attributes',
      subtitle: 'Introduction to Web Development',
      instructor: 'Dr. Sarah Chen',
      videoUrl: 'https://archive.org/download/ElephantsDream/ed_1024_512.mp4',
      thumbnailUrl: '/api/placeholder/1280/720',
      transcript: [
        { timestamp: 0, text: "In this session, we'll explore HTML5 text elements and attributes that enhance document structure." },
        { timestamp: 30, text: "The heading elements <h1> through <h6> define different levels of headings in HTML documents." },
        { timestamp: 60, text: "The <p> element defines a paragraph, while <span> elements are inline containers for styling purposes." },
        { timestamp: 90, text: "HTML5 introduced the <figure> and <figcaption> elements for images, diagrams, and other content with captions." },
        { timestamp: 120, text: "Semantic text elements like <strong>, <em>, <mark>, and <time> provide meaning in addition to visual formatting." },
        { timestamp: 150, text: "The class and id attributes are essential for styling elements with CSS and selecting them with JavaScript." },
      ],
    },
    {
      videoId: 'HTML5-003',
      courseCode: 'WEB101',
      courseName: 'Introduction to Web Development',
      sectionName: 'HTML Fundamentals',
      videoTitle: 'HTML5 Forms and Input Elements.mkv',
      videoFileName: 'HTML5 Forms and Input Elements.mkv',
      title: 'HTML5 Forms and Input Elements',
      subtitle: 'Introduction to Web Development',
      instructor: 'Dr. Sarah Chen',
      videoUrl: 'https://archive.org/download/ElephantsDream/ed_1024_512.mp4',
      thumbnailUrl: '/api/placeholder/1280/720',
      transcript: [
        { timestamp: 0, text: "Today we'll be covering HTML5 form elements and the improvements over previous HTML versions." },
        { timestamp: 30, text: "HTML5 introduced new input types like email, url, number, range, search, and date, simplifying form validation." },
        { timestamp: 60, text: "The <form> element is the container for different input elements that collect user data." },
        { timestamp: 90, text: "New attributes like required, pattern, and placeholder improve user experience and form validation." },
        { timestamp: 120, text: "HTML5 also includes specialized elements like <datalist>, <output>, and <progress> for better interactivity." },
      ],
    },
    {
      videoId: 'HTML5-004',
      courseCode: 'WEB101',
      courseName: 'Introduction to Web Development',
      sectionName: 'HTML Fundamentals',
      videoTitle: 'HTML5 Multimedia Elements.mkv',
      videoFileName: 'HTML5 Multimedia Elements.mkv',
      title: 'HTML5 Multimedia Elements',
      subtitle: 'Introduction to Web Development',
      instructor: 'Dr. Sarah Chen',
      videoUrl: 'https://archive.org/download/ElephantsDream/ed_1024_512.mp4',
      thumbnailUrl: '/api/placeholder/1280/720',
      transcript: [
        { timestamp: 0, text: "HTML5 introduced native multimedia support with elements like <audio> and <video> that revolutionized web content." },
        { timestamp: 30, text: "The <video> element has attributes like controls, autoplay, loop, and preload to customize playback behavior." },
        { timestamp: 60, text: "Using the <source> element within video and audio elements provides fallback options for browser compatibility." },
        { timestamp: 90, text: "The <canvas> element provides a drawing space for JavaScript to create dynamic graphics and animations." },
        { timestamp: 120, text: "HTML5 multimedia elements reduce dependency on plugins like Flash, making websites more secure and accessible." },
      ],
    },
    {
      videoId: 'HTML5-005',
      courseCode: 'WEB201',
      courseName: 'Advanced Web Development',
      sectionName: 'HTML5 Advanced Topics',
      videoTitle: 'HTML5 Semantic Structure Best Practices.mkv',
      videoFileName: 'HTML5 Semantic Structure Best Practices.mkv',
      title: 'HTML5 Semantic Structure Best Practices',
      subtitle: 'Advanced Web Development',
      instructor: 'Prof. Michael Rodriguez',
      videoUrl: 'https://archive.org/download/ElephantsDream/ed_1024_512.mp4',
      thumbnailUrl: '/api/placeholder/1280/720',
      transcript: [
        { timestamp: 0, text: "Semantic HTML is crucial for accessibility, SEO, and maintainability in modern web development." },
        { timestamp: 30, text: "Always structure your HTML document with proper hierarchical headings from <h1> to <h6>." },
        { timestamp: 60, text: "Use HTML5 structural elements like <header>, <nav>, <main>, <section>, and <footer> to create a clear document outline." },
        { timestamp: 90, text: "Assistive technologies rely on semantic HTML to provide context and navigation for users with disabilities." },
        { timestamp: 120, text: "Search engines give higher importance to content within semantic elements, improving your site's visibility." },
      ],
    },
  ], []);

  // Search functionality
  const performSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsLoading(true);
    const lowerCaseSearchQuery = query.toLowerCase();

    // Simulate API call with setTimeout
    setTimeout(() => {
      const results = videoDatabase
        .map((video) => {
          const matches = video.transcript.filter((segment) =>
            segment.text.toLowerCase().includes(lowerCaseSearchQuery)
          );
          
          return matches.length > 0 ? { ...video, matches } : null;
        })
        .filter((result): result is VideoData & { matches: TranscriptSegment[] } => 
          result !== null
        );

      setSearchResults(results);
      setIsLoading(false);
    }, 300);
  }, [videoDatabase]);

  // Handle input changes with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);

    if (debouncedSearch.current) {
      clearTimeout(debouncedSearch.current);
    }

    debouncedSearch.current = setTimeout(() => {
      performSearch(newQuery);
    }, 300);
  };

  // Video playback handlers
  const handlePlayVideo = (video: VideoData) => {
    setPlayingVideoData(video);
    setVideoStartTime(0);
  };

  const handleTranscriptPlay = (video: VideoData, timestamp: number) => {
    setPlayingVideoData(video);
    setVideoStartTime(timestamp);
  };

  const handleCloseVideoPlayer = () => {
    setPlayingVideoData(null);
  };

  // Format timestamp to MM:SS
  const formatTime = (timestamp: number): string => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = timestamp % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-light backdrop-blur-md bg-opacity-80">
      {playingVideoData ? (
        <VideoPlayer 
          videoData={playingVideoData} 
          onClose={handleCloseVideoPlayer} 
          startTime={videoStartTime} 
        />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header Section */}
            <div className="bg-white dark:bg-primary rounded-t-2xl shadow-lg p-6">
              <div className="flex items-center justify-center relative mb-8">
                <button
                  onClick={onClose}
                  className="absolute left-0 text-gray-500 hover:text-primary transition-all duration-300 hover:scale-110"
                  aria-label="Go back"
                >
                  <FaArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-4xl font-display font-bold text-primary dark:text-white">
                  Video Search
                </h1>
              </div>

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search transcripts..."
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="w-full px-6 py-4 bg-secondary-lighter dark:bg-primary-light/20 rounded-xl border-2 border-transparent focus:border-secondary focus:outline-none text-primary dark:text-white placeholder-gray-400 transition-all duration-300"
                  aria-label="Search transcripts"
                />
                <button
                  onClick={() => performSearch(searchQuery)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-primary-light to-primary text-white px-6 py-2 rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:-translate-y-[52%] flex items-center gap-2"
                  aria-label="Search"
                >
                  <FaSearch className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-white dark:bg-primary rounded-b-2xl shadow-lg p-6 space-y-6">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-12 h-12 text-secondary animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div
                    key={result.videoId}
                    className="bg-secondary-lighter dark:bg-primary-light/20 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg"
                  >
                    {/* Video Card Header */}
                    <div className="bg-gradient-to-r from-primary-light to-primary p-6">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-display font-bold text-white mb-2">
                            {result.title}
                          </h3>
                          <p className="text-white/80 text-sm">
                            {result.subtitle} • {result.instructor}
                          </p>
                        </div>
                        <button
                          onClick={() => handlePlayVideo(result)}
                          className="w-12 h-12 flex items-center justify-center bg-white/20 rounded-full group transition-all duration-300 hover:bg-secondary hover:scale-110 hover:shadow-lg"
                          aria-label={`Play ${result.title}`}
                        >
                          <FaPlay className="w-5 h-5 text-white ml-1 group-hover:text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Transcript Results */}
                    <div className="p-6 space-y-4">
                      <h4 className="font-semibold text-primary dark:text-white/90">
                        Matching Transcript Segments:
                      </h4>
                      {result.matches?.map((match, idx) => (
                        <TranscriptItem
                          key={idx}
                          item={match}
                          videoData={result}
                          formatTime={formatTime}
                          onTranscriptPlay={handleTranscriptPlay}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : searchQuery ? (
                <div className="text-center py-12 bg-secondary-lighter dark:bg-primary-light/20 rounded-xl text-primary dark:text-white">
                  <p className="text-lg font-semibold">
                    No matching transcripts found for "{searchQuery}".
                  </p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Search the transcripts...
                  </p>
                </div>
              ) : (
                <div className="text-center py-12 bg-secondary-lighter dark:bg-primary-light/20 rounded-xl text-primary dark:text-white">
                  <p className="text-lg font-semibold">Search for transcripts...</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Try searching for topics like "semantic elements", "structure", or specific elements like "header" and "footer".
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// TranscriptItem Component
interface TranscriptItemProps {
  item: TranscriptSegment;
  videoData: VideoData;
  formatTime: (time: number) => string;
  onTranscriptPlay: (video: VideoData, timestamp: number) => void;
}

const TranscriptItem: React.FC<TranscriptItemProps> = ({ 
  item, 
  videoData, 
  formatTime, 
  onTranscriptPlay 
}) => (
  <div className="flex items-center gap-4 p-4 bg-white dark:bg-primary-light/10 rounded-lg cursor-pointer group transition-all duration-300 hover:translate-x-2">
    <span className="text-secondary dark:text-secondary-light font-mono min-w-[60px]">
      {formatTime(item.timestamp)}
    </span>
    <p className="flex-1 text-primary dark:text-white">
      {item.text}
    </p>
    <button
      onClick={() => onTranscriptPlay(videoData, item.timestamp)}
      className="p-1 rounded-full hover:bg-secondary-lighter"
      aria-label={`Play from ${formatTime(item.timestamp)}`}
    >
      <FaPlay className="w-4 h-4 text-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  </div>
);

export default VideoSearch;