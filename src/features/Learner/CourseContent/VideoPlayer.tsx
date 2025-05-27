// VideoPlayer.tsx
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    FaArrowLeft,
    FaBookmark,
    FaCompress,
    FaExpand
} from 'react-icons/fa';
import {
    Play,
    Pause,
    Volume2,
    Volume1,
    VolumeX,
    Settings,
    Maximize,
    Minimize
} from 'lucide-react';

export interface TranscriptSegment {
    timestamp: number;
    text: string;
}

export interface VideoData {
    videoId: string;
    courseCode: string;
    courseName: string;
    sectionName: string;
    videoTitle: string;
    transcript: TranscriptSegment[];
    videoFileName: string;
    title: string;
    subtitle: string;
    instructor: string;
    videoUrl: string;
    thumbnailUrl: string;
    matches?: TranscriptSegment[]; // Optional matches property
}

interface VideoPlayerProps {
    videoData: VideoData;
    onClose: () => void;
    startTime?: number; // Optional start time prop
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoData, onClose, startTime = 0 }) => { // startTime prop with default value
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [activeTranscript, setActiveTranscript] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const playerRef = useRef<HTMLDivElement>(null);


    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
            const currentTranscript = videoData.transcript.find((t, index) => {
                const nextTime = videoData.transcript[index + 1]?.timestamp || Infinity;
                return t.timestamp <= videoRef.current.currentTime && nextTime > videoRef.current.currentTime;
            });
            setActiveTranscript(currentTranscript?.timestamp || null);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration);
        }
    };

    const togglePlay = useCallback(() => {
        if (!videoRef.current) return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!videoRef.current) return;

        const time = parseFloat(e.target.value);
        videoRef.current.currentTime = time;
        setCurrentTime(time);
    };

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;

        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    }, [isMuted]);

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (videoRef.current) {
            videoRef.current.volume = newVolume;
        }
        setIsMuted(newVolume === 0);
    };

    const jumpToTime = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
            if (!isPlaying) {
                setIsPlaying(true);
                videoRef.current.play();
            }
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            if (playerRef.current) {
                playerRef.current.requestFullscreen();
            }
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    useEffect(() => {
        if (videoRef.current && duration > 0) {
            videoRef.current.currentTime = startTime; // Set currentTime when startTime prop changes and video is loaded
            if (startTime > 0) {
                videoRef.current.play().catch(error => {
                    // Handle autoplay error, for example, show a message to the user
                    console.error("Autoplay prevented:", error);
                });
                setIsPlaying(true); // Update isPlaying state to reflect video is playing
            }
        }
    }, [startTime, duration]);


    const VolumeIcon = () => {
        if (isMuted || volume === 0) return <VolumeX className="w-5 h-5" />;
        if (volume < 0.5) return <Volume1 className="w-5 h-5" />;
        return <Volume2 className="w-5 h-5" />;
    };


    return (
        <div className="min-h-screen bg-background-dark">
            <div className="max-w-9xl mx-auto p-4 md:p-8">
                <div className="bg-white dark:bg-primary rounded-xl shadow-lg overflow-hidden backdrop-blur-sm border border-gray-100 dark:border-primary-light/10">
                    {/* Header */}
                    <div className="p-4 md:p-6 border-b border-secondary-lighter dark:border-primary-light/30">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="text-primary hover:text-secondary transition-all duration-300 hover:scale-110"
                            >
                                <FaArrowLeft className="w-6 h-6" />
                            </button>
                            <h1 className="font-display text-2xl text-primary dark:text-white font-bold tracking-tight">
                                Video Player
                            </h1>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
                        {/* Video Player Column */}
                        <div className="lg:col-span-2" ref={playerRef}>
                            <div className="bg-primary rounded-xl overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl relative group">
                                <div className="relative aspect-video">
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover cursor-pointer"
                                        poster={videoData.thumbnailUrl}
                                        onClick={togglePlay}
                                        onTimeUpdate={handleTimeUpdate}
                                        onLoadedMetadata={handleLoadedMetadata}
                                    >
                                        <source src={videoData.videoUrl} type="video/mp4" />
                                    </video>

                                    {/* Large Play Button Overlay */}
                                    <div className={`absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs
                                 transition-opacity duration-300 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                                        <button
                                            onClick={togglePlay}
                                            className="w-24 h-24 flex items-center justify-center rounded-full bg-secondary/80
                               hover:bg-secondary transition-all duration-300 transform hover:scale-110
                               shadow-lg hover:shadow-xl group"
                                        >
                                            <Play className="w-12 h-12 text-white ml-2 transition-transform duration-300 group-hover:scale-110" />
                                        </button>
                                    </div>

                                    {/* Video Controls */}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent
                                p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="flex flex-col gap-3">
                                            {/* Enhanced Progress Bars */}
                                            <div className="relative group/progress">
                                                {/* Upper progress bar (buffer/chapter indicator) */}
                                                <div className="h-1 bg-white/20 rounded-full mb-2 overflow-hidden relative">
                                                    {/* This bar shows chapter markers or buffered content */}
                                                    <div className="absolute inset-0 bg-white/30 rounded-full" 
                                                        style={{ width: `${Math.min((currentTime / duration) * 100 + 15, 100)}%` }}>
                                                    </div>
                                                    
                                                    {/* Chapter markers if needed */}
                                                    {videoData.transcript.slice(0, 5).map((segment, idx) => (
                                                        <div 
                                                            key={idx}
                                                            className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                                                            style={{ 
                                                                left: `${(segment.timestamp / duration) * 100}%`,
                                                            }}
                                                        ></div>
                                                    ))}
                                                </div>
                                                
                                                {/* Main progress bar with enhanced styling */}
                                                <div className="h-2 bg-white/10 rounded-full overflow-hidden relative group-hover/progress:h-3 transition-all duration-300">
                                                    {/* Actual progress */}
                                                    <div 
                                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-secondary to-secondary-light 
                                                            rounded-full shadow-[0_0_8px_rgba(191,75,246,0.4)] transition-all duration-300"
                                                        style={{ width: `${(currentTime / duration) * 100}%` }}>
                                                        
                                                        {/* Active transcript indicator */}
                                                        {activeTranscript !== null && (
                                                            <div
                                                                className="absolute inset-y-0 w-1 bg-white/80 rounded-full shadow-md"
                                                                style={{
                                                                    left: `${((activeTranscript - currentTime) / duration) * 100}%`,
                                                                }}
                                                            ></div>
                                                        )}
                                                        
                                                        {/* Handle/playhead */}
                                                        <div className="absolute top-1/2 -translate-y-1/2 right-0 h-4 w-4 
                                                            bg-white rounded-full shadow-lg border-2 border-secondary 
                                                            scale-0 group-hover/progress:scale-100 transition-all duration-300">
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Invisible range input that covers the progress bar for better interaction */}
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={duration || 100}
                                                    value={currentTime}
                                                    onChange={handleProgressChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                            </div>

                                            {/* Control Buttons */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    {/* Play/Pause Button */}
                                                    <button
                                                        onClick={togglePlay}
                                                        className="text-white hover:text-secondary transition-all duration-300
                                     rounded-full p-2 hover:bg-white/10 active:scale-95"
                                                    >
                                                        {isPlaying ?
                                                            <Pause className="w-6 h-6" /> :
                                                            <Play className="w-6 h-6" />
                                                        }
                                                    </button>

                                                    {/* Volume Control */}
                                                    <div className="relative group/volume"
                                                        onMouseEnter={() => setShowVolumeSlider(true)}
                                                        onMouseLeave={() => setShowVolumeSlider(false)}>
                                                        <button
                                                            onClick={toggleMute}
                                                            className="text-white hover:text-secondary transition-all duration-300
                                       rounded-full p-2 hover:bg-white/10 active:scale-95"
                                                        >
                                                            <VolumeIcon />
                                                        </button>

                                                        <div className={`absolute left-1/2 bottom-full -translate-x-1/2 mb-2 p-2
                                          bg-black/80 rounded-lg backdrop-blur-sm transition-all duration-300
                                          ${showVolumeSlider ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                                                            <input
                                                                type="range"
                                                                min="0"
                                                                max="1"
                                                                step="0.01"
                                                                value={volume}
                                                                onChange={handleVolumeChange}
                                                                className="w-24 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                                         [&::-webkit-slider-thumb]:appearance-none
                                         [&::-webkit-slider-thumb]:w-3
                                         [&::-webkit-slider-thumb]:h-3
                                         [&::-webkit-slider-thumb]:rounded-full
                                         [&::-webkit-slider-thumb]:bg-secondary
                                         [&::-webkit-slider-thumb]:hover:bg-secondary-light
                                         [&::-webkit-slider-thumb]:transition-all
                                         [&::-webkit-slider-thumb]:duration-300"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Time Display */}
                                                    <span className="text-sm font-medium text-white">
                                                        {formatTime(currentTime)} / {formatTime(duration)}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {/* Settings Button */}
                                                    <button className="text-white hover:text-secondary transition-all duration-300
                                           rounded-full p-2 hover:bg-white/10 active:scale-95">
                                                        <Settings className="w-5 h-5" />
                                                    </button>

                                                    {/* Fullscreen Button */}
                                                    <button
                                                        onClick={toggleFullscreen}
                                                        className="text-white hover:text-secondary transition-all duration-300
                                     rounded-full p-2 hover:bg-white/10 active:scale-95"
                                                    >
                                                        {isFullscreen ?
                                                            <Minimize className="w-5 h-5" /> :
                                                            <Maximize className="w-5 h-5" />
                                                        }
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Video Info Section */}
                                <div className="p-6 bg-gradient-to-r from-primary to-primary-light">
                                    {/* Removed Course Code and Instructor Info */}
                                    <h2 className="font-display text-xl text-white mb-1 font-bold tracking-tight">
                                        {videoData.title}
                                    </h2>
                                    <p className="text-secondary-light text-sm">{videoData.subtitle}</p>
                                </div>
                            </div>
                        </div>

                        {/* Transcript Column */}
                        <div className="bg-white dark:bg-primary rounded-xl border border-secondary-lighter
                          dark:border-primary-light/30 p-6 shadow-md transition-all duration-300 hover:shadow-lg">
                            <h3 className="font-display text-lg text-primary dark:text-white mb-4 font-bold tracking-tight">
                                Transcript
                            </h3>
                            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 custom-scrollbar">
                                {videoData.transcript.map((item, index) => {
                                    const transcriptTime = item.timestamp !== undefined ? item.timestamp : item.time;
                                    const transcriptText = item.text;
                                    return (
                                        <TranscriptItem
                                            key={index}
                                            item={{ time: transcriptTime, text: transcriptText }}
                                            isActive={activeTranscript === transcriptTime}
                                            onClick={() => jumpToTime(transcriptTime)}
                                            formatTime={formatTime}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgb(246, 230, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgb(191, 75, 246, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgb(214, 139, 249, 0.8);
        }
      `}</style>
        </div>
    );
};

interface TranscriptItemProps {
    item: { time: number, text: string };
    isActive: boolean;
    onClick: () => void;
    formatTime: (time: number) => string;
}

const TranscriptItem: React.FC<TranscriptItemProps> = ({ item, isActive, onClick, formatTime }) => (
    <div
        onClick={onClick}
        className={`p-4 rounded-lg cursor-pointer transition-all duration-300 hover:scale-102
                ${isActive
                ? 'bg-gradient-to-r from-secondary to-secondary-light text-white shadow-md font-bold' // Highlight active transcript
                : 'bg-secondary-lighter dark:bg-primary-light/20 text-primary dark:text-white hover:bg-secondary-light hover:text-white'
            }`}
    >
        <div className="text-sm font-sans opacity-80 mb-1">
            {formatTime(item.time)}
        </div>
        <p className="text-sm leading-relaxed">{item.text}</p>
    </div>
);

export default VideoPlayer;