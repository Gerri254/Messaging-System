// Performance monitoring and optimization utilities for frontend
import * as React from 'react';

// Performance metrics collection
interface PerformanceMetrics {
  navigationTiming: PerformanceTiming | null;
  resourceTimings: PerformanceResourceTiming[];
  marks: PerformanceMark[];
  measures: PerformanceMeasure[];
  memoryInfo?: any;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    navigationTiming: null,
    resourceTimings: [],
    marks: [],
    measures: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== 'undefined' && 'performance' in window) {
      // Collect navigation timing
      this.metrics.navigationTiming = performance.timing;
      
      // Collect resource timings
      this.metrics.resourceTimings = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      // Collect memory info if available
      if ('memory' in performance) {
        this.metrics.memoryInfo = (performance as any).memory;
      }
    }
  }

  // Mark a specific point in time
  mark(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name);
      this.metrics.marks = performance.getEntriesByType('mark') as PerformanceMark[];
    }
  }

  // Measure time between two marks
  measure(name: string, startMark: string, endMark?: string): number | null {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        performance.measure(name, startMark, endMark);
        this.metrics.measures = performance.getEntriesByType('measure') as PerformanceMeasure[];
        
        const measure = performance.getEntriesByName(name, 'measure')[0];
        return measure ? measure.duration : null;
      } catch (error) {
        console.warn('Performance measure failed:', error);
        return null;
      }
    }
    return null;
  }

  // Get Core Web Vitals
  getCoreWebVitals(): Promise<{
    FCP?: number;
    LCP?: number;
    FID?: number;
    CLS?: number;
  }> {
    return new Promise((resolve) => {
      const vitals: any = {};

      // First Contentful Paint (FCP)
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          vitals.FCP = fcp.startTime;
        }
      });

      // Largest Contentful Paint (LCP)
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (lastEntry) {
          vitals.LCP = lastEntry.startTime;
        }
      });

      // Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        vitals.CLS = clsValue;
      });

      try {
        fcpObserver.observe({ entryTypes: ['paint'] });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Resolve after a reasonable time
        setTimeout(() => {
          fcpObserver.disconnect();
          lcpObserver.disconnect();
          clsObserver.disconnect();
          resolve(vitals);
        }, 5000);
      } catch (error) {
        console.warn('Core Web Vitals collection failed:', error);
        resolve(vitals);
      }
    });
  }

  // Get page load metrics
  getPageLoadMetrics(): {
    domContentLoaded: number;
    windowLoad: number;
    firstPaint: number;
    firstContentfulPaint: number;
  } | null {
    if (!this.metrics.navigationTiming) return null;

    const timing = this.metrics.navigationTiming;
    const paintEntries = performance.getEntriesByType('paint');

    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      windowLoad: timing.loadEventEnd - timing.navigationStart,
      firstPaint: paintEntries.find(entry => entry.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
    };
  }

  // Get resource performance data
  getResourceMetrics(): Array<{
    name: string;
    type: string;
    size: number;
    duration: number;
    startTime: number;
  }> {
    return this.metrics.resourceTimings.map(resource => ({
      name: resource.name,
      type: this.getResourceType(resource.name),
      size: resource.transferSize || 0,
      duration: resource.responseEnd - resource.requestStart,
      startTime: resource.startTime,
    }));
  }

  private getResourceType(url: string): string {
    if (url.match(/\.(js)$/)) return 'script';
    if (url.match(/\.(css)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'other';
  }

  // Send metrics to analytics service
  sendMetrics(): void {
    const pageMetrics = this.getPageLoadMetrics();
    const resourceMetrics = this.getResourceMetrics();

    if (pageMetrics) {
      // Send to your analytics service
      console.log('Page Load Metrics:', pageMetrics);
      console.log('Resource Metrics:', resourceMetrics);
      
      // Example: send to Google Analytics or custom endpoint
      // gtag('event', 'page_load_time', {
      //   value: pageMetrics.windowLoad,
      //   custom_parameter: 'performance'
      // });
    }
  }
}

// Image lazy loading utility
export const lazyLoadImages = (): void => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
};

