export const initPerformanceMonitoring = () => {
  if ('performance' in window && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP:', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          console.log('FID:', entry.processingStart - entry.startTime);
        }
      });
    });

    observer.observe({ 
      entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] 
    });
  }
};