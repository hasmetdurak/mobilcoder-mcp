import { useState, useEffect, useCallback, useRef } from 'react';

interface CameraOptions {
  facing?: 'user' | 'environment';
  width?: number;
  height?: number;
}

interface FilePickerOptions {
  multiple?: boolean;
  accept?: string;
  maxSize?: number;
}

interface FileItem {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  file?: File;
}

export const useCamera = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Check camera support
    const checkCameraSupport = () => {
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      const hasCamera = navigator.mediaDevices && navigator.mediaDevices.enumerateDevices;
      
      setIsSupported(hasGetUserMedia && hasCamera);
    };

    checkCameraSupport();
  }, []);

  const startCamera = useCallback(async (options: CameraOptions = {}) => {
    try {
      setError(null);
      
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facing: options.facing || 'user',
          width: options.width || { ideal: 1280, max: 1920 },
          height: options.height || { ideal: 720, max: 1080 }
        },
        audio: true
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
      
      return newStream;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera access denied');
      throw err;
    }
  }, [stream]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  const capturePhoto = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!stream || !videoRef.current) {
        reject(new Error('Camera not active'));
        return;
      }

      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Cannot create canvas context'));
        return;
      }

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to capture photo'));
        }
      }, 'image/jpeg', 0.95);
    });
  }, [stream, videoRef]);

  const switchCamera = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length < 2) {
        setError('Only one camera available');
        return;
      }

      // Get current camera facing mode
      const currentTrack = stream?.getVideoTracks()[0];
      const currentConstraints = currentTrack?.getConstraints();
      const currentFacing = currentConstraints?.facing as 'user' | 'environment' || 'user';

      // Switch to opposite facing
      const newFacing = currentFacing === 'user' ? 'environment' : 'user';
      
      await startCamera({ facing: newFacing });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch camera');
    }
  }, [stream, startCamera]);

  return {
    isSupported,
    stream,
    error,
    videoRef,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera
  };
};

export const useFileSystem = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check file system support
    const checkFileSystemSupport = () => {
      const hasFileAPI = 'showOpenFilePicker' in window || 
                         'webkitdirectory' in document.createElement('input') ||
                         'directory' in document.createElement('input');
      const hasStorageQuota = 'storage' in navigator && 'estimate' in navigator.storage;
      
      setIsSupported(hasFileAPI || hasStorageQuota);
    };

    checkFileSystemSupport();
  }, []);

  const openFilePicker = useCallback(async (options: FilePickerOptions = {}): Promise<FileItem[]> => {
    try {
      setError(null);
      
      if ('showOpenFilePicker' in window) {
        // Use modern file picker API
        const picker = (window as any).showOpenFilePicker({
          multiple: options.multiple || false,
          types: options.accept ? [{
            description: 'Files',
            accept: { [options.accept]: [] }
          }] : undefined,
          excludeAcceptAllOption: true
        });
        
        const result = await new Promise<File[]>((resolve) => {
          picker.addEventListener('fileselected', (e: any) => {
            resolve(e.target.files);
          });
          
          // Auto-close after selection
          setTimeout(() => {
            picker.close();
          }, 1000);
        });
        
        return result.map(file => ({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          file
        }));
      } else if ('webkitdirectory' in document.createElement('input')) {
        // Fallback for older browsers
        return new Promise((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.multiple = options.multiple || false;
          input.accept = options.accept || '';
          
          input.addEventListener('change', (e) => {
            const files = Array.from((e.target as HTMLInputElement).files || []);
            resolve(files.map(file => ({
              name: file.name,
              size: file.size,
              type: file.type,
              lastModified: file.lastModified,
              file
            })));
          });
          
          input.click();
        });
      } else {
        throw new Error('File picker not supported');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open file picker');
      throw err;
    }
  }, []);

  const openDirectoryPicker = useCallback(async (): Promise<string | null> => {
    try {
      setError(null);
      
      if ('webkitdirectory' in document.createElement('input')) {
        return new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.webkitdirectory = true;
          
          input.addEventListener('change', (e) => {
            const files = (e.target as HTMLInputElement).files;
            if (files && files.length > 0) {
              // Get the directory path (webkitRelativePath)
              const path = (files[0] as any).webkitRelativePath;
              resolve(path || null);
            } else {
              resolve(null);
            }
          });
          
          input.click();
        });
      } else {
        throw new Error('Directory picker not supported');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open directory picker');
      throw err;
    }
  }, []);

  const saveFile = useCallback(async (file: File, fileName?: string): Promise<void> => {
    try {
      setError(null);
      
      // Check available storage
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const availableSpace = estimate.quota ? estimate.quota - (estimate.usage || 0) : 0;
        
        if (file.size > availableSpace) {
          throw new Error('Insufficient storage space');
        }
        
        // Create a temporary URL and trigger download
        const url = URL.createObjectURL(file);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Fallback to traditional download
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
      throw err;
    }
  }, []);

  const getStorageInfo = useCallback(async () => {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota || 0,
          used: estimate.usage || 0,
          available: (estimate.quota || 0) - (estimate.usage || 0),
          percentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota) * 100 : 0
        };
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get storage info');
      return null;
    }
  }, []);

  return {
    isSupported,
    error,
    openFilePicker,
    openDirectoryPicker,
    saveFile,
    getStorageInfo
  };
};

export const useClipboard = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check clipboard support
    const checkClipboardSupport = () => {
      const hasClipboard = 'clipboard' in navigator;
      const hasClipboardWrite = hasClipboard && 'writeText' in navigator.clipboard;
      const hasClipboardRead = hasClipboard && 'readText' in navigator.clipboard;
      const hasClipboardItems = hasClipboard && 'write' in navigator.clipboard;
      
      setIsSupported(hasClipboard && (hasClipboardWrite || hasClipboardRead || hasClipboardItems));
    };

    checkClipboardSupport();
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<void> => {
    try {
      setError(null);
      
      if ('clipboard' in navigator && 'writeText' in navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy to clipboard');
      throw err;
    }
  }, []);

  const readFromClipboard = useCallback(async (): Promise<string> => {
    try {
      setError(null);
      
      if ('clipboard' in navigator && 'readText' in navigator.clipboard) {
        return await navigator.clipboard.readText();
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        document.body.appendChild(textArea);
        textArea.focus();
        document.execCommand('paste');
        const text = textArea.value;
        document.body.removeChild(textArea);
        return text;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read from clipboard');
      throw err;
    }
  }, []);

  return {
    isSupported,
    error,
    copyToClipboard,
    readFromClipboard
  };
};

export const useShare = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check Web Share API support
    const checkShareSupport = () => {
      const hasShare = 'share' in navigator;
      const hasCanShare = hasShare && navigator.canShare;
      
      setIsSupported(hasShare);
    };

    checkShareSupport();
  }, []);

  const shareContent = useCallback(async (title: string, text: string, url?: string): Promise<void> => {
    try {
      setError(null);
      
      if ('share' in navigator) {
        const shareData = {
          title,
          text,
          url: url || window.location.href
        };
        
        // Check if sharing is supported
        if (navigator.canShare && !navigator.canShare(shareData)) {
          // Fallback to clipboard if share not supported
          await navigator.clipboard.writeText(`${title}: ${text}`);
        } else {
          await navigator.share(shareData);
        }
      } else {
        // Fallback to opening share dialog
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title}: ${text}`)}`;
        window.open(shareUrl, '_blank');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share content');
      throw err;
    }
  }, []);

  return {
    isSupported,
    error,
    shareContent
  };
};

// Export all hooks
export {
  useCamera,
  useFileSystem,
  useClipboard,
  useShare
};