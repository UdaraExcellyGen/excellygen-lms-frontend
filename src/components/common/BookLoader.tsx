import React from 'react';
import Lottie from 'react-lottie';
import { useLoading } from '../../contexts/LoadingContext';
import bookAnimation from '../../assets/animations/book-animation.json';

interface BookLoaderProps {
  containerClassName?: string;
  size?: number;
}

const BookLoader: React.FC<BookLoaderProps> = ({ 
  containerClassName = "", 
  size = 200 
}) => {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: bookAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#1B0A3F]/70 backdrop-blur-sm ${containerClassName}`}>
      <div className="relative flex flex-col items-center">
        <Lottie 
          options={defaultOptions}
          height={size}
          width={size}
        />
        <p className="mt-4 text-white font-medium text-lg animate-pulse">Loading...</p>
      </div>
    </div>
  );
};

export default BookLoader;