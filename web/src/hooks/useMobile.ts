import { useState, useEffect, useCallback, useRef } from 'react';

// Platform detection utilities
const usePlatformDetection = () => {
  const [platform, setPlatform] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    isHuawei: false,
    isSamsung: false,
    isXiaomi: false,
    isSmallScreen: false,
    isLargeScreen: false,
    hasTouch: false,
    hasNotch: false,
    deviceType: 'unknown' as 'mobile' | 'tablet' | 'desktop',
    osVersion: '',
    browser: ''
  });

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth;
    
    // Detect device type
    const isMobile = screenWidth <= 768;
    const isTablet = screenWidth > 768 && screenWidth <= 1024;
    const isDesktop = screenWidth > 1024;
    
    // Detect OS
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isHuawei = isAndroid && /huawei/.test(userAgent);
    const isSamsung = isAndroid && /samsung/.test(userAgent);
    const isXiaomi = isAndroid && /xiaomi|redmi|mi/.test(userAgent);
    
    // Detect screen size
    const isSmallScreen = screenWidth <= 375;
    const isLargeScreen = screenWidth >= 428;
    
    // Detect touch capability
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Detect notch (iPhone X+ style)
    const hasNotch = isIOS && screenWidth >= 375 && 
                      (window.screen.height === 812 || window.screen.height === 844 || window.screen.height === 896 || 
                       window.screen.height === 926 || window.screen.height === 932);
    
    // Extract OS version
    let osVersion = '';
    if (isIOS) {
      const match = userAgent.match(/os (\d+)_(\d+)/);
      osVersion = match ? `${match[1]}.${match[2]}` : '';
    } else if (isAndroid) {
      const match = userAgent.match(/android (\d+(?:\.\d+)?)/);
      osVersion = match ? match[1] : '';
    }
    
    // Detect browser
    let browser = '';
    if (userAgent.includes('chrome')) browser = 'chrome';
    else if (userAgent.includes('safari')) browser = 'safari';
    else if (userAgent.includes('firefox')) browser = 'firefox';
    else if (userAgent.includes('edge')) browser = 'edge';
    
    const deviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';
    
    setPlatform({
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      isHuawei,
      isSamsung,
      isXiaomi,
      isSmallScreen,
      isLargeScreen,
      hasTouch,
      hasNotch,
      deviceType,
      osVersion,
      browser
    });
  }, []);

  return platform;
};

// Touch gesture hook
const useTouchGestures = (elementRef: React.RefObject<HTMLElement>) => {
  const [gestures, setGestures] = useState({
    swipeLeft: false,
    swipeRight: false,
    swipeUp: false,
    swipeDown: false,
    tap: false,
    longPress: false,
    pinch: false
  });

  const startX = useRef(0);
  const startY = useRef(0);
  const startTime = useRef(0);
  const longPressTimer = useRef<NodeJS.Timeout>();

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startX.current = touch.clientX;
    startY.current = touch.clientY;
    startTime.current = Date.now();
    
    // Reset long press
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setGestures(prev => ({ ...prev, longPress: true }));
    }, 500);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cancel long press on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    
    const touch = e.changedTouches[0];
    const endX = touch.clientX;
    const endY = touch.clientY;
    const deltaX = endX - startX.current;
    const deltaY = endY - startY.current;
    const deltaTime = Date.now() - startTime.current;
    
    // Reset gestures
    setGestures({
      swipeLeft: false,
      swipeRight: false,
      swipeUp: false,
      swipeDown: false,
      tap: false,
      longPress: false,
      pinch: false
    });
    
    // Detect swipe (minimum 50px movement, under 300ms)
    if (Math.abs(deltaX) > 50 && deltaTime < 300) {
      if (deltaX > 0) {
        setGestures(prev => ({ ...prev, swipeRight: true }));
      } else {
        setGestures(prev => ({ ...prev, swipeLeft: true }));
      }
    } else if (Math.abs(deltaY) > 50 && deltaTime < 300) {
      if (deltaY > 0) {
        setGestures(prev => ({ ...prev, swipeDown: true }));
      } else {
        setGestures(prev => ({ ...prev, swipeUp: true }));
      }
    } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 200) {
      // Tap
      setGestures(prev => ({ ...prev, tap: true }));
    }
    
    // Reset after animation
    setTimeout(() => {
      setGestures(prev => ({
        ...prev,
        swipeLeft: false,
        swipeRight: false,
        swipeUp: false,
        swipeDown: false,
        tap: false,
        longPress: false
      }));
    }, 300);
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return gestures;
};