// Component performance tracker
export const withPerformanceTracking = <T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) => {
  return React.memo((props: T) => {
    const renderStart = React.useRef<number>(0);
    const monitor = React.useRef<PerformanceMonitor>(new PerformanceMonitor());

    React.useEffect(() => {
      monitor.current.mark(`${componentName}-mount-start`);
      renderStart.current = performance.now();

      return () => {
        monitor.current.mark(`${componentName}-unmount`);
        const renderTime = monitor.current.measure(
          `${componentName}-render-time`,
          `${componentName}-mount-start`,
          `${componentName}-unmount`
        );
        
        if (renderTime && renderTime > 100) {
          console.warn(`Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`);
        }
      };
    }, []);

    React.useEffect(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart.current;
      
      if (renderTime > 16) { // More than one frame (60fps)
        console.warn(`Component ${componentName} render took ${renderTime.toFixed(2)}ms`);
      }
    });

    return React.createElement(Component, props);
  });
};

// Bundle analyzer helper
export const analyzeBundleSize = (): void => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analyzer would be available in webpack setup');
  }
};

// Memory leak detector
export class MemoryLeakDetector {
  private initialMemory: number = 0;
  private checkInterval: NodeJS.Timeout | null = null;

  start(): void {
    if ('memory' in performance) {
      this.initialMemory = (performance as any).memory.usedJSHeapSize;
      
      this.checkInterval = setInterval(() => {
        const currentMemory = (performance as any).memory.usedJSHeapSize;
        const growth = currentMemory - this.initialMemory;
        const growthMB = growth / 1024 / 1024;

        if (growthMB > 50) { // Alert if memory grew by more than 50MB
          console.warn(`Potential memory leak detected: ${growthMB.toFixed(2)}MB growth`);
        }
      }, 30000); // Check every 30 seconds
    }
  }

  stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

// Network quality detector
export const detectNetworkQuality = (): string => {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    const effectiveType = connection.effectiveType;

    switch (effectiveType) {
      case 'slow-2g':
      case '2g':
        return 'slow';
      case '3g':
        return 'medium';
      case '4g':
        return 'fast';
      default:
        return 'unknown';
    }
  }
  return 'unknown';
};

// Adaptive loading based on network quality
export const useAdaptiveLoading = () => {
  const [networkQuality, setNetworkQuality] = React.useState<string>('unknown');

  React.useEffect(() => {
    setNetworkQuality(detectNetworkQuality());

    const handleNetworkChange = () => {
      setNetworkQuality(detectNetworkQuality());
    };

    if ('connection' in navigator) {
      (navigator as any).connection.addEventListener('change', handleNetworkChange);
      return () => {
        (navigator as any).connection.removeEventListener('change', handleNetworkChange);
      };
    }
  }, []);

  return {
    networkQuality,
    shouldLoadHighQualityImages: networkQuality === 'fast',
    shouldPreloadResources: networkQuality !== 'slow',
    shouldUseImageCompression: networkQuality === 'slow',
  };
};

// Performance budget checker
export const checkPerformanceBudget = (budgets: {
  maxBundleSize?: number;
  maxImageSize?: number;
  maxLoadTime?: number;
}): boolean => {
  const monitor = new PerformanceMonitor();
  const resourceMetrics = monitor.getResourceMetrics();
  const pageMetrics = monitor.getPageLoadMetrics();

  let budgetExceeded = false;

  // Check bundle size
  if (budgets.maxBundleSize) {
    const totalJSSize = resourceMetrics
      .filter(r => r.type === 'script')
      .reduce((sum, r) => sum + r.size, 0);

    if (totalJSSize > budgets.maxBundleSize) {
      console.warn(`Bundle size budget exceeded: ${totalJSSize} > ${budgets.maxBundleSize}`);
      budgetExceeded = true;
    }
  }

  // Check image sizes
  if (budgets.maxImageSize) {
    const largeImages = resourceMetrics
      .filter(r => r.type === 'image' && r.size > budgets.maxImageSize!);

    if (largeImages.length > 0) {
      console.warn(`Large images detected:`, largeImages);
      budgetExceeded = true;
    }
  }

  // Check load time
  if (budgets.maxLoadTime && pageMetrics) {
    if (pageMetrics.windowLoad > budgets.maxLoadTime) {
      console.warn(`Load time budget exceeded: ${pageMetrics.windowLoad}ms > ${budgets.maxLoadTime}ms`);
      budgetExceeded = true;
    }
  }

  return !budgetExceeded;
};

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();
export const memoryLeakDetector = new MemoryLeakDetector();