'use client';
import { useRef, useState, useEffect, useContext, useCallback } from 'react';
import { Camera, FlipHorizontal } from 'lucide-react';
import { CameraDevicesContext } from '@/providers/CameraDevicesProvider';

interface AnalysisResult {
  prediction: string | null;
  reps: number;
  form_score: number;
  form_issues: string[];
}

export default function WebcamFeed({ 
  onFeedback,
  exerciseName,
  autoStart = true,
  isPaused = false
}: { 
  onFeedback: (data: { reps: number, formIssues: string[], prediction?: string }) => void,
  exerciseName: string,
  autoStart?: boolean,
  isPaused?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMirrored, setIsMirrored] = useState(false);
  const cameraContext = useContext(CameraDevicesContext);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const startingRef = useRef(false);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
  }, []);

  const startCamera = async () => {
    if (startingRef.current) return;
    
    try {
      startingRef.current = true;
      setError('');
      
      // Stop any existing stream first
      stopCamera();
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          deviceId: cameraContext?.webcamId ? { exact: cameraContext.webcamId } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (!videoRef.current) return;
      
      videoRef.current.srcObject = stream;
      
      await new Promise((resolve) => {
        if (!videoRef.current) {
          resolve(null);
          return;
        }
        
        videoRef.current.onloadedmetadata = () => resolve(null);
      });

      if (videoRef.current) {
        await videoRef.current.play();
        setIsStreaming(true);
      }
      
    } catch (err: unknown) {
      let errorMessage = 'Error accessing camera: ';
      
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
            errorMessage += 'Permission denied. Please allow camera access.';
            break;
          case 'NotFoundError':
            errorMessage += 'No camera found on this device.';
            break;
          case 'NotReadableError':
            errorMessage += 'Camera is in use by another application.';
            break;
          default:
            errorMessage += err.message;
        }
      } else {
        errorMessage += String(err);
      }
      
      console.error("Camera error:", err);
      setError(errorMessage);
    } finally {
      startingRef.current = false;
    }
  };

  const startCameraWithRetry = useCallback(async (attempts = 0) => {
    const MAX_RETRY_ATTEMPTS = 3;
    try {
      await startCamera();
    } catch (err) {
      if (attempts < MAX_RETRY_ATTEMPTS) {
        setTimeout(() => startCameraWithRetry(attempts + 1), 1000);
      } else {
        setError('Failed to start camera after multiple attempts. Please refresh the page.');
      }
    }
  }, []);

  useEffect(() => {
    if (autoStart) {
      startCameraWithRetry();
    }
    
    return () => {
      stopCamera();
    };
  }, [autoStart, startCameraWithRetry, stopCamera]);

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
        videoRef.current.load();
      }
      setIsStreaming(false);
    };
  }, []);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    if (isPaused) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  }, [isPaused]);

  const toggleMirror = () => {
    setIsMirrored(!isMirrored);
  };

  const captureFrameAndAnalyze = useCallback(async () => {
    if (!videoRef.current || isAnalyzing || isPaused) return;
    
    try {
      setIsAnalyzing(true);
      
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      if (isMirrored) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      
      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      const response = await fetch('http://localhost:5000/analyze_frame', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          image: imageData,
          exercise_type: exerciseName.toLowerCase()
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: AnalysisResult = await response.json();
      
      if (data.prediction !== null) {
        onFeedback({
          reps: data.reps,
          formIssues: data.form_issues,
          prediction: data.prediction
        });
      }

    } catch (error) {
      console.error('Analysis error:', error);
      if (error instanceof Error && !error.message.includes('No pose landmarks detected')) {
        setError(`Analysis error: ${error.message}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [videoRef, isAnalyzing, isPaused, isMirrored, onFeedback, exerciseName]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isStreaming && !isPaused) {
      intervalId = setInterval(captureFrameAndAnalyze, 100);
    }
    
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isStreaming, isPaused, captureFrameAndAnalyze]);

  return (
    <div className="relative w-full h-[480px] bg-[var(--card-bg)] rounded-xl overflow-hidden">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
        style={{ 
          transform: `scaleX(${isMirrored ? -1 : 1})`,
          transition: 'transform 0.2s ease-out'
        }}
      />
      
      {isStreaming && (
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={toggleMirror}
            className="p-2 bg-[var(--card-bg)]/80 backdrop-blur-sm 
              rounded-full border border-[var(--card-border)] shadow-md 
              hover:bg-[var(--card-bg)] transition-all duration-200"
          >
            <FlipHorizontal size={20} />
          </button>
        </div>
      )}
      
      {!isStreaming && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--card-bg)]/80 backdrop-blur-sm">
          <div className="text-center max-w-md p-6">
            {error ? (
              <>
                <div className="bg-red-500/10 p-4 rounded-lg mb-4">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
                <button 
                  onClick={() => startCameraWithRetry()}
                  className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] 
                    text-white rounded-lg flex items-center gap-2 transition-all duration-200"
                >
                  <Camera size={20} />
                  Try Again
                </button>
              </>
            ) : (
              <button 
                onClick={() => startCameraWithRetry()}
                className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-dark)] 
                  text-white rounded-lg flex items-center gap-2 transition-all duration-200"
              >
                <Camera size={20} />
                Start Camera
              </button>
            )}
          </div>
        </div>
      )}
      
      {isStreaming && !isPaused && (
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="font-medium">Movement Detection Active</span>
        </div>
      )}
    </div>
  );
} 