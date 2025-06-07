import { useEffect, useRef, useState } from 'react';

type AnimationDirection = 'up' | 'down' | 'left' | 'right';
type AnimationType = 'fade' | 'slide' | 'scale' | 'clip';

interface ScrollAnimationOptions {
  /**
   * The type of animation to apply
   * @default 'fade'
   */
  type?: AnimationType;
  
  /**
   * The direction of the animation (for slide animations)
   * @default 'up'
   */
  direction?: AnimationDirection;
  
  /**
   * Delay in milliseconds before the animation starts
   * @default 0
   */
  delay?: number;
  
  /**
   * Duration of the animation in milliseconds
   * @default 500
   */
  duration?: number;
  
  /**
   * Threshold for when the animation should trigger (0-1)
   * @default 0.1
   */
  threshold?: number;
  
  /**
   * Root margin for the intersection observer
   * @default '0px'
   */
  rootMargin?: string;
  
  /**
   * Whether to reset the animation when the element leaves the viewport
   * @default false
   */
  reset?: boolean;
  
  /**
   * Distance the element should move (for slide animations)
   * @default '50px'
   */
  distance?: string;
}

/**
 * Hook for adding scroll animations to elements
 */
export const useScrollAnimation = ({
  type = 'fade',
  direction = 'up',
  delay = 0,
  duration = 500,
  threshold = 0.1,
  rootMargin = '0px',
  reset = false,
  distance = '50px',
}: ScrollAnimationOptions = {}) => {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Apply initial styles
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-out, transform ${duration}ms ease-out`;
    element.style.transitionDelay = `${delay}ms`;
    
    // Set initial transform based on animation type and direction
    if (type === 'slide') {
      switch (direction) {
        case 'up':
          element.style.transform = `translateY(${distance})`;
          break;
        case 'down':
          element.style.transform = `translateY(-${distance})`;
          break;
        case 'left':
          element.style.transform = `translateX(${distance})`;
          break;
        case 'right':
          element.style.transform = `translateX(-${distance})`;
          break;
      }
    } else if (type === 'scale') {
      element.style.transform = 'scale(0.8)';
    } else if (type === 'clip') {
      element.style.clipPath = 'polygon(0 0, 100% 0, 100% 0, 0 0)';
      element.style.transition = `opacity ${duration}ms ease-out, clip-path ${duration}ms ease-out`;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Element is visible
          setIsVisible(true);
          element.style.opacity = '1';
          
          if (type === 'slide' || type === 'scale') {
            element.style.transform = 'translate(0, 0) scale(1)';
          } else if (type === 'clip') {
            element.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
          }
          
          if (!reset) {
            observer.unobserve(element);
          }
        } else if (reset) {
          // Reset animation when element leaves viewport
          setIsVisible(false);
          element.style.opacity = '0';
          
          if (type === 'slide') {
            switch (direction) {
              case 'up':
                element.style.transform = `translateY(${distance})`;
                break;
              case 'down':
                element.style.transform = `translateY(-${distance})`;
                break;
              case 'left':
                element.style.transform = `translateX(${distance})`;
                break;
              case 'right':
                element.style.transform = `translateX(-${distance})`;
                break;
            }
          } else if (type === 'scale') {
            element.style.transform = 'scale(0.8)';
          } else if (type === 'clip') {
            element.style.clipPath = 'polygon(0 0, 100% 0, 100% 0, 0 0)';
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [type, direction, delay, duration, threshold, rootMargin, reset, distance]);

  return { ref, isVisible };
};

export default useScrollAnimation;