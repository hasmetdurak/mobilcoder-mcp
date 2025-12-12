// Mobile Keep Alive - Wake Lock API with fallbacks
import React from 'react';

export interface WakeLockStatus {
  isSupported: boolean;
  isActive: boolean;
  isFallbackActive: boolean;
  batteryLevel?: number;
}

class WakeLockManager {
  private wakeLock: WakeLockSentinel | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private fallbackInterval: NodeJS.Timeout | null = null;
  private batteryCheckInterval: NodeJS.Timeout | null = null;
  private statusCallback?: (status: WakeLockStatus) => void;

  constructor() {
    this.cleanup();
  }

  async requestWakeLock(): Promise<boolean> {
    try {
      // Try native Wake Lock API first (preferred)
      if ('wakeLock' in navigator) {
        this.wakeLock = await (navigator as any).wakeLock.request('screen');
        console.log('✅ Native Wake Lock activated');
        this.updateStatus({ isActive: true, isFallbackActive: false });
        return true;
      }
    } catch (error) {
      console.warn('⚠️ Native Wake Lock failed:', error);
    }

    // Fallback to video element trick for iOS
    return this.requestFallbackWakeLock();
  }

  private requestFallbackWakeLock(): boolean {
    try {
      // Create hidden video element with silent video
      this.videoElement = document.createElement('video');
      this.videoElement.style.position = 'fixed';
      this.videoElement.style.top = '-100px';
      this.videoElement.style.left = '-100px';
      this.videoElement.style.width = '1px';
      this.videoElement.style.height = '1px';
      this.videoElement.style.opacity = '0.001';
      this.videoElement.style.pointerEvents = 'none';
      this.videoElement.muted = true;
      this.videoElement.loop = true;
      this.videoElement.playsInline = true;

      // Create a simple 1x1 black canvas as video source
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, 1, 1);
      }

      // Convert canvas to video source
      const stream = canvas.captureStream(30);
      this.videoElement.srcObject = stream;

      document.body.appendChild(this.videoElement);

      // Play the video
      this.videoElement.play().then(() => {
        console.log('✅ Fallback Wake Lock (video) activated');
        this.updateStatus({ isActive: true, isFallbackActive: true });
        
        // Start activity simulation
        this.startActivitySimulation();
        return true;
      }).catch((error) => {
        console.error('❌ Fallback Wake Lock failed:', error);
        return false;
      });

      return false;
    } catch (error) {
      console.error('❌ Failed to setup fallback Wake Lock:', error);
      return false;
    }
  }

  private startActivitySimulation(): void {
    // Simulate user activity to prevent screen timeout
    this.fallbackInterval = setInterval(() => {
      // Dispatch a fake user activity event
      const event = new Event('useractivity', { bubbles: true });
      document.dispatchEvent(event);
    }, 30000); // Every 30 seconds
  }

  async releaseWakeLock(): Promise<void> {
    // Release native Wake Lock
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('✅ Native Wake Lock released');
      } catch (error) {
        console.warn('⚠️ Error releasing native Wake Lock:', error);
      }
    }

    // Release fallback
    this.releaseFallbackWakeLock();
  }

  private releaseFallbackWakeLock(): void {
    if (this.fallbackInterval) {
      clearInterval(this.fallbackInterval);
      this.fallbackInterval = null;
    }

    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      document.body.removeChild(this.videoElement);
      this.videoElement = null;
      console.log('✅ Fallback Wake Lock released');
    }

    this.updateStatus({ isActive: false, isFallbackActive: false });
  }

  async getBatteryLevel(): Promise<number | null> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return battery.level;
      }
    } catch (error) {
      console.warn('Battery API not available:', error);
    }
    return null;
  }

  startBatteryMonitoring(): void {
    if (this.batteryCheckInterval) {
      clearInterval(this.batteryCheckInterval);
    }

    this.batteryCheckInterval = setInterval(async () => {
      const level = await this.getBatteryLevel();
      if (level !== null) {
        this.updateStatus({ batteryLevel: level });
      }
    }, 30000); // Check every 30 seconds
  }

  stopBatteryMonitoring(): void {
    if (this.batteryCheckInterval) {
      clearInterval(this.batteryCheckInterval);
      this.batteryCheckInterval = null;
    }
  }

  onStatusChange(callback: (status: WakeLockStatus) => void): void {
    this.statusCallback = callback;
  }

  private updateStatus(updates: Partial<WakeLockStatus>): void {
    const status: WakeLockStatus = {
      isSupported: 'wakeLock' in navigator,
      isActive: this.wakeLock !== null || this.videoElement !== null,
      isFallbackActive: this.videoElement !== null,
      ...updates
    };

    if (this.statusCallback) {
      this.statusCallback(status);
    }
  }

  getStatus(): WakeLockStatus {
    return {
      isSupported: 'wakeLock' in navigator,
      isActive: this.wakeLock !== null || this.videoElement !== null,
      isFallbackActive: this.videoElement !== null
    };
  }

  cleanup(): void {
    this.releaseWakeLock();
    this.stopBatteryMonitoring();
  }
}

// Singleton instance
export const wakeLockManager = new WakeLockManager();

// React hook for easy usage
export function useWakeLock() {
  const [status, setStatus] = React.useState<WakeLockStatus>({
    isSupported: false,
    isActive: false,
    isFallbackActive: false
  });

  React.useEffect(() => {
    // Initialize status
    setStatus(wakeLockManager.getStatus());

    // Listen for status changes
    wakeLockManager.onStatusChange(setStatus);

    // Start battery monitoring
    wakeLockManager.startBatteryMonitoring();

    return () => {
      wakeLockManager.cleanup();
    };
  }, []);

  const requestWakeLock = React.useCallback(async () => {
    return await wakeLockManager.requestWakeLock();
  }, []);

  const releaseWakeLock = React.useCallback(async () => {
    await wakeLockManager.releaseWakeLock();
  }, []);

  return {
    status,
    requestWakeLock,
    releaseWakeLock
  };
}