// Mobile viewport hook
const useMobileViewport = () => {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: 'portrait' as 'portrait' | 'landscape',
    safeArea: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
    }
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const orientation = width > height ? 'landscape' : 'portrait';
      
      // Get safe area insets
      const safeArea = {
        top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top') || '0'),
        bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-bottom') || '0'),
        left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-left') || '0'),
        right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-right') || '0')
      };
      
      setViewport({ width, height, orientation, safeArea });
    };

    const handleResize = () => {
      updateViewport();
    };

    const handleOrientationChange = () => {
      // Small delay to get correct dimensions after orientation change
      setTimeout(updateViewport, 100);
    };

    updateViewport();
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return viewport;
};

// Mobile performance hook
const useMobilePerformance = () => {
  const [performance, setPerformance] = useState({
    isLowEnd: false,
    isHighEnd: false,
    memoryInfo: null as any,
    connectionType: 'unknown',
    effectiveType: 'unknown'
  });

  useEffect(() => {
    const detectPerformance = () => {
      // Detect device performance
      const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      
      let isLowEnd = false;
      let isHighEnd = false;
      
      // CPU detection (simplified)
      const cores = navigator.hardwareConcurrency || 4;
      const memory = (navigator as any).deviceMemory || 4; // GB
      
      // Performance heuristics
      if (cores <= 4 && memory <= 2) {
        isLowEnd = true;
      } else if (cores >= 8 && memory >= 6) {
        isHighEnd = true;
      }
      
      setPerformance({
        isLowEnd,
        isHighEnd,
        memoryInfo: (navigator as any).deviceMemory,
        connectionType: connection?.type || 'unknown',
        effectiveType: connection?.effectiveType || 'unknown'
      });
    };

    detectPerformance();
    
    // Listen for connection changes
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', detectPerformance);
    }
    
    return () => {
      if (connection) {
        connection.removeEventListener('change', detectPerformance);
      }
    };
  }, []);

  return performance;
};

// Mobile keyboard hook
const useMobileKeyboard = () => {
  const [keyboard, setKeyboard] = useState({
    isVisible: false,
    height: 0,
    isVirtual: false
  });

  useEffect(() => {
    const initialViewportHeight = (window.visualViewport as any)?.height || window.innerHeight;
    
    const handleResize = () => {
      const currentHeight = (window.visualViewport as any)?.height || window.innerHeight;
      const heightDifference = initialViewportHeight - currentHeight;
      
      // If height reduced significantly, keyboard is likely visible
      const isKeyboardVisible = heightDifference > 150;
      const keyboardHeight = isKeyboardVisible ? heightDifference : 0;
      
      setKeyboard({
        isVisible: isKeyboardVisible,
        height: keyboardHeight,
        isVirtual: true // Assume virtual on mobile
      });
    };

    const handleFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        setKeyboard(prev => ({ ...prev, isVisible: true }));
      }
    };

    const handleFocusOut = (e: FocusEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        setKeyboard(prev => ({ ...prev, isVisible: false, height: 0 }));
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return keyboard;
};

// Battery API hook
const useBattery = () => {
  const [battery, setBattery] = useState({
    level: 1,
    charging: false,
    chargingTime: null as number | null,
    dischargingTime: null as number | null,
    supported: false
  });

  useEffect(() => {
    if ('getBattery' in navigator) {
      setBattery(prev => ({ ...prev, supported: true }));
      
      (navigator as any).getBattery().then((batteryManager: any) => {
        const updateBatteryInfo = () => {
          setBattery({
            level: batteryManager.level,
            charging: batteryManager.charging,
            chargingTime: batteryManager.chargingTime,
            dischargingTime: batteryManager.dischargingTime,
            supported: true
          });
        };

        updateBatteryInfo();
        
        batteryManager.addEventListener('levelchange', updateBatteryInfo);
        batteryManager.addEventListener('chargingchange', updateBatteryInfo);
        batteryManager.addEventListener('chargingtimechange', updateBatteryInfo);
        batteryManager.addEventListener('dischargingtimechange', updateBatteryInfo);
        
        return () => {
          batteryManager.removeEventListener('levelchange', updateBatteryInfo);
          batteryManager.removeEventListener('chargingchange', updateBatteryInfo);
          batteryManager.removeEventListener('chargingtimechange', updateBatteryInfo);
          batteryManager.removeEventListener('dischargingtimechange', updateBatteryInfo);
        };
      }).catch(() => {
        // Battery API not supported or permission denied
        setBattery(prev => ({ ...prev, supported: false }));
      });
    }
  }, []);

  return battery;
};

// Export all hooks
export {
  usePlatformDetection,
  useTouchGestures,
  useMobileViewport,
  useMobilePerformance,
  useMobileKeyboard,
  useBattery
};